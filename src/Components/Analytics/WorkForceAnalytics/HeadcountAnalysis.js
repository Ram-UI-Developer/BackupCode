import React from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const HeadcountAnalysis = () => {
    const data = [
        { month: "Jan 2023", headcount: 320 },
        { month: "Mar 2023", headcount: 370 },
        { month: "Apr 2023", headcount: 410 },
        { month: "Jun 2023", headcount: 450 },
        { month: "Sep 2023", headcount: 480 },
        { month: "Dec 2023", headcount: 510 },
    ];

    return (
        <div
            className="card h-25rem"
            style={{
                background: "#fff",
                borderRadius: 8,
                boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
            }}
        >
            {/* ✅ Card Header */}
            <div
                className="card-header dashboardHeading"
                style={{ fontWeight: "600", padding: "10px 15px" }}
            >
                Headcount Analysis
            </div>

            {/* ✅ Card Body */}
            <div
                className="card-body"
                style={{
                    padding: "10px 15px",
                    height: "300px",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <h5
                    style={{
                        textAlign: "left",
                        fontWeight: "500",
                        marginBottom: "8px",
                    }}
                >
                    Headcount Over Time
                </h5>

                {/* ✅ Chart should flex-grow to take remaining height */}
                <div style={{ flexGrow: 1 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={data}
                            margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                        >
                            <CartesianGrid
                                stroke="#e0e0e0"
                                strokeWidth={0.6}
                                vertical={false}
                            />
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                style={{ fontSize: 12, fill: "#666" }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                style={{ fontSize: 12, fill: "#666" }}
                            />
                            <Tooltip
                                formatter={(value) => [`${value}`, "Headcount"]}
                                cursor={{ strokeDasharray: "3 3" }}
                            />
                            <Line
                                type="monotone"
                                dataKey="headcount"
                                stroke="#007ACC"
                                strokeWidth={2}
                                dot={{ r: 4, fill: "#007ACC" }}
                                activeDot={{ r: 6, stroke: "#007ACC" }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* ✅ Subtitle stays visible at bottom */}
                <div
                    style={{
                        marginTop: "8px",
                        textAlign: "left",
                        fontSize: "16px",
                        fontWeight: "600",
                    }}
                >
                    New Hires vs Resignations
                </div>
            </div>
        </div>
    );
};

export default HeadcountAnalysis;
