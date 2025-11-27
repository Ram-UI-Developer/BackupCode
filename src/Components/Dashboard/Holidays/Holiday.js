import React from 'react'

const Holiday = ({ data, color }) => {
    const getDayAbbreviation = (date) =>
        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]
    const date = new Date(data.date)
    return (
        <>
            <div
                className="card dashboardHolidayCard"
                style={{
                    backgroundColor: data.optional ? '#FFFFFF' : '#004aad',
                    color: data.optional ? '#004aad' : '#FFFFFF'
                }}
            >
                <div className="row">
                    <div className="col-sm-6 textBold">
                        {data.date}({getDayAbbreviation(date)})
                    </div>
                    <div className="col-sm-6 textBold">{data.name}</div>
                </div>
            </div>
        </>
    )
}

export default Holiday
