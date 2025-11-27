import moment from 'moment'
import React, { useEffect, useRef, useState } from 'react'
import { Modal, Tabs } from 'react-bootstrap'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Tab from 'react-bootstrap/Tab'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import Select from 'react-select'
import { toast } from 'react-toastify'
import { commonCrudSuccess } from '../../Common/CommonComponents/CustomizedSuccessToastMessages'
import {
    compareArrayOfObjects,
    handleKeyPress,
    updateValidation
} from '../../Common/CommonComponents/FormControlValidation'
import DetailLoader from '../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../Common/CommonComponents/PageHeader'
import { ToastError, ToastSuccess } from '../../Common/CommonComponents/ToastCustomized'
import ValidateZipCode from '../../Common/CommonComponents/ValidateZipCode'
import { Doc } from '../../Common/CommonIcons/CommonIcons'
import {
    getAllByIdWithStatus,
    getAllByOrgId,
    getById,
    SaveWithFile,
    UpdateWithFile
} from '../../Common/Services/CommonService'
import { cancelButtonName } from '../../Common/Utilities/Constants'
import LocationSettings from './LocationSettings'

const Location = () => {
    const userDetails = useSelector((state) => state.user.userDetails) //fetch userdetails using redux
    const [next, setNext] = useState(0)
    const locationsData = useLocation().state
    const [formData, setFormData] = useState('') //state for storing the data the data while updating
    const [location, setLocation] = useState({}) //state for storing data to display
    // console.log(location, "location data");
    const [duration, setDuration] = useState('') //state for calculate duration
    const [shifts, setShifts] = useState([
        {
            name: 'Regular Shift',
            standardHours: true,
            fromTime: '08:00',
            toTime: '17:00',
            duration: duration,
            holidays: [
                {
                    year: new Date().getFullYear()
                },
                {
                    year: new Date().getFullYear() + 1
                }
            ]
        }
    ]) //state for shifts
    // console.log(shifts, "shifts data");
    const [loading, setLoading] = useState(true) //state for loader
    const [startTime, setStartTime] = useState({ hour: '08 AM', minute: '00' }) //state for startTime
    const [endTime, setEndTime] = useState({ hour: '05 PM', minute: '00' }) //state for endTime
    const [settings, setSettings] = useState({
        financialYearStartDayofMonth: null,
        financialYearStartMonth: null,
        payRollDay: 0,
        ytdStartDayofMonth: null,
        ytdStartMonth: null
    }) //state for locationSettings tab
    const [countries, setCountries] = useState([]) //state for countries
    const [countryId, setCountryId] = useState(null) //state for selected countryId
    const [timeZone, setTimeZone] = useState(null) //state for timeZone
    const [states, setStates] = useState([]) //state for country States
    const [stateId, setStateId] = useState(null) //state for selected stateId
    const [employees, setEmployees] = useState([]) //state for employees
    const [hrManagerList, setHrManagerList] = useState([]) //state for managersList
    const [headOffice, setHeadOffice] = useState(false) //state for headoffice
    const [formErrors, setFormErrors] = useState({}) //state for handling errors
    const navigate = useNavigate() //navigation

    useEffect(() => {
        const standardShift = shifts.find((shift) => shift.standardHours === true)
        if (standardShift && standardShift.fromTime) {
            const startParsed = parseTime(standardShift.fromTime)
            const endParsed = parseTime(standardShift.toTime)
            setStartTime({
                hour: formatToHour(parseInt(startParsed.hour)),
                minute: startParsed.minute
            })
            setEndTime({
                hour: formatToHour(parseInt(endParsed.hour)),
                minute: endParsed.minute
            })
        }
    }, [shifts])

    //converting countries to display in dropDown
    let countryOptions =
        Array.isArray(countries) && countries.length
            ? countries.map(({ countryId, name, isoCode }) => ({
                value: countryId,
                label: `${name} (${isoCode})`
            }))
            : []

    const updateStep = (step) => {
        //handling tabs in the screen
        if (step == next) {
            return step
        } else {
            setNext(step)
        }
    }

    const onCountryChangeHandler = (option) => {
        //handling of changing the country
        setCountryId(option.value)
        setStateId(null)
        onGetStateHandler(option.value)
    }

    const [labelTime, setLabelTime] = useState() //state for labelTym

    const onTimeZone = (option) => {
        //handling time zone
        setTimeZone(option.value)
        setLabelTime(option.offSet)
    }

    const onStateChangeHandler = (option) => {
        //handling of changing the state(country)
        setStateId(option.value)
    }

    const onGetStateHandler = (countryId) => {
        //get states by countryId
        getById({ entity: 'countries', organizationId: 0, id: countryId }).then((res) => {
            if (res.statusCode == 200) {
                setStates(res.data.stateDTOs)
            }
        })
    }

    // Function to get timezones and their UTC offsets
    const getTimezonesWithOffsets = () => {
        const timezonesList = moment.tz.names() // Get all timezone names from moment-timezone
        const timezonesWithOffsets = timezonesList.map((timezone) => {
            const offset = moment.tz(timezone).format('Z') // Get the UTC offset (e.g., +02:00)
            return { timezone, offset }
        })
        return timezonesWithOffsets
    }

    const timezonesWithOffsets = getTimezonesWithOffsets()

    let timezonesWithOffsetsOptions =
        Array.isArray(timezonesWithOffsets) && timezonesWithOffsets.length
            ? timezonesWithOffsets.map(({ timezone, offset }) => ({
                value: timezone,
                label: `${timezone} UTC${offset}`,
                timezone: offset === 'UTC' ? '+0:00' : offset
            }))
            : []

    useEffect(() => {
        getTimezonesWithOffsets()
        locationsData.id != null ? onGetLocationByIdHandler() : setLoading(false)
        onGetCountriesHandler()
        GetAllEmployeesByOrgId()
    }, [])

    const GetAllEmployeesByOrgId = () => {
        getAllByIdWithStatus({
            entity: 'employees',
            organizationId: userDetails.organizationId,
            status: 'Active'
        }).then((res) => {
            if (res.statusCode == 200) {
                setEmployees(
                    res.data.map((employee) => {
                        const fullName = employee.firstName + ' ' + employee.lastName;

                        // Add code only if it exists
                        const codePart = employee.code ? ` (${employee.code})` : "";

                        return {
                            value: employee.id,
                            label: fullName + codePart
                        };
                    })
                );

            }
        })
    }

    // get all countries
    const onGetCountriesHandler = () => {
        getAllByOrgId({
            entity: 'organizationCountry',
            organizationId: userDetails.organizationId
        }).then((res) => {
            const filteredCountries = res.data.filter((country) => !country.deleted)
            setCountries(filteredCountries)
        })
    }

    //handling state options according to show in the dropDown
    let stateOptions =
        Array.isArray(states) && states.length
            ? states.map(({ id, name }) => ({
                value: id,
                label: name
            }))
            : []

    const formatToHour = (hour) => {
        //converting the time to hours
        let formattedHour
        if (hour === 0) {
            formattedHour = '12' // Midnight case
        } else if (hour === 12) {
            formattedHour = '12' // Noon case
        } else {
            formattedHour = hour > 12 ? `${hour - 12}` : `${hour}`
        }
        return formattedHour.padStart(2, '0') + (hour >= 12 ? ' PM' : ' AM')
    }

    // getby id data for location
    const onGetLocationByIdHandler = () => {
        getById({
            entity: 'locations',
            organizationId: userDetails.organizationId,
            id: locationsData && locationsData.id
        }).then((res) => {
            if (res.statusCode == 200) {
                setLoading(false)
                setSettings(
                    res.data.locationSettings == null ? settings : res.data.locationSettings
                )
                setShifts(res.data.shiftDTOs.length ? res.data.shiftDTOs : shifts)
                setLocation(res.data)
                setFormData(res.data)
                setCountryId(res.data.countryId)
                setStateId(res.data.stateId)
                setHeadOffice(res.data.headOffice)
                onGetStateHandler(res.data.countryId)
                setTimeZone(res.data.timeZone)
                setLabelTime(res.data.labelTime)
                if (res.data.fromTime && res.data.toTime) {
                    const startParsed = parseTime(res.data.fromTime)
                    const endParsed = parseTime(res.data.toTime)
                    setStartTime({
                        hour: formatToHour(parseInt(startParsed.hour)),
                        minute: startParsed.minute
                    })
                    setEndTime({
                        hour: formatToHour(parseInt(endParsed.hour)),
                        minute: endParsed.minute
                    })
                }
                setHrManagerList(res.data.hrManagersIds ? res.data.hrManagersIds : [])
                convertToBlob(res.data.handBook)
            }
        })
    }

    const headOffices = () => {
        //handling the headoffice state
        if (!headOffice) {
            setHeadOffice(true)
            setFormData({ ...formData, headOffice: true })
        }
    }

    // handling the input fields while updating it
    const onInputHandler = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
        if (name == 'zipCode') {
            const validationResult = ValidateZipCode(countries, countryId, value)
            if (validationResult.isValid) {
                setFormErrors({ ...formErrors, [name]: '' })
            } else {
                setFormErrors({ ...formErrors, [name]: validationResult.error })
            }
        } else {
            !e.target.value
                ? setFormErrors({ ...formErrors, [name]: 'Required' })
                : setFormErrors({ ...formErrors, [name]: '' })
        }
    }

    const formatTo24Hour = (hour, minute) => {
        //formatting the time to 24hr time format
        let hourValue = parseInt(hour)
        const isPM = hour.includes('PM')
        if (isPM && hourValue !== 12) {
            hourValue += 12
        } else if (!isPM && hourValue === 12) {
            hourValue = 0
        }
        return `${String(hourValue).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
    }

    //save
    const onSaveHandler = (e) => {
        setLoading(true)
        e.preventDefault()
        let locationObj = {
            id: locationsData && locationsData.id,
            organizationId: userDetails.organizationId,
            headOffice: headOffice,
            name: formData.name ? formData.name : location.name,
            address1: formData.address1 ? formData.address1 : location.address1,
            address2: formData.address2 ? formData.address2 : location.address2,
            city: formData.city ? formData.city : location.city,
            stateId: stateId,
            countryId: countryId,
            zipCode: formData.zipCode ? formData.zipCode : location.zipCode,
            handBook: null,
            timeZone: timeZone,
            offSet: labelTime,
            hrManagersIds: hrManagerList,
            locationSettings: settings,
            shiftDTOs: shifts
        }
        const validationResult = ValidateZipCode(countries, countryId, formData.zipCode)
        const maxDays = ['Jan', 'Mar', 'May', 'Jul', 'Aug', 'Oct', 'Dec'].includes(
            settings.financialYearStartMonth
        )
            ? 31
            : settings.financialYearStartMonth === 'Feb'
                ? 28
                : 30
        if (!formData.name || formData.name == undefined) {
            setFormErrors(validate(locationObj))
            toast.error('Name field is requried in general information tab')
        } else if (countryId == null) {
            setFormErrors(validate(locationObj))
            toast.error('Country field is requried in general information tab')
        } else if (!formData.address1 || formData.address1 == undefined) {
            setFormErrors(validate(locationObj))
            toast.error('Line1 field is requried in general information tab')
        } else if (!formData.city || formData.city == undefined) {
            setFormErrors(validate(locationObj))
            toast.error('City field is requried in general information tab')
        } else if (stateId == null) {
            setFormErrors(validate(locationObj))
            toast.error('State field is requried in general information tab')
        } else if (!formData.zipCode || formData.zipCode == undefined) {
            setFormErrors(validate(locationObj))
            toast.error('Postal / Zip code field is requried in general information tab')
        } else if (!validationResult.isValid) {
            setFormErrors({ ...formErrors, ['zipCode']: validationResult.error })
            toast.error(validationResult.error)
            setLoading(false)
        } else if (timeZone == null) {
            setFormErrors(validate(locationObj))
            toast.error('Time Zone field is requried in general information tab')
        } else if (hrManagerList <= 0) {
            setFormErrors(validate(locationObj))
            toast.error('HR Managers field is requried in general information tab')
        } else if (!startTime.hour) {
            setFormErrors(validate(locationObj))
        } else if (!startTime.minute) {
            setFormErrors(validate(locationObj))
        } else if (!endTime.hour) {
            setFormErrors(validate(locationObj))
        } else if (!endTime.minute) {
            setFormErrors(validate(locationObj))
        } else if (
            !settings.financialYearStartMonth ||
            settings.financialYearStartMonth == undefined
        ) {
            setLoading(false)
            toast.error('Financial year month field is requried in locationsettings tab')
        } else if (settings.payRollDay <= 0 || settings.payRollDay == undefined) {
            setFormErrors(validate(locationObj))
            toast.error('Payroll day field is requried in locationsettings tab')
        } else if (settings.payRollDay < 1 || settings.payRollDay > maxDays) {
            setFormErrors({ ...formErrors, ['payRollDay']: `Must be between 1 and ${maxDays}` })
            toast.error(`Payroll day field Must be between 1 and ${maxDays}`)
            setLoading(false)
        } else {
            let locationData = new FormData()
            hrHandBook && locationData.append('handBook', hrHandBook)
            locationData.append('location', JSON.stringify(locationObj))
            SaveWithFile({
                entity: 'locations',
                organizationId: userDetails.organizationId,
                body: locationData,
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Location',
                    operationType: 'save'
                })
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        setLoading(false)
                        ToastSuccess(res.message)
                        navigate('/locationList')
                    }
                })
                .catch((err) => {
                    setLoading(false)
                    console.log(err)
                    ToastError(err.message)
                })
        }
    }

    const onCancelHandler = () => {
        //redirecting to locationList page
        navigate('/locationList')
    }

    const fileInputRef1 = useRef(null)
    const handleClick1 = () => {
        fileInputRef1.current.click()
    }

    const [hrHandBook, setHrHandBook] = useState(null) //state for hrHandBook
    const [handBook, setHandBook] = useState(null) //state for handBook
    const handleHrFileSelect = (e) => {
        //handling hrHanBook select
        const file = e.target.files[0]
        const maxSizeInMB = 15 // Maximum size in MB
        const maxSizeInBytes = maxSizeInMB * 1024 * 1024 // Convert MB to Bytes
        if (file) {
            if (file.type !== 'application/pdf') {
                toast.error('Only PDF files are allowed.')
                e.target.value = '' // Clear the file input
                return
            }
            // Check if the file size exceeds the maximum limit
            if (file.size > maxSizeInBytes) {
                toast.error(`File size must be less than ${maxSizeInMB} MB.`)
                e.target.value = '' // Clear the file input
                return
            }
            setHrHandBook(file) // Proceed if the file size is valid
            setHandBook(file)
        }
    }

    //update location
    const onUpdateHandler = (e) => {
        setLoading(true)
        e.preventDefault()
        let locationObj = {
            id: locationsData && locationsData.id,
            organizationId: userDetails.organizationId,
            headOffice: headOffice,
            name: formData.name ? formData.name : location.name,
            address1: formData.address1 ? formData.address1 : location.address1,
            address2: formData.address2 ? formData.address2 : location.address2,
            city: formData.city ? formData.city : location.city,
            stateId: stateId,
            countryId: countryId,
            handBook: location.handBook ? location.handBook : null,
            handBookName: location.handBookName ? location.handBookName : null,
            handBookType: location.handBookType ? location.handBookType : null,
            zipCode: formData.zipCode ? formData.zipCode : location.zipCode,
            timeZone: timeZone,
            offSet: labelTime == undefined ? null : labelTime,
            hrManagersIds: hrManagerList,
            locationSettings: settings,
            shiftDTOs: shifts,
            countryName: location.countryName,
            dayOfMonth: location.dayOfMonth,
            deleted: location.deleted,
            month: null,
            stateName: location.stateName
        }
        const validationResult = ValidateZipCode(countries, countryId, formData.zipCode)
        const maxDays = ['Jan', 'Mar', 'May', 'Jul', 'Aug', 'Oct', 'Dec'].includes(
            settings.financialYearStartMonth
        )
            ? 31
            : settings.financialYearStartMonth === 'Feb'
                ? 28
                : 30

        if (!formData.name || formData.name == undefined) {
            setFormErrors(validate(formData))
        } else if (countryId == null) {
            setFormErrors(validate(locationObj))
        } else if (!formData.address1 || formData.address1 == undefined) {
            setFormErrors(validate(formData))
        } else if (!formData.city || formData.city == undefined) {
            setFormErrors(validate(formData))
        } else if (stateId == null) {
            setFormErrors(validate(locationObj))
        } else if (!formData.zipCode || formData.zipCode == undefined) {
            setFormErrors(validate(formData))
        } else if (timeZone == null) {
            setFormErrors(validate(locationObj))
            toast.error('Time Zone field is requried in general information tab')
        } else if (!validationResult.isValid) {
            setFormErrors({ ...formErrors, ['zipCode']: validationResult.error })
            toast.error(validationResult.error)
            setLoading(false)
        } else if (hrManagerList <= 0) {
            setFormErrors(validate(formData))
        } else if (startTime.hour == endTime.hour && startTime.minute == endTime.minute) {
            toast.error('Start time and end time should not be same in standard bussiness hours')
            setLoading(false)
        } else if (!startTime.hour) {
            setFormErrors(validate(formData))
        } else if (!startTime.minute) {
            setFormErrors(validate(formData))
        } else if (!endTime.hour) {
            setFormErrors(validate(formData))
        } else if (!endTime.minute) {
            setFormErrors(validate(formData))
        } else if (!settings.financialYearStartMonth || settings.financialYearStartMonth == null) {
            setLoading(false)
            toast.error('Financial year month field is requried in locationsettings tab')
        } else if (settings.payRollDay <= 0 || settings.payRollDay == undefined) {
            setFormErrors(validate(formData))
            toast.error('Payroll day field is requried in locationsettings tab')
        } else if (settings.payRollDay < 1 || settings.payRollDay > maxDays) {
            setFormErrors({ ...formErrors, ['payRollDay']: `Must be between 1 and ${maxDays}` })
            toast.error(`Payroll day field Must be between 1 and ${maxDays}`)
            setLoading(false)
        } else if (
            updateValidation(locationObj, location) &&
            updateValidation(location.locationSettings, settings) &&
            compareArrayOfObjects(location.shiftDTOs, shifts) &&
            handBook == null
        ) {
            setLoading(false)
            toast.info('No changes made to update')
        } else {
            let locationData = new FormData()
            hrHandBook && locationData.append('handBook', hrHandBook)
            locationData.append('location', JSON.stringify(locationObj))
            UpdateWithFile({
                entity: 'locations',
                organizationId: userDetails.organizationId,
                id: locationObj.id,
                body: locationData,
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Location',
                    operationType: 'update'
                }),
                screenName: 'Location'
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        setLoading(false)
                        ToastSuccess(res.message)
                        navigate('/locationList')
                    }
                })
                .catch((err) => {
                    setLoading(false)
                    console.log(err)
                    ToastError(err.message)
                })
        }
    }

    const parseTime = (timeString) => {
        //handling the time to display in hours and minutes
        const [hour, minute] = timeString.split(/[:\s]/)
        return { hour, minute }
    }

    const handleTimeChange = (setter, timeType) => (e) => {
        const { name, value } = e.target
        setter((prevState) => ({ ...prevState, [name]: value }))

        // Create a deep copy of shifts and update the relevant shift
        const updatedShifts = shifts.map((shift) => ({ ...shift }))
        const standardShift = updatedShifts.find((shift) => shift.standardHours === true)

        if (standardShift) {
            if (timeType === 'startTime') {
                if (name === 'hour') {
                    standardShift.fromTime = formatTo24Hour(value, startTime.minute)
                } else {
                    standardShift.fromTime = formatTo24Hour(startTime.hour, value)
                }
            } else if (timeType === 'endTime') {
                if (name === 'hour') {
                    standardShift.toTime = formatTo24Hour(value, endTime.minute)
                } else {
                    standardShift.toTime = formatTo24Hour(endTime.hour, value)
                }
            }
        }

        setShifts(updatedShifts) // Update the shifts state
    }

    useEffect(() => {
        calculateDuration()
    }, [startTime, endTime])

    const calculateDuration = () => {
        //calculate duration according to starttime and endTime
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

    const convertToBlob = (base64Data) => {
        //converting base64 to blob
        const byteCharacters = atob(base64Data)
        const byteNumbers = new Array(byteCharacters.length)
            .fill(0)
            .map((_, i) => byteCharacters.charCodeAt(i))
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: 'application/pdf' })
        setHrHandBook(blob)
    }

    const validate = (values) => {
        setLoading(false)
        const errors = {}
        validateField(values.name, 'name', errors)
        validateField(values.address1, 'address1', errors)
        validateField(values.city, 'city', errors)
        validateField(values.zipCode, 'zipCode', errors)
        validateField(timeZone, 'timeZone', errors) //1768 changes the reference to timeZone for validation

        if (countryId == null) {
            errors.countryId = 'Required'
        }

        if (stateId == null) {
            errors.stateId = 'Required'
        }

        if (!Array.isArray(hrManagerList) || hrManagerList.length === 0) {
            errors.manager = 'Required'
        }

        validateTime(startTime, 'fromTime', errors)
        validateTime(endTime, 'toTime', errors)

        if (!settings.payRollDay || settings.payRollDay <= 0) {
            errors.payRollDay = 'Required'
        }

        if (settings.financialYearStartMonth == null) {
            errors.financialYearStartMonth = 'Required'
        } else {
            errors.financialYearStartMonth = ''
        }

        return errors
    }

    const validateField = (value, fieldName, errors) => {
        if (!value || value.length <= 0) {
            errors[fieldName] = 'Required'
        }
    }

    const validateTime = (timeObj, field, errors) => {
        if (!timeObj.hour || !timeObj.minute) {
            errors[field] = 'Required'
        }
    }

    const [fileshow, setFileShow] = useState(false) //state for hrHandBook preview

    const handleFilesShow = (action) => {
        //handling hrhandbook preview
        if (action == 'handBook') {
            setFileShow(true)
        }
    }

    const onCloseHandler = () => {
        //handling hrHandbook preview close
        setFileShow(false)
    }

    const onManagersHandler = (ids) => {
        //handling hrmanagerIds
        setHrManagerList(ids.map((id) => id.value))
    }

    return (
        <>
            {loading && <DetailLoader />}
            {locationsData ? (
                <section className="section detailBackground">
                    <div className="">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-md-12">
                                    <div>
                                        <Tabs
                                            style={{ marginTop: '3%' }}
                                            activeKey={next}
                                            onSelect={updateStep}
                                        >
                                            <Tab
                                                className="tabText"
                                                eventKey={0}
                                                onClick={() => updateStep(0)}
                                                id="General Information"
                                                title="General Information"
                                            >
                                                <PageHeader
                                                    pageTitle={`${locationsData.id == null ? 'Add' : 'Update'} Location`}
                                                />
                                                <div className="formBody">
                                                    <form className="card-body">
                                                        <div class="col-">
                                                            <Form.Group
                                                                as={Row}
                                                                className="mb-2"
                                                                controlId="formGroupToDate"
                                                            >
                                                                <Form.Label
                                                                    className="fieldLabel"
                                                                    column
                                                                    md={3}
                                                                >
                                                                    Name{' '}
                                                                    <span className="error">*</span>
                                                                </Form.Label>
                                                                <Col md={8}>
                                                                    <Form.Control
                                                                        className="textBox"
                                                                        required
                                                                        onChange={onInputHandler}
                                                                        defaultValue={
                                                                            location &&
                                                                            location.name
                                                                        }
                                                                        name="name"
                                                                        type="text"
                                                                        maxLength={85}
                                                                        onBlur={onInputHandler}
                                                                        onKeyPress={(e) =>
                                                                            handleKeyPress(
                                                                                e,
                                                                                setFormErrors
                                                                            )
                                                                        }
                                                                        onPaste={(e) =>
                                                                            handleKeyPress(
                                                                                e,
                                                                                setFormErrors
                                                                            )
                                                                        }
                                                                        onInput={(e) =>
                                                                            handleKeyPress(
                                                                                e,
                                                                                setFormErrors
                                                                            )
                                                                        }
                                                                    />
                                                                    {formErrors.name && (
                                                                        <p className="error">
                                                                            {formErrors.name}
                                                                        </p>
                                                                    )}
                                                                </Col>
                                                            </Form.Group>
                                                        </div>

                                                        <div class="col-">
                                                            <Form.Group
                                                                as={Row}
                                                                className=""
                                                                controlId="formGroupToDate"
                                                            >
                                                                <Form.Label
                                                                    className="fieldLabel"
                                                                    column
                                                                    md={3}
                                                                >
                                                                    Country{' '}
                                                                    <span className="error">*</span>
                                                                </Form.Label>
                                                                <Col md={8}>
                                                                    <Select
                                                                        className="dropdown"
                                                                        placeholder=""
                                                                        options={countryOptions}
                                                                        value={countryOptions.filter(
                                                                            (e) =>
                                                                                e.value == countryId
                                                                        )}
                                                                        onChange={(e) =>
                                                                            onCountryChangeHandler(
                                                                                e
                                                                            )
                                                                        }
                                                                        onBlur={() =>
                                                                            countryId == null
                                                                                ? setFormErrors({
                                                                                    ...formErrors,
                                                                                    countryId:
                                                                                        'Required'
                                                                                })
                                                                                : setFormErrors({
                                                                                    ...formErrors,
                                                                                    countryId: ''
                                                                                })
                                                                        }
                                                                    />
                                                                    <p className="error">
                                                                        {formErrors.countryId}
                                                                    </p>
                                                                </Col>
                                                            </Form.Group>
                                                        </div>

                                                        <div class="col-">
                                                            <Form.Group
                                                                as={Row}
                                                                className=""
                                                                controlId="formGroupToDate"
                                                            >
                                                                <Form.Label
                                                                    className="fieldLabel"
                                                                    column
                                                                    md={3}
                                                                >
                                                                    Line 1{' '}
                                                                    <span className="error">*</span>
                                                                </Form.Label>
                                                                <Col md={8}>
                                                                    <Form.Control
                                                                        className="textBox"
                                                                        required
                                                                        onChange={onInputHandler}
                                                                        defaultValue={
                                                                            location &&
                                                                            location.address1
                                                                        }
                                                                        name="address1"
                                                                        type="text"
                                                                        onBlur={onInputHandler}
                                                                        maxLength={250}
                                                                    />
                                                                    <p className="error">
                                                                        {formErrors.address1}
                                                                    </p>
                                                                </Col>
                                                            </Form.Group>
                                                        </div>

                                                        <div class="col-">
                                                            <Form.Group
                                                                as={Row}
                                                                className="mb-3"
                                                                controlId="formGroupToDate"
                                                            >
                                                                <Form.Label
                                                                    className="fieldLabel"
                                                                    column
                                                                    md={3}
                                                                >
                                                                    Line 2
                                                                </Form.Label>
                                                                <Col md={8}>
                                                                    <Form.Control
                                                                        className="textBox"
                                                                        defaultValue={
                                                                            location &&
                                                                            location.address2
                                                                        }
                                                                        onChange={onInputHandler}
                                                                        name="address2"
                                                                        type="text"
                                                                        maxLength={250}
                                                                    />
                                                                </Col>
                                                            </Form.Group>
                                                        </div>

                                                        <div class="col-">
                                                            <Form.Group
                                                                as={Row}
                                                                className=""
                                                                controlId="formGroupToDate"
                                                            >
                                                                <Form.Label
                                                                    className="fieldLabel"
                                                                    column
                                                                    md={3}
                                                                >
                                                                    City{' '}
                                                                    <span className="error">*</span>
                                                                </Form.Label>
                                                                <Col md={8}>
                                                                    <Form.Control
                                                                        className="textBox"
                                                                        required
                                                                        onKeyPress={(e) =>
                                                                            handleKeyPress(
                                                                                e,
                                                                                setFormErrors
                                                                            )
                                                                        }
                                                                        onPaste={(e) =>
                                                                            handleKeyPress(
                                                                                e,
                                                                                setFormErrors
                                                                            )
                                                                        }
                                                                        onInput={(e) =>
                                                                            handleKeyPress(
                                                                                e,
                                                                                setFormErrors
                                                                            )
                                                                        }
                                                                        defaultValue={
                                                                            location &&
                                                                            location.city
                                                                        }
                                                                        onChange={onInputHandler}
                                                                        name="city"
                                                                        type="text"
                                                                        maxLength={85}
                                                                        onBlur={onInputHandler}
                                                                    />
                                                                    <p className="error">
                                                                        {formErrors.city}
                                                                    </p>
                                                                </Col>
                                                            </Form.Group>
                                                        </div>
                                                        <div class="col-">
                                                            <Form.Group
                                                                as={Row}
                                                                className=""
                                                                controlId="formGroupToDate"
                                                            >
                                                                <Form.Label
                                                                    className="fieldLabel"
                                                                    column
                                                                    md={3}
                                                                >
                                                                    State{' '}
                                                                    <span className="error">*</span>
                                                                </Form.Label>
                                                                <Col md={8}>
                                                                    <Select
                                                                        className="dropdown"
                                                                        placeholder=""
                                                                        options={stateOptions}
                                                                        onChange={(e) =>
                                                                            onStateChangeHandler(e)
                                                                        }
                                                                        value={stateOptions.filter(
                                                                            (e) =>
                                                                                e.value == stateId
                                                                        )}
                                                                        onBlur={() =>
                                                                            stateId == null
                                                                                ? setFormErrors({
                                                                                    ...formErrors,
                                                                                    stateId:
                                                                                        'Required'
                                                                                })
                                                                                : setFormErrors({
                                                                                    ...formErrors,
                                                                                    stateId: ''
                                                                                })
                                                                        }
                                                                    />
                                                                    <p className="error">
                                                                        {formErrors.stateId}
                                                                    </p>
                                                                </Col>
                                                            </Form.Group>
                                                        </div>

                                                        <div class="col-">
                                                            <Form.Group
                                                                as={Row}
                                                                className=""
                                                                controlId="formGroupToDate"
                                                            >
                                                                <Form.Label
                                                                    className="fieldLabel"
                                                                    column
                                                                    md={3}
                                                                >
                                                                    Postal / Zip Code{' '}
                                                                    <span className="error">*</span>
                                                                </Form.Label>

                                                                <Col md={8}>
                                                                    <Form.Control
                                                                        className="textBox"
                                                                        required
                                                                        defaultValue={
                                                                            location &&
                                                                            location.zipCode
                                                                        }
                                                                        onChange={onInputHandler}
                                                                        name="zipCode"
                                                                        type="text"
                                                                        maxLength={10}
                                                                        onBlur={onInputHandler}
                                                                    />

                                                                    <p className="error">
                                                                        {formErrors.zipCode}
                                                                    </p>
                                                                </Col>
                                                            </Form.Group>
                                                        </div>

                                                        <div class="col-">
                                                            <Form.Group
                                                                as={Row}
                                                                className=""
                                                                controlId="formGroupToDate"
                                                            >
                                                                <Form.Label
                                                                    className="fieldLabel"
                                                                    column
                                                                    md={3}
                                                                >
                                                                    Time Zone{' '}
                                                                    <span className="error">*</span>
                                                                </Form.Label>

                                                                <Col md={8}>
                                                                    <Select
                                                                        className="dropdown"
                                                                        placeholder=""
                                                                        options={
                                                                            timezonesWithOffsetsOptions
                                                                        }
                                                                        value={timezonesWithOffsetsOptions.filter(
                                                                            (e) =>
                                                                                e.value == timeZone
                                                                        )}
                                                                        onChange={(e) =>
                                                                            onTimeZone(e)
                                                                        }
                                                                        onBlur={() =>
                                                                            timeZone == null
                                                                                ? setFormErrors({
                                                                                    ...formErrors,

                                                                                    timeZone:
                                                                                        'Required'
                                                                                })
                                                                                : setFormErrors({
                                                                                    ...formErrors,

                                                                                    timeZone: ''
                                                                                })
                                                                        }
                                                                    />

                                                                    <p className="error">
                                                                        {formErrors.timeZone}
                                                                    </p>
                                                                </Col>
                                                            </Form.Group>
                                                        </div>

                                                        <div class="col-">
                                                            <Form.Group
                                                                as={Row}
                                                                className=""
                                                                controlId="formGroupToDate"
                                                            >
                                                                <Form.Label
                                                                    className="fieldLabel"
                                                                    column
                                                                    md={3}
                                                                >
                                                                    HR Managers{' '}
                                                                    <span className="error">*</span>
                                                                </Form.Label>

                                                                <Col md={8}>
                                                                    <Select
                                                                        className="dropdown"
                                                                        placeholder=""
                                                                        isMulti={true}
                                                                        options={employees}
                                                                        onChange={(e) =>
                                                                            onManagersHandler(e)
                                                                        }
                                                                        value={
                                                                            employees &&
                                                                            employees.filter(
                                                                                (elem) => {
                                                                                    return hrManagerList.some(
                                                                                        (ele) => {
                                                                                            return (
                                                                                                ele ==
                                                                                                elem.value
                                                                                            )
                                                                                        }
                                                                                    )
                                                                                }
                                                                            )
                                                                        }
                                                                        onBlur={() =>
                                                                            hrManagerList <= 0
                                                                                ? setFormErrors({
                                                                                    ...formErrors,

                                                                                    manager:
                                                                                        'Required'
                                                                                })
                                                                                : setFormErrors({
                                                                                    ...formErrors,

                                                                                    manager: ''
                                                                                })
                                                                        }
                                                                    />

                                                                    <p className="error">
                                                                        {formErrors.manager}
                                                                    </p>
                                                                </Col>
                                                            </Form.Group>
                                                        </div>

                                                        <div class="col-">
                                                            <Form.Group
                                                                as={Row}
                                                                className="mb-3"
                                                                controlId="formGroupToDate"
                                                            >
                                                                <Form.Label
                                                                    className="fieldLable"
                                                                    column
                                                                    md={3}
                                                                    style={{ whiteSpace: 'nowrap' }}
                                                                >
                                                                    HR Handbook
                                                                </Form.Label>

                                                                <Col md={8}>
                                                                    {location.handBook == null ? (
                                                                        <Form.Control
                                                                            onChange={(event) =>
                                                                                handleHrFileSelect(
                                                                                    event
                                                                                )
                                                                            }
                                                                            type="file"
                                                                            accept="application/pdf"
                                                                        />
                                                                    ) : (
                                                                        <>
                                                                            <a
                                                                                variant=""
                                                                                className=""
                                                                                onClick={() =>
                                                                                    handleFilesShow(
                                                                                        'handBook'
                                                                                    )
                                                                                }
                                                                            >
                                                                                <Doc
                                                                                    height={'50px'}
                                                                                />
                                                                            </a>

                                                                            <>
                                                                                <img
                                                                                    onClick={
                                                                                        handleClick1
                                                                                    }
                                                                                    type="button"
                                                                                    style={{
                                                                                        marginTop:
                                                                                            '35px'
                                                                                    }}
                                                                                    src="/dist/OceanImages/edit.png"
                                                                                    height={15}
                                                                                />

                                                                                <input
                                                                                    type="file"
                                                                                    accept="application/pdf"
                                                                                    ref={
                                                                                        fileInputRef1
                                                                                    }
                                                                                    style={{
                                                                                        display:
                                                                                            'none'
                                                                                    }}
                                                                                    onChange={(
                                                                                        event
                                                                                    ) =>
                                                                                        handleHrFileSelect(
                                                                                            event
                                                                                        )
                                                                                    }
                                                                                />
                                                                            </>
                                                                        </>
                                                                    )}

                                                                    <p className="">
                                                                        Only allowed PDF files up to
                                                                        15MB.
                                                                    </p>
                                                                </Col>
                                                            </Form.Group>
                                                        </div>

                                                        <div class="col-">
                                                            <Form.Group
                                                                as={Row}
                                                                className="mb-3"
                                                                controlId="formGroupToDate"
                                                            >
                                                                <Form.Label
                                                                    className="fieldLabel"
                                                                    column
                                                                    md={3}
                                                                >
                                                                    {' '}
                                                                    Head office ?
                                                                </Form.Label>

                                                                <Col sm={8}>
                                                                    <input
                                                                        value="headOffice"
                                                                        type="checkbox"
                                                                        checked={headOffice}
                                                                        onChange={headOffices}
                                                                        disabled={headOffice}
                                                                    />
                                                                </Col>
                                                            </Form.Group>
                                                        </div>

                                                        <div className="col-">
                                                            <Form.Group
                                                                as={Row}
                                                                className="mb-4"
                                                                controlId="formGroupToDate"
                                                            >
                                                                <Form.Label
                                                                    className="fieldLabel"
                                                                    column
                                                                    md={3}
                                                                >
                                                                    Standard Business Hours
                                                                    <span className="error">*</span>
                                                                </Form.Label>

                                                                <Col md={8}>
                                                                    <div
                                                                        style={{
                                                                            display: 'flex',
                                                                            alignItems: 'center'
                                                                        }}
                                                                    >
                                                                        <Form.Group
                                                                            as={Row}
                                                                            className="mb-0"
                                                                            style={{ flex: 1 }}
                                                                        >
                                                                            <Form.Label
                                                                                column
                                                                                sm={3}
                                                                            >
                                                                                Start
                                                                                <span
                                                                                    style={{
                                                                                        color: 'red'
                                                                                    }}
                                                                                >
                                                                                    *
                                                                                </span>
                                                                            </Form.Label>

                                                                            <Col sm={9}>
                                                                                <div
                                                                                    style={{
                                                                                        display:
                                                                                            'flex',
                                                                                        alignItems:
                                                                                            'center',
                                                                                        gap: '0.5rem'
                                                                                    }}
                                                                                >
                                                                                    <Form.Control
                                                                                        as="select"
                                                                                        name="hour"
                                                                                        value={
                                                                                            startTime.hour
                                                                                        }
                                                                                        onChange={handleTimeChange(
                                                                                            setStartTime,
                                                                                            'startTime'
                                                                                        )}
                                                                                        required
                                                                                    >
                                                                                        <option value="12 AM">
                                                                                            0 AM
                                                                                        </option>

                                                                                        {[
                                                                                            ...Array(
                                                                                                11
                                                                                            )
                                                                                        ].map(
                                                                                            (
                                                                                                _,
                                                                                                i
                                                                                            ) => {
                                                                                                const hourValue =
                                                                                                    String(
                                                                                                        i +
                                                                                                        1
                                                                                                    ).padStart(
                                                                                                        2,
                                                                                                        '0'
                                                                                                    ) +
                                                                                                    ' AM'
                                                                                                return (
                                                                                                    <option
                                                                                                        key={
                                                                                                            hourValue
                                                                                                        }
                                                                                                        value={
                                                                                                            hourValue
                                                                                                        }
                                                                                                    >
                                                                                                        {i +
                                                                                                            1}{' '}
                                                                                                        AM
                                                                                                    </option>
                                                                                                )
                                                                                            }
                                                                                        )}

                                                                                        <option value="12 PM">
                                                                                            12 PM
                                                                                        </option>

                                                                                        {[
                                                                                            ...Array(
                                                                                                11
                                                                                            )
                                                                                        ].map(
                                                                                            (
                                                                                                _,
                                                                                                i
                                                                                            ) => {
                                                                                                const hourValue =
                                                                                                    String(
                                                                                                        i +
                                                                                                        1
                                                                                                    ).padStart(
                                                                                                        2,
                                                                                                        '0'
                                                                                                    ) +
                                                                                                    ' PM'
                                                                                                return (
                                                                                                    <option
                                                                                                        key={
                                                                                                            hourValue
                                                                                                        }
                                                                                                        value={
                                                                                                            hourValue
                                                                                                        }
                                                                                                    >
                                                                                                        {i +
                                                                                                            1}{' '}
                                                                                                        PM
                                                                                                    </option>
                                                                                                )
                                                                                            }
                                                                                        )}
                                                                                    </Form.Control>

                                                                                    <Form.Control
                                                                                        as="select"
                                                                                        name="minute"
                                                                                        value={
                                                                                            startTime.minute
                                                                                        }
                                                                                        onChange={handleTimeChange(
                                                                                            setStartTime,
                                                                                            'startTime'
                                                                                        )}
                                                                                        required
                                                                                    >
                                                                                        {[
                                                                                            0, 15,
                                                                                            30, 45
                                                                                        ].map(
                                                                                            (
                                                                                                min
                                                                                            ) => (
                                                                                                <option
                                                                                                    key={
                                                                                                        min
                                                                                                    }
                                                                                                    value={String(
                                                                                                        min
                                                                                                    ).padStart(
                                                                                                        2,
                                                                                                        '0'
                                                                                                    )}
                                                                                                >
                                                                                                    {String(
                                                                                                        min
                                                                                                    ).padStart(
                                                                                                        2,
                                                                                                        '0'
                                                                                                    )}
                                                                                                </option>
                                                                                            )
                                                                                        )}
                                                                                    </Form.Control>
                                                                                </div>

                                                                                <p
                                                                                    style={{
                                                                                        color: 'red'
                                                                                    }}
                                                                                >
                                                                                    {
                                                                                        formErrors.fromTime
                                                                                    }
                                                                                </p>
                                                                            </Col>
                                                                        </Form.Group>

                                                                        {'  '}

                                                                        <Form.Group
                                                                            as={Row}
                                                                            className="mb-0"
                                                                            style={{ flex: 1 }}
                                                                        >
                                                                            <Form.Label
                                                                                column
                                                                                sm={3}
                                                                            >
                                                                                End
                                                                                <span
                                                                                    style={{
                                                                                        color: 'red'
                                                                                    }}
                                                                                >
                                                                                    *
                                                                                </span>
                                                                            </Form.Label>

                                                                            <Col sm={9}>
                                                                                <div
                                                                                    style={{
                                                                                        display:
                                                                                            'flex',
                                                                                        alignItems:
                                                                                            'center',
                                                                                        gap: '0.5rem'
                                                                                    }}
                                                                                >
                                                                                    <Form.Control
                                                                                        as="select"
                                                                                        name="hour"
                                                                                        value={
                                                                                            endTime.hour
                                                                                        }
                                                                                        onChange={handleTimeChange(
                                                                                            setEndTime,
                                                                                            'endTime'
                                                                                        )}
                                                                                        required
                                                                                    >
                                                                                        <option value="12 AM">
                                                                                            0 AM
                                                                                        </option>

                                                                                        {[
                                                                                            ...Array(
                                                                                                11
                                                                                            )
                                                                                        ].map(
                                                                                            (
                                                                                                _,
                                                                                                i
                                                                                            ) => {
                                                                                                const hourValue =
                                                                                                    String(
                                                                                                        i +
                                                                                                        1
                                                                                                    ).padStart(
                                                                                                        2,
                                                                                                        '0'
                                                                                                    ) +
                                                                                                    ' AM'
                                                                                                return (
                                                                                                    <option
                                                                                                        key={
                                                                                                            hourValue
                                                                                                        }
                                                                                                        value={
                                                                                                            hourValue
                                                                                                        }
                                                                                                    >
                                                                                                        {i +
                                                                                                            1}{' '}
                                                                                                        AM
                                                                                                    </option>
                                                                                                )
                                                                                            }
                                                                                        )}

                                                                                        <option value="12 PM">
                                                                                            12 PM
                                                                                        </option>

                                                                                        {[
                                                                                            ...Array(
                                                                                                11
                                                                                            )
                                                                                        ].map(
                                                                                            (
                                                                                                _,
                                                                                                i
                                                                                            ) => {
                                                                                                const hourValue =
                                                                                                    String(
                                                                                                        i +
                                                                                                        1
                                                                                                    ).padStart(
                                                                                                        2,
                                                                                                        '0'
                                                                                                    ) +
                                                                                                    ' PM'
                                                                                                return (
                                                                                                    <option
                                                                                                        key={
                                                                                                            hourValue
                                                                                                        }
                                                                                                        value={
                                                                                                            hourValue
                                                                                                        }
                                                                                                    >
                                                                                                        {i +
                                                                                                            1}{' '}
                                                                                                        PM
                                                                                                    </option>
                                                                                                )
                                                                                            }
                                                                                        )}
                                                                                    </Form.Control>

                                                                                    <Form.Control
                                                                                        as="select"
                                                                                        name="minute"
                                                                                        value={
                                                                                            endTime.minute
                                                                                        }
                                                                                        onChange={handleTimeChange(
                                                                                            setEndTime,
                                                                                            'endTime'
                                                                                        )}
                                                                                        onBlur={() =>
                                                                                            !duration
                                                                                                ? setFormErrors(
                                                                                                    {
                                                                                                        ...formErrors,

                                                                                                        toTime: 'Required'
                                                                                                    }
                                                                                                )
                                                                                                : setFormErrors(
                                                                                                    {
                                                                                                        ...formErrors,

                                                                                                        toTime: ''
                                                                                                    }
                                                                                                )
                                                                                        }
                                                                                        required
                                                                                    >
                                                                                        {[
                                                                                            0, 15,
                                                                                            30, 45
                                                                                        ].map(
                                                                                            (
                                                                                                min
                                                                                            ) => (
                                                                                                <option
                                                                                                    key={
                                                                                                        min
                                                                                                    }
                                                                                                    value={String(
                                                                                                        min
                                                                                                    ).padStart(
                                                                                                        2,
                                                                                                        '0'
                                                                                                    )}
                                                                                                >
                                                                                                    {String(
                                                                                                        min
                                                                                                    ).padStart(
                                                                                                        2,
                                                                                                        '0'
                                                                                                    )}
                                                                                                </option>
                                                                                            )
                                                                                        )}
                                                                                    </Form.Control>
                                                                                </div>

                                                                                <p
                                                                                    style={{
                                                                                        color: 'red'
                                                                                    }}
                                                                                >
                                                                                    {
                                                                                        formErrors.toTime
                                                                                    }
                                                                                </p>
                                                                            </Col>
                                                                        </Form.Group>

                                                                        <Form.Group
                                                                            as={Row}
                                                                            className="mb-0"
                                                                            style={{ flex: 1 }}
                                                                        >
                                                                            <Form.Label
                                                                                column
                                                                                sm={5}
                                                                            >
                                                                                Duration
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
                                                                    </div>
                                                                </Col>
                                                            </Form.Group>
                                                        </div>
                                                    </form>
                                                </div>
                                            </Tab>

                                            <Tab
                                                eventKey={1}
                                                onClick={() => updateStep(1)}
                                                id="settings"
                                                title="Settings"
                                            >
                                                <LocationSettings
                                                    formErrors={formErrors}
                                                    setFormErrors={setFormErrors}
                                                    setSettings={setSettings}
                                                    settings={settings ? settings : []}
                                                    setShifts={setShifts}
                                                    shifts={shifts ? shifts : []}
                                                />
                                            </Tab>
                                        </Tabs>

                                        <div
                                            style={{
                                                display: 'flex',

                                                'margin-left': '37%',

                                                'padding-bottom': '2%'
                                            }}
                                        >
                                            {locationsData.id == null ? (
                                                <Button
                                                    className="Button"
                                                    variant="addbtn"
                                                    type="button"
                                                    onClick={onSaveHandler}
                                                >
                                                    Save
                                                </Button>
                                            ) : (
                                                <Button
                                                    className="Button"
                                                    variant="addbtn"
                                                    type="button"
                                                    onClick={onUpdateHandler}
                                                >
                                                    Update
                                                </Button>
                                            )}

                                            <Button
                                                className="Button"
                                                variant="secondary"
                                                type="button"
                                                onClick={onCancelHandler}
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
            ) : (
                <section className="section">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-md-12">
                                <div className=" card-primary">
                                    <div style={{ marginTop: '25%' }}>
                                        <center>
                                            <h3>{'You are not Authorized to access this Page'}</h3>
                                        </center>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <Modal
                show={fileshow}
                size="lg"
                onHide={onCloseHandler}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Preview</Modal.Title>
                </Modal.Header>

                <Modal.Body className="modalBody">
                    {hrHandBook ? (
                        <iframe src={URL.createObjectURL(hrHandBook)} width="100%" height="700px">
                            {' '}
                        </iframe>
                    ) : (
                        <iframe
                            src={`data:application/pdf;base64,${location.handBook}`}
                            width="100%"
                            height="700px"
                        ></iframe>
                    )}
                </Modal.Body>
            </Modal>
        </>
    )
}

export default Location
