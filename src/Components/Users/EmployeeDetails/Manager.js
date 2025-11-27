import { DatePicker } from 'antd' // Importing DatePicker component from 'antd' for date selection
import moment from 'moment' // Importing moment for date manipulation
import React, { useEffect, useState } from 'react' // Importing necessary hooks from React
import { Button, Col, Form, Modal, Row } from 'react-bootstrap' // Importing UI components from React-Bootstrap
import { useSelector } from 'react-redux' // Importing Redux hook to access the store
import Select from 'react-select' // Importing Select component for dropdown lists
import { EditIcon } from '../../../Common/CommonIcons/CommonIcons' // Importing EditIcon for UI actions
import { getAllByIdWithStatus } from '../../../Common/Services/CommonService' // Importing API call function for fetching data
import TableWith5Rows from '../../../Common/Table/TableWith5Rows' // Importing a custom table component

const Manager = ({
    employeeData,
    dateOfJoining,
    employeeProfile,
    setManagerGet,
    getAllData,
    managerList,
    managerError
}) => {
    const [show, setShow] = useState('') // State to handle modal visibility
    const userDetails = useSelector((state) => state.user.userDetails) // Getting user details from Redux store
    const [fromDate, setFromDate] = useState(null) // State to store selected from date
    const [name, setName] = useState('') // State to store the manager's name

    // Function to show the modal and set the mode to 'create'
    const onHandleShow = () => {
        setShow(true)
        setMode('create')
    }



    // Function to handle date changes from the date picker
    const handleFromDateChange = (e) => {
        const selectedDate = moment(e).format('YYYY-MM-DD')
        setFromDate(selectedDate)
    }

    const [mode, setMode] = useState('') // State to determine whether it's in 'create' or 'edit' mode

    // Effect hook to determine if the form is in create or edit mode based on employee data
    useEffect(() => {
        if (employeeData.id == null) {
            setMode('create')
        } else {
            setMode('edit')
        }
        getAllEmployee() // Fetch all employees on initial render
    }, [])

    const [manager, setManager] = useState([]) // State to store the list of managers

    // Function to fetch all active employees
    const getAllEmployee = () => {
        getAllByIdWithStatus({
            entity: 'employees',
            organizationId: userDetails.organizationId,
            status: 'Active'
        }).then((res) => {
            if (res.statusCode == 200) {
                // Filter out the current employee from the list of employees
                setManager(res.data.filter((e) => employeeData.id !== e.id))
            }
        })
            .catch((error) => {
                console.log(error)
            })
    }

    const [managerDoj, setManagerDoj] = useState(null) // State to store manager's date of joining
    const [managerId, setManagerId] = useState(null) // State to store selected manager's ID
    const [locationName, setLocationName] = useState('') // State to store the selected location name

    // Function to handle manager selection
    const handleManagerSelection = (selection) => {
        setManagerDoj(selection.doj)
        setManagerId(selection.value)
        setName(selection.label)
        setLocationName(selection.location)
    }

    // Mapping employees data to options for the select dropdown
    const managerOptions = manager
        ? manager.map((option) => ({
            value: option.id,
            label: option.name,
            doj: option.dateOfJoining,
            location: option.locationName
        }))
        : []

    const [data, setData] = useState(managerList) // State to store the manager list data
    useEffect(() => {
        setData(managerList) // Update the manager data when managerList prop changes
    }, [managerList])
    const [formErrors, setFormErrors] = useState({}) // State to handle form validation errors
    const managerLastHistoryName = data && data[data.length - 1]
    // Validation function to check required fields
    const validate = (values) => {
        const errors = {}
        if (values.managerId == undefined) {
            errors.managerId = 'Required'
        }
        if (values.startDate == null) {
            errors.startDate = 'Required'
        }
        if (values.endDate == null) {
            errors.endDate = 'Required'
        }
        return errors
    }

    // Function to add a new reporting manager
    const reportingManager = () => {
        const managerObj = {
            startDate: fromDate,
            managerName: name,
            managerId: managerId,
            locationName: locationName
        }
        if (managerObj.managerId == undefined || managerObj.startDate == null) {
            setFormErrors(validate(managerObj)) // Set form errors if validation fails
        } else {
            const managerData = [...data, managerObj]
            setManagerGet(managerData) // Update parent state with new manager data
            setData(managerData) // Update local state
            onCloseHandler('Add') // Close the modal
            handleClick() // Disable the button after adding
        }
    }

    // Function to update an existing reporting manager
    const updateReportingManager = () => {
        const updateManagerObj = {
            id: managerEdit.id,
            startDate: fromDate ? fromDate : managerEdit.startDate,
            managerName: name,
            managerId: managerId ? managerId : managerEdit.managerId,
            locationName: locationName
        }
        if (updateManagerObj.managerId == '' || updateManagerObj.startDate == null) {
            setFormErrors(validate(updateManagerObj)) // Set form errors if validation fails
        } else {
            const managerData = [...managerList]
            managerData[index] = updateManagerObj // Update the manager data in the array
            setManagerGet(managerData) // Update parent state with the new data
            onCloseHandler('Add') // Close the modal
        }
    }

    const [isDisabled, setIsDisabled] = useState(false) // State to disable the "Add" button after clicking it

    // Function to disable the button once it's clicked
    const handleClick = () => {
        setIsDisabled(true)
    }

    // Table columns for displaying the manager data
    const COLUMNS = [
        {
            Header: 'Manager Name',
            accessor: 'managerName'
        },
        {
            Header: 'Manager Location',
            accessor: 'locationName',
            Cell: ({ row }) => (
                <div>{row.original.locationName}</div> // Custom rendering for location column
            )
        },
        {
            Header: 'Start Date',
            accessor: 'startDate'
        },
        {
            Header: 'End Date',
            accessor: 'endDate'
        },
        {
            Header: () => <div className="text-wrap text-right actions">Actions</div>,
            accessor: 'actions',
            disableSortBy: true,
            Cell: ({ row }) => (
                <div className="text-wrap text-center actionsWidth">
                    <Button
                        type="button"
                        id="managerEdit"
                        variant=""
                        className="iconWidth"
                        onClick={() => onEdithandler(row.original, row.index)}
                    >
                        <EditIcon />
                    </Button>
                </div>
            )
        }
    ]

    const [managerEdit, setManagerEdit] = useState({}) // State for holding the manager being edited
    const [index, setIndex] = useState(null) // State for storing the index of the edited manager
    const dateOfJoiningFormatted = managerDoj ? managerDoj : dateOfJoining
    const managerListED = mode === "create"
        ? (Array.isArray(managerList) && managerList[0] ? managerList[0].startDate : null)
        : (managerEdit ? managerEdit.startDate : null);
    // Function to handle editing of an existing manager
    const onEdithandler = (row, index) => {
        setLocationName(row.locationName)
        setIndex(index)
        setMode('update')
        setManagerEdit(row)
        setFromDate(row.startDate)
        setManagerId(row.managerId)
    }

    // Function to handle closing the modal, either with an action or without
    const onCloseHandler = (action) => {
        if (action == 'Close') {
            setFormErrors('')
            setShow(false)
            setManagerId(null)
            setFromDate(null)
            setManagerDoj(null) // Resetting the manager date of joining
            setLocationName('')
        } else {
            setManagerDoj(null)
            setFromDate(null) // Resetting the from date
            setFormErrors('')
            setShow(false)
            setManagerId(null)
            setLocationName('')
        }
    }
    return (
        <div>
            <div>
                {/* Displaying Manager Details if employeeData is provided */}
                {employeeData.id && (
                    <div className="col-">
                        <Form.Group as={Row} className="mb-3" controlId="managerChange">
                            {/* getAllData.status == "Draft" ? 5 : 5 */}
                            <Form.Label id="managerChange" column sm={5} style={{ whiteSpace: 'nowrap' }}>
                                Reporting Manager <span className="error">*</span>
                            </Form.Label>
                            <Col sm={6} style={{ marginTop: '10px' }}>
                                <div>
                                    <span>
                                        {name
                                            ? managerLastHistoryName &&
                                            managerLastHistoryName.managerName
                                            : getAllData.managerName}
                                    </span>
                                    {getAllData.status == 'Terminated' ? (
                                        ''
                                    ) : (
                                        <span>
                                            <a
                                                className=""
                                                id="changeManager"
                                                style={{ fontWeight: '600' }}
                                                onClick={() => onHandleShow()}
                                            >
                                                (<u>Change</u>)
                                            </a>
                                        </span>
                                    )}
                                </div>
                                <p className="error">{managerError}</p>
                            </Col>
                        </Form.Group>
                    </div>
                )}

                {/* Displaying Manager Details if employeeProfile is provided */}
                {employeeProfile && (
                    <div className="col-">
                        <Form.Group as={Row} className="mb-3" controlId="managerChange">
                            <Form.Label id="managerChange" column sm={5}>
                                Reporting Manager{' '}
                            </Form.Label>
                            <Col sm={6}>
                                <Form.Control
                                    size="sm"
                                    id="managerChange"
                                    required
                                    name="managerId"
                                    readOnly={true}
                                    defaultValue={getAllData.managerName}
                                />
                            </Col>
                        </Form.Group>
                    </div>
                )}
            </div>

            {/* Modal for adding/editing the reporting manager */}
            <Modal size="lg" show={show}>
                <Modal.Header closeButton onHide={() => onCloseHandler('Close')}>
                    <Modal.Title>Reporting Manager</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="row pl-5">
                        <Row>
                            {/* Manager Selection */}
                            <div className="col-6">
                                <Form.Group as={Row} className="mb-3" controlId="managerName">
                                    <Form.Label id="managerName" column sm={4}>
                                        Manager <span className="error">*</span>
                                    </Form.Label>
                                    <Col sm={6}>
                                        <Select
                                            id="managerSelect"
                                            placeholder=""
                                            onChange={handleManagerSelection}
                                            options={managerOptions}
                                            onBlur={() =>
                                                !managerId
                                                    ? setFormErrors({
                                                        ...formErrors,
                                                        managerId: 'Required'
                                                    })
                                                    : setFormErrors({
                                                        ...formErrors,
                                                        managerId: ''
                                                    })
                                            }
                                            value={managerOptions.filter(
                                                (e) => e.value == managerId
                                            )}
                                            type="text"
                                            size="sm"
                                        />
                                        <p className="error">{formErrors.managerId}</p>
                                    </Col>
                                </Form.Group>
                            </div>

                            {/* Start Date Selection */}
                            <div className="col-6">
                                <Form.Group as={Row} className="mb-3" controlId="effectiveDate">
                                    <Form.Label id="effectiveDate" column sm={5}>
                                        Effective Date <span className="error">*</span>
                                    </Form.Label>
                                    <Col sm={7}>
                                        <DatePicker
                                            id="managerEffectiveDate"
                                            placeholder=""
                                            inputReadOnly={true}
                                            value={fromDate == null ? null : moment(fromDate)}
                                            onBlur={(e) =>
                                                !e.target.value
                                                    ? setFormErrors({
                                                        ...formErrors,
                                                        startDate: 'Required'
                                                    })
                                                    : setFormErrors({
                                                        ...formErrors,
                                                        startDate: ''
                                                    })
                                            }
                                            onChange={handleFromDateChange}
                                            allowClear={false}
                                            disabledDate={(current) => {
                                                const joiningDate = moment(dateOfJoiningFormatted, 'YYYY-MM-DD');
                                                const managerDate = moment(managerListED, 'YYYY-MM-DD');
                                                const selectedDate = fromDate ? moment(fromDate, 'YYYY-MM-DD') : null;

                                                // Find the latest of the three dates
                                                let maxDate = joiningDate;
                                                if (managerDate.isAfter(maxDate)) maxDate = managerDate;
                                                if (selectedDate && selectedDate.isAfter(maxDate)) maxDate = selectedDate;

                                                // Allow the selected date when editing
                                                if (selectedDate && current.isSame(selectedDate, 'day')) {
                                                    return false;
                                                }
                                                // Disable all dates on or before the latest of joiningDate, managerDate, selectedDate
                                                return current.isSameOrBefore(maxDate, 'day');
                                            }}
                                        />
                                        <p className="error">{formErrors.startDate}</p>
                                    </Col>
                                </Form.Group>
                            </div>

                            {/* Location */}
                            <div className="col-6">
                                <Form.Group as={Row} className="mb-3" controlId="managerLocation">
                                    <Form.Label id="managerLocation" column sm={4}>
                                        Location
                                    </Form.Label>
                                    <Col sm={6}>
                                        <Form.Control
                                            readOnly
                                            id="managerLocation"
                                            size="sm"
                                            defaultValue={locationName}
                                        />
                                    </Col>
                                </Form.Group>
                            </div>
                        </Row>
                    </div>
                </Modal.Body>

                {/* Table displaying current reporting managers */}
                <div style={{ marginTop: '2%' }} className="table">
                    <TableWith5Rows columns={COLUMNS} serialNumber={true} data={data} />
                </div>

                {/* Modal Footer with buttons */}
                <div className="btnCenter" style={{ margin: '2% 0% 2% 0%' }}>
                    {mode == 'create' && (
                        <Button
                            id="addManager"
                            disabled={isDisabled}
                            className="Button"
                            variant="addbtn"
                            onClick={reportingManager}
                        >
                            Add
                        </Button>
                    )}
                    {mode == 'update' && (
                        <Button
                            variant="addbtn"
                            id="updateManager"
                            className="Button"
                            onClick={updateReportingManager}
                        >
                            Update
                        </Button>
                    )}
                    <Button
                        className="Button"
                        id="closeManager"
                        variant="secondary"
                        onClick={() => onCloseHandler('Close')}
                    >
                        Close
                    </Button>
                </div>
            </Modal>
        </div>
    )
}
export default Manager
