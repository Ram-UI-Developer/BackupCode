import { DatePicker } from 'antd'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { Button, Col, Form, Modal, Row, Tooltip } from 'react-bootstrap'
import DateFormate from '../../../Common/CommonComponents/DateFormate'
import FileViewer from '../../../Common/CommonComponents/FileViewer'
import {
    handleKeyPress
} from '../../../Common/CommonComponents/FormControlValidation'
import { AddIcon, DeleteIcon, EditIcon, Pdf } from '../../../Common/CommonIcons/CommonIcons'
import Table from '../../../Common/Table/Table'

const Experience = ({
    doj,
    experienceList,
    setExperienceGet,
    dateOfBirth,
    setExperienceSelectedFiles
}) => {
    const [show, setShow] = useState('') // State to manage visibility of certain UI elements or components (could be a modal or any other visibility toggle).
    const [visible, setVisible] = useState(false) // State to control the visibility of a specific component or section, typically used for conditional rendering (like showing a form or modal).
    const [formData, setFormData] = useState('') // State to store the form data. This could hold information entered in a form or an object representing the form's content.
    const [fromDate, setFromDate] = useState(null) // State to store the start date (could be used in a date range picker or form).
    const [endDate, setEndDate] = useState(null) // State to store the end date (similar to `fromDate`, used for a date range).
    const [fileShow, setFileShow] = useState(false) // State to control visibility of file-related components (likely a modal or file upload area).
    const [bills, setBills] = useState([]) // State to store an array of bills (likely used to manage a list of uploaded or submitted bills).
    const [billsName, setBillsName] = useState([]) // State to store an array of names corresponding to the bills (could be used to display names of the uploaded bills).
    const [billsType, setBillsType] = useState([]) // State to store the types of bills (e.g., "Electricity", "Rent", etc.).
    const [selectFiles, setSelectFiles] = useState([]) // State to store an array of selected files (likely for a file upload feature).
    const [expFiles, setExpFiles] = useState([])
    // This function is called when the "from date" is changed. It formats the selected date and compares it with existing date ranges to ensure validity.
    // ...existing code...
    // ...existing code...
    const handleFromDateChange = (date) => {
        const selectedDate = moment(date).format('YYYY-MM-DD')
        let ranges
        if (visible === 'update' && index !== null) {
            ranges = experienceList
                .filter((_, i) => i !== index)
                .map((e) => [e.periodFrom, e.periodTo])
        } else {
            ranges = experienceList.map((e) => [e.periodFrom, e.periodTo])
        }

        // Check if selectedDate falls within any existing range
        const isOverlap = ranges.some(([existFrom, existTo]) => {
            const existStart = moment(existFrom, 'YYYY-MM-DD')
            const existEnd = moment(existTo, 'YYYY-MM-DD')
            const current = moment(selectedDate, 'YYYY-MM-DD')
            return current.isSameOrAfter(existStart) && current.isSameOrBefore(existEnd)
        })

        if (isOverlap) {
            setFormErrors({
                ...formErrors,
                periodFrom: 'Date overlaps with existing record!'
            })
            setFromDate(null) // Clear the date
        } else {
            setFormErrors({ ...formErrors, periodFrom: '' })
            setFromDate(selectedDate)
        }
    }
    const handleToDateChange = (date) => {
        const selectedDate = moment(date).format('YYYY-MM-DD')
        const from = fromDate || formData.periodFrom
        let ranges
        if (visible === 'update' && index !== null) {
            ranges = experienceList
                .filter((_, i) => i !== index)
                .map((e) => [e.periodFrom, e.periodTo])
        } else {
            ranges = experienceList.map((e) => [e.periodFrom, e.periodTo])
        }
        if (from && selectedDate && isRangeOverlap(from, selectedDate, ranges)) {
            setFormErrors({ ...formErrors, periodTo: 'Date range overlaps with existing record!' })
            setEndDate(null) // Clear the date
        } else {
            setEndDate(selectedDate)
            setFormErrors({ ...formErrors, periodTo: '' })
        }
    }
    // ...existing code...
    // ...existing code...
    // ...existing code...
    function isRangeOverlap(newFrom, newTo, ranges) {
        // newFrom and newTo are moment objects or date strings
        const start = moment(newFrom, 'YYYY-MM-DD')
        const end = moment(newTo, 'YYYY-MM-DD')
        return ranges.some(([existFrom, existTo]) => {
            const existStart = moment(existFrom, 'YYYY-MM-DD')
            const existEnd = moment(existTo, 'YYYY-MM-DD')
            // Overlap if start <= existEnd && end >= existStart
            return start.isSameOrBefore(existEnd) && end.isSameOrAfter(existStart)
        })
    }
    // ...existing code...

    // This function is used to handle changes in any input field in the form. It updates the formData state with the new values.
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }
    // Function to delete a bill (file) from the list at the given index and remove the corresponding file from the selected files
    const deleteBills = (index, element) => {
        const updatedBills = [...bills]
        updatedBills.splice(index, 1)
        const updatedSelectedFiles = selectFiles.filter((file) => file.name !== element)
        setExpFiles(expFiles.filter((item) => item.fileName !== element))
        const nameArray = updatedBills.map((file) =>
            file.file instanceof File ? file.fileName : file.id ? file.fileName : file.name
        )
        setBills(updatedBills)
        setBillsName(nameArray)
        setSelectFiles(updatedSelectedFiles)
        const fileInput = document.getElementById('fileInput')
        fileInput.value = null // Resetting the input value
    }
    // Function to display files and map them into a new array, based on the given action type
    const handleFilesShow = (bills, action) => {
        const newArray = bills.map((obj) => ({
            fileName: obj.fileName,
            fileType: obj.fileType,
            file: obj.file
        }))
        setBills(newArray)
        if (action == 'experienceFiles') {
            setFileShow(true)
        }
    }

    const [data, setData] = useState(experienceList) // State for holding the experience data (initially set to experienceList)
    // useEffect hook that runs when the experienceList changes
    useEffect(() => {
        setData(experienceList)
        setExperienceSelectedFiles(selectFiles)
        const existingFiles = experienceList.map((e) => e.files || [])
        setExpFiles(existingFiles.flatMap((innerArray) => innerArray.map((obj) => obj)))
    }, [experienceList]) // Dependency array ensures this effect runs when experienceList changes

    const [formErrors, setFormErrors] = useState({}) // Declaring a state variable `formErrors` to keep track of any validation errors in the form
    // `validate` function that takes `values` as input, which represents the form data to validate
    const validate = (values) => {
        const errors = {}
        if (!values.company) {
            errors.company = 'Required'
        }
        if (values.periodTo == null) {
            errors.periodTo = 'Required'
        }
        if (values.periodFrom == null) {
            errors.periodFrom = 'Required'
        }
        if (!values.designation) {
            errors.designation = 'Required'
        }
        return errors
    }

    const onFileChangeHandler = (event) => {
        const selectedFiles = event.target.files
        if (selectedFiles.length === 0) return
        const filesArray = Array.from(selectedFiles)
        const fileNames = expFiles.map((e) => e.fileName)
        const existingFileNames = new Set([...fileNames, ...billsName])
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
        let errors = {}
        const validFiles = []
        const invalidFiles = []
        filesArray.forEach((file) => {
            const isDuplicate = existingFileNames.has(file.name)
            const isTooBig = file.size > 11048576
            const isWrongType = !allowedTypes.includes(file.type)

            if (isDuplicate || isTooBig || isWrongType) {
                invalidFiles.push(file)
                if (isDuplicate) {
                    errors.duplicates = 'Some files are already uploaded.'
                }
                if (isTooBig) {
                    errors.size = 'Some files are larger than 10MB.'
                }
                if (isWrongType) {
                    errors.type = 'Some files are not of the allowed types.'
                }
            } else {
                validFiles.push(file)
            }
        })

        if (validFiles.length > 0) {
            setBills([...bills, ...validFiles])
            setBillsType([...billsType, ...validFiles.map((file) => file.type)])
            setBillsName([...billsName, ...validFiles.map((file) => file.name)])
            event.target.value = null

            if (Object.keys(errors).length > 0) {
                setFormErrors(errors)
            } else {
                setFormErrors({})
            }
        } else {
            setFormErrors(errors)
        }
    }
    let billObjects = [] // Initialize an empty array `billObjects` to store the mapped bill details
    // `experience` function handles the logic of processing and storing the experience details
    const experience = () => {
        // Check if `bills` array is not empty, and process the bill information accordingly
        if (bills) {
            // Mapping the `bills` array to create a new array `billObjects` that contains the necessary bill details
            billObjects = bills.map((bill) => ({
                id: bill.id,
                fileName:
                    bill.file instanceof File ? bill.fileName : bill.id ? bill.fileName : bill.name,
                fileType:
                    bill.file instanceof File ? bill.fileType : bill.id ? bill.fileType : bill.type,
                file: bill.file instanceof File ? bill.file : bill.id ? bill.file : bill
            }))
        }
        // Create an object `experienceObj` to hold the form data related to the experience
        const experienceObj = {
            company: formData.company,
            designation: formData.designation,
            majorResponsibilites: formData.majorResponsibilites,
            periodFrom: fromDate,
            periodTo: endDate,
            reasonForLeaving: formData.reasonForLeaving,
            domains: formData.domains,
            files: billObjects ? billObjects : null
        }
        if (experienceObj.periodFrom == null) {
            setFormErrors(validate(experienceObj))
        } else if (experienceObj.periodTo == null) {
            setFormErrors(validate(experienceObj))
        } else if (!experienceObj.company) {
            setFormErrors(validate(experienceObj))
        } else if (!experienceObj.designation) {
            setFormErrors(validate(experienceObj))
        } else {
            // If validation passes, append the `experienceObj` to the existing `data` array
            const experienceData = [...data, experienceObj]
            setExperienceGet(experienceData)
            setData(experienceData)
            setSelectFiles([...selectFiles, ...bills])
            onCloseHandler()
        }
    }

    // `updateExperience` function is responsible for updating the experience details with new data
    const updateExperience = () => {
        // Check if `bills` array is available and process the bills to create an array `billObjects`
        if (bills) {
            // Iterate through each `bill` and map it to a new object with relevant information
            billObjects = bills.map((bill) => ({
                id: bill.id,
                fileName:
                    bill.file instanceof File ? bill.fileName : bill.id ? bill.fileName : bill.name,
                fileType:
                    bill.file instanceof File ? bill.fileType : bill.id ? bill.fileType : bill.type,
                file: bill.file instanceof File ? bill.file : bill.id ? bill.file : bill
            }))
        }
        // Create an object `updateExperienceObj` that holds the updated experience data
        const updateExperienceObj = {
            id: experienceEdit.id,
            company: formData.company,
            designation: formData.designation,
            email: experienceEdit.email,
            majorResponsibilites: formData.majorResponsibilites,
            periodFrom: fromDate ? fromDate : experienceEdit.periodFrom,
            periodTo: endDate ? endDate : experienceEdit.periodTo,
            reasonForLeaving: formData.reasonForLeaving,
            domains: formData.domains,
            isFresher: formData.isFresher ? formData.isFresher : experienceEdit.isFresher,
            organizationId: experienceEdit.organizationId,
            files: billObjects ? billObjects : null
        }
        if (updateExperienceObj.periodFrom == null) {
            setFormErrors(validate(updateExperienceObj))
        }
        if (updateExperienceObj.periodTo == null) {
            setFormErrors(validate(updateExperienceObj))
        }
        if (!updateExperienceObj.company) {
            setFormErrors(validate(updateExperienceObj))
        } else if (!updateExperienceObj.designation) {
            setFormErrors(validate(updateExperienceObj))
        } else {
            // If validation passes, update the `data` array at the specific `index` with the new experience data
            const experienceData = [...experienceList]
            experienceData[index] = updateExperienceObj
            setExperienceGet(experienceData)
            setSelectFiles([...selectFiles, ...bills])
            setExperienceSelectedFiles((prevFiles) => [...prevFiles, ...bills])
            onCloseHandler()
        }
    }
    // coloumns for experience table
    const COLUMNS = [
        {
            Header: 'Company',
            accessor: 'company',
            Cell: ({ row }) => (
                <>
                    {!show && (
                        <Tooltip title={row.original.company} open>
                            {row.original.company}
                        </Tooltip>
                    )}
                    <div className="tableLength">{row.original.company}</div>
                </>
            )
        },
        {
            Header: 'Designation',
            accessor: 'designation',
            Cell: ({ row }) => (
                <>
                    {!show && (
                        <Tooltip title={row.original.designation} open>
                            {row.original.designation}
                        </Tooltip>
                    )}
                    <div className="tableLength">{row.original.designation}</div>
                </>
            )
        },
        {
            Header: 'Responsibilities',
            accessor: 'majorResponsibilites',
            Cell: ({ row }) => (
                <>
                    {!show && (
                        <Tooltip title={row.original.majorResponsibilites} open>
                            {row.original.majorResponsibilites}
                        </Tooltip>
                    )}
                    <div className="tableLength">{row.original.majorResponsibilites}</div>
                </>
            )
        },
        {
            Header: 'Period From',
            accessor: 'periodFrom',
            Cell: ({ row }) => <div>{<DateFormate date={row.original.periodFrom} />}</div>
        },
        {
            Header: 'Period To',
            accessor: 'periodTo',
            Cell: ({ row }) => <div>{<DateFormate date={row.original.periodTo} />}</div>
        },
        // {
        //   Header: "Reason For Leaving",
        //   accessor: "reasonForLeaving"
        // },
        {
            Header: 'Domains',
            accessor: 'domains',
            Cell: ({ row }) => (
                <>
                    {!show && (
                        <Tooltip title={row.original.domains} open>
                            {row.original.domains}
                        </Tooltip>
                    )}
                    <div className="tableLength">{row.original.domains}</div>
                </>
            )
        },
        {
            Header: 'File',
            accessor: 'files',
            Cell: ({ row }) => (
                <>
                    {row.original.files == null || row.original.files.length == 0 ? (
                        ''
                    ) : (
                        <Button
                            id="viewFile"
                            type="button"
                            variant=""
                            className=""
                            onClick={() => handleFilesShow(row.original.files, 'experienceFiles')}
                        >
                            <Pdf />
                        </Button>
                    )}
                </>
            )
        },
        {
            Header: () => <div className="text-wrap text-right actions ">Actions</div>,
            accessor: 'actions',
            disableSortBy: true,
            Cell: ({ row }) => (
                <>
                    <div className="text-wrap text-right actionsWidth">
                        <Button
                            id="editExperience"
                            variant=""
                            className="iconWidth"
                            onClick={() => onShowHandler('update', row.original, row.index)}
                        >
                            <EditIcon />
                        </Button>
                        |
                        <Button
                            id="deleteExperience"
                            variant=""
                            className="iconWidth"
                            onClick={() => handleRemove(row.index)}
                        >
                            <DeleteIcon />
                        </Button>
                    </div>
                </>
            )
        }
    ]
    const [deleteShow, setDeleteShow] = useState(false) // `deleteShow` is a state variable to control the visibility of the delete confirmation modal
    const [indexs, setIndexS] = useState() // `indexs` holds the index of the experience entry to be deleted
    // `handleRemove` is triggered when the user wants to delete an entry. It sets the `deleteShow` state to true and stores the index of the experience entry to be deleted.
    const handleRemove = (index) => {
        setDeleteShow(true)
        setIndexS(index)
    }
    // `proceedDeleteHandler` is invoked when the user confirms the delete action. It removes the experience entry from the `data` array.
    const proceedDeleteHandler = (e) => {
        e.preventDefault()
        const rows = [...data]
        rows.splice(indexs, 1)
        setExperienceGet(rows)
        setDeleteShow(false)
    }

    const [experienceEdit, setExperienceEdit] = useState({}) // `experienceEdit` stores the details of the experience entry being edited
    const [index, setIndex] = useState(null) // `index` stores the index of the experience entry being edited

    // `onShowHandler` is triggered when the user wants to either create or update an experience entry.
    const onShowHandler = (action, row, index) => {
        setIndex(index)
        if (action == 'create') {
            setVisible('create')
            setShow(true)
            setFromDate(null)
            setEndDate(null)
            setFormData('')
            setBills([])
            setBillsName([])
        } else {
            setExperienceEdit(row)
            setFormData(row)
            setVisible('update')
            setShow(true)
            setFromDate(row.periodFrom)
            setEndDate(row.periodTo)
            setBillsName(row.files.map((row) => row.fileName))
            setBills(row.files)
        }
    }
    // `onCloseHandler` is triggered to close the form/modal and reset the form state.
    const onCloseHandler = () => {
        setShow(false)
        setExperienceEdit('')
        setDeleteShow(false)
        setFormErrors('')
        setFileShow(false)
    }
    return (
        <>
            <div className="card-body" style={{ marginTop: '1%' }}>
                <Button
                    id="addExperience"
                    className="addButton"
                    variant="addbtn"
                    onClick={() => onShowHandler('create')}
                >
                    <AddIcon />
                    {/* Displays the AddIcon component inside the button */}
                </Button>
                {/* Table component displays the data in a table format */}
                <Table
                    columns={COLUMNS}
                    data={data}
                    serialNumber={true}
                    name={'experience records'}
                />
            </div>
            <Modal className="" show={show} onHide={onCloseHandler} size="lg">
                <Modal.Header closeButton={onCloseHandler}>
                    <Modal.Title>Experience</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* input fields for experience form */}
                    <div className="">
                        <form className="modalFormBody">
                            <Row>
                                <div className="col-6">
                                    <Form.Group
                                        as={Row}
                                        className="mb-3"
                                        controlId="formGroupCompany"
                                    >
                                        <Form.Label id="formGroupCompany" column sm={5}>
                                            Company <span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={6}>
                                            <Form.Control
                                                id="formGroupCompany"
                                                onChange={handleInputChange}
                                                required
                                                onKeyPress={(e) => handleKeyPress(e, setFormErrors)}
                                                onPaste={(e) => handleKeyPress(e, setFormErrors)}
                                                onInput={(e) => handleKeyPress(e, setFormErrors)}
                                                type="text"
                                                size="sm"
                                                maxLength={100}
                                                onBlur={(e) =>
                                                    !e.target.value
                                                        ? setFormErrors({
                                                            ...formErrors,
                                                            company: 'Required'
                                                        })
                                                        : setFormErrors({
                                                            ...formErrors,
                                                            company: ''
                                                        })
                                                }
                                                defaultValue={
                                                    experienceEdit && experienceEdit.company
                                                }
                                                name="company"
                                            />
                                            <p className="error">{formErrors.company}</p>
                                        </Col>
                                    </Form.Group>
                                </div>

                                <div className="col-6">
                                    <Form.Group
                                        as={Row}
                                        className="mb-3"
                                        controlId="formGroupDesignation"
                                    >
                                        <Form.Label id="formGroupDesignation" column sm={5}>
                                            Designation <span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={6}>
                                            <Form.Control
                                                id="formGroupDesignation"
                                                required
                                                size="sm"
                                                maxLength={50}
                                                onKeyPress={(e) => handleKeyPress(e, setFormErrors)}
                                                onPaste={(e) => handleKeyPress(e, setFormErrors)}
                                                onInput={(e) => handleKeyPress(e, setFormErrors)}
                                                name="designation"
                                                onBlur={(e) =>
                                                    !e.target.value
                                                        ? setFormErrors({
                                                            ...formErrors,
                                                            designation: 'Required'
                                                        })
                                                        : setFormErrors({
                                                            ...formErrors,
                                                            designation: ''
                                                        })
                                                }
                                                defaultValue={
                                                    experienceEdit && experienceEdit.designation
                                                }
                                                onChange={handleInputChange}
                                            />
                                            <p className="error">{formErrors.designation}</p>
                                        </Col>
                                    </Form.Group>
                                </div>

                                <div className="col-6">
                                    <Form.Group
                                        as={Row}
                                        className="mb-3"
                                        controlId="formGroupPeriodFrom"
                                    >
                                        <Form.Label id="formGroupPeriodFrom" column sm={5}>
                                            Period From <span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={6}>
                                            <DatePicker
                                                id="formGroupPeriodFrom"
                                                format={'DD-MM-YYYY'}
                                                inputReadOnly={true}
                                                size="sm"
                                                name="periodFrom"
                                                placeholder="Select Date"
                                                allowClear={false}
                                                onBlur={(e) =>
                                                    !e.target.value
                                                        ? setFormErrors({
                                                            ...formErrors,
                                                            periodFrom: 'Required'
                                                        })
                                                        : setFormErrors({
                                                            ...formErrors,
                                                            periodFrom: ''
                                                        })
                                                }
                                                value={fromDate == null ? null : moment(fromDate)}
                                                onChange={handleFromDateChange}
                                                disabledDate={(current) => {
                                                    const tomorrow = new Date(dateOfBirth)
                                                    tomorrow.setDate(tomorrow.getDate() + 1)
                                                    let customDate =
                                                        moment(tomorrow).format('YYYY-MM-DD')
                                                    return (
                                                        current &&
                                                        current < moment(customDate, 'YYYY-MM-DD')
                                                    )
                                                }}
                                            />
                                            <p className="error">{formErrors.periodFrom}</p>
                                        </Col>
                                    </Form.Group>
                                </div>

                                <div className="col-6">
                                    <Form.Group
                                        as={Row}
                                        className="mb-3"
                                        controlId="formGroupPeriodTo"
                                    >
                                        <Form.Label id="formGroupPeriodTo" column sm={5}>
                                            Period To <span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={6}>
                                            <DatePicker
                                                id="formGroupPeriodTo"
                                                format={'DD-MM-YYYY'}
                                                inputReadOnly={true}
                                                placeholder="Select Date"
                                                onChange={handleToDateChange}
                                                disabledDate={(current) => {
                                                    const tomorrow = new Date(dateOfBirth)
                                                    tomorrow.setDate(tomorrow.getDate() + 1)
                                                    let minDate = moment(tomorrow).format('YYYY-MM-DD')
                                                    let fromDateStr = fromDate ? moment(fromDate).format('YYYY-MM-DD') : null
                                                    let dojStr = doj ? moment(doj).format('YYYY-MM-DD') : null

                                                    // Disable if before fromDate or before minDate (DOB+1)
                                                    let isBeforeFrom = fromDateStr && current < moment(fromDateStr, 'YYYY-MM-DD')
                                                    let isBeforeMin = current < moment(minDate, 'YYYY-MM-DD')
                                                    // Disable if after DOJ
                                                    let isAfterDOJ = dojStr && current > moment(dojStr, 'YYYY-MM-DD')

                                                    return isBeforeFrom || isBeforeMin || isAfterDOJ
                                                }}
                                                size="sm"
                                                name="periodTo"
                                                allowClear={false}
                                                onBlur={(e) =>
                                                    !e.target.value
                                                        ? setFormErrors({
                                                            ...formErrors,
                                                            periodTo: 'Required'
                                                        })
                                                        : setFormErrors({
                                                            ...formErrors,
                                                            periodTo: ''
                                                        })
                                                }
                                                value={endDate == null ? null : moment(endDate)}
                                            />
                                            <p className="error">{formErrors.periodTo}</p>
                                        </Col>
                                    </Form.Group>
                                </div>

                                <div className="col-6">
                                    <Form.Group
                                        as={Row}
                                        className="mb-3"
                                        controlId="formGroupMajorResponsibilites"
                                    >
                                        <Form.Label
                                            id="formGroupMajorResponsibilites"
                                            column
                                            sm={5}
                                        >
                                            Responsibilities
                                        </Form.Label>
                                        <Col sm={6}>
                                            <Form.Control
                                                id="formGroupMajorResponsibilites"
                                                onChange={handleInputChange}
                                                required
                                                size="sm"
                                                maxLength={100}
                                                onKeyPress={(e) => handleKeyPress(e, setFormErrors)}
                                                onPaste={(e) => handleKeyPress(e, setFormErrors)}
                                                onInput={(e) => handleKeyPress(e, setFormErrors)}
                                                type="text"
                                                placeholder="e.g:Developed web applications..."
                                                defaultValue={
                                                    experienceEdit &&
                                                    experienceEdit.majorResponsibilites
                                                }
                                                name="majorResponsibilites"
                                            />
                                        </Col>
                                    </Form.Group>
                                </div>

                                <div className="col-6 mb-2">
                                    <Form.Group
                                        as={Row}
                                        className="mb-3"
                                        controlId="formGroupReasonForLeaving"
                                    >
                                        <Form.Label id="formGroupReasonForLeaving" column sm={5}>
                                            Reason for Leaving
                                        </Form.Label>
                                        <Col sm={6}>
                                            <Form.Control
                                                id="formGroupReasonForLeaving"
                                                required
                                                size="sm"
                                                maxLength={100}
                                                onKeyPress={(e) => handleKeyPress(e, setFormErrors)}
                                                onPaste={(e) => handleKeyPress(e, setFormErrors)}
                                                onInput={(e) => handleKeyPress(e, setFormErrors)}
                                                onChange={handleInputChange}
                                                placeholder="e.g: Career Growth..."
                                                defaultValue={
                                                    experienceEdit &&
                                                    experienceEdit.reasonForLeaving
                                                }
                                                name="reasonForLeaving"
                                            />
                                        </Col>
                                    </Form.Group>
                                </div>

                                <div className="col-6">
                                    <Form.Group
                                        as={Row}
                                        className="mb-3"
                                        controlId="formGroupDomains"
                                    >
                                        <Form.Label id="formGroupDomains" column sm={5}>
                                            Domains
                                        </Form.Label>
                                        <Col sm={6}>
                                            <Form.Control
                                                id="formGroupDomains"
                                                required
                                                size="sm"
                                                maxLength={100}
                                                onKeyPress={(e) => handleKeyPress(e, setFormErrors)}
                                                onPaste={(e) => handleKeyPress(e, setFormErrors)}
                                                onInput={(e) => handleKeyPress(e, setFormErrors)}
                                                onChange={handleInputChange}
                                                defaultValue={
                                                    experienceEdit && experienceEdit.domains
                                                }
                                                placeholder="e.g: Information Technology (IT)..."
                                                name="domains"
                                            />
                                        </Col>
                                    </Form.Group>
                                </div>

                                <div className="col-6">
                                    <Form.Group
                                        as={Row}
                                        className="mb-3"
                                        controlId="formGroupFileUpload"
                                    >
                                        <Form.Label id="formGroupFileUpload" column sm={5}>
                                            Upload File
                                        </Form.Label>
                                        <Col sm={6}>
                                            <Form.Control
                                                multiple
                                                type="file"
                                                id="fileInput"
                                                name="file"
                                                size="sm"
                                                accept="image/jpeg,image/gif,image/png,application/pdf,image/x-eps"
                                                onChange={(event) => onFileChangeHandler(event)}
                                            />
                                            {bills && bills.length > 0 ? (
                                                <div
                                                    style={{
                                                        textAlign: 'left',
                                                        fontSize: '85%',
                                                        fontWeight: '500',
                                                        color: '#374681'
                                                    }}
                                                >
                                                    {billsName &&
                                                        billsName.map((element, index) => (
                                                            <span key={index}>
                                                                {element}
                                                                <a
                                                                    id="deleteFile"
                                                                    className="error"
                                                                    onClick={() =>
                                                                        deleteBills(index, element)
                                                                    }
                                                                >
                                                                    {' '}
                                                                    X
                                                                </a>
                                                                <br />
                                                            </span>
                                                        ))}
                                                </div>
                                            ) : (
                                                !formErrors.size && (
                                                    <p
                                                        style={{
                                                            textAlign: 'left',
                                                            fontSize: '85%',
                                                            fontWeight: '500',
                                                            color: '#374681'
                                                        }}
                                                    >
                                                        {
                                                            'Only PDF, PNG, and JPEG files are accepted.'
                                                        }
                                                    </p>
                                                )
                                            )}
                                            {formErrors.size && (
                                                <div className="error">{formErrors.size}</div>
                                            )}
                                            {formErrors.duplicates && (
                                                <div className="error">{formErrors.duplicates}</div>
                                            )}
                                            {formErrors.type && (
                                                <div className="error">{formErrors.type}</div>
                                            )}
                                        </Col>
                                    </Form.Group>
                                </div>
                            </Row>
                        </form>
                    </div>
                </Modal.Body>

                {/* save and update buttons */}
                <div className="btnCenter" style={{ margin: '2% 0% 2% 0%' }}>
                    {visible == 'create' && (
                        <Button
                            id="AddExperience"
                            variant="addbtn"
                            className="Button"
                            onClick={experience}
                        >
                            Add
                        </Button>
                    )}
                    {visible == 'update' && (
                        <Button
                            id="updateExperience"
                            className="Button"
                            variant="addbtn"
                            onClick={updateExperience}
                        >
                            Update
                        </Button>
                    )}
                    <Button
                        id="closeExperience"
                        className="Button"
                        variant="secondary"
                        onClick={onCloseHandler}
                    >
                        Close
                    </Button>
                </div>
            </Modal>

            {/* delete modal popup */}
            <Modal show={deleteShow} onHide={onCloseHandler} backdrop="static" keyboard={false}>
                <Modal.Header closeButton={onCloseHandler}>
                    <Modal.Title>Delete ?</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    Are you sure you want to delete this item?
                </Modal.Body>
                <div className="btnCenter mb-3">
                    <Button
                        id="proceedDeleteExperience"
                        className="Button"
                        variant="addbtn"
                        onClick={proceedDeleteHandler}
                    >
                        Yes
                    </Button>
                    <Button
                        id="cancelDeleteExperience"
                        className="Button"
                        variant="secondary"
                        onClick={onCloseHandler}
                    >
                        No
                    </Button>
                </div>
            </Modal>
            {/* file preview modal */}
            <Modal
                show={fileShow}
                size="lg"
                onHide={onCloseHandler}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Preview</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    <FileViewer documents={bills} />
                </Modal.Body>
            </Modal>
        </>
    )
}
export default Experience
