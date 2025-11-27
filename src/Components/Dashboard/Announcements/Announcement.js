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
import { useSelector } from 'react-redux'
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
import { getAllByOrgId, getById, save, update } from '../../../Common/Services/CommonService'
import { cancelButtonName } from '../../../Common/Utilities/Constants'
import { toast } from 'react-toastify'

const Announcement = () => {
    const userDetails = useSelector((state) => state.user.userDetails)
    const [formErrors, setFormErrors] = useState({})
    // state for text data
    const [formData, setFormData] = useState({})
    const [locationList, setLocationList] = useState([])
    const [locationIds, setLocationIds] = useState([])
    const [notifications, setNotifications] = useState(false)
    const [email, setEmail] = useState(false)
    const [recurring, setRecurring] = useState(false)
    const [effectiveStartDate, setEffectiveStartDate] = useState(null)
    const [effectiveEndDate, setEffectiveEndDate] = useState(null)
    const [announcement, setAnnouncement] = useState({})
    const [loading, setLoading] = useState(false)
    const [body, setBody] = useState('')
    const [htmlObj, setHTMLObj] = useState('')
    const navigate = useNavigate()

    const announcementId = useLocation().state
    // input handling
    const onInputHandler = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const options = [
        ...(locationList.length > 1
            ? [{ value: 'all', label: 'All' }] // Add "All" option if the list has more than one item
            : []),
        ...locationList.map((option) => ({
            value: option.id,
            label: option.name
        }))
    ]

    const onLocationSelectHandler = (locations) => {
        if (locations.includes('all')) {
            // If "All" is selected, set all location IDs
            setFormErrors({ ...formErrors, locationIds: '' })
            const allLocationIds = locationList.map((location) => location.id)
            setLocationIds(allLocationIds)
        } else {
            // Otherwise, set the selected location IDs
            setFormErrors({ ...formErrors, locationIds: '' })
            setLocationIds(locations)
        }
    }

    useEffect(() => {
        onGetLocationsHandler()
        announcementId.id != null ? onGetAnnouncementHandler() : setLoading(false)
    }, [])
    useEffect(() => {
        setEffectiveEndDate(announcement.effectiveEndDate)
    }, [announcement])
    // get locations by organization id
    const onGetLocationsHandler = () => {
        getAllByOrgId({ entity: 'locations', organizationId: userDetails.organizationId })
            .then((res) => {
                if (res.statusCode == 200) {
                    setLocationList(res.data)
                }
            })
            .catch(()=> {}) // Handle error by doing nothing
    }

    // get Announcement by id
    const onGetAnnouncementHandler = () => {
        setLoading(true)
        getById({
            entity: 'announcements',
            organizationId: userDetails.organizationId,
            id: announcementId && announcementId.id
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setLocationIds(res.data.locationIds)
                    const htmlString = res.data.body
                    const contentBlock = htmlToDraft(htmlString)
                    const contentState = ContentState.createFromBlockArray(
                        contentBlock.contentBlocks
                    )
                    const editorState = EditorState.createWithContent(contentState)
                    setBody(editorState)
                    setHTMLObj(res.data.body)
                    setFormData(res.data)
                    setAnnouncement(res.data)
                    setNotifications(res.data.notification)
                    setEmail(res.data.mail)
                    setRecurring(res.data.recurring)
                    setEffectiveStartDate(res.data.effectiveStartDate)
                    setEffectiveEndDate(res.data.effectiveEndDate)
                    setLoading(false)
                }
            })
            .catch((err) => {
                console.log(err, 'error')
            })
    }

    const onCancelHandler = () => {
        navigate('/announcementList')
    }

    // save
    const onSaveHandler = (e) => {
        setLoading(true)
        e.preventDefault()
        let obj = {
            id: announcementId && announcementId.id,
            name: formData.name,
            body: htmlObj,
            effectiveStartDate: effectiveStartDate,
            effectiveEndDate: effectiveEndDate,
            recurring: recurring,
            organizationId: userDetails.organizationId,
            locationIds: locationIds,
            notification: notifications,
            mail: email
        }

        if (obj.name == undefined) {
            setFormErrors(validate(obj))
        } else if (obj.effectiveStartDate == undefined) {
            setFormErrors(validate(obj))
        } else if (obj.effectiveEndDate == undefined) {
            setFormErrors(validate(obj))
        } else if (obj.locationIds.length <= 0) {
            setFormErrors(validate(obj))
        } else if (
            obj.body.trim() === '' || // Empty string
            obj.body.trim() === '<p></p>\n' || // Default empty HTML
            /^<p>(\s|&nbsp;)*<\/p>$/.test(obj.body.trim()) // <p> with only spaces or &nbsp;
        ) {
            setFormErrors(validate(obj))
        } else {
            save({
                entity: 'announcements',
                organizationId: userDetails.organizationId,
                body: obj,
                screenName: 'Announcement',
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Announcement',
                    operationType: 'save'
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
            recurring: recurring,
            organizationId: userDetails.organizationId,
            locationIds: locationIds,
            notification: notifications,
            mail: email,
            createdBy: null,
            createdDate: null,
            deleted: announcement.deleted,
            modifiedBy: null,
            modifiedDate: announcement.modifiedDate
        }
        if (obj.name == undefined) {
            setFormErrors(validate(obj))
        } else if (obj.effectiveStartDate == undefined) {
            setFormErrors(validate(obj))
        } else if (obj.effectiveEndDate == undefined) {
            setFormErrors(validate(obj))
        } else if (obj.locationIds.length <= 0) {
            setFormErrors(validate(obj))
        } else if (
            obj.body.trim() === '' || // Empty string
            obj.body.trim() === '<p></p>\n' || // Default empty HTML
            /^<p>(\s|&nbsp;)*<\/p>$/.test(obj.body.trim()) // <p> with only spaces or &nbsp;
        ) {
            setFormErrors(validate(obj))
        } else if (updateValidation(announcement, obj)) {
            setLoading(false)
            toast.info('No changes made to update.')
        } else {
            update({
                entity: 'announcements',
                organizationId: userDetails.organizationId,
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
                        // toast.success("Details updated Successfully.")
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

    //validation before saving
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
        if (values.locationIds <= 0) {
            errors.locationIds = 'Required'
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

    options.filter((elem) => {
        return locationIds.some((ele) => {
            return ele == elem.value
        })
    })

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

    const effectiveDays = (e) => {
        setEffectiveStartDate(moment(e).format('YYYY-MM-DD'))
        setEffectiveEndDate(null)
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
                                                className=""
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
                                                        // onChange={(e) => setEffectiveStartDate(moment(e).format("YYYY-MM-DD"))}
                                                        onChange={(e) => effectiveDays(e)}
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
                                                className=""
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
                                                className="mb-3"
                                                controlId="formGroupToDate"
                                            >
                                                <Form.Label className="fieldLabel" column md={4}>
                                                    Location <span className="error">*</span>
                                                </Form.Label>
                                                <Col md={7}>
                                                    <Select
                                                        className="announcement-dropdown"
                                                        options={options}
                                                        isMulti={true}
                                                        placeholder=""
                                                        value={options.filter((elem) => {
                                                            return locationIds.some((ele) => {
                                                                return ele == elem.value
                                                            })
                                                        })}
                                                        onChange={(e) =>
                                                            onLocationSelectHandler(
                                                                e.map((e) => e.value)
                                                            )
                                                        }
                                                    />
                                                    <p className="error">
                                                        {formErrors.locationIds}
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
                                                    // list: { inDropdown: true },
                                                    // textAlign: { inDropdown: true },
                                                    link: { inDropdown: true },
                                                    history: { inDropdown: true },
                                                    fontSize: {
                                                        options: ['8', '10', '12', '14']
                                                    }
                                                }}
                                            />
                                            {formErrors && formErrors.body ? (
                                                <p className="error">{formErrors.body}</p>
                                            ) : (
                                                <></>
                                            )}
                                        </div>

                                        {/* <div class="col-">
                      <Form.Group
                        as={Row}
                        className="mb-3"
                        controlId="formGroupToDate"
                      >

                        <Col md={4}>
                          <Checkbox
                            className="mb-4"
                            checked={notifications}
                            onChange={(e) => setNotifications(e.target.checked)}
                          >Notification</Checkbox>
                        </Col>
                        <Col md={4}>
                          <Checkbox
                            className="mb-4"
                            checked={email}
                            onChange={(e) => setEmail(e.target.checked)}
                          >Email</Checkbox>
                        </Col>
                        <Col md={4}>
                          <Checkbox
                            className="mb-4"
                            checked={recurring}
                            onChange={(e) => setRecurring(e.target.checked)}
                          >Recurring</Checkbox>
                        </Col>
                      </Form.Group>
                    </div> */}

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

export default Announcement
