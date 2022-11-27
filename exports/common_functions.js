/**
 * Updates the database, [con], with the changes made to a user's profile who 
 * has user type, [person].
 * Requires:
 *  - [req] is an Object containing information about the HTTPS request made
 *    to the admin/event leader home page route. 
 *  - [res] is an Object containing information about the HTTPS response that
 *    is sent back to the client browser.
 *  - [con] is the connection to the database.
 *  - [person] is a valid String of either value "student", "eventleader", or 
 *    "admin".
 */
var editProfile = function(req, res, con, person) {
    var personid = req.body.id;
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var westhouse = req.body.westhouse;
    var netID = req.body.netID;
    var contactno = req.body.contactno;
    // update the person profile data
    var sql = 'UPDATE people SET first_name = ?, last_name = ?, netID = ?, west_house = ?, phone = ? WHERE person_id = ?';
    var values = [firstname, lastname, netID, westhouse, contactno, personid];
    con.query(sql, values, function(err, updateResult) {
        if (err) res.redirect('/error');
        
        res.redirect('/' + person);
    });
};

/**
 * Updates the database, [con], with the event sign-up made by the user with
 * personal ID, [id], user type, [person]. Sends a sign-up confirmation email
 * to the user.
 * Requires:
 *  - [id] is an integer representing the unique ID given to the user.
 *  - [req] is an Object containing information about the HTTPS request made
 *    to the admin/event leader home page route. 
 *  - [res] is an Object containing information about the HTTPS response that
 *    is sent back to the client browser.
 *  - [con] is the connection to the database.
 *  - [person] is a valid String of either value "student", "eventleader", or 
 *    "admin".
 *  - [email] is a module that sends email confirmations and notifications
 *    (../email.js).
 */
var signUpToEvent = function(id, req, res, con, person, email) {
    var eventId = req.body.eventId;
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    var time = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
    var dateTime = date + ' ' + time;
    var comments = req.body.comments;
    // add the user's sign-up to the database
    var sql =
        'INSERT INTO signup (person_id, event_id, time_signed_up, comments)' +
        ' VALUES (?, ?, ?, ?)';
    var values = [id, eventId, dateTime, comments];
    con.query(sql, values, function(err, insertResults) {
        if (err) res.redirect('/error');

        // query the information for the event with event ID, [eventId]
        var sql =
            'SELECT name, CONCAT(MONTH(start_time), "/", DAY(start_time), "/", YEAR(start_time)) AS date,' +
            "DATE_FORMAT(start_time, '%h:%i%p') AS start_time, DATE_FORMAT(end_time, '%h:%i%p') AS end_time," +
            'location FROM events WHERE events.event_id = ?';
        var values = [eventId];
        con.query(sql, values, function(err, results) {
            if (err) res.redirect('/error');

            // get the net ID of the user who signed up
            var sql = 'SELECT netID FROM people WHERE people.person_id = ?';
            var values = [id];
            con.query(sql, values, function(err, results1) {
                if (err) res.redirect('/error');

                var eventName = results[0].name;
                var eventDate = results[0].date;
                var eventStartTime = results[0].start_time;
                var eventEndTime = results[0].end_time;
                var eventLocation = results[0].location;
                var netID = results1[0].netID;

                // send email to confirm event leader's sign-up
                email.sendSignUp(netID, eventName, eventDate, eventStartTime, eventEndTime, eventLocation);

                res.redirect('/' + person);
            });
        });
    });
    
};

/**
 * Updates the database, [con], by removing the attendee with user type,
 * [person], from an event. Sends an email confirming the attendee's 
 * removal from the event.
 * Requires:
 *  - [req] is an Object containing information about the HTTPS request made
 *    to the admin/event leader home page route. 
 *  - [res] is an Object containing information about the HTTPS response that
 *    is sent back to the client browser.
 *  - [con] is the connection to the database.
 *  - [person] is a valid String of either value "student", "eventleader", or 
 *    "admin".
 *  - [email] is a module that sends email confirmations and notifications
 *    (../email.js).
 */
var removeAttendee = function(req, res, con, person, email) {
    // get the personal ID of the attendee removed and event ID of the event from which the attendee was removed
    var personId = req.body.removeAttendeePersonId;
    var eventId = req.body.removeAttendeeEventId;

    // find the removed attendee's position in the event sign-up
    var sql = 'SELECT person_id FROM signup WHERE event_id = ? ORDER BY time_signed_up ASC';
    var values = [eventId];
    con.query(sql, values, function(err, results) {
        if (err) res.redirect('/error');
        
        var currPosition = 0;
        for (i = 0; i < results.length; i++) {
            currPosition++;
            if (results[i].person_id == personId) {
                break;
            }
        }
        // remove the attendee's record in from the signup table in the database
        var sql = 'DELETE FROM signup WHERE person_id = ? AND event_id = ?';
        var values = [personId, eventId];
        con.query(sql, values, function(err, removeResult) {
            if (err) res.redirect('/error');

            var sql = 'SELECT netID FROM people WHERE person_id = ?';
            var values = [personId];
            con.query(sql, values, function(err, results) {
                if (err) res.redirect('/error');

                var netID = results[0].netID;
                // query the information for the event with event ID, [eventId]
                var sql =
                    'SELECT name, CONCAT(MONTH(start_time), "/", DAY(start_time), "/", YEAR(start_time)) AS date,' +
                    "DATE_FORMAT(start_time, '%h:%i%p') AS start_time, DATE_FORMAT(end_time, '%h:%i%p') AS end_time," +
                    'location, max_capacity FROM events WHERE events.event_id = ?';
                var values = [eventId];
                con.query(sql, values, function(err, results1) {
                    if (err) res.redirect('/error');

                    var eventName = results1[0].name;
                    var eventDate = results1[0].date;
                    var eventStartTime = results1[0].start_time;
                    var eventEndTime = results1[0].end_time;
                    var eventLocation = results1[0].location;
                    var maxCapacity = results1[0].max_capacity;

                    // send an email confirming attendee's removal from event
                    email.sendRemoveAttendee(netID, eventName, eventDate, eventStartTime, eventEndTime, eventLocation);

                    // check if there's anyone on the waitlist
                    if (currPosition <= maxCapacity) {
                        var sql = 'SELECT * FROM signup WHERE event_id = ? ORDER BY time_signed_up ASC';
                        var values = [eventId];
                        con.query(sql, values, function(err, results3) {
                            if (err) res.redirect('/error');

                            var result = results3[maxCapacity - 1];
                            if (typeof result === 'undefined') {  // waitlist is empty
                                res.redirect('/' + person);
                            } else {  // waitlist is not empty
                                var personid = result.person_id;
                                var sql = 'SELECT netID FROM people WHERE person_id = ?';
                                var values = [personid];
                                con.query(sql, values, function(err, results4) {
                                    if (err) res.redirect('/error');

                                    var result = results4[0];
                                    var waitlistNetID = result.netID;

                                    // send an email to first person on waitlist if waitlist not empty
                                    email.sendWaitlistAttendee(waitlistNetID, eventName, eventDate, eventLocation, eventStartTime, eventEndTime);
                                    res.redirect('/' + person);
                                });
                            }
                        });
                    } else {
                        // attendee removal confirmation email already sent --> redirect back to home page
                        res.redirect('/' + person);
                    }
                });
            });
        });
    });
};

module.exports = {
    editProfile: editProfile,
    signUpToEvent: signUpToEvent,
    removeAttendee: removeAttendee
};
