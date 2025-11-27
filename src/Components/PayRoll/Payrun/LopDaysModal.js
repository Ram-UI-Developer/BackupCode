import React, { useEffect, useState } from 'react'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import Select from 'react-select'
import { getAllWithGenderandMartial } from '../../../Common/Services/CommonService'
import { getLeaveBalance } from '../../../Common/Services/OtherServices'
import { cancelButtonName } from '../../../Common/Utilities/Constants'

const LopDaysModal = (props) => {
    const { row, rowIndex, onUpdatePayrun, onCloseHandler, status } = props // destructoring props
    const userDetails = useSelector((state) => state.user.userDetails) // Get userdetails form redux
    const [leaveTypes, setLeaveTypes] = useState([]) // State for leave types
    const [leaveBalance, setLeaveBalance] = useState({}) // State for Leave balance of an employee
    const [formData, setFormData] = useState({
        lopLeaveTypeId: '',
        lopDays: ''
    }) // State for formdata to update
    const [formErrors, setFormErrors] = useState({}) // State for handling errors

    // Assign row data to formdata when component on mount
    useEffect(() => {
        setFormData(row)
        getLeaveTypes()
    }, [])

    // Fetch leave balance

    const onGetLeaveHandler = (lopLeaveTypeId) => {
        getLeaveBalance({
            entity: 'employeeleavebalance',
            organizationId: userDetails.organizationId,
            id: row.employeeId,
            locationId: row.locationId
        })
            .then((res) => {
                setLeaveBalance(res.data.find((e) => e.leaveTypeId == lopLeaveTypeId))
            })
           .catch(()=> {}) // Handle error by doing nothing
    }

    const getLeaveTypes = () => {
        getAllWithGenderandMartial({
            entity: 'leavetypes',
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
            locationId: row.locationId,
            employeeId: row.employeeId
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setLeaveTypes(res.data.filter((item) => item.carryforward))
                }
            })
           .catch(()=> {}) // Handle error by doing nothing
    }

    // options for leavetype
    const options =
        leaveTypes.length > 0
            ? leaveTypes.map((leaveType) => ({
                  label: leaveType.name,
                  value: leaveType.id
              }))
            : []

    // onchange for lopdays
    const onChangeHandler = (e) => {
        const { name, value } = e.target
        if (value.length <= 3) {
            setFormData({ ...formData, [name]: value })
            setFormErrors({ ...formErrors, lopDays: '' })
        }
    }

    // update formdata by changing leavetype
    const onLeaveChange = (option, name) => {
        setFormData({ ...formData, [name]: option.value, lopDays: 0 })
        onGetLeaveHandler(option.value)
    }

    // update LOP days
    const onSaveHandler = () => {
        if (formData.lopLeaveTypeId == '' || formData.lopLeaveTypeId == null) {
            setFormErrors(validate(formData))
        } else if (formData.lopDays == '' || formData.lopDays == null) {
            setFormErrors(validate(formData))
        } else {
            row.lopLeaveTypeId = formData.lopLeaveTypeId
            row.lopDays = formData.lopDays
            onUpdatePayrun(row, rowIndex)
        }
    }

    // Basic form validation
    const validate = (values) => {
        const errors = {}
        if (values.lopDays == '' || values.lopDays == null) {
            errors.lopDays = 'Required'
        }
        if (values.lopLeaveTypeId == '' || values.lopLeaveTypeId == null) {
            errors.lopLeaveTypeId = 'Required'
        }
        return errors
    }

    // validation for number
    const onNumberValidate = (event) => {
        if (event.key === '-' || event.key === 'e') {
            event.preventDefault()
        }
    }

    return (
        <div>
            <div className="row">
                <div className="col-sm-12">
                    <Form.Group as={Row} className="mb-4" controlId="formGroupToDate">
                        <Form.Label column md={3}>
                            Leave Type <span className="error">*</span>
                        </Form.Label>
                        <Col md={4} style={{ textAlign: 'left' }}>
                            <Select
                                className="dropdown"
                                isDisabled={status == 'Completed'}
                                placeholder=""
                                options={options}
                                value={options.filter(
                                    (item) => item.value == formData.lopLeaveTypeId
                                )}
                                name="lopLeaveTypeId"
                                onChange={(e) => onLeaveChange(e, 'lopLeaveTypeId')}
                            />
                            <p className="error">
                                {formErrors.lopLeaveTypeId ? formErrors.lopLeaveTypeId : ''}
                            </p>
                        </Col>

                        <Form.Label column md={2}>
                            Leave Balance
                        </Form.Label>
                        <Col md={2} style={{ textAlign: 'left', paddingTop: '1%' }}>
                            {leaveBalance ? leaveBalance.remaining : 0}
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-5" controlId="formGroupToDate">
                        <Form.Label column md={3}>
                            LOP Days <span className="error">*</span>
                        </Form.Label>
                        <Col md={8}>
                            <Form.Control
                                type="number"
                                name="lopDays"
                                readOnly={status == 'Completed'}
                                // disabled={leaveBalance ? false : true}
                                onKeyPress={(e) => onNumberValidate(e)}
                                min={0}
                                max={365}
                                maxLength={3}
                                value={formData.lopDays}
                                onChange={(e) => onChangeHandler(e)}
                            />
                            <p className="error text-left">
                                {formErrors.lopDays ? formErrors.lopDays : ''}
                            </p>
                        </Col>
                    </Form.Group>
                    <div className="mb-3" style={{ margin: 'auto' }}>
                        <Button
                            className="Button"
                            disabled={status == 'Completed'}
                            variant="addbtn"
                            onClick={onSaveHandler}
                        >
                            Save
                        </Button>
                        <Button className="Button" variant="secondary" onClick={onCloseHandler}>
                            {cancelButtonName}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LopDaysModal
