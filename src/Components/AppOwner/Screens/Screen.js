import React, { useEffect, useState } from 'react'
import { Accordion, Modal } from 'react-bootstrap'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { formatCurrency } from '../../../Common/CommonComponents/CurrencyFormate'
import { commonCrudSuccess } from '../../../Common/CommonComponents/CustomizedSuccessToastMessages'
import {
    updateValidation
} from '../../../Common/CommonComponents/FormControlValidation'
import Loader from '../../../Common/CommonComponents/Loader'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import { ToastError, ToastSuccess } from '../../../Common/CommonComponents/ToastCustomized'
import { CancelIcon, ChangeIcon } from '../../../Common/CommonIcons/CommonIcons'
import {
    getAll,
    getByIdwithOutOrg,
    SaveWithFileWithoutOrg,
    updateWithoutOrgFile
} from '../../../Common/Services/CommonService'
import { cancelButtonName, themeColor } from '../../../Common/Utilities/Constants'
import PriceHistory from './PriceHistory'

const Screen = () => {
    const [formData, setFormData] = useState('') // State for Form data to add or update screen
    const [endpointList, setEndpointList] = useState([]) // State for endpoints
    const [formErrors, setFormErrors] = useState({}) // State for handling errors
    const [priceHistory, setPriceHistory] = useState([]) // State for price history list
    const [loading, setLoading] = useState(true) // State for loader
    const [screen, setScreen] = useState({}) // State for screen data

    const controllerNames = [...new Set(endpointList.map((e) => e.controllerName))]

    const screenId = useLocation().state // get data form list screen
    const navigate = useNavigate() // declire navigation

    // Fetch endpoints and screen By Id on component mount
    useEffect(() => {
        onGetEndpointsHandler()
        if (screenId && screenId.id) {
            setLoading(true)
            onGetScreenByIdHandler()
        } else {
            setLoading(false)
        }
    }, [])

    const [showLogo, setShowLogo] = useState(false) // State for Logo modal
    const [priceShow, setPriceShow] = useState(false) // State for Price modal
    const [icon, setIcon] = useState(null) // State for icon
    const [iconFile, setIconFile] = useState(null)

    const [endpointIds, setEndpointIds] = useState([]) // State for all endpoints

    // Close all modals
    const handleClose = () => {
        setShowLogo(false)
        setIcon(icon ? icon : null)
        setIconFile(null)
        setFormErrors({})
        setPriceShow(false)
    }

    // change the icon by on change
    const handleFileSelect = (e) => {
        if (e.target.files.length > 0 && e.target.files[0].size > 10240) {
            setFormErrors({ ...formErrors, fileType: 'File size should not exceed more than 10kb' })
            setIcon(icon ? icon : null)
            setIconFile(null)
        } else {
            setFormErrors({ ...formErrors, fileType: '' })
            setIcon(e.target.files[0])
            setIconFile(e.target.files[0])
        }
    }
    // open logo modal
    const handleFileUpload = () => {
        if (iconFile && iconFile.type != 'image/png') {
            setFormErrors({ ...formErrors, fileType: 'Please select png file' })
        } else {
            setShowLogo(false)
        }
    }
    // onchange for input text
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
        setFormErrors({ ...formErrors, [name]: '' }) // Clear error for the field being edited
    }
    const [sortedControllerNames, setSortedControllerNames] = useState([]) // Start for Shorted countroller names
    const [controllerOrderChanged, setControllerOrderChanged] = useState(false) // State for re arranged order
    // select endpoints
    const handleCheckboxChange = (event) => {
        const { id, checked } = event.target
        setEndpointIds((prevIds) =>
            checked ? [...prevIds, Number(id)] : prevIds.filter((item) => item !== Number(id))
        )
    }

    // handling selected header
    const handleControllerHeader = (controllerName) => {
        return endpointList.some(
            (item) => item.controllerName === controllerName && endpointIds.includes(item.id)
        )
    }

    // function for selecte screen count
    const getSelectedCount = (controllerName) => {
        return endpointList.filter(
            (item) => item.controllerName === controllerName && endpointIds.includes(item.id)
        ).length
    }

    const [openItems, setOpenItems] = useState(null) // Track open state for each item

    const handleToggle = (itemName) => {
        setOpenItems((prevState) => {
            const newState = prevState === itemName ? null : itemName
            setControllerOrderChanged(true) // Mark that header has been toggled
            return newState
        })
    }

    // reorder by selected endpoints
    const updateControllerOrder = () => {
        const sorted = controllerNames.sort((a, b) => {
            const selectedA = endpointList.filter(
                (item) => item.controllerName === a && endpointIds.includes(item.id)
            ).length
            const selectedB = endpointList.filter(
                (item) => item.controllerName === b && endpointIds.includes(item.id)
            ).length

            return selectedB - selectedA // Sort by selected count (descending)
        })
        setSortedControllerNames(sorted)
    }

    useEffect(() => {
        if (controllerOrderChanged) {
            updateControllerOrder() // Update the order based on selected items
            setControllerOrderChanged(false) // Reset flag
        }
    }, [controllerOrderChanged, endpointIds]) // Recalculate the order if checkbox state changes

    // Initialize controller order when the component is mounted or updated
    useEffect(() => {
        updateControllerOrder() // Initial sorting when data is loaded or updated
    }, [endpointList, loading])

    let filterData = endpointList.filter((item) => endpointIds && endpointIds.includes(item.id))

    // get Endpoints
    const onGetEndpointsHandler = () => {
        getAll({ entity: 'endpoints' }).then((res) => {
            if (res.statusCode == 200) {
                setEndpointList(res.data)
            }
        })
        .catch(() => {
            setEndpointList([])
            setLoading(false)
        })
    }

    // Save screen using Api
    const onSubmitHandler = (e) => {
        e.preventDefault()
        const obj = {
            id: screenId && screenId.id,
            name: formData.name,
            path: formData.path,
            endpoints: endpointIds,
            priceDTOs: priceHistory
        }
        if (!obj.name) {
            setFormErrors(validate(obj))
        } else if (!obj.path) {
            setFormErrors(validate(obj))
        } else if (endpointIds.length <= 0) {
            setFormErrors(validate(obj))
        } else if (priceHistory.length <= 0) {
            toast.error('Please enter price')
        } else {
            setLoading(true)
            let screenData = new FormData()
            iconFile && screenData.append('file', iconFile)
            screenData.append('screenDTO', JSON.stringify(obj))
            SaveWithFileWithoutOrg({
                entity: 'screens',
                body: screenData,
                toastSuccessMessage: commonCrudSuccess({ screen: 'Screen', operationType: 'save' }),
                screenName: 'Screen'
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        ToastSuccess(res.message)
                        navigate('/screenList')
                    }
                })
                .catch((err) => {
                    setLoading(false)
                    ToastError(err.message)
                })
        }
    }

    // Update Screen using Api
    const onUpdateHandler = (e) => {
        e.preventDefault()
        const obj =
            iconFile != null
                ? {
                      id: screenId && screenId.id,
                      name: formData.name,
                      path: formData.path,
                      endpoints: endpointIds,
                      priceDTOs: priceHistory
                  }
                : {
                      id: screenId && screenId.id,
                      name: formData.name,
                      path: formData.path,
                      endpoints: endpointIds,
                      fileName: formData.fileName,
                      fileType: formData.fileType,
                      icon: formData.icon,
                      priceDTOs: priceHistory
                  }
        if (
            updateValidation(screen, formData) &&
            screen.priceDTOs.length == priceHistory.length &&
            screen.endpoints.length == endpointIds.length &&
            iconFile == null
        ) {
            toast.info('No changes made to update')
        } else if (!obj.name) {
            setFormErrors(validate(obj))
        } else if (!obj.path) {
            setFormErrors(validate(obj))
        } else if (endpointIds.length <= 0) {
            setFormErrors(validate(obj))
        } else if (priceHistory.length <= 0) {
            toast.error('Please enter price')
        } else {
            setLoading(true)
            let screenData = new FormData()
            iconFile && screenData.append('file', iconFile)
            screenData.append('screenDTO', JSON.stringify(obj))
            updateWithoutOrgFile({
                entity: 'screens',
                id: screenId && screenId.id,
                body: screenData,
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Screen',
                    operationType: 'update'
                }),
                screenName: 'Screen'
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        // toast.success("Screen details saved successfully.")
                        ToastSuccess(res.message)
                        navigate('/screenList')
                    }
                })
                .catch((err) => {
                    setLoading(false)
                    ToastError(err.message)
                })
        }
    }

    // Basic form validation
    const validate = (values) => {
        const errors = {}

        if (!values.name || values.name.length < 0 || values.name == undefined) {
            errors.name = 'Required'
        }
        if (!values.path || values.path.length < 0 || values.path == undefined) {
            errors.path = 'Required'
        }
        if (endpointIds.length <= 0) {
            errors.endpointError = 'Required'
        }

        if (iconFile && iconFile.type != 'image/png') {
            errors.fileType = 'Please Select png file'
        }
        return errors
    }

    // Get screen data By Id
    const onGetScreenByIdHandler = () => {
        getByIdwithOutOrg({ entity: 'screens', id: screenId && screenId.id })
            .then((res) => {
                if (res.statusCode == 200) {
                    setEndpointIds(res.data.endpoints)
                    setFormData(res.data)
                    setScreen(res.data)
                    setIcon(res.data && res.data.icon)
                    setPriceHistory(res.data && res.data.priceDTOs)
                }
                setLoading(false)
            })
            .catch(() => {
                setLoading(false)
            })
    }

    // Remove the selected endpoint
    const deleteUrlHandler = (id) => {
        setEndpointIds(endpointIds.filter((e) => e !== id))
    }

    return (
        <>
            {loading ? <DetailLoader /> : ''}
            <section className="section detailBackground">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="">
                                <PageHeader
                                    pageTitle={
                                        screenId && screenId.id ? 'Update Screen' : 'Add Screen'
                                    }
                                />
                                <div style={{ marginTop: '2%' }}></div>
                                <form onSubmit={onSubmitHandler}>
                                    <div className="container">
                                        <div className="row" style={{ marginLeft: '2%' }}>
                                            <div class="col-11">
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-3"
                                                    controlId="formGroupToDate"
                                                >
                                                    <Form.Label
                                                        className="fieldLable"
                                                        column
                                                        md={3}
                                                    >
                                                        Screen Name <span className="error">*</span>
                                                    </Form.Label>
                                                    <Col md={9}>
                                                        <Form.Control
                                                            className="textField"
                                                            defaultValue={formData.name}
                                                            onChange={handleInputChange}
                                                            name="name"
                                                            type="text"
                                                            // onKeyPress={(e) => handleKeyPress(e, setFormErrors)}
                                                            // onPaste={(e) => handleKeyPress(e, setFormErrors)}
                                                            // onInput={(e) => handleKeyPress(e, setFormErrors)}
                                                            maxLength={50}
                                                        />
                                                        {formErrors.name && (
                                                            <p className="error">
                                                                {formErrors.name}
                                                            </p>
                                                        )}
                                                    </Col>
                                                </Form.Group>
                                            </div>
                                            <div class="col-11">
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-3"
                                                    controlId="formGroupToDate"
                                                >
                                                    <Form.Label
                                                        className="fieldLable"
                                                        column
                                                        md={3}
                                                    >
                                                        Path Name <span className="error">*</span>
                                                    </Form.Label>
                                                    <Col md={9}>
                                                        <Form.Control
                                                            className="textField"
                                                            defaultValue={formData.path}
                                                            onChange={handleInputChange}
                                                            name="path"
                                                            type="text"
                                                            maxLength={50}
                                                        />
                                                        {formErrors.path && (
                                                            <p className="error">
                                                                {formErrors.path}
                                                            </p>
                                                        )}
                                                    </Col>
                                                </Form.Group>
                                            </div>
                                            <div class="col-11">
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-3"
                                                    controlId="formGroupToDate"
                                                >
                                                    <Form.Label
                                                        className="fieldLable"
                                                        column
                                                        md={3}
                                                    >
                                                        Price <span className="error">*</span>
                                                    </Form.Label>
                                                    <Col md={9} style={{ marginTop: '10px' }}>
                                                        {priceHistory == null ||
                                                        priceHistory.length <= 0 ? (
                                                            <> &#8377; 0 </>
                                                        ) : (
                                                            <>
                                                                {' '}
                                                                {formatCurrency(
                                                                    priceHistory[0]['price'],
                                                                    'INR'
                                                                )}{' '}
                                                            </>
                                                        )}
                                                        <span>
                                                            <a
                                                                className=""
                                                                style={{ fontWeight: '600' }}
                                                                onClick={() => setPriceShow(true)}
                                                            >
                                                                <ChangeIcon />
                                                            </a>
                                                        </span>
                                                    </Col>
                                                </Form.Group>
                                            </div>
                                            <div class="col-11">
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-3"
                                                    controlId="formGroupToDate"
                                                >
                                                    <Form.Label
                                                        className="fieldLable"
                                                        column
                                                        md={3}
                                                    >
                                                        Screen Icon
                                                    </Form.Label>
                                                    <Col md={8}>
                                                        <div className="d-flex align-items-center">
                                                            <div
                                                                className="d-flex justify-content-center align-items-center "
                                                                style={{
                                                                    height: '70px',
                                                                    width: '70px',
                                                                    border: '1px #999999 dashed',
                                                                    backgroundColor: icon
                                                                        ? '#004aad'
                                                                        : ''
                                                                }}
                                                            >
                                                                <img
                                                                    src={
                                                                        icon &&
                                                                        typeof icon !== 'string'
                                                                            ? URL.createObjectURL(
                                                                                  icon
                                                                              )
                                                                            : screenId &&
                                                                                screenId.id !==
                                                                                    null &&
                                                                                formData.icon
                                                                              ? `data:image/jpeg;base64,${formData.icon}`
                                                                              : '/dist/Images/add-photo.png'
                                                                    }
                                                                    style={{ height: '20px' }}
                                                                    alt="Logo"
                                                                    onClick={() =>
                                                                        setShowLogo(true)
                                                                    }
                                                                    type="button"
                                                                />
                                                            </div>
                                                            <div style={{ paddingLeft: '6px' }}>
                                                                <a
                                                                    className=""
                                                                    style={{ fontWeight: '600' }}
                                                                    onClick={() =>
                                                                        setShowLogo(true)
                                                                    }
                                                                >
                                                                    <ChangeIcon />
                                                                </a>
                                                            </div>
                                                        </div>
                                                        {formErrors.icon && (
                                                            <p className="error">
                                                                {formErrors.icon}
                                                            </p>
                                                        )}
                                                    </Col>
                                                </Form.Group>
                                            </div>
                                            <div class="col-11">
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-4"
                                                    controlId="formGroupToDate"
                                                >
                                                    <Form.Label
                                                        className="fieldLable"
                                                        column
                                                        md={3}
                                                    >
                                                        Endpoints <span className="error">*</span>
                                                    </Form.Label>
                                                    {loading ? (
                                                        <Col md={8}>
                                                            <Loader />
                                                        </Col>
                                                    ) : (
                                                        <Col md={9}>
                                                            <div
                                                                style={{
                                                                    display: 'flex',
                                                                    flexWrap: 'wrap',
                                                                    gap: '5px'
                                                                }}
                                                            >
                                                                {filterData.map((e) => (
                                                                    <div
                                                                        key={e.id}
                                                                        style={{ display: 'flex' }}
                                                                    >
                                                                        <span className="borederForFilterData ">
                                                                            <span>
                                                                                {e.url}
                                                                                &ensp;
                                                                            </span>
                                                                            <span
                                                                                className="error"
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    deleteUrlHandler(
                                                                                        e.id
                                                                                    )
                                                                                }
                                                                            >
                                                                                <CancelIcon />
                                                                            </span>
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <div id="custom-accordion-container">
                                                                <Accordion
                                                                    className=""
                                                                    style={{
                                                                        backgroundColor:
                                                                            'transparent',
                                                                        marginTop: '1rem'
                                                                    }}
                                                                >
                                                                    {sortedControllerNames.map(
                                                                        (name, index) => (
                                                                            <>
                                                                                <Accordion.Item
                                                                                    eventKey={`module${index}`}
                                                                                    key={name}
                                                                                >
                                                                                    <Accordion.Header
                                                                                        onClick={() =>
                                                                                            handleToggle(
                                                                                                name
                                                                                            )
                                                                                        }
                                                                                        style={{
                                                                                            backgroundColor:
                                                                                                handleControllerHeader(
                                                                                                    name
                                                                                                )
                                                                                                    ? themeColor
                                                                                                    : '',
                                                                                            borderRadius:
                                                                                                '5px',
                                                                                            backgroundImage:
                                                                                                'none',
                                                                                            border: handleControllerHeader(
                                                                                                name
                                                                                            )
                                                                                                ? ''
                                                                                                : '2px solid #004aad'
                                                                                        }}
                                                                                        className="mb-1"
                                                                                    >
                                                                                        &ensp;
                                                                                        <span
                                                                                            onClick={() =>
                                                                                                handleToggle(
                                                                                                    name
                                                                                                )
                                                                                            }
                                                                                            className={
                                                                                                handleControllerHeader(
                                                                                                    name
                                                                                                )
                                                                                                    ? 'menuToggle'
                                                                                                    : 'menuController'
                                                                                            }
                                                                                            style={{
                                                                                                marginTop:
                                                                                                    '5px'
                                                                                            }}
                                                                                        >
                                                                                            {name}
                                                                                        </span>
                                                                                        <span
                                                                                            onClick={() =>
                                                                                                handleToggle(
                                                                                                    name
                                                                                                )
                                                                                            }
                                                                                            style={{
                                                                                                left: '83%',
                                                                                                position:
                                                                                                    'absolute',
                                                                                                marginTop:
                                                                                                    '5px'
                                                                                            }}
                                                                                            className={
                                                                                                handleControllerHeader(
                                                                                                    name
                                                                                                )
                                                                                                    ? ' menuToggle'
                                                                                                    : 'menuController'
                                                                                            }
                                                                                        >
                                                                                            {getSelectedCount(
                                                                                                name
                                                                                            )
                                                                                                ? getSelectedCount(
                                                                                                      name
                                                                                                  ) +
                                                                                                  ' ' +
                                                                                                  'Selected'
                                                                                                : ''}
                                                                                        </span>
                                                                                        {getSelectedCount(
                                                                                            name
                                                                                        ) ? (
                                                                                            <span
                                                                                                onClick={() =>
                                                                                                    handleToggle(
                                                                                                        name
                                                                                                    )
                                                                                                }
                                                                                                style={{
                                                                                                    left: '95%',
                                                                                                    position:
                                                                                                        'absolute',
                                                                                                    transform:
                                                                                                        openItems ===
                                                                                                        name
                                                                                                            ? 'rotate(180deg)'
                                                                                                            : 'rotate(0deg)',
                                                                                                    transition:
                                                                                                        'transform 0.3s ease',
                                                                                                    marginTop:
                                                                                                        '5px'
                                                                                                }}
                                                                                            >
                                                                                                <img
                                                                                                    onClick={() =>
                                                                                                        handleToggle(
                                                                                                            name
                                                                                                        )
                                                                                                    }
                                                                                                    src="/dist/OceanImages/whiteArrow.png"
                                                                                                    height="7px"
                                                                                                    alt=""
                                                                                                />
                                                                                            </span>
                                                                                        ) : (
                                                                                            <span
                                                                                                onClick={() =>
                                                                                                    handleToggle(
                                                                                                        name
                                                                                                    )
                                                                                                }
                                                                                                style={{
                                                                                                    left: '95%',
                                                                                                    position:
                                                                                                        'absolute',
                                                                                                    transform:
                                                                                                        openItems ===
                                                                                                        name
                                                                                                            ? 'rotate(180deg)'
                                                                                                            : 'rotate(0deg)',
                                                                                                    transition:
                                                                                                        'transform 0.3s ease',
                                                                                                    marginTop:
                                                                                                        '5px'
                                                                                                }}
                                                                                            >
                                                                                                <img
                                                                                                    onClick={() =>
                                                                                                        handleToggle(
                                                                                                            name
                                                                                                        )
                                                                                                    }
                                                                                                    src="/dist/OceanImages/blueArrow.png"
                                                                                                    height="7px"
                                                                                                    alt=""
                                                                                                />
                                                                                            </span>
                                                                                        )}
                                                                                    </Accordion.Header>
                                                                                    <Accordion.Body>
                                                                                        {endpointList
                                                                                            .filter(
                                                                                                (
                                                                                                    e
                                                                                                ) =>
                                                                                                    e.controllerName ==
                                                                                                    name
                                                                                            )
                                                                                            .map(
                                                                                                (
                                                                                                    item
                                                                                                ) => (
                                                                                                    <>
                                                                                                        <div
                                                                                                            className="mb-2"
                                                                                                            key={
                                                                                                                item.id
                                                                                                            }
                                                                                                        >
                                                                                                            <input
                                                                                                                type="checkbox"
                                                                                                                style={{
                                                                                                                    marginLeft:
                                                                                                                        '4%'
                                                                                                                }}
                                                                                                                checked={
                                                                                                                    endpointIds &&
                                                                                                                    endpointIds.includes(
                                                                                                                        item.id
                                                                                                                    )
                                                                                                                }
                                                                                                                id={
                                                                                                                    item.id
                                                                                                                }
                                                                                                                name={
                                                                                                                    item.url
                                                                                                                }
                                                                                                                onChange={
                                                                                                                    handleCheckboxChange
                                                                                                                }
                                                                                                            />{' '}
                                                                                                            {
                                                                                                                item.url
                                                                                                            }
                                                                                                        </div>
                                                                                                    </>
                                                                                                )
                                                                                            )}
                                                                                    </Accordion.Body>
                                                                                </Accordion.Item>
                                                                            </>
                                                                        )
                                                                    )}
                                                                </Accordion>
                                                            </div>
                                                            <p className="error">
                                                                {formErrors &&
                                                                    formErrors.endpointError}
                                                            </p>
                                                        </Col>
                                                    )}
                                                </Form.Group>
                                            </div>
                                        </div>
                                        <div className="btnCenter mb-3">
                                            {screenId && screenId.id ? (
                                                <Button
                                                    variant="addbtn"
                                                    type="button"
                                                    className="Button"
                                                    onClick={onUpdateHandler}
                                                >
                                                    {' '}
                                                    Update{' '}
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="addbtn"
                                                    type="submit"
                                                    className="Button"
                                                >
                                                    {' '}
                                                    Save{' '}
                                                </Button>
                                            )}
                                            <Button
                                                variant="secondary"
                                                className="Button"
                                                type="button"
                                                onClick={() => navigate('/screenList')}
                                            >
                                                {cancelButtonName}
                                            </Button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                {/* modal for logo */}
                <Modal show={showLogo} onHide={handleClose} backdrop="static" keyboard={false}>
                    <Modal.Header closeButton={() => handleClose()}>
                        <Modal.Title>Change Icon</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form>
                            <div class="" style={{ padding: '30px' }}>
                                <center>
                                    <div className="mb-5">
                                        {icon == null ? (
                                            <img
                                                src="/dist/Images/add-photo.png"
                                                style={{ height: '100px' }}
                                            />
                                        ) : (
                                            <img
                                                src={
                                                    icon && typeof icon !== 'string'
                                                        ? icon && URL.createObjectURL(icon)
                                                        : screenId &&
                                                          screenId.id !== null &&
                                                          `data:image/jpeg;base64,${formData.icon}`
                                                }
                                                style={{ height: '50px' }}
                                                alt="Logo"
                                            />
                                        )}
                                    </div>

                                    <input
                                        title="allowed only png"
                                        accept="image/png"
                                        onChange={(e) => handleFileSelect(e)}
                                        name="icon"
                                        type="file"
                                    />
                                    <p className="error">{formErrors && formErrors.fileType}</p>
                                </center>
                            </div>
                        </form>
                    </Modal.Body>
                    <div className="btnCenter mb-3">
                        <Button variant="addbtn" className="Button" onClick={handleFileUpload}>
                            Upload
                        </Button>
                        <Button variant="secondary" className="Button" onClick={handleClose}>
                            {cancelButtonName}
                        </Button>
                    </div>
                </Modal>
                {/* modal for price history */}
                <Modal
                    show={priceShow}
                    onHide={handleClose}
                    backdrop="static"
                    keyboard={false}
                    size="lg"
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Price History</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <PriceHistory
                            priceHistory={priceHistory}
                            setPriceHistory={setPriceHistory}
                            setPriceShow={setPriceShow}
                            close={handleClose}
                        />
                    </Modal.Body>
                </Modal>
            </section>
        </>
    )
}

export default Screen
