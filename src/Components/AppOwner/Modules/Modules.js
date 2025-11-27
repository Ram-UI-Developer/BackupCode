import React, { useEffect, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { commonCrudSuccess } from '../../../Common/CommonComponents/CustomizedSuccessToastMessages'
import {
    compareArrayOfObjects,
    handleKeyPress,
    updateValidation
} from '../../../Common/CommonComponents/FormControlValidation'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import { ToastError, ToastSuccess } from '../../../Common/CommonComponents/ToastCustomized'
import { ChangeIcon } from '../../../Common/CommonIcons/CommonIcons'
import {
    getByIdwithOutOrg,
    saveWithoutOrg,
    updateWithoutOrg
} from '../../../Common/Services/CommonService'
import { cancelButtonName } from '../../../Common/Utilities/Constants'
import DiscountHistory from './DiscountHistory'
import MenuList from './MenuList'

const Modules = () => {
    const Data = useLocation().state // Get data passed through route
    const navigate = useNavigate() // define navigation
    const [formErrors, setFormErrors] = useState({}) // State for handling errors
    const [formData, setFormData] = useState('') // State for module being added or edited
    const [required, setRequired] = useState(false) // State for maintaing is module mandatory or not
    const [appownerOnly, setAppownerOnly] = useState(false) // State for declire appowner module or not
    const [menus, setMenus] = useState([]) // state for all menus
    const [show, setShow] = useState(false) // State for popup menu
    const [discountHistory, setDiscountHistory] = useState([]) // State for discount history
    const [isLoading, setIsLoading] = useState(true) // State for Loader
    const [module, setModule] = useState({}) // State for module data
    const [change, setChange] = useState(true) // State for update validation

    // close popup window
    const handleClose = () => {
        setShow(false)
    }
    // Handle input changes with validation
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

    // Fetch module data for edit mode
    const onGetDataHandler = () => {
        getByIdwithOutOrg({ entity: 'modules', id: Data.id })
            .then((res) => {
                if (res.statusCode == 200) {
                    setIsLoading(false)
                    setFormData(res.data ? res.data : {})
                    setModule(res.data ? res.data : {})
                    setMenus(res.data.menuDTOs ? res.data.menuDTOs : [])
                    setRequired(res.data.required)
                    setAppownerOnly(res.data.appownerOnly)
                    setDiscountHistory(res.data.discountDTOs)
                } else {
                    setFormData({})
                }
            })
            .catch(() => {
                setIsLoading(false)
            })
    }

    const [mode, setMode] = useState('') // State for add or edit
    // Determine mode on component mount
    useEffect(() => {
        if (Data.id == null) {
            setIsLoading(false)
            setMode('add')
        } else {
            setMode('edit')
            onGetDataHandler()
        }
    }, [])

    // Basic form validations
    const validate = (values) => {
        const errors = {}
        if (!values.name) {
            errors.name = 'Required'
        }

        if (values.menuDTOs.length < 1) {
            errors.menus = 'Required'
        }

        return errors
    }

    // Save Module using Api
    const onSubmitHandler = (e) => {
        e.preventDefault()
        const obj = {
            id: formData && formData.id,
            name: formData.name,
            required: required,
            appownerOnly: appownerOnly,
            description: formData.description,
            menuDTOs: menus,
            discountDTOs: discountHistory,
            price:
                discountHistory.length > 0
                    ? discountHistory[0]['unit'] == '%'
                        ? finalAmount
                        : finalValue
                    : originalPrice
        }

        if (!obj.name) {
            setFormErrors(validate(obj))
        } else if (obj.menuDTOs.length == 0) {
            toast.warning('At least one menu is needed.')
            setFormErrors(validate(obj))
        } else {
            setIsLoading(true)
            saveWithoutOrg({
                entity: 'modules',
                body: obj,
                toastSuccessMessage: commonCrudSuccess({ screen: 'Module', operationType: 'save' }),
                screenName: 'Module'
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        ToastSuccess(res.message)
                        navigate('/moduleList')
                    }
                })
                .catch((err) => {
                    setIsLoading(false)
                    ToastError(err.message)
                })
        }
    }

    // Update existing Module using api
    const onUpdateHandler = (e) => {
        e.preventDefault()
        const obj = {
            id: formData && formData.id,
            name: formData.name,
            required: required,
            appownerOnly: appownerOnly,
            description: formData.description,
            menuDTOs: menus,
            discountDTOs: discountHistory,
            price:
                discountHistory.length > 0
                    ? discountHistory[0]['unit'] == '%'
                        ? finalAmount
                        : finalValue
                    : originalPrice
        }
        if (
            updateValidation(module, formData) &&
            module.discountDTOs.length == discountHistory.length &&
            module.menuDTOs.length == menus.length &&
            compareArrayOfObjects(module.menuDTOs, menus) &&
            change &&
            formData.required == required &&
            formData.appownerOnly == appownerOnly
        ) {
            toast.info('No changes made to update')
        } else if (!obj.name) {
            setFormErrors(validate(obj))
        } else if (obj.menuDTOs.length == 0) {
            toast.warning('At least one menu is needed.')
            setFormErrors(validate(obj))
        } else {
            setIsLoading(true)
            updateWithoutOrg({
                entity: 'modules',
                id: formData.id,
                body: obj,
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Module',
                    operationType: 'update'
                }),
                screenName: 'Module'
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        ToastSuccess(res.message)
                        navigate('/moduleList')
                    }
                })
                .catch((err) => {
                    setIsLoading(false)
                    ToastError(err.message)
                })
        }
    }

    // calculations for discout
    const originalPrice = menus
        .map((e) => e.screensTotalPrice)
        .reduce((sum, current) => sum + current, 0)
    const finalAmount =
        discountHistory.length > 0
            ? originalPrice - (originalPrice * discountHistory[0]['discount']) / 100
            : originalPrice // #1737: change in discount history
    const finalValue =
        discountHistory.length > 0 ? originalPrice - discountHistory[0]['discount'] : originalPrice // #1737: change in discount history

    return (
        <>
            {isLoading ? <DetailLoader /> : ''}
            <section className="section detailBackground">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="">
                                {mode == 'add' && <PageHeader pageTitle=" Add Module" />}
                                {mode == 'edit' && <PageHeader pageTitle="Update Module" />}

                                <div style={{ marginLeft: '2%', marginTop: '10px' }}>
                                    <div className="col-10">
                                        <Form.Group
                                            as={Row}
                                            className="mb-3"
                                            controlId="formGroupBranch"
                                        >
                                            <Form.Label column sm={3}>
                                                Name <span className="error">*</span>
                                            </Form.Label>
                                            <Col sm={7} style={{ paddingLeft: '1px' }}>
                                                <Form.Control
                                                    required
                                                    size="md"
                                                    type="text"
                                                    min="0"
                                                    name="name"
                                                    defaultValue={formData.name}
                                                    onChange={onInputChange}
                                                    onKeyPress={(e) =>
                                                        handleKeyPress(e, setFormErrors)
                                                    }
                                                    onPaste={(e) =>
                                                        handleKeyPress(e, setFormErrors)
                                                    }
                                                    onInput={(e) =>
                                                        handleKeyPress(e, setFormErrors)
                                                    }
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
                                    <div className="col-md-10">
                                        <div className="row">
                                            <div className="col-6">
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-3"
                                                    controlId="formGroupBranch"
                                                >
                                                    <Form.Label column sm={8}>
                                                        Mandatory Module?
                                                    </Form.Label>
                                                    <Col sm={2} style={{ paddingLeft: '1px' }}>
                                                        <div className="radioAlign">
                                                            <input
                                                                type="checkbox"
                                                                name="required"
                                                                checked={required}
                                                                onChange={() =>
                                                                    setRequired(!required)
                                                                }
                                                            />
                                                        </div>
                                                    </Col>
                                                </Form.Group>
                                            </div>
                                            <div className="col-6">
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-3"
                                                    controlId="formGroupBranch"
                                                >
                                                    <Form.Label column sm={7}>
                                                        App Owner Only?
                                                    </Form.Label>
                                                    <Col sm={2} style={{ paddingLeft: '1px' }}>
                                                        <div className="radioAlign">
                                                            <input
                                                                type="checkbox"
                                                                name="appownerOnly"
                                                                checked={appownerOnly}
                                                                onChange={() =>
                                                                    setAppownerOnly(!appownerOnly)
                                                                }
                                                            />
                                                        </div>
                                                    </Col>
                                                </Form.Group>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-10">
                                        <Form.Group
                                            as={Row}
                                            className="mb-3"
                                            controlId="formGroupBranch"
                                        >
                                            <Form.Label column sm={3}>
                                                Description
                                            </Form.Label>
                                            <Col sm={7} style={{ paddingLeft: '1px' }}>
                                                <Form.Control
                                                    required
                                                    size="md"
                                                    type="text"
                                                    min="0"
                                                    maxLength={250}
                                                    name="description"
                                                    defaultValue={formData.description}
                                                    onChange={onInputChange}
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
                                    {/* table for menus */}
                                    <MenuList
                                        Data={Data}
                                        menus={menus}
                                        setMenus={setMenus}
                                        setChange={setChange}
                                    />
                                    <div className="col-12 d-flex alignItems-end flexDirection-column mb-4">
                                        <div className="totalScreenPrice">
                                            Total Value: &#8377; {originalPrice.toFixed(2)}
                                        </div>
                                        <div className="discountForModule">
                                            Discount:{' '}
                                            {discountHistory.length > 0 ? (
                                                discountHistory[0]['unit'] == 'value' ? (
                                                    <>&#8377; </>
                                                ) : (
                                                    ''
                                                )
                                            ) : (
                                                ''
                                            )}
                                            {discountHistory.length > 0
                                                ? Number(discountHistory[0]['discount']).toFixed(2)
                                                : 0.0}
                                            {discountHistory.length > 0
                                                ? discountHistory[0]['unit'] == '%'
                                                    ? '%'
                                                    : ''
                                                : '%'}{' '}
                                            &ensp;
                                            <span>
                                                <a
                                                    className=""
                                                    style={{ fontWeight: '600' }}
                                                    onClick={() => setShow(true)}
                                                >
                                                    <ChangeIcon />
                                                </a>
                                            </span>
                                        </div>
                                        <div className="afterDiscountTotal">
                                            Total Value: &#8377;{' '}
                                            {discountHistory.length > 0
                                                ? discountHistory[0]['unit'] == '%'
                                                    ? finalAmount.toFixed(2)
                                                    : finalValue.toFixed(2)
                                                : originalPrice.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                                <></>
                                <div className="btnCenter mb-3">
                                    {mode == 'add' ? (
                                        <Button
                                            className="Button"
                                            variant="addbtn"
                                            onClick={onSubmitHandler}
                                        >
                                            Save
                                        </Button>
                                    ) : (
                                        <Button
                                            className="Button"
                                            variant="addbtn"
                                            onClick={onUpdateHandler}
                                        >
                                            Update
                                        </Button>
                                    )}
                                    <Button
                                        className="Button"
                                        variant="secondary"
                                        onClick={() => navigate('/moduleList')}
                                    >
                                        {cancelButtonName}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* modal for discount history */}
            <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title> Discount History </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <DiscountHistory
                        discountHistory={discountHistory}
                        setDiscountHistory={setDiscountHistory}
                        setShow={setShow}
                        close={handleClose}
                        modulePrice={originalPrice}
                    />
                </Modal.Body>
            </Modal>
        </>
    )
}

export default Modules
