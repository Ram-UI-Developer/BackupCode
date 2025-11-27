import React from "react";
import {
    PieChart,
    Pie,
    Cell,
    Label,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";

const WorkforceDemographics = () => {
    const genderData = [
        { name: "Female", value: 43, color: "#007ACC" },
        { name: "Male", value: 52, color: "#5BC0EB" },
        { name: "Non-P", value: 5, color: "#C5E8F7" },
    ];

    const ageData = [
        { age: "20–28", count: 300 },
        { age: "30–39", count: 220 },
        { age: "40–49", count: 120 },
        { age: "50+", count: 70 },
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
            <div
                className="card-header dashboardHeading"
                style={{ fontWeight: "600", padding: "10px 15px" }}
            >
                Workforce Demographics
            </div>

            <div
                className="card-body"
                style={{
                    padding: "10px 15px",
                    height: "320px", // ✅ Total card height
                }}
            >
                <div
                    style={{
                        display: "flex",
                        gap: "1rem",
                        justifyContent: "space-between",
                        alignItems: "stretch", // ✅ Make charts fill height evenly
                        width: "100%",
                        height: "100%",
                    }}
                >
                    {/* ✅ Gender Distribution (Donut Chart) */}
                    <div
                        style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            height: "100%",
                        }}
                    >
                        <h5 style={{ textAlign: "center", fontWeight: "500", marginBottom: 8 }}>
                            Gender Distribution
                        </h5>
                        <div style={{ width: "100%", height: "calc(100% - 40px)" }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={genderData}
                                        dataKey="value"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius="60%"
                                        outerRadius="80%"
                                        startAngle={90}
                                        endAngle={450}
                                        isAnimationActive
                                    >
                                        {genderData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                        <Label
                                            value={`${genderData[0].value}%`}
                                            position="center"
                                            fill="#333"
                                            style={{ fontSize: 22, fontWeight: "bold" }}
                                        />
                                    </Pie>

                                    <Tooltip formatter={(value) => `${value}%`} />
                                    <Legend
                                        verticalAlign="bottom"
                                        align="center"
                                        iconType="circle"
                                        wrapperStyle={{ fontSize: "12px", marginTop: "10px" }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* ✅ Age Distribution (Horizontal Bar Chart) */}
                    <div
                        style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            height: "100%",
                        }}
                    >
                        <h5 style={{ textAlign: "center", fontWeight: "500", marginBottom: 8 }}>
                            Age Distribution
                        </h5>
                        <div style={{ width: "100%", height: "calc(100% - 40px)" }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={ageData}
                                    layout="vertical"
                                    margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
                                >
                                    <CartesianGrid
                                        stroke="#e0e0e0"
                                        strokeWidth={0.6}
                                        horizontal={false}
                                    />
                                    <XAxis
                                        type="number"
                                        axisLine={false}
                                        tickLine={false}
                                        style={{ fontSize: 12, fill: "#666" }}
                                    />
                                    <YAxis
                                        dataKey="age"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        width={60}
                                        style={{ fontSize: 12, fill: "#666" }}
                                    />
                                    <Tooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} />
                                    <Bar
                                        dataKey="count"
                                        fill="#007ACC"
                                        radius={[4, 4, 4, 4]}
                                        barSize={20}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkforceDemographics;
