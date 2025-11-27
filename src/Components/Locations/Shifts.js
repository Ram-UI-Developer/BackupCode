import React, { useEffect, useState } from 'react'
import { Button, Col, Form, Row } from 'react-bootstrap'
import Modal from 'react-bootstrap/Modal'
import { MdEmail } from 'react-icons/md'
import { useSelector } from 'react-redux'
import Select from 'react-select'
import { toast } from 'react-toastify'
import Loader from '../../Common/CommonComponents/Loader'
import TableHeader from '../../Common/CommonComponents/TableHeader'
import { AddIcon, DeleteIcon, EditIcon } from '../../Common/CommonIcons/CommonIcons'
import { getById } from '../../Common/Services/CommonService'
import { getAllWithOrgAndYear, sendingHolidayEmail } from '../../Common/Services/OtherServices'
import Table from '../../Common/Table/Table'

const Shifts = ({ setShifts, shifts }) => {
    const userDetails = useSelector((state) => state.user.userDetails) //fetch userdetails using redux
    const [defaultShifts, setDefaultShifts] = useState(shifts) //state for taking default shifts
    const [load, setLoad] = useState(true) //loader for holidays
    const [visible, setVisible] = useState('') //state for maintaing whether the obj is create or update
    const [show, setShow] = useState(false) //state for Add and update pop up
    const [appear, setAppear] = useState(false) //state for showing holidaycalendar pop up
    const [formErrors, setFormErrors] = useState({}) //state for storing validation errors
    const [formData, setFormData] = useState({}) //state for modifying data to be stored
    const [bussinessHours, setBussinessHours] = useState(false) //state for bussiness hours
    const [startTime, setStartTime] = useState({ hour: '08 AM', minute: '00' }) //state for start time
    const [endTime, setEndTime] = useState({ hour: '05 PM', minute: '00' }) //state for end time
    const [index, setIndex] = useState(null) //state for maintaing index of the shift
    const [deleteShow, setDeleteShow] = useState(false) //state for showing delete popup
    const [duration, setDuration] = useState('') //state for duration
    const [indexs, setIndexS] = useState() //state for deleting multiple shifts
    const [holidayCalendar, setHolidayCalendar] = useState([]) //state for storing holidyCalendar
    const [calendar, setCalendar] = useState([
        {
            year: new Date().getFullYear()
        },
        {
            year: new Date().getFullYear() + 1
        }
    ]) //state for handling the calendar year
    const [currentHoliday, setCurrentHoliday] = useState(null) //state for storing current calendars
    const [nextHolidays, setNextHolidays] = useState([]) //state for handling next holidayCalendars
    const [nextHoliday, setNextHoliday] = useState(null) //state for handling next callendar

    const [currentCalendarName, setCurrentCalendarName] = useState('') //state for storing calendar name
    useEffect(() => {
        setDefaultShifts(shifts)
    }, [shifts])

    useEffect(() => {
        calculateDuration()
    }, [startTime, endTime])

    const handleBussinessHoursChange = () => {
        //handling bussiness hours from startTime to endTime
        setBussinessHours(!bussinessHours)
        handleRadioChange(true, index)
    }

    //get holidayCalendar using organizationId and year
    const onGetHolidayHandler = (year) => {
        getAllWithOrgAndYear({
            entity: 'holidays',
            organizationId: userDetails.organizationId,
            year: year
        }).then((res) => {
            if (res.statusCode == 200) {
                setHolidayCalendar(res.data)
            }
        })
    }

    //get holiday calendar for CurrentYear+1
    const onGetHolidaysHandler = (year) => {
        getAllWithOrgAndYear({
            entity: 'holidays',
            organizationId: userDetails.organizationId,
            year: year
        }).then((res) => {
            if (res.statusCode == 200) {
                setNextHolidays(res.data)
            }
        })
    }

    const calendarOptions =
        holidayCalendar.length > 0
            ? holidayCalendar.map((option) => ({
                  value: option.id,
                  label: option.name
              }))
            : []

    const nextCalendarOptions =
        nextHolidays.length > 0
            ? nextHolidays.map((option) => ({
                  value: option.id,
                  label: option.name
              }))
            : []

    const currentYear = new Date().getFullYear()
    const nextYear = currentYear + 1

    const handleShiftUpdate = (updatedShift, index) => {
        setShifts((prevShifts) => {
            const updatedShifts = [...prevShifts]
            updatedShifts[index] = { ...updatedShifts[index], ...updatedShift }
            return updatedShifts
        })
    }

    //handling current year calendar change
    const handleCurrentCalendarChange = (selectedOption, index) => {
        const updatedHolidayCalendar = calendar.map((item) =>
            item.year === currentYear
                ? {
                      ...item,
                      calendarId: selectedOption ? selectedOption.value : null,
                      calendarName: selectedOption ? selectedOption.label : null
                  }
                : item
        )
        setCurrentHoliday(selectedOption.value)
        setCurrentCalendarName(selectedOption.label)
        setCalendar(updatedHolidayCalendar)
        handleShiftUpdate(
            {
                holidays: calendar[index] ? calendar[index].holidays : []
            },
            index
        )
    }

    //handling to close pop ups
    const onCloseHandler = () => {
        setHolidays([])
        setAppear(false)
        setLoad(true)
    }

    //handling next year calendar change
    const handleNextCalendarChange = (selectedOption) => {
        const updatedHolidayCalendar = calendar.map((item) =>
            item.year === nextYear
                ? {
                      ...item,
                      calendarId: selectedOption ? selectedOption.value : null,
                      calendarName: selectedOption ? selectedOption.label : null
                  }
                : item
        )
        setNextHoliday(selectedOption.value)
        setCalendar(updatedHolidayCalendar)
    }

    //handling duration calculations
    const calculateDuration = () => {
        if (startTime.hour && startTime.minute && endTime.hour && endTime.minute) {
            const convertToMinutes = (hour, minute) => {
                let hourValue = parseInt(hour)
                const isPM = hour.includes('PM')

                if (isPM && hourValue !== 12) {
                    hourValue += 12
                } else if (!isPM && hourValue === 12) {
                    hourValue = 0
                }

                return hourValue * 60 + parseInt(minute)
            }

            const startTotalMinutes = convertToMinutes(startTime.hour, startTime.minute)
            const endTotalMinutes = convertToMinutes(endTime.hour, endTime.minute)

            const adjustedEndTotalMinutes =
                endTotalMinutes < startTotalMinutes ? endTotalMinutes + 1440 : endTotalMinutes

            const diff = adjustedEndTotalMinutes - startTotalMinutes
            const hours = Math.floor(diff / 60)
            const minutes = diff % 60

            setDuration(`${hours}h ${minutes}m`)
        } else {
            setDuration('')
        }
    }

    //handling 12hrs format
    const formatTo12Hour = (timeString) => {
        const [hour, minute] = timeString.split(':')
        const hourValue = parseInt(hour)
        const isPM = hourValue >= 12
        const formattedHour = hourValue % 12 || 12
        const period = isPM ? 'PM' : 'AM'
        return `${formattedHour}:${String(minute).padStart(2, '0')} ${period}`
    }

    //handling standbussiness hours radio button
    const handleRadioChange = (value, index) => {
        setShifts((prevState) =>
            prevState.map((shift, idx) => {
                if (idx === index) {
                    return { ...shift, standardHours: value }
                }
                if (value === true) {
                    return { ...shift, standardHours: false }
                }
                return shift
            })
        )
    }

    const [holidays, setHolidays] = useState([])
    //get holidays of that calendar
    const onGetHolidayById = (id) => {
        getById({
            entity: 'holidays',
            organizationId: userDetails.organizationId,
            id: id
        }).then((res) => {
            if (res.statusCode == 200) {
                setHolidays(res.data.holidayDTOs)
                setLoad(false)
            }
        })
    }

    const onHolidaysHandler = (currentCalendar) => {
        setAppear(true)
        onGetHolidayById(currentCalendar.calendarId)
    }

    const GetDay = (data) => {
        let fullDate = new Date(data).toString()
        let day = fullDate.slice(0, 3)
        return day
    }

    const HolidayCOLUMNS = [
        {
            Header: 'Date',
            accessor: 'date',
            Cell: ({ value }) => (
                <div
                    style={{
                        width: '100px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}
                >
                    {value}
                </div>
            )
        },
        {
            Header: 'Day',
            accessor: '',
            Cell: ({ row }) => (
                <>
                    <div className="text-wrap">{GetDay(row.original.date)}</div>
                </>
            )
        },
        {
            Header: 'Name',
            accessor: 'name',
            Cell: ({ value }) => (
                <div
                    style={{
                        width: '100px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}
                    title={value}
                >
                    {value}
                </div>
            )
        },

        {
            Header: 'Optional',
            accessor: 'optional',
            Cell: ({ row }) => (
                <>
                    <div className="tableNameData">{row.original.optional ? 'Yes' : 'No'}</div>
                </>
            )
        },

        {
            Header: 'Description',
            accessor: 'description'
        }
    ]

    //send email api
    const onSendHolidaysEmailHandler = (row, year) => {
        sendingHolidayEmail({
            entity: 'holidays',
            organizationId: userDetails.organizationId,
            id: row.locationId,
            year: year,
            shiftId: row.id
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    toast.success('Mail sent successfully.')
                } else {
                    toast.error(res.errorMessage)
                }
            })
            .catch((err) => {
                console.log(err, 'error')
            })
    }

    //table headers
    const COLUMNS = [
        {
            Header: 'S.No',
            accessor: '',
            disableSortBy: true,
            Cell: ({ row }) => <div className="text-center">{row.index + 1}</div>
        },
        {
            Header: <div className="header text-left">Name</div>,
            accessor: 'name',
            Cell: ({ row }) => <div className="text-left">{row.original.name}</div>
        },
        {
            Header: <div className="header text-left">From</div>,
            accessor: 'fromTime',
            Cell: ({ row }) => (
                <div className="text-left">{formatTo12Hour(row.original.fromTime)}</div>
            )
        },
        {
            Header: <div className="header text-left">To</div>,
            accessor: 'toTime',
            Cell: ({ row }) => (
                <div className="text-left">
                    {formatTo12Hour(row.original.toTime)}{' '}
                    {row.original.duration != null ? '(' + row.original.duration + ')' : ''}
                </div>
            )
        },
        {
            Header: <div className="header text-left">Regular Shift?</div>,
            accessor: 'standardHours',
            Cell: ({ row }) => {
                return (
                    <div className="text-left">
                        <input
                            type="radio"
                            name={`standardHours-${row.id}`}
                            checked={row.original.standardHours}
                            onChange={() => handleRadioChange(true, row.index)}
                            disabled={row.original.standardHours}
                        />
                        &ensp;
                        {row.original.standardHours ? <span>Yes</span> : ''}
                    </div>
                )
            }
        },
        {
            Header: <div className="header text-left">Current Year Calendar</div>,
            accessor: 'calendarName',
            Cell: ({ row }) => {
                const currentCalendar =
                    row.original.holidays && Array.isArray(row.original.holidays)
                        ? row.original.holidays.find((item) => item.year === currentYear)
                        : null

                return (
                    <span>
                        <a className="" onClick={() => onHolidaysHandler(currentCalendar)}>
                            <u style={{ fontSize: '14px' }}>
                                {currentCalendar ? currentCalendar.calendarName : ''}
                            </u>
                        </a>

                        {currentCalendar && currentCalendar.calendarName
                            ? ' ' + '(' + currentYear + ')'
                            : ''}
                    </span>
                )
            }
        },

        {
            Header: <div className="header text-left">Next Year Calendar</div>,
            accessor: 'calendarNames',
            Cell: ({ row }) => {
                const currentCalendar =
                    row.original.holidays && Array.isArray(row.original.holidays)
                        ? row.original.holidays.find((item) => item.year === nextYear)
                        : null
                return (
                    <span>
                        <a className="" onClick={() => onHolidaysHandler(currentCalendar)}>
                            <u style={{ fontSize: '14px' }}>
                                {currentCalendar ? currentCalendar.calendarName : ''}
                            </u>
                        </a>
                        {currentCalendar && currentCalendar.calendarName
                            ? ' ' + '(' + nextYear + ')'
                            : ''}
                    </span>
                )
            }
        },

        {
            Header: () => <div className="header text-center">Actions</div>,
            accessor: 'actions',
            disableSortBy: true,
            Cell: ({ row }) => {
                return (
                    <div className="text-wrap text-center ">
                        <Button
                            variant=""
                            className="iconWidth"
                            onClick={() => onShowHandler('update', row.index, row.original)}
                        >
                            <EditIcon />
                        </Button>
                        |
                        <Button
                            variant=""
                            className="iconWidth"
                            onClick={() => handleRemove(row.index)}
                            disabled={row.original.standardHours === true}
                        >
                            <DeleteIcon />
                        </Button>
                    </div>
                )
            }
        }
    ]

    const handleRemove = (index) => {
        setDeleteShow(true)
        setIndexS(index)
    }
    const proceedDeleteHandler = (e) => {
        e.preventDefault()
        const rows = [...defaultShifts]
        rows.splice(indexs, 1)
        setShifts(rows)
        setDeleteShow(false)
    }

    const parseTime = (timeString) => {
        const [hour, minute] = timeString.split(':')
        return { hour, minute }
    }

    const formatToHour = (hour) => {
        let formattedHour
        if (hour === 0) {
            formattedHour = '12'
        } else if (hour === 12) {
            formattedHour = '12'
        } else {
            formattedHour = hour > 12 ? `${hour - 12}` : `${hour}`
        }

        return formattedHour.padStart(2, '0') + (hour >= 12 ? ' PM' : ' AM')
    }

    const onShowHandler = (action, idx, row = {}) => {
        setIndex(idx)
        onGetHolidayHandler(new Date().getFullYear())
        onGetHolidaysHandler(new Date().getFullYear() + 1)
        if (action === 'create') {
            setVisible('create')
            setShow(true)
            setFormData({})
            setStartTime({ hour: '12 AM', minute: '00' })
            setEndTime({ hour: '12 PM', minute: '00' })
            setDuration('')
            setBussinessHours(false)
            setCurrentHoliday()
            setNextHoliday()
            setCurrentCalendarName('')
            setCalendar([
                {
                    year: new Date().getFullYear()
                },
                {
                    year: new Date().getFullYear() + 1
                }
            ])
        } else {
            setVisible('update')
            setShow(true)
            setFormData(row)
            setCalendar(row.holidays != null && row.holidays.length ? row.holidays : calendar)
            const currentYear =
                row.holidays && row.holidays.find((e) => e.year == new Date().getFullYear())
            const nextYear =
                row.holidays && row.holidays.find((e) => e.year == new Date().getFullYear() + 1)
            setCurrentHoliday(currentYear && currentYear.calendarId)
            setNextHoliday(nextYear && nextYear.calendarId)
            setCurrentCalendarName(currentYear && currentYear.calendarName)
            setBussinessHours(row.standardHours)
            const startParsed = parseTime(row.fromTime)
            const endParsed = parseTime(row.toTime)

            setStartTime({
                hour: formatToHour(parseInt(startParsed.hour)),
                minute: startParsed.minute
            })
            setEndTime({
                hour: formatToHour(parseInt(endParsed.hour)),
                minute: endParsed.minute
            })
            setDuration(row.duration)
        }
    }

    const handleTimeChange = (setter) => (e) => {
        const { name, value } = e.target
        setter((prevState) => ({ ...prevState, [name]: value }))
    }

    const onInputHandler = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
        setFormErrors({ ...formErrors, [name]: value ? '' : 'Required' })
    }

    const handleClose = () => {
        setVisible('')
        setShow(false)
        setDeleteShow(false)
        setFormErrors({})
    }

    //validate before add or update
    const validate = (values) => {
        const errors = {}
        if (!values.name || values.name.length < 0) {
            errors.name = 'Required'
        }
        if (!startTime.hour) {
            errors.fromTime = 'Required'
        }
        if (!startTime.minute) {
            errors.fromTime = 'Required'
        }
        if (!endTime.hour) {
            errors.toTime = 'Required'
        }
        if (!endTime.minute) {
            errors.toTime = 'Required'
        }

        return errors
    }

    //handling time to 24hours format
    const formatTo24Hour = (hour, minute) => {
        let hourValue = parseInt(hour)
        const isPM = hour.includes('PM')

        if (isPM && hourValue !== 12) {
            hourValue += 12
        } else if (!isPM && hourValue === 12) {
            hourValue = 0
        }

        return `${String(hourValue).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
    }

    //save obj
    const saveObj = () => {
        const shiftObj = {
            name: formData.name,
            fromTime: formatTo24Hour(startTime.hour, startTime.minute),
            toTime: formatTo24Hour(endTime.hour, endTime.minute),
            duration: duration,
            standardHours: bussinessHours,
            holidays: calendar
        }
        if (!shiftObj.name || shiftObj.name == undefined) {
            setFormErrors(validate(shiftObj))
        } else if (!startTime.hour) {
            setFormErrors(validate(shiftObj))
        } else if (!startTime.minute) {
            setFormErrors(validate(shiftObj))
        } else if (!endTime.hour) {
            setFormErrors(validate(shiftObj))
        } else if (!endTime.minute) {
            setFormErrors(validate(shiftObj))
        } else if (startTime.hour == endTime.hour && startTime.minute == endTime.minute) {
            toast.error('Start time and end time should not be same')
        } else {
            const newData = [...defaultShifts, shiftObj]
            setShifts(newData)
            setDefaultShifts(newData)
            handleClose()
        }
    }

    //update object
    const updateObj = () => {
        const shiftObj = {
            id: formData.id,
            name: formData.name,
            fromTime: formatTo24Hour(startTime.hour, startTime.minute),
            toTime: formatTo24Hour(endTime.hour, endTime.minute),
            duration: duration,
            standardHours: bussinessHours,
            holidays: calendar,
            locationId: formData.locationId,
            locationName: formData.locationName,
            organizationId: formData.organizationId
        }
        if (!shiftObj.name || shiftObj.name == undefined) {
            setFormErrors(validate(shiftObj))
        } else if (!startTime.hour) {
            setFormErrors(validate(shiftObj))
        } else if (!startTime.minute) {
            setFormErrors(validate(shiftObj))
        } else if (!endTime.hour) {
            setFormErrors(validate(shiftObj))
        } else if (!endTime.minute) {
            setFormErrors(validate(shiftObj))
        } else if (startTime.hour == endTime.hour && startTime.minute == endTime.minute) {
            toast.error('Start time and end time should not be same')
        } else {
            const updatedData = [...defaultShifts]
            updatedData[index] = shiftObj
            setShifts(updatedData)
            setDefaultShifts(updatedData)
            handleClose()
        }
    }

    return (
        <>
            <div>
                <TableHeader tableTitle={'Shifts'} />
                <div>
                    <Button
                        className="addButton"
                        variant="addbtn"
                        onClick={() => onShowHandler('create')}
                    >
                        <AddIcon />
                    </Button>

                    <Table key={defaultShifts.length} columns={COLUMNS} data={defaultShifts} />
                </div>

                <Modal
                    show={show}
                    onHide={handleClose}
                    backdrop="static"
                    keyboard={false}
                    size="lg"
                >
                    <Modal.Header closeButton={handleClose}>
                        <Modal.Title>
                            {visible === 'create' ? 'Add Shift' : 'Update Shift'}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="center">
                            <form className="card-body">
                                <Form.Group className="mb-3 justify-content-center" as={Row}>
                                    <Form.Label column sm={2}>
                                        Name<span className="error"> *</span>
                                    </Form.Label>
                                    <Col sm={7}>
                                        <Form.Control
                                            required
                                            type="text"
                                            name="name"
                                            value={formData.name || ''}
                                            onChange={onInputHandler}
                                            maxLength={50}
                                        />
                                        <p className="error">{formErrors.name}</p>
                                    </Col>
                                </Form.Group>

                                <Form.Group className="mb-3 justify-content-center" as={Row}>
                                    <Form.Label column sm={2}>
                                        Is Standard Bussiness Hours?{' '}
                                    </Form.Label>
                                    <Col sm={7}>
                                        <input
                                            style={{ marginTop: '2rem' }}
                                            value="standardHours"
                                            type="checkbox"
                                            checked={bussinessHours}
                                            disabled={bussinessHours}
                                            onChange={handleBussinessHoursChange}
                                        />
                                    </Col>
                                </Form.Group>

                                <Form.Group className="mb-2 justify-content-center" as={Row}>
                                    <Form.Label column sm={2}>
                                        Start<span className="error"> *</span>
                                    </Form.Label>
                                    <Col sm={3}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            <Form.Control
                                                as="select"
                                                name="hour"
                                                value={startTime.hour}
                                                onChange={handleTimeChange(setStartTime)}
                                                required
                                            >
                                                <option value="12 AM">0 AM</option>
                                                {[...Array(11)].map((_, i) => {
                                                    const hourValue =
                                                        String(i + 1).padStart(2, '0') + ' AM'
                                                    return (
                                                        <option key={hourValue} value={hourValue}>
                                                            {i + 1} AM
                                                        </option>
                                                    )
                                                })}

                                                <option value="12 PM">12 PM</option>
                                                {[...Array(11)].map((_, i) => {
                                                    const hourValue =
                                                        String(i + 1).padStart(2, '0') + ' PM'
                                                    return (
                                                        <option key={hourValue} value={hourValue}>
                                                            {i + 1} PM
                                                        </option>
                                                    )
                                                })}
                                            </Form.Control>

                                            <Form.Control
                                                as="select"
                                                name="minute"
                                                value={startTime.minute}
                                                onChange={handleTimeChange(setStartTime)}
                                                required
                                            >
                                                {[0, 15, 30, 45].map((min) => (
                                                    <option
                                                        key={min}
                                                        value={String(min).padStart(2, '0')}
                                                    >
                                                        {String(min).padStart(2, '0')}
                                                    </option>
                                                ))}
                                            </Form.Control>
                                        </div>
                                        <p className="error">{formErrors.fromTime}</p>
                                    </Col>

                                    <Form.Label column sm={1}>
                                        End<span className="error"> *</span>
                                    </Form.Label>
                                    <Col sm={3}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            <Form.Control
                                                as="select"
                                                name="hour"
                                                value={endTime.hour}
                                                onChange={handleTimeChange(setEndTime)}
                                                required
                                            >
                                                <option value="12 AM">0 AM</option>
                                                {[...Array(11)].map((_, i) => {
                                                    const hourValue =
                                                        String(i + 1).padStart(2, '0') + ' AM'
                                                    return (
                                                        <option key={hourValue} value={hourValue}>
                                                            {i + 1} AM
                                                        </option>
                                                    )
                                                })}

                                                <option value="12 PM">12 PM</option>
                                                {[...Array(11)].map((_, i) => {
                                                    const hourValue =
                                                        String(i + 1).padStart(2, '0') + ' PM'
                                                    return (
                                                        <option key={hourValue} value={hourValue}>
                                                            {i + 1} PM
                                                        </option>
                                                    )
                                                })}
                                            </Form.Control>

                                            <Form.Control
                                                as="select"
                                                name="minute"
                                                value={endTime.minute}
                                                onChange={handleTimeChange(setEndTime)}
                                                required
                                            >
                                                {[0, 15, 30, 45].map((min) => (
                                                    <option
                                                        key={min}
                                                        value={String(min).padStart(2, '0')}
                                                    >
                                                        {String(min).padStart(2, '0')}
                                                    </option>
                                                ))}
                                            </Form.Control>
                                        </div>
                                        <p className="error">{formErrors.toTime}</p>
                                    </Col>
                                </Form.Group>

                                <Form.Group className="mb-3 justify-content-center" as={Row}>
                                    <Form.Label column sm={2}>
                                        Duration:
                                    </Form.Label>
                                    <Col sm={7}>
                                        <Form.Control
                                            type="text"
                                            name="duration"
                                            value={duration}
                                            readOnly
                                        />
                                    </Col>
                                </Form.Group>

                                <Form.Group className="mb-2 justify-content-center" as={Row}>
                                    <Form.Label column sm={3}>
                                        {' '}
                                        Current Year
                                    </Form.Label>
                                    <Col sm={1}>
                                        <span style={{ marginLeft: '-50px' }}>
                                            {new Date().getFullYear()}
                                        </span>
                                    </Col>

                                    <Form.Label column sm={1}>
                                        Calendar
                                    </Form.Label>
                                    <Col sm={3}>
                                        {currentCalendarName == null ||
                                        currentCalendarName == '' ? (
                                            <Select
                                                className="dropdown"
                                                placeholder="Select Calendar"
                                                options={calendarOptions}
                                                onChange={handleCurrentCalendarChange}
                                                value={calendarOptions.filter(
                                                    (e) => e.value == currentHoliday
                                                )}
                                            />
                                        ) : (
                                            <span style={{ marginLeft: '10px' }}>
                                                {currentCalendarName}
                                            </span>
                                        )}
                                    </Col>
                                    <Col sm={1}>
                                        <Button
                                            type="button"
                                            variant=""
                                            className="iconWidth"
                                            onClick={() =>
                                                onSendHolidaysEmailHandler(formData, currentYear)
                                            }
                                            disabled={
                                                currentHoliday == null || currentHoliday == ''
                                            }
                                        >
                                            <MdEmail className="themeColor" size={20} />
                                        </Button>
                                    </Col>
                                </Form.Group>

                                <Form.Group className="mb-2 justify-content-center" as={Row}>
                                    <Form.Label column sm={3}>
                                        {' '}
                                        Next Year
                                    </Form.Label>
                                    <Col sm={1}>
                                        <span style={{ marginLeft: '-50px' }}>
                                            {new Date().getFullYear() + 1}
                                        </span>
                                    </Col>

                                    <Form.Label column sm={1}>
                                        Calendar
                                    </Form.Label>
                                    <Col sm={3}>
                                        <Select
                                            className="dropdown"
                                            placeholder="Select Calendar"
                                            options={nextCalendarOptions}
                                            onChange={handleNextCalendarChange}
                                            value={nextCalendarOptions.filter(
                                                (e) => e.value == nextHoliday
                                            )}
                                        />
                                    </Col>
                                    <Col sm={1}>
                                        <Button
                                            type="button"
                                            variant=""
                                            className="iconWidth"
                                            onClick={() =>
                                                onSendHolidaysEmailHandler(formData, nextYear)
                                            }
                                            disabled={nextHoliday == null || nextHoliday == ''}
                                        >
                                            <MdEmail className="themeColor" size={20} />
                                        </Button>
                                    </Col>
                                </Form.Group>
                            </form>
                        </div>
                    </Modal.Body>
                    <div className="EmplmodalF" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
                        {visible == 'create' && (
                            <Button variant="addbtn" className="Button" onClick={() => saveObj()}>
                                Add
                            </Button>
                        )}
                        {visible == 'update' && (
                            <Button className="Button" variant="addbtn" onClick={() => updateObj()}>
                                Update
                            </Button>
                        )}
                        <Button className="Button" variant="secondary" onClick={handleClose}>
                            Close
                        </Button>
                    </div>
                </Modal>

                <Modal
                    show={appear}
                    size="lg"
                    onHide={onCloseHandler}
                    backdrop="static"
                    keyboard={false}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Holiday Calendar</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {!load ? (
                            <div className="">
                                {holidays == null ? (
                                    <h4 className="modalBody">No Holidays Available</h4>
                                ) : (
                                    <Table
                                        key={holidays.length}
                                        columns={HolidayCOLUMNS}
                                        data={holidays}
                                        serialNumber={true}
                                        pageSize="10"
                                    />
                                )}
                            </div>
                        ) : (
                            <div className="d-flex justify-content-center">
                                <Loader />
                            </div>
                        )}
                    </Modal.Body>
                </Modal>

                <Modal show={deleteShow} onHide={handleClose} backdrop="static" keyboard={false}>
                    <Modal.Header closeButton={handleClose}>
                        <Modal.Title>Delete ?</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="modalBody">
                        Are you sure you want to delete this item?
                    </Modal.Body>
                    <div className="delbtn">
                        <Button className="Button" variant="addbtn" onClick={proceedDeleteHandler}>
                            Yes
                        </Button>
                        <Button className="Button" variant="secondary" onClick={handleClose}>
                            No
                        </Button>
                    </div>
                </Modal>
            </div>
        </>
    )
}

export default Shifts
