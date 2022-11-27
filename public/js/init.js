/**
 * Inserts the earliest event occurring starting from today's date as the featured event
 * given events currently in the system, [events]. If there are no events happening within
 * the next two weeks, "No featured event at this time." is inserted instead.
 * Requires:
 *  - [events] is a valid Object in which events are indexed by the date first and then the
 *    event name. The resulting value is an Object containing the event's ID, date, time,
 *    location, description, leader, max capacity, poster image path, whether the event's
 *    attendees list is hidden, and any other event details.
 */
function insertFeaturedEvent(events) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    let d = new Date();
    let month = d.getMonth();
    let date = d.getDate();
    let year = d.getFullYear();
    let eventTitle;
    let eventDate;
    let eventDescription;
    let eventPoster;

    let i = 1;
    while (events[months[month] + ' ' + date + ', ' + year] === undefined) {
        let newD = new Date();
        newD.setDate(date + 1);
        month = newD.getMonth();
        date = newD.getDate();
        year = newD.getFullYear();

        i++;
        // no events happening within next two weeks
        if (i == 14) {
            break;
        }
    }

    if (i < 14) {
        let fullDate = months[month] + ' ' + (date) + ', ' + year;

        let eventsArr = [];
        // console.log(fullDate);
        for (var title in events[fullDate]) {
            events[fullDate][title].name = title;
            eventsArr.push(events[fullDate][title]);
        }
        // sort events happening on the same date by start time
        eventsArr.sort((a, b) => 
            (timeToSeconds(a.startTime) < timeToSeconds(b.startTime)) 
            ? -1 
            : ((timeToSeconds(a.startTime) > timeToSeconds(b.startTime)) ? 1 : 0)
        );
        eventTitle = eventsArr[0].name;
        eventDate = fullDate + ' | ' + eventsArr[0].startTime +  ' - ' + eventsArr[0].endTime;
        eventDescription = eventsArr[0].description;
        eventPoster = eventsArr[0].poster;

        document.getElementById('featuredTitle').innerHTML = eventTitle;
        document.getElementById('featuredDate').innerHTML = eventDate;
        document.getElementById('featuredDescr').innerHTML = eventDescription;
        document.getElementById('featuredeventposter').src = eventPoster;
    } else {
        document.getElementById('featuredTitle').innerHTML = 'No featured event at this time.';
    }
}

/** 
 * Converts a time string, [time], to seconds.
 * Requires:
 *  - [time] is a string with the format "HH:MM <AM|PM>".
 * Sources:
 *  - https://stackoverflow.com/questions/43496702/how-to-compare-two-time-values-in-all-formats-using-js
 */ 
function timeToSeconds(time) {
    const timeExp = time.match(/(\d{2})\:(\d{2})(AM|PM)*/);

    return (parseInt(timeExp[1]) * 60) + (parseInt(timeExp[2])) + (timeExp[3] === 'PM' ? 12 * 60 : 0);
}

/**
 * Removes the attendee selected to be removed from an event attendees list given the "this"
 * Object that provides the attendee's name, [name], and the ID of the attendee, [id].
 * Requires:
 *  - [name] is a "this" Object associated with the HTML element whose id is set to the
 *    attendee's name.
 *  - [id] is a unique number assigned to and used to identify the attendee.
 */
function removeName(name, id, type) {
    document.getElementById('removestudentdesc').innerHTML = 'Are you sure you want to remove <b>' + name.id + '</b>?';
    if (type !== 0) {
        document.getElementById('removestudentnote').innerHTML = '<span style="font-weight: bold">Note:</span> An email notification will be sent to <b>' + name.id +  '.</b>';
    }
    document.getElementById('removeAttendeePersonId').value = id;
}

/**
 * Removes the user currently in the system with name and net ID, [name], under the authority of an
 * event leader user or admin user.
 * Requires:
 *  - [name] is a string  with the format "FirstName LastName (NetID)" representing the name of the
 *    user selected from the system to be removed.
 */
function removeAdminName(name) {
    document.getElementById('deletedesc').innerHTML = 'Are you sure you want to remove <b>' + name + '</b>?';
    // insert the net ID of the user being removed in the confirmation modal for user removal
    document.getElementById('removeUserNetId').value = name.substring(name.indexOf('(') + 1, name.indexOf(')'));
}

/**
 * Fills the event leader dropdown of the "Create Event" form under "Administration Actions"
 * given the event leaders currently in the system, [eventLeaders].
 * Requires:
 *  - [eventLeaders] is a valid Object with the net ID as the key and an Object with information
 *    such as the event leader's name.
 */
function fillEventLeaders(eventLeaders) {
    $(document).ready(function() {
        $('.event-leader-select').formSelect();

        let options = {};
        for (let netID in eventLeaders) {
            options[netID] = eventLeaders[netID].name + ' (' + netID + ')';
        }

        let optionsHtml = '';
        $.each(options, function(key, value) {
            optionsHtml += '<option value="' + value + '">' + value + '</option>';
        });

        $('.event-leader-select').empty();
        $('.event-leader-select').append(optionsHtml);
        $('.event-leader-select').formSelect();
    });
}

/**
 * Loads the appropriate users currently in the system to auto-fill the fields of the following
 * forms: "Remove Student", "Remove User", and "Add Attendee".
 * Requires:
 *  - [users] is a valid Object that contains other Objects that each represent a user in the
 *    system.The Objects are indexed by the users' net IDs, and each Object contains the user's
 *    name and type.
 */
function autoFillUsers(users) {
    let dataAll = {};
    let dataAllExceptDean = {};
    let dataStudents = {};

    for (var netID in users) {
        let key = users[netID].name + ' (' + netID + ')';
        dataAll[key] = null;
    }
    for (var netID in users) {
        if (users[netID].type != 3) {
            let key = users[netID].name + ' (' + netID + ')';
            dataAllExceptDean[key] = null;
        }
    }
    for (var netID in users) {
        if (users[netID].type == 0) {
            let key = users[netID].name + ' (' + netID + ')';
            dataStudents[key] = null;
        }
    }

    // load all users for "Add Attendee" (event leader and admin) field
    $('input.autoAllUsers').autocomplete({
        data: dataAll,
        minLength: 1,
        limit: 3
    });

    // load all users except the house assistant dean for "Remove User" (admin) field
    $('input.autoAllExceptDean').autocomplete({
        data: dataAllExceptDean,
        minLength: 1
    });

    // load all students for "Remove Student" (event leader) field
    $('input.autoAllStudents').autocomplete({
        data: dataStudents,
        minLength: 1
    });
}

/**
 * Initializes the following elements styled by Materialize CSS as instructed by Materialize
 * CSS:
 *  - modal
 *  - sidenav
 *  - timepicker
 *  - datepicker
 *  - select
 * Explanation of Materialize initialization for select element:
 *  - https://materializecss.com/select.html
 */
$(document).ready(function() {
    $('.modal').modal();
    $('.sidenav').sidenav();
    $('.timepicker').timepicker({
        container: 'body'
    });
    $('.datepicker').datepicker({
        container: 'body'
    });
    $('select').formSelect();
});

/**
 * Displays dropdown below the button.
 */
$('.dropdown-trigger').dropdown({
    coverTrigger: false
});

$('select[required]').css({
    display: 'block',
    height: 0,
    padding: 0,
    width: 0,
    position: 'absolute'
});
