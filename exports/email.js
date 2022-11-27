var nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'betheops@gmail.com',
        pass: 'Cornell2019'
    },
    tls: {
        rejectUnauthorized: false
    }
});
/**
 * Sends an email confirming a user's sign-up for an event given the user's net ID, [netID],
 * event name, [eventName], event date, [eventDate], event time, [eventStartTime] and
 * [eventEndTime], and event location, [eventLocation].
 * Requires:
 *  - [netID] is a valid String representing a valid Cornell net ID.
 *  - [eventName] is a valid String represending the name of the event signed up for.
 *  - [eventDate] is a valid String representing the date of the event signed up for.
 *  - [eventStartTime] is a valid String represending the start time of the event signed up for.
 *  - [eventEndTime] is a valid String representing the end time of the event signed up for.
 *  - [eventLocation] is a valid String representing the location of the event signed up for.
 */
function sendSignUp(netID, eventName, eventDate, eventStartTime, eventEndTime, eventLocation) {
    var recipient = netID + '@cornell.edu';

    // create HTML for email
    var html =
        '<p>Hello,<br /><br />This is a confirmation that you have signed up for the Bethe House event, ' +
        eventName +
        ', happening on ' +
        eventDate +
        ' at ' +
        eventStartTime +
        ' - ' +
        eventEndTime +
        ', ' +
        eventLocation +
        '.<br /><br />--<br />Thanks,<br />Bethe House Office Staff<br />607-255-7210<br />bethehouseoffice@gmail.com</p>';

    const mailOptions = {
        from: 'Bethe OPS <betheops@gmail.com>',
        to: recipient,
        subject: 'Sign-up confirmation - ' + eventName,
        html: html
    };

    transporter.sendMail(mailOptions, function(err, info) {
        if (err) {
            console.log('Sending to ' + recipient + ' failed: ' + err);
        } else {
            console.log('Sent to ' + recipient);
        }

        mailOptions.transport.close();
    });
}

/**
 * Sends an email notifying the user with net ID, [netID], that they have been added to the
 * event, [eventName], occurring on the date, [eventDate], at the time, [eventStart] to 
 * [eventEndTime], and at the location, [eventLocation]. The email notifies the user has
 * been added to the event waitlist given the flag, [onWaitlist]; otherwise, the email
 * notifies the user has been added to the event roster.
 * Requires:
 *  - [netID] is a valid String representing a valid Cornell net ID.
 *  - [eventName] is a valid String represending the name of the event.
 *  - [eventDate] is a valid String representing the date of the event.
 *  - [eventStartTime] is a valid String represending the start time of the event.
 *  - [eventEndTime] is a valid String representing the end time of the event.
 *  - [eventLocation] is a valid String representing the location of the event.
 *  - [onWaitlist] is a valid boolean representing whether the user has been added to the
 *    event waitlist.
 * 
 */
function sendAddAttendee(netID, eventName, eventDate, eventStartTime, eventEndTime, eventLocation, onWaitlist) {
    var addRecipient = netID + '@cornell.edu';

    // create HTML for email
    var addHtml = '';
    var subject = '';

    if (!onWaitlist) {
        addHtml += '<p>Hello,<br /><br />You have been added to the event roster for the Bethe House event, ';
        subject = 'Congrats, you have a spot - ' + eventName;
    } else {
        addHtml += '<p>Hello,<br /><br />You have been added to the waitlist for the Bethe House event, ';
        subject = 'Waitlist - ' + eventName;
    }
    addHtml = addHtml +
        eventName +
        ', happening on ' +
        eventDate +
        ' at ' +
        eventStartTime +
        ' - ' +
        eventEndTime +
        ', ' +
        eventLocation +
        '.<br /><br />--<br />Thanks,<br />Bethe House Office Staff<br />607-255-7210<br />bethehouseoffice@gmail.com</p>';

    const addMailOptions = {
        from: 'Bethe OPS <betheops@gmail.com>',
        to: addRecipient,
        subject: subject,
        html: addHtml
    };

    transporter.sendMail(addMailOptions, function(err, info) {
        if (err) {
            console.log('Sending to ' + addRecipient + ' failed: ' + err);
        } else {
            console.log('Sent to ' + addRecipient);
        }

        addMailOptions.transport.close();
    });
}

/**
 * Sends an email notifying the user with net ID, [netID], that they have been removed from
 * the event roster for the event, [eventName], occurring on the date, [eventDate], at the 
 * time, [eventStart] to [eventEndTime], and at the location, [eventLocation].
 * Requires:
 *  - [netID] is a valid String representing a valid Cornell net ID.
 *  - [eventName] is a valid String represending the name of the event.
 *  - [eventDate] is a valid String representing the date of the event.
 *  - [eventStartTime] is a valid String represending the start time of the event.
 *  - [eventEndTime] is a valid String representing the end time of the event.
 *  - [eventLocation] is a valid String representing the location of the event.
 */
function sendRemoveAttendee(netID, eventName, eventDate, eventStartTime, eventEndTime, eventLocation) {
    var removedRecipient = netID + '@cornell.edu';

    // create HTML for email
    var removedHtml =
        '<p>Hello,<br /><br />This is a confirmation that you have been removed from the Bethe House event, ' +
        eventName +
        ', happening on ' +
        eventDate +
        ' at ' +
        eventStartTime +
        ' - ' +
        eventEndTime +
        ', ' +
        eventLocation +
        '.<br /><br />--<br />Thanks,<br />Bethe House Office Staff<br />607-255-7210<br />bethehouseoffice@gmail.com</p>';

    const removedMailOptions = {
        from: 'Bethe OPS <betheops@gmail.com>',
        to: removedRecipient,
        subject: 'Removed - ' + eventName,
        html: removedHtml
    };

    transporter.sendMail(removedMailOptions, function(err, info) {
        if (err) {
            console.log('Sending to ' + removedRecipient + ' failed: ' + err);
        } else {
            console.log('Sent to ' + removedRecipient);
        }

        removedMailOptions.transport.close();
    });
}

/**
 * Sends an email notifying the user with net ID, [netID], that they have been removed from
 * the waitlist and added to the event roster for the event, [eventName], occurring on the 
 * date, [eventDate], at the time, [eventStart] to [eventEndTime], and at the location, 
 * [eventLocation].
 * Requires:
 *  - [netID] is a valid String representing a valid Cornell net ID.
 *  - [eventName] is a valid String represending the name of the event.
 *  - [eventDate] is a valid String representing the date of the event.
 *  - [eventStartTime] is a valid String represending the start time of the event.
 *  - [eventEndTime] is a valid String representing the end time of the event.
 *  - [eventLocation] is a valid String representing the location of the event.
 */
function sendWaitlistAttendee(netID, eventName, eventDate, eventStartTime, eventEndTime, eventLocation) {
    var waitlistRecipient = netID + '@cornell.edu';

    // create HTML for email
    var waitlistHtml =
        '<p>Hello,<br /><br />You have been removed from the waitlist and added to the event roster for the Bethe House event, ' +
        eventName +
        ', happening on ' +
        eventDate +
        ' at ' +
        eventStartTime +
        ' - ' +
        eventEndTime +
        ', ' +
        eventLocation +
        '.<br /><br />--<br />Thanks,<br />Bethe House Office Staff<br />607-255-7210<br />bethehouseoffice@gmail.com</p>';

    const waitlistMailOptions = {
        from: 'Bethe OPS <betheops@gmail.com>',
        to: waitlistRecipient,
        subject: 'Congrats, you have a spot - ' + eventName,
        html: waitlistHtml
    };

    transporter.sendMail(waitlistMailOptions, function(err, info) {
        if (err) {
            console.log('Sending to ' + waitlistRecipient + ' failed: ' + err);
        } else {
            console.log('Sent to ' + waitlistRecipient);
        }

        waitlistMailOptions.transport.close();
    });
}

/**
 * Sends an email reminder to the attendees of each event happening tomorrow, [events].
 * Requires:
 *  - [events] is a valid Object containing Objects that each represent an event. Each
 *    event is indexed by its name.
 */
function oneDayReminder(events) {
    for (var e in events) {
        // get eventName, eventDate, eventStartTime, eventEndTime, eventLocation, eventLeaderNetID
        let eventName = e;
        let eventDate = events[e].date;
        let eventStartTime = events[e].startTime;
        let eventEndTime = events[e].endTime;
        let eventLocation = events[e].location;
        let eventLeaderNetID = events[e].eventLeader.netID;

        // get list of attendees
        let attendees = events[e].attendees;
        let waitlist = events[e].waitlist;
        let recipients = [];
        attendees.forEach(function(p) {
            if (p.netID !== eventLeaderNetID) {
                let r = p.netID + '@cornell.edu';
                recipients.push(r);
            }
        });
        if (waitlist.length > 0) {
            waitlist.forEach(function(p) {
                let r = p.netID + '@cornell.edu';
                recipients.push(r);
            });
        }

        // create email reminder HTML
        var oneReminderHtml =
            '<p>Hello,<br /><br />This a friendly reminder that you signed up for the Bethe House event, ' +
            eventName +
            ', happening tomorrow, ' +
            eventDate +
            ' at ' +
            eventStartTime +
            ' - ' +
            eventEndTime +
            ', ' +
            eventLocation +
            '. <br /><br />';
        // if event isn't full
        if (attendees.length < events[e].maxCapacity) {
            oneReminderHtml += 'If you have a friend who would like to join there is currently at least one open space on the sign-up sheet. We would be happy to have the spot filled.<br /><br />';
        }
        // if event is full with no one on the waitlist
        if (attendees.length == events[e].maxCapacity && waitlist.length == 0) {
            oneReminderHtml += 'This event is currently full. If you can no longer attend please remove your name from the event roster online.<br /><br />';
        }
        // if event is full with people on the waitlist
        if (attendees.length == events[e].maxCapacity && waitlist.length > 0) {
            oneReminderHtml += 'This event is currently full with a waitlist. We have included folks on the waitlist on this email.<br /><br />';
            oneReminderHtml += 'If you can no longer attend please remove your name from the event roster online. If you are on the waitlist your name is included below in the order you appear on the waitlist.<br /><br />Waitlist:<br />';
            // get waitlist for event
            // for each person on waitlist
            waitlist.forEach(function(p) {
                oneReminderHtml += p.first_name + ' ' + p.last_name;
                oneReminderHtml += '<br />';
            });
        }
        oneReminderHtml += '--<br />Thanks,<br />Bethe House Office Staff<br />607-255-7210<br />bethehouseoffice@gmail.com</p>';

        // create mail options
        const oneReminderMailOptions = {
            from: 'Bethe OPS <betheops@gmail.com>',
            to: recipients.join(', '),
            cc: eventLeaderNetID + '@cornell.edu',
            subject: 'Event reminder tomorrow - ' + eventName,
            html: oneReminderHtml
        }

        // send reminder
        transporter.sendMail(oneReminderMailOptions, function(err, info) {
            if (err) {
                console.log('Sending one day reminder failed: ' + err);
            } else {
                console.log('Sent one day reminder');
            }

            oneReminderMailOptions.transport.close();
        });
    }
}

/**
 * Sends an email reminder to the attendees of each event happening in two hours, 
 * [events].
 * Requires:
 *  - [events] is a valid Object containing Objects that each represent an event. Each
 *    event is indexed by its name.
 */
function twoHourReminder(events) {
    for (var e in events) {
        // get eventName, eventDate, eventStartTime, eventEndTime, eventLocation, eventLeaderNetID
        let eventName = e;
        let eventDate = events[e].date;
        let eventStartTime = events[e].startTime;
        let eventEndTime = events[e].endTime;
        let eventLocation = events[e].location;
        let eventLeaderNetID = events[e].eventLeader.netID;

        // get list of attendees
        let attendees = events[e].attendees;
        let waitlist = events[e].waitlist;
        let recipients = [];
        attendees.forEach(function(p) {
            if (p.netID !== eventLeaderNetID) {
                let r = p.netID + '@cornell.edu';
                recipients.push(r);
            }
        });
        if (waitlist.length > 0) {
            waitlist.forEach(function(p) {
                let r = p.netID + '@cornell.edu';
                recipients.push(r);
            });
        }

        // send email reminder
        var twoReminderHtml =
            '<p>Hello,<br /><br />This a friendly reminder that you signed up for the Bethe House event, ' +
            eventName +
            ', happening today, ' +
            eventDate +
            ' at ' +
            eventStartTime +
            ' - ' +
            eventEndTime +
            ', ' +
            eventLocation +
            '. <br /><br />';
        // if event isn't full
        if (attendees.length < events[e].maxCapacity) {
            twoReminderHtml += 'If you have a friend who would like to join there is currently at least one open space on the sign-up sheet. We would be happy to have the spot filled.<br /><br />';
        }
        // if event is full with no one on the waitlist
        if (attendees.length == events[e].maxCapacity && waitlist.length == 0) {
            twoReminderHtml += 'This event is currently full. If you can no longer attend please remove your name from the event roster online.<br /><br />';
        }
        // if event is full with people on the waitlist
        if (attendees.length == events[e].maxCapacity && waitlist.length > 0) {
            twoReminderHtml += 'This event is currently full with a waitlist. We have included folks on the waitlist on this email.<br /><br />';
            twoReminderHtml += 'If you can no longer attend please remove your name from the event roster online. If you are on the waitlist your name is included below in the order you appear on the waitlist.<br /><br />Waitlist:<br />';
            // get waitlist for event
            // for each person on waitlist
            waitlist.forEach(function(p) {
                twoReminderHtml += p.first_name + ' ' + p.last_name;
                twoReminderHtml += '<br />';
            });
        }
        twoReminderHtml += '--<br />Thanks,<br />Bethe House Office Staff<br />607-255-7210<br />bethehouseoffice@gmail.com</p>';

        // create mail options
        const twoReminderMailOptions = {
            from: 'Bethe OPS <betheops@gmail.com>',
            to: recipients.join(', '),
            cc: eventLeaderNetID + '@cornell.edu',
            subject: 'Event reminder two hours - ' + eventName,
            html: twoReminderHtml
        }

        // send reminder
        transporter.sendMail(twoReminderMailOptions, function(err, info) {
            if (err) {
                console.log('Sending two hour reminder failed: ' + err);
            } else {
                console.log('Sent two hour reminder');
            }

            twoReminderMailOptions.transport.close();
        })
    }
}

module.exports = { 
    sendSignUp, 
    sendAddAttendee, 
    sendRemoveAttendee, 
    sendWaitlistAttendee, 
    oneDayReminder, 
    twoHourReminder
};
