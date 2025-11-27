import React, { useEffect, useState } from 'react' // Importing necessary React hooks
import { EditIcon } from '../../../Common/CommonIcons/CommonIcons' // Importing the edit icon
import DataBetweenDates from '../../../Common/CommonComponents/DataBetweenDates' // Component for filtering data between dates
import PageHeader from '../../../Common/CommonComponents/PageHeader' // Component for displaying the page header
import { Button, Col, Form, Modal, Row, Tooltip } from 'react-bootstrap' // Importing required Bootstrap components
import Table from '../../../Common/Table/Table' // Table component to display data
import Select from 'react-select' // React-select component for dropdown selection
import { useSelector } from 'react-redux' // Hook to access Redux store state
import {
    getAllAppraisalListByLocation,
    getAllById,
    getAppraisalBetweenDates
} from '../../../Common/Services/OtherServices' // API calls
import ApprisalUpdate from './AppraisalUpdate' // Appraisal update component
import { HRGenerate } from './HRGenerate' // HR Generate component for generating appraisals
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader' // Loader component to show while data is loading

// The HRGenerateList component handles the logic for displaying and interacting with the appraisal data.
const HRGenerateList = () => {
    // Retrieving user details from the Redux store
    const userDetails = useSelector((state) => state.user.userDetails)

    // useEffect hook to load locations and employees when the component mounts
    useEffect(() => {
        getAllLocationById() // Fetch locations based on the organization ID
        // getAllEmployees() // Fetch all employees' appraisal data
    }, [])

    // States to manage loading, locations, employees, and various modal visibility
    const [loading, setLoading] = useState(true)
    const [locations, setLocations] = useState([])
    const [defaultId, setDefaultId] = useState([])
    const [locationName, setLocationName] = useState([])

    // Function to fetch all locations for the organization
    const getAllLocationById = () => {
        getAllById({ entity: 'locations', id: userDetails.organizationId })
            .then(
                (res) => {
                    if (res.statusCode == 200) {
                        setLoading(false)
                        // Filter locations based on user access level
                        const accessibleLocations =
                            userDetails.accessible == 'Global'
                                ? res.data
                                : res.data.filter((item1) =>
                                      userDetails.allowedLocations.some(
                                          (item2) => item1.id === item2
                                      )
                                  )
                        // Set locations data and default location
                        setLocations(res.data)
                        if (accessibleLocations) {
                            setLoading(false)
                            setDefaultId(accessibleLocations[0].id)
                            getAllEmployees(accessibleLocations[0].id)
                            setLocationName(accessibleLocations[0].name)
                        }
                    }
                },
                (err) => {
                    setLoading(false)
                    console.log(err)
                }
            )
            .catch((error) => {
                setLoading(false)
                console.log(error)
            })
    }

    // State and handler for location selection
    const [locationList, setLocationList] = useState()
    const handleLocationHandler = (selection) => {
        getAllEmployees(selection.value) // Fetch employee data for selected location
        setLocationList(selection.value)
        setDefaultId(selection.value)
    }

    // Prepare location options for the dropdown
    const locationOptions = locations
        ? locations.map((option) => ({
              value: option.id,
              label: option.name
          }))
        : []

    // State to store employee appraisal data
    const [data, setData] = useState([])

    // Function to fetch all employees for the selected location
    const getAllEmployees = (id) => {
        setLoading(true)
        getAllAppraisalListByLocation({
            entity: 'appraisals',
            organizationId: userDetails.organizationId,
            locationId: id
        })
            .then(
                (res) => {
                    setData(res.data ? res.data : [])
                    setLoading(false)
                },
                (error) => {
                    console.log(error)
                    setLoading(false)
                }
            )
            .catch((err) => {
                setLoading(false)
                console.log(err)
            })
    }

    // States and handlers for managing the edit modal
    const [editShow, setEditShow] = useState(false)
    const [selfId, setSelfId] = useState()

    const handleNavigateSelfDeatilsEdit = (id) => {
        setEditShow(true)
        setSelfId(id) // Set the ID for editing
    }

    const onEditHandlerClose = () => {
        setEditShow(false) // Close the edit modal
    }

    // Column definitions for the Table component
    const COLUMNS = [
        {
            Header: <div className="text-left header">Location</div>,
            accessor: 'locationName',
            Cell: ({ row }) => <div className="text-left">{row.original.locationName}</div>
        },
        {
            Header: <div className="text-left header">Employee</div>,
            accessor: 'employeeName',
            Cell: ({ row }) => (
                <>
                    <Tooltip title={row.original.employeeName} open>
                        {row.original.employeeName}
                    </Tooltip>
                    <div className="text-left employeeNameLenght">{row.original.employeeName}</div>
                </>
            )
        },
        {
            Header: <div className="text-center header">Review Period</div>,
            accessor: 'name',
            Cell: ({ row }) => <div className="text-left">{row.original.name}</div>
        },
        {
            Header: <div className="text-center header">Submission Deadline</div>,
            accessor: 'submissionDeadline',
            Cell: ({ row }) => <div className="text-center">{row.original.submissionDeadline}</div>
        },
        {
            Header: <div className="text-center header">Manager Deadline</div>,
            accessor: 'managerReviewDeadline',
            Cell: ({ row }) => (
                <div className="text-center">{row.original.managerReviewDeadline}</div>
            )
        },
        {
            Header: <div className="text-center header">HR Deadline</div>,
            accessor: 'hrReviewDeadline',
            Cell: ({ row }) => <div className="text-center">{row.original.hrReviewDeadline}</div>
        },
        {
            Header: <div className="text-left header">Reporting Manager</div>,
            accessor: 'managerName',
            Cell: ({ row }) => <div className="text-left">{row.original.managerName}</div>
        },
        {
            Header: <div className="text-left header">Status</div>,
            accessor: 'status',
            Cell: ({ row }) => <div className="text-left">{row.original.status}</div>
        },
        {
            Header: () => <div className="text-wrap text-right actions">Actions</div>,
            accessor: 'actions',
            disableSortBy: true,
            Cell: ({ row }) => (
                <div className="text-wrap text-center actionsWidth">
                    <Button
                        variant=""
                        disabled={row.original.status == 'Completed'}
                        onClick={() => handleNavigateSelfDeatilsEdit(row.original.id)} // Open edit modal
                    >
                        <EditIcon />
                    </Button>
                </div>
            )
        }
    ]

    // States and handlers for data filtering between dates
    const [show, setShow] = useState(false)
    const onShowHandler = () => setShow(true)
    const onCloseHandler = () => setShow(false)

    // Date range and status filters for fetching data between two dates
    const [status, setStatus] = useState('')
    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')

    const handleDataBetweenDates = () => {
        getAppraisalBetweenDates({
            entity: 'appraisals',
            id: defaultId,
            organizationId: userDetails.organizationId,
            fromDate: fromDate,
            toDate: toDate,
            status: status
        })
            .then(
                (res) => {
                    if (res.statusCode == 200) {
                        setData(res.data) // Set filtered data
                    } else {
                        setData([]) // Clear data if no results found
                    }
                },
                (err) => {
                    console.log(err)
                }
            )
            .catch((error) => {
                setLoading(false)
                console.log(error)
            })
    }

    // Status options for filtering appraisal data
    const statusOptions = [
        { label: 'Completed', value: 'Completed' },
        { label: 'Saved', value: 'Saved' },
        { label: 'Submitted', value: 'Submitted' },
        { label: 'Peer Reviewed', value: 'PeerReviewed' },
        { label: 'Reviewed', value: 'Reviewed' },
        { label: 'All', value: 'All' }
    ]

    return (
        <div>
            <section className="section">
                {loading ? <DetailLoader /> : ''}
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="card-primary">
                                <PageHeader pageTitle={'Appraisal Forms'} /> {/* Page Header */}
                                <div className="card-body">
                                    <Row>
                                        <div className="col-7">
                                            <Form.Group
                                                as={Row}
                                                className="mb-3"
                                                controlId="formGroupToDate"
                                            >
                                                <Form.Label column sm={2}>
                                                    Location
                                                </Form.Label>
                                                <Col sm={6}>
                                                    <Select
                                                        value={
                                                            locationList
                                                                ? locationOptions.filter(
                                                                      (e) => e.value == locationList
                                                                  )
                                                                : { label: locationName }
                                                        }
                                                        onChange={handleLocationHandler} // Location selection handler
                                                        options={locationOptions}
                                                    />
                                                </Col>
                                            </Form.Group>
                                        </div>
                                    </Row>
                                    <DataBetweenDates
                                        setFromDate={setFromDate}
                                        setToDate={setToDate}
                                        setStatus={setStatus}
                                        options={statusOptions}
                                        handleGo={handleDataBetweenDates} // Fetch data between selected dates
                                        defaultValue={{ label: 'All' }}
                                    />
                                    <div style={{ marginTop: '2%' }}>
                                        <Button
                                            className="addButton"
                                            variant="addbtn"
                                            onClick={onShowHandler} // Show generate appraisal modal
                                        >
                                            +Generate
                                        </Button>
                                    </div>

                                    <div
                                        style={{
                                            marginTop: '1%',
                                            position: 'absolute',
                                            fontWeight: '500'
                                        }}
                                    >
                                        {data.length > 10 ? (
                                            <span>No. of Records : {data.length}</span>
                                        ) : (
                                            ''
                                        )}
                                    </div>
                                    <Table
                                        columns={COLUMNS} // Pass columns and data to Table component
                                        serialNumber={true}
                                        data={data}
                                        pageSize="10"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* Modal for generating appraisal */}
            <Modal show={show} onHide={onCloseHandler} size="xl">
                <Modal.Header closeButton={onCloseHandler}>
                    <Modal.Title>Generate Appraisal</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <HRGenerate locations={locations} onCloseHandler={onCloseHandler} />
                </Modal.Body>
            </Modal>
            {/* Modal for editing appraisal */}
            <Modal show={editShow} onHide={onEditHandlerClose} size="xl">
                <Modal.Header closeButton={onEditHandlerClose}>
                    <Modal.Title>Appraisal Update</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ApprisalUpdate id={selfId} onEditHandlerClose={onEditHandlerClose} />
                </Modal.Body>
            </Modal>
        </div>
    )
}

export default HRGenerateList
