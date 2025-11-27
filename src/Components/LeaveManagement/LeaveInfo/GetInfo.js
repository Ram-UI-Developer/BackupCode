import React from 'react'
import { DatePicker } from 'antd'
import Table from '../../../Common/Table/Table'
import { useState, useMemo } from 'react'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { getEmployeLeavesByID, getLeavesinfoById } from '../../../Services/LMSServises'
import { toast } from 'react-toastify'

const GetInfo = () => {
    // loading table
    const [loading, setLoading] = useState(false)
    // table data
    const [leaves, setLeaves] = useState([])
    const [noOfLeaves, setNoOfLeaves] = useState('')
    const [remainingLeaves, setRemainingLeaves] = useState('')

    // to visible data after click on get button
    const [visible, setVisible] = useState(false)
    // for form data
    const [formData, setFormData] = useState('')

    // get leaves data for relavent employee
    const handleGetInfo = (e) => {
        e.preventDefault()
        getLeaveInfo()
        let empId = formData
        let currentYear = new Date().getFullYear()

        getEmployeLeavesByID(empId, currentYear)
            .then((res) => {
                if (res.statusCode == 200) {
                    setLeaves(res.data)
                    setVisible(true)
                } else {
                    toast.error(res.errorMessage)
                }
            })
            .catch((err) => {
                console.log(err, 'error')
            })
    }

    // handle leaveInfo api
    const getLeaveInfo = () => {
        let empId = formData
        getLeavesinfoById(empId).then((res) => {
            if (res.statusCode == 200) {
                res.data.map((leave) => {
                    if (leave.leaveTypeId == 1) {
                        setNoOfLeaves(leave.leavesTaken)
                        setRemainingLeaves(leave.remainingLeaves)
                    }
                })
            }
        })
    }

    // columns for table(header and accesser)
    const COLUMNS = useMemo(() => [
        {
            Header: 'From Date',
            accessor: 'fromDate'
        },
        {
            Header: 'To Date',
            accessor: 'toDate'
        },
        {
            Header: 'Leave type',
            accessor: 'leaveType',
            Cell: (row) => {
                if (row.value == 1) {
                    return <span className="text-black">Casual Leave</span>
                }
                if (row.value == 2) {
                    return <span className="text-black">Sick Leave</span>
                }
                if (row.value == 3) {
                    return <span className="text-black">Maternity Leave</span>
                }
                if (row.value == 4) {
                    return <span className="text-black">Paternity Leave</span>
                }
                if (row.value == 5) {
                    return <span className="text-black">Bereavement Leave</span>
                } else {
                    return <span className="text-black">Company Leaves</span>
                }
            }
        },
        {
            Header: 'reporting Manager',
            accessor: 'reportingManager'
        },
        {
            Header: 'Status',
            accessor: 'leaveStatus',
            Cell: (row) => {
                if (row.value == null) {
                    return <span className="text-warning">Pending</span>
                } else {
                    return <span className="text-success">Approved</span>
                }
            }
        }
    ])

    return (
        <>
            <br />
            <section className="">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="">
                                <div className="card-header">
                                    <h2
                                        className="card-title"
                                        style={{ color: 'white', fontSize: '25px' }}
                                    >
                                        Get leave info
                                    </h2>
                                </div>
                                <div className="card-body">
                                    {/* form for the search data*/}
                                    <form onSubmit={handleGetInfo}>
                                        <div className="card-body">
                                            <div className="form-Group">
                                                <div className="row">
                                                    <div className="form-Group">
                                                        <div className="col-sm-11">
                                                            <Form.Group
                                                                as={Row}
                                                                className="mb-3"
                                                                controlId="formGroupBranch"
                                                            >
                                                                <Form.Label column sm={7}>
                                                                    Enter Employee Id/ Email Id{' '}
                                                                    <span className="error">
                                                                        *
                                                                    </span>
                                                                    :
                                                                </Form.Label>
                                                                <Col sm={5}>
                                                                    <Form.Control
                                                                        required
                                                                        type="text"
                                                                        onChange={(e) =>
                                                                            setFormData(
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                        name="leaveTypeName"
                                                                    />
                                                                </Col>
                                                            </Form.Group>
                                                        </div>
                                                    </div>
                                                    <div className="form-Group">
                                                        <div className="col-sm-12">
                                                            <Button variant="addbtn" type="submit">
                                                                Get info
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </form>

                                    {/* data after get */}
                                    {visible && (
                                        <div>
                                            <div className="row" style={{ marginLeft: '1%' }}>
                                                <div className="col-sm">
                                                    <b> Employee Id :</b> {leaves[0].employeeId}
                                                </div>
                                                <div className="col-sm">
                                                    <b> Number of leaves taken :</b> {noOfLeaves}
                                                </div>
                                            </div>
                                            <div
                                                className="row"
                                                style={{ marginTop: '2%', marginLeft: '1%' }}
                                            >
                                                <div className="col-sm">
                                                    <b> Email Id :</b> {leaves[0].email}
                                                </div>
                                                <div className="col-sm">
                                                    <b> Number of remaining leaves :</b>{' '}
                                                    {remainingLeaves}
                                                </div>
                                            </div>

                                            <div className="card-body">
                                                {/* table */}
                                                <div className="row">
                                                    {loading ? (
                                                        <div className="loader"></div>
                                                    ) : (
                                                        <Table
                                                            columns={COLUMNS}
                                                            serialNumber={true}
                                                            data={leaves}
                                                            pageSize="10"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default GetInfo
