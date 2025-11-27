import React, { useEffect, useState } from 'react'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'
import PageHeader from '../../Common/CommonComponents/PageHeader'
import { useLocation, useNavigate } from 'react-router-dom'
import { UpdateWithFile, getById } from '../../Common/Services/CommonService'
// import FileViewer from '../../Common/CommonComponents/FileViewer'
import { Editor } from 'react-draft-wysiwyg'
import draftToHtml from 'draftjs-to-html'
import { EditorState, convertToRaw } from 'draft-js'
import moment from 'moment'
import { toast } from 'react-toastify'
import Cards from './Cards'
import { cancelButtonName } from '../../Common/Utilities/Constants'
import DetailLoader from '../../Common/CommonComponents/Loaders/DetailLoader'
import { ToastError } from '../../Common/CommonComponents/ToastCustomized'
import { CiImport } from 'react-icons/ci'

const FeedBack = () => {
    // Getting user details from Redux store
    const navigate = useNavigate()
    const location = useLocation()
    // State to store attachments (selected files)
    const [attachments, setAttachments] = useState([])
    // Main data object to hold feedback details
    const [data, setData] = useState({
        subject: '',
        organizationId: '',
        submittedBy: '',
        status: '',
        closedBy: '',
        employeeName: '',
        feedbackDetailDTOs: []
    })
    const [fileOpen, setFileOpen] = useState(false) // Controls file preview modal visibility
    const [getFile, setGetFile] = useState(null) // Stores the file to preview
    const [fileDeleteShow, setFileDeleteShow] = useState(false) // Controls file delete confirmation modal visibility
    const [index, setIndex] = useState(null) // Stores the index of the file to delete
    // Modal visibility state
    const [show, setShow] = useState(false)
    // HTML converted string from the rich text editor
    const [htmlObj, setHTMLObj] = useState('')
    // Tracks current status of the feedback (Open/Closed/etc.)
    const [status, setStatus] = useState()
    // Loading indicator
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        getFeedbackDetailsById() // Fetch feedback details on mount
    }, [])
    // Show modal for adding a comment and set status to be updated
    const onShowHandler = (status) => {
        setShow(true)
        setStatus(status)
        // let editorState = EditorState.createEmpty();
        setEditorBody(EditorState.createEmpty()) // Reset editor state to empty
    }

    const handleDleteCloseHandler = () => {
        setFileDeleteShow(false)
    }

    const handleSelectFilesDelete = () => {
        const updateSelectFiles = [...attachments]
        updateSelectFiles.splice(index, 1)
        setAttachments(updateSelectFiles)
        handleDleteCloseHandler()
    }

    // API call to fetch feedback details by ID
    const getFeedbackDetailsById = () => {
        setIsLoading(true)
        getById({ entity: 'feedbacks', organizationId: 0, id: location.state && location.state.id })
            .then((res) => {
                if (res.statusCode == 200) {
                    setStatus(res.data ? res.data.status : null)
                    setData(res.data)
                    // If feedback is marked as unseen, update it as seen
                    if (location.state.seen) {
                        updateFeedbackHandler(res.data)
                    } else {
                        setIsLoading(false)
                    }
                }
            })
            .catch(() => {
                setIsLoading(false)
            })
    }
    // Update feedback to mark it as seen
    const updateFeedbackHandler = (res) => {
        setIsLoading(true)
        const body = { ...res, seen: true } // Set seen to true
        console.log(body)
        let feedbackForm = new FormData()
        feedbackForm.append('feedback', JSON.stringify(body))
        UpdateWithFile({
            entity: 'feedbacks',
            organizationId: 0,
            id: location.state && location.state.id,
            body: feedbackForm
        })
            .then(() => {
                setIsLoading(false)
            })
            .catch((err) => {
                setIsLoading(false)
                ToastError(err.message)
            })
    }
    // States to manage file preview modal
    // const files= useState([])
    // const fileShow= useState(false)

    // Close modals and reset states
    const onCloseHandler = () => {
        // setFileShow(false)
        setShow(false)
        setFormErrors({})
        setAttachments([])
        setEditorBody(EditorState.createEmpty()) // Reset editor state
        setHTMLObj('')
    }
    // Show file preview
    // const handleFilesShow = (bills, action) => {
    //     setFileShow(true)
    // }

    // Editor state and its change handler
    const [editorBody, setEditorBody] = useState('')
    const MAX_CHAR_LIMIT = 700 // Maximum allowed characters
    const [remainingChars, setRemainingChars] = useState(MAX_CHAR_LIMIT) // Remaining character count

    const onEditorStateChange = (editorState) => {
        const rawContent = convertToRaw(editorState.getCurrentContent())
        let htmlContent = draftToHtml(rawContent).trim()
        htmlContent = htmlContent.replace(/(<p>\s*<\/p>|<br>|&nbsp;|<[^>]*>)/gi, '').trim()
        if (htmlContent.length <= MAX_CHAR_LIMIT) {
            setEditorBody(editorState)
            setHTMLObj(htmlContent)
            setFormErrors({ ...formErrors, comment: '' })
        }

        setRemainingChars(MAX_CHAR_LIMIT - htmlContent.length) // Update remaining character count
    }

    // const handleClose = () => {
    //     setShow(false)
    //     setFormErrors({})
    //     setAttachments([])
    // }

    const handleInitialFileShow = (element) => {
        setFileOpen(true)
        setGetFile(element)
    }

    const handleInitialFileCloseHandler = () => {
        setFileOpen(false)
    }

    const handleDleteShowHandler = (ind) => {
        setFileDeleteShow(true)
        setIndex(ind)
    }

    // Error state for validation
    const [formErrors, setFormErrors] = useState({})

    // Max size for all attachments: 10MB
    const MAX_TOTAL_SIZE = 10 * 1024 * 1024

    // File selection handler
    // const handleSelectFiles = (e) => {
    //     const selectedFiles = Array.from(e.target.files);
    //     const totalSize = selectedFiles.reduce((acc, file) => acc + file.size, 0);
    //     if (totalSize > MAX_TOTAL_SIZE) {
    //         // Show error if file size exceeds max limit
    //         setFormErrors({ ...formErrors, "files": `Total file size should not exceed ${MAX_TOTAL_SIZE / (1024 * 1024)}MB` });
    //     } else {
    //         setFormErrors({});
    //         setAttachments(e.target.files)
    //     }

    // };

    const handleFileSelect = (event) => {
        const selectedFiles = event.target.files
        const newFilesArray = Array.from(selectedFiles)

        const validFileTypes = ['image/jpeg', 'image/png', 'image/gif']
        const maxFiles = 5
        const maxTotalSize = 10 * 1024 * 1024

        const filteredNewFiles = newFilesArray.filter((file) => validFileTypes.includes(file.type))
        const invalidFiles = newFilesArray.filter((file) => !validFileTypes.includes(file.type))

        if (invalidFiles.length > 0) {
            const invalidFileNames = invalidFiles.map((file) => file.name).join(', ')
            toast.error(
                `The following files have unsupported formats and will not be added: ${invalidFileNames}. Allowed file types are JPEG, PNG, and JPG.`
            )
        }

        const existingFilesSet = new Set(
            (Array.isArray(attachments) ? attachments : []).map(
                (file) => file.name || file.fileName
            )
        )
        const duplicates = filteredNewFiles.filter((file) =>
            existingFilesSet.has(file.name || file.fileName)
        )

        if (duplicates.length > 0) {
            const duplicateNames = duplicates.map((file) => file.name || file.fileName).join(', ')
            toast.error(
                `The following files are duplicates and will not be added: ${duplicateNames}`
            )
        }

        const validNewFiles = filteredNewFiles.filter(
            (file) => !existingFilesSet.has(file.name || file.fileName)
        )
        setAttachments((prevFiles) => {
            const existingFiles = Array.isArray(prevFiles) ? prevFiles : []
            const combinedFiles = [...existingFiles, ...validNewFiles]

            if (combinedFiles.length > maxFiles) {
                toast.error(`You can only upload up to ${maxFiles} files.`)
                return existingFiles
            }

            const totalSize = combinedFiles.reduce((acc, file) => acc + file.size, 0)
            if (totalSize > maxTotalSize) {
                toast.error('The total file size must not exceed 10 MB.')
                return existingFiles
            }

            return combinedFiles
        })

        // Reset the input so the same file can be selected again
        event.target.value = ''
    }

    const date = new Date()
    const today = moment(date).format('YYYY-MM-DD') // Format today's date

    // Handler to update feedback with comment and attachments
    const onUpdateHandler = () => {
        let commentObj = {
            body: htmlObj,
            submittedBy: 0,
            submittedDate: today,
            remarks: '',
            attachmentDTOs: null
        }
        // Validation checks
        const cleanedHtml = htmlObj ? htmlObj.replace(/(<p>\s*<\/p>|<br>|&nbsp;)/gi, '').trim() : ''
        // if (!cleanedHtml) {
        //   errors.comment = "Required";
        // }
        if (!cleanedHtml) {
            setFormErrors({ ...formErrors, comment: 'Required' })
            return
        } else if (formErrors && formErrors.files) {
            setFormErrors({
                ...formErrors,
                files: `Total file size should not exceed ${MAX_TOTAL_SIZE / 1024}KB`
            })
            return
        }
        setIsLoading(true)

        // Deep copy of the data object to avoid mutating original state directly
        const formData = JSON.parse(JSON.stringify(data))
        formData.status = status
        formData.feedbackDetailDTOs.push(commentObj)

        let feedbackForm = new FormData()
        // Append attachments to FormData
        for (let i = 0; i < attachments.length; i++) {
            feedbackForm.append('attachments', attachments[i])
        }
        // Append updated feedback object
        feedbackForm.append('feedback', JSON.stringify(formData))

        UpdateWithFile({
            entity: 'feedbacks',
            organizationId: 0,
            id: location.state && location.state.id,
            body: feedbackForm
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    getFeedbackDetailsById()
                    onCloseHandler()
                    setHTMLObj('')
                    setAttachments([])
                    // Update local state (optional since refetching)
                    data.status = status
                    data.feedbackDetailDTOs.push(commentObj)
                } else {
                    toast.error(res.errorMessage)
                    setAttachments([])
                }
                setIsLoading(false)
            })
            .catch((err) => {
                setIsLoading(false)
                ToastError(err.message)
            })
    }
    // Show file attachments
    // const onFileHandler = (docs) => {
    //     setFileShow(true)
    //     setFiles(docs)
    // }

    // Calculate and display how many days ago feedback was submitted
    // const ondayCount = (date) => {
    //     let newDate = new Date()
    //     let submittedDate = new Date(date)
    //     let noOfDays = Math.floor((newDate - submittedDate) / (1000 * 60 * 60 * 24))

    //     if (noOfDays > 0) {
    //         if (noOfDays == 1) {
    //             return noOfDays + ' day ago'
    //         } else {
    //             return noOfDays + ' days ago'
    //         }
    //     } else {
    //         return 'Today'
    //     }
    // }

    return (
        <>
            {/* Check if location.state exists to decide what to render */}
            {location.state ? (
                <>
                    {/* Main Section for Support Ticket Detail */}
                    <section className="section detailBackground">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="">
                                        <PageHeader pageTitle={'Support Ticket'} />

                                        {/* Loader while data is loading */}
                                        {isLoading ? <DetailLoader /> : ''}
                                        <div
                                            className="center"
                                            style={{ paddingLeft: '10%', paddingRight: '10%' }}
                                        >
                                            <form style={{ marginTop: '6%' }} className=" ">
                                                <div className="row mb-3">
                                                    <Form.Group
                                                        as={Row}
                                                        className="align-items-center"
                                                    >
                                                        <Col md={7}>
                                                            <Row>
                                                                <Form.Label column sm={4}>
                                                                    Organization Name
                                                                </Form.Label>
                                                                <Col
                                                                    sm={7}
                                                                    className="textBold"
                                                                    style={{
                                                                        fontSize: '15px',
                                                                        marginTop: '5px'
                                                                    }}
                                                                >
                                                                    {data
                                                                        ? data.organizationName
                                                                        : ''}
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                        <Col md={4}>
                                                            <Row>
                                                                <Form.Label column sm={7}>
                                                                    Status
                                                                </Form.Label>
                                                                <Col
                                                                    sm={4}
                                                                    className="textBold"
                                                                    style={{
                                                                        fontSize: '15px',
                                                                        marginTop: '5px'
                                                                    }}
                                                                >
                                                                    {data ? data.status : ''}
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                    </Form.Group>
                                                </div>
                                                {/* Created Date and Ticket Number Row */}
                                                <div className="row mb-3">
                                                    <Form.Group
                                                        as={Row}
                                                        className="align-items-center"
                                                    >
                                                        <Col md={7}>
                                                            <Row>
                                                                <Form.Label column sm={4}>
                                                                    Created date
                                                                </Form.Label>
                                                                <Col
                                                                    sm={7}
                                                                    className="textBold"
                                                                    style={{
                                                                        fontSize: '15px',
                                                                        marginTop: '5px'
                                                                    }}
                                                                >
                                                                    {data ? data.submittedDate : ''}
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                        <Col md={4}>
                                                            <Row>
                                                                <Form.Label column sm={7}>
                                                                    Ticket Number
                                                                </Form.Label>
                                                                <Col
                                                                    sm={4}
                                                                    className="textBold"
                                                                    style={{
                                                                        fontSize: '15px',
                                                                        marginTop: '5px'
                                                                    }}
                                                                >
                                                                    {data ? data.id : ''}
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                    </Form.Group>
                                                </div>

                                                <div className="row mb-3">
                                                    <Form.Group
                                                        as={Row}
                                                        className="align-items-center"
                                                    >
                                                        <Col md={7}>
                                                            <Row>
                                                                <Form.Label column sm={4}>
                                                                    Subject
                                                                </Form.Label>
                                                                <Col
                                                                    sm={7}
                                                                    className="textBold"
                                                                    style={{
                                                                        fontSize: '15px',
                                                                        marginTop: '5px'
                                                                    }}
                                                                >
                                                                    {/* readOnly */}
                                                                    {data ? data.subject : ''}
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                    </Form.Group>
                                                </div>

                                                <div className="col-"></div>
                                                <div className="col-">
                                                    {data &&
                                                        data.feedbackDetailDTOs.map((item) => (
                                                            <>
                                                                <Cards
                                                                    data={item}
                                                                    name={
                                                                        item.submittedBy == 0
                                                                            ? 'You'
                                                                            : data.employeeName
                                                                    }
                                                                    align={
                                                                        item.submittedBy == 0
                                                                            ? 'right'
                                                                            : 'left'
                                                                    }
                                                                />
                                                            </>
                                                        ))}
                                                </div>

                                                <div className="col- mb-4">
                                                    <Col md={12}>
                                                        <Button
                                                            style={{ float: 'right' }}
                                                            disabled={
                                                                data && data.status == 'Closed'
                                                            }
                                                            className="disable"
                                                            variant="addbtn"
                                                            onClick={() => onShowHandler('Open')}
                                                        >
                                                            Reply
                                                        </Button>
                                                    </Col>
                                                </div>
                                                <div
                                                    className="btnCenter mb-3"
                                                    style={{ marginTop: '6%' }}
                                                >
                                                    {data.status == 'Open' ? (
                                                        <Button
                                                            className="Button"
                                                            variant="addbtn"
                                                            style={{
                                                                height: '33px',
                                                                marginTop: '2.4%',
                                                                whiteSpace: 'nowrap',
                                                                width: '105px'
                                                            }}
                                                            onClick={() => onShowHandler('Closed')}
                                                        >
                                                            Close Ticket
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            className="Button"
                                                            variant="addbtn"
                                                            style={{
                                                                height: '33px',
                                                                marginTop: '2.4%',
                                                                width: '105px'
                                                            }}
                                                            onClick={() => onShowHandler('Open')}
                                                        >
                                                            Reopen
                                                        </Button>
                                                    )}
                                                    <Button
                                                        className="Button"
                                                        variant="secondary"
                                                        type="button"
                                                        style={{
                                                            height: '33px',
                                                            marginTop: '2.4%',
                                                            width: '105px'
                                                        }}
                                                        onClick={() => navigate('/feedbackList')}
                                                    >
                                                        {cancelButtonName}
                                                    </Button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* <Modal
                        show={fileShow}
                        size="lg"
                        onHide={handleClose}
                        backdrop="static"
                        keyboard={false}
                    >
                        <Modal.Header closeButton={handleClose}>
                            <Modal.Title>Preview</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="modalBody">
                            <FileViewer documents={files ? files : []} />
                        </Modal.Body>
                    </Modal> */}
                    <Modal
                        show={show}
                        size="lg"
                        onHide={onCloseHandler}
                        backdrop="static"
                        keyboard={false}
                    >
                        <Modal.Header closeButton={onCloseHandler}>
                            <Modal.Title></Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="">
                            {isLoading ? <DetailLoader /> : ''}

                            <div className="col- mb-2">
                                <Form.Label column sm={2} style={{ marginLeft: '-15px' }}>
                                    Comment: <span className="error">*</span>
                                </Form.Label>
                                <div style={{ position: 'relative' }}>
                                    <Editor
                                        wrapperClassName="wrapper-class"
                                        editorClassName="editor-class"
                                        toolbarClassName="toolbar-class"
                                        editorState={editorBody}
                                        onEditorStateChange={onEditorStateChange}
                                        toolbar={{
                                            inline: { inDropdown: true },
                                            list: { inDropdown: true },
                                            textAlign: { inDropdown: true },
                                            link: { inDropdown: true },
                                            history: { inDropdown: true }
                                        }}
                                    />
                                    <p
                                        className="error"
                                        style={{ textAlign: 'left', color: 'red' }}
                                    >
                                        {formErrors && formErrors.comment}
                                    </p>
                                    <div
                                        style={{
                                            position: 'absolute',
                                            bottom: '-20px',
                                            right: '10px',
                                            fontSize: '12px',
                                            color: remainingChars < 0 ? 'red' : 'gray'
                                        }}
                                    >
                                        {remainingChars < 0 ? 0 : remainingChars} characters
                                        remaining
                                    </div>
                                </div>
                            </div>
                            <div className="col- mb-4">
                                <Form.Group as={Row} className="mb-3" controlId="formGroupToDate">
                                    <Form.Label column sm={2}>
                                        Attachments:
                                    </Form.Label>
                                    {/* <Col md={7}>
                                        <Form.Control
                                            type='file'
                                            multiple
                                            onChange={handleSelectFiles}
                                        />
                                        <p className='error' style={{ textAlign: "left" }}>{formErrors && formErrors.files}</p>
                                        <label>Only JPEG, PNG and JPG accepted. Max size is 10 MB.</label>
                                    </Col> */}

                                    <Col md={7}>
                                        <>
                                            {attachments && attachments.length !== 0 ? (
                                                <>
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'row',
                                                            flexWrap: 'wrap'
                                                        }}
                                                    >
                                                        {attachments.map((file, index) => (
                                                            <span key={index}>
                                                                <a
                                                                    onClick={() =>
                                                                        handleInitialFileShow(
                                                                            file,
                                                                            'Get'
                                                                        )
                                                                    }
                                                                >
                                                                    <u>{file.name}</u>
                                                                </a>
                                                                <a
                                                                    className="error"
                                                                    onClick={() =>
                                                                        handleDleteShowHandler(
                                                                            index
                                                                        )
                                                                    }
                                                                >
                                                                    {' '}
                                                                    X &ensp;
                                                                </a>
                                                                <br />
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <span type="button">
                                                        {attachments.length < 5 && <label
                                                            style={{
                                                                fontWeight: '600',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            (<u>Upload More</u>)
                                                            <input
                                                                type="file"
                                                                multiple
                                                                style={{ display: 'none' }}
                                                                onChange={handleFileSelect}
                                                            />
                                                        </label>}
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <label
                                                        type="button"
                                                        className="timeSheetImport"
                                                    >
                                                        <CiImport
                                                            className="themeColor"
                                                            size={20}
                                                        />{' '}
                                                        Attach Files
                                                        <input
                                                            type="file"
                                                            multiple
                                                            style={{ display: 'none' }}
                                                            onChange={handleFileSelect}
                                                        />
                                                    </label>
                                                </>
                                            )}
                                            &ensp;
                                            <label>
                                                Only JPEG, PNG, and JPG accepted. Max size is 10MB.
                                            </label>
                                        </>
                                    </Col>
                                </Form.Group>
                            </div>

                            <div className="btnCenter mb-3">
                                <Button
                                    className="Button"
                                    variant="addbtn"
                                    onClick={onUpdateHandler}
                                >
                                    Submit
                                </Button>
                                <Button
                                    className="Button"
                                    variant="secondary"
                                    onClick={onCloseHandler}
                                >
                                    {cancelButtonName}
                                </Button>
                            </div>
                        </Modal.Body>
                    </Modal>
                </>
            ) : (
                <section className="section">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-md-12">
                                <div className=" card-primary">
                                    <div style={{ marginTop: '25%' }}>
                                        <center>
                                            <h3>{'You are not Authorized to access this Page'}</h3>
                                        </center>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <Modal
                show={fileDeleteShow}
                onHide={handleDleteCloseHandler}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton={handleDleteCloseHandler}>
                    <Modal.Title>Delete File ?</Modal.Title>
                    {/* <Button variant="secondary" onClick={handleDleteCloseHandler}>X</Button> */}
                </Modal.Header>
                <Modal.Body className="modalBody">
                    Are you sure that you want to delete this file request?
                </Modal.Body>
                <div className="delbtn">
                    <Button className="Button" variant="addbtn" onClick={handleSelectFilesDelete}>
                        Yes
                    </Button>
                    <Button
                        className="Button"
                        variant="secondary"
                        onClick={handleDleteCloseHandler}
                    >
                        No
                    </Button>
                </div>
            </Modal>

            {/* File view Modal */}
            <Modal
                show={fileOpen}
                onHide={handleInitialFileCloseHandler}
                backdrop="static"
                keyboard={false}
                size="lg"
            >
                <Modal.Header closeButton={handleInitialFileCloseHandler}>
                    <Modal.Title>{getFile && getFile.fileName}</Modal.Title>
                    {/* <Button variant="secondary" onClick={handleInitialFileCloseHandler} >X</Button> */}
                </Modal.Header>
                <Modal.Body className="modalBody">
                    <>
                        {
                            <img
                                src={getFile && URL.createObjectURL(getFile)}
                                style={{ width: '70%', height: '300px' }}
                            />
                        }
                    </>
                </Modal.Body>
            </Modal>
        </>
    )
}
export default FeedBack
