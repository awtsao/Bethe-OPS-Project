/**
 * Returns the user profile of the user with ID, [identifier], and information,
 * [result].
 * Requires:
 *  - [result] is a valid Object containing fields of information on the user
 *    including name, building, netID, phone number, and user type.
 *  - [identifier] is an integer representing the unique ID given to the user.
 */
var buildProfile = function(result, identifier) {
    var profile = {
        id: identifier,
        firstName: result.first_name,
        lastName: result.last_name,
        building: result.west_house,
        netID: result.netID,
        contactNo: result.phone,
        type: result.type
    };

    return profile;
};

/**
 * Returns the user profile of the user with information, [result].
 * Requires:
 *  - [result] is a valid Object containing fields of information on the user
 *    including personal ID, name, building, netID, phone number, email, and 
 *    user type.
 */
var buildAttendee = function(result) {
    var profile = {
        id: result.person_id,
        name: result.peoplename,
        netID: result.netID,
        phoneNumber: result.phone,
        email: result.email,
        building: result.west_house,
        type: result.type
    };

    return profile;
};

/**
 * Renders the event landing page for admins and event leaders given the
 * string identification of the user's type, [person], and the personal
 * ID of the event leader or admin user, [id].
 * Requires:
 *  - [req] is an Object containing information about the HTTPS request made
 *    to the admin/event leader home page route. 
 *  - [res] is an Object containing information about the HTTPS response that
 *    is sent back to the client browser.
 *  - [con] is the connection to the database.
 *  - [async] is a module that provides functions to execute asynchronous code.
 *  - [person] is a valid String of either value "eventleader" or "admin".
 *  - [id] is an integer representing the unique ID given to the user.
 */
var getAdminELHome = function(req, res, con, async, person, id) {
    var sql;
    if (person == 'eventleader') {
        // select the eventleader record
        sql = 'SELECT * FROM people WHERE people.person_id = ? AND type = 1';
    } else {
        // select the admin/assistant dean record
        sql = 'SELECT * FROM people WHERE people.person_id = ? AND (type = 2 || type = 3)';
    }
    var values = [id];
    var profile = {};
    con.query(sql, values, function(err, results) {
        if (err) res.redirect('/error');
        
        var result = results[0];
        profile = buildProfile(result, id);

        // get the people in the db
        var people = {};
        var sql = 'SELECT first_name, last_name, netID, type FROM people';
        con.query(sql, function(err, results0) {
            if (err) res.redirect('/error');

            var index0 = 0;
            async.forEachOf(results0, function(result, callback) {
                people[result.netID] = {
                    name: result.first_name + ' ' + result.last_name,
                    type: result.type
                };

                index0++;
            });
            
            // select events and necessary info
            var sql =
                'SELECT events.event_id, name, CONCAT(leader_first_name, " ", leader_last_name) AS eventleadername, leader_netID, description, MONTHNAME(start_time) AS month, DAY(start_time) AS day, ' +
                "YEAR(start_time) AS year, DATE_FORMAT(start_time, '%h:%i%p') AS start_time, DATE_FORMAT(end_time, '%h:%i%p') AS end_time, CONCAT(MONTH(start_time), '/', DAY(start_time), '/', YEAR(start_time)) AS date, location, max_capacity, other, image, is_hidden" +
                ' FROM events';
            var events = {};
            con.query(sql, function(err, results1) {
                if (err) res.redirect('/error');

                var index = 0;
                async.forEachOf(results1, function(result, key, callback) {
                    var date = result.month + ' ' + result.day + ', ' + result.year;
                    var other = 'N/A';

                    if (result.other !== null) {
                        other = result.other;
                    }
                    if (typeof events[date] === 'undefined') {
                        events[date] = {};
                    }

                    index++;
                    events[date][result.name] = {
                        id: result.event_id,
                        startTime: result.start_time,
                        location: result.location,
                        endTime: result.end_time,
                        description: result.description,
                        eventLeader: {
                            name: result.eventleadername,
                            netID: result.leader_netID
                        },
                        maxCapacity: result.max_capacity,
                        poster: result.image,
                        other: other,
                        isHidden: result.is_hidden,
                        date: result.date
                    };
                });

                var eventattendees = {};
                var index1 = 0;
                // select the signups for each respective event
                var sql =
                    'SELECT events.event_id, events.name, signup.time_signed_up, people.person_id, CONCAT(people.first_name, " ", people.last_name) AS peoplename, netID, phone, CONCAT(netID, "@cornell.edu") AS email, people.person_id, people.type, people.west_house FROM events LEFT JOIN signup ON signup.event_id = events.event_id LEFT JOIN people ON signup.person_id = people.person_id ORDER BY events.event_id ASC, time_signed_up ASC;';
                con.query(sql, values, function(err, results2) {
                    if (err) res.redirect('/error');

                    var attendees = [];
                    async.forEachOf(results2, function(result, callback) {
                        if (typeof eventattendees[result.name] === 'undefined') {
                            attendees = [];
                            eventattendees[result.name] = attendees;
                        }
                    
                        index1++;
                        attendees.push(buildAttendee(result));
                    });

                    // select all eventleader, admin, assistant dean
                    var sql = 'SELECT * FROM people WHERE type = 1 || type = 2 || type = 3';
                    con.query(sql, function(err, results3) {
                        if (err) res.redirect('/error');

                        var index2 = 0;
                        var eventleaders = {};
                        async.forEachOf(results3, function(result, key, callback) {
                            eventleaders[result.netID] = {
                                name: result.first_name + ' ' + result.last_name,
                                type: result.type
                            };
                            index2++;
                        });
                        
                        if (
                            index0 == results0.length &&
                            index == results1.length &&
                            index1 == results2.length &&
                            index2 == results3.length
                        ) {
                            if(person =='eventleader'){
                                res.render('pages/eventleader', {
                                    events: events,
                                    attendees: eventattendees,
                                    eventleaderProfile: profile,
                                    eventLeaders: eventleaders,
                                    people: people
                                });
                            } else {
                                res.render('pages/admin', {
                                    events: events,
                                    attendees: eventattendees,
                                    adminProfile: profile,
                                    eventLeaders: eventleaders,
                                    people: people
                                });
                            }
                        }
                    });
                });
            });
        });
    });
};

/**
 * Renders the event landing page for students given the personal ID of the 
 * student user, [id].
 * Requires:
 *  - [req] is an Object containing information about the HTTPS request made
 *    to the admin/event leader home page route. 
 *  - [res] is an Object containing information about the HTTPS response that
 *    is sent back to the client browser.
 *  - [con] is the connection to the database.
 *  - [async] is a module that provides functions to execute asynchronous code.
 *  - [id] is an integer representing the unique ID given to the user.
 */
var getStudentHome = function(req, res, con, async, id) {
    //select student with certain id
    var sql = 'SELECT * FROM people WHERE people.person_id = ? AND people.type = 0';
    var values = [id];
    var studentProfile = {};
    con.query(sql, values, function(err, results) {
        if (err) res.redirect('/error');

        var result = results[0];
        studentProfile = buildProfile(result, id);

        // select events and necessary info
        var sql =
            'SELECT events.event_id, name, CONCAT(leader_first_name, " ", leader_last_name) AS eventleadername, leader_netID, description, MONTHNAME(start_time) AS month, DAY(start_time) AS day, ' +
            "YEAR(start_time) AS year, DATE_FORMAT(start_time, '%h:%i%p') AS start_time, " +
            "DATE_FORMAT(end_time, '%h:%i%p') AS end_time, CONCAT(MONTH(start_time), '/', DAY(start_time), '/', YEAR(start_time)) AS date, location, max_capacity, other, image, is_hidden" +
            ' FROM events';
        var events = {};
        con.query(sql, function(err, results1) {
            if (err) res.redirect('/error');

            var index = 0;
            async.forEachOf(results1, function(result, key, callback) {
                var date = result.month + ' ' + result.day + ', ' + result.year;
                var other = 'N/A';

                if (result.other !== null) {
                    other = result.other;
                }
                if (typeof events[date] === 'undefined') {
                    events[date] = {};
                }

                index++;
                events[date][result.name] = {
                    id: result.event_id,
                    startTime: result.start_time,
                    location: result.location,
                    endTime: result.end_time,
                    description: result.description,
                    eventLeader: {
                        name: result.eventleadername,
                        netID: result.leader_netID
                    },
                    maxCapacity: result.max_capacity,
                    poster: result.image,
                    other: other,
                    isHidden: result.is_hidden,
                    date: result.date
                };
            });
            var eventattendees = {};
            var index1 = 0;
            // select events and the respective signups
            var sql =
                'SELECT events.event_id, events.name, signup.time_signed_up, people.person_id, CONCAT(people.first_name, " ", people.last_name) AS ' +
                'peoplename, netID, phone, CONCAT(netID, "@cornell.edu") AS email, people.person_id, people.type, people.west_house FROM events ' +
                'LEFT JOIN signup ON signup.event_id = events.event_id LEFT JOIN people ON signup.person_id = people.person_id ' +
                'ORDER BY events.event_id ASC, time_signed_up ASC;';
            con.query(sql, values, function(err, results2) {
                if (err) res.redirect('/error');

                var attendees = [];
                async.forEachOf(results2, function(result, callback) {
                    if (typeof eventattendees[result.name] === 'undefined') {
                        attendees = [];
                        eventattendees[result.name] = attendees;
                    }
                    index1++;
                    attendees.push(buildAttendee(result));
                });

                if (index == results1.length && index1 == results2.length) {
                    res.render('pages/index', {
                        events: events,
                        attendees: eventattendees,
                        studentProfile: studentProfile
                    });
                }
            });
        });
    });
};

module.exports = {
    getAdminELHome: getAdminELHome,
    getStudentHome: getStudentHome
};
