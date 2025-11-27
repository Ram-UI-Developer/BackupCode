import moment from 'moment'
import React, { useEffect, useState } from 'react'
import Modal from 'react-bootstrap/Modal'
import { useSelector } from 'react-redux'
import DetailLoader from '../../../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../../../Common/CommonComponents/PageHeader'
import { getAllReportsByManagerId } from '../../../../Common/Services/OtherServices'
import Table1 from '../../../../Common/Table/Table1'
import EmployeeReports from './EmployeeReports'

const ReportList = () => {
    const userDetails = useSelector((state) => state.user.userDetails) // Get userdetsils form redux
    const [show, setShow] = useState(false) // State for Modal
    const [loading, setLoading] = useState(false) // State for handling loader
    const [isDirectSubordinateChecked, setIsDirectSubordinateChecked] = useState(true) // State for direct reporties
    const [isIndirectSubordinateChecked, setIsIndirectSubordinateChecked] = useState(false) // State for indirect reportes
    const [data, setData] = useState([]) // State for data form the apis
    const [employee, setEmployee] = useState({}) // State for employee row data

    // Columns for table
    const COLUMNS = [
        {
            Header: 'Employee ID',
            accessor: 'employeeCode'
        },
        {
            Header: 'Employee Name',
            accessor: 'employeeName'
        },

        {
            Header: 'Location',
            accessor: 'locationName'
        },
        {
            Header: 'Department',
            accessor: 'departmentName'
        },
        {
            Header: 'Shift',
            accessor: 'shiftName',
            Cell: ({ row }) => (
                <>
                    <div className=" text-left">
                        {row.original.shiftName == 'No Shift' ? 'Regular' : row.original.shiftName}
                    </div>
                </>
            )
        },

        {
            Header: 'First Punch In',
            accessor: 'punchIn',
            Cell: ({ row }) => (
                <>
                    <div
                        className={
                            row.original && row.original.punchIn == 'No Punch'
                                ? 'text-center'
                                : 'text-left'
                        }
                    >
                        {row.original.punchIn == 'No Punch' ? '-' : row.original.punchIn}
                    </div>
                </>
            )
        },
        {
            Header: 'Current Status',
            accessor: 'currentStatus',
            Cell: ({ row }) => (
                <>
                    <div
                        className={
                            row.original && row.original.punchIn == 'No Punch'
                                ? 'text-center'
                                : 'text-left'
                        }
                    >
                        {row.original.punchIn == 'No Punch'
                            ? '-'
                            : row.original.currentStatus
                                ? 'Punched In'
                                : 'Punched Out'}
                    </div>
                </>
            )
        },
        ...(isIndirectSubordinateChecked
            ? [
                {
                    Header: 'Manager',
                    accessor: 'managerName',
                    Cell: ({ row }) => (
                        <>
                            <div className=" text-left">{row.original.managerName}</div>
                        </>
                    )
                }
            ]
            : []),

        {
            Header: '',
            accessor: 'action',
            disableSortBy: true,
            Cell: ({ row }) => (
                <div className="text-center">
                    <a
                        className="overallAttendanceLink"
                        onClick={() => attendanceGraphHandler(row.original)}
                    >
                        Overall Attendance
                    </a>
                </div>
            )
        }
    ]

    // Fetch today attendance with api
    const getAllReports = () => {
        getAllReportsByManagerId({
            entity: 'todayattendance',
            organizationId: userDetails.organizationId,
            managerId: userDetails.employeeId,
            directSubOrdinate: isDirectSubordinateChecked,
            inDirectSubOrdinate: isIndirectSubordinateChecked
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setData(res.data)
                } else {
                    setData([])
                }
                setLoading(false)
            })
            .catch(() => {
                setLoading(false)
            })
    }

    // Fetch attendance when component mount with conditions
    useEffect(() => {
        if (isDirectSubordinateChecked || isIndirectSubordinateChecked) {
            setLoading(true)
            getAllReports()
        }
    }, [isDirectSubordinateChecked, isIndirectSubordinateChecked])

    // Change direct reportes state
    const handleDirectSubordinateChange = (event) => {
        setIsDirectSubordinateChecked(event.target.checked)
    }
    // Change indirect reportes state
    const handleIndirectSubordinateChange = (event) => {
        setIsIndirectSubordinateChecked(event.target.checked)
    }

    // Show modal
    const attendanceGraphHandler = (row) => {
        setEmployee(row)
        setShow(true)
    }

    // Close modal
    const handleClose = () => {
        setShow(false)
    }

    // Employees list for dropdown
    const employeeList =
        data.length > 0
            ? data.map((item) => {
                return {
                    value: item.employeeId,
                    label: item.employeeName
                }
            })
            : []

    return (
        <>
            <section className="section">
                {/* loader */}
                {loading ? <DetailLoader /> : ''}
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="  ">
                                {/* page heading */}
                                <PageHeader
                                    pageTitle={`Today's Attendance (${moment(new Date()).format('YYYY-MM-DD')})`}
                                />
                                {/* checkboxs for direct and indirect reportes */}
                                <div
                                    style={{
                                        display: 'flex',
                                        marginLeft: '60%',
                                        paddingBottom: '5px'
                                    }}
                                >
                                    <label>Include </label>
                                    <div style={{ marginRight: '25px' }}>
                                        <label style={{ cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                onChange={handleDirectSubordinateChange}
                                                checked={isDirectSubordinateChecked}
                                                style={{ marginLeft: '10px', cursor: 'pointer' }}
                                            />{' '}
                                            Direct Reportees
                                        </label>
                                    </div>
                                    <div>
                                        <label style={{ cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                onChange={handleIndirectSubordinateChange}
                                                checked={isIndirectSubordinateChecked}
                                                style={{ marginLeft: '10px', cursor: 'pointer' }}
                                            />{' '}
                                            Indirect Reportees
                                        </label>
                                    </div>
                                </div>
                                <div className="table">
                                    {/* Table */}
                                    <Table1 key={data.length} data={data} columns={COLUMNS} serialNumber={true} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* Modal for employee attendance graph */}
            <Modal
                show={show}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
                dialogClassName="custom-modal"
            >
                <Modal.Header className="attendanceHeader" closeButton={handleClose}>
                    <Modal.Title>Overall Attendance</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div
                        className="center"
                        style={{
                            paddingLeft: '2%',
                            paddingRight: '2%',
                            overflow: 'hidden',
                            minHeight: '85vh',
                            maxHeight: '85vh',
                            overflowY: 'scroll'
                        }}
                    >
                        <EmployeeReports empObj={employee} employeeList={employeeList} />
                    </div>
                </Modal.Body>
            </Modal>
        </>
    )
}

export default ReportList
