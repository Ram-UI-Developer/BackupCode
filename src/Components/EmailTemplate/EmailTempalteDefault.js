import { ContentState, EditorState, convertFromHTML, convertToRaw } from 'draft-js'
import draftToHtml from 'draftjs-to-html'
import { useEffect, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import { Editor } from 'react-draft-wysiwyg'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import Select from 'react-select'
import { toast } from 'react-toastify'
import { commonCrudSuccess } from '../../Common/CommonComponents/CustomizedSuccessToastMessages'
import {
    handleKeyPress,
    updateValidation
} from '../../Common/CommonComponents/FormControlValidation'
import DetailLoader from '../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../Common/CommonComponents/PageHeader'
import { ToastError } from '../../Common/CommonComponents/ToastCustomized'
import { getAll, getAllUnUsedEvents } from '../../Common/Services/CommonService'
import { emailTypeSaveWithFile, emailTypeUpdateWithFile } from '../../Common/Services/OtherServices'
import { cancelButtonName } from '../../Common/Utilities/Constants'

const EmailTempalteDefault = () => {
    const userDetails = useSelector((state) => state.user.userDetails)
    // Initial form values
    const initialValues = {
        id: '',
        name: '',
        eventId: '',
        subject: '',
        toAddress: '',
        cc: '',
        bcc: '',
        fromAddress: '',
        body: '',
        deleted: false,
        locationId: '',
        organizationId: ''
    }
    // State declarations
    const [formData, setFormData] = useState(initialValues)
    const [selectedFile, setSelectedFile] = useState(null)
    const navigate = useNavigate()
    const location = useLocation()
    const [mode, setMode] = useState('')
    const [eventSelect, setEventSelect] = useState(
        location.state && location.state.data && location.state.data.eventId
    )
    const [htmlObj, setHTMLObj] = useState('')
    const entity = 'emailtemplates'
    const [selectedId, setSelectedId] = useState('')
    const [formErrors, setFormErrors] = useState({})
    const [template, setTemplate] = useState()
    const [fileShow, setFileShow] = useState(false)
    const [loading, setLoading] = useState(false)
    const [emailTemplateData, setEmailTemplateData] = useState([])

    // Update body content when editor changes
    const onEditorStateChange = (editorState) => {
        setTemplate(editorState)
        const body = draftToHtml(convertToRaw(editorState.getCurrentContent()))
        setHTMLObj(body)
    }



    // Save email template handler
    const saveEvent = (e) => {
        e.preventDefault()
        const obj = {
            id: selectedId,
            name: formData.name,
            eventId: eventSelect,
            subject: formData.subject,
            toAddress: formData.toAddress,
            cc: formData.cc,
            bcc: formData.bcc,
            fromAddress: formData.fromAddress,
            body: htmlObj,
            deleted: false,
            locationId: 0,
            organizationId: 0
        }
        // Validate before submitting
        if (!obj.eventId) {
            setFormErrors(validateForm(formData))
        } else if (!obj.name) {
            setFormErrors(validateForm(formData))
        } else if (!obj.fromAddress) {
            setFormErrors(validateForm(formData))
        } else if (!obj.subject) {
            setFormErrors(validateForm(formData))
        } else if (!obj.body) {
            setFormErrors(validateForm(formData))
        } else {
            const actualObj = new FormData()
            const emailTemplate = {
                id: selectedId,
                name: formData.name,
                eventId: eventSelect,
                subject: formData.subject,
                toAddress: formData.toAddress,
                cc: formData.cc,
                bcc: formData.bcc,
                fromAddress: formData.fromAddress,
                body: htmlObj,
                deleted: false,
                locationId: 0,
                organizationId: 0,
                fileName: selectedFile ? selectedFile.newFile.name : null,
                fileType: selectedFile ? selectedFile.newFile.type : null
            }
            actualObj.append('emailTemplate', JSON.stringify(emailTemplate))
            if (selectedFile) {
                actualObj.append('files', selectedFile.newFile)
            }
            console.log(actualObj, 'obj before submitting')
            // Submit template with file
            emailTypeSaveWithFile({
                entity: entity,
                organizationId: 0,
                locationId: 0,
                body: actualObj,
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Email Template',
                    operationType: 'save'
                })
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        toast.success('Email Template saved sucessfully.')
                        navigate('/emailTemplateList')
                    }
                })

                .catch((err) => {
                    console.log(err)
                    ToastError(err.message)
                })
        }
    }

    // Modal close handler
    const onCloseHandler = () => {
        setFileShow(false)
    }
    // Update email template handler
    const UpdateEvent = (e) => {
        e.preventDefault()

        const obj = {
            id: selectedId,
            name: formData.name,
            eventId: eventSelect,
            subject: formData.subject,
            toAddress: formData.toAddress,
            cc: formData.cc,
            bcc: formData.bcc,
            fromAddress: formData.fromAddress,
            body: htmlObj,
            deleted: false,
            locationId: location.state.data.locationId,
            organizationId: location.state.data.organizationId
        }

        if (!obj.eventId) {
            setFormErrors(validateForm(formData))
        } else if (!obj.name) {
            setFormErrors(validateForm(formData))
        } else if (!obj.fromAddress) {
            setFormErrors(validateForm(formData))
        } else if (!obj.subject) {
            setFormErrors(validateForm(formData))
        } else if (obj.body == '<p></p>\n') {
            setFormErrors(validateForm(obj))
        } else if (
            updateValidation(emailTemplateData, formData) &&
            emailTemplateData.eventId == obj.eventId &&
            emailTemplateData.body == obj.body &&
            emailTemplateData.fileName == obj.fileName &&
            emailTemplateData.fileType == obj.fileType
        ) {
            toast.info('No changes made to update')
            setLoading(false)
        } else {
            const actualObj = new FormData()
            const emailTemplate = {
                id: selectedId,
                name: formData.name,
                eventId: eventSelect,
                subject: formData.subject,
                toAddress: formData.toAddress,
                cc: formData.cc,
                bcc: formData.bcc,
                fromAddress: formData.fromAddress,
                body: htmlObj,
                deleted: false,
                locationId: location.state.data.locationId,
                organizationId: location.state.data.organizationId,
                fileName: selectedFile ? selectedFile.newFile.name : null,
                fileType: selectedFile ? selectedFile.newFile.type : null
            }

            actualObj.append('emailTemplate', JSON.stringify(emailTemplate))
            if (selectedFile) {
                actualObj.append('files', selectedFile.newFile)
            }
            // Submit updated template with file
            emailTypeUpdateWithFile({
                entity: entity,
                organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
                locationId: userDetails.locationId == null ? 0 : userDetails.locationId,
                id: selectedId,
                body: actualObj,
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Email Template',
                    operationType: 'update'
                })
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        toast.success(' Email Template updated sucessfully.')
                        navigate('/emailTemplateList')
                    }
                })

                .catch((err) => {
                    console.log(err)
                    ToastError(err.message)
                })
        }
    }
    // Validate required fields
    const validateForm = (values) => {
        const errors = {}

        if (!values.eventId) {
            errors.eventId = 'Required'
        }
        if (!values.subject) {
            errors.subject = 'Required'
        }
        if (!values.name) {
            errors.name = 'Required'
        }
        if (!values.fromAddress) {
            errors.fromAddress = 'Required'
        }

        if (htmlObj == undefined || !htmlObj) {
            errors.body = 'Required'
        }

        return errors
    }
    // Load data when component mounts
    useEffect(() => {
        if (location.state && location.state.id == null) {
            // Create Mode
            setMode('create')

            let editorState = EditorState.createEmpty()
            setTemplate(editorState)
            setFormData({
                id: '',
                name: '',
                eventId: '',
                subject: '',
                toAddress: '',
                cc: '',
                bcc: '',
                fromAddress: '',
                body: '',
                deleted: false,
                locationId: '',
                organizationId: ''
            })
            getUnUsedEventList()
        } else {
            if (location.state) {
                // Edit Mode
                setHTMLObj(location.state.data.body)
                setMode('edit')
                setSelectedId(location.state.data.id)
                const htmlString = location.state.data.body
                let editorState = EditorState.createWithContent(
                    ContentState.createFromBlockArray(convertFromHTML(htmlString))
                )
                setTemplate(editorState)
                setFormData({
                    id: location.state.data.id,
                    name: location.state.data.name,
                    eventId: location.state.data.eventId,
                    subject: location.state.data.subject,
                    toAddress: location.state.data.toAddress,
                    cc: location.state.data.cc,
                    bcc: location.state.data.bcc,
                    fromAddress: location.state.data.fromAddress,
                    body: location.state.data.body,
                    deleted: false,
                    locationId: location.state.data.locationId,
                    organizationId: location.state.data.organizationId,
                    fileName: location.state.data.fileName ? location.state.data.fileName : 'Demo',
                    fileType: location.state.data.fileType ? location.state.data.fileType : null
                })
                setEmailTemplateData({
                    id: location.state.data.id,
                    name: location.state.data.name,
                    eventId: location.state.data.eventId,
                    subject: location.state.data.subject,
                    toAddress: location.state.data.toAddress,
                    cc: location.state.data.cc,
                    bcc: location.state.data.bcc,
                    fromAddress: location.state.data.fromAddress,
                    body: location.state.data.body,
                    deleted: false,
                    locationId: location.state.data.locationId,
                    organizationId: location.state.data.organizationId,
                    fileName: location.state.data.fileName ? location.state.data.fileName : 'Demo',
                    fileType: location.state.data.fileType ? location.state.data.fileType : null
                })
                // If file is present, convert base64 to File object
                if (location.state.data.file) {
                    handleFileFromServer(
                        location.state.data.file,
                        location.state.data.fileName,
                        location.state.data.fileType
                    )
                        .then((newFile) => {
                            setSelectedFile(newFile)
                        })
                        .catch((error) => {
                            console.error(error) // Handle errors
                        })
                } else {
                    setSelectedFile(null)
                }
            }
            getEventList()
        }
    }, [])

    // Convert base64 string to File object
    const handleFileFromServer = (base64String, fileName, fileType) => {
        // Assuming the input is a base64 string like the one provided
        // Remove the base64 prefix if it's present
        return new Promise((resolve, reject) => {
            try {
                const base64Prefix = 'data:image/png;base64,' // Change to the correct prefix if needed
                const base64Data = base64String.startsWith(base64Prefix)
                    ? base64String.replace(base64Prefix, '')
                    : base64String
                console.log(base64Data, 'base64Data')
                // Decode the base64 string
                const binaryString = atob(base64Data)
                const len = binaryString.length
                const bytes = new Uint8Array(len)

                // Create an array of bytes
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i)
                }

                const newFile = new Blob([bytes], { type: fileType }) // Change the type based on your file type

                // Create a URL for the Blob
                const previewURL = URL.createObjectURL(newFile)

                resolve({ newFile, previewURL })
            } catch (error) {
                // Reject the Promise if there's an error
                reject('Failed to convert base64 to file: ' + error)
            }
        })
    }

    const onFileHandler = () => {
        setFileShow(true)
    }

    //get all the unused email events
    const getUnUsedEventList = () => {
        getAllUnUsedEvents({ entity: 'emailtemplates', organizationId: 0, locationId: 0 })
            .then(
                (res) => {
                    emailEventsHandler(res.data)
                },
                (error) => {
                    console.log(error)
                }
            )
            .catch((err) => {
                console.log(err)
            })
    }

    //get all the email events
    const getEventList = () => {
        setLoading(true)
        getAll({
            entity: 'emailevents',
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId
        })
            .then(
                (res) => {
                    emailEventsHandler(res.data)
                    setLoading(false)
                },
                (error) => {
                    console.log(error)
                }
            )
            .catch((err) => {
                console.log(err)
            })
    }

    const uploadImageCallBack = (file) => {
        return new Promise((resolve) => {
            const reader = new window.FileReader()

            reader.onloadend = async () => {
                const form_data = new FormData()
                form_data.append('file', file)

                resolve({ data: { link: reader.result } })
            }
            reader.readAsDataURL(file)
        })
    }

    const [options, setOptions] = useState([])

    const emailEventsHandler = (data) => {
        let optionsMapped = data.map((option) => ({
            value: option.id,
            label: option.name
        }))
        setOptions(optionsMapped)
    }

    const onInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value.trimStart().replace(/\s+/g, ' ')
        })
    }

    const handleEventSelection = (selection) => {
        setEventSelect(selection.value)
        setFormData({ ...formData, eventId: selection.value })
    }

    //change handler for files
    const changeHandler = (event) => {
        if (event.target.files[0]) {
            const file = event.target.files[0]
            //calling prview function to store the file for preview
            filePreview(file)
                .then((newFile) => {
                    setSelectedFile(newFile)
                })
                .catch((error) => {
                    console.error(error) // Handle errors
                })
        }
    }

    //this returns the files converted for preview
    const filePreview = (input) => {
        return new Promise((resolve, reject) => {
            let file = input
            let reader = new FileReader()

            // Read the file as a binary string (you can also use other read methods like readAsDataURL)
            reader.readAsBinaryString(file)
            const previewURL = URL.createObjectURL(input)

            reader.onload = () => {
                // Create a new File object and resolve the Promise with it
                const newFile = new File([file], file.name, { type: file.type })
                resolve({ newFile, previewURL })
            }

            reader.onerror = (error) => {
                // Reject the Promise if there's an error
                reject('Error reading file: ' + error)
            }
        })
    }



    return (
        <>
            {/* Show loading spinner if loading is true */}
            {loading ? <DetailLoader /> : ''}
            <div>
                <section className="section detailBackground">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="">
                                    {/* Page header with dynamic title based on mode */}
                                    <PageHeader
                                        pageTitle={
                                            mode == 'create'
                                                ? 'Add Email Template'
                                                : 'Update Email Template'
                                        }
                                    />
                                    <div
                                        className="center"
                                        style={{ paddingLeft: '10%', paddingRight: '10%' }}
                                    >
                                        <form onSubmit={saveEvent} className="card-body">
                                            <div className="row">
                                                <div class="col-6">
                                                    <Form.Group as={Row} className="mb-3">
                                                        <Form.Label column md={2}>
                                                            Name <span className="error">*</span>
                                                        </Form.Label>
                                                        <Col md={9}>
                                                            <Form.Control
                                                                type="text"
                                                                name="name"
                                                                defaultValue={formData.name}
                                                                onChange={onInputChange}
                                                                value={formData.name}
                                                                onBlur={(e) =>
                                                                    !e.target.value
                                                                        ? setFormErrors({
                                                                            ...formErrors,
                                                                            name: 'Required'
                                                                        })
                                                                        : setFormErrors({
                                                                            ...formErrors,
                                                                            name: ''
                                                                        })
                                                                }
                                                                maxLength={50}
                                                                onKeyPress={(e) =>
                                                                    handleKeyPress(e, setFormErrors)
                                                                }
                                                                onPaste={(e) =>
                                                                    handleKeyPress(e, setFormErrors)
                                                                }
                                                                onInput={(e) =>
                                                                    handleKeyPress(e, setFormErrors)
                                                                }
                                                            />
                                                            {formErrors.name && (
                                                                <p className="error">
                                                                    {formErrors.name}
                                                                </p>
                                                            )}
                                                        </Col>
                                                    </Form.Group>
                                                </div>

                                                <div class="col-6">
                                                    <Form.Group as={Row} className="mb-3">
                                                        <Form.Label column md={3}>
                                                            Event <span className="error">*</span>
                                                        </Form.Label>
                                                        <Col md={9}>
                                                            <Select
                                                                isDisabled={location.state.id}
                                                                options={options}
                                                                onBlur={() =>
                                                                    eventSelect == undefined
                                                                        ? setFormErrors({
                                                                            ...formErrors,
                                                                            eventId: 'Required'
                                                                        })
                                                                        : setFormErrors({
                                                                            ...formErrors,
                                                                            eventId: ''
                                                                        })
                                                                }
                                                                value={options.filter(
                                                                    (option) =>
                                                                        option.value == eventSelect
                                                                )}
                                                                onChange={handleEventSelection}
                                                            />
                                                            {formErrors && formErrors.eventId ? (
                                                                <p className="error">
                                                                    {formErrors.eventId}
                                                                </p>
                                                            ) : (
                                                                <></>
                                                            )}
                                                        </Col>
                                                    </Form.Group>
                                                </div>
                                            </div>

                                            <div className="row">
                                                <div class="col-6">
                                                    <Form.Group as={Row} className="mb-3">
                                                        <Form.Label column md={2}>
                                                            To
                                                        </Form.Label>
                                                        <Col md={9}>
                                                            <Form.Control
                                                                required
                                                                type="text"
                                                                name="toAddress"
                                                                maxLength={50}
                                                                onChange={onInputChange}
                                                                value={formData.toAddress}
                                                                onBlur={(e) =>
                                                                    !e.target.value
                                                                        ? setFormErrors({
                                                                            ...formErrors
                                                                        })
                                                                        : setFormErrors({
                                                                            ...formErrors,
                                                                            toAddress: ''
                                                                        })
                                                                }
                                                            />
                                                            {formErrors && formErrors.toAddress ? (
                                                                <p className="error">
                                                                    {formErrors.toAddress}
                                                                </p>
                                                            ) : (
                                                                <></>
                                                            )}
                                                        </Col>
                                                    </Form.Group>
                                                </div>

                                                <div class="col-6">
                                                    <Form.Group as={Row} className="mb-3">
                                                        <Form.Label column md={3}>
                                                            Cc
                                                        </Form.Label>
                                                        <Col md={9}>
                                                            <Form.Control
                                                                required
                                                                onBlur={(e) =>
                                                                    !e.target.value
                                                                        ? setFormErrors({
                                                                            ...formErrors
                                                                        })
                                                                        : setFormErrors({
                                                                            ...formErrors,
                                                                            cc: ''
                                                                        })
                                                                }
                                                                type="text"
                                                                name="cc"
                                                                maxLength={50}
                                                                onChange={onInputChange}
                                                                value={formData.cc}
                                                            />
                                                            {formErrors && formErrors.cc ? (
                                                                <p className="error">
                                                                    {formErrors.cc}
                                                                </p>
                                                            ) : (
                                                                <></>
                                                            )}
                                                        </Col>
                                                    </Form.Group>
                                                </div>
                                            </div>

                                            <div className="row">
                                                <div class="col-6">
                                                    <Form.Group as={Row} className="mb-3">
                                                        <Form.Label column md={2}>
                                                            Bcc
                                                        </Form.Label>
                                                        <Col md={9}>
                                                            <Form.Control
                                                                required
                                                                type="text"
                                                                name="bcc"
                                                                maxLength={50}
                                                                onChange={onInputChange}
                                                                value={formData.bcc}
                                                                onBlur={(e) =>
                                                                    !e.target.value
                                                                        ? setFormErrors({
                                                                            ...formErrors
                                                                        })
                                                                        : setFormErrors({
                                                                            ...formErrors,
                                                                            bcc: ''
                                                                        })
                                                                }
                                                            />
                                                            {formErrors && formErrors.bcc ? (
                                                                <p className="error">
                                                                    {formErrors.bcc}
                                                                </p>
                                                            ) : (
                                                                <></>
                                                            )}
                                                        </Col>
                                                    </Form.Group>
                                                </div>

                                                <div class="col-6">
                                                    <Form.Group as={Row} className="mb-3">
                                                        <Form.Label column md={3}>
                                                            From{' '}
                                                            <span className="error">*</span>
                                                        </Form.Label>
                                                        <Col md={9}>
                                                            <Form.Control
                                                                required
                                                                type="text"
                                                                name="fromAddress"
                                                                maxLength={50}
                                                                value={formData.fromAddress}
                                                                onChange={(e) => {
                                                                    const { value } = e.target
                                                                    setFormData({
                                                                        ...formData,
                                                                        fromAddress: value
                                                                    })
                                                                    // Removed email format validation
                                                                    setFormErrors({
                                                                        ...formErrors,
                                                                        fromAddress: ''
                                                                    })
                                                                }}
                                                                onBlur={(e) => {
                                                                    const { value } = e.target
                                                                    if (!value) {
                                                                        setFormErrors({
                                                                            ...formErrors,
                                                                            fromAddress: 'Required'
                                                                        })
                                                                    }
                                                                }}
                                                                // disabled={mode === 'edit'}
                                                            />
                                                            {formErrors && formErrors.fromAddress ? (
                                                                <p className="error">
                                                                    {formErrors.fromAddress}
                                                                </p>
                                                            ) : (
                                                                <></>
                                                            )}
                                                        </Col>
                                                    </Form.Group>
                                                </div>
                                            </div>

                                            <div className="row mb-4">
                                                <div class="col-12">
                                                    <Form.Group as={Row}>
                                                        <Form.Label className="emailLable">
                                                            Subject{' '}
                                                            <span className="error">*</span>
                                                        </Form.Label>
                                                        <Col>
                                                            <Form.Control
                                                                className="subjectBox"
                                                                required
                                                                type="text"
                                                                name="subject"
                                                                maxLength={150}
                                                                onBlur={(e) =>
                                                                    !e.target.value
                                                                        ? setFormErrors({
                                                                            ...formErrors,
                                                                            subject: 'Required'
                                                                        })
                                                                        : setFormErrors({
                                                                            ...formErrors,
                                                                            subject: ''
                                                                        })
                                                                }
                                                                onChange={onInputChange}
                                                                value={formData.subject}
                                                            />
                                                            {formErrors.subject && (
                                                                <p className="error">
                                                                    {formErrors.subject}
                                                                </p>
                                                            )}
                                                        </Col>
                                                    </Form.Group>
                                                </div>
                                            </div>
                                            {/* Email Body with Rich Text Editor */}
                                            <div className="row">
                                                <div class="col-12">
                                                    <Form.Group className="mb-3" as={Row}>
                                                        <Form.Label>
                                                            Body{' '}
                                                            <span className="error">*</span>
                                                        </Form.Label>
                                                    </Form.Group>
                                                </div>
                                                <div className="col-12 mb-3">
                                                    <Editor
                                                        wrapperClassName="wrapper-class"
                                                        editorClassName="editor-class"
                                                        toolbarClassName="toolbar-class"
                                                        editorState={template}
                                                        onEditorStateChange={onEditorStateChange}
                                                        onBlur={() =>
                                                            htmlObj == '<p></p>\n'
                                                                ? setFormErrors({
                                                                    ...formErrors,
                                                                    body: 'Required'
                                                                })
                                                                : setFormErrors({
                                                                    ...formErrors,
                                                                    body: ''
                                                                })
                                                        }
                                                        toolbar={{
                                                            inline: { inDropdown: true },
                                                            list: { inDropdown: true },
                                                            textAlign: { inDropdown: true },
                                                            link: { inDropdown: true },
                                                            history: { inDropdown: true },
                                                            image: {
                                                                uploadCallback: uploadImageCallBack,
                                                                alt: {
                                                                    present: true,
                                                                    mandatory: false
                                                                },
                                                                previewImage: true
                                                            }
                                                        }}
                                                    />
                                                    {formErrors && formErrors.body ? (
                                                        <p className="error">
                                                            {formErrors.body}
                                                        </p>
                                                    ) : (
                                                        <></>
                                                    )}
                                                </div>
                                            </div>

                                            {/* File Upload for Watermark */}
                                            <div className="row mb-4">
                                                <div class="col-12">
                                                    <Form.Group as={Row}>
                                                        <Form.Label className="" column md={2}>
                                                            Water Mark
                                                        </Form.Label>
                                                        <Col md={10}>
                                                            <Form.Control
                                                                onChange={changeHandler}
                                                                type="file"
                                                                placeholder="Attach File"
                                                                accept="image/*,.docx,.pdf,.doc"
                                                            />
                                                            {/* Preview uploaded file */}
                                                            {selectedFile ? (
                                                                <div
                                                                    style={{ color: '#57BEE6' }}
                                                                    type="button"
                                                                    onClick={() =>
                                                                        onFileHandler(selectedFile)
                                                                    }
                                                                >
                                                                    Preview File
                                                                </div>
                                                            ) : (
                                                                <div></div>
                                                            )}
                                                        </Col>
                                                    </Form.Group>
                                                </div>
                                            </div>

                                            <div className="btnCenter mb-3">
                                                {mode == 'create' && (
                                                    <Button
                                                        style={{ marginRight: '2%' }}
                                                        type="submit"
                                                        className="Button"
                                                        variant="addbtn"
                                                        onClick={saveEvent}
                                                    >
                                                        Save
                                                    </Button>
                                                )}
                                                {mode == 'edit' && (
                                                    <Button
                                                        style={{ marginRight: '2%' }}
                                                        type="submit"
                                                        className="Button"
                                                        variant="addbtn"
                                                        onClick={UpdateEvent}
                                                    >
                                                        Update
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="secondary"
                                                    className="Button"
                                                    type="button"
                                                    onClick={() => navigate('/emailTemplateList')}
                                                    style={{ marginRight: '2%' }}
                                                >
                                                    {cancelButtonName}
                                                </Button>
                                            </div>
                                        </form>
                                        <div></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            {/* Modal for Previewing Uploaded File */}
            <Modal
                show={fileShow}
                size="xl"
                onHide={onCloseHandler}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton={onCloseHandler}>
                    <Modal.Title>Preview</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    <img
                        width={'100%'}
                        src={selectedFile && selectedFile.previewURL}
                        alt="Server file"
                    />
                </Modal.Body>
            </Modal>
        </>
    )
}

export default EmailTempalteDefault
