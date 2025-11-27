import React, { useState } from 'react'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Select from 'react-select'
import Row from 'react-bootstrap/Row'
import { Button, Modal } from 'react-bootstrap'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import {
    getAllByIdWithStatus,
    getAllByOrgId,
    getById,
    save,
    update
} from '../../Common/Services/CommonService'
import { toast } from 'react-toastify'
import { unlockUser, reset, getAllClientResources } from '../../Common/Services/OtherServices'
import PageHeader from '../../Common/CommonComponents/PageHeader'
import { ToastError, ToastSuccess } from '../../Common/CommonComponents/ToastCustomized'
import { commonCrudSuccess } from '../../Common/CommonComponents/CustomizedSuccessToastMessages'
import DetailLoader from '../../Common/CommonComponents/Loaders/DetailLoader'

const User = () => {
    const userDetails = useSelector((state) => state.user.userDetails)
    const [formErrors, setFormErrors] = useState({})

    const [employeeId, setEmployeeId] = useState(null)
    const [clientResourceId, setClientResourceId] = useState()
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(true)

    const navigate = useNavigate()
    const location = useLocation()

    const validate = (values) => {
        const errors = {}
        // const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i
        // const regex1 = /^[0-9a-zA-Z \-'_]+$/
        if (!values.username) {
            errors.username = 'Required'
        }
        if (values.roleId == undefined) {
            errors.roleId = 'Required'
        }
        if (values.employeeId == undefined) {
            errors.employeeId = 'Required'
        }
        if (employee.length == 0 && values.employeeId == undefined) {
            errors.employeeId = 'No Active Employees Found'
        }
        return errors
    }

    const handleEmployeeSelection = (selection) => {
        if (employeesType == 'Internal') {
            !selection
                ? setFormErrors({ ...formErrors, employeeId: 'Required' })
                : setFormErrors({ ...formErrors, employeeId: '' })
            setEmployeeId(selection.value)
            setEmail(selection.username)
        } else {
            !selection
                ? setFormErrors({ ...formErrors, employeeId: 'Required' })
                : setFormErrors({ ...formErrors, employeeId: '' })
            setClientResourceId(selection.value)
            setEmail(selection.username)
        }
    }

    const [status, setStatus] = useState()
    const handleStatusSelection = (e) => {
        setStatus(e.target.checked)
    }

    const [show, setShow] = useState()

    const [visReset, setVisreset] = useState()
    const [employeesType, setEmployeesType] = useState('')
    const [externalEmployees, setExternalEmployees] = useState([])
    const [mode, setMode] = useState('')

    useEffect(() => {
        if (location.state && location.state.action == 'External') {
            setMode('pro')
            getAllClientEmployees()
            getProjectClientList()
            setEmployeesType('External')
        } else if (location.state && location.state.id == null && location.state.key == 'Add') {
            setMode('create')
            setVis(false)
            setShow(false)
            setEmployeesType('Internal')
        } else if (
            location.state &&
            location.state.data.locked == true &&
            location.state.key == 'Add'
        ) {
            getDetailsById()
            setMode('edit')
            setVis(true)
            setShow(true)
        } else {
            getDetailsById()
            setMode('edit')
            setVisreset(true)
            setShow(true)
        }
    }, [])

    useEffect(() => {
        getAllEmployees()
        getAllRoles()
    }, [])
    const [vis, setVis] = useState(false)

    const saveUserInfo = (e) => {
        e.preventDefault()
        const obj = {
            organizationId: userDetails.organizationId,
            roleId: roleId,
            employeeId: employeeId,
            employeeName: null,
            username: email,
            createdBy: userDetails.employeeId,
            resourceType: employeesType,
            clientResourceId: location.state.row ? location.state.row.id : clientResourceId
        }
        const Externalobj = {
            organizationId: userDetails.organizationId,
            roleId: roleId,
            username: location.state.row && location.state.row.email,
            createdBy: userDetails.employeeId,
            resourceType: employeesType,
            clientResourceId: location.state.row ? location.state.row.id : clientResourceId
        }
        if (obj.employeeId == undefined && employeesType == 'Internal') {
            setFormErrors(validate(obj))
        } else if (obj.roleId == undefined) {
            setFormErrors(validate(obj))
        } else {
            setLoading(true) // added loder after resolve all validation issues
            save({
                entity: 'users',
                organizationId: userDetails.organizationId,
                body: employeesType == 'Internal' ? obj : Externalobj,
                toastSuccessMessage: commonCrudSuccess({ screen: 'User', operationType: 'save' })
            })
                .then((res) => {
                    if (res.statusCode == 200 && location.state.action != 'external') {
                        setLoading(false)
                        ToastSuccess(res.message)
                        navigate('/userList')
                    } else if (res.statusCode == 200 && location.state.action == 'external') {
                        setLoading(false)
                        ToastSuccess(res.message)
                        navigate('/clientList')
                    }
                })
                .catch((err) => {
                    setLoading(false)
                    ToastError(err.message)
                })
        }
    }

    const handleRoleSelection = (selection) => {
        !selection
            ? setFormErrors({ ...formErrors, roleId: 'Required' })
            : setFormErrors({ ...formErrors, roleId: '' })
        setRoleId(selection.value)
    }
    const [roleId, setRoleId] = useState()
    const [roles, setRole] = useState([])
    const getAllRoles = () => {
        getAllByOrgId({
            entity: 'roles',
            organizationId: userDetails.organizationId
        })
            .then(
                (res) => {
                    setRole(res.data)
                },
                (error) => {
                    console.log(error)
                }
            )
            .catch((err) => {
                console.log(err)
            })
    }

    const roleOptions = roles
        ? [
            ...roles.map((option) => ({
                value: option.id,
                label: option.name
            }))
        ]
        : [{ value: 2, label: 'SuperAdmin' }]

    const [employee, setEmployee] = useState([])


    const getAllEmployees = () => {
        setLoading(true)
        getAllByIdWithStatus({
            entity: 'employees',
            organizationId: userDetails.organizationId,
            status: 'Active'
        })
            .then(
                (res) => {
                    if (res.statusCode == 200) {
                        const filteredEmployees = res.data.filter(emp => location && !location.state.existingEmploeeIds.includes(emp.id))
                        setEmployee(filteredEmployees)
                        setLoading(false)
                    }
                },
            )
            .catch((err) => {
                setLoading(false)
                console.log(err)
            })
    }

    const [clientList, setClientList] = useState([])

    const getProjectClientList = () => {
        getAllByOrgId({
            entity: 'projectclients',
            organizationId: userDetails.organizationId
        })
            .then(
                (res) => {
                    setClientList(res.data)
                },
                (error) => {
                    console.log(error)
                }
            )
            .catch((err) => {
                console.log(err)
            })
    }

    const clientOptions = clientList
        ? clientList.map((option) => ({
            value: option.id,
            label: option.name,
            username: option.email
        }))
        : []

    const handleClientSelection = (select) => {
        getAllClientEmployees(select.value)
    }
    const getAllClientEmployees = (id) => {
        setLoading(true)
        getAllClientResources({
            entity: 'clientresource',
            organizationId: userDetails.organizationId,
            id: id
        })
            .then(
                (res) => {
                    setExternalEmployees(res.data)
                    setLoading(false)
                },
                (error) => {
                    setLoading(false)
                    console.log(error)
                }
            )
            .catch((err) => {
                setLoading(false)
                console.log(err)
            })
    }
    const employeeOptions = employee
        ? employee.map((option) => ({
            value: option.id,
            label: option.name,
            username: option.email
        }))
        : []

    const externalEmployeeOptions = externalEmployees
        ? externalEmployees.map((option) => ({
            value: option.id,
            label: option.name,
            username: option.email
        }))
        : []

    const [details, setDetails] = useState([])
    const [lockedStatus, setLockedStatus] = useState([])

    const getDetailsById = () => {
        getById({
            entity: 'users',
            organizationId: userDetails.organizationId,
            id: location.state && location.state.id
        })
            .then(
                (res) => {
                    setLoading(false)
                    setDetails(res.data)
                    setEmployeesType(res.data.resourceType)
                    setLockedStatus(res.data ? res.data.locked : [])
                    setStatus(res ? res.data.deleted : [])
                    setRoleId(res ? res.data.roleId : 0)
                    setEmployeeId(res.data && res.data.employeeId)
                    setEmail(res.data && res.data.email)
                },
                (error) => {
                    console.log(error)
                }
            )
            .catch((err) => {
                setLoading(false)
                console.log(err)
            })
    }

    const updateUserInfo = (e) => {
        setLoading(true)
        e.preventDefault()
        const updateObj = {
            organizationId: userDetails.organizationId,
            id: details.id,
            locked: details.locked,
            deleted: status,
            username: email,
            roleId: roleId ? roleId : details.roleId,
            resourceType: employeesType,
            // lastPasswordModifiedDate: new Date(),
            employeeId: details.employeeId,
            employeeName: details.employeeName
        }
        if (updateObj.roleId == undefined) {
            setFormErrors(validate(updateObj))
        } else {
            update({
                entity: 'users',
                organizationId: userDetails.organizationId,
                id: updateObj.id,
                body: updateObj,
                toastSuccessMessage: commonCrudSuccess({ screen: 'User', operationType: 'update' })
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        setLoading(false)
                        ToastSuccess(res.message)
                        navigate('/userList')
                    }
                })
                .catch((err) => {
                    console.log(err, 'error')
                    setLoading(false)
                    ToastError(err.message)
                })
        }
    }

    const onLockHandler = () => {
        unlockUser({ entity: 'users', id: location.state && location.state.id })
            .then((res) => {
                if (res.statusCode == 200) {
                    toast.success('Unlocked successfully.')
                    setVis(false)
                    getDetailsById()
                } else {
                    toast.error(res.errorMessage)
                }
            })
            .catch((err) => {
                console.log(err, 'error')
            })
    }

    const handleReset = () => {
        reset({
            entity: 'users',
            username: email
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    toast.success(res.data)
                    handleResetClose()
                    // getUsersList()
                } else {
                    toast.error(res.errorMessage)
                }
            })
            .catch((err) => {
                console.log(err, 'error')
            })
    }
    const [resetShow, setResetShow] = useState()
    const handleResetShow = () => {
        setResetShow(true)
    }
    const handleResetClose = () => {
        setResetShow(false)
    }

    const handleRadioClick = (value) => {
        setEmployeesType(value)
        setEmployeeId(null)
    }
    return (
        <>
            <div>
                <section className="section detailBackground">
                    {loading ? <DetailLoader /> : ''}
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="">
                                    <PageHeader
                                        pageTitle={mode == 'edit' ? 'Update User' : 'Add User'}
                                    />
                                    {visReset && (
                                        <div style={{ position: 'absolute', right: '20em' }}>
                                            <span
                                                style={{
                                                    cursor: 'pointer',
                                                    display: 'inline-block'
                                                }}
                                                onClick={handleResetShow}
                                            >
                                                <img
                                                    src="dist/Images/link.png"
                                                    className="linkImage"
                                                    alt=""
                                                />
                                            </span>
                                            &ensp;&emsp;
                                            <span>
                                                <a className="" onClick={handleResetShow}>
                                                    <u style={{ fontSize: '15px' }}>
                                                        Reset Password
                                                    </u>
                                                </a>
                                            </span>
                                        </div>
                                    )}
                                    <form style={{ marginTop: '2%' }} className=" formBody">
                                        {mode == 'create' ? (
                                            ''
                                        ) : (
                                            <div className="col-">
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-2"
                                                    controlId="formGroupToDate"
                                                >
                                                    <Form.Label column sm={2}>
                                                        Employee Type{' '}
                                                        <span className="error">*</span>
                                                    </Form.Label>
                                                    <Col md={7} className="radioTop">
                                                        <span>
                                                            <input
                                                                value="Internal"
                                                                type="radio"
                                                                checked={
                                                                    employeesType == 'Internal'
                                                                }
                                                                disabled={
                                                                    employeesType == 'External'
                                                                }
                                                                onChange={(e) =>
                                                                    handleRadioClick(e.target.value)
                                                                }
                                                                name="Internal"
                                                            // disabled={employeesType === "External"}
                                                            />
                                                            &ensp;
                                                            <span>Internal</span>
                                                            &emsp;
                                                            <input
                                                                value="External"
                                                                type="radio"
                                                                checked={
                                                                    employeesType == 'External'
                                                                }
                                                                disabled={
                                                                    employeesType == 'Internal'
                                                                }
                                                                onChange={(e) =>
                                                                    handleRadioClick(e.target.value)
                                                                }
                                                                name="External"
                                                            />
                                                            &ensp;
                                                            <span>External</span>
                                                        </span>
                                                    </Col>
                                                </Form.Group>
                                            </div>
                                        )}

                                        {mode == 'pro' ||
                                            mode == 'edit' ||
                                            employeesType == 'Internal' ? (
                                            ''
                                        ) : (
                                            <div className="col-">
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-3"
                                                    controlId="formGroupToDate"
                                                >
                                                    <Form.Label column sm={2}>
                                                        Client <span className=""></span>
                                                    </Form.Label>
                                                    {
                                                        <Col md={7}>
                                                            <Select
                                                                required
                                                                onChange={handleClientSelection}
                                                                options={clientOptions}
                                                                placeholder="Select Client"
                                                            />
                                                        </Col>
                                                    }
                                                </Form.Group>
                                            </div>
                                        )}
                                        <div className="col-">
                                            <Form.Group
                                                as={Row}
                                                className="mb-"
                                                controlId="formGroupToDate"
                                            >
                                                <Form.Label column sm={2}>
                                                    Employee <span className="error">*</span>
                                                </Form.Label>
                                                {mode == 'pro' ? (
                                                    <Col md={7}>
                                                        <Form.Control
                                                            value={
                                                                location.state &&
                                                                location.state.row &&
                                                                location.state.row.name
                                                            }
                                                        />
                                                    </Col>
                                                ) : (
                                                    <Col md={7}>
                                                        {mode == 'edit' ? (
                                                            <div style={{ marginTop: '1.5%' }}>
                                                                {details.employeeName}
                                                            </div>
                                                        ) : (
                                                            <Select
                                                                required
                                                                onChange={handleEmployeeSelection}
                                                                options={
                                                                    employeesType == 'Internal'
                                                                        ? employeeOptions
                                                                        : externalEmployeeOptions
                                                                }
                                                                isDisabled={
                                                                    mode == 'edit' ? true : false || employee.length == 0
                                                                }
                                                                value={
                                                                    employeesType &&
                                                                        employeesType == 'External'
                                                                        ? externalEmployeeOptions.filter(
                                                                            (e) =>
                                                                                e.value ==
                                                                                employeeId &&
                                                                                employeeId
                                                                        )
                                                                        : employeeOptions.filter(
                                                                            (e) =>
                                                                                e.value ==
                                                                                employeeId &&
                                                                                employeeId
                                                                        )
                                                                }
                                                                placeholder="Select Employee"
                                                                // isClearable
                                                                onBlur={() =>
                                                                    !employeeId
                                                                        ? setFormErrors({
                                                                            ...formErrors,
                                                                            employeeId: 'Required'
                                                                        })
                                                                        : setFormErrors({
                                                                            ...formErrors,
                                                                            employeeId: ''
                                                                        })
                                                                }
                                                            />
                                                        )}

                                                        <p className="error">
                                                            {employee.length == 0 && mode != "edit" ? "No Active Employees Found" : formErrors.employeeId}
                                                        </p>
                                                    </Col>
                                                )}
                                            </Form.Group>
                                        </div>
                                        <div className="col-">
                                            <Form.Group
                                                as={Row}
                                                className="mb-3"
                                                controlId="formGroupToDate"
                                            >
                                                <Form.Label column sm={2}>
                                                    Username
                                                    {/* <span className="error">*</span>  */}
                                                </Form.Label>
                                                {mode == 'edit' ? (
                                                    <Col sm={7} style={{ marginTop: '0.7%' }}>
                                                        {location.state.row
                                                            ? location.state.row.email
                                                            : email}
                                                    </Col>
                                                ) : (
                                                    <Col sm={7}>
                                                        <Form.Control
                                                            required
                                                            disabled={true}
                                                            defaultValue={
                                                                location.state.row
                                                                    ? location.state.row.email
                                                                    : email
                                                            }
                                                            placeholder=""
                                                        />
                                                    </Col>
                                                )}
                                            </Form.Group>
                                        </div>
                                        <div className="col-">
                                            <Form.Group
                                                as={Row}
                                                className="mb-0"
                                                controlId="formGroupToDate"
                                            >
                                                <Form.Label column sm={2}>
                                                    Role <span className="error">*</span>
                                                </Form.Label>
                                                <Col md={7}>
                                                   {details.roleId != 2 ? <Select
                                                        required
                                                        name="roleId"
                                                        // isDisabled={employee.length == 0 && mode != "edit"}
                                                        onChange={handleRoleSelection}
                                                        options={
                                                            roleOptions &&
                                                            roleOptions.sort((a, b) =>
                                                                a.label > b.label ? 1 : -1
                                                            )
                                                        }
                                                        value={roleOptions.filter(
                                                            (e) => e.value == roleId
                                                        )}
                                                        // defaultValue={details ? roleSelect : ""}
                                                        placeholder="Select Role"
                                                        onBlur={() =>
                                                            !roleId
                                                                ? setFormErrors({
                                                                    ...formErrors,
                                                                    roleId: 'Required'
                                                                })
                                                                : setFormErrors({
                                                                    ...formErrors,
                                                                    roleId: ''
                                                                })
                                                        }
                                                    /> : <div style={{ marginTop: '1.5%' }}>{details.roleName}</div>}
                                                    <p className="error">{formErrors.roleId}</p>
                                                </Col>
                                            </Form.Group>
                                        </div>

                                        {show && (
                                            <>
                                                <div className="col-">
                                                    <Form.Group
                                                        as={Row}
                                                        className="mb-2"
                                                        controlId="formGroupBranch"
                                                    >
                                                        <Form.Label column sm={2}>
                                                            Inactive
                                                        </Form.Label>
                                                        <Col sm={7} style={{ marginTop: '1%' }}>
                                                            <input
                                                                onChange={handleStatusSelection}
                                                                checked={status}
                                                                type="checkbox"
                                                                label="Active"
                                                                value="deleted"
                                                            />{' '}
                                                        </Col>
                                                    </Form.Group>
                                                </div>

                                                <div className="col-">
                                                    <Form.Group
                                                        as={Row}
                                                        className="mb-"
                                                        controlId="formGroupBranch"
                                                    >
                                                        <Form.Label column sm={2}>
                                                            Locked
                                                        </Form.Label>
                                                        <Col sm={7} style={{ marginTop: '0.7%' }}>
                                                            {lockedStatus == true
                                                                ? 'Yes'
                                                                : 'No'}{' '}
                                                        </Col>
                                                    </Form.Group>
                                                </div>
                                            </>
                                        )}

                                        <div className="btnCenter" style={{ marginTop: '7%' }}>
                                            {mode == 'create' && (
                                                <Button
                                                    type="submit"
                                                    className="Button"
                                                    variant="addbtn"
                                                    onClick={saveUserInfo}
                                                >
                                                    Save
                                                </Button>
                                            )}
                                            {mode == 'pro' && (
                                                <Button
                                                    type="submit"
                                                    className="Button"
                                                    variant="addbtn"
                                                    onClick={saveUserInfo}
                                                >
                                                    Save
                                                </Button>
                                            )}

                                            {mode == 'edit' && (
                                                <>
                                                    <Button
                                                        type="button"
                                                        className="Button"
                                                        variant="addbtn"
                                                        onClick={updateUserInfo}
                                                    >
                                                        Update
                                                    </Button>
                                                </>
                                            )}

                                            <div style={{ marginLeft: '7px' }}>
                                                {vis && (
                                                    <Button
                                                        variant="addbtn"
                                                        className="Button"
                                                        onClick={onLockHandler}
                                                    >
                                                        UnLock
                                                    </Button>
                                                )}
                                            </div>

                                            <Button
                                                className="Button"
                                                variant="secondary"
                                                type="button"
                                                onClick={() => window.history.back()}
                                            >
                                                Close
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <Modal
                    show={resetShow}
                    onHide={handleResetClose}
                    backdrop="static"
                    keyboard={false}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Reset Password</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="modalBody">
                        Are you sure. Do you Want to reset password ?
                    </Modal.Body>
                    <div className="delbtn">
                        <Button className="Button" variant="addbtn" onClick={handleReset}>
                            Proceed
                        </Button>
                        <Button className="Button" variant="secondary" onClick={handleResetClose}>
                            Close
                        </Button>
                    </div>
                </Modal>
            </div>
        </>
    )
}
export default User
