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

const CandidateStatusOverview = () => {
    const data = [
        { name: "New", value: 86 },
        { name: "In Process", value: 20 },
        { name: "Screened", value: 20 },
        { name: "Shortlisted", value: 17 },
        { name: "Selected", value: 11 },
        { name: "Rejected", value: 9 },
        { name: "On Hold", value: 8 },
        { name: "Hired", value: 4 },
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
            <h4 style={{ marginBottom: "10px" }}>Candidate Status Overview</h4>

            <div style={{ width: "100%", height: 320 }}>
                <ResponsiveContainer>
                    <BarChart
                        data={data}
                        margin={{ top: 20, right: 20, left: 0, bottom: 40 }}
                    >
                        {/* Horizontal grid only */}
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />

                        {/* X-Axis with INCLINED LABELS */}
                        <XAxis
                            dataKey="name"
                            tick={{
                                angle: -35,          // 🔥 inclined text
                                textAnchor: "end",   // 🔥 aligns exactly like screenshot
                                fontSize: 12,
                                fill: "#333",
                            }}
                            interval={0}           // Show ALL labels
                            height={60}            // Extra room for angled text
                        />

                        {/* Y-Axis */}
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: "#666" }}
                        />

                        <Tooltip />

                        {/* Bars */}
                        <Bar
                            dataKey="value"
                            fill="#4A90E2"
                            radius={[6, 6, 0, 0]}
                            barSize={35}
                        >
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

export default CandidateStatusOverview;
