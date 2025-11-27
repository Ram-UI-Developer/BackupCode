import React from 'react'

const RecentStatistics = ({ data, workingHours, breakHours }) => {
    // Function for generating Array of time eg: [10:00, 11:00]
    function generateTimeArray(startTime, endTime) {
        const localStartTime = startTime
        const localEndTime = endTime
        // Helper to parse "HH:mm" format into hours and minutes
        const parseTime = (time) => {
            const [hours, minutes] = time.split(':').map(Number)
            return { hours, minutes }
        }
        // Format time as "HH:00"
        const formatTime = (hours, minutes) => {
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
        }

        const start = parseTime(localStartTime)
        const end = parseTime(localEndTime)

        // Round down the start time to the nearest hour
        const startHour = start.hours
        // Round up the end time to the nearest hour
        const endHour = end.minutes > 0 ? end.hours + 1 : end.hours

        const result = []
        for (let h = startHour; h <= endHour; h++) {
            result.push(formatTime(h, 0)) // Append each hour with ":00"
        }

        return result
    }
    // Convert time format "HH:mm:ss" to readable "HH hrs MM min SS sec"
    const convertTimeFormat = (timeString) => {
        // Split the time string into hours, minutes, and seconds
        const [hours, minutes, seconds] = timeString.split(':')

        // Return the formatted string
        return `${hours} hrs ${minutes} min ${seconds} sec`
    }
    // Declare variables for rendering the graph
    let reversedIntervals = []
    let yAxisHeight = 0
    let heightOfOneHour = 0
    let marginTop = 0
    if (data.dayWiseList.length > 0) {
        // Reverse the generated time intervals for y-axis from top to bottom
        reversedIntervals = generateTimeArray(data.minTime, data.maxTime).reverse()
        // Calculate total duration in minutes for the graph range

        // Calculate y-axis height based on number of intervals and scaling ratio
        const hourToPixelRatio = (reversedIntervals.length + 1) / 2
        yAxisHeight =
            reversedIntervals.length *
            hourToPixelRatio *
            (reversedIntervals.length >= 23
                ? 1.4
                : reversedIntervals.length > 20
                  ? 2.25
                  : reversedIntervals.length > 15
                    ? 2.63
                    : reversedIntervals.length > 10
                      ? 5.3
                      : reversedIntervals.length > 9
                        ? 9
                        : reversedIntervals.length > 8
                          ? 14
                          : reversedIntervals.length > 7
                            ? 16
                            : reversedIntervals.length > 6
                              ? 18
                              : reversedIntervals.length > 5
                                ? 20
                                : reversedIntervals.length <= 5
                                  ? 30
                                  : 12)

        heightOfOneHour = yAxisHeight / reversedIntervals.length
        // Extract UTC time for the first punch entry
        const utcDateStr =
            data.dayWiseList.length > 0 && data.dayWiseList[0].punchInOutDetails[0].end
                ? data.dayWiseList[0].punchInOutDetails[0].end
                : data.dayWiseList[0].punchInOutDetails[0].start
        const utcDate = new Date(utcDateStr)
        // Calculate the time difference from first punch to the top of the y-axis
        const date1 = new Date(`1970-01-01T${utcDate}:00Z`)
        let date2 = new Date(`1970-01-01T${reversedIntervals[0]}:00Z`)
        // Handle overnight time shift
        if (date2 < date1) {
            date2.setDate(date2.getDate() + 1)
        }
        // Helper function to calculate time difference in minutes
        const getTimeDifference = (time1, time2) => {
            // Convert times to total minutes
            const [hours1, minutes1] = time1.split(':').map(Number)
            const [hours2, minutes2] = time2.split(':').map(Number)
            const totalMinutes1 = hours1 * 60 + minutes1
            const totalMinutes2 = hours2 * 60 + minutes2
            // Calculate the absolute difference in minutes
            const difference = Math.abs(totalMinutes1 - totalMinutes2)
            return difference
        }

        const diffInMinutes = getTimeDifference(reversedIntervals[0], utcDateStr)
        // Calculate margin from top to place first punch-in box
        marginTop = (diffInMinutes / 60) * heightOfOneHour + 8

        // Helper to calculate duration between two timestamps in minutes
        // const calculateDurationInMinutes = (punchStart, punchEnd) => {
        //     const punchIn = new Date(punchStart)
        //     const punchOut = new Date(punchEnd)
        //     const diff = (punchOut - punchIn) / (1000 * 60) // Difference in minutes
        //     return diff
        // }
        // Calculate total work duration in minutes
        // let totalWorkDuration = 0
        // data &&
        //     data.dayWiseList[0].punchInOutDetails.forEach((item) => {
        //         const duration = calculateDurationInMinutes(item.punchStart, item.punchEnd)
        //         totalWorkDuration += duration
        //     })
    }
    return (
        <>
            {data && data.dayWiseList.length > 0 ? (
                <div className="d-flex">
                    {/* Y-axis time labels */}
                    <div
                        className=""
                        style={{
                            height: yAxisHeight + 'px',
                            borderRight: '2px solid',
                            paddingRight: '3px'
                        }}
                    >
                        {reversedIntervals.map((item) => (
                            <div
                                className="y-axis-time"
                                style={{ height: `${heightOfOneHour + 'px'}` }}
                                key={item}
                            >
                                {item + '-'}
                            </div>
                        ))}
                    </div>
                    {/* Punch bars aligned on timeline */}
                    <div
                        style={{
                            marginLeft: '3.5%',
                            paddingRight: '7%',
                            position: 'relative',
                            marginTop: `${marginTop}px`
                        }}
                    >
                        {data &&
                            data.dayWiseList[0].punchInOutDetails.map((item) => {
                                const time1 = new Date(item.punchStart)
                                const time2 = new Date(item.punchEnd)
                                const differenceInMilliseconds = time2 - time1
                                const differenceInMinutes = differenceInMilliseconds / (1000 * 60)
                                const barHeight = (differenceInMinutes / 60) * heightOfOneHour
                                return (
                                    <div
                                        className="attendanceLine"
                                        key={item.punchStart}
                                        style={{
                                            position: 'relative',
                                            height: `${barHeight}px`,
                                            borderTop:
                                                item.punchEnd && item.type === 'Work Duration'
                                                    ? '1.5px solid red'
                                                    : '0px solid',
                                            borderBottom:
                                                item.type === 'Work Duration'
                                                    ? '1.5px solid green'
                                                    : '0px solid',
                                            background:
                                                item.type == 'Work Duration'
                                                    ? 'linear-gradient(to top, #000066, #0000cc )'
                                                    : '#FFFFFF'
                                        }}
                                    >
                                        {/* Tooltip showing punch duration and remarks */}
                                        <span className="tooltiptext">
                                            {item.duration} <br />
                                            {item.remark}
                                        </span>
                                    </div>
                                )
                            })}
                    </div>
                    {/* Legend and summary details */}
                    <div className="padding-1rem workingHoursCount">
                        <div style={{ paddingLeft: '45%', paddingBottom: '15%' }}>
                            <div className="d-flex">
                                <div
                                    style={{ height: '2px', width: '20px', background: 'green' }}
                                ></div>
                                <div className="graphIdentitiesText"> Punch In</div>
                            </div>
                            <div className="d-flex">
                                <div
                                    style={{ height: '2px', width: '20px', background: 'red' }}
                                ></div>
                                <div className="graphIdentitiesText"> Punch Out</div>
                            </div>
                            <div className="d-flex">
                                <div
                                    style={{
                                        height: '7px',
                                        width: '20px',
                                        background: 'linear-gradient(to top, #000066, #0000cc )'
                                    }}
                                ></div>
                                <div className="graphIdentitiesText"> Worked Hours</div>
                            </div>
                            <div className="d-flex">
                                <div
                                    style={{
                                        height: '7px',
                                        width: '20px',
                                        background: '#FFFFFFF',
                                        border: '0.5px solid'
                                    }}
                                ></div>
                                <div className="graphIdentitiesText"> Break Hours</div>
                            </div>
                        </div>
                        <div>
                            <label>Worked Hours </label>{' '}
                            <span style={{ float: 'right' }}>
                                &ensp;: {convertTimeFormat(workingHours)}
                            </span>
                        </div>
                        <div>
                            <label>Break Hours </label>{' '}
                            <span style={{ float: 'right' }}>
                                &ensp;: {convertTimeFormat(breakHours)}
                            </span>
                        </div>
                    </div>
                </div>
            ) : (
                // Fallback if no data is available
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        width: '100%',
                        textAlign: 'center',
                        paddingTop: '2em',
                        boxSizing: 'border-box'
                    }}
                    className="textBold"
                >
                    No data found
                </div>
            )}
        </>
    )
}

export default RecentStatistics
