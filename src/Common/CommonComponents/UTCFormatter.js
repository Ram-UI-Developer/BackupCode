import moment from 'moment'

/**
 * localeToUtc - Converts a local date/time to UTC.
 *
 * @param {String|Date} date - The local date/time input.
 * @returns {Object} Moment object in UTC format.
 */
const localeToUtc = (date) => {
    // Convert the local date to a UTC moment object
    const dateFormatted = moment(date).utc()
    return dateFormatted
}

export { localeToUtc }

/**
 * utcToLocale - Converts a UTC date/time to the user's local time.
 *
 * @param {String|Date} date - The UTC date/time input.
 * @returns {Object} Moment object in local format.
 */
const utcToLocale = (date) => {
    // Parse the UTC date and convert it to local time
    const dateFormatted = moment.utc(date).local()
    return dateFormatted
}

export { utcToLocale }

/**
 * utcToLocaleHours - Converts a UTC time string (e.g., "15:30") to local time in "HH:mm" format.
 *
 * @param {String} time - Time string in "HH:mm" format (assumed to be in UTC).
 * @returns {String} Local time string in "HH:mm" format.
 */
const utcToLocaleHours = (time) => {
    // Combine today's date (in UTC) with the time string to get a complete UTC datetime string
    const date = moment.utc().startOf('day').format('YYYY-MM-DD') + ' ' + time
    // Convert the UTC datetime string to local time and format only the time part
    return moment.utc(date).local().format('HH:mm')
}

export { utcToLocaleHours }
