import { useState } from 'react'
import { Button, Col, Form, Modal, Row, Tooltip } from 'react-bootstrap'
import Table from '../../../Common/Table/Table'
import { AddIcon, DeleteIcon, EditIcon, Pdf } from '../../../Common/CommonIcons/CommonIcons'
import { useEffect } from 'react'
import FileViewer from '../../../Common/CommonComponents/FileViewer'
import moment from 'moment'
import { handleKeyPress } from '../../../Common/CommonComponents/FormControlValidation'

const Education = ({ educationList, setEducationGet, setEducationSelectedFiles, dateOfBirth }) => {
    const [show, setShow] = useState('')
    const [visible, setVisible] = useState('')
    const [formData, setFormData] = useState('')
    const [fileShow, setFileShow] = useState(false)
    // const[educationFiles,setEducationFiles]=useState(setEducationSelectedFiles)
    // setEducationFiles(setEducationSelectedFiles)
    console.log(
        educationList.map((e) => e.files),
        'educationFilessssss'
    )
    const [bills, setBills] = useState([])
    // console.log(bills, "billsdatasss")
    const [billsName, setBillsName] = useState([])
    const [billsType, setBillsType] = useState([])
    const [selectFiles, setSelectFiles] = useState([])
    const [eduFiles, setEdufiles] = useState([])

    const deleteBills = (index, element) => {
        // console.log(element, "elemenetsss")
        const updatedBills = [...bills]
        updatedBills.splice(index, 1)
        // console.log(updatedBills, "updaetedbillssss")
        const updatedSelectedFiles = selectFiles.filter((file) => file.name !== element)
        // console.log(updatedSelectedFiles, "selectedFilesss")
        setEdufiles(eduFiles.filter((item) => item.fileName !== element))
        const nameArray = updatedBills.map((file) =>
            file.file instanceof File ? file.fileName : file.id ? file.fileName : file.name
        )
        setBills(updatedBills)
        setSelectFiles(updatedSelectedFiles)
        setBillsName(nameArray)
        const fileInput = document.getElementById('fileInput')
        fileInput.value = null // Resetting the input value
    }

    const [yearchange, setYearChnage] = useState('')
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
        if (name == 'yearOfPassedOut') {
            setYearChnage(value)
        }
    }



    const handleFilesShow = (bills, action) => {
        const newArray = bills.map((obj) => ({
            fileName: obj.fileName,
            fileType: obj.fileType,
            file: obj.file
        }))
        setBills(newArray)
        if (action == 'educationFiles') {
            setFileShow(true)
        }
    }

    const [data, setData] = useState(educationList)
    useEffect(() => {
        setData(educationList)
        setEducationSelectedFiles(selectFiles)
        const existingFiles = educationList.map((e) => e.files || [])
        setEdufiles(existingFiles.flatMap((innerArray) => innerArray.map((obj) => obj)))
    }, [educationList])

    let billObjects = []
    const education = () => {
        if (bills) {
            billObjects = bills.map((bill) => ({
                id: bill.id,
                fileName:
                    bill.file instanceof File ? bill.fileName : bill.id ? bill.fileName : bill.name,
                fileType:
                    bill.file instanceof File ? bill.fileType : bill.id ? bill.fileType : bill.type,
                file: bill.file instanceof File ? bill.file : bill.id ? bill.file : bill
            }))
        }
        const educationObj = {
            id: null,
            board: formData.board,
            branch: formData.branch,
            cgpa: formData.cgpa,
            college: formData.college,
            degree: formData.degree,
            yearOfPassedOut: formData.yearOfPassedOut,
            files: billObjects ? billObjects : null
        }
        const duplicateYear = data.some(
            (edu) => educationObj.yearOfPassedOut == edu.yearOfPassedOut
        )
        const dateOfBirthYear = parseInt(moment(dateOfBirth).format('YYYY'), 10)

        if (!educationObj.board) {
            setFormErrors(validate(educationObj))
        } else if (!educationObj.cgpa) {
            setFormErrors(validate(educationObj))
        } else if (!educationObj.college) {
            setFormErrors(validate(educationObj))
        } else if (!educationObj.degree) {
            setFormErrors(validate(educationObj))
        } else if (duplicateYear) {
            setFormErrors((prevErrors) => ({
                ...prevErrors,
                yearOfPassedOut: 'The year of passing out already exists.'
            }))
            return // Exit early to prevent further code execution
        } else if (!educationObj.yearOfPassedOut) {
            setFormErrors(validate(educationObj))
        } else if (parseInt(educationObj.yearOfPassedOut, 10) < dateOfBirthYear + 5) {
            setFormErrors(validate(educationObj))
        } else {

            const educationData = [...data, educationObj]
            setEducationGet(educationData)
            setData(educationData)
            setSelectFiles([...selectFiles, ...bills])
            onCloseHandler()

        }
    }
    const updateEducation = () => {
        if (bills) {
            billObjects = bills.map((bill) => ({
                id: bill.id,
                fileName:
                    bill.file instanceof File ? bill.fileName : bill.id ? bill.fileName : bill.name,
                fileType:
                    bill.file instanceof File ? bill.fileType : bill.id ? bill.fileType : bill.type,
                file: bill.file instanceof File ? bill.file : bill.id ? bill.file : bill
            }))
        }
        const updateEducationObj = {
            id: educationEdit.id,
            email: formData.email ? formData.email : educationEdit.email,
            board: formData.board !== undefined ? formData.board : educationEdit.board,
            branch: formData.branch ? formData.branch : educationEdit.branch,
            cgpa: formData.cgpa !== undefined ? formData.cgpa : educationEdit.cgpa,
            organizationId: educationEdit.organizationId,
            college: formData.college !== undefined ? formData.college : educationEdit.college,
            degree: formData.degree !== undefined ? formData.degree : educationEdit.degree,
            yearOfPassedOut: formData.yearOfPassedOut !== undefined
                ? formData.yearOfPassedOut
                : educationEdit.yearOfPassedOut,
            files: billObjects ? billObjects : null
        }

        const duplicateYear = data.some((edu) => edu.yearOfPassedOut === yearchange)
        const dateOfBirthYear = parseInt(moment(dateOfBirth).format('YYYY'), 10)
        if (!updateEducationObj.board) {
            setFormErrors(prev => ({ ...prev, board: 'Required' }))
            return
        }
        if (!updateEducationObj.cgpa) {
            setFormErrors(prev => ({ ...prev, cgpa: 'Required' }))
            return
        } else if (!updateEducationObj.college) {
           setFormErrors(prev => ({ ...prev, college: 'Required' }))
            return
        } else if (!updateEducationObj.degree) {
            setFormErrors(prev => ({ ...prev, degree: 'Required' }))
            return
        }

        if (duplicateYear) {
            setFormErrors((prevErrors) => ({
                ...prevErrors,
                yearOfPassedOut: 'The year of passing out already exists.'
            }))
            return // Exit early to prevent further code execution
        }
        //  else if (!updateEducationObj.yearOfPassedOut) {
        //   setFormErrors(validate(updateEducationObj));
        // }
        // const inputYear = parseInt(e.target.value, 10);
        if (!updateEducationObj.yearOfPassedOut) {
             setFormErrors(prev => ({ ...prev, yearOfPassedOut: 'Required' }))
            return
        } else if (parseInt(updateEducationObj.yearOfPassedOut, 10) < dateOfBirthYear + 5) {
            setFormErrors(validate(updateEducationObj))
            // errors.yearOfPassedOut= `Cannot be less than ${dateOfBirthYear}`;
        } else {
            const educationData = [...educationList]
            educationData[index] = updateEducationObj
            setEducationGet(educationData)
            setSelectFiles([...selectFiles, ...bills])
            setEducationSelectedFiles((prevFiles) => [...prevFiles, ...bills])
            onCloseHandler()

        }
    }
    const COLUMNS = [
        {
            Header: 'Board',
            accessor: 'board',
            Cell: ({ row }) => (
                <>
                    {!show && (
                        <Tooltip title={row.original.board} open>
                            {row.original.board}
                        </Tooltip>
                    )}
                    <div className="tableLength">{row.original.board}</div>
                </>
            )
        },
        {
            Header: 'Branch',
            accessor: 'branch',
            Cell: ({ row }) => (
                <>
                    {!show && (
                        <Tooltip title={row.original.branch} open>
                            {row.original.branch}
                        </Tooltip>
                    )}
                    <div className="tableLength">{row.original.branch}</div>
                </>
            )
        },
        {
            Header: 'CGPA',
            accessor: 'cgpa'
        },
        {
            Header: 'College',
            accessor: 'college',
            Cell: ({ row }) => (
                <>
                    {!show && (
                        <Tooltip title={row.original.college} open>
                            {row.original.college}
                        </Tooltip>
                    )}
                    <div className="tableLength">{row.original.college}</div>
                </>
            )
        },
        {
            Header: 'Degree',
            accessor: 'degree',
            Cell: ({ row }) => (
                <>
                    {!show && (
                        <Tooltip title={row.original.degree} open>
                            {row.original.address1}
                        </Tooltip>
                    )}
                    <div className="tableLength">{row.original.degree}</div>
                </>
            )
        },
        {
            Header: 'Year of Passing',
            accessor: 'yearOfPassedOut'
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
                            // type="button"
                            id="educationFiles"
                            variant=""
                            className="iconWidth"
                            onClick={() => handleFilesShow(row.original.files, 'educationFiles')}
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
                            id="updateEducation"
                            variant=""
                            className="iconWidth"
                            onClick={() => onShowHandler('update', row.original, row.index)}
                        >
                            <EditIcon />
                        </Button>
                        |
                        <Button
                            id="deleteEducation"
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

    const [deleteShow, setDeleteShow] = useState(false)
    const [indexs, setIndexS] = useState()

    const handleRemove = (index) => {
        setDeleteShow(true)
        setIndexS(index)
    }
    const proceedDeleteHandler = (e) => {
        e.preventDefault()
        const rows = [...data]
        rows.splice(indexs, 1)
        setEducationGet(rows)
        setDeleteShow(false)
    }
    const handleKeyDown = (e) => {
        if (e.key == '-' || e.key == '+') {
            e.preventDefault()
        }
        setTimeout(() => {
            const inputValue = parseInt(e.target.value)
            if (!isNaN(inputValue) && inputValue > 100) {
                e.target.value = '' // Clear the input
            }
        }, 0)
    }
    const [educationEdit, setEducationEdit] = useState({})
    const [index, setIndex] = useState(null)
    const onShowHandler = (action, row, index) => {
        setIndex(index)
        if (action == 'create') {
            setVisible('create')
            setShow(true)
            setFormData('')
            setBills([])
            setBillsName([])
        } else {
            setEducationEdit(row)
            setVisible('update')
            setShow(true)
            setBillsName(row.files.map((row) => row.fileName))
            setBills(row.files)
        }
    }

    const onCloseHandler = () => {
        setYearChnage('')
        setShow(false)
        setEducationEdit('')
        setFormErrors('')
        setDeleteShow(false)
        setFileShow(false)
    }

    const onFileChangeHandler = (event) => {
        const selectedFiles = event.target.files
        if (selectedFiles.length === 0) return
        const filesArray = Array.from(selectedFiles)
        const fileNames = eduFiles.map((e) => e.fileName)
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

    const [formErrors, setFormErrors] = useState({})
    const validate = (values) => {
        const errors = {}
        if (!values.board) {
            errors.board = 'Required'
        }
        if (!values.degree) {
            errors.degree = 'Required'
        }
        if (!values.cgpa) {
            errors.cgpa = 'Required'
        }
        if (!values.college) {
            errors.college = 'Required'
        }
        const dateOfBirthYear = parseInt(moment(dateOfBirth).format('YYYY'), 10)
        // const inputYear = parseInt(e.target.value, 10);
        if (!values.yearOfPassedOut) {
            errors.yearOfPassedOut = 'Required'
        } else if (parseInt(values.yearOfPassedOut, 10) < dateOfBirthYear + 5) {
            errors.yearOfPassedOut = `Cannot be less than ${dateOfBirthYear + 5}`
        }
        return errors
    }

    const maxLengthCheck = (object) => {
        if (object.target.value.length > object.target.maxLength) {
            object.target.value = object.target.value.slice(0, object.target.maxLength)
        }
    }

    const handleKeyDownEdu = (event) => {
        const year = new Date().getFullYear()
        console.log(event, 'chekingEvenThandler')
        if (
            !/[0-9.,]/.test(event.key) &&
            !['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Delete'].includes(event.key)
        ) {
            event.preventDefault() // Block everything else: letters, symbols, etc.
        }
        setTimeout(() => {
            const inputValue = parseInt(event.target.value, 10)
            if (!isNaN(inputValue) && inputValue > year) {
                event.target.value = '' // Clear the input
            }
        }, 0)
    }
    return (
        <>
            <div className="card-body" style={{ marginTop: '1%' }}>
                {/* <TableHeader tableTitle="Education" /> */}
                <Button
                    id="addEducation"
                    className="addButton"
                    variant="addbtn"
                    onClick={() => onShowHandler('create')}
                >
                    <AddIcon />
                </Button>
                {data ? (
                    <Table
                        columns={COLUMNS}
                        data={data}
                        serialNumber={true}
                        name={'education records'}
                    />
                ) : (
                    <p>No education records added yet!</p>
                )}
            </div>
            <Modal className="" show={show} onHide={onCloseHandler} size="lg">
                <Modal.Header closeButton={onCloseHandler}>
                    <Modal.Title>Education</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="">
                        <form className="modalFormBody">
                            <Row>
                                <div className="col-6">
                                    <Form.Group as={Row} className="mb-3" controlId="board">
                                        <Form.Label id="board" column sm={4}>
                                            Board <span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={6}>
                                            <Form.Control
                                                id="board"
                                                onChange={handleInputChange}
                                                required
                                                type="text"
                                                size="sm"
                                                maxLength={50}
                                                onKeyPress={(e) => handleKeyPress(e, setFormErrors)}
                                                onPaste={(e) => handleKeyPress(e, setFormErrors)}
                                                onInput={(e) => handleKeyPress(e, setFormErrors)}
                                                onBlur={(e) =>
                                                    !e.target.value
                                                        ? setFormErrors({
                                                            ...formErrors,
                                                            board: 'Required'
                                                        })
                                                        : setFormErrors({
                                                            ...formErrors,
                                                            board: ''
                                                        })
                                                }
                                                defaultValue={educationEdit && educationEdit.board}
                                                name="board"
                                            />
                                            <p className="error">{formErrors.board}</p>
                                        </Col>
                                    </Form.Group>
                                </div>

                                <div className="col-6">
                                    <Form.Group as={Row} className="mb-3" controlId="branch">
                                        <Form.Label id="branch" column sm={5}>
                                            Branch
                                        </Form.Label>
                                        <Col sm={6}>
                                            <Form.Control
                                                id="branch"
                                                required
                                                size="sm"
                                                maxLength={50}
                                                onKeyPress={(e) => handleKeyPress(e, setFormErrors)}
                                                onPaste={(e) => handleKeyPress(e, setFormErrors)}
                                                onInput={(e) => handleKeyPress(e, setFormErrors)}
                                                name="branch"
                                                defaultValue={educationEdit && educationEdit.branch}
                                                onChange={handleInputChange}
                                            />
                                        </Col>
                                    </Form.Group>
                                </div>

                                <div className="col-6">
                                    <Form.Group as={Row} className="mb-3" id="cgpa">
                                        <Form.Label id="cgpa" column sm={4}>
                                            CGPA / % <span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={6}>
                                            <Form.Control
                                                id="cgpa"
                                                onChange={handleInputChange}
                                                required
                                                size="sm"
                                                onInput={maxLengthCheck}
                                                type="number"
                                                min={'4'}
                                                max={100}
                                                maxLength={5} // Allow only 6 digits
                                                pattern="^\d{1,6}$" // Ensure only numeric input
                                                onKeyDown={handleKeyDown}
                                                onBlur={(e) =>
                                                    !e.target.value
                                                        ? setFormErrors({
                                                            ...formErrors,
                                                            cgpa: 'Required'
                                                        })
                                                        : setFormErrors({ ...formErrors, cgpa: '' })
                                                }
                                                defaultValue={educationEdit && educationEdit.cgpa}
                                                name="cgpa"
                                            />
                                            <p className="error">{formErrors.cgpa}</p>
                                        </Col>
                                    </Form.Group>
                                </div>

                                <div className="col-6">
                                    <Form.Group as={Row} className="mb-3" controlId="college">
                                        <Form.Label id="college" column sm={5}>
                                            College <span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={6}>
                                            <Form.Control
                                                id="college"
                                                required
                                                size="sm"
                                                maxLength={50}
                                                onKeyPress={(e) => handleKeyPress(e, setFormErrors)}
                                                onPaste={(e) => handleKeyPress(e, setFormErrors)}
                                                onInput={(e) => handleKeyPress(e, setFormErrors)}
                                                name="college"
                                                onBlur={(e) =>
                                                    !e.target.value
                                                        ? setFormErrors({
                                                            ...formErrors,
                                                            college: 'Required'
                                                        })
                                                        : setFormErrors({
                                                            ...formErrors,
                                                            college: ''
                                                        })
                                                }
                                                defaultValue={
                                                    educationEdit && educationEdit.college
                                                }
                                                onChange={handleInputChange}
                                            />
                                            <p className="error">{formErrors.college}</p>
                                        </Col>
                                    </Form.Group>
                                </div>

                                <div className="col-6">
                                    <Form.Group as={Row} className="mb-3" controlId="degree">
                                        <Form.Label id="degree" column sm={4}>
                                            Degree <span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={6}>
                                            <Form.Control
                                                id="degree"
                                                autoComplete="off"
                                                onKeyPress={(e) => handleKeyPress(e, setFormErrors)}
                                                onPaste={(e) => handleKeyPress(e, setFormErrors)}
                                                onInput={(e) => handleKeyPress(e, setFormErrors)}
                                                onChange={handleInputChange}
                                                required
                                                size="sm"
                                                type="text"
                                                maxLength={50}
                                                onBlur={(e) =>
                                                    !e.target.value
                                                        ? setFormErrors({
                                                            ...formErrors,
                                                            degree: 'Required'
                                                        })
                                                        : setFormErrors({
                                                            ...formErrors,
                                                            degree: ''
                                                        })
                                                }
                                                defaultValue={educationEdit && educationEdit.degree}
                                                name="degree"
                                            />
                                            <p className="error">{formErrors.degree}</p>
                                        </Col>
                                    </Form.Group>
                                </div>

                                <div className="col-6">
                                    <Form.Group
                                        as={Row}
                                        className="mb-3"
                                        controlId="yearOfPassedOut"
                                    >
                                        <Form.Label id="yearOfPassedOut" column sm={5}>
                                            Year of Passing <span className="error">*</span>
                                        </Form.Label>
                                        <Col md={6}>
                                            <Form.Control
                                                id="yearOfPassedOut"
                                                type="text"
                                                size="sm"
                                                className="text-wrap text-right"
                                                name="yearOfPassedOut"
                                                maxlength="4"
                                                defaultValue={
                                                    educationEdit && educationEdit.yearOfPassedOut
                                                }
                                                autoComplete="off"
                                                onKeyDown={handleKeyDownEdu}
                                                onChange={handleInputChange}
                                                onBlur={
                                                    (e) => {
                                                        const dateOfBirthYear = parseInt(
                                                            moment(dateOfBirth).format('YYYY'),
                                                            10
                                                        )
                                                        const inputYear = parseInt(
                                                            e.target.value,
                                                            10
                                                        )

                                                        if (!inputYear) {
                                                            setFormErrors({
                                                                ...formErrors,
                                                                yearOfPassedOut: 'Required'
                                                            })
                                                        } else if (
                                                            inputYear <
                                                            dateOfBirthYear + 5
                                                        ) {
                                                            setFormErrors({
                                                                ...formErrors,
                                                                yearOfPassedOut: `Cannot be less than ${dateOfBirthYear + 5}`
                                                            })
                                                        } else {
                                                            setFormErrors({
                                                                ...formErrors,
                                                                yearOfPassedOut: ''
                                                            })
                                                        }
                                                    }
                                                    // !e.target.value
                                                    //   ? setFormErrors({
                                                    //     ...formErrors,
                                                    //     yearOfPassedOut: "Required",
                                                    //   })
                                                    //   : setFormErrors({
                                                    //     ...formErrors,
                                                    //     yearOfPassedOut: "",
                                                    //   })
                                                }
                                            />
                                            <p className="error">{formErrors.yearOfPassedOut}</p>
                                        </Col>
                                    </Form.Group>
                                </div>
                                <div className="col-6">
                                    <Form.Group as={Row} className="mb-3" controlId="fileInput">
                                        <Form.Label id="EducationfileInput" column sm={4}>
                                            Upload File
                                        </Form.Label>
                                        <Col md={8}>
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
                                                                    id="deleteBills"
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
                <div className="btnCenter mb-3">
                    {visible == 'create' && (
                        <Button
                            id="AddEducation"
                            variant="addbtn"
                            className="Button"
                            onClick={education}
                        >
                            Add
                        </Button>
                    )}
                    {visible == 'update' && (
                        <Button
                            className="Button"
                            id="updateEducation"
                            variant="addbtn"
                            onClick={updateEducation}
                        >
                            Update
                        </Button>
                    )}
                    <Button
                        id="closeEducation"
                        className="Button"
                        variant="secondary"
                        onClick={onCloseHandler}
                    >
                        Close
                    </Button>
                </div>
            </Modal>

            <Modal show={deleteShow} onHide={onCloseHandler} backdrop="static" keyboard={false}>
                <Modal.Header closeButton={onCloseHandler}>
                    <Modal.Title>Delete ?</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    Are you sure you want to delete this item?
                </Modal.Body>
                <div className="delbtn">
                    <Button
                        id="proceedDeleteEducation"
                        className="Button"
                        variant="addbtn"
                        onClick={proceedDeleteHandler}
                    >
                        Yes
                    </Button>
                    <Button
                        id="cancelDeleteEducation"
                        className="Button"
                        variant="secondary"
                        onClick={onCloseHandler}
                    >
                        No
                    </Button>
                </div>
            </Modal>

            <Modal
                show={fileShow}
                size="lg"
                onHide={onCloseHandler}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton={onCloseHandler}>
                    <Modal.Title>Preview</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    <FileViewer documents={bills} />
                </Modal.Body>
            </Modal>
        </>
    )
}
export default Education
