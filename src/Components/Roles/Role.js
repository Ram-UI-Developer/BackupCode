import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import { Button } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import {
    getAllByOrgId,
    save,
    update
} from '../../Common/Services/CommonService'
import PageHeader from '../../Common/CommonComponents/PageHeader'
import { toast } from 'react-toastify'
import Select from 'react-select'
import { cancelButtonName, } from '../../Common/Utilities/Constants'
import {
    handleKeyPress,
    updateValidation
} from '../../Common/CommonComponents/FormControlValidation'
import { ToastError, ToastSuccess } from '../../Common/CommonComponents/ToastCustomized'
import { commonCrudSuccess } from '../../Common/CommonComponents/CustomizedSuccessToastMessages'
import DetailLoader from '../../Common/CommonComponents/Loaders/DetailLoader'

const Role = () => {
    // Get user details from Redux store
    const userDetails = useSelector((state) => state.user.userDetails)
    // State to manage form data (name, description, etc.)
    const [formData, setFormData] = useState({
        preNotification: false
    })
    // State to manage whether the page has fully loaded
    const [pageLoaded, setPageLoaded] = useState(false)
    // Navigation hook from react-router
    const navigate = useNavigate()
    // To access route state (used for edit mode)
    const location = useLocation()
    // Mode could be "edit" or "create"
    const [mode, setMode] = useState('')
    // Target modules/screens assigned to a role
    const [target, setTarget] = useState([])
    // Track form validation errors
    const [formErrors, setFormErrors] = useState({})
    // Role ID for edit mode
    const [selectedId, setSelectedId] = useState('')
    // Entity name used for CRUD APIs
    const entity = 'roles'
    // Modules/screens available for the user
    const [moduleList, setModuleList] = useState(userDetails.modules)
    // Path IDs to be used for checked modules
    const [pathIds, setPathIds] = useState([])
    console.log("pathIds", location.state)
    // State to track which checkboxes are selected
    const [checkedState, setCheckedState] = useState([])
    // Role scope: Global or Local
    const [selectedRadio, setSelectedRadio] = useState('Global')
    // Selected location IDs for local scope
    const [locationSelect, setLocationSelect] = useState([])
    // Whether role has pre-notification permission
    const [prenotification, setPrenotification] = useState(false)
    // Whether role has content creation permission
    const [content, setContent] = useState(false)
    // Role type: Internal or External
    const [roleType, setRoleType] = useState('Internal')
    // List of all locations from backend
    const [locationList, setLocationList] = useState([])
    // All available location IDs (used for global roles)
    const [allLocations, setAllLocations] = useState([])
    const [roleData, setRoleData] = useState({})

    // Handle Save (create new role)
    const onSaveHandler = (e) => {
        e.preventDefault()
        // Collect all selected screen IDs
        const finalPaths = []
        checkedState.map((check, index) => {
            if (check == true) {
                finalPaths.push(index)
            }
        })

        // Prepare object for saving
        const obj = {
            id: selectedId,
            name: formData.name,
            description: formData.description,
            screenIds: finalPaths,
            globalLocal: selectedRadio,
            preNotification: prenotification,
            contentCreator: content,
            locationIds: selectedRadio == 'Global' ? allLocations : locationSelect,
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
            deleted: false,
            type: roleType
        }
        // Validations
        if (!obj.name) {
            setFormErrors(validate(formData))
        } else if (obj.name === 'SuperAdmin') {
            toast.error('This role is already exist...')
        } else if (obj.name === 'AppOwner') {
            toast.error('This role is already exist...')
        } else if (finalPaths.length < 1) {
            setFormErrors(validate(formData))
        } else {
            // Call save API
            setIsLoading(true)
            save({
                entity: entity,
                organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
                body: obj,
                toastSuccessMessage: commonCrudSuccess({ screen: 'Role', operationType: 'save' }),
                screenName: 'Role'
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        ToastSuccess(res.message)
                        setIsLoading(false)
                        navigate('/roleList')
                    }
                })
                .catch((err) => {
                    setIsLoading(false)
                    ToastError(err.message)
                })
        }
    }

    // Handle Update (edit existing role)
    const onUpdateHandler = (e) => {
        e.preventDefault()
        // Collect all selected screen IDs
        const finalPaths = []
        checkedState.map((check, index) => {
            if (check == true) {
                finalPaths.push(index)
            }
        })

        // Prepare object for update
        const obj = {
            id: selectedId,
            name: formData.name,
            description: formData.description,
            screenIds: finalPaths,
            globalLocal: selectedRadio,
            preNotification: prenotification,
            contentCreator: content,
            locationIds: selectedRadio == 'Global' ? allLocations : locationSelect,
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
            deleted: false,
            type: roleType
        }
        // Validations
        if (!obj.name) {
            setFormErrors(validate(formData))
        } else if (obj.name === 'SuperAdmin') {
            toast.error('This role is already exist...')
        } else if (obj.name === 'AppOwner') {
            toast.error('This role is already exist...')
        } else if (finalPaths.length < 1) {
            setFormErrors(validate(formData))
        } else if (updateValidation(roleData, formData)) {
            toast.info('No changes made to update.')
            setIsLoading(false)
        } else {
            // Call update API
            setIsLoading(true)
            update({
                entity: entity,
                organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
                id: selectedId,
                body: obj,
                toastSuccessMessage: commonCrudSuccess({ screen: 'Role', operationType: 'update' }),
                screenName: 'Role'
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        ToastSuccess(res.message)
                        setIsLoading(false)
                        navigate('/roleList')
                    }
                })
                .catch((err) => {
                    ToastError(err.message)
                    setIsLoading(false)
                })
        }
    }

    // Fetch list of locations from backend
    const getLocationList = () => {
        getAllByOrgId({ entity: 'locations', organizationId: userDetails.organizationId })
            .then((res) => {
                setLocationList(res.data) // Set complete location list
                setAllLocations(res.data.map((e) => e.id)) // Set all location IDs
                setIsLoading(false)
            })
            .catch(() => {
                setIsLoading(false)
            })
    }

    // Update location selection state
    const handleLocationSelection = (selection) => {
        setLocationSelect(selection)
    }

    // Format locations into dropdown options
    const options =
        locationList &&
        locationList.map((option) => ({
            value: option.id,
            label: option.name
        }))

    // Toggles selection of all screens under a module
    const toggleSelectAll = (e) => {
        const pathsSelect = checkedState
        const pathIdsMod = [] // stores screen IDs under selected module
        const moduleSelect = target // stores module selection status
        const finalPaths = [] // final selected paths
        // Iterate over module list
        moduleList.map((module) => {
            if (moduleSelect[module.id] == true || module.id == e.target.id) {
                if (module.screenDTOs.length > 0) {
                    module.screenDTOs.map((path) => {
                        // If current module is selected one, push its screen IDs to pathIdsMod
                        if (module.id == e.target.id) {
                            pathIdsMod.push(path.id)
                        } else {
                            // If already selected, add to finalPaths
                            finalPaths.push(path.id)
                        }
                    })
                }
            }
        })

        if (e.target.checked == true) {
            // Sets module id as true when checked
            moduleSelect[e.target.id] = true
            pathsSelect.map((path, index) => {
                pathIdsMod.forEach((mod) => {
                    if (index == mod) {
                        pathsSelect[index] = true
                        finalPaths.push(index)
                    }
                })
            })
        } else {
            // Sets module id as false when unchecked
            moduleSelect[e.target.id] = false
            pathsSelect.map((path, index) => {
                pathIdsMod.forEach((mod) => {
                    if (index == mod) {
                        pathsSelect[index] = false
                    }
                })
            })
        }
        setTarget(moduleSelect)
        setCheckedState([...pathsSelect])
        setFormData({ ...formData, finalPaths: finalPaths })
    }

    // Runs once on component mount
    useEffect(() => {
        if (location.state && location.state.id == null) {
            setMode('create') // If no ID, mode is create
        } else {
            // Edit mode: Set values from location state
            setFormData(location.state && location.state.data)
            setRoleData(location.state && location.state.data)
            setMode('edit')
            setSelectedId(location.state && location.state.data.id)
            setAllLocations(
                location.state && location.state.data && location.state.data.allLocations
            )
            setLocationSelect(location.state && location.state.data.locationIds)
            setSelectedRadio(location.state && location.state.data.globalLocal)
            setRoleType(location.state && location.state.data.type)
            setPathIds(location.state && location.state.data.screenIds)
            setPrenotification(location.state && location.state.data.preNotification)
            setContent(location.state && location.state.data.contentCreator)
        }
        setIsLoading(true)
        getModuleList()
        getLocationList()
    }, [])

    const [isLoading, setIsLoading] = useState(false)

    // Fetch modules for organization
    const getModuleList = () => {
        getAllByOrgId({ entity: 'modules', organizationId: userDetails.organizationId })
            .then((res) => {
                if (res.statusCode == 200) {
                    // Flatten the menuDTOs and set filtered modules
                    setModuleList(
                        res.data.flatMap((org) => org && org.menuDTOs).filter((e) => e != null)
                    )
                }
            })
            .catch(() => {
                setIsLoading(false)
            })
    }

    // Handles radio button change
    const handleRadioChange = (value) => {
        setSelectedRadio(value)
        setFormData((prev) => ({ ...prev, type: value }))
    }

    // Handles role type dropdown change
    const handleRoleTypeChange = (value) => {
        setRoleType(value)
        setFormData((prev) => ({ ...prev, type: value }))
    }

    // Run checkedValueHandler when pathIds or moduleList change
    useEffect(() => {
        checkedValueHandler()
    }, [pathIds, moduleList])

    // Sets checked state for each screen and module
    const checkedValueHandler = () => {
        let stateForCheck = []
        let modulesState = []
        const modules = moduleList
        modules &&
            modules.map((module) => {
                const counter = module.screenDTOs.length
                let actualCounter = 0
                module.screenDTOs.map((path) => {
                    const filteredPaths = pathIds ? pathIds.filter((p) => p == path.id) : []
                    if (filteredPaths.length > 0) {
                        let key = filteredPaths[0]
                        stateForCheck[key] = true
                        path['selected'] = true
                        actualCounter++
                    } else {
                        stateForCheck[path.id] = false
                        path['selected'] = false
                    }
                })

                // If all screens are selected, mark module as selected
                if (counter == actualCounter) {
                    modulesState[module.id] = true
                } else {
                    modulesState[module.id] = false
                }
            })
        setCheckedState(stateForCheck)
        setTarget(modulesState)
        setModuleList(modules)
        setPageLoaded(true)
    }

    // Handles input change for form fields
    const onInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value.trimStart().replace(/\s+/g, ' ')
        })
    }

    // Handles change for pre-notification checkbox
    const handlePrenotificationChange = (e) => {
        const checked = e.target.checked
        setPrenotification(checked)
        setFormData((prev) => ({ ...prev, preNotification: checked }))
    }

    
    // #1749: Fixes finalPaths error message not clearing when paths are selected
    useEffect(() => {
        if (formData.finalPaths && formData.finalPaths.length > 0) {
            setFormErrors({ ...formErrors, finalPaths: '' })
        }
    }, [formData.finalPaths])

    // Handles screen selection toggle within a module
    const handleOnChange = (e, moduleId) => {
        const selectedId = Math.floor(e.target.id)
        const newvalue = e.target.checked

        let stateForCheck = checkedState

        const finalPaths = []
        const moduleSelectState = target
        const modules = moduleList
        modules &&
            modules.map((module) => {
                if (module.id == moduleId) {
                    const counter = module.screenDTOs.length
                    let actualCounter = 0
                    module.screenDTOs.map((path) => {
                        if (path.id == selectedId) {
                            if (newvalue == true) {
                                stateForCheck[path.id] = true
                                path['selected'] = true
                                actualCounter++
                                finalPaths.push(path.id)
                            } else {
                                stateForCheck[path.id] = false
                                path['selected'] = false
                                actualCounter--
                            }
                        } else if (path.selected == true) {
                            actualCounter++
                            finalPaths.push(path.id)
                        }
                    })
                    // Mark module as selected if all screens selected
                    if (counter == actualCounter) {
                        moduleSelectState[module.id] = true
                    } else {
                        moduleSelectState[module.id] = false
                    }
                }
            })

        setCheckedState(stateForCheck)

        setFormData({ ...formData, finalPaths: finalPaths })
        setModuleList(modules)
        setTarget(moduleSelectState)
    }

    // Validates form values
    const validate = (values) => {
        const errors = {}
        if (!values.name) {
            errors.name = 'Required'
        }

        if (!values.finalPaths || values.finalPaths.length <= 0) {
            errors.finalPaths = 'Paths Required'
        }

        return errors
    }
 

    return (
        <>
            {/* Main container */}
            <div>
                <section className="section detailBackground">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="">
                                    {/* Header title depending on mode */}
                                    <PageHeader
                                        pageTitle={mode == 'create' ? 'Add Role' : 'Update Role'}
                                    />
                                    {/* Show loading spinner if data is loading */}
                                    {isLoading ? <DetailLoader /> : ''}
                                    {/* Main form container */}
                                    <div
                                        className="center"
                                        style={{ paddingLeft: '10%', paddingRight: '10%' }}
                                    >
                                        <form className="card-body">
                                            {/* Name input field */}
                                            <div className="col-">
                                                <Form.Group className="mb-3" as={Row}>
                                                    <Form.Label column sm={4}>
                                                        Name <span className="error">*</span>
                                                    </Form.Label>
                                                    <Col sm={7}>
                                                        <Form.Control
                                                            required
                                                            type="text"
                                                            name="name"
                                                            defaultValue={
                                                                location.state.data
                                                                    ? location.state.data.name
                                                                    : ''
                                                            }
                                                            onChange={onInputChange}
                                                            value={formData.name}
                                                            maxLength={32}
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
                                                        {/* Show validation error for name */}
                                                        {formErrors.name && (
                                                            <p className="error">
                                                                {formErrors.name}
                                                            </p>
                                                        )}
                                                    </Col>
                                                </Form.Group>
                                            </div>

                                            <div className="col-">
                                                <Form.Group className="mb-3" as={Row}>
                                                    <Form.Label column sm={4}>
                                                        Description
                                                    </Form.Label>
                                                    <Col sm={7}>
                                                        <Form.Control
                                                            required
                                                            type="text"
                                                            name="description"
                                                            defaultValue={
                                                                location.state.data
                                                                    ? location.state.data
                                                                          .description
                                                                    : ''
                                                            }
                                                            onChange={onInputChange}
                                                            value={formData.description}
                                                            maxLength={150}
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
                                                        {formErrors.description && (
                                                            <p className="error">
                                                                {formErrors.description}
                                                            </p>
                                                        )}
                                                    </Col>
                                                </Form.Group>
                                            </div>

                                            <div className="col-">
                                                <Form.Group className="mb-3" as={Row}>
                                                    <Form.Label column sm={4}>
                                                        Type <span className="error">*</span>
                                                    </Form.Label>
                                                    <Col sm={7}>
                                                        <div className="radioAlign">
                                                            <input
                                                                type="radio"
                                                                value="Internal"
                                                                checked={roleType === 'Internal'}
                                                                onChange={() =>
                                                                    handleRoleTypeChange('Internal')
                                                                }
                                                            />
                                                            &ensp;
                                                            <span>Internal</span>&emsp;&ensp;
                                                            {/* <br /> */}
                                                            <input
                                                                type="radio"
                                                                value="External"
                                                                checked={roleType === 'External'}
                                                                onChange={() =>
                                                                    handleRoleTypeChange('External')
                                                                }
                                                            />
                                                            &ensp;
                                                            <span>External</span>
                                                        </div>
                                                    </Col>
                                                </Form.Group>
                                            </div>

                                            <div className="col-">
                                                <Form.Group className="mb-3" as={Row}>
                                                    <Form.Label column sm={4}>
                                                        {' '}
                                                        Accessible Locations
                                                    </Form.Label>
                                                    <Col sm={7}>
                                                        <div>
                                                            <input
                                                                type="radio"
                                                                value="Global"
                                                                checked={selectedRadio === 'Global'}
                                                                onChange={() =>
                                                                    handleRadioChange('Global')
                                                                }
                                                            />
                                                            &ensp;
                                                            <span>All</span>&emsp;&ensp;
                                                            {/* <br /> */}
                                                            <input
                                                                type="radio"
                                                                value="Local"
                                                                checked={selectedRadio === 'Local'}
                                                                onChange={() =>
                                                                    handleRadioChange('Local')
                                                                }
                                                            />
                                                            &ensp;
                                                            <span>Specific</span>
                                                            {selectedRadio === 'Local' && (
                                                                <div>
                                                                    {/* Render your select tab content here */}
                                                                    <Select
                                                                        className="dropdown"
                                                                        options={options}
                                                                        value={
                                                                            options &&
                                                                            options.filter(
                                                                                (elem) => {
                                                                                    return locationSelect.some(
                                                                                        (ele) => {
                                                                                            return (
                                                                                                ele ==
                                                                                                elem.value
                                                                                            )
                                                                                        }
                                                                                    )
                                                                                }
                                                                            )
                                                                        }
                                                                        onChange={(e) =>
                                                                            handleLocationSelection(
                                                                                e.map(
                                                                                    (e) => e.value
                                                                                )
                                                                            )
                                                                        }
                                                                        isMulti={true}
                                                                        isClearable
                                                                    />
                                                                    <p className="error">
                                                                        {formErrors &&
                                                                            formErrors.locationIds}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </Col>
                                                </Form.Group>
                                            </div>
                                            <div className="col-">
                                                <Form.Group className="mb-3" as={Row}>
                                                    <Form.Label column sm={4}>
                                                        Recieves Pre-Notification Emails?
                                                    </Form.Label>
                                                    <Col sm={7}>
                                                        <input
                                                            value="prenotification"
                                                            type="checkbox"
                                                            checked={prenotification}
                                                            onChange={handlePrenotificationChange}
                                                        />
                                                    </Col>
                                                </Form.Group>
                                            </div>

                                            {pageLoaded ? (
                                                <div className="col-">
                                                    <Form.Group>
                                                        <Form.Label>
                                                            Permissions{' '}
                                                            <span className="error">*</span>
                                                        </Form.Label>
                                                        <br />
                                                        <>
                                                            {moduleList &&
                                                                moduleList.map((module) => (
                                                                    <>
                                                                        <p>
                                                                            <input
                                                                                className="radioAlign"
                                                                                type="checkbox"
                                                                                id={module.id}
                                                                                checked={
                                                                                    target
                                                                                        ? target[
                                                                                              module
                                                                                                  .id
                                                                                          ]
                                                                                        : false
                                                                                }
                                                                                onChange={(e) =>
                                                                                    toggleSelectAll(
                                                                                        e
                                                                                    )
                                                                                }
                                                                            />
                                                                            <span
                                                                                style={{
                                                                                    marginLeft:
                                                                                        '1em'
                                                                                }}
                                                                            >
                                                                                <strong>
                                                                                    {module.name}
                                                                                </strong>
                                                                            </span>
                                                                        </p>

                                                                        <div className="paths-container mb-4">
                                                                            {module.screenDTOs.map(
                                                                                (path) => (
                                                                                    <div
                                                                                        key={
                                                                                            path.id
                                                                                        }
                                                                                        className="path-item"
                                                                                    >
                                                                                        <input
                                                                                            type="checkbox"
                                                                                            id={
                                                                                                path.id
                                                                                            }
                                                                                            name={
                                                                                                path.name
                                                                                            }
                                                                                            value={
                                                                                                path.name
                                                                                            }
                                                                                            checked={
                                                                                                checkedState
                                                                                                    ? checkedState[
                                                                                                          path
                                                                                                              .id
                                                                                                      ]
                                                                                                    : false
                                                                                            }
                                                                                            onChange={(
                                                                                                e
                                                                                            ) =>
                                                                                                handleOnChange(
                                                                                                    e,
                                                                                                    module.id
                                                                                                )
                                                                                            }
                                                                                        />
                                                                                        <span
                                                                                            style={{
                                                                                                marginLeft:
                                                                                                    '0.5em'
                                                                                            }}
                                                                                            htmlFor={
                                                                                                path.id
                                                                                            }
                                                                                        >
                                                                                            {' '}
                                                                                            {
                                                                                                path.name
                                                                                            }
                                                                                        </span>
                                                                                    </div>
                                                                                )
                                                                            )}
                                                                        </div>
                                                                    </>
                                                                ))}
                                                        </>
                                                        <p className="error">
                                                            {formErrors.finalPaths}
                                                        </p>
                                                    </Form.Group>
                                                </div>
                                            ) : (
                                                <></>
                                            )}

                                            {/* Save / Update / Cancel buttons */}

                                            <div className="btnCenter mb-3">
                                                {mode == 'create' && (
                                                    <Button
                                                        style={{ marginRight: '2%' }}
                                                        className="Button"
                                                        type="button"
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
                                                        type="button"
                                                        variant="addbtn"
                                                        onClick={onUpdateHandler}
                                                    >
                                                        Update
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="secondary"
                                                    type="button"
                                                    className="Button"
                                                    onClick={() => navigate('/roleList')}
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
        </>
    )
}

export default Role
