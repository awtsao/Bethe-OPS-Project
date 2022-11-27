var express = require('express');
var app = express();
var async = require('async');
var bodyParser = require('body-parser');
var schedule = require('node-schedule');
var passport = require('passport');
var passportSaml = require('passport-saml');
var email = require('./exports/email');
var con = require('./exports/db');
var cookieSession = require('cookie-session');
var passport = require('passport');
var passportSaml = require('passport-saml');
var fs = require('fs');

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieSession({
	keys: ['key1', 'key2'],
	maxAge: 24 * 60 * 60 * 1000
}));

// set up Passport
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
  return done(null, user);
});

passport.use(new passportSaml.Strategy(
    {
        path: '/login/callback',
        entryPoint: 'https://shibidp-test.cit.cornell.edu/idp/profile/SAML2/Redirect/SSO',
        issuer: 'passport-saml',
        cert: fs.readFileSync(__dirname + '/IDP/cornell-idp-test.crt', 'utf8') 
    },
    (profile, done) => {
        var id = profile['email'].substring(0, profile['email'].indexOf('@'));
        var sql = 'select person_id, type from people where people.netID = ?';
        con.query(sql, [id], function(err, results) {
            if (results.length > 0) {
                result = results[0];
                return done(null, { netID: id, personID: result['person_id'] });
            }

            return done(null, { netID: id, personID: null }); 
        });
    }
));

app.use(passport.initialize());
app.use(passport.session());
app.use(require('./routes'));

app.get('/', function(req, res) {
    res.redirect('/login');
});

app.get('/login',
    passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
    function(req, res) {
        res.redirect('/');
    }
);

app.post('/login/callback',
    passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
    function(req, res) {
        if (req.user.personID == null) {
            res.redirect('/signup');
            return;
        }
        
        var sql = 'SELECT type FROM people WHERE people.netID = ?';
        var values = [req.user.netID];
        con.query(sql, values, function(err, results) {
            if (err || results.length == 0) return res.redirect('/error');
            
            result = results[0];
            switch(result.type) {
                case 0:
                    res.redirect('/students');
                    break;
                case 1:
                    res.redirect('/eventleader');
                    break;
                case 2:
                    res.redirect('/admin');
                    break;
                case 3:
                    // assistant dean
                    res.redirect('/admin');
                case 4:
                    res.redirect('/error');
            } 
        });
    }
);

app.get('/error', function(req, res) {
   return  res.render('pages/error', {});
});

// sign-up
app.get('/signup', function(req, res) {
    res.render('pages/signup', {});
});

app.post('/signup', function(req, res) {
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var netID = req.body.netID;
    var contactno = req.body.contactno;
    var type = 0;
    var building = req.body.westhouse;
    var sql =
        'INSERT INTO people (first_name, last_name, netID, west_house, phone, type)' +
        ' VALUES (?, ?, ?, ?, ?, ?)';
    var values = [firstname, lastname, netID, building, contactno, type];
    con.query(sql, values, function(err, insertResult) {
        if (err) res.render('pages/error');
    });

    req.user.netID = netID;

    res.redirect('/temp_students');
});

app.get('/temp_students', function(req, res) {
    var sql = 'SELECT person_id FROM people WHERE people.netID = ?';
    con.query(sql, [req.user.netID], function(err, results) {
        if (results.length == 0) res.redirect('/error');

        req.user.personID = results[0].person_id;

        res.redirect('/students');
    });
});

/***** EVENT EMAIL REMINDERS START *****/
// one day reminder
schedule.scheduleJob({ hour: 9, minute: 0 }, function() {
    var currentDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
    var mm = (currentDate.getMonth() + 1).toString();
    if (mm.length === 1) {
        mm = '0' + mm;
    }
    var dd = (currentDate.getDate()).toString();
    if (dd.length === 1) {
        dd = '0' + dd;
    }
    var yyyy = currentDate.getFullYear();
    var sql =
        'SELECT event_id, name, leader_first_name, leader_last_name, leader_netID, description, MONTHNAME(start_time) AS month, DAY(start_time) AS day, ' +
        "YEAR(start_time) AS year, DATE_FORMAT(start_time, '%h:%i%p') AS start_time, HOUR(start_time) AS start_hour, MINUTE(start_time) AS start_minute, " +
        "DATE_FORMAT(end_time, '%h:%i%p') AS end_time, HOUR(end_time) AS end_hour, MINUTE(end_time) AS end_minute, location, max_capacity, is_hidden, " +
        "other FROM events WHERE DATE_FORMAT(start_time, '%m/%d/%Y') = ?";
    var values = [mm + '/' + dd + '/' + yyyy];
    var events = {};
    con.query(sql, values, function(err, results) {
        if (err) throw err

        // for each event in result get the attendees and the waitlist of that event
        var index = 0;
        async.forEachOf(results, function(result, key, callback) {
            var eventId = result.event_id;
            var sql =
                'SELECT * FROM people INNER JOIN signup ON ' +
                'people.person_id = signup.person_id WHERE signup.event_id ' +
                '= ? ORDER BY time_signed_up ASC LIMIT ?';
            var values = [eventId, result.max_capacity]
            con.query(sql, values, function(err, results1) {
                if (err) throw err;

                var sql = 'SELECT * FROM signup WHERE event_id = ?';
                var values = [eventId];
                con.query(sql, values, function(err, results2){
                    if(err) throw err;

                    var numberSignUp = results2.length;
                    var sql =
                        'SELECT * FROM people INNER JOIN signup ON ' +
                        'people.person_id = signup.person_id WHERE signup.event_id ' +
                        '= ? ORDER BY time_signed_up DESC LIMIT ?';
                    var values = [eventId, Math.max(0, numberSignUp - result.max_capacity)];
                    con.query(sql, values, function(err, results3) {
                        if (err) throw err;

                        events[result.name] = {
                            id: result.event_id,
                            date: mm + '/' + dd + '/' + yyyy, 
                            startTime: result.start_time,
                            endTime: result.end_time,
                            location: result.location,
                            description: result.description,
                            eventLeader: {
                                name: result.leader_first_name + " " + result.leader_last_name,
                                netID: result.leader_netID
                            },
                            hidden: result.is_hidden,
                            maxCapacity: result.max_capacity,
                            other: result.other,
                            attendees: results1,
                            waitlist: results3
                        }

                        index++;
                        if(index == results.length) {
                            if (Object.keys(events).length > 0) {
                                email.oneDayReminder(events);
                            }
                        }
                    });
                });
            });
        });
    });
});

// two hour reminder
schedule.scheduleJob('*/15 * * * *', function() {
    var today = new Date();
    today.setHours(today.getHours() + 2);
    var mm = (today.getMonth() + 1).toString();
    if (mm.length === 1) {
        mm = '0' + mm;
    }
    var dd = (today.getDate()).toString();
    if (dd.length === 1) {
        dd = '0' + dd;
    }
    var yyyy = today.getFullYear();
    var hh = (today.getHours()).toString();
    if (hh.length === 1) {
        hh = '0' + hh;
    }
    var min = (today.getMinutes()).toString();
    if (min.length === 1) {
        min = '0' + min;
    }
    var sql =
        'SELECT event_id, name, description, MONTHNAME(start_time) AS month, DAY(start_time) AS day, ' +
        "YEAR(start_time) AS year, DATE_FORMAT(start_time, '%h:%i%p') AS start_time, HOUR(start_time) AS start_hour, MINUTE(start_time) AS start_minute, " +
        "DATE_FORMAT(end_time, '%h:%i%p') AS end_time, HOUR(end_time) AS end_hour, MINUTE(end_time) AS end_minute, location, max_capacity, is_hidden, " +
        "other FROM events WHERE DATE_FORMAT(start_time, '%m/%d/%Y %H %i') = ?";
    var values = [mm + '/' + dd + '/' + yyyy + ' ' + hh + ' ' + min];
    var events = {};
    con.query(sql, values, function(err, results) {
        if (err) throw err;

        // for each event in result get the attendees and the waitlist of that event
        var index = 0;
        async.forEachOf(results, function(result, key, callback) {
            var eventId = result.event_id;
            var sql =
                'SELECT * FROM people INNER JOIN signup ON ' +
                'people.person_id = signup.person_id WHERE signup.event_id ' +
                '= ? ORDER BY time_signed_up ASC LIMIT ?'
            var values = [eventId, result.max_capacity];
            con.query(sql, values, function(err, results1) {
                if (err) throw err;

                var sql = 'SELECT * FROM signup WHERE event_id = ?';
                var values = [eventId];
                con.query(sql, values, function(err, results2){
                    var numberSignUp = results2.length;
                    var sql =
                        'SELECT * FROM people INNER JOIN signup ON ' +
                        'people.person_id = signup.person_id WHERE signup.event_id ' +
                        '= ? ORDER BY time_signed_up DESC LIMIT ?'
                    var values = [eventId, Math.max(0, numberSignUp - result.max_capacity)]
                    con.query(sql, values, function(err, results3) {
                        if (err) throw err

                        events[result.name] = {
                            id: result.event_id,
                            date: mm + '/' + dd + '/' + yyyy,
                            startTime: result.start_time,
                            endTime: result.end_time,
                            location: result.location,
                            description: result.description,
                            eventLeader: {
                                name: result.leader_first_name + " " + result.leader_last_name,
                                netID: result.leader_netID
                            },
                            hidden: result.is_hidden,
                            maxCapacity: result.max_capacity,
                            other: result.other,
                            attendees: results1,
                            waitlist: results3
                        }
                        
                        index++;
                        if(index == results.length) {
                            if (Object.keys(events).length > 0) {
                                email.twoHourReminder(events);
                            }
                        }
                    });
                });
            });
        });
    });
});
/***** EVENT EMAIL REMINDERS END *****/

// access server at localhost:3000
app.listen(3000);
