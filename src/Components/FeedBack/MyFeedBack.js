import React, { useEffect, useState } from 'react'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'
import PageHeader from '../../Common/CommonComponents/PageHeader'
import { useLocation, useNavigate } from 'react-router-dom'
import { CiImport } from 'react-icons/ci'
import { SaveWithFile, UpdateWithFile, getById } from '../../Common/Services/CommonService'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import moment from 'moment'
import FileViewer from '../../Common/CommonComponents/FileViewer'
import { Editor } from 'react-draft-wysiwyg'
import { ContentState, EditorState, convertToRaw } from 'draft-js'
import htmlToDraft from 'html-to-draftjs'
import draftToHtml from 'draftjs-to-html'
import Cards from './Cards'
import { cancelButtonName } from '../../Common/Utilities/Constants'
import { ToastError, ToastSuccess } from '../../Common/CommonComponents/ToastCustomized'
import { supportTicketSuccess } from '../../Common/CommonComponents/CustomizedSuccessToastMessages'
import { supportTicketError } from '../../Common/CommonComponents/CustomizedErrorToastMessages'
import DetailLoader from '../../Common/CommonComponents/Loaders/DetailLoader'
import { handleKeyPress } from '../../Common/CommonComponents/FormControlValidation'

const MyFeedBack = () => {
    // Redux & React Router hooks
    const userDetails = useSelector((state) => state.user.userDetails)
    const navigate = useNavigate()
    const location = useLocation()
    // State variables
    const [mode, setMode] = useState('') // Mode: create or edit
    const [formData, setFormData] = useState('') // Form input values
    const [data, setData] = useState(null) // Fetched feedback data
    const [files, setFiles] = useState([]) // Existing files from server
    const [htmlObj, setHTMLObj] = useState(null) // HTML content for editor
    const [selectFiles, setSelectFiles] = useState([]) // Files selected for upload
    const [isLoading, setIsLoading] = useState(false) // Loader toggle

    // On mount, determine mode and fetch data if editing
    useEffect(() => {
        if (location.state && location.state.id == null) {
            setMode('create')
        } else {
            setMode('edit')
            getFeedbackDetailsById()
        }
    }, [])

    // Modal: File preview
    const handleInitialFileShow = (element) => {
        setFileOpen(true)
        setGetFile(element)
    }

    const handleInitialFileCloseHandler = () => {
        setFileOpen(false)
    }

    const [fileDeleteShow, setFileDeleteShow] = useState(false)
    const [index, setIndex] = useState()
    const handleDleteShowHandler = (ind) => {
        setFileDeleteShow(true)
        setIndex(ind)
    }
    const handleDleteCloseHandler = () => {
        setFileDeleteShow(false)
    }

    // Delete a file from selected files
    const handleSelectFilesDelete = () => {
        const updateSelectFiles = [...selectFiles]
        updateSelectFiles.splice(index, 1)
        setSelectFiles(updateSelectFiles)
        handleDleteCloseHandler()
    }

    // Handle file selection with validation
    const handleFileSelect = (event) => {
        const selectedFiles = event.target.files
        const newFilesArray = Array.from(selectedFiles)

        const validFileTypes = ['image/jpeg', 'image/png', 'image/gif']

        const filteredNewFiles = newFilesArray.filter((file) => validFileTypes.includes(file.type))
        const maxFiles = 5
        const maxTotalSize = 10 * 1024 * 1024

        const invalidFiles = newFilesArray.filter((file) => !validFileTypes.includes(file.type))
        if (invalidFiles.length > 0) {
            const invalidFileNames = invalidFiles.map((file) => file.name).join(', ')
            console.log(`${maxTotalSize / (1024 * 1024)}`, 'file size')
            toast.error(`The following files have unsupported formats and will not be added: ${invalidFileNames}.
        The allowed file types are JPEG, PNG and JPG .File size is ${maxTotalSize / (1024 * 1024)}MB.`)
        }
        const existingFilesSet = new Set(
            (Array.isArray(selectFiles) ? selectFiles : []).map(
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
        setSelectFiles((prevFiles) => {
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

    const [fileOpen, setFileOpen] = useState(false) // View file modal
    const [getFile, setGetFile] = useState(null) // File to preview

    const [body, setBody] = useState('') // Editor state

    const [CommentAdd, setCommentAdd] = useState([]) // Feedback comment history

    // Fetch feedback details by ID
    const getFeedbackDetailsById = () => {
        setIsLoading(true)
        getById({
            entity: 'feedbacks',
            organizationId: userDetails.organizationId,
            id: location.state && location.state.id
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setData(res.data)
                    setCommentAdd(res.data && res.data.feedbackDetailDTOs)
                    const htmlString = res.data.body
                    const contentBlock = htmlToDraft(htmlString)
                    const contentState = ContentState.createFromBlockArray(
                        contentBlock.contentBlocks
                    )
                    const editorState = EditorState.createWithContent(contentState)
                    setBody(editorState)
                    setHTMLObj(res.data.body)
                    setFiles(res.data.attachments)
                }
                setIsLoading(false)
            })
            .catch(() => {
                setIsLoading(false)
            })
    }

    const MAX_CHAR_LIMIT = 700 // Maximum allowed characters
    const [remainingChars, setRemainingChars] = useState(MAX_CHAR_LIMIT) // Remaining character count

    // Update editor state
    const onEditorStateChange = (editorState) => {
        const rawContent = convertToRaw(editorState.getCurrentContent())
        let htmlContent = draftToHtml(rawContent).trim()
        htmlContent = htmlContent.replace(/(<p>\s*<\/p>|<br>|&nbsp;|<[^>]*>)/gi, '').trim()
        if (htmlContent.length <= MAX_CHAR_LIMIT) {
            setBody(editorState)
            setHTMLObj(htmlContent)
            setFormErrors({ ...formErrors, comment: '' })
        }
        setRemainingChars(MAX_CHAR_LIMIT - htmlContent.length) // Update remaining character count
    }

    // Simulated image upload callback
    // const uploadImageCallBack = (file, callback) => {
    //     return new Promise((resolve, reject) => {
    //         const reader = new window.FileReader()
    //         reader.onloadend = async () => {
    //             const form_data = new FormData()
    //             form_data.append('file', file)
    //             resolve({ data: { link: reader.result } })
    //         }
    //         reader.readAsDataURL(file)
    //     })
    // }

    // Handle input field changes
    // const handleInputChange = (e) => {
    //     const { name, value } = e.target
    //     setFormData({ ...formData, [name]: value })
    // }

    const MAX_TOTAL_SIZE = 10 * 1024 * 1024 // 10 MB limit for file uploads
    const [formErrors, setFormErrors] = useState({}) // Store validation errors
    const [editShow, setEditShow] = useState(false) // Edit comment modal
    const [status, setStatus] = useState('') // Feedback status on update
    const handleEditShow = (e) => {
        setEditShow(true)
        setStatus(e)
        let editorState = EditorState.createEmpty()
        setBody(editorState)
        setHTMLObj(null)
    }

    const date = new Date()
    const todayDate = moment(date).format('YYYY-MM-DD')

    // Build feedback comment object
    const feedbackObj = [
        ...CommentAdd,
        {
            body: htmlObj,
            submittedBy: userDetails.employeeId,
            submittedDate: todayDate,
            attachmentDTOs: null,
            remarks: formData.remarks
        }
    ]

    // Form validation
    const validateForm = () => {
        let errors = {}

        if (!formData.subject) {
            errors.subject = 'Required'
        }
        const cleanedHtml = htmlObj ? htmlObj.replace(/(<p>\s*<\/p>|<br>|&nbsp;)/gi, '').trim() : ''
        if (!cleanedHtml) {
            errors.comment = 'Required'
        }

        if (formErrors && formErrors.files) {
            errors.files = `Total file size should not exceed ${MAX_TOTAL_SIZE / (1024 * 1024)}KB`
        }

        return errors
    }

    

    // Save new feedback
    const onSaveHandler = (e) => {
        e.preventDefault()
        const saveObj = {
            subject: formData.subject,
            organizationId: userDetails.organizationId,
            submittedBy: userDetails.employeeId,
            status: 'Open',
            feedbackDetailDTOs: feedbackObj
        }

        const errors = validateForm()
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors)
            return
        }
        setIsLoading(true)
        let fbObj = new FormData()
        for (let i = 0; i < selectFiles.length; i++) {
            fbObj.append('attachments', selectFiles[i])
        }
        fbObj.append('feedback', JSON.stringify(saveObj))
        SaveWithFile({
            entity: 'feedbacks',
            organizationId: userDetails.organizationId,
            body: fbObj,
            toastSuccessMessage: supportTicketSuccess,
            screenName: 'Support Ticket',
            toastErrorMessage: supportTicketError
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    ToastSuccess(res.message)
                    setHTMLObj(null)
                    setSelectFiles([])
                    setIsLoading(false)
                    navigate('/myFeedbackList')
                }
            })
            .catch((err) => {
                ToastError(err.message)
                setIsLoading(false)
            })
        // }
    }

    // Update feedback
    const onUpdateHandler = (e) => {
        e.preventDefault()
        const saveObj = {
            id: data.id,
            subject: data ? data.subject : formData.subject,
            organizationId: userDetails.organizationId,
            submittedBy: userDetails.employeeId,
            status: status,
            feedbackDetailDTOs: feedbackObj
        }

        const cleanedHtml = htmlObj ? htmlObj.replace(/(<p>\s*<\/p>|<br>|&nbsp;)/gi, '').trim() : ''
        if (!cleanedHtml) {
            return setFormErrors({ comment: 'Required' })
        }
        setIsLoading(true)
        let fbObj = new FormData()
        for (let i = 0; i < selectFiles.length; i++) {
            fbObj.append('attachments', selectFiles[i])
        }
        fbObj.append('feedback', JSON.stringify(saveObj))
        UpdateWithFile({
            entity: 'feedbacks',
            organizationId: userDetails.organizationId,
            id: data.id,
            body: fbObj,
            screenName: 'Support Ticket'
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setEditShow(false)
                    getFeedbackDetailsById()
                    setHTMLObj(null)
                    setSelectFiles([])
                    ToastSuccess(res.message)
                    setIsLoading(false)
                }
            })
            .catch((err) => {
                ToastError(err.message)
                setIsLoading(false)
            })
    }

    const [fileShow, setFileShow] = useState(false)

    const onCloseHandler = () => {
        setFileShow(false)
    }

    const handleClose = () => {
        setEditShow(false)
        setFormErrors({})
        setSelectFiles([])
    }

    return (
        <>
            {/* Section wrapper for the ticket form */}
            <section className="section">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="">
                                {/* Page title header */}
                                <PageHeader pageTitle={'My Ticket'} />
                                {/* Loader while data is loading */}
                                {isLoading ? <DetailLoader /> : ''}

                                {/* Ticket Form */}
                                <div
                                    className="center"
                                    style={{ paddingLeft: '10%', paddingRight: '10%' }}
                                >
                                    <form
                                        style={{ marginTop: '6%' }}
                                        className={mode == 'create' ? 'formBody' : ''}
                                    >
                                        {/* Subject Field */}
                                        <div className="col-">
                                            <Form.Group
                                                as={Row}
                                                className="mb-3"
                                                controlId="formGroupToDate"
                                            >
                                                <Form.Label column sm={2}>
                                                    Subject <span className="error">*</span>
                                                </Form.Label>
                                                {mode == 'edit' ? (
                                                    <Col
                                                        style={{
                                                            fontWeight: '800',
                                                            marginTop: '7px'
                                                        }}
                                                    >
                                                        {data && data.subject}
                                                    </Col>
                                                ) : (
                                                    <Col md={7}>
                                                        <Form.Control
                                                            onChange={(e) => {
                                                                const value = e.target.value
                                                                if (value.length <= 75) {
                                                                    setFormData({
                                                                        ...formData,
                                                                        subject: value
                                                                    })
                                                                    setFormErrors({
                                                                        ...formErrors,
                                                                        subject: ''
                                                                    })
                                                                } else {
                                                                    setFormErrors({
                                                                        ...formErrors,
                                                                        subject:
                                                                            'Subject cannot exceed 75 characters'
                                                                    })
                                                                }
                                                            }}
                                                            name="subject"
                                                            value={formData.subject || ''}
                                                            onKeyPress={(e) =>handleKeyPress(e,setFormErrors) }
                                                            onBlur={(e) => {
                                                                const value = e.target.value.trim()
                                                                if (!value) {
                                                                    setFormErrors({
                                                                        ...formErrors,
                                                                        subject: 'Required'
                                                                    })
                                                                } else if (value.length > 75) {
                                                                    setFormErrors({
                                                                        ...formErrors,
                                                                        subject:
                                                                            'Subject cannot exceed 75 characters'
                                                                    })
                                                                } else {
                                                                    setFormErrors({
                                                                        ...formErrors,
                                                                        subject: ''
                                                                    })
                                                                }
                                                            }}
                                                        />
                                                        <p
                                                            className="error"
                                                            style={{
                                                                textAlign: 'left',
                                                                color: 'red'
                                                            }}
                                                        >
                                                            {formErrors && formErrors.subject}
                                                        </p>
                                                    </Col>
                                                )}
                                            </Form.Group>
                                        </div>

                                        {/* Body Field */}
                                        <div className="col-">
                                            <Form.Group
                                                as={Row}
                                                className="mb-3"
                                                controlId="formGroupToDate"
                                            >
                                                {mode == 'edit' ? (
                                                    ''
                                                ) : (
                                                    <Form.Label column sm={2}>
                                                        Body <span className="error">*</span>
                                                    </Form.Label>
                                                )}
                                                <Col sm={7}>
                                                    {/* Body content/Editor can go here if needed */}
                                                </Col>
                                            </Form.Group>
                                        </div>
                                        {/* Edit mode display for ticket details and comments */}
                                        {mode == 'edit' ? (
                                            <>
                                                {/* Ticket number display */}
                                                <div className="col-">
                                                    <Form.Group
                                                        as={Row}
                                                        className="mb-3"
                                                        controlId="formGroupToDate"
                                                    >
                                                        <Col md={8}>
                                                            <Form.Label column></Form.Label>
                                                        </Col>

                                                        <Form.Label column>
                                                            Ticket Number
                                                        </Form.Label>
                                                        <Col
                                                            md={2}
                                                            className="textBold"
                                                            style={{
                                                                fontSize: '15px',
                                                                marginTop: '5px'
                                                            }}
                                                        >
                                                            {data ? data.id : ''}
                                                        </Col>
                                                    </Form.Group>
                                                </div>

                                                {/* Displaying comments */}
                                                <div className="col-">
                                                    {CommentAdd.map((item) => (
                                                        <>
                                                            {item.body == '' ? (
                                                                ''
                                                            ) : (
                                                                <Cards
                                                                    data={item}
                                                                    name={
                                                                        item.submittedBy ==
                                                                        userDetails.employeeId
                                                                            ? 'You'
                                                                            : item.name
                                                                    }
                                                                    align={
                                                                        item.submittedBy ==
                                                                        userDetails.employeeId
                                                                            ? 'right'
                                                                            : 'left'
                                                                    }
                                                                />
                                                            )}
                                                        </>
                                                    ))}
                                                </div>
                                            </>
                                        ) : (
                                            // Rich text editor for new ticket creation
                                            <div style={{ position: 'relative' }}>
                                                <Editor
                                                    wrapperClassName="wrapper-class"
                                                    editorClassName="editor-class"
                                                    toolbarClassName="toolbar-class"
                                                    editorState={body}
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
                                                    {remainingChars < 0 ? 0 : remainingChars}{' '}
                                                    characters remaining
                                                </div>
                                            </div>
                                        )}
                                        {/* File Attachment Field */}
                                        {mode == 'edit' ? (
                                            ''
                                        ) : (
                                            <div className="col-">
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-3"
                                                    controlId="formGroupToDate"
                                                >
                                                    <Form.Label column sm={2}>
                                                        Attachments
                                                    </Form.Label>
                                                    <Col md={7}>
                                                        <>
                                                            {selectFiles &&
                                                            selectFiles.length != 0 ? (
                                                                <>
                                                                    {/* List of selected files */}
                                                                    <div
                                                                        style={{
                                                                            display: 'flex',
                                                                            flexDirection: 'row',
                                                                            flexWrap: 'wrap'
                                                                        }}
                                                                    >
                                                                        {selectFiles &&
                                                                            selectFiles.map(
                                                                                (e, index) => (
                                                                                    <span
                                                                                        key={index}
                                                                                    >
                                                                                        {
                                                                                            <a
                                                                                                onClick={() =>
                                                                                                    handleInitialFileShow(
                                                                                                        e,
                                                                                                        'Get'
                                                                                                    )
                                                                                                }
                                                                                            >
                                                                                                <u>
                                                                                                    {
                                                                                                        e.name
                                                                                                    }
                                                                                                </u>
                                                                                            </a>
                                                                                        }
                                                                                        <a
                                                                                            style={{
                                                                                                color: 'red'
                                                                                            }}
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
                                                                                )
                                                                            )}
                                                                    </div>

                                                                    {/* Upload more files option */}
                                                                  {selectFiles.length < 5 &&  <span type="button">
                                                                        <label
                                                                            style={{
                                                                                fontWeight: '600',
                                                                                cursor: 'pointer'
                                                                            }}
                                                                            className=""
                                                                        >
                                                                            (<u>Upload More</u>)
                                                                            <input
                                                                                type="file"
                                                                                multiple
                                                                                style={{
                                                                                    display: 'none'
                                                                                }}
                                                                                onChange={(e) =>
                                                                                    handleFileSelect(
                                                                                        e
                                                                                    )
                                                                                }
                                                                            />
                                                                        </label>
                                                                    </span>}
                                                                </>
                                                            ) : (
                                                                <>
                                                                    {/* Initial file input */}
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
                                                                            style={{
                                                                                display: 'none'
                                                                            }}
                                                                            onChange={(e) =>
                                                                                handleFileSelect(e)
                                                                            }
                                                                        />
                                                                    </label>
                                                                </>
                                                            )}
                                                            &ensp;
                                                            <label>
                                                                Only JPEG, PNG and JPG accepted. Max
                                                                size is 10MB.
                                                            </label>
                                                        </>
                                                    </Col>
                                                </Form.Group>
                                            </div>
                                        )}
                                        {/* Button to add comment (edit mode only) */}
                                        {mode == 'edit' && (
                                            <div style={{ float: 'right' }}>
                                                <Button
                                                    variant=""
                                                    className="addMoreBtn"
                                                    disabled={data && data.status == 'Closed'}
                                                    onClick={() => handleEditShow('Open')}
                                                >
                                                    Add Comment
                                                </Button>
                                            </div>
                                        )}
                                        {/* Save, Close/Reopen, and Cancel buttons */}
                                        <div className="btnCenter mb-3" style={{ marginTop: '6%' }}>
                                            {mode == 'create' && (
                                                <Button
                                                    type="submit"
                                                    className="Button"
                                                    variant="addbtn"
                                                    onClick={onSaveHandler}
                                                    style={{
                                                        height: '33px',
                                                        marginTop: '2.4%',
                                                        width: '105px'
                                                    }}
                                                >
                                                    Save
                                                </Button>
                                            )}

                                            {mode == 'edit' && (
                                                <>
                                                    {data ? (
                                                        data.status == 'Open' ? (
                                                            <Button
                                                                className="Button"
                                                                variant="addbtn"
                                                                onClick={() =>
                                                                    handleEditShow('Closed')
                                                                }
                                                                style={{
                                                                    height: '33px',
                                                                    marginTop: '2.4%',
                                                                    whiteSpace: 'nowrap',
                                                                    width: '105px'
                                                                }}
                                                            >
                                                                Close Ticket
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                className="Button"
                                                                variant="addbtn"
                                                                onClick={() =>
                                                                    handleEditShow('Open')
                                                                }
                                                                style={{
                                                                    height: '33px',
                                                                    marginTop: '2.4%',
                                                                    width: '105px'
                                                                }}
                                                            >
                                                                Reopen
                                                            </Button>
                                                        )
                                                    ) : (
                                                        <></>
                                                    )}
                                                </>
                                            )}

                                            <Button
                                                className="Button"
                                                variant="secondary"
                                                type="button"
                                                onClick={() => navigate('/myFeedbackList')}
                                                style={{
                                                    height: '33px',
                                                    marginTop: '2.4%',
                                                    width: '105px'
                                                }}
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

            {/* Modal to preview attachments */}
            <Modal
                show={fileShow}
                size="lg"
                onHide={onCloseHandler}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton={onCloseHandler}>
                    <Modal.Title>Preview</Modal.Title>
                    {/* <Button variant="secondary" onClick={onCloseHandler}>
            X
          </Button> */}
                </Modal.Header>
                <Modal.Body className="modalBody">
                    <FileViewer documents={files ? files : []} />
                </Modal.Body>
            </Modal>

            {/* Modal to add/edit comments */}
            <Modal
                show={editShow}
                size="lg"
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton={handleClose}>
                    <Modal.Title></Modal.Title>
                    {/* <Button className="ml-auto" variant="secondary" onClick={handleClose}>
            X
          </Button> */}
                </Modal.Header>
                <Modal.Body className="">
                    {isLoading ? <DetailLoader /> : ''}
                    {/* Comment editor */}
                    <div className="col- mb-3">
                        <Form.Label column sm={2} style={{ marginLeft: '-15px' }}>
                            Comment: <span className="error">*</span>
                        </Form.Label>
                        {/* Rich text editor for comment input */}
                        <div style={{ position: 'relative' }}>
                            <Editor
                                wrapperClassName="wrapper-class"
                                editorClassName="editor-class"
                                toolbarClassName="toolbar-class"
                                editorState={body}
                                onEditorStateChange={onEditorStateChange}
                                toolbar={{
                                    inline: { inDropdown: true },
                                    list: { inDropdown: true },
                                    textAlign: { inDropdown: true },
                                    link: { inDropdown: true },
                                    history: { inDropdown: true }
                                }}
                            />

                            <div
                                style={{
                                    position: 'absolute',
                                    bottom: '-20px',
                                    right: '10px',
                                    fontSize: '12px',
                                    color: remainingChars < 0 ? 'red' : 'gray'
                                }}
                            >
                                {remainingChars < 0 ? 0 : remainingChars} characters remaining
                            </div>
                        </div>
                        <p className="error" style={{ textAlign: 'left' }}>
                            {formErrors && formErrors.comment}
                        </p>
                    </div>
                    {/* Attachment section in comment modal */}
                    <div className="col-">
                        <Form.Group as={Row} className="mb-3" controlId="formGroupToDate">
                            <Form.Label column sm={2}>
                                Attachments:
                            </Form.Label>
                            <Col md={7}>
                                <>
                                    {/* Attachments input inside modal */}
                                    {selectFiles && selectFiles.length != 0 ? (
                                        <>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    flexWrap: 'wrap'
                                                }}
                                            >
                                                {selectFiles &&
                                                    selectFiles.map((e, index) => (
                                                        <span key={index}>
                                                            {
                                                                <a
                                                                    onClick={() =>
                                                                        handleInitialFileShow(
                                                                            e,
                                                                            'Get'
                                                                        )
                                                                    }
                                                                >
                                                                    <u>{e.name}</u>
                                                                </a>
                                                            }
                                                            <a
                                                                className="error"
                                                                onClick={() =>
                                                                    handleDleteShowHandler(index)
                                                                }
                                                            >
                                                                {' '}
                                                                X &ensp;
                                                            </a>
                                                            <br />
                                                        </span>
                                                    ))}
                                            </div>
                                           {selectFiles.length < 5 &&   <span type="button">
                                                <label
                                                    style={{ fontWeight: '600', cursor: 'pointer' }}
                                                    className=""
                                                >
                                                    (<u>Upload More</u>)
                                                    <input
                                                        type="file"
                                                        multiple
                                                        style={{ display: 'none' }}
                                                        onChange={(e) => handleFileSelect(e)}
                                                    />
                                                </label>
                                            </span>}
                                        </>
                                    ) : (
                                        <>
                                            <label type="button" className="timeSheetImport">
                                                <CiImport className="themeColor" size={20} /> Attach
                                                Files
                                                <input
                                                    type="file"
                                                    multiple
                                                    style={{ display: 'none' }}
                                                    onChange={(e) => handleFileSelect(e)}
                                                />
                                            </label>
                                        </>
                                    )}
                                    &ensp;
                                    <label>
                                        Only JPEG, PNG and JPG accepted. Max size is 10MB.
                                    </label>
                                </>
                            </Col>
                        </Form.Group>
                    </div>

                    <div className="btnCenter mb-3" style={{ marginTop: '6%' }}>
                        <Button
                            type="submit"
                            className="Button"
                            variant="addbtn"
                            onClick={onUpdateHandler}
                        >
                            Submit
                        </Button>
                        <Button
                            className="Button"
                            variant="secondary"
                            type="button"
                            onClick={handleClose}
                        >
                            {cancelButtonName}
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
            {/* Delete modal*/}
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
export default MyFeedBack
