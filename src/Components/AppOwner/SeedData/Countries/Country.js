import React, { useEffect, useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { commonCrudSuccess } from '../../../../Common/CommonComponents/CustomizedSuccessToastMessages'
import {
    compareArrayOfObjects,
    handleKeyPress,
    updateValidation
} from '../../../../Common/CommonComponents/FormControlValidation'
import DetailLoader from '../../../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../../../Common/CommonComponents/PageHeader'
import { ToastError, ToastSuccess } from '../../../../Common/CommonComponents/ToastCustomized'
import { getById, save, update } from '../../../../Common/Services/CommonService'
import { cancelButtonName } from '../../../../Common/Utilities/Constants'
import StateList from './StateList'

const Country = () => {
    const userDetails = useSelector((state) => state.user.userDetails) //contains user details data
    const entityName = userDetails.organizationId == null ? 'countries' : 'organizationCountry'
    const countryData = useLocation().state //contains country details get by id data
    const [formData, setFormData] = useState('') //state for form data
    const [formErrors, setFormErrors] = useState({}) //state for handling form errors during validation
    const [states, setStates] = useState([]) //state for setting states data related to that country
    const [loading, setLoading] = useState(false) //state for displaying loader
    const navigate = useNavigate() //for redirect
    const [countryGet, setCountryGet] = useState([])
    const [change, setChange] = useState([])
    useEffect(() => {
        // Check if updating (existing entry) or creating new (no loader initially)
        if (countryData.id) {
            setLoading(true)
            onGetByIdHandler()
        }
    }, [])

    //api handling for get by id
    const onGetByIdHandler = () => {
        setLoading(true)
        getById({
            entity: entityName,
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
            id: countryData.id
        })
            .then(
                (res) => {
                    if (res.statusCode == 200) {
                        setFormData(res.data ? res.data : {})
                        setCountryGet(res.data ? res.data : {})
                        setStates(res.data ? res.data.stateDTOs : [])
                        setLoading(false)
                    } else {
                        toast.error(res.errorMessage)
                    }
                },
                (error) => {
                    console.log(error)
                }
            )
            .catch((err) => {
                console.log(err)
            })
    }

    // input handling
    const onInputHandler = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
        !e.target.value
            ? setFormErrors({ ...formErrors, [name]: 'Required' })
            : setFormErrors({ ...formErrors, [name]: '' })
    }

    const validate = (values) => {
        const errors = {}
        if (!values.name) {
            errors.name = 'Required'
        }
        if (!values.isdCode) {
            errors.isdCode = 'Required'
        }
        if (!values.isoCode) {
            errors.isoCode = 'Required'
        }
        if (!values.isoNumberCode) {
            errors.isoNumberCode = 'Required'
        }

        return errors
    }

    //api handling  for save country object
    const onSaveHandler = () => {
        let obj = {
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
            name: formData.name,
            isdCode: formData.isdCode,
            isoCode: formData.isoCode,
            isoNumberCode: formData.isoNumberCode,
            stateDTOs: states
        }
        if (!formData.name || formData.name == undefined) {
            setFormErrors(validate(formData))
        } else if (!formData.isdCode || formData.isdCode == undefined) {
            setFormErrors(validate(formData))
        } else if (!formData.isoCode || formData.isoCode == undefined) {
            setFormErrors(validate(formData))
        } else if (!formData.isoNumberCode || formData.isoNumberCode == undefined) {
            setFormErrors(validate(formData))
        } else {
            save({
                entity: entityName,
                organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Country',
                    operationType: 'save'
                }),
                body: obj
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        ToastSuccess(res.message)
                        navigate('/countryList')
                    }
                })
                .catch((err) => {
                    console.log(err, 'error')
                    ToastError(err.message)
                })
        }
    }

    //api handling for update country object
    const onUpdateHandler = () => {
        setLoading(true)
        let obj = {
            id: formData.id,
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
            name: formData.name,
            isdCode: formData.isdCode,
            isoCode: formData.isoCode,
            isoNumberCode: formData.isoNumberCode,
            stateDTOs: states
        }

        if (!formData.name || formData.name == undefined) {
            setFormErrors(validate(formData))
        } else if (!formData.isdCode || formData.isdCode == undefined) {
            setFormErrors(validate(formData))
        } else if (!formData.isoCode || formData.isoCode == undefined) {
            setFormErrors(validate(formData))
        } else if (!formData.isoNumberCode || formData.isoNumberCode == undefined) {
            setFormErrors(validate(formData))
        } else if (
            updateValidation(countryGet, formData) &&
            countryGet.stateDTOs.length == states.length &&
            compareArrayOfObjects(countryGet.stateDTOs, states) &&
            change
        ) {
            toast.info('No changes made to update')
            setLoading(false)
        } else {
            update({
                entity: entityName,
                organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
                body: obj,
                id: formData.id,
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Country',
                    operationType: 'update'
                })
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        setLoading(false)
                        ToastSuccess(res.message)
                        navigate('/countryList')
                    }
                })
                .catch((err) => {
                    console.log(err, 'error')
                    setLoading(false)
                    ToastError(err.message)
                })
        }
    }

    const onCancelHandler = () => {
        navigate('/countryList')
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
                                        (countryData.id == null ? 'Add' : 'Update') +
                                        ' ' +
                                        'Country'
                                    }
                                />

                                <div className="formBody">
                                    <form className="card-body">
                                        <div className="col-">
                                            <Form.Group
                                                as={Row}
                                                className="mb-3"
                                                controlId="formGroupToDate"
                                            >
                                                <Form.Label className="fieldLabel" column md={3}>
                                                    Name <span className="error">*</span>
                                                </Form.Label>
                                                <Col md={9}>
                                                    <Form.Control
                                                        className="textBox"
                                                        required
                                                        onChange={onInputHandler}
                                                        defaultValue={formData && formData.name}
                                                        name="name"
                                                        type="text"
                                                        maxLength={50}
                                                        onBlur={onInputHandler}
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

                                        <div className="col-">
                                            <Form.Group
                                                as={Row}
                                                className="mb-2"
                                                controlId="formGroupToDate"
                                            >
                                                <Form.Label className="fieldLabel" column md={3}>
                                                    ISD Code <span className="error">*</span>
                                                </Form.Label>
                                                <Col md={9}>
                                                    <Form.Control
                                                        className="textBox"
                                                        required
                                                        onChange={(e) => {
                                                            let value = e.target.value.replace(
                                                                /[^0-9]/g,
                                                                ''
                                                            ) // Only digits
                                                            if (value.length > 3)
                                                                value = value.slice(0, 3) // Max 3 digits
                                                            e.target.value = value
                                                            onInputHandler(e)
                                                        }}
                                                        onInput={(e) => {
                                                            let value = e.target.value.replace(
                                                                /[^0-9]/g,
                                                                ''
                                                            )
                                                            if (value.length > 3)
                                                                value = value.slice(0, 3)
                                                            e.target.value = value
                                                        }}
                                                        defaultValue={formData && formData.isdCode}
                                                        name="isdCode"
                                                        type="number"
                                                        min={0}
                                                        max={999}
                                                        step={1}
                                                        onBlur={onInputHandler}
                                                    />
                                                    <p className="error">{formErrors.isdCode}</p>
                                                </Col>
                                            </Form.Group>
                                        </div>

                                        <div className="col-">
                                            <Form.Group
                                                as={Row}
                                                className="mb-3"
                                                controlId="formGroupToDate"
                                            >
                                                <Form.Label className="fieldLabel" column md={3}>
                                                    ISO Code <span className="error">*</span>
                                                </Form.Label>
                                                <Col md={9}>
                                                    <Form.Control
                                                        className="textBox"
                                                        defaultValue={formData && formData.isoCode}
                                                        onChange={onInputHandler}
                                                        name="isoCode"
                                                        type="text"
                                                        maxLength={3}
                                                        onBlur={onInputHandler}
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
                                                    {formErrors.isoCode && (
                                                        <p className="error">
                                                            {formErrors.isoCode}
                                                        </p>
                                                    )}
                                                </Col>
                                            </Form.Group>
                                        </div>

                                        <div className="col-">
                                            <Form.Group
                                                as={Row}
                                                className="mb-3"
                                                controlId="formGroupToDate"
                                            >
                                                <Form.Label className="fieldLabel" column md={3}>
                                                    ISO Number Code <span className="error">*</span>
                                                </Form.Label>
                                                <Col md={9}>
                                                    <Form.Control
                                                        className="textBox"
                                                        required
                                                        defaultValue={
                                                            formData && formData.isoNumberCode
                                                        }
                                                        onChange={(e) => {
                                                            let value = e.target.value.replace(
                                                                /[^0-9]/g,
                                                                ''
                                                            )
                                                            if (value.length > 3)
                                                                value = value.slice(0, 3)
                                                            e.target.value = value
                                                            onInputHandler(e)
                                                        }}
                                                        onInput={(e) => {
                                                            let value = e.target.value.replace(
                                                                /[^0-9]/g,
                                                                ''
                                                            )
                                                            if (value.length > 3)
                                                                value = value.slice(0, 3)
                                                            e.target.value = value
                                                        }}
                                                        name="isoNumberCode"
                                                        type="number"
                                                        min={0}
                                                        max={999}
                                                        step={1}
                                                        onBlur={onInputHandler}
                                                    />
                                                    <p className="error">
                                                        {formErrors.isoNumberCode}
                                                    </p>
                                                </Col>
                                            </Form.Group>
                                        </div>
                                        <div className='mb-3'>
                                            <StateList
                                                states={states}
                                                setStates={setStates}
                                                setChange={setChange}
                                            />
                                        </div>

                                        <div className="btnCenter mb-3">
                                            {countryData.id == null ? (
                                                <Button
                                                    className="Button"
                                                    variant="addbtn"
                                                    type="button"
                                                    onClick={onSaveHandler}
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

export default Country
