import React, { useEffect, useState } from 'react'
import { Button, Col, Form, Row } from 'react-bootstrap'
import moment from 'moment'
import { DatePicker } from 'antd'
import Select from 'react-select'

const DataBetweenDates = ({
    setFromDate,
    setToDate,
    setStatus,
    options,
    handleGo,
    defaultValue,
    dateOfJoining,
    showEmptyToDate = false // <-- add this prop
}) => {
    const [startDate, setStartDate] = useState(null) // State for startDate
    const [endDate, setEndDate] = useState(null) // State for end Date

    // set end date to before 30 days date
    useEffect(() => {
        const pastdate = moment().subtract(30, 'days').toDate()
        setStartDate(moment(pastdate).format('YYYY-MM-DD'))
        setFromDate(moment(pastdate).format('YYYY-MM-DD'))

        if (!showEmptyToDate) {
            const presentdate = moment()
            setEndDate(moment(presentdate).format('YYYY-MM-DD'))
            setToDate(moment(presentdate).format('YYYY-MM-DD'))
        }
    }, [])

    // update start date by changing date
    const handleFromDate = (e) => {
        const selectedDate = moment(e).format('YYYY-MM-DD')
        setFromDate(selectedDate)
        setStartDate(selectedDate)
    }

    // updage end date by changing date
    const handleToDate = (e) => {
        const selectedDate = moment(e).format('YYYY-MM-DD')
        setToDate(selectedDate)
        setEndDate(selectedDate)
    }

    // update status by selecting status
    const handleStatusSelect = (select) => {
        setStatus(select.value)
    }
    return (
        <>
            <div className="row align-items-center">
                <div className="col-sm-4">
                    <Form.Group as={Row} className="mb-0" controlId="formGroupFromDate">
                        <Form.Label column sm={4}>
                            From Date{' '}
                        </Form.Label>
                        <Col sm={5}>
                            <DatePicker
                                placeholder=""
                                inputReadOnly
                                size="sm"
                                allowClear={false}
                                value={startDate ? moment(startDate) : null}
                                format={'DD-MM-YYYY'}
                                className="datepicker datePickerforBetweenDates w-100"
                                onChange={handleFromDate}
                                name="fromDate"
                                disabledDate={(current) => {
                                    const end = moment(endDate, 'YYYY-MM-DD')
                                    const start = dateOfJoining
                                        ? moment(dateOfJoining, 'YYYY-MM-DD').subtract(1, 'day')
                                        : null
                                    return current && (current <= start || current > end)
                                }}
                            />
                        </Col>
                    </Form.Group>
                </div>

                <div className="col-sm-4">
                    <Form.Group as={Row} className="mb-0" controlId="formGroupToDate">
                        <Form.Label column sm={4}>
                            To Date{' '}
                        </Form.Label>
                        <Col sm={5}>
                            <DatePicker
                                placeholder=""
                                inputReadOnly
                                size="sm"
                                allowClear={false}
                                // value={endDate ? moment(endDate) : null}
                                value={
                                    showEmptyToDate && !endDate
                                        ? null
                                        : endDate
                                          ? moment(endDate)
                                          : null
                                }
                                format={'DD-MM-YYYY'}
                                className="datepicker datePickerforBetweenDates w-100"
                                onChange={handleToDate}
                                name="toDate"
                                //resolved jira ticket 1778
                                disabledDate={(current) => {
                                    return current && current < moment(startDate, 'YYYY-MM-DD')
                                }}
                            />
                        </Col>
                    </Form.Group>
                </div>

                <div className="col-sm-3">
                    <Form.Group as={Row} className="mb-0" controlId="formGroupStatus">
                        <Form.Label column sm={6}>
                            Status{' '}
                        </Form.Label>
                        <Col sm={6}>
                            <Select
                                className="datePickerforBetweenDates statusSelect w-100"
                                classNamePrefix="mySelect"
                                placeholder=""
                                defaultValue={defaultValue}
                                options={options}
                                onChange={handleStatusSelect}
                            />
                        </Col>
                    </Form.Group>
                </div>

                <div className="col-sm-1 text-center">
                    <Button
                        size="sm"
                        style={{ paddingTop: '4.2px' }}
                        variant="addbtn"
                        onClick={handleGo}
                    >
                        Go
                    </Button>
                </div>
            </div>
        </>
    )
}

export default DataBetweenDates
