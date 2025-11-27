import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList
} from "recharts";

const CandidateSource = () => {
  const data = [
    { name: "LinkedIn", value: 19.8 },
    { name: "Consultant", value: 18.5 },
    { name: "Employee Referral", value: 15.3 },
    { name: "Facebook", value: 18 },
    { name: "Advertisement", value: 12.6 },
    { name: "Twitter", value: 15.3 },
  ];

  // Exact colors from your screenshot
  const COLORS = [
    "#F76463", // red
    "#8BCF5A", // light green
    "#64A7FF", // blue
    "#2C80FF", // dark blue
    "#F7C75D", // yellow
    "#F292B2", // pink
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
      <h4 style={{ marginBottom: "10px" }}>Candidate Source</h4>

      <div style={{ width: "100%", height: 300 }} >
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius="90%"
              paddingAngle={0}   // No gaps
              stroke="none"      // No borders
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}

              {/* 🔥 LABELS INSIDE SLICES */}
              <LabelList
                dataKey="value"
                position="inside"
                formatter={(v) => `${v}%`}
                fill="#fff"
                fontSize={12}
                stroke="none"
              />
            </Pie>

            <Tooltip formatter={(value) => `${value}%`} />

            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              iconType="square"
              wrapperStyle={{ marginTop: "10px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CandidateSource;
