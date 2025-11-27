import { DatePicker } from 'antd'
import moment from 'moment'
import React, { useState } from 'react'
import { Button, Col, Form, Row } from 'react-bootstrap'
import Select from 'react-select'
import TableWith5Rows from '../../../Common/Table/TableWith5Rows'
import { cancelButtonName } from '../../../Common/Utilities/Constants'

const DiscountHistory = (props) => {
    // Destructure props
    const { discountHistory, setDiscountHistory, setShow, close, modulePrice } = props

    const [formData, setFormData] = useState({
        discount: '',
        unit: '%' // default unit is percentage
    })
    const [formErrors, setFormErrors] = useState({}) // State for error handling
    const [startDate, setStartDate] = useState(null) // state for discount applicable date

    // Validate and handle discount input changes
    const handleDiscountChange = (e) => {
        const { name, value } = e.target
        if (formData.unit == '%') {
            if (parseFloat(value) > 100) {
                return
            }
            setFormData({ ...formData, [name]: value })
        } else {
            if (parseFloat(value) > parseFloat(modulePrice)) {
                return
            }
            setFormData({ ...formData, [name]: value })
        }
    }

    // Handle date picker changes
    const handleStartDate = (e) => {
        const selectedDate = moment(e).format('YYYY-MM-DD')
        setStartDate(selectedDate)
    }
    // Add discount entry to the history list
    const addDiscountDto = () => {
        const discountObj = {
            discount: formData.discount,
            unit: formData.unit,
            startDate: startDate
        }

        if (discountObj.discount == undefined || discountObj.discount.length <= 0) {
            setFormErrors(validate(discountObj))
        } else if (discountObj.startDate == null) {
            setFormErrors(validate(discountObj))
        } else {
            let updatedDiscounts = [...discountHistory]
            const existingIndex = updatedDiscounts.findIndex(
                (item) => !item.id && item.startDate === discountObj.startDate
            )

            if (existingIndex !== -1) {
                updatedDiscounts[existingIndex] = discountObj
            } else {
                updatedDiscounts = [discountObj, ...updatedDiscounts]
            }
            setDiscountHistory(updatedDiscounts)
            setShow(false)
        }
    }
    // Basic validation rules
    const validate = (values) => {
        const errors = {}
        if (values.discount == null || values.discount == '') {
            errors.discount = 'Required'
        }
        if (values.startDate == null) {
            errors.startDate = 'Required'
        }
        return errors
    }
    // Options for unit dropdown
    const options = [
        { label: '%', value: '%' },
        { label: 'Value', value: 'value' }
    ]
    // Handle dropdown selection
    const onValueChange = (option, name) => {
        setFormData({ ...formData, [name]: option.value, ['discount']: 0 })
    }
    // Columns for the discount table
    const COLUMNS = [
        {
            Header: 'Discount',
            accessor: 'discount',
            headerAlign: 'right',
            Cell: ({ row }) => (
                <div className="numericData">
                    {row.original.unit == 'value' ? <>&#8377; </> : ''}
                    {Number(row.original.discount ? row.original.discount : 0).toFixed(2)}
                    {row.original.unit == '%' ? row.original.unit : ''}
                </div>
            )
        },
        {
            Header: 'Start Date',
            accessor: 'startDate',
            Cell: ({ row }) => <div className="text-left">{row.original.startDate}</div>
        },

        {
            Header: 'End Date',
            accessor: 'endDate',
            Cell: ({ row }) => <div className="text-left">{row.original.endDate}</div>
        }
    ]
    // Prevent entering invalid characters in discount field
    const onNumberValidate = (event) => {
        if (event.key === '-' || event.key === 'e') {
            event.preventDefault()
        }
    }

    return (
        <div>
            <>
                <div className="formBody">
                    <div className="col-">
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm={3}>
                                Discount
                                <span className="error"> *</span>
                            </Form.Label>
                            <Col sm={4}>
                                <Form.Control
                                    className="textField"
                                    value={formData.discount}
                                    onChange={handleDiscountChange}
                                    name="discount"
                                    type="number"
                                    onKeyPress={onNumberValidate}
                                    onPaste={(e) => e.preventDefault()}
                                    min={0}
                                    max={formData.unit == '%' && 100}
                                />
                                <p className="error">{formErrors.discount}</p>
                            </Col>
                            <Col sm={4}>
                                <Select
                                    defaultValue={{ label: '%', value: '%' }}
                                    options={options}
                                    name="unit"
                                    onChange={(e) => onValueChange(e, 'unit')}
                                />
                            </Col>
                        </Form.Group>
                    </div>
                    <div className="col-">
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm={3}>
                                Effective Date <span className="error">*</span>
                            </Form.Label>
                            <Col sm={6}>
                                <DatePicker
                                    placeholder="Select Date"
                                    allowClear={false}
                                    onChange={handleStartDate}
                                    disabledDate={(current) => {
                                        const tomorrow =
                                            discountHistory.length > 0
                                                ? new Date(
                                                    discountHistory[
                                                        discountHistory.length - 1
                                                    ].startDate
                                                )
                                                : new Date()
                                        tomorrow.setDate(tomorrow.getDate())
                                        let customDate = moment(tomorrow).format('YYYY-MM-DD')
                                        return current && current < moment(customDate, 'YYYY-MM-DD')
                                    }}
                                    required
                                    format={'DD-MM-YYYY'}
                                    size="sm"
                                    onBlur={(e) =>
                                        !e.target.value
                                            ? setFormErrors({
                                                ...formErrors,
                                                startDate: 'Required'
                                            })
                                            : setFormErrors({
                                                ...formErrors,
                                                startDate: ''
                                            })
                                    }
                                    name="dateOfJoining"
                                />
                                <p className="error">{formErrors.startDate}</p>
                            </Col>
                        </Form.Group>
                    </div>
                </div>
                {/* Discount Table */}
                <div className="table mb-3">
                    {discountHistory != null ? (
                        <TableWith5Rows
                            columns={COLUMNS}
                            serialNumber={true}
                            data={discountHistory}
                        />
                    ) : (
                        []
                    )}
                </div>
                {/* resolved bug 1747*/}
                <div className="btnCenter">
                    <Button className="Button" variant="addbtn" onClick={addDiscountDto}>
                        Add
                    </Button>
                    <Button className="Button" variant="secondary" onClick={close}>
                        {cancelButtonName}
                    </Button>
                </div>
            </>
        </div>
    )
}

export default DiscountHistory
