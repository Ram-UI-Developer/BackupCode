import { DatePicker } from 'antd'
import { convertToRaw } from 'draft-js'
import draftToHtml from 'draftjs-to-html'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import { Editor } from 'react-draft-wysiwyg'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import {
    authorizeSuccess,
    commonCrudSuccess
} from '../../Common/CommonComponents/CustomizedSuccessToastMessages'
import DetailLoader from '../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../Common/CommonComponents/PageHeader'
import { ToastError, ToastSuccess } from '../../Common/CommonComponents/ToastCustomized'
import { getById, save, update } from '../../Common/Services/CommonService'
import { cancelButtonName } from '../../Common/Utilities/Constants'
import Cards from '../FeedBack/Cards'
import { handleKeyPress } from '../../Common/CommonComponents/FormControlValidation'

const Resignation = () => {
    // Redux hook to get user details from global state
    const userDetails = useSelector((state) => state.user.userDetails)
    // React Router hooks for navigation and accessing location state
    const navigate = useNavigate()
    const location = useLocation()
    // Local state hooks
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({})
    const [formErrors, setFormErrors] = useState({})
    const [template, setTemplate] = useState() // for rich text editor template
    const [mode, setMode] = useState(null) // mode can be 'create' or 'edit'
    const [htmlObj, setHTMLObj] = useState(null) // holds HTML content from editor
    const [commentPop, setCommentPop] = useState(false) // show/hide comment modal
    const [data, setData] = useState([]) // stores fetched resignation data
    const [canApprove, setCanApprove] = useState(false) // flag to show approve button
    const [withdraw, setWithdraw] = useState(false) // flag for withdrawal option
    const [approvePop, setApprovePop] = useState(false) // show/hide approval modal
    const [approveStatus, setApproveStatus] = useState(false) // holds approval status
    const MAX_CHAR_LIMIT = 700 // Maximum allowed characters
    const [remainingChars, setRemainingChars] = useState(MAX_CHAR_LIMIT) // Remaining character count

    // On component mount, determine mode and permissions
    useEffect(() => {
        if (location.state && location.state.canApprove) {
            setCanApprove(true)
        }

        if (location.state && location.state.withdraw) {
            setWithdraw(true)
        }

        if (location.state && location.state.id == null) {
            setMode('create')
        } else {
            setMode('edit')
            getResignationById()
        }
    }, [])

    // API call to fetch resignation by ID
    const getResignationById = () => {
        setLoading(true)
        getById({
            entity: 'resignation',
            organizationId: userDetails.organizationId,
            id: location.state && location.state.id
        })
            .then((res) => {
                setData(res.data)
                setLoading(false)
            })
            .catch((err) => {
                setData([])
                setLoading(false)
                ToastError(err.message)
            })
    }

    // Handles update of resignation details (comment add)
    const onUpdateHandler = () => {
        const cleanedHtml = htmlObj ? htmlObj.replace(/(<p>\s*<\/p>|<br>|&nbsp;)/gi, '').trim() : ''
        if (!cleanedHtml) {
            setFormErrors({ comment: 'Required' })
        } else {
            setLoading(true)
            const { resignationDetailDTOs, ...rest } = data
            resignationDetailDTOs.push({ body: htmlObj, submittedBy: userDetails.employeeId })
            const obj = {
                ...rest,
                resignationDetailDTOs: resignationDetailDTOs
            }
            update({
                entity: 'resignation',
                organizationId: userDetails.organizationId,
                id: data.id,
                body: obj
            })
                .then(() => {
                    setHTMLObj(null)
                    setCommentPop(false)
                    setTemplate(null)
                    getResignationById()
                })
                .catch((err) => {
                    setData([])
                    setCommentPop(false)
                    setTemplate(null)
                    ToastError(err.message)
                    setLoading(false)
                })
        }
    }

    // Handles change in rich text editor

    const onEditorStateChange = (editorState) => {
        const rawContent = convertToRaw(editorState.getCurrentContent())
        let htmlContent = draftToHtml(rawContent).trim()
        htmlContent = htmlContent.replace(/(<p>\s*<\/p>|<br>|&nbsp;|<[^>]*>)/gi, '').trim()
        if (htmlContent.length <= MAX_CHAR_LIMIT) {
            setTemplate(editorState)
            setHTMLObj(htmlContent)
            setFormErrors({ ...formErrors, comment: '' })
        }
        setRemainingChars(MAX_CHAR_LIMIT - htmlContent.length) // Update remaining character count
    }

    // Handles input field changes
    const onInputChange = (e) => {
        const { name } = e.target
        setFormData({
            ...formData,
            [e.target.name]: e.target.value.trimStart().replace(/\s+/g, ' ')
        })
        !e.target.value
            ? setFormErrors({ ...formErrors, [name]: 'Required' })
            : setFormErrors({ ...formErrors, [name]: '' })
    }

    // Handles date picker change for requested relieving date
    const requestedRelievingDateHandler = (date) => {
        if (date != null) {
            let selectedDate = moment(date).format('YYYY-MM-DD')
            setFormData({ ...formData, requestedRelievingDate: selectedDate })
        } else {
            setFormData({ ...formData, requestedRelievingDate: null })
        }
    }

    const onDateChangeHandler = (date, name) => {

        if (date != null) {
            let selectedDate = moment(date).format('YYYY-MM-DD')
            setFormData({ ...formData, [name]: selectedDate })
            setFormErrors({ ...formErrors, [name]: '' })
        } else {
            setFormData({ ...formData, name: null })

        }
    }

    // Opens comment modal
    const commentHandler = () => {
        setCommentPop(true)
    }

    // Closes comment modal
    const handleClose = () => {
        setCommentPop(false)
        setFormErrors({})
    }

    // Closes approval modal and resets form state
    const handleApproveClose = () => {
        setFormErrors({})
        setHTMLObj(null)
        setApprovePop(false)
    }

    // Handles withdrawal of resignation
    const resignationWithdrawHandler = () => {
        setLoading(true)
        const { status, ...rest } = data
        status.value = 4
        status.label = 'Withdraw'
        const obj = {
            ...rest,
            status: status
        }
        update({
            entity: 'resignation',
            organizationId: userDetails.organizationId,
            id: data.id,
            body: obj,
            toastSuccessMessage: 'Withdrawn your resignation.'
        })
            .then((res) => {
                setCommentPop(false)
                setTemplate(null)
                ToastSuccess(res.message)
                setLoading(false)
                getResignationById()
            })
            .catch((err) => {
                setData([])
                setCommentPop(false)
                setTemplate(null)
                setLoading(false)
                ToastError(err.message)
            })
    }

    // Handles initial resignation submission
    const resignationSubmissionHandler = () => {
        const obj = {
            employeeId: userDetails.employeeId,
            subject: formData.subject,
            status: {
                value: 1,
                label: 'Submitted'
            },
            requestedlastDate: formData.requestedRelievingDate,
            resignationDetailDTOs: [{ body: htmlObj, submittedBy: userDetails.employeeId }]
        }

        if (!obj.subject) {
            setFormErrors(validateForm(formData))
        } else if (!htmlObj || htmlObj.trim() === '') {
            setFormErrors(validateForm(formData))
        } else {
            setLoading(true)
            save({
                entity: 'resignation',
                organizationId: userDetails.organizationId,
                body: obj,
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Resignation',
                    operationType: 'submitte'
                })
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        ToastSuccess(res.message)
                        setData(res.data)
                        setLoading(false)
                        navigate('/resignationList')
                    }
                })
                .catch((err) => {
                    setData([])
                    ToastError(err.message)
                    setLoading(false)
                })
        }
    }

    // Opens approval popup and sets current status (Approve/Reject)
    const resignationApprovePopHandler = (presentStatus) => {
        setFormErrors({})
        setApproveStatus(presentStatus)
        setApprovePop(true)
    }

    // Handles approval or rejection of resignation
    const resignationApproveHandler = () => {
        let { status, lastworkingDate, ...rest } = data

        if (!formData.remarks && approveStatus != 'Approve') {
            setFormErrors({ remarks: 'Required' })
            return
        }
        else if (approveStatus == 'Approve' && formData.lastworkingDate == undefined) {
            setFormErrors({ lastworkingDate: 'Required' })
            setLoading(false)
            return
        }
        else {

            if (approveStatus == 'Approve') {
                status.value = 2
                status.label = 'HR Approved'
            } else {
                status.value = 3
                status.label = 'HR Rejected'
            }
            lastworkingDate = formData.lastworkingDate
            const obj = {
                lastworkingDate: lastworkingDate,
                ...rest,
                status: status,
                hrRemarks: formData.remarks
            }
            setLoading(true)
            update({
                entity: 'resignation',
                organizationId: userDetails.organizationId,
                id: data.id,
                body: obj,
                toastSuccessMessage: authorizeSuccess({
                    screen: 'resignation',
                    operationType: approveStatus == 'Approve' ? 'Approved' : 'Rejected',
                    employeeName: obj.employeeName
                })
            })
                .then((res) => {
                    ToastSuccess(res.message)
                    setCommentPop(false)
                    setTemplate(null)
                    setApprovePop(false)
                    setFormData({})
                    setApproveStatus(null)
                    getResignationById()
                })
                .catch((err) => {
                    setData([])
                    setCommentPop(false)
                    setTemplate(null)
                    ToastError(err.message)
                    setLoading(false)
                })
        }
    }

    // Validates form fields before submit/approve
    const validateForm = (values) => {
        const errors = {}
        if (!values.subject) {
            errors.subject = 'Required'
        }

        const cleanedHtml = htmlObj ? htmlObj.replace(/(<p>\s*<\/p>|<br>|&nbsp;)/gi, '').trim() : ''
        if (!cleanedHtml) {
            errors.comment = 'Required'
        }
        return errors
    }

    return (
        <>
            {/* Resignation Page Section */}
            <section className="section">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div>
                                {/* Page Header */}
                                <PageHeader pageTitle="Resignation" />
                                {/* Loader while data is being fetched */}
                                {loading ? <DetailLoader /> : ''}

                                {/* Main Form Section */}
                                <div
                                    className="center"
                                    style={{ paddingLeft: '10%', paddingRight: '10%' }}
                                >
                                    <form
                                        style={{ marginTop: '6%' }}
                                        className={mode == 'create' ? 'formBody' : ''}
                                    >
                                        {/* Subject Input or Display */}
                                        <div className="row">
                                            <div class="col-12">
                                                <Form.Group className="mb-3" as={Row}>
                                                    <Form.Label column sm={2}>
                                                        Subject{' '}
                                                        <span className='error'>*</span>
                                                    </Form.Label>
                                                    {mode == 'create' ? (
                                                        <Col>
                                                            <Form.Control
                                                                md={7}
                                                                required
                                                                type="text"
                                                                name="subject"
                                                                onBlur={(e) => {
                                                                    const value =
                                                                        e.target.value.trim()
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
                                                                value={formData.subject || ''}
                                                                onKeyPress={(e) => handleKeyPress(e, setFormErrors)}
                                                                onChange={(e) => {
                                                                    const value =
                                                                        e.target.value
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
                                                    ) : (
                                                        <Col
                                                            style={{
                                                                fontWeight: '800',
                                                                marginTop: '7px'
                                                            }}
                                                        >
                                                            {data && data.subject}
                                                        </Col>
                                                    )}
                                                    {/* Validation Error */}
                                                    {/* {formErrors && formErrors.subject ? <p style={{ color: "red" }}>{formErrors.subject}</p> : <></>} */}
                                                </Form.Group>
                                            </div>
                                        </div>
                                        {/* Body Textarea / Comments Section */}
                                        <div className="row">
                                            {mode == 'create' ? (
                                                <div class="col-12">
                                                    <Form.Group as={Row}>
                                                        <Form.Label column>
                                                            Body{' '}
                                                            <span className="error">*</span>
                                                        </Form.Label>
                                                    </Form.Group>
                                                </div>
                                            ) : (
                                                <></>
                                            )}
                                            {mode == 'create' ? (
                                                <div style={{ position: 'relative' }}>
                                                    <Editor
                                                        wrapperClassName="wrapper-class"
                                                        editorClassName="editor-class"
                                                        toolbarClassName="toolbar-class"
                                                        editorState={template}
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
                                                            color:
                                                                remainingChars < 0 ? 'red' : 'gray'
                                                        }}
                                                    >
                                                        {remainingChars < 0 ? 0 : remainingChars}{' '}
                                                        characters remaining
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    {/* Display resignation conversation cards */}
                                                    {data &&
                                                        data.resignationDetailDTOs &&
                                                        data.resignationDetailDTOs.length > 0 ? (
                                                        data.resignationDetailDTOs.map(
                                                            (record, index) =>
                                                                index == 0 ? (
                                                                    <Cards
                                                                        data={record}
                                                                        name={
                                                                            record.submittedBy ==
                                                                                userDetails.employeeId
                                                                                ? 'You'
                                                                                : record.employeeName
                                                                        }
                                                                        align={
                                                                            record.submittedBy ==
                                                                                userDetails.employeeId
                                                                                ? 'right'
                                                                                : 'left'
                                                                        }
                                                                    />
                                                                ) : index == 1 ? (
                                                                    <>
                                                                        <div className='mb-1'
                                                                            style={{
                                                                                fontSize: '18px',
                                                                                color: '#004aad',
                                                                                fontWeight: 'bold',
                                                                                // marginLeft: '16em'
                                                                            }}
                                                                        >
                                                                            Comments
                                                                        </div>
                                                                        <Cards
                                                                            data={record}
                                                                            name={
                                                                                record.submittedBy ==
                                                                                    userDetails.employeeId
                                                                                    ? 'You'
                                                                                    : record.employeeName
                                                                            }
                                                                            align={
                                                                                record.submittedBy ==
                                                                                    userDetails.employeeId
                                                                                    ? 'right'
                                                                                    : 'left'
                                                                            }
                                                                        />
                                                                    </>
                                                                ) : (
                                                                    <Cards
                                                                        data={record}
                                                                        name={
                                                                            record.submittedBy ==
                                                                                userDetails.employeeId
                                                                                ? 'You'
                                                                                : record.employeeName
                                                                        }
                                                                        align={
                                                                            record.submittedBy ==
                                                                                userDetails.employeeId
                                                                                ? 'right'
                                                                                : 'left'
                                                                        }
                                                                    />
                                                                )
                                                        )
                                                    ) : (
                                                        <></>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                        {/* Add Comment Button in edit mode */}
                                        {withdraw != true && mode == 'edit' && (
                                            <div style={{ float: 'right' }}>
                                                <Button
                                                    variant=""
                                                    className="addMoreBtn"
                                                    disabled={
                                                        (data &&
                                                            data.status &&
                                                            data.status.label == 'Withdraw') ||
                                                        (data &&
                                                            data.status &&
                                                            data.status.label == 'HR Rejected') ||
                                                        (data &&
                                                            data.status &&
                                                            data.status.label == 'HR Approved')
                                                    }
                                                    onClick={() => commentHandler('Open')}
                                                >
                                                    Add Comment
                                                </Button>
                                            </div>
                                        )}

                                        {/* Date Picker in create mode */}
                                        {mode == 'create' ? (
                                            <div className="row">
                                                <Form.Group className="mb-3" as={Row}>
                                                    <Form.Label column sm={4}>
                                                        Requested Relieving Date
                                                    </Form.Label>
                                                    <Col sm={6}>
                                                        <DatePicker
                                                            inputReadOnly={true}
                                                            name="requestedRelievingDate"
                                                            onChange={requestedRelievingDateHandler}
                                                            format={'DD-MM-YYYY'}
                                                            className="datepicker"
                                                            disabledDate={(current) => {
                                                                return (
                                                                    current &&
                                                                    current.isBefore(
                                                                        moment(),
                                                                        'day'
                                                                    )
                                                                )
                                                            }}
                                                        />
                                                    </Col>
                                                </Form.Group>
                                            </div>
                                        ) : (
                                            <></>
                                        )}
                                    </form>
                                    {/* Action Buttons (Submit, Withdraw, Approve, Reject, Cancel) */}
                                    <div className="btnCenter" style={{ marginTop: '6%' }}>
                                        {withdraw ? (
                                            mode == 'create' ? (
                                                <Button
                                                    type="submit"
                                                    className="Button"
                                                    variant="addbtn"
                                                    onClick={resignationSubmissionHandler}
                                                >
                                                    Submit
                                                </Button>
                                            ) : (
                                                <Button
                                                    className="Button"
                                                    disabled={
                                                        data &&
                                                        data.status &&
                                                        (data.status.label == 'Withdraw' ||
                                                            data.status.label == 'HR Rejected')
                                                    }
                                                    variant="addbtn"
                                                    onClick={resignationWithdrawHandler}
                                                >
                                                    Withdraw
                                                </Button>
                                            )
                                        ) : canApprove ? (
                                            data &&
                                                data.status &&
                                                data.status.label === 'Submitted' ? (
                                                <>
                                                    <Button
                                                        type="submit"
                                                        className="Button"
                                                        variant="addbtn"
                                                        disabled={
                                                            data &&
                                                            data.status &&
                                                            data.status.label == 'Withdraw'
                                                        }
                                                        onClick={() =>
                                                            resignationApprovePopHandler('Approve')
                                                        }
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        type="submit"
                                                        className="Button"
                                                        variant="addbtn"
                                                        disabled={
                                                            data &&
                                                            data.status &&
                                                            data.status.label == 'Withdraw'
                                                        }
                                                        onClick={() =>
                                                            resignationApprovePopHandler('Reject')
                                                        }
                                                    >
                                                        Reject
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button
                                                    type="submit"
                                                    className="Button"
                                                    variant="addbtn"
                                                    disabled={
                                                        (data &&
                                                            data.status &&
                                                            data.status.label == 'Withdraw') ||
                                                        (data &&
                                                            data.status &&
                                                            data.status.label == 'HR Rejected')
                                                    }
                                                    onClick={() =>
                                                        resignationApprovePopHandler(
                                                            data &&
                                                                data.status &&
                                                                data.status.label === 'HR Approved'
                                                                ? 'Reject'
                                                                : 'Approve'
                                                        )
                                                    }
                                                >
                                                    {data &&
                                                        data.status &&
                                                        data.status.label === 'HR Approved'
                                                        ? 'Reject'
                                                        : 'Approve'}
                                                </Button>
                                            )
                                        ) : (
                                            <></>
                                        )}
                                        {/* Cancel Button */}
                                        <center>
                                            <Button
                                                className="Button"
                                                variant="secondary"
                                                type="button"
                                                onClick={() => {
                                                    if (
                                                        location.state.prevLocation ===
                                                        'resignationManagerList'
                                                    ) {
                                                        navigate('/resignationManagerList')
                                                    } else if (
                                                        location.state.prevLocation ===
                                                        'resignationHRList'
                                                    ) {
                                                        navigate('/resignationHRList')
                                                    } else {
                                                        navigate('/resignationList')
                                                    }
                                                }}
                                            >
                                                {cancelButtonName}
                                            </Button>
                                        </center>
                                    </div>
                                </div>
                                {/* } */}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Comment Modal */}
            <Modal
                show={commentPop}
                size="lg"
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Add Comment</Modal.Title>
                </Modal.Header>
                <Modal.Body className="">
                    {loading ? <DetailLoader /> : ''}
                    <div className="col- mb-2">
                        <Form.Label column sm={2} style={{ marginLeft: '-15px' }}>
                            Comment: <span className="error">*</span>
                        </Form.Label>
                        <div style={{ position: 'relative' }}>
                            <Editor
                                wrapperClassName="wrapper-class"
                                editorClassName="editor-class"
                                toolbarClassName="toolbar-class"
                                editorState={template}
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
                            <p className="error" style={{ textAlign: 'left' }}>
                                {formErrors && formErrors.comment}
                            </p>
                        </div>
                    </div>
                    <div className="btnCenter">
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

            {/* Approve/Reject Modal */}
            <Modal
                show={approvePop}
                size="lg"
                onHide={handleApproveClose}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>{approveStatus}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="">
                    {loading ? <DetailLoader /> : ''}
                    <div className="container-fluid">
                        {/* Remarks Input */}
                        <div className="row">
                            <div class="col-">
                                <Form.Group className="mb-4" as={Row}>
                                    <Form.Label column md={3}>
                                        Remarks{' '}
                                        {approveStatus == 'Approve' ? (
                                            ''
                                        ) : (
                                            <span className='error'>*</span>
                                        )}
                                    </Form.Label>

                                    <Col>
                                        <Form.Control
                                            md={8}
                                            required
                                            type="text"
                                            name="remarks"
                                            onBlur={(e) =>
                                                !e.target.value
                                                    ? setFormErrors({
                                                        ...formErrors,
                                                        remarks: 'Subject Required'
                                                    })
                                                    : setFormErrors({ ...formErrors, remarks: '' })
                                            }
                                            defaultValue={formData.remarks}
                                            onChange={onInputChange}
                                            maxLength={100}
                                        />
                                        {formErrors && formErrors.remarks ? (
                                            <p className='error'>{formErrors.remarks}</p>
                                        ) : (
                                            <></>
                                        )}
                                    </Col>

                                </Form.Group>
                            </div>
                        </div>
                        {/* Requested Relieving Date for Approve Action */}
                        {approveStatus == 'Approve' ? (
                            <div className="row mb-3">
                                <div class="col-6">
                                    <Form.Group className="mb-3" as={Row}>
                                        <Form.Label column md={7}>
                                            Requested Relieving Date
                                        </Form.Label>
                                        <Col md={5}>
                                            <DatePicker
                                                inputReadOnly={true}
                                                disabled={true}
                                                name="requestedRelievingDate"
                                                value={data.requestedlastDate ? moment(data.requestedlastDate) : null}
                                                format={'DD-MM-YYYY'}
                                                className="datepicker"
                                                disabledDate={(current) => {
                                                    return current && current.isBefore(moment(), 'day');
                                                }}
                                            />


                                            {/* {formErrors && formErrors.requestedRelievingDate ? <p style={{ color: "red" }}>{formErrors.requestedRelievingDate}</p> : <></>} */}
                                        </Col>
                                    </Form.Group>
                                </div>
                                <div class="col-6">
                                    <Form.Group className="mb-3" as={Row}>
                                        <Form.Label column md={7}>
                                            Actual Relieving Date <span className='error'>*</span>
                                        </Form.Label>
                                        <Col md={5}>
                                            <DatePicker
                                                inputReadOnly={true}
                                                name="lastworkingDate"
                                                onChange={(e) => onDateChangeHandler(e, "lastworkingDate")}
                                                format={'DD-MM-YYYY'}
                                                className="datepicker"
                                                disabledDate={(current) => {
                                                    return current && current.isBefore(moment(), 'day')
                                                }}
                                            />

                                            {formErrors && formErrors.lastworkingDate ? <p className='error'>{formErrors.lastworkingDate}</p> : <></>}
                                        </Col>
                                    </Form.Group>
                                </div>
                            </div>
                        ) : (
                            <></>
                        )}

                    </div>

                    <div className="btnCenter mb-3">
                        <Button
                            type="submit"
                            className="Button"
                            variant="addbtn"
                            onClick={resignationApproveHandler}
                        >
                            Submit
                        </Button>
                        <Button
                            className="Button"
                            variant="secondary"
                            type="button"
                            onClick={handleApproveClose}
                        >
                            {cancelButtonName}
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    )
}

export default Resignation
