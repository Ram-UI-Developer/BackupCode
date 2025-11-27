import { DatePicker } from 'antd'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'
import { CiImport } from 'react-icons/ci'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import * as XLSX from 'xlsx'
import { commonCrudSuccess } from '../../Common/CommonComponents/CustomizedSuccessToastMessages'
import DateFormate from '../../Common/CommonComponents/DateFormate'
import {
    compareArrayOfObjects,
    handleKeyPress,
    updateValidation
} from '../../Common/CommonComponents/FormControlValidation'
import DetailLoader from '../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../Common/CommonComponents/PageHeader'
import { ToastError, ToastSuccess } from '../../Common/CommonComponents/ToastCustomized'
import { AddIcon, DeleteIcon, EditIcon } from '../../Common/CommonIcons/CommonIcons'
import { getById, save, update } from '../../Common/Services/CommonService'
import Table from '../../Common/Table/Table'
import { cancelButtonName } from '../../Common/Utilities/Constants'

const HolidayCalendar = () => {
    const userDetails = useSelector((state) => state.user.userDetails) //fetch userdetail s using redux
    const [pop, setPop] = useState() //state for Add popUp display
    const calendarId = useLocation().state
    const [calendar, setCalendar] = useState() //state for calendar data
    const [optional, setOptional] = useState(false) //state for optional checkbox
    const [loading, setLoading] = useState(true) //state for page loader
    const [show, setShow] = useState(false) //state for import pop up
    // const [deleteShow, setDeleteShow] = useState(false) //state for delete popUp
    const [formData, setFormData] = useState({
        description: ''
    }) //state for data while adding in popUp
    const [holidayYear, setHolidayYear] = useState(null) //state for holidayyear
    const [name, setName] = useState(calendar && calendar.name) //state for calendarname
    const [holidayDate, setHolidayDate] = useState(null) //state for holidate date
    const [holidays, setHolidays] = useState([]) //state for list of holidays
    const [holiday, setHoliday] = useState(null) //state for holiday child
    const [index, setIndex] = useState(null) //state for capturing index which was deleted
    const [formErrors, setFormErrors] = useState({}) //state for maintaing errors

    // for redirect
    const navigate = useNavigate()

    // close popup
    const onCloseHandler = () => {
        setShow(false)
        setPop(false)
        // setDeleteShow(false)
        setHoliday(null)
        setHolidayDate(null)
        setIndex(null)
        setFormErrors({})
        setFormData({
            description: null
        })
    }

    const handleOptionalChange = () => {
        //handle optional checkbox
        setOptional(!optional)
        setFormData((prevSettings) => ({
            ...prevSettings,
            optional: !optional
        }))
    }

    const onImportValidationHandler = () => {
        //validating the import functionality
        if (holidayYear == null) {
            setFormErrors({ ...formErrors, holidayYear: 'Required' })
        } else {
            setPop(true)
            setShow(false)
            setFormErrors({})
        }
    }

    const onImportChange = (e) => {
        //assigning the imported file to data
        setPop(false)
        const file = e.target.files[0]

        if (file) {
            // Validate file type
            const fileType = file.name.split('.').pop().toLowerCase()
            if (fileType !== 'xlsx') {
                toast.error('Inappropriate file. Please upload an XLSX file.')
                return
            } else {
                const reader = new FileReader()

                reader.onload = (event) => {
                    const data = event.target.result
                    const workbook = XLSX.read(data, { type: 'binary' })
                    const sheetName = workbook.SheetNames[0]

                    const worksheet = workbook.Sheets[sheetName]

                    // Extract headers
                    const headers = []
                    const range = XLSX.utils.decode_range(worksheet['!ref'])
                    const firstRow = range.s.r

                    for (let C = range.s.c; C <= range.e.c; ++C) {
                        const cellAddress = { c: C, r: firstRow }
                        const cellRef = XLSX.utils.encode_cell(cellAddress)
                        const cell = worksheet[cellRef]
                        const header = cell ? cell.v : null
                        headers.push(header)
                    }

                    // Validate headers
                    const expectedHeaders = ['S No.', 'name', 'date', 'optional', 'description']  // <-- Adjust to your expected headers
                    const headersMatch =
                        headers.length === expectedHeaders.length &&
                        headers.every((h, i) => h === expectedHeaders[i])

                    if (!headersMatch) {
                        toast.error(
                            `Invalid headers. Expected: ${expectedHeaders.join(', ')}.`
                        )
                        return
                    }


                    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
                        raw: false,
                        dateNF: 'YYYY-MM-DD'
                    })
                    if (!sheetData || sheetData.length === 0) {
                        toast.error('The file contains no data.')
                        return
                    }
                    let yearsArray = sheetData && sheetData.map((e) => e.date)
                    let years = yearsArray && yearsArray.map((e) => moment(e).format('YYYY'))
                    let yearMatch = years && years.filter((e) => e == holidayYear)
                    if (yearMatch && yearMatch.length <= 0) {
                        setFormErrors({ ...formErrors, holidayYear: 'Mismatched Year' })
                        return
                    } else {
                        setFormErrors({})
                    }
                    // Filter sheetData based on the specified holidayYear
                    const filteredData = sheetData.filter(
                        (e) => moment(e.date).format('YYYY') === holidayYear
                    )

                    handleRow(filteredData)
                }

                file && reader.readAsBinaryString(file)
                const handleYearChange = (newYear) => {
                    // Add logic to reset or clear file-related state when the year changes
                    if (newYear) {
                        setHolidayYear(newYear)
                    }
                }
                handleYearChange()

                // Reset the input field
                e.target.value = ''
            }
        }
    }

    const handleRow = (row) => {
        //handling imported data in rows
        const filter = row.filter((obj) => {
            const formattedDate = moment(obj.date).format('YYYY-MM-DD')
            const yearFilter = moment(obj.date).format('YYYY')
            if (!holidays.every((e) => moment(e.date).format('YYYY') === yearFilter)) {
                setFormErrors({ ...formErrors, holidayYear: 'Mismatched Year' })

                return
            } else {
                setFormErrors({})
            }

            return !holidays.some((e) => moment(e.date).format('YYYY-MM-DD') === formattedDate)
        })

        const newArray = filter.map((obj) => ({
            organizationId: userDetails.organizationId,
            name: obj.name,
            description: obj.description,
            date: moment(obj.date).format('YYYY-MM-DD'),
            optional:
                obj.optional &&
                    (obj.optional.toLowerCase() === 'yes' ||
                        obj.optional.toLowerCase() === 'true' ||
                        obj.optional.toLowerCase() === 'optional')
                    ? true
                    : false
        }))
        setHoliday([...holidays, ...newArray])
        setHolidays([...holidays, ...newArray])
        setFormData([...holidays, ...newArray])
    }

    const onHandleShow = () => {
        //displaying popup for import
        if (holidayYear == null) {
            setFormErrors({ ...formErrors, holidayYear: 'Required' })
        } else {
            setShow(true)
            setOptional(false)
            setFormErrors({})
        }
    }

    // input handling
    const onChangeHandler = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value.trimStart().replace(/\s+/g, ' ')
        })
        !value
            ? setFormErrors({ ...formErrors, [name]: 'Required' })
            : setFormErrors({ ...formErrors, [name]: '' })
    }

    const onYearHandler = (year) => {
        //handling year for the holidaycalendar
        setHolidayYear(moment(year).format('YYYY'))
        !year
            ? setFormErrors({ ...formErrors, holidayYear: 'Required' })
            : setFormErrors({ ...formErrors, holidayYear: '' })
        setHolidays([]) //resetting the holidays array
    }

    const onNameHandler = (e) => {
        //handling name for holidayCalendar
        const { value } = e.target
        setName(value)
        !e
            ? setFormErrors({ ...formErrors, subject: 'Required' })
            : setFormErrors({ ...formErrors, subject: '' })
    }

    const onHolidayDateHandler = (date) => {
        //handling date for holidayCalendar
        setHolidayDate(moment(date).format('YYYY-MM-DD'))
        !date
            ? setFormErrors({ ...formErrors, holidayDate: 'Required' })
            : setFormErrors({ ...formErrors, holidayDate: '' })
    }

    useEffect(() => {
        calendarId.id != null ? onGetHolidayCalendarHandler() : setLoading(false)
    }, [])

    // get holidays list
    const onGetHolidayCalendarHandler = () => {
        getById({
            entity: 'holidays',
            organizationId: userDetails.organizationId,
            id: calendarId.id
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setLoading(false)
                    setCalendar(res.data)
                    setName(res.data.name)
                    setHolidayYear(res.data.year.toString())
                    setHolidays(
                        res.data.holidayDTOs.some((e) => e == null) ? [] : res.data.holidayDTOs
                    )

                } else {
                    setHolidays([])
                }
            })
            .catch((err) => {
                console.log(err, 'error')
            })
    }

    //Add holiday
    const onAddHolidayHandler = (e) => {
        e.preventDefault()
        const obj = {
            organizationId: userDetails.organizationId,
            name: formData.name,
            description: formData.description,
            date: moment(holidayDate).format('YYYY-MM-DD'),
            optional: optional
        }

        let Duplicate = false

        holidays.filter((e) => {
            if (e.date == holidayDate) {
                Duplicate = true
            }
        })

        if (!formData.name) {
            setFormErrors(validate(formData))
        } else if (!holidayDate) {
            setFormErrors({ ...formErrors, holidayDate: 'Required' })
        } else if (Duplicate) {
            setFormErrors({ ...formErrors, holidayDate: 'Holiday Exists...' })
        } else {
            setHolidays([...holidays, obj])
            onCloseHandler()
            setShow(false)
        }
    }

    //update holiday
    const onUpdateHolidayHandler = (e) => {
        e.preventDefault()
        const obj = {
            id: holiday && holiday.id,
            organizationId: userDetails.organizationId,
            name: formData.name ? formData.name : holiday.name,
            description: formData.description,
            date: moment(holidayDate).format('YYYY-MM-DD'),
            optional: optional
        }
        if (!formData.name) {
            setFormErrors(validate(formData))
        } else if (!holidayDate) {
            setFormErrors({ ...formErrors, holidayDate: 'Required' })
        } else {
            const updatedHolidays = [...holidays]
            updatedHolidays[index] = obj // Update the specific holiday
            setHolidays(updatedHolidays) // Update the state with the new array
            onCloseHandler()
            setHoliday({})
            setFormData({})
        }
    }

    // holiday edit
    const onEditHandler = (id, index, data) => {
        setHoliday(data)
        setOptional(data.optional)
        setIndex(index)
        setShow(true)
        setHolidayDate(data.date)
        setFormData(data)
    }

    const onDeleteHandler = (id, index) => {
        //delete holiday according to index
        const updatedHolidays = [...holidays]
        updatedHolidays.splice(index, 1) // Remove the item from the local state
        setHolidays(updatedHolidays)
    }

    //save holidayCalendar
    const onSaveHandler = () => {
        setLoading(true)
        let holidayObj = {
            name: name,
            organizationId: userDetails.organizationId,
            year: holidayYear,
            holidayDTOs: holidays
        }
        if (holidayYear == null && name == null) {
            setFormErrors({
                ...formErrors,
                holidayYear: 'Required',
                subject: 'Required'
            })
            setLoading(false)
        } else if (holidayYear == null) {
            setFormErrors({ ...formErrors, holidayYear: 'Required' })
            setLoading(false)
        } else if (name == null) {
            setFormErrors({ ...formErrors, subject: 'Required' })
            setLoading(false)
        } else {
            save({
                entity: 'holidays',
                organizationId: userDetails.organizationId,
                body: holidayObj,
                screenName: 'Holiday Calendar',
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Holiday Calendar',
                    operationType: 'save'
                })
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        setLoading(false)
                        ToastSuccess(res.message)
                        navigate('/holidayCalendarList')
                    }
                })
                .catch((e) => {
                    setLoading(false)
                    ToastError(e.message)
                })
        }
    }

    //update holidayCalendar
    const onUpdateLocationHandler = () => {
        setLoading(true)
        const holidaysObj = {
            id: calendar && calendar.id,
            name: name,
            organizationId: userDetails.organizationId,
            organizatonName: calendar && calendar.organizatonName,
            locationNames: null,
            year: calendar && calendar !== null ? calendar && calendar.year : null,
            holidayDTOs: holidays
        }

        if (holidayYear == null) {
            setFormErrors({ ...formErrors, holidayYear: 'Required' })
            setLoading(false)
        } else if (name == null) {
            setFormErrors({ ...formErrors, subject: 'Required' })
            setLoading(false)
        } else if (
            updateValidation(holidaysObj, calendar) &&
            compareArrayOfObjects(holidaysObj.holidayDTOs, calendar.holidayDTOs)
        ) {
            toast.info('No changes made to update')
            setLoading(false)
        } else {
            update({
                entity: 'holidays',
                id: calendarId.id,
                organizationId: userDetails.organizationId,
                body: holidaysObj,
                screenName: 'Holiday Calendar',
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Holiday Calendar',
                    operationType: 'update'
                })
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        setLoading(false)
                        ToastSuccess(res.message)
                        navigate('/holidayCalendarList')
                    }
                })
                .catch((e) => {
                    setLoading(false)
                    ToastError(e.message)
                })
        }
    }

    const GetDay = (data) => {
        //converting the day to requirement
        let fullDate = new Date(data).toString()
        let day = fullDate.slice(0, 3)
        return day
    }

    // colums for table
    const COLUMNS = [
        {
            Header: 'Date',
            accessor: 'date',
            Cell: ({ row }) => (
                <>
                    <div className="text-wrap">{<DateFormate date={row.original.date} />}</div>
                </>
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
            Cell: ({ row }) => (
                <>
                    <div className="tableNameData">{row.original.name}</div>
                </>
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
            accessor: 'description',
            Cell: ({ row }) => (
                <>
                    <div className="tableDescriptionData1">{row.original.description}</div>
                </>
            )
        },

        {
            Header: () => <div className="text-wrap text-right actions ">Actions</div>,
            accessor: 'actions',
            disableSortBy: true,
            width: '40%',
            Cell: (row) => (
                <div className="text-wrap text-right actionsWidth">
                    <Button
                        type="button"
                        variant=""
                        className="iconWidth"
                        disabled={moment(new Date()).format('YYYY-MM-DD') >= row.row.original.date}
                        onClick={() =>
                            onEditHandler(row.row.original.id, row.row.index, row.row.original)
                        }
                    >
                        <EditIcon />
                    </Button>
                    |
                    <Button
                        type="button"
                        variant=""
                        className="iconWidth"
                        disabled={moment(new Date()).format('YYYY-MM-DD') >= row.row.original.date}
                        onClick={() => onDeleteHandler(row.row.original.id, row.row.index)}
                    >
                        <DeleteIcon />
                    </Button>
                </div>
            )
        }
    ]

    // validations
    const validate = (values) => {
        const errors = {}
        if (!values.name || values.name.length < 0) {
            errors.name = 'Required'
        } else {
            errors.name = ''
        }
        if (holidayDate == null) {
            errors.holidayDate = 'Required'
        }
        if (!values.description || values.description.length < 0) {
            errors.description = 'Required'
        }

        return errors
    }
    return (
        <>
            <>
                {loading ? <DetailLoader /> : ''}
                <section className="section detailBackground">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="">
                                    <PageHeader
                                        pageTitle={
                                            (calendarId.id == null ? 'Add' : 'Update') +
                                            ' ' +
                                            'Holiday Calendar'
                                        }
                                    />

                                    <>
                                        <div className="">
                                            <div style={{ display: 'flex', marginBottom: '10px' }}>
                                                <div style={{ flex: 1 }}>
                                                    <Form.Group
                                                        as={Row}
                                                        controlId="formGroupToDate"
                                                    >
                                                        <Form.Label
                                                            className="fieldLabel"
                                                            column
                                                            md={2}
                                                        >
                                                            Name <span className="error">*</span>
                                                        </Form.Label>
                                                        <Col md={5}>
                                                            <Form.Control
                                                                className="textBox"
                                                                onChange={onNameHandler}
                                                                defaultValue={
                                                                    calendar && calendar.name
                                                                }
                                                                maxLength={50}
                                                                name="name"
                                                                type="text"
                                                                onBlur={(e) =>
                                                                    !e.target.value
                                                                        ? setFormErrors({
                                                                            ...formErrors,
                                                                            subject: 'Required'
                                                                        })
                                                                        : setFormErrors({
                                                                            ...formErrors,
                                                                            subject: ''
                                                                        })
                                                                }
                                                                onKeyPress={(e) =>
                                                                    handleKeyPress(e, setFormErrors)
                                                                }
                                                                onPaste={(e) =>
                                                                    handleKeyPress(e, setFormErrors)
                                                                }
                                                                onInput={(e) =>
                                                                    handleKeyPress(e, setFormErrors)
                                                                }
                                                            />
                                                            {formErrors.subject && (
                                                                <p className="error">
                                                                    {formErrors.subject}
                                                                </p>
                                                            )}
                                                        </Col>
                                                    </Form.Group>
                                                </div>

                                                <div style={{ flex: 1 }}>
                                                    <Form.Group
                                                        as={Row}
                                                        controlId="formGroupToDate"
                                                    >
                                                        <Form.Label column md={2}>
                                                            Year <span className="error">*</span>
                                                        </Form.Label>
                                                        <Col md={8}>
                                                            <DatePicker
                                                                placeholder={''}
                                                                value={
                                                                    holidayYear == null
                                                                        ? null
                                                                        : moment(holidayYear)
                                                                }
                                                                clearIcon={false}
                                                                inputReadOnly={true}
                                                                disabled={
                                                                    calendar == null ? false : true
                                                                }
                                                                picker="year"
                                                                onChange={onYearHandler}
                                                                disabledDate={(current) => {
                                                                    const tomorrow = new Date()
                                                                    tomorrow.setDate(
                                                                        tomorrow.getDate() + 1
                                                                    )
                                                                    let customDate =
                                                                        moment(tomorrow).format(
                                                                            'YYYY-MM-DD'
                                                                        )
                                                                    return (
                                                                        current &&
                                                                        current <
                                                                        moment(
                                                                            customDate,
                                                                            'YYYY-MM-DD'
                                                                        )
                                                                    )
                                                                }}
                                                            />
                                                            <p className="error">
                                                                {formErrors.holidayYear}
                                                            </p>
                                                        </Col>
                                                    </Form.Group>
                                                </div>
                                            </div>
                                            {/* <div className="holidayImportPosition">
                                                <label
                                                    className="holidayImport"
                                                    onClick={() => onImportValidationHandler()}
                                                >
                                                    <CiImport className="themeColor" size={20} />{' '}
                                                    Import
                                                </label>
                                            </div> */}
                                            <div className="holidayImportWrapper">
                                                <label
                                                    className="holidayImport"
                                                    onClick={() => onImportValidationHandler()}
                                                >
                                                    <CiImport className="themeColor" size={20} />
                                                    Import
                                                </label>
                                            </div>
                                            <div className="table mb-1">
                                                <Button
                                                    className="addButton"
                                                    variant="addbtn"
                                                    onClick={onHandleShow}
                                                >
                                                    <AddIcon />
                                                </Button>
                                                <Table
                                                    columns={COLUMNS}
                                                    serialNumber={true}
                                                    data={holidays}
                                                    pageSize="10"
                                                />
                                            </div>

                                            <div className="btnCenter mb-3">
                                                {calendarId.id != null ? (
                                                    <>
                                                        <Button
                                                            className="Button"
                                                            variant="addbtn"
                                                            type="button"
                                                            onClick={onUpdateLocationHandler}
                                                        >
                                                            Update
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button
                                                            className="Button"
                                                            variant="addbtn"
                                                            type="button"
                                                            onClick={onSaveHandler}
                                                        >
                                                            Save
                                                        </Button>
                                                    </>
                                                )}
                                                <Button
                                                    className="Button"
                                                    variant="secondary"
                                                    type="button"
                                                    onClick={() => navigate('/holidayCalendarList')}
                                                >
                                                    {cancelButtonName}
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <Modal
                    show={show}
                    onHide={onCloseHandler}
                    backdrop="static"
                    keyboard={false}
                    size="lg"
                >
                    <Modal.Header closeButton={onCloseHandler}>
                        <Modal.Title>{index == null ? 'Add' : 'Update'} Holiday</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form className="modalFormBody">
                            <div class="col-">
                                <Form.Group
                                    as={Row}
                                    className="mb-2 justify-content-center"
                                    controlId="formGroupToDate"
                                >
                                    <Form.Label column md={3}>
                                        Date <span className="error">*</span>
                                    </Form.Label>
                                    <Col md={7}>
                                        <DatePicker
                                            value={holidayDate == null ? '' : moment(holidayDate)}
                                            onChange={(e) => onHolidayDateHandler(e)}
                                            inputReadOnly={true}
                                            placeholder=""
                                            disabledDate={(current) => {
                                                const tomorrow = new Date()
                                                tomorrow.setDate(tomorrow.getDate() + 1)
                                                let customDate =
                                                    moment(tomorrow).format('YYYY-MM-DD')
                                                return (
                                                    (current &&
                                                        current <
                                                        moment(customDate, 'YYYY-MM-DD')) ||
                                                    current.year() !== moment(holidayYear).year()
                                                )
                                            }}
                                            format={'DD-MM-YYYY'}
                                            allowClear={false}
                                            onBlur={(e) =>
                                                !e.target.value
                                                    ? setFormErrors({
                                                        ...formErrors,
                                                        holidayDate: 'Required'
                                                    })
                                                    : setFormErrors({
                                                        ...formErrors,
                                                        holidayDate: ''
                                                    })
                                            }
                                        />
                                        <p className="error">{formErrors.holidayDate}</p>
                                    </Col>
                                </Form.Group>
                            </div>

                            <div class="col-">
                                <Form.Group
                                    as={Row}
                                    className="mb-2 justify-content-center"
                                    controlId="formGroupToDate"
                                >
                                    <Form.Label column md={3}>
                                        Name <span className="error">*</span>
                                    </Form.Label>
                                    <Col md={7}>
                                        <Form.Control
                                            required
                                            defaultValue={holiday == null ? '' : holiday.name}
                                            onChange={onChangeHandler}
                                            name="name"
                                            type="text"
                                            maxLength={32}
                                            onBlur={(e) =>
                                                !e.target.value
                                                    ? setFormErrors({
                                                        ...formErrors,
                                                        name: 'Required'
                                                    })
                                                    : setFormErrors({ ...formErrors, name: '' })
                                            }
                                        />
                                        <p className="error">{formErrors.name}</p>
                                    </Col>
                                </Form.Group>
                            </div>
                            <div class="col-">
                                <Form.Group as={Row} className="mb-3" controlId="formGroupToDate">
                                    <Form.Label column md={3} style={{ marginLeft: '6%' }}>
                                        Is Optional ?
                                    </Form.Label>
                                    <Col sm={5}>
                                        <input
                                        style={{ marginTop: '0.8rem' }}
                                            value="overtime"
                                            type="checkbox"
                                            checked={optional}
                                            onChange={handleOptionalChange}
                                        />
                                    </Col>
                                </Form.Group>
                            </div>
                            <div class="col-">
                                <Form.Group
                                    as={Row}
                                    className="mb-4 justify-content-center"
                                    controlId="formGroupToDate"
                                >
                                    <Form.Label column md={3}>
                                        Description
                                    </Form.Label>
                                    <Col md={7}>
                                        <Form.Control
                                            as="textarea"
                                            defaultValue={
                                                holiday == null ? '' : holiday.description
                                            }
                                            onChange={onChangeHandler}
                                            name="description"
                                            type="text"
                                            maxLength={250}
                                        // onBlur={(e) =>
                                        //   !e.target.value
                                        //     ? setFormErrors({
                                        //       ...formErrors,
                                        //       description: "Required",
                                        //     })
                                        //     : setFormErrors({
                                        //       ...formErrors,
                                        //       description: "",
                                        //     })
                                        // }
                                        />
                                        {/* {formData.description ? (
                      <span
                        style={{
                          textAlign: "right",
                          fontSize: "85%",
                          marginLeft: "295px",
                          marginTop: "0px",
                        }}
                      >
                        /250{" "}
                      </span>
                    ) : (
                      ""
                    )} */}
                                    </Col>
                                </Form.Group>
                            </div>

                            {/* <div className="container"> */}
                            <div className="btnCenter">
                                {index == null ? (
                                    <Button
                                        className="Button"
                                        variant="addbtn"
                                        type="button"
                                        onClick={onAddHolidayHandler}
                                    >
                                        Add
                                    </Button>
                                ) : (
                                    <Button
                                        className="Button"
                                        variant="addbtn"
                                        type="button"
                                        onClick={onUpdateHolidayHandler}
                                    >
                                        Update
                                    </Button>
                                )}
                                <Button
                                    className="Button"
                                    variant="secondary"
                                    type="button"
                                    onClick={() => onCloseHandler()}
                                >
                                    {cancelButtonName}
                                </Button>
                            </div>
                        </form>
                    </Modal.Body>
                </Modal>

                <Modal
                    size="mg"
                    show={pop}
                    onHide={onCloseHandler}
                    backdrop="static"
                    keyboard={false}
                >
                    <Modal.Header closeButton={onCloseHandler}>
                        <Modal.Title>File Import</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div style={{ marginLeft: '70%', paddingBottom: '7%' }}>
                            <a
                                href="/dist/Pdf/HolidayCalendarXL.xlsx"
                                download="HolidayCalendarXL.xlsx"
                            >
                                <u>Download Template</u>
                            </a>
                        </div>
                        <div className="modalFormBody" style={{ maxWidth: '100%' }}>
                            <div className="d-flex align-items-center mb-3">
                                <Form.Label style={{ marginRight: '10px' }}>Upload File</Form.Label>

                                <div>
                                    <Form.Control
                                        style={{ width: '300px' }}
                                        size="sm"
                                        type="file"
                                        onChange={(e) => onImportChange(e)}
                                        accept=".xlsx,.xls"
                                    />
                                    <p
                                        style={{
                                            fontSize: '85%',
                                            fontWeight: '500',
                                            color: '#374681',
                                            marginTop: '5px'
                                        }}
                                    >
                                        Only xlsx files accepted.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                    <div className="btnCenter mb-3">
                        <Button variant="secondary" className="Button" onClick={onCloseHandler}>
                            Close
                        </Button>
                    </div>
                </Modal>
            </>
        </>
    )
}

export default HolidayCalendar
