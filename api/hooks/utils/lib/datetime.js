'use strict';

/**
 * @class sails.hooks.utils.datetime
 *
 * Date/Time utility methods.
 */

/**
 * Module dependencies
 */
const moment = require('moment');

const TIME_INTERVAL = {
    YEARS: 'y',
    MONTHS: 'M',
    WEEKS: 'w',
    DAYS: 'd',
    HOURS: 'h',
    MINUTES: 'm',
    SECONDS: 's',
    MILLISECONDS: 'ms'
};

function addTimeInterval(date, interval, amount) {
    return moment(new Date(date)).add(amount, interval).toDate();
};

module.exports = {

    /**
     * Add years to a passed date
     *
     * @param {Date} A date object
     * @param {Number} number of years
     *
     * @return {Date} A date object
     */
    addYears: function(date, years) {
        return addTimeInterval(date, TIME_INTERVAL.YEARS, years);
    },

    /**
     * Subtract years from a passed date
     *
     * @param {Date} A date object
     * @param {Number} number of years
     *
     * @return {Date} A date object
     */
    subtractYears: function(date, years) {
        return addTimeInterval(date, TIME_INTERVAL.YEARS, -years);
    },

    /**
     * Add months to a passed date
     *
     * @param {Date} A date object
     * @param {Number} number of months
     *
     * @return {Date} A date object
     */
    addMonths: function(date, months) {
        return addTimeInterval(date, TIME_INTERVAL.MONTHS, months);
    },

    /**
     * Subtract months from a passed date
     *
     * @param {Date} A date object
     * @param {Number} number of months
     *
     * @return {Date} A date object
     */
    subtractMonths: function(date, months) {
        return addTimeInterval(date, TIME_INTERVAL.MONTHS, -months);
    },

    /**
     * Add days to a passed date
     *
     * @param {Date} A date object
     * @param {Number} number of days
     *
     * @return {Date} A date object
     */
    addDays: function(date, days) {
        return addTimeInterval(date, TIME_INTERVAL.DAYS, days);
    },

    /**
     * Subtract days from a passed date
     *
     * @param {Date} A date object
     * @param {Number} number of days
     *
     * @return {Date} A date object
     */
    subtractDays: function(date, days) {
        return addTimeInterval(date, TIME_INTERVAL.DAYS, -days);
    },

    /**
     * Add hours to a passed date
     *
     * @param {Date} A date object
     * @param {Number} number of hours
     *
     * @return {Date} A date object
     */
    addHours: function(date, hours) {
        return addTimeInterval(date, TIME_INTERVAL.HOURS, hours);
    },

    /**
     * Subtract hours from a passed date
     *
     * @param {Date} A date object
     * @param {Number} number of hours
     *
     * @return {Date} A date object
     */
    subtractHours: function(date, hours) {
        return addTimeInterval(date, TIME_INTERVAL.HOURS, -hours);
    },

    /**
     * Add minutes to a passed date
     *
     * @param {Date} date A date object
     * @param {Number} minutes number of minutes
     *
     * @return {Date} A date object
     */
    addMinutes: function(date, minutes) {
        return addTimeInterval(date, TIME_INTERVAL.MINUTES, minutes);
    },

    /**
     * Subtract minutes from a passed date
     *
     * @param {Date} A date object
     * @param {Number} number of minutes
     *
     * @return {Date} A date object
     */
    subtractMinutes: function(date, minutes) {
        return addTimeInterval(date, TIME_INTERVAL.MINUTES, -minutes);
    },

    /**
     * Add seconds to a passed date
     *
     * @param {Date} A date object
     * @param {Number} number of seconds
     *
     * @return {Date} A date object
     */
    addSeconds: function(date, seconds) {
        return addTimeInterval(date, TIME_INTERVAL.SECONDS, seconds);
    },

    /**
     * subtract seconds from a passed date
     *
     * @param {Date} A date object
     * @param {Number} number of seconds
     *
     * @return {Date} A date object
     */
    subtractSeconds: function(date, seconds) {
        return addTimeInterval(date, TIME_INTERVAL.SECONDS, -seconds);
    },

    /**
     * returns the passed date with the time set to 00:00:00
     *
     * @param {Date} date The date to go to the start of
     *
     * @return {Date} The date with its time set to 00:00:00
     */
    startOfDay: function(date) {
        return moment(new Date(date)).startOf('day').toDate();
    },

    /**
     * returns the passed date with the time set to 23:59:59
     *
     * @param {Date} date The date to go to the end of
     *
     * @return {Date} The date with its time set to 23:59:59
     */
    endOfDay: function(date) {
        return moment(new Date(date)).endOf('day').toDate();
    },

    /**
     * Use moment.js to parse Sybase datetime string to an accepted ISO 8601 format
     *
     * @param {String} The string representation of a Sybase Datetime data type
     *
     * @return {String} A ISO 8601 formatted date string
     */
    formatSybaseDateTime: function(dateStr) {
        /** Sybase DateString cannot be parsed directly into a JS date object
         *  Using moment.js we will convert the string to an accepted ISO 8601 format
         */
        var newDateString;

        if (isNaN(Date.parse(dateStr))) {
            //newDateString = moment(dateStr, 'MMM DD YYYY hh:mm:ss:SSSa').format('YYYY-MM-DDTHH:mm:ssZZ');
            newDateString = moment(dateStr, 'MMM DD YYYY hh:mm:ss:SSSa').format('YYYY-MM-DD HH:mm:ssZZ');

            // Parse new date
            if (!isNaN(Date.parse(newDateString))) {
                dateStr = newDateString;
            }
        }

        return dateStr;
    },

    /**
     * Caclulate the number of days covered between startDate and endDate
     *
     * @param {Date} startDate Start date
     * @param {Date} endDate End date
     *
     * @return {Number} Number of days covered by the specified period
     */
    daysBetween: function(startDate, endDate) {
        var startMoment = moment(new Date(startDate)),
            endMoment = moment(new Date(endDate));

        return endMoment.diff(startMoment, 'days');
    },

    /**
     * Calculate the number of milliseconds between startDate and endDate
     *
     * @param {Date} startDate Start date
     * @param {Date} endDate End date
     *
     * @return {Number} Number of milliseconds covered by the specified period
     */
    msBetween: function(startDate, endDate) {
        var startMoment = moment(new Date(startDate)),
            endMoment = moment(new Date(endDate));

        return endMoment.diff(startMoment);
    },

    /**
     * Return the day number for the passed in date 0-6 0=sunday
     *
     * @param {Date} date The date
     *
     * @return {Number} Day number
     */
    dayOfWeek: function(date) {
        return moment(new Date(date)).day();
    },

    /**
     * Return the date portion of a datetime with the time removed (00:00:00)
     *
     * @param {Date} date The date
     *
     * @return {Date} Date with time removed
     */
    dateOnly: function(date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    },

    /**
     * Return true if the passed activation and expiry dates are currently active
     *
     * @param {Date} activationDate Activation date
     * @param {Date} expiryDate Expiry date
     *
     * @return {Boolean} True if currently active
     */
    isActiveNow: function(activationDate, expiryDate) {
        var dateCheck = UtilsDateTimeService.getServerDateTime();

        if ((sails.hooks.utils.datetime.msBetween(activationDate, dateCheck) > 0) && (!expiryDate || sails.hooks.utils.datetime.msBetween(expiryDate, dateCheck) < 0)) {
            return true;
        } else {
            return false;
        }
    },

    /** 
     * Get localised short month name
     *
     * @param {Object} req
     * @param {Number} month - Zero indexed month to retrieve
     *
     * @return {String} Localised short month name.
     */
    getShortMonthName: function(req, month) {
        var monthNames = req.__('ShortMonths').split(',');

        return (monthNames[month]);
    },

    /**
     * Get a new date that is in the the target week, by moving the original date into the target week
     * and retaining the weekday and time
     *
     * @param {Date} originalDate The date that the day of week and time should be kept
     * @param {Date} targetWeek The date with the week that the original date should be inserted to
     *
     * @return {Date} The original date moved in to the target week
     */
    getDateInTargetWeek: function(originalDate, targetWeek) {
        var clonedTarget;

        originalDate = moment(originalDate);
        targetWeek = moment(targetWeek);

        clonedTarget = targetWeek.clone();

        //Apply the original week day and time
        clonedTarget.weekday(originalDate.weekday());
        clonedTarget.hour(originalDate.hour());
        clonedTarget.minute(originalDate.minute());
        clonedTarget.second(originalDate.second());
        clonedTarget.millisecond(originalDate.millisecond());

        return clonedTarget;
    },


    /**
     * Gets all dates matching criteria passed. Creates an array of days
     * matching the generic criteria (e.g. all Fridays of a month) and then
     * based on the week the user selected (first->fifth or last), returns
     * that date only.
     * 
     * @param  {String} date      a date string (could be object too) to create the moment for the date
     * @param  {String} time_unit the time unit to select (e.g. month, year)
     * @param  {String} day       the option of which day to select (e.g. Monday,weekend,etc)
     * @param  {String} offset    the option of which date of the month to return (e.g. first, last, etc)
     * @param  {String} end_repeat  a date string (could be object too) to create the moment for the end repeat date
     * @return {Array}            an array with the date(s) matching the criteria
     */
    getAllDaysOf: function(date, time_unit, day, offset, end_repeat) {
        var dateArr = [],
            recur_moment = require('moment-recur'),
            dateFound, i;

        date = moment(new Date(date));
        end_repeat = moment(new Date(end_repeat));

        return new sails.Promise(function(resolve, reject) {

            if (day === 'weekday') {
                dateFound = date.recur().every(weekday).daysOfWeek();
            } else if (day === 'weekend') {
                dateFound = date.recur().every(weekend).daysOfWeek();
            } else if (day === 'day') {
                dateFound = date.recur().every(1).daysOfMonth();
            } else {
                dateFound = date.recur().every(day).daysOfWeek();
            }

            for (i = date.clone(); i.isBefore(date.endOf('month')); i.add(1, 'days')) {
                if (dateFound.matches(i.clone()._d)) {
                    dateArr.push(i.clone());
                }
            }

            switch (offset) {
                case 'first':
                    resolve(dateArr[0]);
                    break;
                case 'second':
                    resolve(dateArr[1]);
                    break;
                case 'third':
                    resolve(dateArr[2]);
                    break;
                case 'fourth':
                    resolve(dateArr[3]);
                    break;
                case 'fifth':
                    resolve(dateArr[4]);
                    break;
                case 'last':
                    resolve(dateArr[dateArr.length - 1]);
                    break;
                default:
                    resolve(dateArr);
                    break;
            }
        });
    },


    /**
     * Gets the duration information. If the event duration is more than
     * a month, then you use days to calculate the end date.
     * 
     * @param  {Number}             duration    the duration in days
     * @param  {Object/String}      date        the date
     * @return {Object}             the duration information object. Contains the duration and the time unit
     */
    getDuration: function(duration, date) {
        var months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
            duration_information = {};

        date = moment(new Date(date));

        if (date.isLeapYear()) {
            months[1] = 29; //leap year, February has 29 days
        }

        if (duration % months[date.month()] === 0) {
            duration_information.time_unit = 'months';
            duration_information.time = duration / months[date.month()];
        } else {
            duration_information.time_unit = 'days';
            duration_information.time = duration;
        }
        return duration_information;
    },

    /**
     * Convert a string date to a JS Date using a Moment JS template
     *
     * @param {String} date The string date
     * @param {String} template Moment JS template
     *
     * @return {Date} The date
     */
    convertDateWithTemplate: function(date, template) {
        return moment(date, template).toDate();
    },

    /**
     * Are the two passed in dates referring to the same day
     * 
     * @param {Date} date1 The first date
     * @param {Date} date2 The second date
     */
    areDatesTheSame: function(date1, date2) {
        return moment(date1).isSame(date2, 'day');
    },

    /**
     * Returns the end of the month of the date passed
     *
     * @param {Date} date The date to get the end of the month from
     *
     * @return {Date} The last date of the month
     */
    endOfMonth: function(date) {
        return moment(date).endOf('month').toDate();
    },

    /**
     * Returns the time intervals of the date passed
     *
     * @param {Date} The date to get date intervals for
     
     * @return {Object} An object of intervals with appropriate key names
     */
    getIntervalsFromDate: function(date) {
        var mDate = moment(new Date(date));

        return {
            year: mDate.year(),
            quarter: mDate.quarter(),
            month: mDate.month(),
            week: mDate.isoWeek(),
            monthDay: mDate.date(),
            day: mDate.day(),
            hour: mDate.hour(),
            minute: mDate.minute()
        };

    },

    /**
     * Is valid date
     *
     * @param {Date} The date to check for validity
     *
     * @return {Boolean} Is the passed in date a valid date
     */
    isValidDate: function(date) {
        if (!_.isDate(date)) {
            return false;
        }
        return moment(new Date(date)).isValid();
    },

    /**
     * Return true if the week of the year passed in is between the start and end dates
     *
     * @param {Number} week     ISO week
     * @param {Number} year     Year
     * @param {Date} startDate Start date
     * @param {Date} endDate End date
     *
     * @return {Boolean} True if the entire week of the year passed in is is between the start and end dates
     */
    isWeekYearBetweenDates: function(week, year, startDate, endDate) {
        const weekStartDate = weekYearStartDate(week, year),
            weekEndDate = weekYearEndDate(week, year);

        return (sails.hooks.utils.datetime.msBetween(startDate, weekStartDate) > 0) && (sails.hooks.utils.datetime.msBetween(endDate, weekEndDate) < 0 || !endDate);
    },

    /**
     * Gets ISO date out of week and year params
     * 
     * @param  {Number} week    - number of weeks
     * @param  {Number} years   - year
     * 
     * @return {Date}   the ISO date
     */
    getDateOfISOWeek: function(week, year) {
        const date = new Date(year, 0, 1 + (week - 1) * 7),
            dow = date.getDay(),
            ISOweekStart = date;

        if (dow <= 4) {
            ISOweekStart.setDate(date.getDate() - date.getDay() + 1);
        } else {
            ISOweekStart.setDate(date.getDate() + 8 - date.getDay());
        }

        return ISOweekStart;
    },

    /**
     * Function formatting the date to the passed in format
     * @param  {Date}   date           The date to format
     * @param  {String} formatOutput   The desired format output
     * @return {Date}   The formatted date 
     */
    formatDate: function(date, formatOutput) {
        formatOutput = formatOutput || 'D/M/Y';
        return moment(date).format(formatOutput);
    },

    /**
     * Function getting the date range from a start to an end of a specific
     * period of time (e.g. month or week).
     * 
     * @param  {String} intervalType        The type of the interval (month, week)
     * @param  {Number} interval            The number of the interval 
     * @param  {Number} [yearsBack]         The years back from the date, to get the date range. Defaults to 0
     * @param  {Date}   [date]              The date to get the date range from. Defaults to now
     * @return {Object} with a start and end date along with the type of the interval
     */
    getDateRangeFromStartToEnd: function(intervalType, interval, yearsBack, date) {
        yearsBack = yearsBack || 0;
        date = date || UtilsDateTimeService.getServerDateTime();
        const dateObj = _.clone(date),
            startOfDate = moment(dateObj).add(interval, intervalType).startOf(intervalType),
            endOfDate = moment(dateObj).add(interval, intervalType).endOf(intervalType);

        return {
            start_date: moment(startOfDate).subtract(yearsBack, 'year').startOf('day').toDate(),
            end_date: moment(endOfDate).subtract(yearsBack, 'year').startOf('day').toDate(),
            intervalType: intervalType
        };

    }

};

/**
 * Returns the start datetime of the ISO Week and Year passed in
 *
 * @param {Number} week     The ISO week
 * @param {Number} year     The year
 *
 * @return {Object} The start of that datetime range
 */
function weekYearStartDate(week, year) {
    return moment().isoWeek(week).year(year);
}

/**
 * Returns the end datetime of the ISO Week and Year passed in
 *
 * @param {Number} week     The ISO week
 * @param {Number} year     The year
 *
 * @return {Object} The end of that datetime range
 */
function weekYearEndDate(week, year) {
    return moment().isoWeek(week + 1).year(year);
}