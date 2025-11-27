import { DatePicker } from 'antd' // Importing the DatePicker component from Ant Design library
import moment from 'moment' // Importing moment.js to work with dates
import React, { useEffect, useState } from 'react' // Importing React and its hooks
import { Button, Col, Form, Row } from 'react-bootstrap' // Importing Bootstrap components for layout and styling

// Component for managing financial year details
const FinancialYear = ({
    setShowModal,
    onShowModalCloseHandler,
    financialYearData,
    setFinancialYearData
}) => {
    // useState hook to store the form data, which is initialized with the data passed through props
    const [formData, setFormData] = useState(financialYearData)

    // useEffect hook to update formData if the financialYearData prop changes
    useEffect(() => {
        setFormData(financialYearData)
    }, []) // Empty dependency array ensures this effect runs only once after initial render

    // Handles input field changes by updating the formData state
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    // useState hook to store the selected year (initialized from formData if available)
    const [year, setYear] = useState(formData ? formData.year : null)
    console.log(formData, 'chekingyearfromyear') // Debugging log to check the selected year

    // Handles the year selection from the DatePicker component
    const handleDatePicker = (select) => {
        setYear(select ? select.year() : null) // Sets the selected year or null if no year is selected
    }

    // Function to save the form data when the "Add" button is clicked
    const onSaveObj = () => {
        const obj = {
            id: formData && formData.id, // Retains the ID if present
            totalEarnings: formData && formData.totalEarnings, // Retains totalEarnings
            pt: formData && formData.pt ? formData.pt : 0, // Defaults PT to 0 if not available
            pf: formData && formData.pf ? formData.pf : 0, // Defaults PF to 0 if not available
            tds: formData && formData.tds ? formData.tds : 0, // Defaults TDS to 0 if not available
            esi: formData && formData.esi ? formData.esi : 0, // Defaults ESI to 0 if not available
            year: year ? year : formData.year // Uses the selected year or retains the existing one if not selected
        }

        setShowModal(false) // Closes the modal
        setFinancialYearData(obj) // Updates the financial year data in the parent component
    }

    return (
        <>
            <div className="">
                <form className="modalFormBody">
                    <div className="col-">
                        {/* Form group for total earnings */}
                        <Form.Group as={Row} className="mb-2" controlId="totalEarnings">
                            <Form.Label id="totalEarnings" column sm={3}>
                                Total Earnings
                            </Form.Label>
                            <Col sm={4}>
                                <Form.Control
                                    id="totalEarnings"
                                    defaultValue={formData && formData.totalEarnings} // Default value from formData
                                    name="totalEarnings"
                                    maxLength={10} // Limits input to 10 characters
                                    onChange={handleInputChange} // Calls the input change handler
                                />
                            </Col>
                        </Form.Group>
                    </div>
                    <h6 className="text-bold mb-3">Total Deductions</h6>
                    <Row>
                        <div className="col-6">
                            {/* Form group for selecting the year */}
                            <Form.Group as={Row} className="mb-3" controlId="yearPicker">
                                <Form.Label id="yearPicker" column sm={3}>
                                    Year
                                </Form.Label>
                                <Col sm={7}>
                                    <DatePicker
                                        id="yearPicker"
                                        picker="year" // Specifies that only the year is selectable
                                        onChange={handleDatePicker} // Calls the handler when the user selects a year
                                        value={year == null ? null : moment(year, 'YYYY')} // Displays the selected year in the DatePicker
                                        format="YYYY" // Ensures the displayed value is just the year
                                    />
                                </Col>
                            </Form.Group>
                        </div>
                        <div className="col-6">
                            {/* Form group for PT deduction */}
                            <Form.Group as={Row} className="mb-3" controlId="PT">
                                <Form.Label id="PT" column sm={3}>
                                    PT
                                </Form.Label>
                                <Col sm={7}>
                                    <Form.Control
                                        name="pt"
                                        id="PT"
                                        maxLength={15} // Limits input to 10 characters
                                        defaultValue={formData && formData.pt} // Default value from formData
                                        onChange={handleInputChange} // Calls the input change handler
                                    />
                                </Col>
                            </Form.Group>
                        </div>
                        <div className="col-6">
                            {/* Form group for PF deduction */}
                            <Form.Group as={Row} className="mb-3" controlId="pf">
                                <Form.Label id="pf" column sm={3}>
                                    PF
                                </Form.Label>
                                <Col sm={7}>
                                    <Form.Control
                                        id="pf"
                                        name="pf"
                                        maxLength={15} // Limits input to 10 characters
                                        defaultValue={formData && formData.pf} // Default value from formData
                                        onChange={handleInputChange} // Calls the input change handler
                                    />
                                </Col>
                            </Form.Group>
                        </div>
                        <div className="col-6">
                            {/* Form group for TDS deduction */}
                            <Form.Group as={Row} className="mb-3" controlId="tds">
                                <Form.Label id="tds" column sm={3}>
                                    TDS
                                </Form.Label>
                                <Col sm={7}>
                                    <Form.Control
                                        id="tds"
                                        maxLength={15} // Limits input to 10 characters
                                        defaultValue={formData && formData.tds} // Default value from formData
                                        name="tds"
                                        onChange={handleInputChange} // Calls the input change handler
                                    />
                                </Col>
                            </Form.Group>
                        </div>
                        <div className="col-6">
                            {/* Form group for ESI deduction */}
                            <Form.Group as={Row} className="mb-4" controlId="esi">
                                <Form.Label id="esi" column sm={3}>
                                    ESI
                                </Form.Label>
                                <Col sm={7}>
                                    <Form.Control
                                        name="esi"
                                        id="esi"
                                        maxLength={15} // Limits input to 10 characters
                                        defaultValue={formData && formData.esi} // Default value from formData
                                        onChange={handleInputChange} // Calls the input change handler
                                    />
                                </Col>
                            </Form.Group>
                        </div>
                    </Row>
                </form>
            </div>
            <div className="btnCenter">
                {/* Button to save the form data */}
                <Button
                    variant="addbtn"
                    className="Button"
                    id="AddFinancialyear"
                    onClick={onSaveObj}
                >
                    Add
                </Button>
                {/* Button to close the modal */}
                <Button
                    className="Button"
                    variant="secondary"
                    id="CloseFinancialyear"
                    onClick={onShowModalCloseHandler}
                >
                    Close
                </Button>
            </div>
        </>
    )
}

export default FinancialYear
