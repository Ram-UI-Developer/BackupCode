import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const DiversityInclusion = () => {
  // ✅ Dummy data for department-wise gender representation
  const data = [
    { department: "Sales", Female: 65, Male: 35 },
    { department: "IT", Female: 45, Male: 55 },
    { department: "HR", Female: 75, Male: 25 },
    { department: "Finance", Female: 60, Male: 40 },
    { department: "Operations", Female: 50, Male: 50 },
    { department: "Marketing", Female: 70, Male: 30 }
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
        Diversity & Inclusion
      </div>

      {/* ✅ Card Body */}
      <div
        className="card-body"
        style={{ padding: "10px 15px", height: "320px" }}
      >
        <h5 style={{ textAlign: "left", fontWeight: "500", marginBottom: "8px" }}>
          Representation by Department
        </h5>

        {/* ✅ Chart */}
        <div style={{ width: "100%", height: "calc(100% - 30px)" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
            >
              <CartesianGrid stroke="#e0e0e0" strokeWidth={0.6} vertical={false} />
              <XAxis
                dataKey="department"
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
              <Tooltip
                formatter={(value) => `${value}%`}
                cursor={{ fill: "rgba(0,0,0,0.05)" }}
              />
              <Legend verticalAlign="bottom" height={36} />

              {/* ✅ Stacked bars for Male & Female */}
              <Bar dataKey="Female" stackId="a" fill="#007ACC" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Male" stackId="a" fill="#5BC0EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DiversityInclusion;
