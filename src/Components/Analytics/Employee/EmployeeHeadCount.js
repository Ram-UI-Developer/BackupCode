import React, { useState } from 'react';
import { Label, Pie, PieChart, ResponsiveContainer, Legend } from 'recharts';
import { FiMaximize2, FiMoreVertical } from "react-icons/fi"; // ✅ import icons
import { Modal } from 'react-bootstrap';

const EmployeeHeadCount = () => {
  const [headCountData] = useState([
    { name: 'Group A', value: 163, fill: '#71CAB8' },
    { name: 'Group B', value: 508, fill: '#5597FF' },
    { name: 'Group C', value: 39, fill: '#A8D0F0' },
    { name: 'Group D', value: 71, fill: '#82CA9D' },
  ]);
  const [show, setShow] = useState(false);

  const totalCount = headCountData.reduce((acc, entry) => acc + entry.value, 0);

  return (
    <>
      <style>
        {`
          .dashboardHeading::after {
            content: none !important;
          }
        `}
      </style>
      <div className="card h-25rem">
        <div
          className="card-header dashboardHeading"
          style={{
            fontWeight: "600",
            padding: "10px 15px",
            fontSize: "15px",
            display: "flex",
            justifyContent: "space-between", // ✅ title left, icons right
            alignItems: "center",             // ✅ vertically centered
          }}
        >
          <span>Employee Headcount by Company</span>

          {/* ✅ Icons — perfectly right aligned */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end", // ✅ push icons fully right
              gap: "10px",
              color: "#666",
              paddingRight: "5px", // ✅ small spacing from edge
              flexShrink: 0, // ✅ prevent icons from moving inward
            }}
          >
            <FiMaximize2
              size={16}
              style={{ cursor: "pointer" }}
              title="Expand"
              onClick={()=>setShow(true)}
            />
            <FiMoreVertical
              size={16}
              style={{ cursor: "pointer" }}
              title="More options"
            />
          </div>
        </div>



        <div className="card-body d-flex align-items-center justify-content-center">
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={headCountData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="80%"
                  label
                  isAnimationActive
                >
                  <Label
                    value={`Total: ${totalCount}`}
                    position="center"
                    fill="#333"
                    style={{ fontSize: '14px', fontWeight: 'bold' }}
                  />
                </Pie>

                {/* ✅ Add Legend here */}
                <Legend
                  layout="horizontal"       // can be "vertical" or "horizontal"
                  align="center"            // position horizontally: left, center, right
                  verticalAlign="bottom"    // position vertically: top, middle, bottom
                  iconType="circle"         // shape of legend icon (circle, square, etc.)
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <Modal size="lg" centered show={show} onHide={()=>setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Employee Headcount by Company - Expanded View</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Expanded content can go here */}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default EmployeeHeadCount;
