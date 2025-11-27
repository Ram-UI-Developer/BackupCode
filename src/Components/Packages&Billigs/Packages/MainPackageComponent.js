import React, { useEffect, useState } from 'react'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { commonCrudSuccess } from '../../../Common/CommonComponents/CustomizedSuccessToastMessages'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import { ToastError, ToastSuccess } from '../../../Common/CommonComponents/ToastCustomized'
import {
    getAll,
    getByIdwithOutOrg,
    saveWithoutOrg,
    updateWithoutOrg
} from '../../../Common/Services/CommonService'
import { cancelButtonName } from '../../../Common/Utilities/Constants'
import PackageSubscription from './PackageSubscription'
import PackagesSlabs from './PackagesSlabs'
import {
    compareArrayOfObjects,
    updateValidation
} from '../../../Common/CommonComponents/FormControlValidation'

export const MainPackageComponent = () => {
    // State to manage loading spinner/indicator
    const [loading, setLoading] = useState(true)

    // Get navigation state passed via react-router (e.g., from previous page)
    const location = useLocation().state

    // Hook for programmatic navigation
    const navigate = useNavigate()

    // Store all available module data (excluding required & app owner-only ones)
    const [data, setData] = useState([])

    // Store data used for updates (like pre-selected modules for edit)
    const [updateData, setUpdateData] = useState([])

    // Track whether the mode is "create" or "edit"
    const [mode, setMode] = useState('')

    // Runs only once on component mount
    useEffect(() => {
        // If creating a new package
        if (location && location.id == null) {
            setMode('create')
            onGetModulesHandler()
        }
        // If editing an existing package
        else {
            setMode('edit')
            getByIdPackages(location.id) // Fetch package details by ID
            onGetModulesHandler()
        }
    }, [])

    // Fetch all modules from API
    const onGetModulesHandler = () => {
        setLoading(true)
        getAll({
            entity: 'modules' // API entity identifier
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    // Filter out modules marked as appownerOnly or required
                    setData(res.data.filter((e) => !e.appownerOnly && !e.required))

                    // If in create mode, auto-select required modules for updateData
                    if (location && location.id == null) {
                        const editData = res.data.filter((e) => e.required)
                        setUpdateData(editData)
                    }

                    setLoading(false)
                } else {
                    // API error fallback
                    setData([])
                }
            })
            .catch((err) => {
                setLoading(false)
                console.log(err, 'error') // Log API call error
            })
    }

    // Store discount history data (could be fetched separately)
    const [discountHistory, setDiscountHistory] = useState([])

    // Store slabs (pricing tiers) data
    const [slabsData, setSlabsData] = useState([])

    // Form data object for controlled inputs
    const [formData, setFormData] = useState({})

    // Handle input changes and validate required fields
    const handleInputChange = (e) => {
        const { name, value } = e.target

        // Update form data
        setFormData({ ...formData, [name]: value })

        // Validate empty field
        !e.target.value
            ? setFormErrors({ ...formErrors, [name]: 'Required' })
            : setFormErrors({ ...formErrors, [name]: '' })
    }

    // Store total price/amount (probably for calculation)
    const [total, setTotal] = useState(null)

    // State for managing checkbox selection (e.g., terms accepted)
    const [checked, setChecked] = useState(false)

    // Toggle checkbox state
    const handleCheckox = (e) => {
        setChecked(e.target.checked)
    }

    // Manage active/inactive state of the package (boolean)
    const [active, setActive] = useState(true)

    // Toggle active checkbox
    const handleActiveCheckBox = (e) => {
        setActive(e.target.checked)
    }
    const [validData, setValidData] = useState([])
    // Fetch package details by ID and pre-fill form for editing
    const getByIdPackages = (id) => {
        setLoading(true) // Start loading spinner
        getByIdwithOutOrg({ entity: 'packages', id: id }) // API call to fetch package
            .then(
                (res) => {
                    console.log(res.data, 'chekingAllSectionsFro') // Debug log
                    setUpdateData(res.data.modules) // Set selected modules for update
                    setFormData(res.data ? res.data : {}) // Set entire form data
                    setTotal(res.data && res.data.total) // Set total price
                    setSlabsData(res.data && res.data.slabs) // Set slab details
                    setChecked(res.data && res.data.free) // Set free checkbox
                    setActive(res.data && res.data.active) // Set active status
                    setLoading(false) // Stop loading spinner
                    setValidData(res.data)
                },
                (error) => {
                    // Handle failed API response
                    console.log(error)
                }
            )
            .catch((err) => {
                // Catch and log any exception
                setLoading(false)
                console.log(err)
            })
    }

    // Form validation state
    const [formErrors, setFormErrors] = useState({})

    // Validation logic for required fields
    const validate = (values) => {
        const errors = {}
        if (!values.name) {
            errors.name = 'Required' // Validate name is not empty
        }
        return errors
    }

    // Handler to save a new package (in create mode)
    const onSaveHandler = () => {
        // Prepare request object
        const obj = {
            name: formData.name,
            moduleIds: updateData.map((e) => e.id), // Extract only module IDs
            slabs: slabsData,
            total: total,
            active: active,
            free: checked
        }

        // Validation checks before saving
        if (!formData.name || formData.name == undefined) {
            setFormErrors(validate(formData)) // Show error if name missing
        } else if (obj.moduleIds.length == 0) {
            toast.error('please add modules') // Show error if no modules selected
        } else if (obj.slabs.length == 0) {
            toast.error('please add slabs') // Show error if no slabs provided
        } else {
            // All validations passed, proceed to save
            setLoading(true)
            saveWithoutOrg({
                entity: 'packages',
                body: obj,
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Package',
                    operationType: 'save'
                }),
                screenName: 'Package'
            })
                .then((res) => {
                    setLoading(false)
                    if (res.statusCode == 200) {
                        ToastSuccess(res.message) // Show success toast
                        navigate('/packageList') // Redirect to package list
                    }
                })
                .catch((err) => {
                    setLoading(false)
                    ToastError(err.message) // Show error toast
                })
        }
    }

    // Handler to update an existing package (in edit mode)
    const onUpdateHandler = () => {
        // Prepare update object
        const obj = {
            id: formData.id,
            name: formData.name,
            moduleIds: updateData.map((e) => e.id), // Extract only module IDs
            slabs: slabsData,
            total: total,
            active: active,
            free: checked,
            orderNumber: formData.orderNumber // Include order number for update
        }
        // Validation checks before updating
        if (
            updateValidation(validData, formData) &&
            obj.moduleIds.length === validData.modules.length &&
            formData.active == active &&
            formData.free == checked &&
            compareArrayOfObjects(validData.slabs, slabsData)
        ) {
            toast.info('No changes made to update.')
        } else if (!formData.name || formData.name == undefined) {
            setFormErrors(validate(formData)) // Show error if name missing
        } else if (obj.moduleIds.length == 0) {
            toast.error('please add modules') // Show error if no modules selected
        } else if (obj.slabs.length == 0) {
            toast.error('please add slabs') // Show error if no slabs provided
        } else {
            // All validations passed, proceed to update
            setLoading(true)
            updateWithoutOrg({
                entity: 'packages',
                body: obj,
                id: formData.id,
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Package',
                    operationType: 'update'
                }),
                screenName: 'Package'
            })
                .then((res) => {
                    setLoading(false)
                    if (res.statusCode == 200) {
                        ToastSuccess(res.message) // Show success toast
                        navigate('/packageList') // Redirect to package list
                    }
                })
                .catch((err) => {
                    setLoading(false)
                    ToastError(err.message) // Show error toast
                })
        }
    }
    return (
        <section className="section detailBackground">
            {/* Show loader while data is loading */}
            {loading ? <DetailLoader /> : ''}

            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-12">
                        <div className="">
                            {/* Page title */}
                            <PageHeader pageTitle="Add Subscription Package" />

                            {/* Main input form row */}
                            <Row className="mb-3">
                                <div className="row">
                                    {/* Package Name input field */}
                                    <div className="col-6">
                                        <Form.Group as={Row} className='mb-3'>
                                            <Form.Label column sm={4}>
                                                Package Name <span className="error">*</span>
                                            </Form.Label>
                                            <Col sm={6}>
                                                <Form.Control
                                                    onChange={handleInputChange} // Update state on input change
                                                    onBlur={handleInputChange} // Trigger validation on blur
                                                    name="name"
                                                    defaultValue={formData.name} // Prefill in edit mode
                                                />
                                                {/* Show validation error for name */}
                                                {formErrors.name && (
                                                    <p className="error">{formErrors.name}</p>
                                                )}
                                            </Col>
                                        </Form.Group>
                                    </div>

                                    {/* Free checkbox */}
                                    <div className="col-6">
                                        <Form.Group as={Row}>
                                            <Form.Label column sm={3}>
                                                Free ?
                                            </Form.Label>
                                            <Col sm={6} style={{ marginTop: '1%' }}>
                                                <input
                                                    type="checkbox"
                                                    onChange={handleCheckox} // Toggle free checkbox
                                                    checked={checked} // Bind to state
                                                />
                                            </Col>
                                        </Form.Group>
                                    </div>

                                    {/* Active checkbox */}
                                    <div className="col-6">
                                        <Form.Group as={Row}>
                                            <Form.Label column sm={4}>
                                                Active ?
                                            </Form.Label>
                                            <Col sm={6} style={{ marginTop: '1%' }}>
                                                <input
                                                    type="checkbox"
                                                    onChange={handleActiveCheckBox} // Toggle active status
                                                    checked={active} // Bind to state
                                                />
                                            </Col>
                                        </Form.Group>
                                    </div>
                                </div>
                            </Row>

                            {/* Component for selecting modules and calculating total */}
                            <div className="mb-4">
                                <PackageSubscription
                                    total={total}
                                    setTotal={setTotal}
                                    data={data}
                                    updateData={updateData}
                                    setData={setData}
                                    setUpdateData={setUpdateData}
                                />
                            </div>

                            {/* Component for managing slabs and discounts */}
                            <div className='mb-4'>
                                <PackagesSlabs
                                    checked={checked}
                                    totalPrice={total}
                                    slabsData={slabsData}
                                    setSlabsData={setSlabsData}
                                    setDiscountHistory={setDiscountHistory}
                                    discountHistory={discountHistory}
                                />
                            </div>

                            {/* Save/Update and Cancel buttons */}
                            <div className="btnCenter mb-3">
                                {
                                    // Show Save button only in create mode
                                    mode == 'create' && (
                                        <Button
                                            variant="addbtn"
                                            className="Button"
                                            onClick={onSaveHandler} // Trigger save handler
                                        >
                                            Save
                                        </Button>
                                    )
                                }

                                {
                                    // Show Update button only in edit mode
                                    mode == 'edit' && (
                                        <Button
                                            variant="addbtn"
                                            className="Button"
                                            onClick={onUpdateHandler} // Trigger update handler
                                        >
                                            Update
                                        </Button>
                                    )
                                }

                                {/* Cancel button to go back to package list */}
                                <Button
                                    className="Button"
                                    variant="secondary"
                                    onClick={() => navigate('/packageList')}
                                >
                                    {cancelButtonName}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
