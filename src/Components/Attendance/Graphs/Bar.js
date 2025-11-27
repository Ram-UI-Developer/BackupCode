import React, { useEffect, useState } from 'react'
import Block from './Block'

const Bar = ({
    data,
    oneHourHeight,
    shiftStartTime,
    shiftEndTime,
    yAxisHeight,
    maxTime
}) => {
    const [holidayType, setHolidayType] = useState('')
    // calculation of time into minitus
    const calculateDurationInMinutes = (punchStart, punchEnd) => {
        const punchIn = new Date(punchStart)
        const punchOut = new Date(punchEnd)
        const diff = (punchOut - punchIn) / (1000 * 60) // Difference in minutes
        return diff
    }

    let totalWorkDuration = 0

    data.punchInOutDetails.forEach((item) => {
        const duration = calculateDurationInMinutes(item.punchStart, item.punchEnd)

        totalWorkDuration += duration
    })

    // get time difference b/w start time and end time
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

    const barLastTime =
        data.punchInOutDetails.length > 0
            ? data.punchInOutDetails[0].end
                ? data.punchInOutDetails[0].end
                : data.punchInOutDetails[0].start
            : '00:00' // bar last time
    // Calculate the difference in minutes
    const diffInMinutes = getTimeDifference(maxTime, barLastTime ? barLastTime : '00:00') // difference b/w barlast time to y-axis last time

    const marginTop = (diffInMinutes / 60) * oneHourHeight // margin top to match graph

    const shiftEndLocalTime = shiftEndTime // shifr end time

    const shiftEnddiffInMinutes = getTimeDifference(
        maxTime,
        shiftEndLocalTime ? shiftEndLocalTime : '00:00'
    ) //shift end time
    const marginForShiftEnd = (shiftEnddiffInMinutes / 60) * oneHourHeight - 1

    const shiftStartLocalTime = shiftStartTime //shift start time

    const shiftStartdiffInMinutes = getTimeDifference(
        maxTime,
        shiftStartLocalTime ? shiftStartLocalTime : '00:00'
    ) // difference b/w y-axis last time to shift start time
    const marginForShiftStart = (shiftStartdiffInMinutes / 60) * oneHourHeight - 1
    useEffect(() => {
        if (data.weekend) {
            setHolidayType('Weekend')
        } else if (data.leave) {
            setHolidayType('Leave')
        } else {
            setHolidayType('Holiday')
        }
    }, [data])

    return (
        <>
            {!(data.weekend || data.leave || data.holiday) && (
                <div
                    className="shift-endTime"
                    style={{ marginTop: `${marginForShiftEnd + 'px'}` }}
                ></div>
            )}
            {!(data.weekend || data.leave || data.holiday) && (
                <div
                    className="shift-startTime"
                    style={{ marginTop: `${marginForShiftStart + 'px'}` }}
                ></div>
            )}
            <>
                {data.punchInOutDetails.length > 0 ? (
                    <div style={{ marginTop: `${marginTop + 'px'}` }}>
                        {data.punchInOutDetails.map((block) => (
                            <div key={block.punchStart}>
                                <Block
                                    data={block}
                                    totalDuration={totalWorkDuration}
                                    oneHourHeight={oneHourHeight}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {(data.weekend || data.leave || data.holiday) && (
                            <div
                                className="vertical-container"
                                style={{ height: `${yAxisHeight - 16}px` }}
                            >
                                <hr className="vertical-line" />
                                <span className="vertical-text">{holidayType}</span>
                                <hr className="vertical-line" />
                            </div>
                        )}
                    </>
                )}
            </>
        </>
    )
}

export default Bar
