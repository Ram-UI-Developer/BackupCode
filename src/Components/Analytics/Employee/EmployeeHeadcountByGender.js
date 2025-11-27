import React from "react";
import { Modal } from "react-bootstrap";
import { FiMaximize2, FiMoreVertical } from "react-icons/fi";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";

const EmployeeHeadcountByGender = () => {
    // ✅ Dummy data based on the dashboard look
    const data = [
        {
            gender: "Female",
            acquisition1: 120,
            subsidiary1: 60,
            subsidiary2: 40,
            workday: 100,
        },
        {
            gender: "Male",
            acquisition1: 150,
            subsidiary1: 90,
            subsidiary2: 70,
            workday: 120,
        },
        {
            gender: "Not Declared",
            acquisition1: 30,
            subsidiary1: 15,
            subsidiary2: 10,
            workday: 25,
        },
        {
            gender: "(Blank)",
            acquisition1: 10,
            subsidiary1: 5,
            subsidiary2: 5,
            workday: 15,
        },
    ];

    const [show, setShow] = React.useState(false);

    return (
        <>
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
                    <span>Employee Headcount by Gender</span>

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
                            onClick={() => setShow(true)}
                        />
                        <FiMoreVertical
                            size={16}
                            style={{ cursor: "pointer" }}
                            title="More options"
                        />
                    </div>
                </div>
                <div className="card-body d-flex align-items-center justify-content-center">
                    <div style={{ width: "100%", height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart
                                data={data}
                                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                            >
                                {/* ✅ Grid — only horizontal lines */}
                                <CartesianGrid stroke="#e0e0e0" strokeWidth={0.6} vertical={false} />

                                {/* ✅ X-Axis (Gender categories) */}
                                <XAxis
                                    dataKey="gender"
                                    axisLine={true}
                                    tickLine={false}
                                    style={{ fontSize: 12, fill: "#666" }}

                                />

                                {/* ✅ Y-Axis (Headcount values) */}
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: "#666" }}
                                    label={{
                                        value: "Headcount",
                                        angle: -90,
                                        position: "insideLeft",
                                        offset: 10,
                                        style: { textAnchor: "middle", fill: "#444", fontSize: 13, fontWeight: 500 },
                                    }}
                                />

                                <Tooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} />
                                <Legend verticalAlign="bottom" height={36} />

                                {/* ✅ Stacked Bars with color palette from dashboard */}
                                <Bar dataKey="acquisition1" stackId="a" fill="#71CAB8" name="Acquisition 1" />
                                <Bar dataKey="subsidiary1" stackId="a" fill="#82CA9D" name="Subsidiary 1" />
                                <Bar dataKey="subsidiary2" stackId="a" fill="#A8D0F0" name="Subsidiary 2" />
                                <Bar dataKey="workday" stackId="a" fill="#5597FF" name="Workday" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            <Modal size="lg" centered show={show} onHide={() => setShow(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Employee Headcount by Gender - Expanded View</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* Expanded content can go here */}
                </Modal.Body>
            </Modal>
        </>
    );
};

export default EmployeeHeadcountByGender;
