import React, { useEffect, useState } from 'react'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Select from 'react-select'
import { commonCrudSuccess } from '../../../Common/CommonComponents/CustomizedSuccessToastMessages'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'
import ProcessingLoader from '../../../Common/CommonComponents/Loaders/ProcessingLoader'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import { ToastError, ToastSuccess } from '../../../Common/CommonComponents/ToastCustomized'
import { EditIcon } from '../../../Common/CommonIcons/CommonIcons'
import {
    deletewithPerams,
    generatePayrun,
    getAllByOrgId,
    getAllByOrgIdWithMonthAndYear
} from '../../../Common/Services/CommonService'
import Table from '../../../Common/Table/Table'

const PayrunList = () => {
    const userDetails = useSelector((state) => state.user.userDetails) // Get userdetails from redux
    const [loading, setLoading] = useState(false) // State for handling loader
    const [data, setData] = useState([]) // State for payrun list
    const [locationList, setLocationList] = useState([]) // State for location list
    const [location, setLocation] = useState({}) // State for location id
    const [show, setShow] = useState(false) // State toggle modal
    const [selectedId, setSelectedId] = useState('') // State for selected id
    const [isLoading, setIsLoading] = useState(false) // State for handling loader in modal
    // Defined all months
    const monthOptions = [
        { label: 'Jan', value: 1 },
        { label: 'Feb', value: 2 },
        { label: 'Mar', value: 3 },
        { label: 'Apr', value: 4 },
        { label: 'May', value: 5 },
        { label: 'Jun', value: 6 },
        { label: 'Jul', value: 7 },
        { label: 'Aug', value: 8 },
        { label: 'Sep', value: 9 },
        { label: 'Oct', value: 10 },
        { label: 'Nov', value: 11 },
        { label: 'Dec', value: 12 }
    ]
    const [month, setMonth] = useState({}) // State for month

    // for redirect
    const navigate = useNavigate()
    // Fetch payrun and locations when component on mount
    useEffect(() => {
        onGetAllHandler()
        onGetLocationsHandler()
    }, [])

    // get Locations from the api
    const onGetLocationsHandler = () => {
        getAllByOrgId({ entity: 'locations', organizationId: userDetails.organizationId })
            .then((res) => {
                if (res.statusCode == 200) {
                    setLocationList(res.data)
                }
            })
           .catch(()=> {}) // Handle error by doing nothing
    }

    // loacation options
    const locationOptions = locationList
        ? locationList.map((location) => ({ label: location.name, value: location.id }))
        : []

    const onGetAllHandler = () => {
        setLoading(true)
        getAllByOrgIdWithMonthAndYear({
            entity: 'payrun',
            organizationId: userDetails.organizationId,
            year: year.label == undefined ? 0 : year.label,
            month: month.label == undefined ? null : month.label,
            locationId: location.value == undefined ? '' : location.value
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setData(res.data)
                }
                setLoading(false)
            })
            .catch(() => {
                setLoading(false)
            })
    }

    // Fetch api for generate payrun
    const onGenerateHandler = (locationId, year, month) => {
        setIsLoading(true)
        generatePayrun({
            entity: 'monthlypayrun',
            organizationId: userDetails.organizationId,
            locationId: locationId,
            year: year,
            month: month,
            toastSuccessMessage: commonCrudSuccess({
                screen: 'Pay Run',
                operationType: 'generate'
            }),
            screenName: 'Pay Run',
            employeeId: userDetails.employeeId
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setIsLoading(false)
                    ToastSuccess(res.data)
                    onGetAllHandler()
                }
                // setLoading(false)
            })
            .catch((err) => {
                // setLoading(false)
                setIsLoading(false)
                ToastError(err.message)
            })
    }

    // Show modal
    const onShowHandler = (id) => {
        setShow(true)
        setSelectedId(id)
    }

    // Fetch Api for regenarating payrun
    const onReGenerateHandler = () => {
        setIsLoading(true)
        setShow(false)
        deletewithPerams({
            entity: 'monthlypayrun',
            organizationId: userDetails.organizationId,
            id: selectedId,
            toastSuccessMessage: commonCrudSuccess({
                screen: 'Pay run',
                operationType: 're-initiate'
            }),
            screenName: 'Pay Run',
            employeeId: userDetails.employeeId
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setIsLoading(false)
                    ToastSuccess(res.message)
                    onGetAllHandler()
                    setShow(false)
                }
            })
            .catch((err) => {
                setIsLoading(false)
                ToastError(err.message)
            })
    }

    // navigate to payrun detail screen
    const onEditHandler = (row) => {
        navigate('/payrun', { state: { row } })
    }

    // Genaration of last 5 financial years
    const getLastFiveFinancialYears = () => {
        const currentDate = new Date()
        const currentYear = currentDate.getFullYear()
        const currentMonth = currentDate.getMonth() + 1 // Months are 0-based

        const lastFiveFinancialYears = []

        // Determine the starting year of the current financial year
        let startYear = currentMonth < 4 ? currentYear - 1 : currentYear

        for (let i = 0; i < 5; i++) {
            lastFiveFinancialYears.push(`${startYear - i}-${startYear - i + 1}`)
        }

        return lastFiveFinancialYears
    }

    const years = getLastFiveFinancialYears()

    // options for years
    const yearOptions = years.map((year) => ({ label: year, value: year }))
    const [year, setYear] = useState(yearOptions[0]) // State for financial year

    // Fetch api for filter
    const onGetDataHandler = () => {
        onGetAllHandler()
    }

    // colums for table
    const COLUMNS = [
        {
            Header: 'Location Name',
            accessor: 'locationName'
        },
        {
            Header: 'Year',
            accessor: 'year'
        },
        {
            Header: 'Month',
            accessor: 'month'
        },

        {
            Header: 'Status',
            accessor: 'status.label',
            Cell: ({ row }) => <div>{row.original.status ? row.original.status.label : ''}</div>
        },

        {
            Header: 'Re-Initiate',
            accessor: 'reinitiate',
            Cell: ({ row }) => (
                <div>
                    {row.original.status == null ? (
                        ' '
                    ) : (row.original.status && row.original.status.label == 'Initiated') ||
                        (row.original.status && row.original.status.label == 'Saved') ||
                        (row.original.status && row.original.status.label == 'Submitted') ? (
                        <a className="" onClick={() => onShowHandler(row.original.id)}>
                            Re-Initiate
                        </a>
                    ) : (
                        ''
                    )}
                </div>
            )
        },

        {
            Header: () => <div className="text-wrap text-right actions ">Actions</div>,
            accessor: 'actions',
            disableSortBy: true,
            Cell: ({ row }) => (
                <>
                    <div className="text-wrap text-center actionsWidth">
                        {row.original.status ? (
                            <Button
                                type="button"
                                className="iconWidth"
                                variant=""
                                disabled={row.original.id == null}
                                onClick={() => onEditHandler(row.original)}
                            >
                                <EditIcon />
                            </Button>
                        ) : (
                            <a
                                className=""
                                onClick={() =>
                                    onGenerateHandler(
                                        row.original.locationId,
                                        row.original.year,
                                        row.original.month
                                    )
                                }
                            >
                                Initiate
                            </a>
                        )}
                    </div>
                </>
            )
        }
    ]
    return (
        <>
            <section className="section">
                {loading ? <DetailLoader /> : ''}
                {isLoading ? (
                    <ProcessingLoader data="This operation is expected to take few moments. Please wait while we are performing the required operation." />
                ) : (
                    ''
                )}
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="">
                                <PageHeader pageTitle="Payruns" />
                                <div className="row">
                                    <div className="col-sm-6 mb-2">
                                        <div className="row">
                                            <div className="col-sm-12">
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-2"
                                                    controlId="formGroupToDate"
                                                >
                                                    <Form.Label column md={3}>
                                                        Year&Month <span className="error">*</span>
                                                    </Form.Label>
                                                    <Col md={4}>
                                                        <Select
                                                            className="dropdown"
                                                            placeholder="Year"
                                                            options={yearOptions}
                                                            value={year}
                                                            name="year"
                                                            onChange={(e) => setYear(e)}
                                                        />
                                                    </Col>
                                                    <Col md={4}>
                                                        <Select
                                                            className="dropdown"
                                                            placeholder="Select Month"
                                                            options={monthOptions}
                                                            value={month}
                                                            name="month"
                                                            onChange={(e) => setMonth(e)}
                                                        />
                                                    </Col>
                                                </Form.Group>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-sm-4 mb-2">
                                        <div className="row">
                                            <div className="col-sm-12">
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-0"
                                                    controlId="formGroupToDate"
                                                >
                                                    <Form.Label column md={4}>
                                                        Location
                                                    </Form.Label>
                                                    <Col md={8}>
                                                        <Select
                                                            className="dropdown"
                                                            placeholder="Year"
                                                            options={locationOptions}
                                                            value={location}
                                                            name="year"
                                                            onChange={(e) => setLocation(e)}
                                                        />
                                                    </Col>
                                                </Form.Group>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-sm-1 text-center">
                                        <Button
                                            size="sm"
                                            style={{ paddingTop: '4px' }}
                                            variant="addbtn"
                                            onClick={onGetDataHandler}
                                        >
                                            Go
                                        </Button>
                                    </div>
                                </div>
                                <div className="">
                                    <>
                                        <Table
                                            key={data.length}
                                            columns={COLUMNS}
                                            data={data}
                                            serialNumber={true}
                                            pagingSize="12"
                                            removePagination={false}
                                        />
                                    </>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* modal section */}
            <Modal show={show} onHide={() => setShow(false)} backdrop="static" keyboard={false}>
                <Modal.Header className="modalHeader" closeButton>
                    <Modal.Title>Re-Initiate ?</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    "Are you sure you want to re-initiate? All associated data will be permanently
                    erased."
                </Modal.Body>
                <div className="delbtn">
                    <Button className="Button" variant="addbtn" onClick={onReGenerateHandler}>
                        Yes
                    </Button>
                    <Button className="Button" variant="secondary" onClick={() => setShow(false)}>
                        No
                    </Button>
                </div>
            </Modal>
        </>
    )
}

export default PayrunList
