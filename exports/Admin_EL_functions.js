/**
 * Converts a given time, [timeString], to a 24-hour time format, i.e.,
 * the hour is converted to a value between 00 and 24 and the minute is
 * converted to a value between 00 and 59. Returns the convert time as
 * a String.
 * Requires:
 *  - [timeString] is a valid String representing a time with format
 *    "HH:MM <AM/PM>"".
 */
var convertTimeStringTo24Hours = function(timeString) {
    var hours = parseInt(timeString.substring(0, 2), 10);
    var minutes = parseInt(timeString.substring(3, 5), 10);
    var AMPM = timeString.slice(-2);
    if (AMPM == 'PM' && hours < 12) hours = hours + 12;
    if (AMPM == 'AM' && hours == 12) hours = hours - 12;

    var sHours = hours.toString();
    var sMinutes = minutes.toString();
    if (hours < 10) sHours = '0' + sHours;
    if (minutes < 10) sMinutes = '0' + sMinutes;

    return sHours + ':' + sMinutes + ':00';
};

/**
 * Converts a given date, [dateString], to the format yyyy - mm - dd 
 * and returns the converted date for Safari browsers.
 * Requires:
 *  - [dateString] is a valid String representing a date.
 */
var convertDateForSafari = function(dateString) {
    var mm = dateString.substring(0, 2);
    var dd = dateString.substring(3, 5);
    var yyyy = dateString.substring(6);

    return yyyy + '-' + mm + '-' + dd;
};

/**
 * Updates the database, [con], with the attendee added by the user who has user 
 * type, [person], added to an event sign-up. Sends an email to confirm the 
 * attendee's addition to the event sign-up.
 * Requires:
 *  - [req] is an Object containing information about the HTTPS request made
 *    to the admin/event leader home page route. 
 *  - [res] is an Object containing information about the HTTPS response that
 *    is sent back to the client browser.
 *  - [con] is the connection to the database.
 *  - [person] is a valid String of either value "eventleader" or "admin".
 *  - [email] is a module that sends email confirmations and notifications
 *    (../email.js).
 */
var addAttendee = function(req, res, con, person, email) {
    var eventId = req.body.addAttendeeEventId;
    var name = req.body.name;
    var netID = name.substring(name.indexOf('(') + 1, name.indexOf(')'));
    // need the name of the person
    var sql = 'SELECT * FROM people WHERE netID = ?';
    var values = [netID];
    con.query(sql, values, function(err, result) {
        if (err) res.redirect('/error');

        var person_id = result[0].person_id;
        // add person to the signup list
        var sql = 'INSERT INTO signup (person_id, event_id, time_signed_up, comments) VALUES (?, ?, NOW(), "")';
        var values = [person_id, eventId];
        con.query(sql, values, function(err, insertResult) {
            if (err) res.redirect('/error');

            // select the event with the event id
            var sql =
                'SELECT name, CONCAT(MONTH(start_time), "/", DAY(start_time), "/", YEAR(start_time)) AS date,' +
                "DATE_FORMAT(start_time, '%h:%i%p') AS start_time, DATE_FORMAT(end_time, '%h:%i%p') AS end_time," +
                'location, max_capacity FROM events WHERE events.event_id = ?';
            var values = [eventId];
            con.query(sql, values, function(err, results) {
                if (err) res.redirect('/error');

                var eventName = results[0].name;
                var eventDate = results[0].date;
                var eventStartTime = results[0].start_time;
                var eventEndTime = results[0].end_time;
                var eventLocation = results[0].location;
                var maxCapacity = results[0].max_capacity;
                // select all the signups for a specific event
                var sql = 'SELECT * FROM signup WHERE event_id = ?';
                var values = [eventId];
                con.query(sql, values, function(err, results) {
                    if (err) res.redirect('/error');

                    var attendeeLength = results.length;
                    var onWaitlist = attendeeLength > maxCapacity;

                    // send an email to notify added user has been added to event
                    email.sendAddAttendee(netID, eventName, eventDate, eventStartTime, eventEndTime, eventLocation, onWaitlist);

                    res.redirect('/' + person);
                });
            });
        });
    });
};

/**
 * Updates the database, [con], with the event created by the user with user type, 
 * [person].
 * Requires:
 *  - [req] is an Object containing information about the HTTPS request made
 *    to the admin/event leader home page route. 
 *  - [res] is an Object containing information about the HTTPS response that
 *    is sent back to the client browser.
 *  - [con] is the connection to the database.
 *  - [person] is a valid String of either value "eventleader" or "admin".
 */
var createEvent = function(req, res, con, person) {
    var eventleader = req.body.eventleader;
    var leaderfirst = eventleader.substring(0, eventleader.indexOf(' '));
    var leaderlast = eventleader.substring(
        eventleader.indexOf(' '),
        eventleader.indexOf('(') - 1
    );
    var netID = eventleader.substring(
        eventleader.indexOf('(') + 1,
        eventleader.indexOf(')')
    );
    var date = req.body.date;
    // this is the Safari browser
    if (req.body.date.charAt(2) == '/' || req.body.date.charAt(2) == '-') {
        date = convertDateForSafari(date);
    }
    var start_time = convertTimeStringTo24Hours(req.body.starttime);
    var end_time = convertTimeStringTo24Hours(req.body.endtime);
    var attendee = req.body.attendee;
    var hiddensignup = 0;
    if (req.body.hiddensignup == 'on') {
        hiddensignup = 1;
    }
    var filename = '';
    if (req.file) {
        filename = '/images/posters/' + req.file.originalname;
    }
    // insert a new event record
    var sql =
        'INSERT INTO events' +
        ' (name, leader_first_name, leader_last_name, leader_netID, description, start_time, end_time, location, max_capacity, other, image, is_hidden)' +
        ' VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    var values = [
        req.body.eventname,
        leaderfirst,
        leaderlast,
        netID,
        req.body.description,
        date + ' ' + start_time,
        date + ' ' + end_time,
        req.body.location,
        attendee,
        req.body.other,
        filename,
        hiddensignup
    ];
    con.query(sql, values, function(err, result) {
        if (err) res.redirect('/error');

        // find the event id by event name, start time, and end time
        var sql = 'SELECT event_id FROM events WHERE name = ? AND start_time =? AND end_time = ?';
        var values = [req.body.eventname, date + ' ' + start_time, date + ' ' + end_time];
        con.query(sql, values, function(err, result) {
            if (err) res.redirect('/error');

            // find the profile of person with specific netID
            var sql = 'SELECT * FROM people WHERE netID = ?';
            var values = [netID];
            con.query(sql, values, function(err, result1) {
                if (err) res.redirect('/error');

                // add the event leader of the event to the event sign-up list
                var sql = 'INSERT INTO signup (person_id, event_id, time_signed_up, comments) VALUES (?, ?, NOW(), ?)';
                var values = [result1[0].person_id, result[0].event_id, 'This is the eventleader.'];
                con.query(sql, values, function(err, insertResult) {
                    if (err) return res.render('pages/error');

                    res.redirect('/' + person);
                });
            });
        });
    });
};

/**
 * Updates the database, [con], with changes made to an event's profile.
 * Requires:
 *  - [req] is an Object containing information about the HTTPS request made
 *    to the admin/event leader home page route. 
 *  - [res] is an Object containing information about the HTTPS response that
 *    is sent back to the client browser.
 *  - [con] is the connection to the database.
 *  - [person] is a valid String of either value "eventleader" or "admin".
 */
var editEvent = function(req, res, con, person) {
    var eventleader = req.body.eventleader;
    var leaderfirst = eventleader.substring(0, eventleader.indexOf(' '));
    var leaderlast = eventleader.substring(eventleader.indexOf(' '), eventleader.indexOf('(') - 1);
    var netID = eventleader.substring(eventleader.indexOf('(') + 1, eventleader.indexOf(')'));
    var date = req.body.date;
    // this is the Safari browser
    if (req.body.date.charAt(2) == '/' || req.body.date.charAt(2) == '-') {
        date = convertDateForSafari(date);
    }
    var start_time = convertTimeStringTo24Hours(req.body.starttime);
    var end_time = convertTimeStringTo24Hours(req.body.endtime);
    var attendee = req.body.attendee;
    var hiddensignup = 0;
    if (req.body.hiddensignup == 'on') {
        hiddensignup = 1;
    }
    if (req.file) {
        // select the original event leader
        var sql = 'SELECT person_id FROM events INNER JOIN people ON events.leader_netID = people.netID WHERE events.event_id = ?';
        var values = [req.body.eventId];
        con.query(sql, values, function(err, results) {
            if (err) return res.redirect('/error');

            var oldPersonId = results[0].person_id;
            var sql = 'SELECT time_signed_up FROM signup WHERE event_id = ? AND person_id = ?';
            var values = [req.body.eventId, oldPersonId];
            con.query(sql, values, function(err, results1) {
                if (err) return res.redirect('/error');
                
                var timeSignedUp = results1[0].time_signed_up;
                // remove the original event leader from the event sign-up list
                var sql = 'DELETE from signup WHERE event_id = ? AND person_id = ?';
                var values = [req.body.eventId, oldPersonId];
                con.query(sql, values, function(err, deleteResults) {
                    if (err) return res.redirect('/error');

                    var sql = 'SELECT person_id FROM people WHERE netID = ?';
                    var values = [netID];
                    con.query(sql, values, function(err, results1) {
                        if (err) return res.redirect('/error');

                        var newPersonID = results1[0].person_id;
                        var sql = 'SELECT * FROM signup WHERE event_id = ? AND person_id = ?';
                        var values = [req.body.eventId, newPersonID];
                        con.query(sql, values, function(err, results2) {
                            if (err) return res.redirect('/error');

                            if (typeof results2[0] === 'undefined') {
                                // add the new event leader to the event sign-up list
                                var sql = 'INSERT INTO signup (person_id, event_id, time_signed_up, comments) VALUES (?, ?, ?, ?)';
                                var values = [newPersonID, req.body.eventId, timeSignedUp, ''];
                                con.query(sql, values, function(err, insertResults) {
                                    if (err) return res.redirect('/error');

                                    var sql =
                                        'UPDATE events SET' +
                                        ' name = ?, leader_first_name = ?, leader_last_name = ?, leader_netID = ?, description = ?, ' +
                                        'start_time = ?, end_time = ?, location = ?, max_capacity = ?, other = ?, image = ?, is_hidden = ? WHERE event_id = ?';
                                    var values = [
                                        req.body.eventname,
                                        leaderfirst,
                                        leaderlast,
                                        netID,
                                        req.body.description,
                                        date + ' ' + start_time,
                                        date + ' ' + end_time,
                                        req.body.location,
                                        attendee,
                                        req.body.other,
                                        filename,
                                        hiddensignup,
                                        req.body.eventId
                                    ];
                                    con.query(sql, values, function(err, updateResults) {
                                        if (err) return res.redirect('/error');

                                        res.redirect('/' + person);
                                    });
                                });
                            } else {
                                var sql =
                                    'UPDATE events SET' +
                                    ' name = ?, leader_first_name = ?, leader_last_name = ?, leader_netID = ?, description = ?, ' +
                                    'start_time = ?, end_time = ?, location = ?, max_capacity = ?, other = ?, image = ?, is_hidden = ? WHERE event_id = ?';
                                var values = [
                                    req.body.eventname,
                                    leaderfirst,
                                    leaderlast,
                                    netID,
                                    req.body.description,
                                    date + ' ' + start_time,
                                    date + ' ' + end_time,
                                    req.body.location,
                                    attendee,
                                    req.body.other,
                                    filename,
                                    hiddensignup,
                                    req.body.eventId
                                ];
                                con.query(sql, values, function(err, updateResults) {
                                    if (err) return res.redirect('/error');

                                    res.redirect('/' + person);
                                });
                            }
                        });
                    });
                });
            });
        });
    } else {
        // update the event information for specific event
        // select the original event leader
        var sql = 'SELECT person_id FROM events INNER JOIN people ON events.leader_netID = people.netID WHERE events.event_id = ?';
        var values = [req.body.eventId];
        con.query(sql, values, function(err, results) {
            if (err) return res.redirect('/error');

            var oldPersonId = results[0].person_id;
            var sql = 'SELECT time_signed_up FROM signup WHERE event_id = ? AND person_id = ?';
            var values = [req.body.eventId, oldPersonId];
            con.query(sql, values, function(err, results1) {
                if (err) return res.redirect('/error');

                var timeSignedUp = results1[0].time_signed_up;
                // remove the original event leader from the event sign-up list
                var sql = 'DELETE from signup WHERE event_id = ? AND person_id = ?';
                var values = [req.body.eventId, oldPersonId];
                con.query(sql, values, function(err, deleteResults) {
                    if (err) return res.redirect('/error');

                    var sql = 'SELECT person_id FROM people WHERE netID = ?';
                    var values = [netID];
                    con.query(sql, values, function(err, results1) {
                        if (err) return res.redirect('/error');
                        
                        var newPersonID = results1[0].person_id;
                        var sql = 'SELECT * FROM signup WHERE event_id = ? AND person_id = ?';
                        var values = [req.body.eventId, newPersonID];
                        con.query(sql, values, function(err, results2) {
                            if (err) return res.redirect('/error');

                            if (typeof results2[0] === 'undefined') {
                                // add the new event leader to the event sign-up list
                                var sql = 'INSERT INTO signup (person_id, event_id, time_signed_up, comments) VALUES (?, ?, ?, ?)';
                                var values = [newPersonID, req.body.eventId, timeSignedUp, ''];
                                con.query(sql, values, function(err, insertResults) {
                                    if (err) return res.redirect('/error');

                                    var sql =
                                        'UPDATE events SET' +
                                        ' name = ?, leader_first_name = ?, leader_last_name = ?, leader_netID = ?, description = ?, ' +
                                        'start_time = ?, end_time = ?, location = ?, max_capacity = ?, other = ? , is_hidden = ? WHERE event_id = ?';
                                    var values = [
                                        req.body.eventname,
                                        leaderfirst,
                                        leaderlast,
                                        netID,
                                        req.body.description,
                                        date + ' ' + start_time,
                                        date + ' ' + end_time,
                                        req.body.location,
                                        attendee,
                                        req.body.other,
                                        hiddensignup,
                                        req.body.eventId
                                    ];
                                    con.query(sql, values, function(err, updateResults) {
                                        if (err) return res.redirect('/error');

                                        res.redirect('/' + person);
                                    });
                                });
                            } else {
                                var sql =
                                    'UPDATE events SET' +
                                    ' name = ?, leader_first_name = ?, leader_last_name = ?, leader_netID = ?, description = ?, ' +
                                    'start_time = ?, end_time = ?, location = ?, max_capacity = ?, other = ? , is_hidden = ? WHERE event_id = ?';
                                var values = [
                                    req.body.eventname,
                                    leaderfirst,
                                    leaderlast,
                                    netID,
                                    req.body.description,
                                    date + ' ' + start_time,
                                    date + ' ' + end_time,
                                    req.body.location,
                                    attendee,
                                    req.body.other,
                                    hiddensignup,
                                    req.body.eventId
                                ];
                                con.query(sql, values, function(err, updateResults) {
                                    if (err) return res.redirect('/error');

                                    res.redirect('/' + person);
                                });
                            }
                        });
                    });
                });
            });
        });
    }
};

/**
 * Updates the database, [con], by removing the event deleted by the user with
 * user type, [person].
 * Requires:
 *  - [req] is an Object containing information about the HTTPS request made
 *    to the admin/event leader home page route. 
 *  - [res] is an Object containing information about the HTTPS response that
 *    is sent back to the client browser.
 *  - [con] is the connection to the database.
 *  - [person] is a valid String of either value "eventleader" or "admin".
 */
var deleteEvent = function(req, res, con, person) {
    var eventId = req.body.deleteEventId;
    // delete the event with specific event ID, eventId
    var sql = 'DELETE FROM events WHERE event_id = ?';
    var values = [eventId];
    con.query(sql, values, function(err, deleteResult) {
        if (err) res.redirect('/error');

        res.redirect('/' + person);
    });
};

/**
 * Updates the database, [con], to add the user with user type, [pos], who was
 * added by the user with user type, [person].
 * Requires:
 *  - [req] is an Object containing information about the HTTPS request made
 *    to the admin/event leader home page route. 
 *  - [res] is an Object containing information about the HTTPS response that
 *    is sent back to the client browser.
 *  - [con] is the connection to the database.
 *  - [person] is a valid String of either value "eventleader" or "admin".
 *  - [pos] is an integer representing user type of either value 0, 1, or 2.
 */
var addPerson = function(req, res, con, person, pos) {
    var position = pos;
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var westhouse = req.body.westhouse;
    var netID = req.body.netID;
    var contactno = req.body.contactno;
    // check to see if the person already exists
    var sql = 'SELECT type FROM people WHERE netID = ?';
    var values = [netID];
    con.query(sql, values, function(err, results) {
        if (err) res.redirect('/error');

        if (typeof results[0] === 'undefined') {
            // add the user to the respective table
            var sql = 'INSERT INTO people (first_name, last_name, netID, west_house, phone, type) VALUES (?, ?, ?, ?, ?, ?)';
            var values = [firstname, lastname, netID, westhouse, contactno, position];
            con.query(sql, values, function(err, insertResult) {
                if (err) res.redirect('/error');

                res.redirect('/' + person);
            });
        } else {
            // change the position of user if necessary; otherwise just render the page
            var currPosition = results[0].type;

            if (currPosition == 3 || currPosition == position || person == 'eventleader') {
                res.redirect('/' + person);
            } else {
                var sql = 'UPDATE people SET type = ? WHERE netID = ?';
                var values = [position, netID];
                con.query(sql, values, function(err, updateResult) {
                    if (err) res.redirect('/error');

                    res.redirect('/' + person);
                });
            }
        }
    });
};

/**
 * Updates the database, [con], to remove the user who was removed by the user with 
 * user type, [person].
 * Requires:
 *  - [req] is an Object containing information about the HTTPS request made
 *    to the admin/event leader home page route. 
 *  - [res] is an Object containing information about the HTTPS response that
 *    is sent back to the client browser.
 *  - [con] is the connection to the database.
 *  - [person] is a valid String of either value "eventleader" or "admin".
 *  - [pos] is an integer representing user type of either value 0, 1, or 2.
 */
var removePerson = function(req, res, con, person) {
    var netID = req.body.removeUserNetId;
    var sql = 'SELECT * FROM people WHERE people.netID = ?';
    var values = [netID];
    con.query(sql, values, function(err, results) {
        if (err) res.redirect('/error');
        var result = results[0];

        if (typeof result !== 'undefined') {
            // check if the user being removed is assistant dean
            if ((person == 'eventleader' && result.type >= 2) ||(person == 'admin' && result.type == 3)) {
                res.redirect('/' + person);
            }
            
            // delete the user from the people table
            var sql = 'DELETE FROM people WHERE netID = ?';
            var values = [netID];
            con.query(sql, values, function(err, deleteResult) {
                if (err) res.redirect('/error');

                res.redirect('/' + person);
            });
        };
    }); 
};
    

module.exports = {
    addAttendee: addAttendee,
    createEvent: createEvent,
    editEvent: editEvent,
    deleteEvent: deleteEvent,
    addPerson: addPerson,
    removePerson: removePerson
};
