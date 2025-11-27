import { DatePicker } from 'antd'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import Select from 'react-select'
import { getAllByLocation } from '../../../../Common/Services/OtherServices'
import TableWith5Rows from '../../../../Common/Table/TableWith5Rows'
import { cancelButtonName } from '../../../../Common/Utilities/Constants'

const EmployeeShifts = (props) => {
    // Destructuring props passed to the component
    const {
        shiftsDtos,
        setShowModal,
        table,
        setShiftsDtos,
        doj,
        setShiftName,
        shiftName,
        locId,
        onShowModalCloseHandler,
        shift,
        setShift
    } = props

    // Accessing user details from the Redux store
    const userDetails = useSelector((state) => state.user.userDetails)
    const shiftStatusDtoDate = shiftsDtos.length != 0 ? shiftsDtos[0].startDate : doj
    // State for form validation errors
    const [formErrors, setFormErrors] = useState({})

    // Validation function for the form fields
    const validate = (values) => {
        const errors = {}

        // Check if shiftId or startDate is not provided
        if (values.shiftId == null) {
            errors.shiftId = 'Required' // Error message for missing shiftId
        }
        if (values.startDate == null) {
            errors.startDate = 'Required' // Error message for missing startDate
        }

        return errors
    }

    // State to store the selected start date
    const [startDate, setStartDate] = useState(null)

    // Handles the selection of the start date
    const handleStartDate = (e) => {
        const selectedDate = moment(e).format('YYYY-MM-DD') // Formats the selected date as 'YYYY-MM-DD'
        setStartDate(selectedDate) // Updates the start date in the state
    }

    // Effect hook to fetch the shift list once the component is mounted
    useEffect(() => {
        getAllShiftList() // Calls function to fetch shift list
    }, [])

    // State to store the fetched list of shifts
    const [shiftList, setShiftList] = useState([])

    // Function to fetch all shifts for a specific location
    const getAllShiftList = () => {
        getAllByLocation({
            entity: 'shifts',
            organizationId: userDetails.organizationId,
            locationId: locId
        }).then((res) => {
            if (res.statusCode == 200) {
                setShiftList(res.data) // Updates the shift list if the response is successful
            }
        })
        .catch(()=>{})
    }

    // Generates options for the shift dropdown based on the fetched shift list
    const shiftOptions = shiftList
        ? shiftList.map((option) => ({
              value: option.id,
              label: option.name + '(' + option.fromTime + '-' + option.toTime + ')'
          }))
        : []

    // Handles the selection of a shift from the dropdown
    const handleShiftSelection = (selection) => {
        setShift(selection.value) // Updates the selected shift ID
        setShiftName(selection.label) // Updates the selected shift name
    }

    // Function to add a new shift to the shifts list
    const addShiftDto = () => {
        const shiftObj = {
            startDate: startDate,
            shiftId: shift,
            shiftName: shiftName
        }

        // Validates the shift object before adding it
        if (shiftObj.shiftId == undefined || null) {
            setFormErrors(validate(shiftObj)) // Set form errors if shiftId is not provided
        } else if (shiftObj.startDate == null) {
            setFormErrors(validate(shiftObj)) // Set form errors if startDate is not provided
        } else {
            const managerData = [...shiftsDtos, shiftObj] // Adds the new shift to the shifts list
            setShiftsDtos(managerData) // Updates the shifts list state
            setShowModal(false)
            setShift() // Closes the modal after adding the shift
        }
    }

    // Column definitions for the shift table
    const COLUMNS = [
        {
            Header: () => (
                <div className="text-left header" style={{ marginLeft: '8rem' }}>
                    Name
                </div>
            ),
            accessor: 'shiftName',
            Cell: ({ row }) => (
                <div style={{ marginLeft: '8rem' }} className="text-left">
                    {row.original.shiftName}
                </div>
            )
        },
        {
            Header: () => (
                <div className="text-left header" style={{ marginRight: '3.8rem' }}>
                    Start Date
                </div>
            ),
            accessor: 'startDate',
            Cell: ({ row }) => (
                <div className="text-left" style={{ marginRight: '3.8rem' }}>
                    {row.original.startDate}
                </div>
            )
        },
        {
            Header: () => <div className="text-left header">End Date</div>,
            accessor: 'endDate',
            Cell: ({ row }) => <div className="text-left">{row.original.endDate}</div>
        }
    ]

    return (
        <>
            {table ? ( // If the 'table' prop is true, show the table with the shifts
                <div className="table">
                    {shiftsDtos != null ? ( // If shiftsDtos is not null, render the table
                        <TableWith5Rows columns={COLUMNS} serialNumber={true} data={shiftsDtos} />
                    ) : (
                        []
                    )}
                </div>
            ) : (
                <div>
                    {' '}
                    {/* If 'table' is false, show the form for adding a shift */}
                    <div className="row table">
                        <Row>
                            <div className="col-6">
                                <Form.Group as={Row} className="mb-3" controlId="shiftId">
                                    <Form.Label id="shiftId" column sm={4}>
                                        Shift
                                        <span className="error">*</span>
                                    </Form.Label>
                                    <Col sm={7}>
                                        <Select
                                            id="shiftId"
                                            placeholder=""
                                            onChange={handleShiftSelection}
                                            options={shiftOptions}
                                            required
                                            onBlur={() =>
                                                !shift
                                                    ? setFormErrors({
                                                          ...formErrors,
                                                          shiftId: 'Required'
                                                      })
                                                    : setFormErrors({
                                                          ...formErrors,
                                                          shiftId: ''
                                                      })
                                            }
                                            value={shiftOptions.filter((e) => e.value == shift)}
                                        />
                                        <p className="error">{formErrors.shiftId}</p>
                                    </Col>
                                </Form.Group>
                            </div>
                            <div className="col-6">
                                <Form.Group as={Row} className="mb-3" controlId="startDate">
                                    <Form.Label id="startDate" column sm={5}>
                                        Effective Date <span className="error">*</span>
                                    </Form.Label>
                                    <Col sm={7}>
                                        <DatePicker
                                            id="startDate"
                                            placeholder="Select Date"
                                            allowClear={false}
                                            onChange={handleStartDate}
                                            disabledDate={(current) => {
                                                const tomorrow = new Date(shiftStatusDtoDate)
                                                tomorrow.setDate(tomorrow.getDate())
                                                let customDate =
                                                    moment(tomorrow).format('YYYY-MM-DD')
                                                return (
                                                    current &&
                                                    current < moment(customDate, 'YYYY-MM-DD')
                                                )
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
                        </Row>
                    </div>
                    <div className="table">
                        {shiftsDtos != null ? (
                            <TableWith5Rows
                                columns={COLUMNS}
                                serialNumber={true}
                                data={shiftsDtos&&shiftsDtos}
                            />
                        ) : (
                            []
                        )}
                    </div>
                    <div className="btnCenter">
                        <Button
                            id="addShift"
                            className="Button"
                            variant="addbtn"
                            onClick={addShiftDto}
                        >
                            Add
                        </Button>
                        <Button
                            id="cancelShift"
                            className="Button"
                            variant="secondary"
                            onClick={onShowModalCloseHandler}
                        >
                            {cancelButtonName} {/* Cancel button */}
                        </Button>
                    </div>
                </div>
            )}
        </>
    )
}
export default EmployeeShifts
