import { DatePicker } from 'antd'
import { ContentState, EditorState, convertToRaw } from 'draft-js'
import draftToHtml from 'draftjs-to-html'
import htmlToDraft from 'html-to-draftjs'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import { Editor } from 'react-draft-wysiwyg'
import { useLocation, useNavigate } from 'react-router-dom'
import Select from 'react-select'
import { commonCrudSuccess } from '../../../Common/CommonComponents/CustomizedSuccessToastMessages'
import {
    handleKeyPress,
    updateValidation
} from '../../../Common/CommonComponents/FormControlValidation'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import { ToastError, ToastSuccess } from '../../../Common/CommonComponents/ToastCustomized'
import {
    getAll,
    saveWithoutOrg,
    updateWithoutOrg
} from '../../../Common/Services/CommonService'
import { cancelButtonName } from '../../../Common/Utilities/Constants'
import { toast } from 'react-toastify'

const AppOwnerAnnouncement = () => {
    const [organization, SetOrganization] = useState([]) //state for storing the organizationData
    const [formData, setFormData] = useState('') //state for the announcement data
    const [announcement, setAnnouncement] = useState({}) //storing the announcemnt data when the api renders
    const [formErrors, setFormErrors] = useState({}) //storing the updating data when the user updates any fields
    const location = useLocation()
    const [loading, setLoading] = useState(false) //when the api call initiated then loader will be enabled
    const [selectedOrganization, setSelectedOrganization] = useState(null) //state for organization field
    const [effectiveStartDate, setEffectiveStartDate] = useState(null) //state for effective start date field
    const [effectiveEndDate, setEffectiveEndDate] = useState(null) //state for effective end date field
    const [body, setBody] = useState('') //state for body
    const [htmlObj, setHTMLObj] = useState('')
    const navigate = useNavigate()

    const announcementId = useLocation().state //storing the announcemntId

    // input handling
    const onInputHandler = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const optionsLableHandler = (options, keyOfIds) => {
        //filter the options according to the keys
        const selected = location.state && location.state.data[keyOfIds]
        if (selected) {
            return options
                .filter((option) => selected.includes(option.id))
                .map((option) => ({
                    label: option.name,
                    value: option.id
                }))
        }

        return []
    }

    const extractIds = (selectedOptions) => {
        //the options which was selected extract the ids
        return selectedOptions ? selectedOptions.map((option) => option.value) : []
    }

    const organizationSelectHandler = (selectedOptions) => {
        if (selectedOptions) {
            const isAllSelected = selectedOptions.some((option) => option.value === 'all')

            if (isAllSelected) {
                setFormErrors({ ...formErrors, organizationIds: '' })
                setSelectedOrganization(
                    organization.map((option) => ({
                        label: option.name,
                        value: option.id
                    }))
                )
            } else {
                setSelectedOrganization(selectedOptions)
                setFormErrors({ ...formErrors, organizationIds: '' })
            }
        } else {
            setSelectedOrganization([])
        }
    }

    useEffect(() => {
        //fetch the methods while rendering the page
        onGetOrgnizationHandler()
    }, [])

    useEffect(() => {
        if (announcementId && announcementId.data) {
            setFormData(announcementId.data)
            // onGetOrgnizationHandler()
            const htmlString = announcementId.data.body
            const contentBlock = htmlToDraft(htmlString)
            const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks)
            const editorState = EditorState.createWithContent(contentState)
            setBody(editorState)
            setHTMLObj(announcementId.data.body)
            setAnnouncement(announcementId.data)
            setEffectiveStartDate(announcementId.data.effectiveStartDate)
            setEffectiveEndDate(announcementId.data.effectiveEndDate)
        }
    }, [announcementId])

    useEffect(() => {
        //fetch the methods while rendering the page when the announcent is present
        setEffectiveEndDate(announcement.effectiveEndDate)
    }, [announcement])

    // get organizations
    const onGetOrgnizationHandler = () => {
        setLoading(true)
        getAll({ entity: 'organizations' })
            .then((res) => {
                if (res.statusCode == 200) {
                    SetOrganization(res.data ? res.data : [])
                    setSelectedOrganization(optionsLableHandler(res.data, 'organizationIds'))
                    setTimeout(() => {
                        setLoading(false)
                    }, 2000)
                }
            })
            .catch(() => {
                setLoading(false)
            })
    }

    const onCancelHandler = () => {
        navigate('/announcementList')
    }

    //save
    const onSaveHandler = (e) => {
        setLoading(true)
        e.preventDefault()
        let obj = {
            id: announcementId && announcementId.id,
            name: formData.name,
            body: htmlObj,
            effectiveStartDate: effectiveStartDate,
            effectiveEndDate: effectiveEndDate,
            organizationIds: extractIds(selectedOrganization)
        }
        if (obj.name == undefined) {
            setFormErrors(validate(obj))
        } else if (obj.effectiveStartDate == undefined) {
            setFormErrors(validate(obj))
        } else if (obj.effectiveEndDate == undefined) {
            setFormErrors(validate(obj))
        } else if (obj.organizationIds.length <= 0) {
            setFormErrors(validate(obj))
        } else if (
            obj.body.trim() === '' || // Empty string
            obj.body.trim() === '<p></p>\n' || // Default empty HTML
            /^<p>(\s|&nbsp;)*<\/p>$/.test(obj.body.trim()) // <p> with only spaces or &nbsp;
        ) {
            setFormErrors(validate(obj))
        } else {
            saveWithoutOrg({
                entity: 'appownerannouncements',
                body: obj,
                screenName: 'Announcement',
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Announcement',
                    operationType: 'save'
                })
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        // toast.success("details added Successfully.")
                        setLoading(false)
                        ToastSuccess(res.message)
                        navigate('/announcementList')
                    }
                })
                .catch((err) => {
                    setLoading(false)

                    ToastError(err.message)
                })
        }
    }

    //update
    const onUpdateHandler = (e) => {
        setLoading(true)
        e.preventDefault()
        let obj = {
            id: announcementId && announcementId.id,
            name: formData.name,
            body: htmlObj,
            effectiveStartDate: effectiveStartDate,
            effectiveEndDate: effectiveEndDate,
            organizationIds: extractIds(selectedOrganization),
            createdBy: null,
            createdDate: announcement.createdDate,
            deleted: false,
            modifiedBy: null,
            modifiedDate: announcement.modifiedDate
        }
        if (obj.name == undefined) {
            setFormErrors(validate(obj))
        } else if (obj.effectiveStartDate == undefined) {
            setFormErrors(validate(obj))
        } else if (obj.effectiveEndDate == undefined) {
            setFormErrors(validate(obj))
        } else if (obj.organizationIds.length <= 0) {
            setFormErrors(validate(obj))
        } else if (
            obj.body.trim() === '' || // Empty string
            obj.body.trim() === '<p></p>\n' || // Default empty HTML
            /^<p>(\s|&nbsp;)*<\/p>$/.test(obj.body.trim()) // <p> with only spaces or &nbsp;
        ) {
            setFormErrors(validate(obj))
        } else if (updateValidation(obj, announcement)) {
            setLoading(false)
            toast.info('No changes made to update')
        } else {
            updateWithoutOrg({
                entity: 'appownerannouncements',
                body: obj,
                id: announcementId.id,
                screenName: 'Announcement',
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Announcement',
                    operationType: 'update'
                })
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        setLoading(false)
                        ToastSuccess(res.message)
                        navigate('/announcementList')
                    }
                })
                .catch((err) => {
                    setLoading(false)

                    ToastError(err.message)
                })
        }
    }

    //validation while save and update function hits
    const validate = (values) => {
        const errors = {}

        if (!values.name) {
            errors.subject = 'Required'
        }
        if (!values.effectiveStartDate) {
            errors.effectiveStartDate = 'Required'
        }
        if (!values.effectiveEndDate) {
            errors.effectiveEndDate = 'Required'
        }
        if (values.organizationIds <= 0) {
            errors.organizationIds = 'Required'
        }
        if (
            values.body.trim() === '' || // Empty string
            values.body.trim() === '<p></p>\n' || // Default empty HTML
            /^<p>(\s|&nbsp;)*<\/p>$/.test(values.body.trim()) // <p> with only spaces or &nbsp;
        ) {
            errors.body = 'Required'
        }
        setLoading(false)
        return errors
    }
    const onEditorStateChange = (editorState) => {
        setBody(editorState)
        const body = draftToHtml(convertToRaw(editorState.getCurrentContent()))
        setHTMLObj(body)
        const trimmedBody = body.trim()
        if (
            trimmedBody === '' ||
            trimmedBody === '<p></p>\n' ||
            /^<p>(\s|&nbsp;)*<\/p>$/.test(trimmedBody)
        ) {
            setFormErrors({ ...formErrors, body: 'Required' })
        } else {
            setFormErrors({ ...formErrors, body: '' })
        }
    }

    return (
        <>
            {loading ? <DetailLoader /> : ''}
            <section className="section detailBackground">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="card-primary">
                                <PageHeader
                                    pageTitle={
                                        announcementId && announcementId.id == null
                                            ? 'Create Announcement'
                                            : 'Update Announcement'
                                    }
                                />

                                <div className="formBody">
                                    <form className="card-body" onSubmit={onSaveHandler}>
                                        <div class="col-">
                                            <Form.Group
                                                as={Row}
                                                className="mb-3"
                                                controlId="formGroupToDate"
                                            >
                                                <Form.Label className="fieldLabel" column md={4}>
                                                    Subject <span className="error">*</span>
                                                </Form.Label>
                                                <Col md={7}>
                                                    <Form.Control
                                                        className="textBox"
                                                        maxLength={50}
                                                        onChange={onInputHandler}
                                                        defaultValue={
                                                            announcement && announcement.name
                                                        }
                                                        // value={formData.locationName}
                                                        name="name"
                                                        type="text"
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
                                                    {formErrors.subject && (
                                                        <p className="error">
                                                            {formErrors.subject}
                                                        </p>
                                                    )}
                                                </Col>
                                            </Form.Group>
                                        </div>

                                        <div class="col-">
                                            <Form.Group
                                                as={Row}
                                                className="mb-0"
                                                controlId="formGroupToDate"
                                            >
                                                <Form.Label className="fieldLabel" column md={4}>
                                                    Effective Start Date{' '}
                                                    <span className="error">*</span>
                                                </Form.Label>
                                                <Col md={7}>
                                                    <DatePicker
                                                        required
                                                        format={'DD-MM-YYYY'}
                                                        className="datepicker"
                                                        name="effectiveStartDate"
                                                        placeholder=""
                                                        inputReadOnly={true}
                                                        value={
                                                            effectiveStartDate
                                                                ? moment(effectiveStartDate)
                                                                : null
                                                        }
                                                        allowClear={false}
                                                        type="date"
                                                        onChange={(e) => {
                                                            setEffectiveStartDate(
                                                                moment(e).format('YYYY-MM-DD')
                                                            )
                                                            setEffectiveEndDate(null) // Reset effectiveEndDate to null
                                                        }}
                                                        onBlur={(e) =>
                                                            !e.target.value
                                                                ? setFormErrors({
                                                                      ...formErrors,
                                                                      effectiveStartDate: 'Required'
                                                                  })
                                                                : setFormErrors({
                                                                      ...formErrors,
                                                                      effectiveStartDate: ''
                                                                  })
                                                        }
                                                        disabledDate={(current) => {
                                                            // Disable all dates before today
                                                            return (
                                                                current &&
                                                                current < moment().startOf('day')
                                                            )
                                                        }}
                                                    />
                                                    <p className="error">
                                                        {formErrors.effectiveStartDate}
                                                    </p>
                                                </Col>
                                            </Form.Group>
                                        </div>

                                        <div class="col-">
                                            <Form.Group
                                                as={Row}
                                                className="mb-0"
                                                controlId="formGroupToDate"
                                            >
                                                <Form.Label className="fieldLabel" column md={4}>
                                                    Effective End Date{' '}
                                                    <span className="error">*</span>
                                                </Form.Label>
                                                <Col md={7}>
                                                    <DatePicker
                                                        className="datepicker"
                                                        format={'DD-MM-YYYY'}
                                                        required
                                                        name="effectiveEndDate"
                                                        placeholder=""
                                                        inputReadOnly={true}
                                                        value={
                                                            effectiveEndDate
                                                                ? moment(effectiveEndDate)
                                                                : null
                                                        }
                                                        allowClear={false}
                                                        type="date"
                                                        onChange={(e) =>
                                                            setEffectiveEndDate(
                                                                moment(e).format('YYYY-MM-DD')
                                                            )
                                                        }
                                                        onBlur={(e) =>
                                                            !e.target.value
                                                                ? setFormErrors({
                                                                      ...formErrors,
                                                                      effectiveEndDate: 'Required'
                                                                  })
                                                                : setFormErrors({
                                                                      ...formErrors,
                                                                      effectiveEndDate: ''
                                                                  })
                                                        }
                                                        disabledDate={(current) => {
                                                            return (
                                                                current &&
                                                                current <
                                                                    moment(
                                                                        effectiveStartDate,
                                                                        'YYYY-MM-DD'
                                                                    )
                                                            )
                                                        }}
                                                        disabled={!effectiveStartDate}
                                                    />
                                                    <p className="error">
                                                        {formErrors.effectiveEndDate}
                                                    </p>
                                                </Col>
                                            </Form.Group>
                                        </div>
                                        <div class="col-">
                                            <Form.Group
                                                as={Row}
                                                className="mb-2"
                                                controlId="formGroupToDate"
                                            >
                                                <Form.Label className="fieldLabel" column md={4}>
                                                    Organization<span className="error">*</span>
                                                </Form.Label>
                                                <Col md={7}>
                                                    {/* #1765 bug resolved added className to the select component */}
                                                    <Select
                                                        className="announcement-dropdown"
                                                        options={[
                                                            ...(organization &&
                                                            organization.length > 0
                                                                ? [{ label: 'All', value: 'all' }]
                                                                : []),
                                                            ...(organization &&
                                                                organization.map((option) => ({
                                                                    label: option.name.toString(),
                                                                    value: option.id
                                                                })))
                                                        ]}
                                                        isMulti={true}
                                                        isClearable={true}
                                                        value={selectedOrganization}
                                                        onChange={organizationSelectHandler}
                                                    />
                                                    <p className="error">
                                                        {formErrors.organizationIds}
                                                    </p>
                                                </Col>
                                            </Form.Group>
                                        </div>
                                        <div class="col-">
                                            <Form.Group
                                                as={Row}
                                                className="mb-2"
                                                controlId="formGroupToDate"
                                            >
                                                <Form.Label className="fieldLabel" column md={4}>
                                                    Body <span className="error">*</span>
                                                </Form.Label>
                                                <Col md={7}></Col>
                                            </Form.Group>
                                        </div>
                                        <div className="col- mb-3">
                                            <Editor
                                                wrapperClassName="wrapper-class"
                                                editorClassName="editor-class"
                                                toolbarClassName="toolbar-class"
                                                editorState={body}
                                                onEditorStateChange={onEditorStateChange}
                                                onBlur={() => {
                                                    const trimmedBody = htmlObj.trim()
                                                    if (
                                                        trimmedBody === '' ||
                                                        trimmedBody === '<p></p>\n' ||
                                                        /^<p>(\s|&nbsp;)*<\/p>$/.test(trimmedBody)
                                                    ) {
                                                        setFormErrors({
                                                            ...formErrors,
                                                            body: 'Required'
                                                        })
                                                    } else {
                                                        setFormErrors({ ...formErrors, body: '' })
                                                    }
                                                }}
                                                toolbar={{
                                                    inline: { inDropdown: true },
                                                    link: { inDropdown: true },
                                                    history: { inDropdown: true }
                                                }}
                                            />
                                            {formErrors && formErrors.body ? (
                                                <p className="error">{formErrors.body}</p>
                                            ) : (
                                                <></>
                                            )}
                                        </div>

                                        <div className="btnCenter mb-2">
                                            {announcementId.id == null ? (
                                                <Button
                                                    className="Button"
                                                    variant="addbtn"
                                                    type="submit"
                                                >
                                                    Save
                                                </Button>
                                            ) : (
                                                <Button
                                                    className="Button"
                                                    variant="addbtn"
                                                    type="button"
                                                    onClick={onUpdateHandler}
                                                >
                                                    Update
                                                </Button>
                                            )}

                                            <Button
                                                className="Button"
                                                variant="secondary"
                                                type="button"
                                                onClick={onCancelHandler}
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
        </>
    )
}

export default AppOwnerAnnouncement
