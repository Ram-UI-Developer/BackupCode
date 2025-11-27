import React, { useEffect, useState } from 'react'
import { Col, Form, Row, Modal } from 'react-bootstrap'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import Select from 'react-select'
import { useSelector } from 'react-redux'
import Table from '../../../Common/Table/Table'
import Loader from '../../../Common/CommonComponents/Loader'
import { getAllByOrgId, getDataBetweenDatesByEmpId } from '../../../Common/Services/CommonService'
import TableWith5Rows from '../../../Common/Table/TableWith5Rows'
import DateFormate from '../../../Common/CommonComponents/DateFormate'
import moment from 'moment'
import {
    getAllEmployeesById,
    getEmpProjectDetails,
    getLeaveBalance
} from '../../../Common/Services/OtherServices'

const EmployeeReports = () => {
    const userDetails = useSelector((state) => state.user.userDetails) // Fetching user details from the redux store using useSelector hook.
    // State hooks to manage loading, access control, data storage, and visibility of modals.
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState([])
    const [projectsShow, setProjectsShow] = useState(false)
    const [leavebalanceShow, setLeaveBalanceShow] = useState(false)
    const [leaveHistoryShow, setLeaveHistoryShow] = useState(false)
    const [managersShow, setManagersShow] = useState(false)
    const [projects, setProjects] = useState([])
    const [leaveBalance, setLeaveBalance] = useState([])
    const [reportingManager, setReportingManager] = useState([])
    const [locationList, setLocationList] = useState([])
    const [leaveHistory, setLeaveHistory] = useState([])

    const today = new Date() // Get the current year.
    const lastYear = new Date(today)
    lastYear.setFullYear(today.getFullYear() - 1) // Set the date to the last year.
    // Function to reset modal states when closing the modals.
    const onCloseHandler = () => {
        setProjectsShow(false)
        setLeaveBalanceShow(false)
        setManagersShow(false)
        setLeaveHistoryShow(false)
        setProjects([])
        setLeaveBalance([])
        setLeaveHistory([])
        setReportingManager([])
    }
    // useEffect hook to fetch employee data and locations when the component mounts.
    useEffect(() => {
        getEmployeeList([userDetails.locationId])
        onGetLocationHandler()
    }, [])
    // Fetch locations for the user's organization.
    const onGetLocationHandler = () => {
        // API call to get all locations by organization ID.
        getAllByOrgId({ entity: 'locations', organizationId: userDetails.organizationId })
            .then(
                (res) => {
                    setLocationList(
                        userDetails.accessible == 'Global'
                            ? res.data
                            : res.data.filter((item1) =>
                                  userDetails.allowedLocations.some((item2) => item1.id === item2)
                              )
                    )
                },
                (error) => {
                    console.log(error)
                }
            )
            .catch((err) => {
                console.log(err)
            })
    }
    // Format the location list into options suitable for the 'react-select' dropdown.
    const locationOtions = locationList
        ? locationList.map((option) => ({
              label: option.name,
              value: option.id
          }))
        : []
    // Function to handle location change in the 'react-select' dropdown.
    const onLocationChange = (e) => {
        getEmployeeList(e.map((location) => location.value))
    }
    // Function to fetch the employee list based on the selected location ID.
    const getEmployeeList = (id) => {
        // API call to fetch employees for a specific location in the user's organization.
        getAllEmployeesById({
            entity: 'employees',
            organizationId: userDetails.organizationId,
            locationId: id
        })
            .then(
                (response) => {
                    setLoading(false)

                    if (response.statusCode == 200) {
                        setLoading(false)
                        setData(response.data ? response.data : [])
                    }
                },
                (err) => {
                    console.log(err)
                    setLoading(false)
                }
            )
            .catch((error) => {
                console.log(error)
                setLoading(false)
            })
    }
    // Function to handle the display of managers' details when invoked.
    const onManagersHandler = (list) => {
        setManagersShow(true)
        setReportingManager(list ? list : [])
    }
    // Function to handle the display of project details when invoked.
    const onProjectsHandler = (id) => {
        setProjectsShow(true)
        getProjectDetails(id)
    }
    // Function to fetch project details based on the employee's ID.
    const getProjectDetails = (id) => {
        getEmpProjectDetails({
            entity: 'projects',
            organizationId: userDetails.organizationId,
            id: id
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setProjects(res.data)
                }
            })
            .catch((err) => {
                console.log(err, 'error')
            })
    }
    // Function to handle the display of leave balance details when invoked.
    const onLeaveBalancesHandler = (id) => {
        setLeaveBalanceShow(true)
        onGetLeaveHandler(id)
    }
    // Function to fetch the leave balance for a specific employee.
    const onGetLeaveHandler = (id) => {
        getLeaveBalance({
            entity: 'employeeleavebalance',
            organizationId: userDetails.organizationId,
            id: id,
            locationId: userDetails.locationId
        })
            .then((res) => {
                setLoading(false)
                if (res.statusCode == 200) {
                    setLeaveBalance(res.data)
                }
            })
            .catch((err) => {
                console.log(err, 'error')
            })
    }
    // Function to handle the display of leave history details when invoked.
    const onLeaveHistoryHandler = (id) => {
        setLeaveHistoryShow(true)
        onGetLeaveHistoryHandler(id)
    }
    // Function to fetch the leave history for an employee within a specific date range (last year to today).
    const onGetLeaveHistoryHandler = (id) => {
        // API call to fetch approved leave records for the employee between the specified date range.
        getDataBetweenDatesByEmpId({
            entity: 'leaves',
            empId: id,
            organizationId: userDetails.organizationId,
            fromDate: moment(lastYear).format('YYYY-MM-DD'),
            toDate: "2099-12-31",
            status: 'Approved'
        })
            .then((res) => {
                setLoading(false)
                if (res.statusCode == 200) {
                    setLeaveHistory(res.data)
                }
            })
            .catch((err) => {
                console.log(err, 'error')
            })
    }
    // Column definitions for the main employee table.
    const COLUMNS = [
        {
            Header: 'Employee Name',
            accessor: 'name'
        },
        {
            Header: 'Employee Id',
            accessor: 'code'
        },
        {
            Header: 'Location Name',
            accessor: 'locationName'
        },
        {
            Header: 'Manager',
            accessor: 'managerName',
            Cell: ({ row }) => (
                <div style={{ padding: '0.5rem 0.1rem 0.5rem 0.1rem' }}>
                    {/* <span>
                        <img src='dist/Images/link.png' className='' height={20} alt='' />
                    </span>
                    &ensp; */}
                    <span>
                        <a
                            className=""
                            onClick={() => onManagersHandler(row.original.reportingmanagerDTOs)}
                        >
                            <u style={{ fontSize: '14px' }}>Manager Info</u>
                        </a>
                    </span>
                </div>
            )
        },
        {
            Header: 'Projects',
            accessor: 'projectName',
            Cell: ({ row }) => (
                <div>
                    {/* <span>
                        <img src='dist/Images/link.png' className='' height={20} alt='' />
                    </span>
                    &ensp; */}
                    <span>
                        <a className="" onClick={() => onProjectsHandler(row.original.id)}>
                            <u style={{ fontSize: '14px' }}>Project Info</u>
                        </a>
                    </span>
                </div>
            )
        },
        {
            Header: 'Leave Balance',
            accessor: 'leaveBalance',
            Cell: ({ row }) => (
                <div>
                    {/* <span>
                        <img src='dist/Images/link.png' className='' height={20} alt='' />
                    </span>
                    &ensp; */}
                    <span>
                        <a className="" onClick={() => onLeaveBalancesHandler(row.original.id)}>
                            <u style={{ fontSize: '14px' }}>Leave Balance</u>
                        </a>
                    </span>
                </div>
            )
        },
        {
            Header: 'Leave History',
            accessor: 'leaveHistory',
            Cell: ({ row }) => (
                <div>
                    {/* <span>
                        <img src='dist/Images/link.png' className='' height={20} alt='' />
                    </span>
                    &ensp; */}
                    <span>
                        <a className="" onClick={() => onLeaveHistoryHandler(row.original.id)}>
                            <u style={{ fontSize: '14px' }}>Leave History</u>
                        </a>
                    </span>
                </div>
            )
        },
        {
            Header: 'Status',
            accessor: 'status'
        }
    ]
    // Column definitions for the manager table.
    const reportingManagerCOLUMNS = [
        {
            Header: 'Manager Name',
            accessor: 'managerName',
            Cell: ({ row }) => <div className="text-left">{row.original.managerName}</div>
        },
        {
            Header: 'Location Name',
            accessor: 'locationName',
            Cell: ({ row }) => <div className="text-left">{row.original.locationName}</div>
        },
        {
            Header: 'Start Date',
            accessor: 'startDate',
            Cell: ({ row }) => (
                <div className="text-left">
                    <DateFormate date={row.original.startDate} />
                </div>
            )
        },
        {
            Header: 'End Date',
            accessor: 'endDate',
            Cell: ({ row }) => (
                <div className="text-left">
                    {row.original.endDate ? <DateFormate date={row.original.endDate} /> : ''}
                </div>
            )
        }
    ]
    // Column definitions for the project table.
    const projectCOLUMNS = [
        {
            Header: 'Project Name',
            accessor: 'projectName',
            Cell: ({ row }) => <div className="text-left">{row.original.projectName}</div>
        },
        {
            Header: 'Start Date',
            accessor: 'startDate',
            Cell: ({ row }) => (
                <div className="text-left">
                    <DateFormate date={row.original.startDate} />
                </div>
            )
        },
        {
            Header: 'End Date',
            accessor: 'endDate',
            Cell: ({ row }) => (
                <div className="text-left">
                    {row.original.endDate ? <DateFormate date={row.original.endDate} /> : ''}
                </div>
            )
        },
        {
            Header: 'Manager',
            accessor: 'projectManagerName',
            Cell: ({ row }) => <div className="text-left">{row.original.projectManagerName}</div>
        },
        {
            Header: 'Status',
            accessor: 'projectStatusName',
            Cell: ({ row }) => <div className="text-left">{row.original.projectStatusName}</div>
        }
    ]
    // Column definitions for the leave balance table.
    const leaveBalanceCOLUMNS = [
        {
            Header: 'Type',
            accessor: 'leaveTypeName',
            Cell: ({ row }) => <div className="text-left">{row.original.leaveTypeName}</div>
        },
        {
            Header: 'Total Credited',
            accessor: 'totalCredited',
            Cell: ({ row }) => (
                <div className="text-right" style={{ paddingRight: '6rem' }}>
                    {row.original.totalCredited}
                </div>
            )
        },
        {
            Header: 'Total Used',
            accessor: 'totalUsed',
            Cell: ({ row }) => (
                <div className="text-right" style={{ paddingRight: '6rem' }}>
                    {row.original.totalUsed}
                </div>
            )
        },
        {
            Header: 'Remaining Balance',
            accessor: 'remaining',
            Cell: ({ row }) => (
                <div className="text-right" style={{ paddingRight: '5rem' }}>
                    {row.original.remaining}
                </div>
            )
        }
    ]
    // Column definitions for the leave history table.
    const leaveHistoryCOLUMNS = [
        {
            Header: 'Type',
            accessor: 'leavetypeName',
            Cell: ({ row }) => <div className="text-left">{row.original.leavetypeName}</div>
        },
        {
            Header: 'From Date',
            accessor: 'fromDate',
            Cell: ({ row }) => <div className="text-left">{row.original.fromDate}</div>
        },
        {
            Header: 'To date',
            accessor: 'toDate',
            Cell: ({ row }) => <div className="text-left">{row.original.toDate}</div>
        },
        {
            Header: 'Total Days',
            accessor: 'numberofDays',
            Cell: ({ row }) => (
                <div className="text-right" style={{ paddingRight: '4rem' }}>
                    {row.original.numberofDays}
                </div>
            )
        }
    ]
    return (
        <div>
            <>
                <>
                    {/* location field and employee main table */}
                    <section className="section">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="">
                                        <PageHeader pageTitle={'Employee Reports'} />
                                        <div className="">
                                            <div className="row mb-2" style={{ marginLeft: '1%' }}>
                                                <div className="col-sm-6">
                                                    <Form.Group
                                                        as={Row}
                                                        controlId="formGroupToDate"
                                                    >
                                                        <Form.Label column md={3}>
                                                            Location
                                                        </Form.Label>
                                                        <Col sm={8}>
                                                            <Select
                                                                isMulti
                                                                placeholder=""
                                                                defaultValue={{
                                                                    label: userDetails.locationName,
                                                                    value: userDetails.locationId
                                                                }}
                                                                options={locationOtions}
                                                                onChange={onLocationChange}
                                                            />
                                                        </Col>
                                                    </Form.Group>
                                                </div>
                                            </div>
                                        </div>

                                        <div
                                            style={{
                                                padding: '1px 8px 0px 8px',
                                                marginLeft: '7px'
                                            }}
                                        >
                                            {loading ? (
                                                <center>
                                                    {' '}
                                                    <Loader />{' '}
                                                </center>
                                            ) : (
                                                <>
                                                    <div className="">
                                                        {data.length > 10 ? (
                                                            <span>
                                                                No. of Records : {data.length}
                                                            </span>
                                                        ) : (
                                                            ''
                                                        )}
                                                    </div>{' '}
                                                    <Table
                                                        columns={COLUMNS}
                                                        serialNumber={true}
                                                        data={data}
                                                    />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    {/* Reporting manager Table */}
                    <Modal
                        show={managersShow}
                        size="lg"
                        onHide={onCloseHandler}
                        backdrop="static"
                        keyboard={false}
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>Reporting Manager Details</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="modalBody">
                            <TableWith5Rows
                                columns={reportingManagerCOLUMNS}
                                serialNumber={true}
                                data={reportingManager}
                            />
                        </Modal.Body>
                    </Modal>
                    {/* Project details Table */}
                    <Modal
                        show={projectsShow}
                        size="lg"
                        onHide={onCloseHandler}
                        backdrop="static"
                        keyboard={false}
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>Project Details</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="modalBody">
                            <TableWith5Rows
                                columns={projectCOLUMNS}
                                serialNumber={true}
                                data={projects}
                            />
                        </Modal.Body>
                    </Modal>
                    {/* leave balance table */}
                    <Modal
                        show={leavebalanceShow}
                        size="lg"
                        onHide={onCloseHandler}
                        backdrop="static"
                        keyboard={false}
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>Leave Balance</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="modalBody">
                            <TableWith5Rows
                                columns={leaveBalanceCOLUMNS}
                                serialNumber={true}
                                data={leaveBalance}
                            />
                        </Modal.Body>
                    </Modal>
                    {/* leave history table */}
                    <Modal
                        show={leaveHistoryShow}
                        size="lg"
                        onHide={onCloseHandler}
                        backdrop="static"
                        keyboard={false}
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>Leave History</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="modalBody">
                            <TableWith5Rows
                                columns={leaveHistoryCOLUMNS}
                                serialNumber={true}
                                data={leaveHistory}
                            />
                        </Modal.Body>
                    </Modal>
                </>
            </>
        </div>
    )
}
export default EmployeeReports
