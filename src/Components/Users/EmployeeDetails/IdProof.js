import { DatePicker } from 'antd'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { Button, Col, Form, Modal, Row, Tooltip } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import Select from 'react-select'
import DateFormate from '../../../Common/CommonComponents/DateFormate'
import FileViewer from '../../../Common/CommonComponents/FileViewer'
import {
    handleKeyPress,
} from '../../../Common/CommonComponents/FormControlValidation'
import { AddIcon, DeleteIcon, EditIcon, Pdf } from '../../../Common/CommonIcons/CommonIcons'
import { getAllByOrgId } from '../../../Common/Services/CommonService'
import { getUnMaskString } from '../../../Common/Services/OtherServices'
import Table from '../../../Common/Table/Table'

const IdProofs = ({
    idProofsList,
    setIdproofGet,
    setIdproofSelectedFiles,
}) => {
    const userDetails = useSelector((state) => state.user.userDetails) // Retrieves user details from the Redux store using useSelector hook
    const [show, setShow] = useState('') // State to control the visibility of certain components/modal (e.g., form visibility or modal state)
    const [visible, setVisible] = useState(false) // State to control whether a certain modal or component is visible or not
    const [formData, setFormData] = useState('') // State to store form data (general form data like name, address, etc.)
    const [idProofType, setIdProofType] = useState('') // State to store the selected ID proof type (e.g., passport, driving license, etc.)
    const [typeName, setTypeName] = useState('') // State to store the name of the ID proof type (could be a user-friendly label for display)
    const [validFrom, setValidFrom] = useState(null) // State to store the valid from date (likely for the ID proof validity range)
    const [validTo, setValidTo] = useState(null) // State to store the valid to date (likely for the ID proof validity range)
    const [fileShow, setFileShow] = useState(false) // State to manage the visibility of file upload components (e.g., whether the file input should be shown)
    const [bills, setBills] = useState([]) // State to store the list of uploaded bills (likely a list of files or documents related to the user)
    const [billsName, setBillsName] = useState([]) // State to store the names of the uploaded bills (for display or further handling)
    const [billsType, setBillsType] = useState([]) // State to store the types or categories of the uploaded bills (e.g., electricity, gas, etc.)
    const [selectFiles, setSelectFiles] = useState([]) // State to store the files selected by the user for upload (likely the actual file data)
    const [idProofEdit, setIdProofEdit] = useState({}) // State to store the data of the ID proof being edited (when updating existing ID proof details)
    const [idPFiles, setIdpFiles] = useState([])
    // Function to handle input change for form fields
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }
    console.log(idProofsList, 'chekingResponseDAtat')
    // Function to delete a bill based on the index and element
    const deleteBills = (index, element) => {
        const updatedBills = [...bills]
        updatedBills.splice(index, 1)
        const updatedSelectedFiles = selectFiles.filter((file) => file.name !== element)
        setIdpFiles(idPFiles.filter((item) => item.fileName !== element))
        const nameArray = updatedBills.map((file) =>
            file.file instanceof File ? file.fileName : file.id ? file.fileName : file.name
        )
        setBills(updatedBills)
        setBillsName(nameArray)
        setSelectFiles(updatedSelectedFiles)
        const fileInput = document.getElementById('fileInput')
        fileInput.value = null // Resetting the input value
    }
    // Function to handle displaying the files (e.g., for uploading or showing ID proof files)
    const handleFilesShow = (bills, action) => {
        const newArray = bills.map((obj) => ({
            fileName: obj.fileName,
            fileType: obj.fileType,
            file: obj.file
        }))
        setBills(newArray)
        if (action == 'idproofFiles') {
            setFileShow(true)
        }
    }

    const [idProof, setIdProof] = useState([]) // State hook to store the list of ID proof types
    const [updateIdproofType, setUpdateIdproofType] = useState([]) // State hook to store the list of ID proof types for updating
    // Function to fetch all ID proof types for the user's organization
    const getAllIdProofType = () => {
        // Call the API to fetch the ID proof types based on the organization's ID
        getAllByOrgId({ entity: 'idprooftypes', organizationId: userDetails.organizationId }).then(
            (res) => {
                if (res.statusCode == 200) {
                    const idData = res.data && res.data
                    const typeNamesInRecords = idProofsList.map((record) => record.typeName)
                    const filteredData = idData.filter(
                        (item) => !typeNamesInRecords.includes(item.name)
                    )
                    setIdProof(filteredData)
                    setUpdateIdproofType(res.data)
                }
            }
        )
            .catch((err) => {
                console.log(err, 'error') // Log any errors that occur during the API call
            })
    }
    // Mapping the fetched `idProof` data to create options for a dropdown or selection input
    const idProofsOptions = idProof
        ? idProof.map((option) => ({
            value: option.id,
            label: option.name
        }))
        : []

    const updateIdProofsOptions = updateIdproofType
        ? updateIdproofType.map((option) => ({
            value: option.id,
            label: option.name
        }))
        : []
    // Function to handle the selection of a specific ID proof type
    const handleTypeSelection = (selection) => {
        setIdProofType(selection.value)
        setTypeName(selection.label)
    }
    // Function to handle the selection of the 'validFrom' date
    const handleValidFrom = (e) => {
        const selectedDate = moment(e).format('YYYY-MM-DD')
        setValidFrom(selectedDate)
        // const dateRanges = idProofsList.map((e) => e.validFrom + " to " + e.validTo);
        // if (!isCompareDateValid(selectedDate, dateRanges)) {
        //   setValidFrom(null);
        //   setFormErrors({ ...formErrors, validFrom: "date is within an existing range!" });
        // } else {
        //   setValidFrom(selectedDate);
        //   setFormErrors({ ...formErrors, validFrom: "" });
        // }
    }
    // Function to handle the selection of the 'validTo' date
    const handleValidTo = (e) => {
        const selectedDate = moment(e).format('YYYY-MM-DD')
        setValidTo(selectedDate)
        // const dateRanges = idProofsList.map((e) => e.validFrom + " to " + e.validTo);
        // if (!isCompareDateValid(selectedDate, dateRanges)) {
        //   setValidTo(null);
        //   setFormErrors({ ...formErrors, validTo: "date is within an existing range!" });
        // } else {
        //   setValidTo(selectedDate);
        //   setFormErrors({ ...formErrors, validTo: "" });
        // }
    }

    const [data, setData] = useState(idProofsList) // State hook to store the list of ID proofs (idProofsList) from the backend or initial state
    // useEffect hook to update the state when 'idProofsList' changes
    useEffect(() => {
        setData(idProofsList)
        setIdproofSelectedFiles(selectFiles)
        const existingFiles = idProofsList.map((e) => e.files || [])
        setIdpFiles(existingFiles.flatMap((innerArray) => innerArray.map((obj) => obj)))
    }, [idProofsList]) // Only re-run the effect when 'idProofsList' changes

    const [formErrors, setFormErrors] = useState({}) // State hook to store form errors, initialized as an empty object
    // Validation function to check the form fields
    const validate = (values) => {
        const errors = {}
        if (!values.board) {
            errors.board = 'Required'
        }

        if (values.typeId == '') {
            errors.typeId = 'Required'
        }
        if (values.validTo == null) {
            errors.validTo = 'Required'
        }
        if (values.validFrom == null) {
            errors.validFrom = 'Required'
        }
        if (!values.identification) {
            errors.identification = 'Required'
        }
        return errors
    }
    // Function to remove duplicates from an array based on the 'typeId' property
    const removeDuplicates = (array) => {
        const seen = new Set()
        return array.filter((item) => {
            const isDuplicate = seen.has(item.typeId)
            seen.add(item.typeId)
            return !isDuplicate
        })
    }
    let billObjects = [] // Initialize an empty array to store the processed bill objects

    const onFileChangeHandler = (event) => {
        const selectedFiles = event.target.files
        if (!selectedFiles || selectedFiles.length === 0) return

        const filesArray = Array.from(selectedFiles)

        // Existing file names from educationList
        const fileNames = idPFiles.map((e) => e.fileName)

        // Merge with billsName to catch all duplicates
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
    // Function to create an id proof object
    const idProofs = () => {
        // Check if bills array exists
        if (bills) {
            // Map over the bills array to create a new array of bill objects with required properties
            billObjects = bills.map((bill) => ({
                id: bill.id,
                fileName:
                    bill.file instanceof File ? bill.fileName : bill.id ? bill.fileName : bill.name,
                fileType:
                    bill.file instanceof File ? bill.fileType : bill.id ? bill.fileType : bill.type,
                file: bill.file instanceof File ? bill.file : bill.id ? bill.file : bill
            }))
        }
        // Create an idProofs object with required fields
        const idProofsObj = {
            typeId: idProofType,
            typeName: typeName,
            identification: formData.identification,
            validFrom: validFrom,
            validTo: validTo,
            issuedAt: formData.issuedAt,
            files: billObjects ? billObjects : null
        }
        // Perform validation checks on the idProofs object
        if (idProofsObj.typeId == '') {
            setFormErrors(validate(idProofsObj))
        } else if (!idProofsObj.identification) {
            setFormErrors(validate(idProofsObj))
        } else {
            // If the validation passes, add the idProofs object to the existing data
            const idProofData = [...data, idProofsObj]
            setIdproofGet(removeDuplicates(idProofData))
            setData(removeDuplicates(idProofData))
            setSelectFiles([...selectFiles, ...bills])
            onCloseHandler()
        }
    }
    // Function to handle the update of id proof data
    const updateIdproof = () => {
        // Check if the 'bills' array exists
        if (bills) {
            // Map through the bills array to create a new array with processed bill objects
            billObjects = bills.map((bill) => ({
                id: bill.id,
                fileName:
                    bill.file instanceof File ? bill.fileName : bill.id ? bill.fileName : bill.name,
                fileType:
                    bill.file instanceof File ? bill.fileType : bill.id ? bill.fileType : bill.type,
                file: bill.file instanceof File ? bill.file : bill.id ? bill.file : bill
            }))
        }
        // Create the 'updateIdproofObj' object containing the updated id proof data
        const updateIdproofObj = {
            id: idProofEdit.id,
            typeId: idProofType ? idProofType : idProofEdit.typeId,
            typeName: typeName,
            identification: formData.identification !== undefined
                ? formData.identification
                : idProofEdit.identification,
            validFrom: validFrom ? validFrom : idProofEdit.validFrom,
            validTo: validTo ? validTo : idProofEdit.validTo,
            issuedAt: formData.issuedAt ? formData.issuedAt : idProofEdit.issuedAt,
            files: billObjects ? billObjects : null,
            email: idProofEdit.email,
            organizationId: idProofEdit.organizationId
        }
        if (updateIdproofObj.typeId == '') {
            setFormErrors(validate(updateIdproofObj))
        } else if (!updateIdproofObj.identification) {
            setFormErrors(prev => ({ ...prev, identification: 'Required' }))
            return
        } else {
            // If validation passes, update the 'data' array at the current 'index' with the updated object
            const idProofsData = [...idProofsList]
            idProofsData[index] = updateIdproofObj
            setIdproofGet(idProofsData)
            setSelectFiles([...selectFiles, ...bills])
            setIdproofSelectedFiles((prevFiles) => [...prevFiles, ...bills])
            onCloseHandler()
        }
    }

    // coloumns for idproofs table
    const COLUMNS = [
        {
            Header: 'ID Type',
            accessor: 'typeName'
            // Cell: ({ row }) => <span>{idname}</span>,
        },
        {
            Header: 'Identification',
            accessor: 'identification'
        },
        {
            Header: 'Valid From',
            accessor: 'validFrom',
            Cell: ({ row }) => (
                <div>{row.original.validFrom && <DateFormate date={row.original.validFrom} />}</div>
            )
        },
        {
            Header: 'Valid To',
            accessor: 'validTo',
            Cell: ({ row }) => (
                <div>{row.original.validTo && <DateFormate date={row.original.validTo} />}</div>
            )
        },
        {
            Header: 'Issued By',
            accessor: 'issuedAt',
            Cell: ({ row }) => (
                <>
                    {!show && (
                        <Tooltip title={row.original.issuedAt} open>
                            {row.original.issuedAt}
                        </Tooltip>
                    )}
                    <div className="tableLength">{row.original.issuedAt}</div>
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
                            id="viewFiles"
                            type="button"
                            variant=""
                            className=""
                            onClick={() => handleFilesShow(row.original.files, 'idproofFiles')}
                        >
                            <Pdf />
                        </Button>
                    )}
                </>
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
                            id="editIdProof"
                            variant=""
                            className="iconWidth"
                            onClick={() => onShowHandler('update', row.original, row.index)}
                        >
                            <EditIcon />
                        </Button>
                        |
                        <Button
                            id="deleteIdProof"
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

    const [deleteShow, setDeleteShow] = useState(false) // State to manage whether the delete confirmation modal should be shown or not
    const [indexs, setIndexS] = useState() // State to store the index of the item to be deleted
    // Function to show the delete confirmation modal and set the index of the item to delete
    const handleRemove = (index) => {
        setDeleteShow(true)
        setIndexS(index)
    }
    // Function to handle the deletion process when confirmed
    const proceedDeleteHandler = (e) => {
        e.preventDefault()
        const rows = [...data]
        rows.splice(indexs, 1)
        setIdproofGet(rows)
        setDeleteShow(false)
    }
    const [index, setIndex] = useState(null) // State to manage the index of the item to be edited
    // Function to handle the showing of the modal for creating or updating an id proof
    const onShowHandler = (action, row, index) => {
        getAllIdProofType()
        setIndex(index)
        if (action === 'create') {
            setVisible('create')
            setShow(true)
            setFormData('')
            setValidFrom(null)
            setValidTo(null)
            setIdProofType('')
            setTypeName('')
            setBills([])
            setBillsName([])
        } else if (action === 'update' && (!row.id || row.id === undefined)) {
            setIdProofEdit(row)
            setVisible('update')
            setValidFrom(row.validFrom)
            setValidTo(row.validTo)
            setIdProofType(row.typeId)
            setBillsName(row.files.map((file) => file.fileName))
            setBills(row.files)
            setTypeName(row.typeName)
            setVisible('update')

            // Finally, show the modal
            setShow(true)
        } else {
            // Check if the identification value contains an asterisk, which indicates it's masked.
            if (row.identification && row.identification.includes('*')) {
                // The value is masked, so call the API to get the unmasked string.
                getUnMaskString({
                    entity: 'employees',
                    organizationId: userDetails.organizationId,
                    masked: row.identification
                }).then((res) => {
                    if (res.statusCode === 200) {
                        setIdProofEdit((prevState) => ({
                            ...prevState,
                            identification: res.data
                        }))
                    }
                    // Continue with setting other states after the API call.
                    setValidFrom(row.validFrom)
                    setValidTo(row.validTo)
                    setIdProofType(row.typeId)
                    setBillsName(row.files.map((file) => file.fileName))
                    setBills(row.files)
                    setTypeName(row.typeName)
                    setVisible('update')
                    setShow(true)
                })
            } else {
                // The value is already unmasked (it doesn't contain an asterisk), so just set the state directly.
                setIdProofEdit(row)
                setValidFrom(row.validFrom)
                setValidTo(row.validTo)
                setIdProofType(row.typeId)
                setBillsName(row.files.map((file) => file.fileName))
                setBills(row.files)
                setTypeName(row.typeName)
                setVisible('update')
                setShow(true)
            }
        }
    }

    // Function to close the modal and reset all states related to id proof management
    const onCloseHandler = () => {
        setIdProofEdit('')
        setDeleteShow(false)
        setFormErrors('')
        setShow(false)
        setFileShow(false)
    }
    // Function to handle the keydown event for an input field, enforcing specific character rules
    const handleKeyDown = (event) => {
        const { value } = event.target
        const key = event.key

        // Convert to lowercase to make the check case-insensitive
        const lowerKey = key.toLowerCase()

        // Allow only lowercase a-z and numbers 0-9
        const isLetter = lowerKey >= 'a' && lowerKey <= 'z'
        const isNumber = key >= '0' && key <= '9'

        // Allow control keys like Backspace, Arrow keys, etc.
        const allowedControlKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete']
        if (allowedControlKeys.includes(key)) {
            return
        }

        if (!isLetter && !isNumber) {
            event.preventDefault()
            return
        }

        // Prevent input if value is already 20+ chars and doesn't contain a '.'
        if (value.length >= 20 && !value.includes('.')) {
            event.preventDefault()
        }
    }

    return (
        <>
            <div className="card-body" style={{ marginTop: '1%' }}>
                <Button
                    id="addIdProof"
                    className="addButton"
                    variant="addbtn"
                    onClick={() => onShowHandler('create')}
                >
                    <AddIcon />
                    {/* Displays the AddIcon component inside the button */}
                </Button>
                {/* Table component displays the data in a table format */}
                {data ? (
                    <Table columns={COLUMNS} data={data} serialNumber={true} name={'ID proofs'} />
                ) : (
                    <p className="emptyDataMessage">No Id proofs added yet!</p>
                )}
            </div>
            <Modal className="" show={show} onHide={onCloseHandler} size="lg">
                <Modal.Header closeButton={onCloseHandler}>
                    <Modal.Title>ID Proof</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* input fields for idproofs form */}
                    <div className="">
                        <form className="modalFormBody">
                            <Row>
                                <div className="col-6">
                                    <Form.Group as={Row} className="mb-3" controlId="formGroupType">
                                        <Form.Label id="formGroupType" column sm={4}>
                                            Type <span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={6}>
                                            <Select
                                                classNamePrefix="react-select-sm"
                                                id="idProofTypeSelect"
                                                placeholder=""
                                                onChange={handleTypeSelection}
                                                required
                                                onBlur={() =>
                                                    !idProofType
                                                        ? setFormErrors({
                                                            ...formErrors,
                                                            typeId: 'Required'
                                                        })
                                                        : setFormErrors({
                                                            ...formErrors,
                                                            typeId: ''
                                                        })
                                                }
                                                value={updateIdProofsOptions.filter(
                                                    (e) => e.value == idProofType
                                                )}
                                                options={idProofsOptions}
                                                size="sm"
                                                name="type"
                                            />
                                            <p className="error">{formErrors.typeId}</p>
                                        </Col>
                                    </Form.Group>
                                </div>

                                <div className="col-6">
                                    <Form.Group
                                        as={Row}
                                        className="mb-3"
                                        controlId="formGroupIdentification"
                                    >
                                        <Form.Label id="formGroupIdentification" column sm={5}>
                                            Identification <span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={6}>
                                            <Form.Control
                                                id="identificationInput"
                                                required
                                                size="sm"
                                                name="identification"
                                                onKeyPress={handleKeyDown}
                                                onBlur={(e) =>
                                                    !e.target.value
                                                        ? setFormErrors({
                                                            ...formErrors,
                                                            identification: 'Required'
                                                        })
                                                        : setFormErrors({
                                                            ...formErrors,
                                                            identification: ''
                                                        })
                                                }
                                                maxLength={20}
                                                defaultValue={
                                                    idProofEdit && idProofEdit.identification
                                                }
                                                onChange={handleInputChange}
                                            />
                                            <p className="error">{formErrors.identification}</p>
                                        </Col>
                                    </Form.Group>
                                </div>

                                <div className="col-6 mb-2">
                                    <Form.Group
                                        as={Row}
                                        className="mb-3"
                                        controlId="formGroupValidFrom"
                                    >
                                        <Form.Label id="formGroupValidFrom" column sm={4}>
                                            Valid From
                                        </Form.Label>
                                        <Col sm={6}>
                                            <DatePicker
                                                id="validFromDatePicker"
                                                format={'DD-MM-YYYY'}
                                                inputReadOnly={true}
                                                placeholder="Select Date"
                                                onChange={handleValidFrom}
                                                value={validFrom == null ? null : moment(validFrom)}
                                                allowClear={false}
                                                onBlur={(e) =>
                                                    !e.target.value
                                                        ? setFormErrors({
                                                            ...formErrors,
                                                            validFrom: 'Required'
                                                        })
                                                        : setFormErrors({
                                                            ...formErrors,
                                                            validFrom: ''
                                                        })
                                                }
                                                required
                                                size="sm"
                                                disabledDate={(current) => {
                                                    let customDate =
                                                        moment(validTo).format('YYYY-MM-DD')
                                                    return (
                                                        current &&
                                                        current > moment(customDate, 'YYYY-MM-DD')
                                                    )
                                                }}
                                            />
                                            {/* <p className="error">{formErrors.validFrom}</p> #1742: commented this line */}
                                        </Col>
                                    </Form.Group>
                                </div>

                                <div className="col-6">
                                    <Form.Group
                                        as={Row}
                                        className="mb-3"
                                        controlId="formGroupValidTo"
                                    >
                                        <Form.Label id="formGroupValidTo" column sm={5}>
                                            Valid To
                                        </Form.Label>
                                        <Col sm={6}>
                                            <DatePicker
                                                id="validToDatePicker"
                                                format={'DD-MM-YYYY'}
                                                inputReadOnly={true}
                                                placeholder="Select Date"
                                                required
                                                onBlur={(e) =>
                                                    !e.target.value
                                                        ? setFormErrors({
                                                            ...formErrors,
                                                            validTo: 'Required'
                                                        })
                                                        : setFormErrors({
                                                            ...formErrors,
                                                            validTo: ''
                                                        })
                                                }
                                                disabledDate={(current) => {
                                                    let customDate =
                                                        moment(validFrom).format('YYYY-MM-DD')
                                                    return (
                                                        current &&
                                                        current < moment(customDate, 'YYYY-MM-DD')
                                                    )
                                                }}
                                                size="sm"
                                                value={validTo == null ? null : moment(validTo)}
                                                allowClear={false}
                                                onChange={handleValidTo}
                                            />
                                            {/* <p className="error">{formErrors.validTo}</p> #1742: commented this line */}
                                        </Col>
                                    </Form.Group>
                                </div>

                                <div className="col-6">
                                    <Form.Group
                                        as={Row}
                                        className="mb-3"
                                        controlId="formGroupIssuedAt"
                                    >
                                        <Form.Label id="formGroupIssuedAt" column sm={4}>
                                            Issued By
                                        </Form.Label>
                                        <Col sm={6}>
                                            <Form.Control
                                                id="issuedAtInput"
                                                onChange={handleInputChange}
                                                required
                                                maxLength={50}
                                                onKeyPress={(e) => handleKeyPress(e, setFormErrors)}
                                                onPaste={(e) => handleKeyPress(e, setFormErrors)}
                                                onInput={(e) => handleKeyPress(e, setFormErrors)}
                                                size="sm"
                                                type="text"
                                                defaultValue={idProofEdit && idProofEdit.issuedAt}
                                                name="issuedAt"
                                            />
                                        </Col>
                                    </Form.Group>
                                </div>
                                <div className="col-6">
                                    <Form.Group as={Row} className="mb-3" controlId="formGroupFile">
                                        <Form.Label id="formGroupFile" column sm={5}>
                                            Upload File
                                        </Form.Label>
                                        <Col sm={7}>
                                            <Form.Control
                                                multiple
                                                id="fileInput"
                                                type="file"
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
                            id="addIdproof"
                            className="Button"
                            variant="addbtn"
                            onClick={idProofs}
                        >
                            Add
                        </Button>
                    )}
                    {visible == 'update' && (
                        <Button
                            id="updateIdproof"
                            className="Button"
                            variant="addbtn"
                            onClick={updateIdproof}
                        >
                            Update
                        </Button>
                    )}
                    <Button
                        id="closeIdProof"
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
                        id="proceedDeleteIdProof"
                        className="Button"
                        variant="addbtn"
                        onClick={proceedDeleteHandler}
                    >
                        Yes
                    </Button>
                    <Button
                        id="cancelDeleteIdProof"
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
                    <FileViewer documents={bills ? bills : []} />
                </Modal.Body>
            </Modal>
        </>
    )
}
export default IdProofs
