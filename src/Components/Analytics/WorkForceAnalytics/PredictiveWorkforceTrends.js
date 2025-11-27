import React from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

const PredictiveWorkforceTrends = () => {
    // ✅ Dummy data — matches the look in your image
    const data = [
        { month: "May 23", rate: 7 },
        { month: "Mar 23", rate: 11 },
        { month: "Apr 23", rate: 10 },
        { month: "Jun 23", rate: 12 },
        { month: "Jan 24", rate: 13 },
        { month: "Apr 24", rate: 18 },
    ];

    return (
        <div
            className="card"
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
                Predictive Workforce Trends
            </div>

            {/* ✅ Card Body */}
            <div
                className="card-body"
                style={{ padding: "10px 15px", height: "320px" }}
            >
                <h5 style={{ textAlign: "left", fontWeight: "500", marginBottom: "8px" }}>
                    Attrition Rate Forecast
                </h5>

                {/* ✅ Chart Container */}
                <div style={{ width: "100%", height: "calc(100% - 30px)" }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={data}
                            margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                        >
                            {/* ✅ Subtle horizontal gridlines */}
                            <CartesianGrid stroke="#e0e0e0" strokeWidth={0.6} vertical={false} />

                            {/* ✅ X and Y Axes */}
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                style={{ fontSize: 12, fill: "#666" }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(val) => `${val}%`}
                                style={{ fontSize: 12, fill: "#666" }}
                            />

                            {/* ✅ Tooltip */}
                            <Tooltip
                                formatter={(value) => [`${value}%`, "Attrition Rate"]}
                                cursor={{ strokeDasharray: "3 3" }}
                            />

                            {/* ✅ Legend */}
                            <Legend verticalAlign="bottom" height={36} />

                            {/* ✅ Main Line */}
                            <Line
                                type="linear"
                                dataKey="rate"
                                stroke="#007ACC"
                                strokeWidth={2}
                                dot={{ r: 4, fill: "#007ACC" }}
                                activeDot={{ r: 6, stroke: "#007ACC" }}
                                name="Attrition Rate"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default PredictiveWorkforceTrends;
