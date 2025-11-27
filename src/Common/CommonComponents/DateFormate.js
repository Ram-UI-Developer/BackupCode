import moment from 'moment'
import React from 'react'
// date format
const DateFormate = ({ date }) => {
    return <span>{moment(date).format('DD MMM YYYY')}</span>
}

export default DateFormate
