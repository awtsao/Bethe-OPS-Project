var router = require('express').Router();
var con = require('../exports/db');
var async = require('async');
var email = require('../exports/email');
var upload = require('../exports/storage');
var common_functions = require('../exports/common_functions');
var admin_EL_functions = require('../exports/Admin_EL_functions');
var makeHome = require('../exports/makeHome');

router.get('/', function(req, res) {
    makeHome.getAdminELHome(req, res, con, async, 'eventleader', req.user.personID);
});

router.post('/signup', function(req, res) {
    common_functions.signUpToEvent(req.user.personID, req, res, con, 'eventleader', email);
});

router.post('/event/create', upload.single('file'), function(req, res) {
    admin_EL_functions.createEvent(req, res, con, 'eventleader');
});

router.post('/event/edit', upload.single('file'), function(req, res) {
    admin_EL_functions.editEvent(req, res, con, 'eventleader');
});

router.post('/deleteevent', function(req, res) {
    admin_EL_functions.deleteEvent(req, res, con, 'eventleader');
});

router.post('/editprofile', function(req, res) {
    common_functions.editProfile(req, res, con, 'eventleader');
});

router.post('/addattendee', function(req, res) {
    admin_EL_functions.addAttendee(req, res, con, 'eventleader', email);
});

router.post('/removeattendee', function(req, res) {
    common_functions.removeAttendee(req, res, con, 'eventleader', email);
});

router.post('/addstudent', function(req, res) {
    admin_EL_functions.addPerson(req, res, con, 'eventleader', 0);
});

router.post('/removestudent', function(req, res) {
    admin_EL_functions.removePerson(req, res, con, 'eventleader');
});

module.exports = router;
