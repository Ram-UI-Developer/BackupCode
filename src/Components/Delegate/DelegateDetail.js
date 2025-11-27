import React, { useEffect, useState } from 'react'
import PageHeader from '../../Common/CommonComponents/PageHeader'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { DatePicker } from 'antd'
import Select from 'react-select'
import { cancelButtonName } from '../../Common/Utilities/Constants'
import { useLocation, useNavigate } from 'react-router-dom'
import moment from 'moment'
import { useSelector } from 'react-redux'
import { getAllByIdWithStatus, getById, save, update } from '../../Common/Services/CommonService'
import { ToastError } from '../../Common/CommonComponents/ToastCustomized'
import { updateValidation } from '../../Common/CommonComponents/FormControlValidation'
import { toast } from 'react-toastify'
import { getAllByDelegateManager } from '../../Common/Services/OtherServices'

const DelegateDetail = () => {
    const userDetails = useSelector((state) => state.user.userDetails)
    const navigate = useNavigate() // for redirect
    const [loading, setLoading] = useState(false) // state for page loader
    const [employees, setEmployees] = useState([]) // state for employee list
    let entity = 'managerdelegate' // entity name for API call
    const delegateid = useLocation().state.id // getting delegate ID from the state passed by the previous page
    const [formData, setFormData] = useState({
        "delegateManagerId": '',
        "fromDate": null,
        "toDate": null,
        "timeSheetsInclude": false,
        "leavesInclude": false,
        "expensesInclude": false,
        "description": ''
    }) // state for form data
    const [formErrors, setFormErrors] = useState({
        delegateManagerId: '',
        fromDate: '',
        toDate: '',
        applicableTo: ''
    }) // state for form errors
    const [delegate, setDelegate] = useState({}) // state for delegate data
    const [delegateList, setDelegateList] = useState([]) // state for list of delegates
    const [modules, setModules] = useState([]) // state for modules
    useEffect(() => {
        onGetActiveEmployeesHandler()
        onGetAllHandler()
        if (delegateid) {
            onGetByIdHandler()
        }
    }, [])

    useEffect(() => {
        onBlurHandler()
    }, [formData.fromDate, formData.toDate, delegateList])

    const onGetActiveEmployeesHandler = () => {
        getAllByIdWithStatus({
            entity: 'employees',
            organizationId: userDetails.organizationId,
            status: 'Active'
        })
            .then(
                (res) => {
                    if (res.statusCode == 200) {
                        const employeeOptions = res.data.map((item) => ({
                            value: item.id,
                            label: `${item.firstName} ${item.lastName}`
                        }))
                        setEmployees(employeeOptions.filter(
                            (item) => item.value !== userDetails.employeeId
                        )) // filter out the current user from the list
                        setLoading(false)
                    }
                }
            )
            .catch(() => { })
    }

    const onGetAllHandler = () => {
        getAllByDelegateManager({ entity: "managerdelegate", id: userDetails.employeeId, organizationId: userDetails.organizationId })
            .then((res) => {
                if (res.statusCode === 200) {
                    // Assuming res.data is the array of delegates
                    setDelegateList(res.data)
                }
            })
            .catch((err) => {
                console.error('Error fetching delegates:', err)
                // Handle error appropriately, e.g., show a toast notification
                // ToastError(err.message)
            })
    }


    const onSelectHandler = (selectedOption) => {
        setFormData((prevData) => ({
            ...prevData,
            delegateManagerId: selectedOption.value
        }))
        setFormErrors((prevErrors) => ({
            ...prevErrors,
            delegateManagerId: selectedOption ? '' : 'Required'
        }))
    }

    const onDateChange = (date, dateType) => {
        setFormData((prevData) => {
            // If updating fromDate and it's greater than toDate, reset toDate
            if (dateType === 'fromDate' && prevData.toDate && date > prevData.toDate) {
                return { ...prevData, fromDate: date, toDate: null }
            }
            return {
                ...prevData,
                [dateType]: date
            }
        })
        setFormErrors((prevErrors) => ({
            ...prevErrors,
            [dateType]: date ? '' : 'Required'
        }))
        setModules([]) // Reset modules when date changes
    }

    const onBlurHandler = () => {
        if (!formData.fromDate || !formData.toDate) return;

        const formFrom = moment(formData.fromDate).startOf('day');
        const formTo = moment(formData.toDate).endOf('day');

        // Get all overlapping records
        const matchedRecords = delegateList.filter(item => {
            const itemFrom = moment(item.startDate).startOf('day');
            const itemTo = moment(item.endDate).endOf('day');

            return (
                // Case 1 & 2: Your fromDate or toDate is inside an existing record's range
                formFrom.isBetween(itemFrom, itemTo, undefined, '[]') ||
                formTo.isBetween(itemFrom, itemTo, undefined, '[]') ||

                // Case 3 & 4: Existing record's startDate or endDate is inside your range
                itemFrom.isBetween(formFrom, formTo, undefined, '[]') ||
                itemTo.isBetween(formFrom, formTo, undefined, '[]')
            );
        });
        const filteredRecords = matchedRecords.filter(record => record.status == "PENDING" && record.id != delegateid || record.status == "APPROVED" && record.id != delegateid);

        if (filteredRecords.length > 0) {
            // Merge modules from all matched records
            const allModules = filteredRecords
                .map(record => record.modules || '')
                .join(',')
                .split(',')
                .map(m => m.trim())
                .filter(m => m); // remove empty strings


            setModules(allModules.join(','));

            setFormData({
                ...formData,
                timeSheetsInclude: allModules.includes('Timesheets') ? false : formData.timeSheetsInclude,
                leavesInclude: allModules.includes('Leaves') ? false : formData.leavesInclude,
                expensesInclude: allModules.includes('Expenses') ? false : formData.expensesInclude
            });
        }
    };





    const onCheckboxChange = (e) => {
        const { name, checked } = e.target;
        const updatedFormData = {
            ...formData,
            [name]: checked
        };
        setFormData(updatedFormData);
        const isAnyChecked =
            updatedFormData.timeSheetsInclude ||
            updatedFormData.leavesInclude ||
            updatedFormData.expensesInclude;
        setFormErrors((prevErrors) => ({
            ...prevErrors,
            applicableTo: isAnyChecked ? '' : 'At least one option must be selected'
        }));
    };


    const validateForm = () => {
        let errors = {}
        if (!formData.delegateManagerId) {
            errors.delegateManagerId = 'Required'
        }
        if (!formData.fromDate) {
            errors.fromDate = 'Required'
        }
        if (!formData.toDate) {
            errors.toDate = 'Required'
        } else if (formData.fromDate && formData.toDate < formData.fromDate) {
            errors.toDate = 'To date cannot be before From date'
        }
        if (
            !formData.timeSheetsInclude &&
            !formData.leavesInclude &&
            !formData.expensesInclude
        ) {
            errors.applicableTo = 'At least one option must be selected'
        }
        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        const object = {
            "createdBy": userDetails.employeeId,
            "modifiedBy": null,
            "organizationId": userDetails.organizationId,
            "primaryManagerId": userDetails.employeeId,
            "delegateManagerId": formData.delegateManagerId,
            "startDate": moment(formData.fromDate).format('YYYY-MM-DD'),
            "endDate": moment(formData.toDate).format('YYYY-MM-DD'),
            "timeSheetsInclude": formData.timeSheetsInclude,
            "leavesInclude": formData.leavesInclude,
            "expensesInclude": formData.expensesInclude,
            "description": formData.description,
            "status": "PENDING",
            "remarks": ''
        }


        if (validateForm()) {
            setLoading(true)

            save({ entity: entity, organizationId: userDetails.organizationId, body: object })
                .then((response) => {
                    setLoading(false)
                    if (response.statusCode === 200) {
                        // ToastSuccess(response.message)
                        toast.success('Manager delegate saved successfully.')
                        navigate('/delegateList')
                    } else {
                        // Handle error response
                        console.error('Error saving delegate:', response.data)
                    }
                })
                .catch((err) => {
                    setLoading(false)
                    ToastError(err.message)
                })
        }
    }

    const onGetByIdHandler = () => {
        getById({
            entity: entity,
            organizationId: userDetails.organizationId,
            id: delegateid
        })
            .then((res) => {
                if (res.statusCode === 200) {
                    const data = res.data
                    setFormData({
                        createdBy: data.createdBy,
                        createdDate: data.createdDate,
                        modifiedBy: data.modifiedBy,
                        primaryManagerId: data.primaryManagerId,
                        delegateManagerId: data.delegateManagerId,
                        fromDate: data.startDate ? moment(data.startDate) : null,
                        toDate: data.endDate ? moment(data.endDate) : null,
                        timeSheetsInclude: data.timeSheetsInclude,
                        leavesInclude: data.leavesInclude,
                        expensesInclude: data.expensesInclude,
                        description: data.description,
                        status: data.status,
                        remarks: data.remarks
                    })
                    setDelegate({
                        createdBy: data.createdBy,
                        createdDate: data.createdDate,
                        modifiedBy: data.modifiedBy,
                        primaryManagerId: data.primaryManagerId,
                        delegateManagerId: data.delegateManagerId,
                        fromDate: data.startDate ? moment(data.startDate) : null,
                        toDate: data.endDate ? moment(data.endDate) : null,
                        timeSheetsInclude: data.timeSheetsInclude,
                        leavesInclude: data.leavesInclude,
                        expensesInclude: data.expensesInclude,
                        description: data.description,
                        status: data.status,
                        remarks: data.remarks
                    })
                } else {
                    console.error('Error fetching delegate details:', res.message)
                }
            })
            .catch((err) => {
                console.error('Error fetching delegate details:', err)
                ToastError(err.message)
            })
    }

    const onUpdateHandler = (e) => {
        e.preventDefault();
        const object = {
            "createdBy": formData.createdBy,
            "createdDate": formData.createdDate,
            "modifiedBy": userDetails.employeeId,
            "organizationId": userDetails.organizationId,
            "primaryManagerId": formData.primaryManagerId,
            "delegateManagerId": formData.delegateManagerId,
            "startDate": moment(formData.fromDate).format('YYYY-MM-DD'),
            "endDate": moment(formData.toDate).format('YYYY-MM-DD'),
            "timeSheetsInclude": formData.timeSheetsInclude,
            "leavesInclude": formData.leavesInclude,
            "expensesInclude": formData.expensesInclude,
            "description": formData.description,
            "status": "PENDING",
            "remarks": formData.remarks
        }

        if (updateValidation(delegate, formData)) {
            toast.info('No changes made to update.')
            return
        }
        else if (validateForm()) {
            setLoading(true)
            update({ entity: entity, organizationId: userDetails.organizationId, id: delegateid, body: object })
                .then((response) => {
                    setLoading(false)
                    if (response.statusCode === 200) {
                        // ToastSuccess(response.message)
                        toast.success('Manager delegate updated successfully.')
                        navigate('/delegateList')
                    } else {
                        // Handle error response
                        console.error('Error saving delegate:', response.data)
                    }
                })
                .catch((err) => {
                    setLoading(false)
                    ToastError(err.message)
                })
        }
    }

    return (
        <>
            <section className="section detailBackground">
                <div className="container-fluid d-flex flex-column" style={{ minHeight: '82vh' }}>
                    <div className="row flex-grow-1">
                        <div className="col-md-12 d-flex flex-column flex-grow-1">
                            <div className="card-primary d-flex flex-column flex-grow-1">
                                <PageHeader pageTitle="Delegate" />
                                <div className="flex-grow-1 d-flex flex-column justify-content-between">
                                    <form className="card-body">
                                        <div className="container">
                                            <Row className="mb-3">

                                                <div className="col-md-6">
                                                    <Form.Group
                                                        as={Row}
                                                        md={12}
                                                        controlId="formGridFromDate"
                                                    >
                                                        <Form.Label column style={{ whiteSpace: 'nowrap' }}>
                                                            From Date <span className="error"> *</span>
                                                        </Form.Label>
                                                        <Col md={7}>
                                                            <DatePicker
                                                                className="form-control"
                                                                placeholderText="Select date"
                                                                clearIcon={false}
                                                                onChange={(date) =>
                                                                    onDateChange(date, 'fromDate')
                                                                }
                                                                value={formData.fromDate}
                                                                disabledDate={(current) => {
                                                                    // Disable today and all past dates
                                                                    return (
                                                                        current &&
                                                                        current <= moment().endOf('day')
                                                                    )
                                                                }}
                                                                onBlur={onBlurHandler}
                                                            />
                                                            {formErrors.fromDate && (
                                                                <span className="error">
                                                                    {formErrors.fromDate}
                                                                </span>
                                                            )}
                                                        </Col>
                                                        <Col md={1}>
                                                            {" "}
                                                        </Col>
                                                    </Form.Group>
                                                </div>
                                                <div className="col-md-6">
                                                    <Form.Group
                                                        as={Row}
                                                        md={12}
                                                        controlId="formGridToDate"
                                                    >
                                                        <Col md={1}>
                                                            {" "}
                                                        </Col>
                                                        <Form.Label column style={{ whiteSpace: 'nowrap' }}>
                                                            To Date <span className="error"> *</span>
                                                        </Form.Label>
                                                        <Col md={7}>
                                                            <DatePicker
                                                                clearIcon={false}
                                                                onChange={(date) =>
                                                                    onDateChange(date, 'toDate')
                                                                }
                                                                className="form-control"
                                                                placeholderText="Select date"
                                                                disabled={formData.fromDate ? false : true}
                                                                value={formData.toDate}
                                                                disabledDate={(current) => {
                                                                    if (!formData.fromDate) return true // Disable all if fromDate is not selected
                                                                    const fromDate = moment(
                                                                        formData.fromDate
                                                                    ).startOf('day')
                                                                    return current && current < fromDate
                                                                }}
                                                                onBlur={onBlurHandler}
                                                            />
                                                            {formErrors.toDate && (
                                                                <span className="error">
                                                                    {formErrors.toDate}
                                                                </span>
                                                            )}
                                                        </Col>

                                                    </Form.Group>
                                                </div>

                                            </Row>

                                            <Row className="mb-3">
                                                <div className="col-md-6">
                                                    <Form.Group
                                                        as={Row}
                                                        md={12}
                                                        controlId="formGridDelegateTo"
                                                    >
                                                        <Form.Label column style={{ whiteSpace: 'nowrap' }}>
                                                            Delegate To{' '}
                                                            <span className="error"> *</span>
                                                        </Form.Label>
                                                        <Col md={7}>
                                                            <Select
                                                                placeholder="Select"
                                                                onChange={onSelectHandler}
                                                                options={employees}
                                                                value={employees.find(
                                                                    (item) =>
                                                                        item.value == formData.delegateManagerId
                                                                )}
                                                            />
                                                            {formErrors.delegateManagerId && (
                                                                <span className="error">
                                                                    {formErrors.delegateManagerId}
                                                                </span>
                                                            )}
                                                        </Col>
                                                        <Col md={1}>
                                                            {" "}
                                                        </Col>
                                                    </Form.Group>
                                                </div>
                                                <div className="col-md-6">
                                                    <Form.Group
                                                        as={Row}
                                                        md={12}
                                                        controlId="formGridApplicableTo"
                                                    >
                                                        <Col md={1}>
                                                            {" "}
                                                        </Col>
                                                        <Form.Label
                                                            column
                                                            className="me-3 mb-0"
                                                            style={{ whiteSpace: 'nowrap' }}
                                                        >
                                                            Applicable To{' '}
                                                            <span className="error"> *</span>
                                                        </Form.Label>
                                                        <Col md={7} style={{ marginTop: '1.5%' }}>
                                                            <div className="d-flex align-items-baseline gap-3">
                                                                <Form.Check
                                                                    type="checkbox"
                                                                    name="timeSheetsInclude"
                                                                    onChange={onCheckboxChange}
                                                                    checked={
                                                                        formData.timeSheetsInclude
                                                                    }
                                                                    label="Timesheets"
                                                                    disabled={modules.includes('Timesheets')}
                                                                    className="mb-0"
                                                                />
                                                                <Form.Check
                                                                    type="checkbox"
                                                                    name="leavesInclude"
                                                                    onChange={onCheckboxChange}
                                                                    checked={
                                                                        formData.leavesInclude
                                                                    }
                                                                    label="Leaves"
                                                                    disabled={modules.includes('Leaves')}
                                                                    className="mb-0"
                                                                />
                                                                <Form.Check
                                                                    type="checkbox"
                                                                    name="expensesInclude"
                                                                    onChange={onCheckboxChange}
                                                                    checked={
                                                                        formData.expensesInclude
                                                                    }
                                                                    label="Expenses"
                                                                    disabled={modules.includes('Expenses')}
                                                                    className="mb-0"
                                                                />
                                                            </div>

                                                            {formErrors.applicableTo && (
                                                                <span className="error">
                                                                    {formErrors.applicableTo}
                                                                </span>
                                                            )}
                                                        </Col>

                                                    </Form.Group>
                                                </div>

                                            </Row>
                                            <Row className="mb-3">
                                                <div className="col-md-6">
                                                    <Form.Group
                                                        as={Row}
                                                        md={12}
                                                        controlId="formGridDescription"
                                                    >
                                                        <Form.Label column style={{ whiteSpace: 'nowrap' }}>Description</Form.Label>
                                                        <Col md={7}>
                                                            <Form.Control
                                                                type="text"
                                                                as={'textarea'}
                                                                placeholder="Type here"
                                                                maxLength={250}
                                                                value={formData.description}
                                                                onChange={(e) =>
                                                                    setFormData({
                                                                        ...formData,
                                                                        description: e.target.value
                                                                    })
                                                                }
                                                            />
                                                        </Col>
                                                        <Col md={1}>
                                                            {" "}
                                                        </Col>
                                                    </Form.Group>
                                                </div>
                                            </Row>
                                        </div>
                                    </form>

                                    <div className="btnCenter mt-auto mb-3 text-center">
                                        {delegateid ? <Button
                                            variant="addbtn"
                                            className="Button"
                                            type="button"
                                            style={{ marginRight: '2%' }}
                                            onClick={onUpdateHandler}
                                            disabled={loading}
                                        >
                                            Update
                                        </Button> : <Button
                                            variant="addbtn"
                                            className="Button"
                                            type="button"
                                            style={{ marginRight: '2%' }}
                                            onClick={handleSubmit}
                                            disabled={loading}
                                        >
                                            Submit
                                        </Button>}
                                        <Button
                                            variant="secondary"
                                            className="Button"
                                            onClick={() => navigate('/delegateList')}
                                        >
                                            {cancelButtonName}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default DelegateDetail
