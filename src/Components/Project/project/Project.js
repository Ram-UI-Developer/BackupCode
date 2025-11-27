import { DatePicker } from 'antd'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import Select from 'react-select'
import { commonCrudSuccess } from '../../../Common/CommonComponents/CustomizedSuccessToastMessages'
import {
    compareArrayOfObjects,
    handleKeyPress,
    updateValidation
} from '../../../Common/CommonComponents/FormControlValidation'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import { ToastError, ToastSuccess } from '../../../Common/CommonComponents/ToastCustomized'
import { getAllByOrgId, save, update } from '../../../Common/Services/CommonService'
import { cancelButtonName } from '../../../Common/Utilities/Constants'
import ProjectResourceList from './ProjectResoucersList'
import { toast } from 'react-toastify'

const Project = () => {
    // Redux user details
    const userDetails = useSelector((state) => state.user.userDetails)

    // Router and navigation
    const navigate = useNavigate()
    const location = useLocation()

    // Form and UI states
    const [formData, setFormData] = useState('')
    const [mode, setMode] = useState('')
    const [visible, setVisible] = useState(false)
    const [projectsData, setProjectsData] = useState()
    // Date fields
    const [projectActualStartDate, setProjectActualStartDate] = useState()
    const [projectActualEndDate, setProjectActualEndDate] = useState()
    const [projectExpectedStartDate, setProjectExpectedStartDate] = useState()
    const [projectExpectedEndDate, setProjectExpectedEndDate] = useState()

    // Dropdown selections
    const [clientSelect, setClientSelect] = useState()
    const [projectSelect, setProjectSelect] = useState()

    // Project resources
    const [projectResources, setProjectResources] = useState([])

    // Internal state and ID tracking
    // const [selectedId, setSelectedId] = useState('')
    const entity = 'projects'
    // const [projectClientId, setProjectClientId] = useState(
    //     location.state && location.state.data && location.state.data.projectClientId
    // )
    const [isInternal, setIsInternal] = useState(1) // 1 = internal, 0 = external

    // Loading and dropdown options
    const [isLoading, setIsLoading] = useState(false)
    const [options, setOptions] = useState([])
    const [projectOptions, setProjectOptions] = useState([])

    // Form errors
    const [formErrors, setFormErrors] = useState({})

    // --- Date change handlers ---
    const projectActualStartDateChange = (date) => {
        if (date != null) {
            let selectedDate = moment(date).format('YYYY-MM-DD')
            setProjectActualStartDate(selectedDate)
        } else {
            setProjectActualStartDate(null)
        }
    }

    // --- Date change handlers ---
    const projectActualEndDateChange = (date) => {
        if (date != null) {
            let selectedDate = moment(date).format('YYYY-MM-DD')
            setProjectActualEndDate(selectedDate)
        } else {
            setProjectActualEndDate(null)
        }
    }

    // --- Date change handlers ---
    const projectExpectedEndDateChange = (date) => {
        if (date != null) {
            let selectedDate = moment(date).format('YYYY-MM-DD')
            setProjectExpectedEndDate(selectedDate)
        } else {
            setProjectExpectedEndDate(null)
        }
    }

    // --- Date change handlers ---
    const projectExpectedStartDateChange = (date) => {
        if (date != null) {
            let selectedDate = moment(date).format('YYYY-MM-DD')
            !date
                ? setFormErrors({ ...formErrors, expectedStartDate: 'Required' })
                : setFormErrors({ ...formErrors, expectedStartDate: '' })
            setProjectExpectedStartDate(selectedDate)
        } else {
            setProjectExpectedStartDate(null)
        }
    }

    // --- Form validation ---
    const validate = (values) => {
        const errors = {}
        if (!values.company) {
            errors.company = 'Required'
        }
        if (values.expectedStartDate == null) {
            errors.expectedStartDate = 'Required'
        }
        if (values.internal == 0 && !values.projectClientId) {
            errors.projectClientId = 'Required'
        }
        if (values.projectStatusId == undefined) {
            errors.projectStatusId = 'Required'
        }
        if (!values.technology) {
            errors.technology = 'Required'
        }
        if (!values.description) {
            errors.description = 'Required'
        }
        if (!values.name) {
            errors.name = 'Required'
        }
        if (values.internal == undefined) {
            errors.internal = 'Required'
        }
        if (!values.code) {
            errors.code = 'Required'
        }
        return errors
    }

    // --- Save handler ---
    const onSaveHandler = (e) => {
        e.preventDefault()
        const obj = {
            id: formData.id,
            name: formData.name,
            deleted: false,
            projectStatusId: projectSelect,
            description: formData.description,
            technology: formData.technology,
            billable: true,
            actualEndDate: projectActualEndDate,
            actualStartDate: projectActualStartDate,
            expectedEndDate: projectExpectedEndDate,
            expectedStartDate: projectExpectedStartDate,
            projectClientId: clientSelect,
            organizationId: userDetails.organizationId,
            projectResourceDTOs: [...projectResources],
            internal: isInternal,
            code: formData.code
        }

        // Run validation
        if (!obj.name) {
            setFormErrors(validate(obj))
        } else if (!obj.technology) {
            setFormErrors(validate(obj))
        } else if (obj.expectedStartDate == null) {
            setFormErrors(validate(obj))
        } else if (!obj.description) {
            setFormErrors(validate(obj))
        } else if (obj.internal == 0 && !obj.projectClientId) {
            setFormErrors(validate(obj))
        } else if (obj.projectStatusId == undefined) {
            setFormErrors(validate(obj))
        } else if (obj.internal == undefined) {
            setFormErrors(validate(formData))
        } else if (!obj.code) {
            setFormErrors(validate(formData))
        } else {
            // Proceed to save API call
            setIsLoading(true)
            save({
                entity: entity,
                organizationId: userDetails.organizationId,
                body: obj,
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Project',
                    operationType: 'save'
                }),
                screenName: 'Project'
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        setIsLoading(false)
                        ToastSuccess(res.message)

                        navigate('/projectList')
                    }
                })
                .catch((err) => {
                    
                    setIsLoading(false)
                    ToastError(err.message)
                })
        }
    }

    // --- Update handler ---
    const onUpdateHandler = (e) => {
        e.preventDefault()
        const obj = {
            id: formData.id,
            name: formData.name,
            deleted: false,
            projectStatusId: projectSelect,
            description: formData.description,
            technology: formData.technology,
            billable: true,
            actualEndDate: projectActualEndDate,
            actualStartDate: projectActualStartDate,
            expectedEndDate: projectExpectedEndDate,
            expectedStartDate: projectExpectedStartDate,
            projectClientId: clientSelect,
            organizationId: userDetails.organizationId,
            organizationName: formData.organizationName,
            projectStatusName: formData.projectStatusName,
            projectClientName: formData.projectClientName,
            projectResourceDTOs: [...projectResources],
            internal: isInternal,
            code: formData.code,
            createdBy: null,
            createdDate: formData.createdDate,
            modifiedBy: null,
            modifiedDate: formData.modifiedDate
        }
        // Validate before update
        if (!obj.name) {
            setFormErrors(validate(obj))
        } else if (!obj.technology) {
            setFormErrors(validate(obj))
        } else if (obj.expectedStartDate == null) {
            setFormErrors(validate(obj))
        } else if (!obj.description) {
            setFormErrors(validate(obj))
        } else if (obj.internal == 0 && !obj.projectClientId) {
            setFormErrors(validate(obj))
        } else if (obj.projectStatusId == undefined) {
            setFormErrors(validate(obj))
        } else if (obj.internal == undefined) {
            setFormErrors(validate(formData))
        } else if (!obj.code) {
            setFormErrors(validate(formData))
        } else if (
            updateValidation(obj, projectsData) &&
            compareArrayOfObjects(obj.projectResourceDTOs, projectsData.projectResourceDTOs)
        ) {
            toast.info('No changes detected to update')
        } else {
            // Proceed to update API call
            setIsLoading(true)
            update({
                entity: entity,
                organizationId: userDetails.organizationId,
                id: location.state.id,
                body: obj,
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Project',
                    operationType: 'update'
                }),
                screenName: 'Project'
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        ToastSuccess(res.message)
                        setIsLoading(false)
                        navigate('/projectList')
                    }
                })
                .catch((err) => {
                    
                    setIsLoading(false)
                    ToastError(err.message)
                })
        }
    }

    // --- Internal/External project switch ---
    const projectTypeChange = (e) => {
        if (e.target.value == 1) {
            setIsInternal(1)
            setFormData({ ...formData, internal: 1 })
        } else if (e.target.value == 0) {
            setIsInternal(0)
            setFormData({ ...formData, internal: 0 })
        }
    }

    // --- Initial effect for setting edit/create mode and loading dropdowns ---
    useEffect(() => {
        if (location.state && location.state.id == null) {
            setMode('create')
            setVisible(true)
        } else {
            setFormData(location.state && location.state.data)
            setProjectsData(location.state && location.state.data)
            setMode('edit')
            // setSelectedId(location.state && location.state.data.id)
            setProjectResources(location.state && location.state.data.projectResourceDTOs)
            // setProjectClientId(location.state && location.state.data.projectClientId)
            setProjectActualStartDate(location.state && location.state.data.actualStartDate)
            setProjectActualEndDate(location.state && location.state.data.actualEndDate)
            setProjectExpectedEndDate(location.state && location.state.data.expectedEndDate)
            setProjectExpectedStartDate(location.state && location.state.data.expectedStartDate)
            setProjectSelect(location.state && location.state.data.projectStatusId)
            setClientSelect(location.state && location.state.data.projectClientId)
            setVisible(true)
            setIsInternal(location.state && location.state.data.internal)
        }
        getProjectClientList()
        getProjectStatus()
    }, [])

    // --- Fetch client list ---
    const getProjectClientList = () => {
        setIsLoading(true)
        getAllByOrgId({ entity: 'projectclients', organizationId: userDetails.organizationId })
            .then((res) => {
                clientEventsHandler(res.data)
            })
            .catch(() => {
                setIsLoading(false)
            })
    }

    // --- Fetch project status options ---
    const getProjectStatus = () => {
        setIsLoading(true)
        getAllByOrgId({
            entity: 'projectstatus',
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId
        })
            .then((res) => {
                projectEventsHandler(res.data)
            })
            .catch(() => {
                setIsLoading(false)
            })
    }

    // --- Map client list for dropdown ---
    const clientEventsHandler = (data) => {
        let optionsMapped = data.map((option) => ({
            value: option.id,
            label: option.name
        }))
        setOptions(optionsMapped)
        setIsLoading(false)
    }

    // --- Map project status list for dropdown ---
    const projectEventsHandler = (data) => {
        let optionsMapped = data.map((option) => ({
            value: option.id,
            label: option.name
        }))
        setProjectOptions(optionsMapped)
        setIsLoading(false)
    }

    // --- Input field change handler ---
    const onInputChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value.trimStart().replace(/\s+/g, ' ')
        })
        // Update errors live
        !e.target.value
            ? setFormErrors({ ...formErrors, [name]: 'Required' })
            : setFormErrors({ ...formErrors, [name]: '' })
    }

    // --- Dropdown selection handlers ---
    const handleClientSelection = (selection) => {
        if (!selection) {
            setFormErrors({
                ...formErrors,
                projectClientId: !selection ? 'Required' : ''
            })
            setClientSelect()
        }
        setClientSelect(selection.value)
    }

    // --- Dropdown selection handlers ---
    const handleProjectSelection = (selection) => {
        setFormErrors({
            ...formErrors,
            projectStatusId: !selection ? 'Required' : ''
        })
        setProjectSelect(selection.value)
    }

    return (
        <>
            <section className="section detailBackground">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="">
                                <PageHeader
                                    pageTitle={mode == 'create' ? 'Add Project' : 'Update Project'}
                                />
                                {isLoading ? <DetailLoader /> : ''}
                                <div
                                    className="center"
                                    style={{ paddingLeft: '10%', paddingRight: '10%' }}
                                >
                                    {/* Form starts, handles submission with onSaveHandler */}
                                    <form onSubmit={onSaveHandler} className="card-body">
                                        {/* Render form fields only if `visible` is true */}
                                        {visible ? (
                                            <>
                                                {/* Name Input Field */}
                                                <div className="col-">
                                                    <Form.Group className="mb-3" as={Row}>
                                                        <Form.Label column sm={3}>
                                                            Name{' '}
                                                            <span className="error">*</span>
                                                        </Form.Label>
                                                        <Col sm={7}>
                                                            <Form.Control
                                                                required
                                                                onKeyPress={(e) =>
                                                                    handleKeyPress(e, setFormErrors)
                                                                }
                                                                onPaste={(e) =>
                                                                    handleKeyPress(e, setFormErrors)
                                                                }
                                                                onInput={(e) =>
                                                                    handleKeyPress(e, setFormErrors)
                                                                }
                                                                type="text"
                                                                name="name"
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
                                                                defaultValue={
                                                                    location.state.data
                                                                        ? location.state.data.name
                                                                        : ''
                                                                }
                                                                onChange={onInputChange}
                                                                maxLength={50}
                                                            />
                                                            {formErrors && formErrors.name ? (
                                                                <p className="error">
                                                                    {formErrors.name}
                                                                </p>
                                                            ) : (
                                                                <></>
                                                            )}
                                                        </Col>
                                                    </Form.Group>
                                                </div>
                                                {/* Project Type Radio Buttons (Internal/External) */}
                                                <div className="col-">
                                                    <Form.Group className="mb-3" as={Row}>
                                                        <Form.Label column sm={3}>
                                                            Project Type{' '}
                                                            <span className="error">*</span>
                                                        </Form.Label>
                                                        <Col sm={7} style={{ marginTop: '5px' }}>
                                                            {/* Internal Project Radio */}
                                                            <input
                                                                type="radio"
                                                                label="Internal"
                                                                value={1}
                                                                checked={isInternal}
                                                                onChange={projectTypeChange}
                                                                onBlur={() =>
                                                                    isInternal == undefined
                                                                        ? setFormErrors({
                                                                              ...formErrors,
                                                                              internal: 'Required'
                                                                          })
                                                                        : setFormErrors({
                                                                              ...formErrors,
                                                                              internal: ''
                                                                          })
                                                                }
                                                            />{' '}
                                                            <span style={{ marginRight: '2rem' }}>
                                                                {' '}
                                                                Internal{' '}
                                                            </span>
                                                            {/* External Project Radio */}
                                                            <input
                                                                type="radio"
                                                                label="External"
                                                                value={0}
                                                                checked={isInternal == 0}
                                                                onChange={projectTypeChange}
                                                                onBlur={() =>
                                                                    isInternal == undefined
                                                                        ? setFormErrors({
                                                                              ...formErrors,
                                                                              internal: 'Required'
                                                                          })
                                                                        : setFormErrors({
                                                                              ...formErrors,
                                                                              internal: ''
                                                                          })
                                                                }
                                                            />{' '}
                                                            <span style={{ marginRight: '2rem' }}>
                                                                {' '}
                                                                External{' '}
                                                            </span>
                                                            {/* Show error if project type is not selected */}
                                                            {formErrors && formErrors.internal ? (
                                                                <p className="error">
                                                                    {formErrors.internal}
                                                                </p>
                                                            ) : (
                                                                <></>
                                                            )}
                                                        </Col>
                                                    </Form.Group>
                                                </div>
                                                {/* Client Dropdown - only show if project is External */}
                                                {isInternal == 0 ? (
                                                    <div className="col-">
                                                        <Form.Group className="mb-3" as={Row}>
                                                            <Form.Label column sm={3}>
                                                                Client{' '}
                                                                <span className="error">
                                                                    *
                                                                </span>
                                                            </Form.Label>
                                                            <Col sm={7}>
                                                                <Select
                                                                    required
                                                                    placeholder=""
                                                                    options={options}
                                                                    value={options.filter(
                                                                        (option) =>
                                                                            option.value ==
                                                                            clientSelect
                                                                    )}
                                                                    onBlur={() =>
                                                                        !clientSelect
                                                                            ? setFormErrors({
                                                                                  ...formErrors,
                                                                                  projectClientId:
                                                                                      'Required'
                                                                              })
                                                                            : setFormErrors({
                                                                                  ...formErrors,
                                                                                  projectClientId:
                                                                                      ''
                                                                              })
                                                                    }
                                                                    onChange={handleClientSelection}
                                                                />
                                                                {/* Show error if client not selected */}
                                                                {formErrors &&
                                                                formErrors.projectClientId ? (
                                                                    <p className="error">
                                                                        {formErrors.projectClientId}
                                                                    </p>
                                                                ) : (
                                                                    <></>
                                                                )}
                                                            </Col>
                                                        </Form.Group>
                                                    </div>
                                                ) : (
                                                    <></>
                                                )}

                                                {/* Project Code Input Field */}
                                                <div className="col-">
                                                    <Form.Group className="mb-3" as={Row}>
                                                        <Form.Label column sm={3}>
                                                            Project Code{' '}
                                                            <span className="error">*</span>
                                                        </Form.Label>
                                                        <Col sm={7}>
                                                            <Form.Control
                                                                required
                                                                type="text"
                                                                // as="textarea"
                                                                maxLength={15}
                                                                name="code"
                                                                onBlur={(e) =>
                                                                    !e.target.value
                                                                        ? setFormErrors({
                                                                              ...formErrors,
                                                                              code: 'Required'
                                                                          })
                                                                        : setFormErrors({
                                                                              ...formErrors,
                                                                              code: ''
                                                                          })
                                                                }
                                                                defaultValue={
                                                                    location.state.data
                                                                        ? location.state.data.code
                                                                        : ''
                                                                }
                                                                onChange={onInputChange}
                                                            />
                                                            {/* Show error if project code is missing */}
                                                            {formErrors && formErrors.code ? (
                                                                <p className="error">
                                                                    {formErrors.code}
                                                                </p>
                                                            ) : (
                                                                <></>
                                                            )}
                                                        </Col>
                                                    </Form.Group>
                                                </div>
                                                {/* Project Status Dropdown */}
                                                <div className="col-">
                                                    <Form.Group className="mb-3" as={Row}>
                                                        <Form.Label column sm={3}>
                                                            Project Status{' '}
                                                            <span className="error">*</span>
                                                        </Form.Label>
                                                        <Col sm={7}>
                                                            <Select
                                                                placeholder=""
                                                                options={projectOptions}
                                                                value={projectOptions.filter(
                                                                    (option) =>
                                                                        option.value ==
                                                                        projectSelect
                                                                )}
                                                                onBlur={() =>
                                                                    !projectSelect
                                                                        ? setFormErrors({
                                                                              ...formErrors,
                                                                              projectStatusId:
                                                                                  'Required'
                                                                          })
                                                                        : setFormErrors({
                                                                              ...formErrors,
                                                                              projectStatusId: ''
                                                                          })
                                                                }
                                                                onChange={handleProjectSelection}
                                                            />
                                                            {/* Show error if project status is missing */}
                                                            {formErrors &&
                                                            formErrors.projectStatusId ? (
                                                                <p className="error">
                                                                    {formErrors.projectStatusId}
                                                                </p>
                                                            ) : (
                                                                <></>
                                                            )}
                                                        </Col>
                                                    </Form.Group>
                                                </div>

                                                {/* Description Textarea Field */}
                                                <div className="col-">
                                                    <Form.Group className="mb-3" as={Row}>
                                                        <Form.Label column sm={3}>
                                                            Description{' '}
                                                            <span className="error">*</span>
                                                        </Form.Label>
                                                        <Col sm={7}>
                                                            <Form.Control
                                                                // required
                                                                as="textarea"
                                                                name="description"
                                                                maxLength={5000}
                                                                defaultValue={
                                                                    location.state.data
                                                                        ? location.state.data
                                                                              .description
                                                                        : ''
                                                                }
                                                                onBlur={(e) =>
                                                                    !e.target.value
                                                                        ? setFormErrors({
                                                                              ...formErrors,
                                                                              description:
                                                                                  'Required'
                                                                          })
                                                                        : setFormErrors({
                                                                              ...formErrors,
                                                                              description: ''
                                                                          })
                                                                }
                                                                onChange={onInputChange}
                                                            />
                                                            {formErrors &&
                                                            formErrors.description ? (
                                                                <p className="error">
                                                                    {formErrors.description}
                                                                </p>
                                                            ) : (
                                                                <></>
                                                            )}
                                                        </Col>
                                                    </Form.Group>
                                                </div>
                                                {/* Technology Textarea Field */}
                                                <div className="col-">
                                                    <Form.Group className="mb-3" as={Row}>
                                                        <Form.Label column sm={3}>
                                                            Technology{' '}
                                                            <span className="error">*</span>
                                                        </Form.Label>
                                                        <Col sm={7}>
                                                            <Form.Control
                                                                required
                                                                as="textarea"
                                                                maxLength={1000}
                                                                name="technology"
                                                                onBlur={(e) =>
                                                                    !e.target.value
                                                                        ? setFormErrors({
                                                                              ...formErrors,
                                                                              technology: 'Required'
                                                                          })
                                                                        : setFormErrors({
                                                                              ...formErrors,
                                                                              technology: ''
                                                                          })
                                                                }
                                                                defaultValue={
                                                                    location.state.data
                                                                        ? location.state.data
                                                                              .technology
                                                                        : ''
                                                                }
                                                                onChange={onInputChange}
                                                            />
                                                            {formErrors && formErrors.technology ? (
                                                                <p className="error">
                                                                    {formErrors.technology}
                                                                </p>
                                                            ) : (
                                                                <></>
                                                            )}
                                                        </Col>
                                                    </Form.Group>
                                                </div>

                                                {/* Expected Start Date Field */}
                                                <div className="col-">
                                                    <Form.Group className="mb-3" as={Row}>
                                                        <Form.Label column sm={3}>
                                                            Expected Start Date{' '}
                                                            <span className="error">*</span>
                                                        </Form.Label>
                                                        <Col sm={7}>
                                                            <DatePicker
                                                                inputReadOnly={true}
                                                                placeholder=""
                                                                required
                                                                defaultValue={
                                                                    projectExpectedStartDate != null
                                                                        ? moment(
                                                                              projectExpectedStartDate
                                                                          )
                                                                        : null
                                                                }
                                                                name="projectExpectedStartDate"
                                                                onChange={
                                                                    projectExpectedStartDateChange
                                                                }
                                                                disabledDate={(current) => {
                                                                    const expectedEndDate = moment(
                                                                        projectExpectedEndDate,
                                                                        'YYYY-MM-DD'
                                                                    )
                                                                    const actualStartDate = moment(
                                                                        projectActualStartDate,
                                                                        'YYYY-MM-DD'
                                                                    )
                                                                    return (
                                                                        current &&
                                                                        (current.isAfter(
                                                                            actualStartDate
                                                                        ) ||
                                                                            current.isAfter(
                                                                                expectedEndDate
                                                                            ))
                                                                    )
                                                                }}
                                                                format={'DD-MM-YYYY'}
                                                                className="datepicker"
                                                                onBlur={(e) =>
                                                                    !e.target.value
                                                                        ? setFormErrors({
                                                                              ...formErrors,
                                                                              expectedStartDate:
                                                                                  'Required'
                                                                          })
                                                                        : setFormErrors({
                                                                              ...formErrors,
                                                                              expectedStartDate: ''
                                                                          })
                                                                }
                                                            />
                                                            {formErrors &&
                                                            formErrors.expectedStartDate ? (
                                                                <p className="error">
                                                                    {formErrors.expectedStartDate}
                                                                </p>
                                                            ) : (
                                                                <></>
                                                            )}
                                                        </Col>
                                                    </Form.Group>
                                                </div>

                                                {/* Expected End Date Field */}
                                                <div className="col-">
                                                    <Form.Group className="mb-3" as={Row}>
                                                        <Form.Label column sm={3}>
                                                            Expected End Date
                                                        </Form.Label>
                                                        <Col sm={7}>
                                                            <DatePicker
                                                                inputReadOnly={true}
                                                                defaultValue={
                                                                    projectExpectedEndDate != null
                                                                        ? moment(
                                                                              projectExpectedEndDate
                                                                          )
                                                                        : null
                                                                }
                                                                name="projectExpectedEndDate"
                                                                placeholder={''}
                                                                onChange={
                                                                    projectExpectedEndDateChange
                                                                }
                                                                disabledDate={(current) => {
                                                                    // const expectedStartDate =
                                                                    //     moment(
                                                                    //         projectExpectedStartDate,
                                                                    //         'YYYY-MM-DD'
                                                                    //     )
                                                                    // const actualStartDate = moment(
                                                                    //     projectActualStartDate,
                                                                    //     'YYYY-MM-DD'
                                                                    // )

                                                                    return (
                                                                        current &&
                                                                        current.isBefore(
                                                                            moment().startOf('day')
                                                                        )
                                                                    )
                                                                }}
                                                                format={'DD-MM-YYYY'}
                                                                className="datepicker"
                                                            />
                                                        </Col>
                                                    </Form.Group>
                                                </div>

                                                {/* Actual Start Date Field */}
                                                <div className="col-">
                                                    <Form.Group className="mb-3" as={Row}>
                                                        <Form.Label column sm={3}>
                                                            Actual Start Date
                                                        </Form.Label>
                                                        <Col sm={7}>
                                                            <DatePicker
                                                                inputReadOnly={true}
                                                                defaultValue={
                                                                    projectActualStartDate != null
                                                                        ? moment(
                                                                              projectActualStartDate
                                                                          )
                                                                        : null
                                                                }
                                                                name="projectActualStartDate"
                                                                placeholder={''}
                                                                onChange={
                                                                    projectActualStartDateChange
                                                                }
                                                                format={'DD-MM-YYYY'}
                                                                className="datepicker"
                                                                disabledDate={(current) => {
                                                                    const expectedStartDate =
                                                                        moment(
                                                                            projectExpectedStartDate,
                                                                            'YYYY-MM-DD'
                                                                        )
                                                                    const expectedEndDate = moment(
                                                                        projectExpectedEndDate,
                                                                        'YYYY-MM-DD'
                                                                    )
                                                                    const actualEndDate = moment(
                                                                        projectActualEndDate,
                                                                        'YYYY-MM-DD'
                                                                    )
                                                                    return (
                                                                        current &&
                                                                        (current.isBefore(
                                                                            expectedStartDate
                                                                        ) ||
                                                                            current.isAfter(
                                                                                expectedEndDate
                                                                            ) ||
                                                                            current.isAfter(
                                                                                actualEndDate
                                                                            ))
                                                                    )
                                                                }}
                                                            />
                                                        </Col>
                                                    </Form.Group>
                                                </div>
                                                {/* Actual End Date Field */}
                                                <div className="col-">
                                                    <Form.Group className="mb-3" as={Row}>
                                                        <Form.Label column sm={3}>
                                                            Actual End Date
                                                        </Form.Label>
                                                        <Col sm={7}>
                                                            <DatePicker
                                                                inputReadOnly={true}
                                                                defaultValue={
                                                                    projectActualEndDate != null
                                                                        ? moment(
                                                                              projectActualEndDate
                                                                          )
                                                                        : null
                                                                }
                                                                name="projectActualEndDate"
                                                                placeholder={''}
                                                                onChange={
                                                                    projectActualEndDateChange
                                                                }
                                                                format={'DD-MM-YYYY'}
                                                                className="datepicker"
                                                                disabledDate={(current) => {
                                                                    // const expectedStartDate =
                                                                    //     moment(
                                                                    //         projectExpectedStartDate,
                                                                    //         'YYYY-MM-DD'
                                                                    //     )
                                                                    // const expectedEndDate = moment(
                                                                    //     projectExpectedEndDate,
                                                                    //     'YYYY-MM-DD'
                                                                    // )
                                                                    // const actualStartDate = moment(
                                                                    //     projectActualStartDate,
                                                                    //     'YYYY-MM-DD'
                                                                    // )
                                                                    return (
                                                                        current &&
                                                                        current.isBefore(
                                                                            moment().startOf('day')
                                                                        )
                                                                        // current && (current.isBefore(expectedStartDate) || current.isBefore(actualStartDate))
                                                                    )
                                                                }}
                                                            />
                                                        </Col>
                                                    </Form.Group>
                                                </div>
                                                {/* Project Resource List Component */}
                                                <div className='mb-4'>
                                                    <ProjectResourceList
                                                        projectResources={projectResources}
                                                        setProjectResources={setProjectResources}
                                                        devMode={mode}
                                                        expectedStartDate={projectExpectedStartDate}
                                                        actualStartDate={projectActualStartDate}
                                                        actualEndDate={projectActualEndDate}
                                                        expectedEndDate={projectExpectedEndDate}
                                                        clientId={clientSelect}
                                                    />
                                                </div>
                                                {/* Button Section: Save/Update/Cancel */}
                                                <div className="btnCenter mb-3">
                                                    {mode == 'create' && (
                                                        <Button
                                                            style={{ marginRight: '2%' }}
                                                            type="submit"
                                                            className="Button"
                                                            variant="addbtn"
                                                            onClick={onSaveHandler}
                                                        >
                                                            Save
                                                        </Button>
                                                    )}
                                                    {mode == 'edit' && (
                                                        <Button
                                                            style={{ marginRight: '2%' }}
                                                            className="Button"
                                                            type="submit"
                                                            variant="addbtn"
                                                            onClick={onUpdateHandler}
                                                        >
                                                            Update
                                                        </Button>
                                                    )}
                                                    {/* Cancel Button navigates back to the project list */}
                                                    <Button
                                                        variant="secondary"
                                                        type="button"
                                                        className="Button"
                                                        onClick={() => navigate('/projectList')}
                                                        style={{ marginRight: '2%' }}
                                                    >
                                                        {cancelButtonName}
                                                    </Button>
                                                </div>
                                            </>
                                        ) : (
                                            <></>
                                        )}
                                    </form>
                                    <div></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default Project
