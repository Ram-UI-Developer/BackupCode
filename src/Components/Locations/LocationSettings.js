import React, { useEffect, useState } from 'react'
import { Col, Tabs } from 'react-bootstrap'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Tab from 'react-bootstrap/Tab'
import DateAndMonths from '../../Common/CommonComponents/DateAndMonths'
import Shifts from './Shifts'
const LocationSettings = ({
    formErrors,
    setFormErrors,
    settings,
    setSettings,
    setShifts,
    shifts
}) => {

    // const [reimbursement, setReimbursement] = useState(false) //state for reimburse checkBox
    // const [overtime, setovertime] = useState(false) //state for overtime checkBox
    const [locationSettings, setLocationSettings] = useState({}) //state for locationSettings
    const [dateLength, setDateLength] = useState() //state for daylength of the month
    const onMonthChangeHandler = (option) => {
        //handling the month
        setLocationSettings((prevSettings) => ({
            ...prevSettings,
            ['financialYearStartMonth']: option.value
        }))
        setSettings((prevSettings) => ({
            ...prevSettings,
            ['financialYearStartMonth']: option.value
        }))
        !option
            ? setFormErrors({ ...formErrors, ['financialYearStartMonth']: 'Required' })
            : setFormErrors({ ...formErrors, ['financialYearStartMonth']: '' })
    }

    useEffect(() => {
        setLocationSettings(settings)
        // setReimbursement(settings.reimbursement)
        // setovertime(settings.overtime)
    }, [settings])

    useEffect(() => {
        if (
            locationSettings.month == 'Apr' ||
            locationSettings.month == 'Jun' ||
            locationSettings.month == 'Sep' ||
            locationSettings.month == 'Nov'
        ) {
            setDateLength(30)
        } else if (locationSettings.month == 'Feb') {
            setDateLength(28)
        } else {
            setDateLength(31)
        }
    }, [locationSettings])

    const onInputHandler = (e) => {
        //handling the input fields
        const { name, value } = e.target
        const numericValue = Number(value)
        const maxDays = ['Jan', 'Mar', 'May', 'Jul', 'Aug', 'Oct', 'Dec'].includes(
            locationSettings.financialYearStartMonth
        )
            ? 31
            : locationSettings.financialYearStartMonth === 'Feb'
              ? 28
              : 30

        setLocationSettings({ ...locationSettings, [name]: value })
        setSettings({ ...locationSettings, [name]: value })

        if (!value) {
            setFormErrors({ ...formErrors, [name]: 'Required' })
        } else if (numericValue < 1 || numericValue > maxDays) {
            setFormErrors({ ...formErrors, [name]: `Must be between 1 and ${maxDays}` })
        } else {
            setFormErrors({ ...formErrors, [name]: '' })
        }
    }
    // const handleReimbursementChange = () => {
    //     //handling reimburse checkbox
    //     setReimbursement(!reimbursement)
    //     setSettings((prevSettings) => ({
    //         ...prevSettings,
    //         reimbursement: !reimbursement
    //     }))
    // }
    // const handleOvertimeChange = () => {
    //     //handling overtime checkBox
    //     setovertime(!overtime)
    //     setSettings((prevSettings) => ({
    //         ...prevSettings,
    //         overtime: !overtime
    //     }))
    // }

    return (
        <>
            <Tabs>
                <Tab eventKey="address">
                    <div className="mb-4 "></div>

                    <div className="card-body">
                        <div className="formBody">
                            <form className="card-body">
                                <div class="col-">
                                    <Form.Group as={Row}>
                                        <Form.Label
                                            className="fieldLable"
                                            column
                                            md={3}
                                            style={{ whiteSpace: 'nowrap' }}
                                        >
                                            Financial Year Start Month{' '}
                                            <span className="error">*</span>
                                        </Form.Label>
                                        <Col md={6}>
                                            <div className="dropdown">
                                                <DateAndMonths
                                                    month={locationSettings.financialYearStartMonth}
                                                    enableMonth={true}
                                                    enableDate={false}
                                                    dateLength={dateLength}
                                                    formErrors={formErrors.financialYearStartMonth}
                                                    onChange={(option, name) =>
                                                        onMonthChangeHandler(
                                                            option,
                                                            name,
                                                            'financialStart'
                                                        )
                                                    }
                                                />
                                            </div>
                                            <p className="error">
                                                {formErrors.financialYearStartMonth}
                                            </p>
                                        </Col>
                                    </Form.Group>
                                </div>
                                <div class="col-" style={{ marginBottom: '3%' }}>
                                    <Form.Group as={Row}>
                                        <Form.Label column sm={3}>
                                            Payroll Cycle Start Day<span className="error"> *</span>
                                        </Form.Label>
                                        <Col sm={3}>
                                            <Form.Control
                                                name="payRollDay"
                                                className="from eliminateControls"
                                                defaultValue={locationSettings.payRollDay}
                                                disabled={!locationSettings.financialYearStartMonth}
                                                onBlur={onInputHandler}
                                                size="sm"
                                                type="number"
                                                min={0}
                                                maxLength={2}
                                                max={
                                                    [
                                                        'Jan',
                                                        'Mar',
                                                        'May',
                                                        'Jul',
                                                        'Aug',
                                                        'Oct',
                                                        'Dec'
                                                    ].includes(
                                                        locationSettings.financialYearStartMonth
                                                    )
                                                        ? 31
                                                        : locationSettings.financialYearStartMonth ===
                                                            'Feb'
                                                          ? 28
                                                          : 30
                                                }
                                            />
                                            <p className="error">{formErrors.payRollDay}</p>
                                        </Col>
                                    </Form.Group>
                                </div>
                                {/* <div class="col-">
                  <Form.Group
                    as={Row}
                    className="mb-3"
                    controlId="formGroupToDate"
                  >
                    <Form.Label className="fieldLabel" column md={3}>
                      {" "}
                      Include Expenses Reimbursement in Payroll? :
                    </Form.Label>
                    <Col sm={7}>
                      <input
                        style={{ marginTop: "0.7rem" }}
                        value="reimbursement"
                        type="checkbox"
                        checked={reimbursement}
                        onChange={handleReimbursementChange}
                      />
                    </Col>
                  </Form.Group>
                </div>
                <div class="col-">
                  <Form.Group
                    as={Row}
                    className="mb-3"
                    controlId="formGroupToDate"
                  >
                    <Form.Label className="fieldLabel" column md={3}>
                      {" "}
                      Overtime Applicable? :
                    </Form.Label>
                    <Col sm={7}>
                      <input
                        style={{ marginTop: "0.7rem" }}
                        value="overtime"
                        type="checkbox"
                        checked={overtime}
                        onChange={handleOvertimeChange}
                      />
                    </Col>
                  </Form.Group>
                </div> */}

                                <div style={{ marginBottom: '5%' }}>
                                    <Shifts setShifts={setShifts} shifts={shifts ? shifts : []} />
                                </div>
                            </form>
                        </div>
                    </div>
                </Tab>
            </Tabs>
        </>
    )
}

export default LocationSettings
