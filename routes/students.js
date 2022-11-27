var router = require('express').Router();
var con = require('../exports/db');
var functions = require('../exports/common_functions');
var email = require('../exports/email');
var makeHome = require('../exports/makeHome');
var async = require('async');

router.get('/', function(req, res) {
    makeHome.getStudentHome(req, res, con, async, req.user.personID);
});

router.post('/signup', function(req, res) {
    functions.signUpToEvent(req.user.personID, req, res, con, 'students', email);
});

router.post('/editprofile', function(req, res) {
    functions.editProfile(req, res, con, 'students', 0);
});

router.post('/removeattendee', function(req, res) {
   functions.removeAttendee(req, res, con, 'students', email);
});

module.exports = router;
