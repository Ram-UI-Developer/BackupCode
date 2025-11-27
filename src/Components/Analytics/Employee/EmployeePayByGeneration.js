import React from "react";
import { Modal } from "react-bootstrap";
import { FiMaximize2, FiMoreVertical } from "react-icons/fi";
import {
    ResponsiveContainer,
    ScatterChart,
    CartesianGrid,
    XAxis,
    YAxis,
    ZAxis,
    Tooltip,
    Legend,
    Scatter,
} from "recharts";

const EmployeePayByGeneration = () => {
    // Updated dataset: bubbles grow from left → right
    const data = {
        acquisition1: [
            { generation: "Baby Boomer", headcount: 10, pay: 20 },
            { generation: "Gen Z", headcount: 10, pay: 10 },
            { generation: "Gen X", headcount: 70, pay: 80 },
            { generation: "Millennial", headcount: 70, pay: 90 },
        ],
        subsidiary1: [
            { generation: "Baby Boomer", headcount: 10, pay: 20 },
            { generation: "Gen Z", headcount: 10, pay: 10 },
            { generation: "Gen X", headcount: 20, pay: 20 },
            { generation: "Millennial", headcount: 40, pay: 35 },
        ],
        subsidiary2: [
            { generation: "Baby Boomer", headcount: 20, pay: 30 },
            { generation: "Gen Z", headcount: 10, pay: 10 },
            { generation: "Gen X", headcount: 40, pay: 20 },
            { generation: "Millennial", headcount: 20, pay: 10 },
        ],
        workday: [
            { generation: "Baby Boomer", headcount: 70, pay: 240 },
            { generation: "Gen Z", headcount: 30, pay: 10 },
            { generation: "Gen X", headcount: 200, pay: 250 },
            { generation: "Millennial", headcount: 280, pay: 300 },
        ],
    };
    const [show, setShow] = React.useState(false);
    const generations = ["Baby Boomer", "Gen Z", "Gen X", "Millennial"];
    const xMapping = generations.map((g, index) => ({ gen: g, x: index + 1 }));

    const mapData = (arr) =>
        arr.map((d) => ({
            ...d,
            x: xMapping.find((g) => g.gen === d.generation).x,
        }));

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
                    <span>Employee Pay by Generation</span>

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

                <div className="card-body p-0 d-flex align-items-center justify-content-center">
                    <div style={{ width: "100%", height: 320 }}>
                        <ResponsiveContainer>
                            <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 40 }}>
                                {/* ✅ Only horizontal grid lines */}
                                <CartesianGrid stroke="#e0e0e0" strokeWidth={0.6} vertical={false} />

                                {/* ✅ X-Axis with name */}
                                <XAxis
                                    type="number"
                                    dataKey="x"
                                    domain={[0.5, 4.5]}
                                    ticks={[1, 2, 3, 4]}
                                    tickFormatter={(v) => generations[v - 1]}
                                    axisLine={true}
                                    tickLine={false}
                                    style={{ fontSize: 12, fill: "#666" }}

                                />

                                {/* ✅ Y-Axis with name */}
                                <YAxis
                                    type="number"
                                    dataKey="headcount"
                                    name="Headcount"
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

                                {/* ✅ Bubble size controlled by pay */}
                                <ZAxis type="number" dataKey="pay" range={[100, 1200]} name="Pay" />

                                <Tooltip
                                    cursor={{ stroke: "#ccc", strokeWidth: 0.8 }}
                                    formatter={(value, name) => (name === "pay" ? `$${value}K` : value)}
                                />
                                <Legend verticalAlign="bottom" height={36} />

                                {/* ✅ Bubbles per company */}
                                <Scatter name="Acquisition 1" data={mapData(data.acquisition1)} fill="#71CAB8" />
                                <Scatter name="Subsidiary 1" data={mapData(data.subsidiary1)} fill="#82CA9D" />
                                <Scatter name="Subsidiary 2" data={mapData(data.subsidiary2)} fill="#A8D0F0" />
                                <Scatter name="Workday" data={mapData(data.workday)} fill="#5597FF" />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            <Modal size="lg" centered show={show} onHide={() => setShow(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Employee Pay by Generation - Expanded View</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* Expanded content can go here */}
                </Modal.Body>
            </Modal>
        </>
    );
};

export default EmployeePayByGeneration;
