import React from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LabelList,
} from "recharts";

const HiringTrend = () => {
    const data = [
        { month: "Jul 2024", value: 7 },
        { month: "Aug 2024", value: 8 },
        { month: "Sept 2024", value: 3 },
    ];

    return (
        <div
            className="card h-25rem"
            style={{
                background: "#fff",
                borderRadius: 10,
                boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                padding: "15px",
            }}
        >
            <h4 style={{ marginBottom: "10px" }}>Hiring Trend</h4>

            <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer>
                    <LineChart
                        data={data}
                        margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
                    >
                        {/* Horizontal grid only */}
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />

                        {/* X-axis */}
                        <XAxis
                            dataKey="month"
                            tick={{ fontSize: 12, fill: "#333" }}
                        />

                        {/* Y-axis */}
                        <YAxis
                            tick={{ fontSize: 12, fill: "#666" }}
                            axisLine={false}
                            tickLine={false}
                        />

                        <Tooltip />

                        {/* Blue line */}
                        <Line
                            type="linear"
                            dataKey="value"
                            stroke="#4A90E2"
                            strokeWidth={3}
                            dot={{ r: 5, fill: "#4A90E2" }}
                            activeDot={{ r: 7 }}
                        >
                            {/* Value labels */}
                            <LabelList
                                dataKey="value"
                                position="top"
                                fill="#000"
                                fontSize={12}
                            />
                        </Line>
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default HiringTrend;
