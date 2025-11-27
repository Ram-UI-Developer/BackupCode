import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import React, { useEffect, useRef, useState } from 'react'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import Select from 'react-select'
import { toast } from 'react-toastify'
import DetailLoader from '../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../Common/CommonComponents/PageHeader'
import { getAllById, save } from '../../Common/Services/CommonService'
import {
    fullAndFinalSettlementgetById,
    getAllListFUllAFinByLocationEmpId,
    getAllResignationEmployees,
    updateWithIdForFAFS
} from '../../Common/Services/OtherServices'
import { cancelButtonName } from '../../Common/Utilities/Constants'
import LeavesModal from '../PayRoll/Payrun/LeavesModal'
import LoanModal from '../PayRoll/Payrun/LoanModal'
import LopModal from '../PayRoll/Payrun/LopModal'
import ThismonthDetails from '../PayRoll/Payrun/ThismonthDetails'
import TimeSheetModal from '../PayRoll/Payrun/TimeSheetModal'
import YTDDetails from '../PayRoll/Payrun/YTDDetails'
import FullAndFinalSettelmentsView from './FullAndFinalSettelmentsView'
import { updateValidation } from '../../Common/CommonComponents/FormControlValidation'

const FullAndFinalSettllements = () => {
    const userDetails = useSelector((state) => state.user.userDetails) //contains user details data
    const location = useLocation().state
    const navigate = useNavigate() //for redirect
    const [show, setShow] = useState(false) //state for showing modal pop ups
    const [data, setData] = useState({}) //state for setting data
    const [action, setAction] = useState('') //state for setting action
    const [loading, setLoading] = useState(true) //state for displaying loader
    const [modelHeading, setModelHeading] = useState('') //setting the modal header
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setData({ ...data, [name]: value })
    }

    const [locations, setLocations] = useState([]) //state for setting locations data
    const [locationId, setLocationId] = useState() //state for store location id
    const [employeeId, setEmployeeId] = useState() //state for storing employee id
    const [fafData, setFafData] = useState([])

    useEffect(() => {
        if (location && location.id == null) {
            setAction('create')
            setLoading(false)
        } else if (location && location.id != null) {
            fullAndFinalSetGetById()
            setAction('update')
        }
    }, [])
    const onShowHandler = (headding) => {
        setShow(true)
        setModelHeading(headding)
    }

    const onCloseHandler = () => {
        setShow(false)
    }
    const handleAmountInput = (e) => {
        let value = e.target.value.replace(/[^0-9]/g, '')
        if (value.length > 10) value = value.slice(0, 10)
        e.target.value = value
        handleInputChange(e)
    }

    const pdfRef = useRef()

    //pdf download method
    const exportPaySlip = () => {
        if (pdfRef.current) {
            const input = pdfRef.current
            html2canvas(input, { scale: 2 }).then((canvas) => {
                const imgData = canvas.toDataURL('image/png')
                const pdf = new jsPDF()
                const pdfWidth = pdf.internal.pageSize.getWidth()
                const customHeight = 300
                const pdfHeight = customHeight

                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
                pdf.save('fullAndFinalsettelment.pdf')
            })
        }
    }

    useEffect(() => {
        getAllLocationById()
        if (locationId !== undefined && locationId != null) {
            getAllRecordsByLocation()
        }
    }, [])

    //api handling for getting locations in that organization
    const getAllLocationById = () => {
        getAllById({
            entity: 'locations',
            organizationId: userDetails.organizationId
        })
            .then(
                (res) => {
                    if (res.statusCode == 200) {
                        setLocations(res.data)
                    }
                },
                (err) => {
                    console.log(err)
                }
            )
            .catch((error) => {
                console.log(error)
            })
    }

    const locationOptions = locations.map((option) => ({
        value: option.id,
        label: option.name
    }))

    const handleLocationSelect = (select) => {
        setLocationId(select.value)
        getEmployeesById(select.value)
        // getAllRecordsByLocation(select.value)
    }

    const [employees, setEmployees] = useState([])

    //api handling for getting employees under resignation
    const getEmployeesById = (val) => {
        getAllResignationEmployees({
            entity: 'resignation',
            organizationId: userDetails.organizationId,
            locationId: val
        })
            .then(
                (res) => {
                    if (res.statusCode == 200) {
                        setEmployees(res.data ? res.data : [])
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

    const employeeOptions = employees.map((option) => ({
        value: option.employeeId,
        label: option.employeeName
    }))

    const handleEmployeeSelect = (select) => {
        setEmployeeId(select.value)
        getAllRecordsByLocation(select.value)
    }

    const [status, setStatus] = useState('')

    //api handling for getting  all full and final records of an employee
    const getAllRecordsByLocation = (empId) => {
        getAllListFUllAFinByLocationEmpId({
            entity: 'fullandfinalsettlement',
            organizationId: userDetails.organizationId,
            locationId: locationId,
            employeeId: empId
        })
            .then(
                (res) => {
                    if (res.statusCode == 200) {
                        setLoading(false)
                        setData(res.data)

                        setStatus(res.data && res.data.status)
                    }
                },
                (err) => {
                    console.log(err)
                }
            )
            .catch((error) => {
                console.log(error)
            })
    }

    const [GratShow, setGratShow] = useState(false)

    const handleGratShow = () => {
        setGratShow(true)
    }
    const handleClose = () => {
        setGratShow(false)
    }

    //api handling for get by Id
    const fullAndFinalSetGetById = () => {
        fullAndFinalSettlementgetById({
            entity: 'fullandfinalsettlement',
            organizationId: userDetails.organizationId,
            id: location && location.id
        })
            .then(
                (res) => {
                    if (res.statusCode == 200) {
                        setLoading(false)
                        setData(res.data ? res.data : [])
                        setFafData(res.data ? res.data : {})
                        setLocationId(res.data && res.data.locationId)
                        setEmployeeId(res.data && res.data.employeeId)
                        getEmployeesById(res.data && res.data.locationId)
                        setStatus(res.data && res.data.status)
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

    const [formErrors, setFormErrors] = useState({})

    //validate object
    const validate = (values) => {
        const errors = {}

        if (values.locationId == undefined) {
            errors.locationId = 'Required'
        }
        if (values.employeeId == undefined) {
            errors.employeeId = 'Required'
        }
        return errors
    }

    //api handling for saving the record along with validation
    const onSaveHandler = () => {
        if (data.locationId == undefined) {
            setFormErrors(validate(data))
        } else if (data.employeeId == undefined) {
            setFormErrors(validate(data))
        } else {
            save({
                entity: 'fullandfinalsettlement',
                organizationId: userDetails.organizationId,
                body: data
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        toast.success('Saved successfully.')
                        navigate('/fullAndFinalSettllementList')
                    } else {
                        toast.error(res.errorMessage)
                    }
                })
                .catch((err) => {
                    console.log(err, 'error')
                })
        }
    }
    //api handling for  updating the record
    const onUpdateHandler = (action,isSave) => {
        data['status'] = action
        if (isSave && updateValidation(data, fafData)) {
            toast.info('No changes made to update')
            setLoading(false)
            return
        }
        updateWithIdForFAFS({
            entity: 'fullandfinalsettlement',
            organizationId: userDetails.organizationId,
            id: data.id,
            body: data
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    if (res.data.status.label == 'Saved') {
                        toast.success('Saved successfully.')
                        navigate('/fullAndFinalSettllementList')
                    } else if (res.data.status.label == 'Submitted') {
                        toast.success('Submitted successfully.')
                        navigate('/fullAndFinalSettllementList')
                    } else if (res.data.status.label == 'Approved') {
                        toast.success('Approved successfully.')
                        navigate('/fullAndFinalSettllementList')
                    } else if (res.data.status.label == 'Completed') {
                        toast.success('Completed successfully.')
                        navigate('/fullAndFinalSettllementList')
                    }
                } else {
                    toast.error(res.errorMessage)
                }
            })
            .catch((err) => {
                console.log(err, 'error')
            })
    }

    //number formatting method for amounts
    const formatNumber = (number) => {
        if (number == null) return ''
        return new Intl.NumberFormat('en-IN').format(number)
    }

    return (
        <div>
            {loading ? <DetailLoader /> : ''}
            <section className="section">
                <div className="container-fluid">
                    <div className="row">
                        <PageHeader pageTitle="Full And Final Settlement Form" />
                        <div className="col-md-12">
                            {location && location.name == 'viewAllDetails' ? (
                                <FullAndFinalSettelmentsView
                                    employeeId={location && location.employeeId}
                                    ref={pdfRef}
                                />
                            ) : (
                                <div className="card-body" style={{ marginLeft: '10%' }}>
                                    <div className="col-8" style={{ marginLeft: '4%' }}>
                                        <Form.Group
                                            as={Row}
                                            className="mb-3"
                                            //controlId="formGroupCode"
                                        >
                                            <Form.Label column sm={6}>
                                                Location <span className="error">*</span>
                                            </Form.Label>
                                            <Col sm={5}>
                                                <Select
                                                    options={locationOptions}
                                                    onChange={handleLocationSelect}
                                                    isDisabled={action == 'update'}
                                                    value={locationOptions.filter(
                                                        (e) => e.value == locationId
                                                    )}
                                                    onBlur={() =>
                                                        !locationId
                                                            ? setFormErrors({
                                                                  ...formErrors,
                                                                  locationId: 'Required'
                                                              })
                                                            : setFormErrors({
                                                                  ...formErrors,
                                                                  locationId: ''
                                                              })
                                                    }
                                                />
                                                <p className="error">{formErrors.locationId}</p>
                                            </Col>
                                        </Form.Group>
                                    </div>
                                    <div className="col-8" style={{ marginLeft: '4%' }}>
                                        <Form.Group as={Row} className="mb-3">
                                            <Form.Label column sm={6}>
                                                Employee <span className="error">*</span>
                                            </Form.Label>

                                            <Col sm={5}>
                                                <Select
                                                    options={employeeOptions}
                                                    onChange={handleEmployeeSelect}
                                                    isDisabled={action == 'update'}
                                                    value={employeeOptions.filter(
                                                        (e) => e.value == employeeId
                                                    )}
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
                                                <p className="error">{formErrors.employeeId}</p>
                                            </Col>
                                        </Form.Group>
                                    </div>

                                    <div style={{ marginTop: '2%' }}>
                                        <div className="col-8" style={{ marginLeft: '4%' }}>
                                            <Form.Group as={Row} className="mb-3">
                                                <Form.Label column sm={6}>
                                                    Employee Code
                                                </Form.Label>

                                                <Col sm={5} style={{ marginTop: '2%' }}>
                                                    {data.employeeCode}
                                                </Col>
                                            </Form.Group>
                                        </div>
                                        <div className="col-8" style={{ marginLeft: '4%' }}>
                                            <Form.Group as={Row} className="mb-3">
                                                <Form.Label column sm={5}>
                                                    Leaves
                                                </Form.Label>

                                                <Col
                                                    sm={5}
                                                    className="text-end"
                                                    style={{ marginTop: '2%', marginLeft: '3.7%' }}
                                                >
                                                    <span
                                                        onClick={() =>
                                                            onShowHandler('Leave Details')
                                                        }
                                                    >
                                                        <a className="">{data.absentDays}</a>
                                                    </span>
                                                </Col>
                                            </Form.Group>
                                        </div>
                                        <div className="col-8" style={{ marginLeft: '4%' }}>
                                            <Form.Group as={Row} className="mb-3">
                                                <Form.Label column sm={5}>
                                                    Leave Balance
                                                </Form.Label>

                                                <Col
                                                    sm={5}
                                                    className="text-end"
                                                    style={{ marginTop: '2%', marginLeft: '3.7%' }}
                                                >
                                                    <span
                                                        onClick={() => onShowHandler('LOP Details')}
                                                    >
                                                        <a className="">{data.leaveBalance}</a>
                                                    </span>
                                                </Col>
                                            </Form.Group>
                                        </div>

                                        <div className="col-8" style={{ marginLeft: '4%' }}>
                                            <Form.Group as={Row} className="mb-3">
                                                <Form.Label column sm={5}>
                                                    Leave Encashment Days
                                                </Form.Label>

                                                <Col
                                                    sm={5}
                                                    className="text-end"
                                                    style={{ marginTop: '2%', marginLeft: '3.7%' }}
                                                >
                                                    {data.leaveEncashmentDays}
                                                </Col>
                                            </Form.Group>
                                        </div>
                                        <div
                                            className="col-8"
                                            style={{ marginLeft: '4%', marginTop: '2%' }}
                                        >
                                            <Form.Group as={Row} className="mb-3">
                                                <Form.Label column sm={5}>
                                                    Timesheet
                                                </Form.Label>

                                                <Col
                                                    sm={5}
                                                    className="text-end"
                                                    style={{ marginTop: '2%', marginLeft: '3.7%' }}
                                                >
                                                    <span
                                                        onClick={() =>
                                                            onShowHandler('TimeSheet Details')
                                                        }
                                                    >
                                                        <a className="">
                                                            {data && data.length != 0
                                                                ?  data.approvedHours ? data.approvedHours : 0 +
                                                                  '/' +
                                                                  data.submittedHours ? data.submittedHours : 0
                                                                : ''}
                                                        </a>
                                                    </span>
                                                </Col>
                                            </Form.Group>
                                        </div>
                                        <div
                                            style={{
                                                marginLeft: '1rem',
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: '18px',
                                                    fontWeight: '600',
                                                    marginRight: '1rem'
                                                }}
                                            >
                                                {' '}
                                                Earnings
                                            </div>

                                            <hr
                                                style={{
                                                    flex: '1',
                                                    borderWidth: '3px',
                                                    borderColor: 'black'
                                                }}
                                            />
                                        </div>

                                        <div
                                            className="col-8"
                                            style={{ marginLeft: '4%', marginTop: '4%' }}
                                        >
                                            <Form.Group as={Row} className="mb-3">
                                                <Form.Label column sm={6}>
                                                    Expense Amount
                                                </Form.Label>

                                                <Col sm={5}>
                                                    <Form.Control
                                                        onChange={handleInputChange}
                                                        name="approvedAmount"
                                                        onInput={handleAmountInput}
                                                        min={0}
                                                        type="number"
                                                        defaultValue={data.approvedAmount}
                                                        // onKeyPress={handleKeyPress}
                                                    />
                                                </Col>
                                            </Form.Group>
                                        </div>
                                        <div className="col-8" style={{ marginLeft: '4%' }}>
                                            <Form.Group as={Row} className="mb-3">
                                                <Form.Label column sm={6}>
                                                    OT Amount
                                                </Form.Label>

                                                <Col sm={5}>
                                                    <Form.Control
                                                        onChange={handleInputChange}
                                                        onInput={handleAmountInput}
                                                        name="otAmount"
                                                        min={0}
                                                        type="number"
                                                        defaultValue={data.otAmount}
                                                        // onKeyPress={handleKeyPress}
                                                    />
                                                </Col>
                                            </Form.Group>
                                        </div>
                                        <div className="col-8" style={{ marginLeft: '4%' }}>
                                            <Form.Group as={Row} className="mb-3">
                                                <Form.Label column sm={6}>
                                                    Bonus Amount
                                                </Form.Label>

                                                <Col sm={5}>
                                                    <Form.Control
                                                        onChange={handleInputChange}
                                                        onInput={handleAmountInput}
                                                        name="bonus"
                                                        type="number"
                                                        min={0}
                                                        defaultValue={data.bonus}
                                                        // onKeyPress={handleKeyPress}
                                                    />{' '}
                                                </Col>
                                            </Form.Group>
                                        </div>
                                        <div className="col-8" style={{ marginLeft: '4%' }}>
                                            <Form.Group as={Row} className="mb-3">
                                                <Form.Label column sm={6}>
                                                    Miscellaneous Earning Amount
                                                </Form.Label>

                                                <Col sm={5}>
                                                    <Form.Control
                                                        onChange={handleInputChange}
                                                        onInput={handleAmountInput}
                                                        className="text-right"
                                                        name="miscellaneousEarningAmount"
                                                        min={0}
                                                        type="number"
                                                        defaultValue={
                                                            data.miscellaneousEarningAmount
                                                        }
                                                        // onKeyPress={handleKeyPress}
                                                    />
                                                </Col>
                                            </Form.Group>
                                        </div>
                                        <div className="col-8" style={{ marginLeft: '4%' }}>
                                            <Form.Group as={Row} className="mb-3">
                                                <Form.Label column sm={6}>
                                                    Miscellaneous Earning Caption
                                                </Form.Label>

                                                <Col sm={5}>
                                                    <Form.Control
                                                        onChange={handleInputChange}
                                                        name="miscellaneousEarnings"
                                                        min={0}
                                                        maxLength={100}
                                                        type="text"
                                                        defaultValue={data.miscellaneousEarnings}
                                                    />
                                                    {formErrors.miscellaneousEarnings && (
                                                        <p className="error">
                                                            {formErrors.miscellaneousEarnings}
                                                        </p>
                                                    )}
                                                </Col>
                                            </Form.Group>
                                        </div>
                                        <div className="col-8" style={{ marginLeft: '4%' }}>
                                            <Form.Group as={Row} className="mb-3">
                                                <Form.Label column sm={5}>
                                                    YTD Earnings
                                                </Form.Label>

                                                <Col
                                                    sm={5}
                                                    className="text-end"
                                                    style={{ marginTop: '2%', marginLeft: '3.7%' }}
                                                >
                                                    {/* {"ytdIncome"} */}
                                                    <span
                                                        onClick={() => onShowHandler('YTD Details')}
                                                    >
                                                        <a className="">
                                                            {formatNumber(data.ytdIncome)}
                                                        </a>
                                                    </span>
                                                </Col>
                                            </Form.Group>
                                        </div>
                                        <div className="col-8" style={{ marginLeft: '4%' }}>
                                            <Form.Group as={Row} className="mb-3">
                                                <Form.Label column sm={5}>
                                                    Gratuity
                                                </Form.Label>

                                                <Col
                                                    sm={5}
                                                    className="text-end"
                                                    style={{ marginTop: '2%', marginLeft: '3.7%' }}
                                                >
                                                    <span onClick={() => handleGratShow()}>
                                                        <a className="">{data.gratuity}</a>
                                                    </span>
                                                </Col>
                                            </Form.Group>
                                        </div>
                                        <div className="col-8" style={{ marginLeft: '4%' }}>
                                            <Form.Group as={Row} className="mb-3">
                                                <Form.Label
                                                    column
                                                    sm={5}
                                                    style={{
                                                        textDecoration: 'underline'
                                                    }}
                                                >
                                                    Total Earnings
                                                </Form.Label>

                                                <Col
                                                    sm={5}
                                                    className="text-right"
                                                    style={{ marginTop: '2%', marginLeft: '3.7%' }}
                                                >
                                                    {formatNumber(data.thisMonth)}
                                                </Col>
                                            </Form.Group>
                                        </div>
                                        <div
                                            style={{
                                                marginLeft: '1rem',
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: '18px',
                                                    fontWeight: '600',
                                                    marginRight: '1rem'
                                                }}
                                            >
                                                {' '}
                                                {/* Added marginRight */}
                                                Deductions
                                            </div>

                                            <hr
                                                style={{
                                                    flex: '1' /* Ensures the line stretches */,
                                                    borderWidth: '3px',
                                                    borderColor: 'black'
                                                }}
                                            />
                                        </div>

                                        <div className="col-8" style={{ marginLeft: '4%' }}>
                                            <Form.Group as={Row} className="mb-3">
                                                <Form.Label column sm={6}>
                                                    LOP Days
                                                </Form.Label>

                                                <Col sm={5}>
                                                    <Form.Control
                                                        className="text-right"
                                                        onChange={handleInputChange}
                                                        name="lopDays"
                                                        min={0}
                                                        onInput={(e) => {
                                                            let value = e.target.value.replace(
                                                                /[^0-9]/g,
                                                                ''
                                                            )
                                                            if (value.length > 3)
                                                                value = value.slice(0, 3)
                                                            e.target.value = value
                                                            handleInputChange(e)
                                                        }}
                                                        type="number"
                                                        defaultValue={data.lopDays}
                                                        // onKeyPress={handleKeyPress}
                                                    />
                                                </Col>
                                            </Form.Group>
                                        </div>

                                        <div className="col-8" style={{ marginLeft: '4%' }}>
                                            <Form.Group as={Row} className="mb-3">
                                                <Form.Label column sm={6}>
                                                    Salary Advance Amount
                                                </Form.Label>

                                                <Col sm={5}>
                                                    <Form.Control
                                                        onChange={handleInputChange}
                                                        onInput={handleAmountInput}
                                                        name="loanAmount"
                                                        min={0}
                                                        type="number"
                                                        defaultValue={data.loanAmount}
                                                        // onKeyPress={handleKeyPress}
                                                    />
                                                </Col>
                                            </Form.Group>
                                        </div>
                                        <div className="col-8" style={{ marginLeft: '4%' }}>
                                            <Form.Group as={Row} className="mb-3">
                                                <Form.Label column sm={5}>
                                                    Salary Advance Balance
                                                </Form.Label>

                                                <Col
                                                    sm={5}
                                                    className="text-end"
                                                    style={{ marginTop: '2%', marginLeft: '3.7%' }}
                                                >
                                                    <span
                                                        onClick={() =>
                                                            onShowHandler('Loan Details')
                                                        }
                                                    >
                                                        <a className="">
                                                            {formatNumber(data.loanBalance)}
                                                        </a>
                                                    </span>
                                                </Col>
                                            </Form.Group>
                                        </div>
                                        <div className="col-8" style={{ marginLeft: '4%' }}>
                                            <Form.Group as={Row} className="mb-3">
                                                <Form.Label column sm={6}>
                                                    Miscellaneous Deduction Amount
                                                </Form.Label>

                                                <Col sm={5}>
                                                    <Form.Control
                                                        onChange={handleInputChange}
                                                        onInput={handleAmountInput}
                                                        name="miscellaneousDeductionAmount"
                                                        min={0}
                                                        type="number"
                                                        defaultValue={
                                                            data.miscellaneousDeductionAmounts
                                                        }
                                                        // onKeyPress={handleKeyPress}
                                                    />
                                                </Col>
                                            </Form.Group>
                                        </div>
                                        <div className="col-8" style={{ marginLeft: '4%' }}>
                                            <Form.Group as={Row} className="mb-3">
                                                <Form.Label column sm={6}>
                                                    Miscellaneous Deduction Caption
                                                </Form.Label>

                                                <Col sm={5}>
                                                    <Form.Control
                                                        onChange={handleInputChange}
                                                        name="miscellaneousDeductions"
                                                        min={0}
                                                        maxLength={100}
                                                        type="text"
                                                        defaultValue={data.miscellaneousDeductions}
                                                    />
                                                    {formErrors.miscellaneousDeductions && (
                                                        <p className="error">
                                                            {formErrors.miscellaneousDeductions}
                                                        </p>
                                                    )}
                                                </Col>
                                            </Form.Group>
                                        </div>

                                        <div className="col-8" style={{ marginLeft: '4%' }}>
                                            <Form.Group as={Row} className="mb-3">
                                                <Form.Label column sm={6}>
                                                    Current Tax
                                                </Form.Label>

                                                <Col sm={5}>
                                                    <Form.Control
                                                        onChange={handleInputChange}
                                                        onInput={handleAmountInput}
                                                        name="tax"
                                                        min={0}
                                                        type="number"
                                                        defaultValue={data.tax}
                                                        // onKeyPress={handleKeyPress}
                                                    />
                                                </Col>
                                            </Form.Group>
                                        </div>

                                        <div className="col-8" style={{ marginLeft: '4%' }}>
                                            <Form.Group as={Row} className="mb-3">
                                                <Form.Label
                                                    column
                                                    sm={5}
                                                    style={{
                                                        textDecoration: 'underline'
                                                    }}
                                                >
                                                    Total Deductions
                                                </Form.Label>

                                                <Col
                                                    sm={5}
                                                    className="text-right"
                                                    style={{ marginTop: '2%', marginLeft: '3.7%' }}
                                                >
                                                    {formatNumber(
                                                        Number(data.loanBalance || 0) +
                                                            Number(
                                                                data.miscellaneousDeductionAmount ||
                                                                    0
                                                            ) +
                                                            Number(data.tax || 0)
                                                    )}
                                                </Col>
                                            </Form.Group>
                                        </div>

                                        <div className="col-8" style={{ marginLeft: '4%' }}>
                                            <Form.Group as={Row} className="mb-3">
                                                <Form.Label column sm={5}>
                                                    YTD Tax
                                                </Form.Label>

                                                <Col
                                                    sm={5}
                                                    className="text-end"
                                                    style={{ marginTop: '2%', marginLeft: '3.7%' }}
                                                >
                                                    {/* {"ytdTax"} */}
                                                    <span
                                                        onClick={() => onShowHandler('YTD Details')}
                                                    >
                                                        <a className="">
                                                            {formatNumber(data.ytdTax)}
                                                        </a>
                                                    </span>
                                                </Col>
                                            </Form.Group>
                                        </div>

                                        <div className="col-8" style={{ marginLeft: '4%' }}>
                                            <Form.Group as={Row} className="mb-3">
                                                <Form.Label column sm={5}>
                                                    NetPay
                                                </Form.Label>

                                                <Col
                                                    sm={5}
                                                    className="text-end"
                                                    style={{ marginTop: '2%', marginLeft: '3.7%' }}
                                                >
                                                    {formatNumber(data.netPay)}
                                                </Col>
                                            </Form.Group>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="EmplmodalF">
                                {location && location.name == 'viewAllDetails' ? (
                                    <Button
                                        variant="addbtn"
                                        className="Button"
                                        onClick={exportPaySlip}
                                    >
                                        Download
                                    </Button>
                                ) : (
                                    <>
                                        {status && status.label == 'Completed' ? (
                                            ''
                                        ) : (
                                            <>
                                                {data && data.id != null ? (
                                                    <Button
                                                        variant="addbtn"
                                                        className="Button"
                                                        onClick={() => onUpdateHandler(data.status,true)}
                                                    >
                                                        Save
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="addbtn"
                                                        className="Button"
                                                        onClick={onSaveHandler}
                                                    >
                                                        Save
                                                    </Button>
                                                )}

                                                {status && status.label == 'Approved' ? (
                                                    <Button
                                                        variant="addbtn"
                                                        className="Button"
                                                        onClick={() =>
                                                            onUpdateHandler({
                                                                value: 5,
                                                                label: 'Completed'
                                                            }, false)
                                                        }
                                                    >
                                                        Complete
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="addbtn"
                                                        className="Button"
                                                        onClick={() =>
                                                            onUpdateHandler(
                                                                status && status.label == 'Saved'
                                                                    ? {
                                                                          value: 3,
                                                                          label: 'Submitted'
                                                                      }
                                                                    : {
                                                                          value: 4,
                                                                          label: 'Approved'
                                                                      },false
                                                            )
                                                        }
                                                        disabled={!data.id}
                                                    >
                                                        {status && status.label == 'Saved'
                                                            ? 'Submit'
                                                            : status && status.label == 'Submitted'
                                                              ? 'Approve'
                                                              : 'Submit'}
                                                    </Button>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}

                                <Button
                                    className="Button"
                                    variant="secondary"
                                    onClick={() => navigate('/fullAndFinalSettllementList')}
                                >
                                    {cancelButtonName}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Modal
                show={show}
                size={'lg'}
                onHide={onCloseHandler}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header>
                    <Modal.Title>
                        {data.employeeName} {modelHeading}
                    </Modal.Title>
                    <Button variant="secondary" onClick={onCloseHandler}>
                        X
                    </Button>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    {modelHeading == 'LOP Details' && (
                        <LopModal id={data.employeeId} locId={data.locationId} />
                    )}

                    {modelHeading == 'Leave Details' && (
                        <LeavesModal
                            id={data.employeeId}
                            locId={data.locationId}
                            fromDate={data.payPeriodStartDate}
                            toDate={data.payPeriodEndDate}
                        />
                    )}

                    {modelHeading == 'TimeSheet Details' && (
                        <TimeSheetModal
                            fromDate={data.payPeriodStartDate}
                            toDate={data.payPeriodEndDate}
                            id={data.employeeId}
                        />
                    )}

                    {modelHeading == 'Loan Details' && (
                        <LoanModal id={data.employeeId} locId={data.locationId} />
                    )}
                    {modelHeading == 'Earning and deduction details' && (
                        <ThismonthDetails salaryComponents={data.salaryComponents} />
                    )}
                    {modelHeading == 'YTD Details' && (
                        <YTDDetails
                            ytdComponents={data.ytdCalculations}
                            deductionTotal={data.ytdDeductions}
                            earningTotal={data.ytdIncome}
                        />
                    )}
                </Modal.Body>
            </Modal>

            <Modal
                show={GratShow}
                size={'lg'}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header>
                    <Modal.Title>Gratuity Calculations</Modal.Title>
                    <Button variant="secondary" onClick={handleClose}>
                        X
                    </Button>
                </Modal.Header>
                <Modal.Body className="">
                    <form className="">
                        <div className="col-6">
                            <Form.Group as={Row} className="mb-3">
                                <Form.Label column sm={5}>
                                    Basic :
                                </Form.Label>

                                <Col sm={5} style={{ marginTop: '2%', marginLeft: '3.7%' }}>
                                    {data.prevBasic}
                                </Col>
                            </Form.Group>
                        </div>
                        <div className="col-6">
                            <Form.Group as={Row} className="mb-3">
                                <Form.Label column sm={5}>
                                    Tenure :
                                </Form.Label>

                                <Col sm={5} style={{ marginTop: '2%', marginLeft: '3.7%' }}>
                                    {data.tenure}
                                </Col>
                            </Form.Group>
                        </div>
                        <div className="col-6">
                            <Form.Group as={Row} className="mb-3">
                                <Form.Label column sm={5}>
                                    Calculations :
                                </Form.Label>

                                <Col sm={7} style={{ marginTop: '2%', marginLeft: '3.7%' }}>
                                    <span className="text-bold">
                                        {data.prevBasic + '*' + data.tenure + '*' + '15/26'}
                                    </span>
                                </Col>
                            </Form.Group>
                        </div>
                        <div className="col-6">
                            <Form.Group as={Row} className="mb-3">
                                <Form.Label column sm={5}>
                                    Gratuity :
                                </Form.Label>

                                <Col sm={5} style={{ marginTop: '2%', marginLeft: '3.7%' }}>
                                    {data.gratuity}
                                </Col>
                            </Form.Group>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>
        </div>
    )
}
export default FullAndFinalSettllements
