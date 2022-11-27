today = new Date();
currentMonth = today.getMonth();
currentYear = today.getFullYear();
currentDate = today.getDate();
currentDay = today.getDay();

// what is currently displayed, not the actual current month/year/date
displayedMonth = currentMonth;
displayedYear = currentYear;
displayedDate = currentDate;

monthAndYear = document.getElementById('month-year');

months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

datePos = {}; //Object holding the positions of anchors for sidebar scrolling

// insert dates of actual current week
showCurrentWeek();

$(document).ready(function() {
    /**
     * Changes the background color and text color of the currently selected date button to blue and white, respectively.
     */
    $('.date-button').on('click', function() {
        // unselect previously selected date
        $('.selectedDate').removeClass('selectedDate').addClass('unselectedDate');
        // select new date
        $(this).addClass('selectedDate').removeClass('unselectedDate');
    });

    /**
     * Changes the background color and text color of the date button hovered over to blue and white, respectively.
     */
    $('.date-button').hover(
        function() { // mousein
            // temporary change color of date button
            $(this).css('background-color', '#053a91');
            $(this).css('color', '#fff');
        },
        function () { // mouseout
            // revert back to normal
            $(this).removeAttr('style');
        }
    );

    /**
     * Jumps to the corresponding date's event posters section in the sidebar when a date is clicked on in the calendar
     * header.
     * Sources: 
     *  - https://www.w3schools.com/howto/howto_css_smooth_scroll.asp#section1 
     */
   
    $('.dates a').on('click', function(event) {
        // Check if positions need to be updated
        updateDatePos(0);

        // Prevent default anchor click behavior
        event.preventDefault();

        // Store hash
        var hash = this.hash;

        // Using jQuery's animate() method to add smooth page scroll
        // The optional number (800) specifies the number of milliseconds it takes to scroll to the specified area
        $('#sidebar').animate({
            scrollTop: (datePos[hash] - 135) + 'px'
        }, 800);
    });

    /**
     * Stores the positions of each date button in case the user scrolls before clicking a date button.
     */
    $('#sidebar').on('scroll', function(event) {
        // Check if positions need to be updated
        updateDatePos($('#sidebar').scrollTop());
    });

    
});

/**
 * Checks if datePos is empty. If it's empty, the positions of the dates need to be re-filled.
 * datePos is a global [Object] structured like a dictionary:
 *  - [key] is a string in the format [#sidebar-event-date-<i>] corresponding to an anchor where
 *    i is a number in the range 1..7.
 *  - [value] is a number representing the position of the anchor.
 * Requires:
 *  - [offset] designates the amount of pixels to offset the stored positions by.
 */
function updateDatePos(offset) {
    if (Object.keys(datePos).length == 0) { // need to refill positions
        // store positions of dates
        for (let i = 1; i <= 7; i++) {
            datePos['#sidebar-event-date-' + i] = $('#sidebar-event-date-' + i).position().top + offset;
        }
    }
}

/**
 * Changes the chevron clicked on, [chevron], in the calendar header to blue for 0.05 seconds.
 * Requires:
 *  - [chevron] is a String with value 'left' (left chevron) or 'right' (right chevron).
 */
function changeChevron(chevron) {
    let element = document.getElementById(chevron + '-chevron');
    // store old chevron image src
    let oldSrc = element.src;
    // change chevron to blue chevron
    element.src = '/images/chevrons/' + chevron + '-arrow-chevron-blue.png';
    // after 0.05 second, change it back
    setTimeout(function() {
        element.src = oldSrc;
    }, 50);
}

/**
 * Changes the chevron hovered over, [chevron], in the calendar header to blue.
 * Requires:
 *  - [chevron] is a String with value 'left' (left chevron) or 'right' (right chevron).
 */
function blueChevron(chevron) {
    let element = document.getElementById(chevron + '-chevron');
    // change chevron to blue chevron
    element.src = '/images/chevrons/' + chevron + '-arrow-chevron-blue.png';
}

/**
 * Changes the chevron hovered over, [chevron], in the calendar header to white (default color).
 * Requires:
 *  - [chevron] is a String with value 'left' (left chevron) or 'right' (right chevron).
 */
function whiteChevron(chevron) {
    let element = document.getElementById(chevron + '-chevron');
    // change chevron to white chevron
    element.src = '/images/chevrons/' + chevron + '-arrow-chevron.png';
}

/**
 * Calculates and displays the dates of the current week, starting from Monday and ending on Sunday, in the calendar
 * header and in the event posters section below the calendar header.
 */
function showCurrentWeek() {
    // remove the "selectedDate" class for the previously selected date
    $(".selectedDate").removeClass("selectedDate").addClass("unselectedDate");
    // set current date's background color and text color to blue and white, respectively
    $('#date-' + (currentDay == 0 ? 7 : currentDay)).removeClass("unselectedDate").addClass("selectedDate");

    let currCalendar;
    let currEventPoster;

    for (let i = 0; i < 7; i++) {
        let d = getNextDay(i);
        let date = d.getDate();

        currCalendar = document.getElementById('date-' + (i + 1));
        currCalendar.innerHTML = date;

        currEventPoster = document.getElementById('sidebar-event-date-' + (i + 1));
        currEventPoster.innerHTML = days[i] + ', ' + months[d.getMonth()] + ' ' + date;
    }

    monthAndYear.innerHTML = months[displayedMonth] + ' ' + displayedYear;
}

/**
 * Returns the date (Date object) given a certain day of the week, [day], of the current week.
 * Requires:
 *  - [day] is a valid day in 1..7.
 */
function getNextDay(day) {
    let monday = new Date(displayedYear, displayedMonth);
    let d = today;

    monday.setDate(currentDate + ((1 - currentDay) % 7));
    d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + day);

    return d;
}

/**
 * Calculates and displays the dates of the previous week, starting from Monday and ending on Sunday, in the calendar
 * header and in the event posters section below the calendar header. The previous week is computed with respect to
 * the week that is currently displayed (not necessarily the current week). Displays the event posters for the
 * previous week as well given events, [events], event attendees, [attendees], and information on the current user logged in, [userProfile].
 * Requires:
 *  - [events] is a valid Object in which events are indexed by the date first and then the
 *    event name. The resulting value is an Object containing the event's ID, date, time,
 *    location, description, leader, max capacity, poster image path, whether the event's
 *    attendees list is hidden, and any other event details.
 *  - [attendees] is a valid Object of arrays in which each array represents the attendees of
 *    an event and contains Objects that each represent an attendee for the event.
 *  - [userProfile] is a valid Object containing the user's name, net ID, and user type at
 *    minimum.
 */
function showPreviousWeek(events, attendees, userProfile, eventLeaders) {
    // Remove the "selectedDate" class for the previously selected date
    $(".selectedDate").removeClass("selectedDate").addClass("unselectedDate");
    // set Monday's background color and text color to blue and white, respectively
    $("#date-1").removeClass("unselectedDate").addClass("selectedDate");

    let currCalendar;
    let currEventPoster;
    let oldDisplayedDate = displayedDate;

    for (let i = 1; i <= 7; i++) {
        let d = getPreviousWeekDay(i);
        let date = d.getDate();

        currCalendar = document.getElementById('date-' + i);
        currCalendar.innerHTML = date;

        currEventPoster = document.getElementById('sidebar-event-date-' + i);
        currEventPoster.innerHTML = days[i - 1] + ', ' + months[d.getMonth()] + ' ' + date;
    }

    displayedDate = getPreviousWeekDay(currentDay).getDate();
    let newDisplayedDate = displayedDate;

    if (newDisplayedDate > oldDisplayedDate) {
        displayedYear = displayedMonth == 0 ? displayedYear - 1 : displayedYear;
        displayedMonth = displayedMonth == 0 ? 11 : displayedMonth - 1;
    }

    loadEventPosters(events, attendees, userProfile, eventLeaders);

    monthAndYear.innerHTML = months[displayedMonth] + ' ' + displayedYear;
}

/**
 * Returns the date (Date object) given a certain day of the week, [day], of the previous week with respect to the week currently displayed.
 * Requires:
 *  - [day] is a valid day in 1..7.
 * Sources:
 *  - https://stackoverflow.com/questions/35088088/javascript-for-getting-the-previous-monday
 */
function getPreviousWeekDay(day) {
    let prevMonday = new Date(displayedYear, displayedMonth);

    if (currentDay == 1) {
        prevMonday.setDate(displayedDate - 7);
    } else {
        prevMonday.setDate(displayedDate - 7 - currentDay + 1);
    }

    let d = new Date(prevMonday.getFullYear(), prevMonday.getMonth(), prevMonday.getDate() + day - 1);

    return d;
}

/**
 * Calculates and displays the dates of the next week, starting from Monday and ending on Sunday, in the calendar
 * header and in the event posters section below the calendar header. The next week is computed with repesect
 * to the week that is currently displayed (not necessarily the current week). Displays the event posters for the
 * next week as well given events, [events], event attendees, [attendees], and information on the current user logged in, [userProfile].
 * Requires:
 *  - [events] is a valid Object in which events are indexed by the date first and then the
 *    event name. The resulting value is an Object containing the event's ID, date, time,
 *    location, description, leader, max capacity, poster image path, whether the event's
 *    attendees list is hidden, and any other event details.
 *  - [attendees] is a valid Object of arrays in which each array represents the attendees of
 *    an event and contains Objects that each represent an attendee for the event.
 *  - [userProfile] is a valid Object containing the user's name, net ID, and user type at
 *    minimum.
 */
function showNextWeek(events, attendees, userProfile, eventLeaders) {
    // Remove the "selectedDate" class for the previously selected date
    $(".selectedDate").removeClass("selectedDate").addClass("unselectedDate");
    // set Monday's background color and text color to blue and white, respectively
    $("#date-1").removeClass("unselectedDate").addClass("selectedDate");

    let currCalendar;
    let currEventPoster;
    let oldDisplayedDate = displayedDate;

    for (let i = 1; i <= 7; i++) {
        let d = getNextWeekDay(i);
        let date = d.getDate();

        currCalendar = document.getElementById('date-' + i);
        currCalendar.innerHTML = date;

        currEventPoster = document.getElementById('sidebar-event-date-' + i);
        currEventPoster.innerHTML = days[i - 1] + ', ' + months[d.getMonth()] + ' ' + date;
    }

    displayedDate = getNextWeekDay(currentDay).getDate();
    let newDisplayedDate = displayedDate;

    if (newDisplayedDate < oldDisplayedDate) {
        displayedYear = displayedMonth == 11 ? displayedYear + 1 : displayedYear;
        displayedMonth = displayedMonth == 11 ? 0 : displayedMonth + 1;
    }

    loadEventPosters(events, attendees, userProfile, eventLeaders);

    monthAndYear.innerHTML = months[displayedMonth] + ' ' + displayedYear;
}

/**
 * Returns the date (Date object) given a certain day of the week, [day], of the next week with respect to the week currently displayed.
 * Requires:
 *  - [day] is a valid day in 1..7.
 * Sources:
 *  - https://stackoverflow.com/questions/43582087/get-next-weeks-date-of-a-certain-day-in-javascript
 */
function getNextWeekDay(day) {
    let nextMonday = new Date(displayedYear, displayedMonth);

    if (currentDay == 1) {
        nextMonday.setDate(displayedDate + 7);
    } else {
        nextMonday.setDate(displayedDate + 7 - currentDay + 1);
    }

    let d = new Date(nextMonday.getFullYear(), nextMonday.getMonth(), nextMonday.getDate() + day - 1);

    return d;
}

/**
 * Loads the event posters for the currently displayed week in the sidebar given events,
 * [events]. Passes [events], event attendees, [attendees], and information on the current
 * user logged in, [userProfile], into selectEventPoster() to load content into the event
 * profile section accordingly.
 * Requires:
 *  - [events] is a valid Object in which events are indexed by the date first and then the
 *    event name. The resulting value is an Object containing the event's ID, date, time,
 *    location, description, leader, max capacity, poster image path, whether the event's
 *    attendees list is hidden, and any other event details.
 *  - [attendees] is a valid Object of arrays in which each array represents the attendees of
 *    an event and contains Objects that each represent an attendee for the event.
 *  - [userProfile] is a valid Object containing the user's name, net ID, and user type at
 *    minimum.
 */
function loadEventPosters(events, attendees, userProfile, eventLeaders) {
    for (let i = 1; i <= 7; i++) {
        $('#sidebar-event-posters-container-' + i).empty();

        let date = document.getElementById('sidebar-event-date-' + i).textContent;
        let d = date.substr(date.indexOf(' ') + 1) + ', ' + displayedYear;

        if (d in events) {
            let eventsArr = [];
            for (var title in events[d]) {
                events[d][title].name = title;
                eventsArr.push(events[d][title]);
            }
            // sort events happening on the same date by start time
            eventsArr.sort((a, b) => 
                (timeToSeconds(a.startTime) < timeToSeconds(b.startTime)) 
                ? -1 
                : ((timeToSeconds(a.startTime) > timeToSeconds(b.startTime)) ? 1 : 0)
            );

            let j = 1;
            eventsArr.forEach(function(event) {
                let eventTitle = event.name;
                let eventTime = event.startTime + ' - ' + event.endTime;
                let eventPoster = event.poster;

                $('#sidebar-event-posters-container-' + i).append(
                    '<div class="sidebar-event-poster-text-container" tabindex="-1" onclick="selectEventPoster(this, events, attendees, userProfile, eventLeaders, ' +
                    i +
                    ', ' +
                    j +
                    ');"><div class="sidebar-poster-container"><img class="sidebar-poster" src="' +
                    eventPoster +
                    '" /></div><div class="sidebar-poster-text-container"><div class="sidebar-poster-event-title" id="sidebar-poster-event-title-' +
                    i +
                    '-' +
                    j +
                    '">' +
                    eventTitle +
                    '</div><div class="sidebar-poster-event-time">' +
                    eventTime +
                    '</div></div></div>'
                );

                j += 1;
            });
        }
    }

    // Adds hover functionality to posters. This changes the background color of the div to dark gray when hovering over an event.
    $('.sidebar-event-poster-text-container').hover(
        function() { // on hover
            // temporary change color of div background
            $(this).css('background-color', '#e4e4e4');
        },
        function() { // mouseout
            // revert back to normal
            $(this).removeAttr('style');
        }
    )

    // Reset datePos to ensure that positions are fresh
    datePos = {};
    // Reset position of calendar to ensure that positions are correct
    $('#sidebar').scrollTop(0);
}

/** 
 * Converts a time string, [time], to seconds.
 * Requires:
 *  - [time] is a string with the format "HH:MM <AM|PM>".
 * Sources:
 *  - https://stackoverflow.com/questions/43496702/how-to-compare-two-time-values-in-all-formats-using-js
 */ 
function timeToSeconds(time) {
    const timeString = convertTimeStringTo24Hours(time);
    const timeExp = timeString.match(/(\d{2})\:(\d{2})(AM|PM)*/);

    return (parseInt(timeExp[1]) * 60) + (parseInt(timeExp[2])) + (timeExp[3] === 'PM' ? 12 * 60 : 0);
}

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
 * Changes the background color of the currently selected event poster tab, [selected],
 * in the sidebar. Updates the event profile section with the information of the selected 
 * event given the events, [events], event attendees, [attendees], the date ID, [i], and 
 * the event ID occurring on [i], [j]. Disables the signup button for the selected event 
 * if the current user logged in with information, [userProfile] has already signed up for 
 * the event.
 * Requires:
 *  - [selected] is "this" -- the object belong to the selected event poster tab element.
 *  - [events] is a valid Object in which events are indexed by the date first and then the
 *    event name. The resulting value is an Object containing the event's ID, date, time,
 *    location, description, leader, max capacity, poster image path, whether the event's
 *    attendees list is hidden, and any other event details.
 *  - [attendees] is a valid Object of arrays in which each array represents the attendees of
 *    an event and contains Objects that each represent an attendee for the event.
 *  - [userProfile] is a valid Object containing the user's name, net ID, and user type at
 *    minimum.
 *  - [i] is a valid date identifier in 1..7.
 *  - [j] is a valid date-event identifier 1..n where n is the number of events occuring on
 *    date [i] and is >= 1.
 */
function selectEventPoster(selected, events, attendees, userProfile, eventLeaders, i, j) {
    // Change the background of the selected event
    if ($('.selectedEvent').length > 0) {
        $('.selectedEvent').removeClass('selectedEvent');
    }    
    $(selected).addClass("selectedEvent");

    // Shift event profile to the top
    $('html, body').scrollTop(0);

    let date = document.getElementById('sidebar-event-date-' + i).textContent;
    let d = date.substr(date.indexOf(' ') + 1) + ', ' + displayedYear;

    let title = document.getElementById('sidebar-poster-event-title-' + i + '-' + j).textContent;

    if (document.getElementById('eventprofile').style.display === 'none') {
        document.getElementById('eventprofile').style.display = 'block';
        document.getElementById('featuredevent').style.display = 'none';
    }
    
    if (d in events) {
        // load event profile
        document.getElementById('eventdate').innerHTML =
            '<span id="date">' +
            d +
            '</span>' +
            '<span style="color: #afafaf"> from </span>' +
            events[d][title]['startTime'] +
            ' - ' +
            events[d][title]['endTime'];
        document.getElementById('eventtitle').innerHTML = title;
        document.getElementById('eventlocation').innerHTML =
            events[d][title]['location'];
        document.getElementById('eventGRF').innerHTML =
            'GRF ' +
            events[d][title]['eventLeader']['name'] +
            ' (' +
            events[d][title]['eventLeader']['netID'] +
            '@cornell.edu)';
        document.getElementById('eventdescription').innerHTML =
            events[d][title]['description'];
        document.getElementById('sampleposter').src = events[d][title]['poster'];
        document.getElementById('eventdetails').innerHTML =
            '<p>' + '<b>Additional Details:</b> ' + events[d][title]['other'] + '</p>';

        // insert the event ID into its appropriate forms
        if (userProfile.type !== 0) {
            document.getElementById('editEventId').value = events[d][title]['id'];  // "Edit Event"
            document.getElementById('deleteEventId').value = events[d][title]['id'];  // "Delete Event"
            document.getElementById('addAttendeeEventId').value = events[d][title]['id'];  // "Add Attendee"
        }
        document.getElementById('eventId').value = events[d][title]['id'];  // "Sign Up"
        document.getElementById('removeAttendeeEventId').value = events[d][title]['id'];  // Removal from the attendees list and waitlist

        // disable signup button if student already signed up for selected event or the event date has passed
        let eventAttendees = [];
        attendees[title].forEach(function(i) {
            eventAttendees.push(i.netID);
        });
        let signUpButton = document.getElementById('signupbutton');
        dateFormat = d + ' ' + convertTimeStringTo24Hours(events[d][title]['startTime']);
        let eventDateFormatted = new Date(dateFormat);

        if (eventAttendees.includes(userProfile.netID) || (today > eventDateFormatted)) {
            signUpButton.setAttribute('disabled', 'disabled');
        } else {
            signUpButton.removeAttribute('disabled');
        }

        // load the event attendees
        loadEventAttendees(events[d][title], attendees[title], userProfile);

        if (userProfile.type !== 0) {
            // auto-fill "Edit Event" form for event
            autoFillEditEvent(title, events[d][title]);
            // fill event leader dropdown for "Edit Event" form
            fillEditEventLeaders(events[d][title]['eventLeader'], eventLeaders);
        }
    }
}

/**
 * Loads the event attendees list and the waistlist for the event, [event], given the event's
 * attendees, [attendees], and information on the current user logged in, [userProfile].
 * Requires:
 *  - [event] is a valid Object containing the event's ID, date, time, location, description, 
 *    leader, max capacity, poster image path, whether the event's attendees list is hidden,
 *    and any other event details.
 *  - [attendees] is a valid Object of arrays in which each array represents the attendees of
 *    an event and contains Objects that each represent an attendee for the event.
 *  - [userProfile] is a valid Object containing the user's name, net ID, and user type at
 *    minimum.
 */
function loadEventAttendees(event, attendees, userProfile) {
    if (userProfile.type === 0) {
        $('#dashboard-students').empty();

        if (event.isHidden == 1) {
            $('#dashboard-students').append('<p style="color: #777777"><i>The sign-up list is hidden for this event. If you need to cancel your sign-up, please email the event leader.<i></p>');
        } else {
            const studentNetId = userProfile.netID;

            for (let i = 0; i < event['maxCapacity']; i++) {
                // set to empty strings if displaying an empty slot
                let attendeeName = (i >= attendees.length) ? '' : attendees[i].name;
                let attendeeNetID = (i >= attendees.length) ? '' : attendees[i].netID;

                if (attendeeNetID !== studentNetId) {
                    let html;
                    if (attendeeName == null || attendeeName === '') {
                        html = '<tr><td id="dRemove"><a style="color: red; display: none;" class="waves-effect waves-light modal-trigger" href="#removestudent"><i class="material-icons" style="display: inline-flex; vertical-align: top;">clear</i></a></td><td id="dNumber">' +
                            (i + 1) +
                            '</td><td id="dName">' +
                            '<p style="margin: 0; padding: 0; color: #ccc;"><i>Available to sign up</i></p>' + 
                            '</td>';
                    } else {
                        html = '<tr><td id="dRemove"><a style="color: red; display: none;" class="waves-effect waves-light modal-trigger" href="#removestudent"><i class="material-icons" style="display: inline-flex; vertical-align: top;">clear</i></a></td><td id="dNumber">' +
                            (i + 1) +
                            '</td><td id="dName">' +
                            attendeeName + 
                            '</td>';
                    }
                    
                    if (attendeeNetID !== null && attendeeNetID !== '') {
                        html = html + '<td id="dNetid">(' + attendeeNetID + ')</td>';
                    }

                    html += '</tr>';
                    $('#dashboard-students').append(html);
                } else {
                    if (attendeeName == null || attendeeNetID == null) {
                        attendeeName = '';
                        attendeeNetID = '';
                    }

                    $('#dashboard-students').append(
                        '<tr><td id="dRemove"><a style="color: red;" class="waves-effect waves-light modal-trigger" id="' +
                        attendeeName +
                        '" ' +
                        'onclick="removeName(this, ' +
                        attendees[i].id +
                        ', ' +
                        userProfile.type +
                        ')"' +
                        ' href="#removestudent"><i class="material-icons" style="display: inline-flex; vertical-align: top;">clear</i></a></td><td id="dNumber">' +
                        (i + 1) +
                        '</td><td id="dName">' +
                        attendeeName + 
                        '</td><td id="dNetid">(' +
                        attendeeNetID +
                        ')</td></tr>'
                    );
                }
            }

            // add waitlist
            $('#dashboard-students').append('<tr><td style="background-color: #DDEDFF; margin: 0; color: rgb(8, 61, 145);"><p class="col s10" style="width: 70%; margin: 0; font-weight: normal; font-size: 21px;">Waitlist</p></td></tr>');

            // check if there are any people on the waitlist; if so, display people on waitlist
            if (attendees.length > event['maxCapacity']) {
                for (let j = event['maxCapacity']; j < attendees.length; j++) {
                    if (attendees[j].netID !== studentNetId) {
                        $('#dashboard-students').append(
                            '<tr><td id="dRemove"><a style="color: red; display: none;" class="waves-effect waves-light modal-trigger" href="#removestudent"><i class="material-icons" style="display: inline-flex; vertical-align: top;">clear</i></a></td><td id="dNumber">' +
                            (j + 1) +
                            '</td><td id="dName">' +
                            attendees[j].name +
                            '</td><td id="dNetid">(' +
                            attendees[j].netID +
                            ')</td></tr>'
                        );
                    } else {
                        $('#dashboard-students').append(
                            '<tr><td id="dRemove"><a style="color: red;" class="waves-effect waves-light modal-trigger" href="#removestudent" id="' +
                            attendees[j].name +
                            '" ' +
                            'onclick="removeName(this, ' +
                            attendees[j].id +
                            ', ' +
                            userProfile.type +
                            ')"' +
                            '><i class="material-icons" style="display: inline-flex; vertical-align: top;">clear</i></a></td><td id="dNumber">' +
                            (j + 1) +
                            '</td><td id="dName">' +
                            attendees[j].name +
                            '</td><td id="dNetid">(' +
                            attendees[j].netID +
                            ')</td></tr>'
                        );
                    }
                }
            } else {
                $('#dashboard-students').append('<tr><td style="color: #ccc; padding-left: 50px;"><i>Waitlist currently empty<i></td></tr>');
            }
        }
    } else {
        $('#dashboard-eventleader').empty();

        for (let i = 0; i < event['maxCapacity']; i++) {
            // set to empty strings if displaying an empty slot
            let attendeeName = (i >= attendees.length) ? '' : attendees[i].name;
            let attendeeNetID = (i >= attendees.length) ? '' : attendees[i].netID;
            let attendeeBuilding = (i >= attendees.length) ? '' : attendees[i].building;
            let html;

            if (attendeeName != null && attendeeName !== '') {
                html = '<tr><td id="dRemove"><a style="color: red;" class="waves-effect waves-light modal-trigger"' +
                    'id="' + attendeeName + '"' + 
                    ' href="#removestudent" ' +
                    'onclick="removeName(this, ' +
                    attendees[i].id +
                    ', ' +
                    userProfile.type +
                    ')"' +
                    '><i class="material-icons" style="display: inline-flex; vertical-align: top;">clear</i></a></td><td id="dNumber">' +
                    (i + 1) +
                    '</td><td id="dName">' +
                    attendeeName +
                    '</td>';
            } else {
                html = '<tr><td id="dRemove"><a style="color: red; display: none;" class="waves-effect waves-light modal-trigger" href="#removestudent" ' + 
                    '><i class="material-icons" style="display: inline-flex; vertical-align: top;">clear</i></a></td><td id="dNumber">' +
                    (i + 1) +
                    '</td><td id="dName">' +
                    '<p style="margin: 0; padding: 0; color: #ccc;"><i>Available to sign up</i></p>' + 
                    '</td>';
            } 
            
            if (attendeeNetID != null && attendeeNetID !== '') {
                html = html + '<td id="dNetid">(' + attendeeNetID + ')</td>';
            }

            if (attendeeBuilding != null && attendeeBuilding !== '') {
                html = html +
                    '<td id="dHome"><i class="material-icons" style="display: inline-flex; vertical-align: top;">home</i>' +
                    attendeeBuilding +
                    '</td>';
            }

            html += '</tr>';
            $('#dashboard-eventleader').append(html);
        }

        // add waitlist
        $('#dashboard-eventleader').append('<tr><td style="background-color: #DDEDFF; margin: 0; color: rgb(8, 61, 145);"><p class="col s10" style="width: 70%; margin: 0; font-weight: normal; font-size: 21px;">Waitlist</p></td></tr>');

        // check if there are any people on the waitlist; if so, display people on waitlist
        if (attendees.length > event['maxCapacity']) {
            for (let j = event['maxCapacity']; j < attendees.length; j++) {
                $('#dashboard-eventleader').append(
                    '<tr><td id="dRemove"><a style="color: red;" class="waves-effect waves-light modal-trigger" href="#removestudent" id="' +
                    attendees[j].name +
                    '" ' +
                    'onclick="removeName(this, ' +
                    attendees[j].id +
                    ', ' +
                    userProfile.type +
                    ')"' +
                    '><i class="material-icons" style="display: inline-flex; vertical-align: top;">clear</i></a></td><td id="dNumber">' +
                    (j + 1) +
                    '</td><td id="dName">' +
                    attendees[j].name +
                    '</td><td id="dNetid">(' +
                    attendees[j].netID +
                    ')</td><td id="dHome"><i class="material-icons" style="display: inline-flex; vertical-align: top;">home</i>' +
                    attendees[j].building +
                    '</td></tr>'
                );
            }
        } else {
            $('#dashboard-eventleader').append('<tr><td style="color: #ccc; padding-left: 50px;"><i>Waitlist currently empty<i></td></tr>');
        }
    }
}

/**
 * Auto-fills the fields of the "Edit Event" form for the event, [eventName], given the event's 
 * information, [eventInfo].
 * Requires:
 *  - [eventName] is a valid String.
 *  - [eventInfo] is a valid Object containing the event's ID, date, time, location, description, 
 *    leader, max capacity, poster image path, whether the event's attendees list is hidden, and
 *    any other event details.
 */
function autoFillEditEvent(eventName, eventInfo) {
    let date = eventInfo.date;
    let yyyy = date.substring(date.length - 4);
    let mm = date.substring(0, date.indexOf('/'));
    if (mm.length === 1) {
        mm = '0' + mm;
    }
    let firstSlashIndex = date.indexOf('/');
    let dd = date.substring(firstSlashIndex + 1, date.indexOf('/', firstSlashIndex + 1));
    if (dd.length === 1) {
        dd = '0' + dd;
    }
    let eventDate = yyyy + '-' + mm + '-' + dd;

    document.getElementById('edit_event_name').value = eventName;
    document.getElementById('edit_location').value = eventInfo.location;
    document.getElementById('editcreatedate').value = eventDate;
    document.getElementById('editcreatestart').value = eventInfo.startTime;
    document.getElementById('editcreateend').value = eventInfo.endTime;
    document.getElementById('editattendeequota').value = eventInfo.maxCapacity;
    document.getElementById('editeventdescr').value = eventInfo.description;
    // check if the textarea needs to be focused ahead of time
    if (eventInfo.other != '') {
        document.getElementById('otherlabel').className = 'active';
    }
    else {
        $('#otherlabel').removeClass('active'); // ensures not focused; use jquery for cross browser support
    }
    document.getElementById('editspecialdescr').value = eventInfo.other;
    if (eventInfo.poster != null && eventInfo.poster != undefined) {
        // '/images/posters/' are the first 16 characters of the poster file name
        document.getElementById('editposterfilename').value = (eventInfo.poster).substring(16);
    }
    document.getElementById('edithidden').checked = eventInfo.isHidden ? true : false;
}

/**
 * Fills the dropdown with event leaders, [eventLeaders], currently in the system in the "Please
 * choose event leader name" field of the "Edit Event" form.
 * Requires:
 *  - [eventLeaders] is a valid Object with the net ID as the key and an Object with information
 *    such as the event leader's name.
 */
function fillEditEventLeaders(currEventLeader, eventLeaders) {
    $(document).ready(function() {
        $('.event-leader-select').formSelect();

        let options = {};
        for (let netID in eventLeaders) {
            options[netID] = eventLeaders[netID].name + ' (' + netID + ')';
        }

        let optionsHtml = '';
        optionsHtml += '<option selected value="' + currEventLeader.name + ' (' + currEventLeader.netID + ')' + '">' + currEventLeader.name + ' (' + currEventLeader.netID + ')' + '</option>';
        $.each(options, function(key, value) {
            if (key !== currEventLeader.netID) {
                optionsHtml += '<option value="' + value + '">' + value + '</option>';
            }
        });

        $('.event-leader-select').empty();
        $('.event-leader-select').append(optionsHtml);
        $('.event-leader-select').formSelect();
    });
}
