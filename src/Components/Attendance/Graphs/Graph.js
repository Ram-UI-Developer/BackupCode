import React, { useEffect, useState } from 'react'
import Bar from './Bar'
import './BarGraph.css'

const Graph = ({ dataList, timesArray, maxTime }) => {
    const [yaxisTime, setYaxisTime] = useState(timesArray) // State for y-axis data

    // set y-axis on component mount
    useEffect(() => {
        setYaxisTime(timesArray)
    }, [timesArray])

    const hourToPixelRatio = (yaxisTime.length + 1) / 2 // hours to pixels ratio
    const yAxisHeight =
        yaxisTime.length *
        hourToPixelRatio *
        (yaxisTime.length > 20
            ? 1.45
            : yaxisTime.length > 15
              ? 2.3
              : yaxisTime.length > 10
                ? 5
                : yaxisTime.length < 5
                  ? 25
                  : 8)

    const heightOfOneHour = yAxisHeight / yaxisTime.length // one hour height in pixels

    const formatDate = (dateString) => {
        const date = new Date(dateString)

        // Get day of the month
        const day = date.getDate()

        // Get the day suffix (st, nd, rd, th)
        const daySuffix = (day) => {
            if (day === 1 || day === 21 || day === 31) return 'st'
            if (day === 2 || day === 22) return 'nd'
            if (day === 3 || day === 23) return 'rd'
            return 'th'
        }

        // Get short name of the day
        const dayOfWeek = date.toLocaleDateString(undefined, { weekday: 'short' })

        // Format the final output
        return {
            weekDay: dayOfWeek,
            date: (
                <>
                    {day}
                    <sup>{daySuffix(day)}</sup>
                    <div></div>
                    {dayOfWeek}
                </>
            )
        }
    }

    return (
        <>
            <div className="bar-graph-container">
                <div className="" style={{ height: yAxisHeight + 'px' }}>
                    {yaxisTime.map((item) => (
                        <div
                            key={item}
                            className="y-axis-time"
                            style={{ height: `${heightOfOneHour + 'px'}` }}
                        >
                            {item + '-'}
                        </div>
                    ))}
                </div>
                <div className="bar-graph" style={{ height: yAxisHeight + 'px' }}>
                    {dataList &&
                        dataList.map((item) => {
                            return (
                                <div key={item.date} className="bar-item">
                                    <div className="bar">
                                        <div
                                            className="bar-date"
                                            style={{
                                                color:
                                                    formatDate(item.date).weekDay == 'Sun' ||
                                                    formatDate(item.date).weekDay == 'Sat'
                                                        ? 'red'
                                                        : ''
                                            }}
                                        >
                                            {formatDate(item.date).date}
                                        </div>
                                        <Bar
                                            data={item}
                                            oneHourHeight={heightOfOneHour}
                                            lastElementOfYaxis={timesArray[0]}
                                            shiftStartTime={item.shiftStartTime}
                                            shiftEndTime={item.shiftEndTime}
                                            yAxisHeight={yAxisHeight}
                                            maxTime={maxTime}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                </div>
            </div>
        </>
    )
}

export default Graph
