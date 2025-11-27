import React from 'react'
import { Cell, Pie, PieChart, Tooltip } from 'recharts'

const AttendanceChart = () => {
    const data = [
        { name: 'Present', value: 90 },
        { name: 'On Leave', value: 30 }
    ]
    const COLORS = ['#002196', '#FFA800']

    return (
        <div
        // onClick={() => navigate('/managerAttendanceReports')}
        >
            <PieChart width={240} height={240}>
                <Pie
                    style={{ cursor: 'pointer' }}
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={50} // Adjust the inner radius to make it a donut
                    outerRadius={100} // Outer radius for the size of the donut
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell
                            key={COLORS[index]}
                            fill={COLORS[index % COLORS.length]}
                            style={{ cursor: 'pointer' }}
                        />
                    ))}
                </Pie>
                <Tooltip />
            </PieChart>
        </div>
    )
}

export default AttendanceChart
