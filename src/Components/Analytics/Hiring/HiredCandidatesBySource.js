import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LabelList,
} from "recharts";

const HiredCandidatesBySource = () => {
    const data = [
        { name: "Consultant", value: 6 },
        { name: "Facebook", value: 3 },
        { name: "JobAlert", value: 3 },
        { name: "Twitter", value: 2 },
        { name: "LinkedIn", value: 1 },
        { name: "Employee Referral", value: 1 },
        { name: "Advertisement", value: 1 },
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
            <h4 style={{ marginBottom: "10px" }}>Hired Candidates</h4>

            <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                    <BarChart
                        data={data}
                        margin={{ top: 20, right: 20, left: 0, bottom: 40 }}
                    >
                        {/* Horizontal Grid */}
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />

                        {/* Inclined X-Axis Labels */}
                        <XAxis
                            dataKey="name"
                            tick={{
                                angle: -35,
                                textAnchor: "end",
                                fill: "#333",
                                fontSize: 12,
                            }}
                            interval={0}
                            height={60}
                        />

                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: "#666" }}
                        />

                        <Tooltip />

                        {/* Blue bars */}
                        <Bar
                            dataKey="value"
                            fill="#4A90E2"
                            radius={[6, 6, 0, 0]}
                            barSize={35}
                        >
                            {/* Count Labels Above Bars */}
                            <LabelList
                                dataKey="value"
                                position="top"
                                fill="#000"
                                fontSize={12}
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default HiredCandidatesBySource;
