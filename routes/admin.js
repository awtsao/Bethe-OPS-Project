var router = require('express').Router();
var con = require('../exports/db');
var async = require('async');
var email = require('../exports/email');
var upload = require('../exports/storage');
var common_functions = require('../exports/common_functions');
var admin_EL_functions = require('../exports/Admin_EL_functions');
var makeHome = require('../exports/makeHome');

router.get('/', function(req, res) {
    makeHome.getAdminELHome(req, res, con, async, 'admin', req.user.personID);
});

router.post('/signup', function(req, res) {
    common_functions.signUpToEvent(req.user.personID, req, res, con, 'admin', email);
});

router.post('/event/create', upload.single('file'), function(req, res) {
     admin_EL_functions.createEvent(req, res, con, 'admin');
});

router.post('/event/edit', upload.single('file'), function(req, res) {
    admin_EL_functions.editEvent(req, res, con, 'admin');
});

router.post('/deleteevent', function(req, res) {
    admin_EL_functions.deleteEvent(req, res, con, 'admin');
});

router.post('/adduser', function(req, res) {
    admin_EL_functions.addPerson(req, res, con, 'admin', req.body.position);
});

router.post('/removeuser', function(req, res) {
    admin_EL_functions.removePerson(req, res, con, 'admin');
});

router.post('/editprofile', function(req, res) {
    common_functions.editProfile(req, res, con, 'admin');
});

router.post('/addattendee', function(req, res) {
    admin_EL_functions.addAttendee(req, res, con, 'admin', email);
});

router.post('/removeattendee', function(req, res) {
    common_functions.removeAttendee(req, res, con, 'admin', email);
});

module.exports = router;
