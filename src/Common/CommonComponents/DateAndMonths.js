import React from 'react'
import Select from 'react-select'

const DateAndMonths = ({
    date,
    month,
    enableMonth,
    enableDate,
    onChange,
    formErrors,
    dateLength
}) => {
    // months deleration statically
    const monthOptions = [
        { label: 'Jan', value: 'Jan' },
        { label: 'Feb', value: 'Feb' },
        { label: 'Mar', value: 'Mar' },
        { label: 'Apr', value: 'Apr' },
        { label: 'May', value: 'May' },
        { label: 'Jun', value: 'Jun' },
        { label: 'Jul', value: 'Jul' },
        { label: 'Aug', value: 'Aug' },
        { label: 'Sep', value: 'Sep' },
        { label: 'Oct', value: 'Oct' },
        { label: 'Nov', value: 'Nov' },
        { label: 'Dec', value: 'Dec' }
    ]

    // dates genaration by month
    const dateOptions = []
    for (let i = 1; i <= dateLength; i++) {
        let date = {}
        date.label = i
        date.value = i
        dateOptions.push(date)
    }

    return (
        <>
            <div className="row">
                {enableMonth && (
                    <div className="col-sm-6">
                        <Select
                            className="dropdown"
                            placeholder="Select Month"
                            options={monthOptions}
                            value={{ label: month }}
                            name="month"
                            onChange={(e) => onChange(e, 'month')}
                        />
                        <p className="error">{formErrors ? formErrors.month : ''}</p>
                    </div>
                )}
                {enableDate && (
                    <div className="col-sm-6">
                        <Select
                            className="dropdown text-right"
                            placeholder="Select Date"
                            options={dateOptions}
                            value={{ label: date ? date : '' }}
                            name="date"
                            onChange={(e) => onChange(e, 'date')}
                        />
                        <p className="error">{formErrors ? formErrors.date : ''}</p>
                    </div>
                )}
            </div>
        </>
    )
}

export default DateAndMonths
