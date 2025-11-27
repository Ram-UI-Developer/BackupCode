import React from 'react'

const Block = ({ data, oneHourHeight }) => {
    const time1 = new Date(data.punchStart) // start time
    const time2 = new Date(data.punchEnd) // end time
    const differenceInMilliseconds = time2 - time1 // Calculate the difference in milliseconds
    const differenceInMinutes = differenceInMilliseconds / (1000 * 60) // difference b/w start and end times

    const barHeight = (differenceInMinutes / 60) * oneHourHeight // height of bar

    return (
        <>
            <div
                className="barWidth"
                style={{
                    background:
                        data.type == 'Work Duration'
                            ? 'linear-gradient(to top, #000066, #0000cc )'
                            : '#FFFFFF',
                    height: data.punchEnd != null ? `${barHeight + 'px'}` : '1px',
                    borderTop:
                        data.punchEnd && data.type == 'Work Duration'
                            ? '2px solid red'
                            : '0px solid',
                    borderBottom: data.type == 'Work Duration' ? '2px solid green' : '0px solid'
                }}
            >
                <span className="tooltiptext">
                    {data.duration} <br />
                    {data.remark}
                </span>
            </div>
        </>
    )
}

export default Block
