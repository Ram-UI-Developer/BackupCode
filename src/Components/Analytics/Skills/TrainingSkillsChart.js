import React from "react";
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

const TrainingSkillsChart = () => {
    const data = [
        { skill: "Leadership Development", value: 80 },
        { skill: "Technical Skills", value: 60 },
        { skill: "Compliance Training", value: 90 },
        { skill: "Soft Skills", value: 40 },
        { skill: "Product Knowledge", value: 50 },
        { skill: "AI Skills", value: 75 },
    ];

    return (
        <div
            className="card"
            style={{
                background: "#fff",
                borderRadius: "10px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                padding: "10px 15px",
                textAlign: "center",
            }}
        >
            <h3 style={{ marginBottom: "3px", color: "#003B45" }}>
                Training & Skills
            </h3>

            <h5 style={{ marginBottom: "10px", color: "#004F57" }}>
                Training & Skills Chart of Organization
            </h5>

            <div style={{ width: "100%", height: 380 }}>
                <ResponsiveContainer>
                    <RadarChart
                        cx="50%"
                        cy="50%"
                        outerRadius="72%"
                        data={data}
                    >
                        {/* Darker grid lines */}
                        <PolarGrid stroke="#587A94" strokeOpacity={0.6} />

                        {/* 🔥 UPDATED: Skill Label Colors */}
                        <PolarAngleAxis
                            dataKey="skill"
                            tick={{
                                fill: "#004A80",   // << Darker label color
                                fontSize: 12,
                                fontWeight: 600,   // << Makes labels more readable
                            }}
                        />

                        <PolarRadiusAxis
                            angle={90}
                            domain={[0, 100]}
                            tick={{ fill: "#205762", fontSize: 11 }}
                            tickFormatter={(val) => `${val}%`}
                        />

                        {/* Radar Shape */}
                        <Radar
                            name="Skills"
                            dataKey="value"
                            stroke="#003E70"       // darker border
                            strokeWidth={3}
                            fill="#007ACC"         // bold fill
                            fillOpacity={0.85}
                            dot={{
                                r: 5,
                                fill: "white",
                                stroke: "#003E70",
                                strokeWidth: 2,
                            }}
                        />

                        <Tooltip formatter={(value) => `${value}%`} />

                        <Legend wrapperStyle={{ marginTop: "5px" }} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default TrainingSkillsChart;
