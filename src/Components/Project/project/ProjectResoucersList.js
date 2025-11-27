import  { useState, useEffect } from 'react'
import Table from '../../../Common/Table/Table'
import { Button } from 'react-bootstrap'
import {
    getAllByOrgIdActiveStatus,
    getById
} from '../../../Common/Services/CommonService'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Select from 'react-select'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { DatePicker } from 'antd'
import moment from 'moment'
import { AddIcon, EditIcon, DeleteIcon } from '../../../Common/CommonIcons/CommonIcons'
import TableHeader from '../../../Common/CommonComponents/TableHeader'
import DateFormate from '../../../Common/CommonComponents/DateFormate'
import {
    deleteProjectResourceById,
    getAllClientResources
} from '../../../Common/Services/OtherServices'
import { cancelButtonName } from '../../../Common/Utilities/Constants'
import { ToastError, ToastSuccess } from '../../../Common/CommonComponents/ToastCustomized'
import { commonCrudSuccess } from '../../../Common/CommonComponents/CustomizedSuccessToastMessages'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'

const ProjectResourceList = ({
    projectResources,
    setProjectResources,
    devMode,
    expectedStartDate,
    expectedEndDate,
    actualStartDate,
    actualEndDate,
    clientId
}) => {
    // Get logged-in user details from Redux store
    const userDetails = useSelector((state) => state.user.userDetails)

    // State variables for data, modals, loading, selection and form
    const [data, setData] = useState(projectResources)
    const [pop, setPop] = useState({})
    const [loading, setLoading] = useState(false)
    const [selectedId, setSelectedId] = useState('')
    const [show, setShow] = useState(false)
    const [deleteShow, setDeleteShow] = useState(false)
    const [index, setIndex] = useState('')

    // Dropdown select options
    const [options, setOptions] = useState([])
    const [optionsManager, setOptionsManager] = useState([])

    // Selected values
    const [employeeSelect, setEmployeeSelect] = useState({})
    const [managerSelect, setManagerSelect] = useState()
    const [clientResources, setClientResources] = useState([])

    // Date values
    const [startDate, setStartDate] = useState()
    const [endDate, setEndDate] = useState()
    const [dateOfJoining, setDateOfJoining] = useState(null)

    // Form values
    const [remarks, setRemarks] = useState('')
    const [role, setRole] = useState('')
    const [formErrors, setFormErrors] = useState({})

    // Mode for Add/Edit
    const [mode, setMode] = useState('')

    // Track whether Internal or External employee
    const [selectedRadio, setSelectedRadio] = useState('Internal')

    // Close modal and reset all form fields
    const handleClose = () => {
        setPop({})
        setMode('')
        setSelectedId(null)
        setEmployeeSelect({})
        setManagerSelect(null)
        setStartDate(null)
        setEndDate(null)
        setRole(null)
        setRemarks(null)
        setShow(false)
        setFormErrors([])
    }

    // Update local state whenever props change
    useEffect(() => {
        setData(projectResources)
    }, [projectResources])

    // Fetch employee list from API (Internal)
    const getEmployeeList = () => {
        setLoading(true)
        getAllByOrgIdActiveStatus({
            entity: 'employees',
            status: 'Active',
            organizationId: userDetails.organizationId,
            locationId: userDetails.locationId
        })
            .then((res) => {
                employeeSelectHandler(res.data)
                setLoading(false)
            })
            .catch(() => {
                setLoading(false)
            })
    }

    // Fetch client resource list from API (External)
    const clientResourceList = () => {
        setLoading(true)
        getAllClientResources({
            entity: 'clientresource',
            organizationId: userDetails.organizationId,
            id: clientId
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setClientResources(res.data)
                    setLoading(false)
                }
            })
            .catch((err) => {
                console.log(err)
                setLoading(false)
            })
    }

    // Handle Internal/External radio switch
    const handleRadioChange = (value) => {
        setSelectedRadio(value)
        if (value == 'Internal') {
            getEmployeeList()
        }
        if (value == 'External') {
            clientResourceList()
        }
    }

    // Handle start date selection
    const startDateChange = (date) => {
        let selectedDate = moment(date).format('YYYY-MM-DD')
        setFormErrors({
            ...formErrors,
            startDate: !date ? 'Required' : ''
        })
        setStartDate(selectedDate)
    }

    // Handle remarks input
    const handleInputChange = (e) => {
        setRemarks(e.target.value.trimStart().replace(/\s+/g, ' '))
    }

    // Handle role input
    const onInputChange = (e) => {
        !e.target.value
            ? setFormErrors({ ...formErrors, role: 'Required' })
            : setFormErrors({ ...formErrors, role: '' })
        setRole(e.target.value.trimStart().replace(/\s+/g, ' '))
    }

    // Handle end date selection
    const endDateChange = (date) => {
        let selectedDate = moment(date).format('YYYY-MM-DD')
        setEndDate(selectedDate)
    }

    // Map employee list into dropdown-friendly format
    const employeeSelectHandler = (data) => {
        let optionsMapped = data.map((option) => ({
            value: option.id,
            label: option.name
        }))
        setOptions(optionsMapped)
        setOptionsManager(optionsMapped)
    }

    // Prepare client resources in dropdown-friendly format
    const clientResourceOptions =
        clientResources.length > 0
            ? clientResources.map((option) => ({
                  value: option.id,
                  label: option.name
              }))
            : []

    // Set selected employee
    const handleEmployeeSelection = (selection) => {
        setEmployeeSelect(selection)
        getEmployeeById(selection.value)
    }

    // Fetch employee details when selection changes
    // useEffect(() => {
    //     if (employeeSelect) {
    //         getEmployeeById()
    //     }
    // }, [employeeSelect])

    // Get selected employee details and their manager (if not editing)
    const getEmployeeById = (id) => {
        setLoading(true)
        getById({
            entity: 'employees',
            organizationId: userDetails.organizationId,
            id: id
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    if (mode != 'edit') {
                        const currentReportingManager =
                            res.data.reportingmanagerDTOs && res.data.reportingmanagerDTOs[0]

                        if (currentReportingManager) {
                            // Only set manager if they are already part of the project
                            if (
                                projectResources.some(
                                    (resource) =>
                                        resource.employeeId === currentReportingManager.managerId
                                )
                            ) {
                                setManagerSelect({
                                    value: currentReportingManager.managerId,
                                    label: currentReportingManager.managerName
                                })
                            }
                        }
                    }
                    setDateOfJoining(res.data.dateOfJoining)
                    setLoading(false)
                }
            })
            .catch(() => {
                setLoading(false)
            })
    }

    // Set selected manager (internal or external)
    const handleManagerSelection = (selection) => {
        setFormErrors({
            ...formErrors,
            projectManagerId: !selection ? 'Required' : ''
        })
        setManagerSelect(selection)
    }

    const handleClientResourceSelection = (selection) => {
        setFormErrors({
            ...formErrors,
            projectManagerId: !selection ? 'Required' : ''
        })
        setManagerSelect(selection)
    }

    // Basic validation before saving
    const validate = (values) => {
        const errors = {}
        if (values.startDate == null) {
            errors.startDate = 'Required'
        }
        if (values.employeeId == undefined) {
            errors.employeeId = 'Required'
        }
        if (!values.role) {
            errors.role = 'Required'
        }
        if (values.projectManagerId == undefined) {
            errors.projectManagerId = 'Required'
        }

        return errors
    }

    // Update existing resource or to add a new resource in list
    const onUpdateHandler = (e) => {
        let obj
        if (devMode == 'create') {
            obj = {
                startDate: startDate,
                endDate: endDate,
                role: role,
                remarks: remarks,
                employeeId: employeeSelect && employeeSelect.value,
                employeeName: employeeSelect && employeeSelect.label,
                organizationId: userDetails.organizationId,
                projectManagerId: managerSelect && managerSelect.value,
                managerType: selectedRadio
            }
        } else {
            obj = {
                id: selectedId,
                startDate: startDate,
                endDate: endDate,
                role: role,
                remarks: remarks,
                employeeId: employeeSelect && employeeSelect.value,
                employeeName: employeeSelect && employeeSelect.label,
                organizationId: userDetails.organizationId,
                projectManagerId: managerSelect && managerSelect.value,
                managerType: selectedRadio,
                createdBy: pop.createdBy,
                createdDate: pop.createdDate,
                deleted: pop.deleted,
                firstName: pop.firstName,
                lastName: pop.lastName,
                managerFirstName: pop.managerFirstName,
                managerLastName: pop.managerLastName,
                modifiedBy: pop.modifiedBy,
                modifiedDate: pop.modifiedDate,
                organizationName: pop.organizationName,
                projectId: pop.projectId,
                projectName: pop.projectName,
                projectManagerName: pop.projectManagerName,
                projectStatusName: pop.projectStatusName
            }
        }
        // Validate required fields
        if (obj.startDate == null) {
            setFormErrors(validate(obj))
        } else if (!obj.role) {
            setFormErrors(validate(obj))
        } else if (obj.employeeId == undefined) {
            setFormErrors(validate(obj))
        } else if (obj.projectManagerId == undefined) {
            setFormErrors(validate(obj))
        } else {
            // For 'create' mode: Check date overlap
            if (e == 'create') {
                let isWithinRange = false
                const selectedEmployeeRecords = projectResources.filter(
                    (projR) => projR.employeeId == employeeSelect.value
                )
                if (selectedEmployeeRecords.length > 0) {
                    isWithinRange = selectedEmployeeRecords.some((selectedEmployee) => {
                        if (selectedEmployee.endDate == null || selectedEmployee == undefined) {
                            return true
                        }

                        return moment(obj.startDate).isBetween(
                            moment(selectedEmployee.startDate),
                            moment(selectedEmployee.endDate),
                            undefined,
                            '[]'
                        )
                    })

                    if (isWithinRange) {
                        toast.error('The employee is already active for the selected period.')
                        return
                    }
                }
                // Add new resource
                setProjectResources([...projectResources, obj])
                handleClose()
            } else {
                // Update existing resource
                const updatedResources = [...projectResources]
                updatedResources[index] = obj // Update the specific resource immutably
                setProjectResources(updatedResources) // Update the state with the new array
                handleClose()
            }
        }
    }
    // Trigger add mode and open modal
    const onAddHandler = () => {
        getEmployeeList()
        setMode('create')
        setShow(true)
        setSelectedRadio('Internal')
    }

    const COLUMNS = [
        {
            Header: 'S.No',
            accessor: '',
            style: { overflowWrap: 'break-word' },
            width: '40%',
            Cell: ({ row }) => (
                <>
                    <div className="text-center">{row.index + 1}</div>
                </>
            )
        },
        {
            Header: 'Employee',
            accessor: 'employeeName'
        },
        {
            Header: 'Start Date',
            accessor: 'startDate',
            Cell: ({ row }) => <div>{<DateFormate date={row.original.startDate} />}</div>
        },
        {
            Header: 'End Date',
            accessor: 'endDate',
            Cell: ({ row }) => (
                <div>{row.original.endDate && <DateFormate date={row.original.endDate} />}</div>
            )
        },
        {
            Header: 'Role',
            accessor: 'role'
        },
        {
            Header: 'Status',
            accessor: '',
            Cell: ({ row }) => (
                <div>
                    {row.original.endDate &&
                    moment(row.original.endDate).isSameOrBefore(moment(), 'day')
                        ? 'Inactive'
                        : 'Active'}
                </div>
            )
        },
        {
            Header: () => <div className="text-wrap text-right actions">Actions</div>,
            accessor: 'actions',
            disableSortBy: true,
            Cell: ({ row }) => (
                <>
                    <div className="text-wrap text-right actionsWidth">
                        <Button
                            type="button"
                            className="iconWidth"
                            variant=""
                            onClick={() => handleEdit(row.original, row.index)}
                        >
                            <EditIcon />
                        </Button>
                        |
                        <Button
                            type="button"
                            className="iconWidth"
                            variant=""
                            disabled={moment(row.original.endDate).isSameOrBefore(moment(), 'day')}
                            onClick={() => proceedDelete(row.original.id, row.index)}
                        >
                            <DeleteIcon />
                        </Button>
                    </div>
                </>
            )
        }
    ]

    const proceedDelete = (id, index) => {
        setSelectedId(id)
        setDeleteShow(true)
        setIndex(index)
    }
    // Handle edit mode, populating fields with existing resource data
    const handleEdit = (data, index) => {
        getEmployeeList()
        setIndex(index)
        setPop(data)
        setMode('edit')
        setSelectedId(data.id)
        setEmployeeSelect({ value: data.employeeId, label: data.employeeName })
        setManagerSelect({ value: data.projectManagerId, label: data.employeeName })
        setRemarks(data.remarks)
        setStartDate(data.startDate)
        setEndDate(data.endDate)
        setRole(data.role)
        setShow(true)
        setSelectedRadio(data.managerType)
        // if (employeeSelect) {
        getEmployeeById(data.employeeId)
        // }
        if (data.managerType == 'External') {
            clientResourceList()
        }
    }

    const onDeleteHandler = () => {
        if (typeof selectedId == 'number') {
            setLoading(true)
            deleteProjectResourceById({
                entity: 'projects',
                organizationId: userDetails.organizationId,
                id: selectedId,
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Project Resource',
                    operationType: 'delete'
                }),
                screenName: 'Project Resource'
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        // toast.success("Record deleted successfully...")
                        ToastSuccess(res.message)
                        const remainingObj = projectResources.filter(
                            (projR) => projR.id != selectedId
                        )
                        setProjectResources([...remainingObj, res.data])
                        setData([...remainingObj, res.data])
                    }
                    // else {
                    //     toast.error(res.errorMessage)
                    // }
                    setDeleteShow(false)
                    setLoading(false)
                })
                .catch((err) => {
                    ToastError(err.message)
                    setLoading(false)
                })
        } else {
            const rows = [...data]
            rows.splice(index, 1)
            setData(rows)
            setDeleteShow(false)
            setProjectResources(rows)
        }
    }

    return (
        <>
            <div style={{ marginTop: '5%' }}>
                <TableHeader tableTitle={'Project Resource'} />
                <div className="">
                    <Button className="addButton" variant="addbtn" onClick={onAddHandler}>
                        <AddIcon />
                    </Button>

                    {loading ? <DetailLoader /> : <Table key={data.length} columns={COLUMNS} data={data} />}
                </div>

                <Modal
                    show={show}
                    onHide={handleClose}
                    backdrop="static"
                    keyboard={false}
                    size="xl"
                >
                    <Modal.Header closeButton={handleClose}>
                        <Modal.Title>
                            {mode == 'create' ? 'Add Resource' : 'Update Resource'}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {loading ? <DetailLoader /> : ''}
                        <div className="center" style={{ paddingLeft: '2%', paddingRight: '2%' }}>
                            <form className="card-body">
                                <div className="row">
                                    <div className="col-6">
                                        <Form.Group className="mb-3" as={Row}>
                                            <Form.Label column sm={4}>
                                                Employee <span className="error">*</span>
                                            </Form.Label>
                                            <Col sm={7}>
                                                <Select
                                                    placeholder=""
                                                    // options={options.filter((option) => !projectResources.map((e) => e.employeeId).includes(option.value))}
                                                    options={options}
                                                    value={options.filter(
                                                        (option) =>
                                                            employeeSelect &&
                                                            option.value == employeeSelect.value
                                                    )}
                                                    onChange={handleEmployeeSelection}
                                                    onBlur={() =>
                                                        !employeeSelect
                                                            ? setFormErrors({
                                                                  ...formErrors,
                                                                  employeeId: 'Required'
                                                              })
                                                            : setFormErrors({
                                                                  ...formErrors,
                                                                  employeeId: '',projectManagerId: ''
                                                              })
                                                    }
                                                    isDisabled={mode == 'edit' ? true : false}
                                                />
                                                <p className="error">
                                                    {formErrors.employeeId}
                                                </p>
                                            </Col>
                                        </Form.Group>
                                    </div>

                                    <div className="col-6">
                                        <Form.Group className="mb-3" as={Row}>
                                            <Form.Label column sm={4}>
                                                Role <span className="error">*</span>
                                            </Form.Label>
                                            <Col sm={7}>
                                                <Form.Control
                                                    required
                                                    type="text"
                                                    name="role"
                                                    defaultValue={role}
                                                    maxLength={50}
                                                    onChange={onInputChange}
                                                    onBlur={(e) =>
                                                        !e.target.value
                                                            ? setFormErrors({
                                                                  ...formErrors,
                                                                  role: 'Required'
                                                              })
                                                            : setFormErrors({
                                                                  ...formErrors,
                                                                  role: ''
                                                              })
                                                    }
                                                />
                                                <p className="error">{formErrors.role}</p>
                                            </Col>
                                        </Form.Group>
                                    </div>

                                    <div className="col-6">
                                        <Form.Group className="mb-3" as={Row}>
                                            <Form.Label column sm={4}>
                                                Manager Type <span className="error">*</span>
                                            </Form.Label>
                                            <Col sm={7}>
                                                <div className="radioAlign">
                                                    <input
                                                        type="radio"
                                                        value="Internal"
                                                        checked={selectedRadio === 'Internal'}
                                                        onChange={() =>
                                                            handleRadioChange('Internal')
                                                        }
                                                    />
                                                    &ensp;
                                                    <span>Internal</span>&emsp;&ensp;
                                                    {/* <br /> */}
                                                    <input
                                                        type="radio"
                                                        value="External"
                                                        checked={selectedRadio === 'External'}
                                                        onChange={() =>
                                                            handleRadioChange('External')
                                                        }
                                                    />
                                                    &ensp;
                                                    <span>External</span>
                                                </div>
                                            </Col>
                                        </Form.Group>
                                    </div>

                                    <div className="col-6">
                                        <Form.Group className="mb-3" as={Row}>
                                            <Form.Label column sm={4}>
                                                Manager <span className="error">*</span>
                                            </Form.Label>
                                            <Col sm={7}>
                                                {selectedRadio == 'Internal' ? (
                                                    <Select
                                                        placeholder=""
                                                        options={optionsManager.filter(
                                                            (option) =>
                                                                option.value != employeeSelect.value
                                                        )} //issue #1656: added filter to remove selected employee from manager list
                                                        isDisabled={
                                                            !employeeSelect.value ? true : false
                                                        }
                                                        value={
                                                            optionsManager.find(
                                                                (option) =>
                                                                    managerSelect &&
                                                                    option.value ===
                                                                        managerSelect.value
                                                            ) || null
                                                        }
                                                        onBlur={() =>
                                                            !managerSelect
                                                                ? setFormErrors({
                                                                      ...formErrors,
                                                                      projectManagerId: 'Required'
                                                                  })
                                                                : setFormErrors({
                                                                      ...formErrors,
                                                                      projectManagerId: ''
                                                                  })
                                                        }
                                                        onChange={handleManagerSelection}
                                                    />
                                                ) : (
                                                    <Select
                                                        placeholder=""
                                                        options={clientResourceOptions.filter(
                                                            (option) =>
                                                                option.value != employeeSelect.value
                                                        )} //issue #1656: added filter to remove selected employee from manager list
                                                        isDisabled={
                                                            !employeeSelect.value ? true : false
                                                        }
                                                        value={clientResourceOptions.filter(
                                                            (option) =>
                                                                managerSelect &&
                                                                option.value == managerSelect.value
                                                        )}
                                                        onBlur={() =>
                                                            !managerSelect
                                                                ? setFormErrors({
                                                                      ...formErrors,
                                                                      projectManagerId: 'Required'
                                                                  })
                                                                : setFormErrors({
                                                                      ...formErrors,
                                                                      projectManagerId: ''
                                                                  })
                                                        }
                                                        onChange={handleClientResourceSelection}
                                                    />
                                                )}
                                                <p className="error">
                                                    {formErrors.projectManagerId}
                                                </p>
                                            </Col>
                                        </Form.Group>
                                    </div>

                                    <div className="col-6">
                                        <Form.Group className="mb-3" as={Row}>
                                            <Form.Label column sm={4}>
                                                Start Date <span className="error">*</span>
                                            </Form.Label>
                                            <Col sm={7}>
                                                <DatePicker
                                                    required
                                                    inputReadOnly={true}
                                                    allowClear={false}
                                                    defaultValue={
                                                        startDate != null ? moment(startDate) : null
                                                    }
                                                    name="startDate"
                                                    placeholder={''}
                                                    onChange={startDateChange}
                                                    format={'DD-MM-YYYY'}
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
                                                    className="datepicker"
                                                    // dropdownAlign={{
                                                    //     points: ['tr', 'br'], // Aligns the top-right of the dropdown to the bottom-right of the input
                                                    //     offset: [0, 4], // Adjusts position by 4px down
                                                    // }}
                                                    // placement="bottomRight"
                                                    dropdownAlign={{
                                                        points: ['tl', 'tr'], // Aligns the top-left of the dropdown to the top-right of the input
                                                        offset: [0, 0] // Adjust horizontal/vertical offset (optional)
                                                    }}
                                                    getPopupContainer={() => document.body}
                                                    disabledDate={(current) => {
                                                        const expectedStart = moment(
                                                            expectedStartDate,
                                                            'YYYY-MM-DD'
                                                        ).startOf('day')
                                                        const expectedEnd = moment(
                                                            expectedEndDate,
                                                            'YYYY-MM-DD'
                                                        ).endOf('day')
                                                        const actualStart = moment(
                                                            actualStartDate,
                                                            'YYYY-MM-DD'
                                                        ).startOf('day')
                                                        const actualEnd = moment(
                                                            actualEndDate,
                                                            'YYYY-MM-DD'
                                                        ).endOf('day')
                                                        const resourceEnd = moment(
                                                            endDate,
                                                            'YYYY-MM-DD'
                                                        ).endOf('day')
                                                        const joiningDate = moment(
                                                            dateOfJoining,
                                                            'YYYY-MM-DD'
                                                        ).startOf('day')
                                                        return (
                                                            current &&
                                                            (current.isBefore(expectedStart) ||
                                                                current.isBefore(actualStart) ||
                                                                current.isBefore(joiningDate) ||
                                                                current.isAfter(expectedEnd) ||
                                                                current.isAfter(actualEnd) ||
                                                                current.isAfter(resourceEnd))
                                                        )
                                                    }}
                                                />
                                                <p className="error">
                                                    {formErrors.startDate}
                                                </p>
                                            </Col>
                                        </Form.Group>
                                    </div>

                                    <div className="col-6">
                                        <Form.Group className="mb-3" as={Row}>
                                            <Form.Label column sm={4}>
                                                End Date
                                            </Form.Label>
                                            <Col sm={7}>
                                                <DatePicker
                                                    inputReadOnly={true}
                                                    allowClear={false}
                                                    defaultValue={
                                                        endDate != null ? moment(endDate) : null
                                                    }
                                                    placeholder={''}
                                                    name="endDate"
                                                    onChange={endDateChange}
                                                    format={'DD-MM-YYYY'}
                                                    className="datepicker"
                                                    dropdownAlign={{
                                                        points: ['tl', 'tr'], // Aligns the top-left of the dropdown to the top-right of the input
                                                        offset: [0, 0] // Adjust horizontal/vertical offset (optional)
                                                    }}
                                                    getPopupContainer={() => document.body}
                                                    disabledDate={(current) => {
                                                        // const expectedStart = expectedStartDate
                                                        //     ? moment(
                                                        //           expectedStartDate,
                                                        //           'YYYY-MM-DD'
                                                        //       ).startOf('day')
                                                        //     : null
                                                        const expectedEnd = expectedEndDate
                                                            ? moment(
                                                                  expectedEndDate,
                                                                  'YYYY-MM-DD'
                                                              ).endOf('day')
                                                            : null
                                                        // const actualStart = actualStartDate
                                                        //     ? moment(
                                                        //           actualStartDate,
                                                        //           'YYYY-MM-DD'
                                                        //       ).startOf('day')
                                                        //     : null
                                                        const actualEnd = actualEndDate
                                                            ? moment(
                                                                  actualEndDate,
                                                                  'YYYY-MM-DD'
                                                              ).endOf('day')
                                                            : null
                                                        const resourceStart = startDate
                                                            ? moment(
                                                                  startDate,
                                                                  'YYYY-MM-DD'
                                                              ).startOf('day')
                                                            : null

                                                        // return (

                                                        //     current && (current.isBefore(expectedStart) || current.isBefore(actualStart) || current.isAfter(expectedEnd) || current.isAfter(actualEnd) || current.isBefore(resourceStart))
                                                        // );
                                                        return (
                                                            (current &&
                                                                current.isBefore(
                                                                    moment().startOf('day')
                                                                )) ||
                                                            current.isAfter(expectedEnd) ||
                                                            current.isAfter(actualEnd) ||
                                                            current.isBefore(resourceStart)
                                                            // current && (current.isBefore(expectedStartDate) || current.isBefore(actualStartDate))
                                                        )
                                                    }}
                                                />
                                            </Col>
                                        </Form.Group>
                                    </div>
                                    <div className="col-6 mb-4">
                                        <Form.Group as={Row}>
                                            <Form.Label column sm={4}>
                                                Remarks
                                            </Form.Label>
                                            <Col sm={7}>
                                                <Form.Control
                                                    required
                                                    as="textarea"
                                                    maxLength={150}
                                                    name="remarks"
                                                    defaultValue={remarks}
                                                    onChange={handleInputChange}
                                                />
                                            </Col>
                                        </Form.Group>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </Modal.Body>

                    <div className="btnCenter mb-3">
                        {mode == 'create' && (
                            <Button
                                type="submit"
                                className="Button"
                                variant="addbtn"
                                onClick={() => onUpdateHandler('create')}
                                style={{ marginRight: '2%' }}
                            >
                                Save
                            </Button>
                        )}
                        {mode == 'edit' && (
                            <Button
                                type="submit"
                                className="Button"
                                variant="addbtn"
                                onClick={() => onUpdateHandler('edit')}
                                style={{ marginRight: '2%' }}
                            >
                                Update
                            </Button>
                        )}

                        <Button
                            variant="secondary"
                            className="Button"
                            style={{ marginRight: '2%' }}
                            onClick={handleClose}
                        >
                            {cancelButtonName}
                        </Button>
                    </div>
                </Modal>

                <Modal
                    show={deleteShow}
                    onHide={() => setDeleteShow(false)}
                    backdrop="static"
                    keyboard={false}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Delete</Modal.Title>
                        {/* <Button variant="secondary" onClick={() => setDeleteShow(false)}>X</Button> */}
                    </Modal.Header>
                    <Modal.Body className="modalBody">
                        Are you sure, Do you want to delete?
                    </Modal.Body>
                    <div className="delbtn">
                        <Button variant="addbtn" className="Button" onClick={onDeleteHandler}>
                            YES
                        </Button>
                        <Button
                            variant="secondary"
                            className="Button"
                            onClick={() => setDeleteShow(false)}
                        >
                            NO
                        </Button>
                    </div>
                </Modal>
            </div>
        </>
    )
}

export default ProjectResourceList
