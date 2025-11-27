import { DatePicker } from 'antd'
import moment from 'moment'
import React, { useState } from 'react'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { formatCurrency } from '../../../Common/CommonComponents/CurrencyFormate'
import TableWith5Rows from '../../../Common/Table/TableWith5Rows'
import { cancelButtonName } from '../../../Common/Utilities/Constants'

const PriceHistory = (props) => {
    const { priceHistory, setPriceHistory, setPriceShow, close } = props // destructing props
    const [formData, setFormData] = useState({}) // State for form data to add
    const [formErrors, setFormErrors] = useState({}) // State for handling form errors
    const [startDate, setStartDate] = useState(null) // state for effected date for price

    // Handle input changes dynamically
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
        setFormErrors({ ...formErrors, [name]: '' }) // Reset error for the field being edited
    }

    // update start data by changing data
    const handleStartDate = (e) => {
        const selectedDate = moment(e).format('YYYY-MM-DD')
        setStartDate(selectedDate)
        setFormErrors({ ...formErrors, startDate: '' }) // Reset error for startDate
    }

    // add price object to list
    const addPriceDto = () => {
        const priceObj = {
            price: formData.price,
            startDate: startDate
        }
        if (priceObj.price == undefined || priceObj.price == null) {
            setFormErrors(validate(priceObj))
        } else if (priceObj.startDate == null) {
            setFormErrors(validate(priceObj))
        } else {
            const priceData = [...priceHistory, priceObj]
            setPriceHistory(priceData)
            setPriceShow(false)
        }
    }

    // Basic form validations
    const validate = (values) => {
        const errors = {}

        if (values.price == null) {
            errors.price = 'Required'
        }
        if (values.startDate == null) {
            errors.startDate = 'Required'
        }
        return errors
    }
    // Table colums
    const COLUMNS = [
        {
            Header: 'Price',
            accessor: 'price',
            headerAlign: 'right',
            Cell: ({ row }) => (
                <div className="numericData">{formatCurrency(row.original.price, 'INR')}</div>
            )
        },
        {
            Header: 'Start Date',
            accessor: 'startDate',
            Cell: ({ row }) => (
                <div className="text-left" style={{ marginRight: '3.8rem' }}>
                    {row.original.startDate}
                </div>
            )
        },

        {
            Header: 'End Date',
            accessor: 'endDate',
            Cell: ({ row }) => <div className="text-left">{row.original.endDate}</div>
        }
    ]

    // Validation for not allowing negative values
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
                                Price <span className="error">*</span>
                            </Form.Label>
                            <Col sm={4}>
                                <Form.Control
                                    className="textField"
                                    defaultValue={formData.price}
                                    onChange={handleInputChange}
                                    onKeyPress={onNumberValidate}
                                    onPaste={(e) => e.preventDefault()}
                                    name="price"
                                    type="number"
                                    maxLength={10}
                                    min={0}
                                />
                                <p className="error">{formErrors.price}</p>
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
                                            priceHistory && priceHistory.length > 0
                                                ? new Date(priceHistory[0].startDate)
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
                <div className="table mb-4">
                    {priceHistory != null ? (
                        <TableWith5Rows key={priceHistory.length} columns={COLUMNS} serialNumber={true} data={priceHistory} />
                    ) : (
                        []
                    )}
                </div>
                <div className="btnCenter mb-3">
                    <Button className="Button" variant="addbtn" onClick={addPriceDto}>
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

export default PriceHistory
