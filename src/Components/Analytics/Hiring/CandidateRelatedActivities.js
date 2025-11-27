import React from "react";
import {
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ComposedChart,
    LabelList,
} from "recharts";

const CandidateRelatedActivities = () => {
    const data = [
        {
            month: "Jul 2024",
            candidatesAdded: 50,
            hired: 10,
            interviews: 20,
        },
        {
            month: "Aug 2024",
            candidatesAdded: 50,
            hired: 8,
            interviews: 20,
        },
        {
            month: "Sept 2024",
            candidatesAdded: 75,
            hired: 15,
            interviews: 30,
        },
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
            <h4 style={{ marginBottom: "15px" }}>Candidate Related Activities</h4>

            <div style={{ width: "100%", height: 300 }} >
                <ResponsiveContainer>
                    <ComposedChart data={data}>
                        {/* Grid */}
                        <CartesianGrid strokeDasharray="3 3" />

                        {/* X-Axis */}
                        <XAxis
                            dataKey="month"
                            style={{ fontSize: 12, fill: "#555" }}
                        />

                        {/* Y-Axis */}
                        <YAxis
                            style={{ fontSize: 12, fill: "#555" }}
                        />

                        {/* Tooltip */}
                        <Tooltip />

                        {/* Legend */}
                        <Legend />

                        {/* Blue Bars - Candidates Added */}
                        <Bar dataKey="candidatesAdded" name="Candidates Added" fill="#4A90E2" barSize={45}>
                            <LabelList dataKey="candidatesAdded" position="top" fill="#000" />
                        </Bar>

                        {/* Green Line - Hired Candidates */}
                        <Line
                            type="linear"
                            dataKey="hired"
                            name="Hired Candidates"
                            stroke="#00C49F"
                            strokeWidth={3}
                            dot={{ r: 4 }}
                        >
                            <LabelList dataKey="hired" position="top" fill="#000" />
                        </Line>

                        {/* Yellow Line - Interviews Scheduled */}
                        <Line
                            type="linear"
                            dataKey="interviews"
                            name="Interviews Scheduled"
                            stroke="#FFBB28"
                            strokeWidth={3}
                            dot={{ r: 4 }}
                        >
                            <LabelList dataKey="interviews" position="top" fill="#000" />
                        </Line>
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default CandidateRelatedActivities;
