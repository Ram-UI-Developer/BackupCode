import React, { useState, useEffect } from 'react'
import Select from 'react-select'
import { Button, Form, Modal, Tooltip } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import {
    getById,
    getAllProjectsByEmpId,
    UpdateWithFile,
    getAllByOrgIdAndEmpId
} from '../../Common/Services/CommonService'
import { toast } from 'react-toastify'
import PageHeader from '../../Common/CommonComponents/PageHeader'
import {
    getDayCapturedHours,
    getHolidayCalendarByLocationId
} from '../../Common/Services/OtherServices'
import DateFormate from '../../Common/CommonComponents/DateFormate'
import moment from 'moment'
import {
    DeleteIcon,
} from '../../Common/CommonIcons/CommonIcons'
import FileViewer from '../../Common/CommonComponents/FileViewer'
import { CiImport } from 'react-icons/ci'
import TimeSheetTable from '../../Common/Table/TimeSheetTable'
import { cancelButtonName } from '../../Common/Utilities/Constants'
import DetailLoader from '../../Common/CommonComponents/Loaders/DetailLoader'

const TimeSheet = () => {
    // Login user details
    const userDetails = useSelector((state) => state.user.userDetails)
    const location = useLocation().state
    console.log(location, "Location state in TimeSheet")
    const [addRow, setAddRow] = useState([])
    const [loading, setLoading] = useState(true)
    const [submit, setSubmit] = useState(false)
    const [project, setProject] = useState([])
    const [show, setShow] = useState(false)
    const [select, setSelect] = useState()
    const [proName, setProName] = useState([])
    // const [selectedId, setSelectedId] = useState()

    const projectOptions = project
        ? project.map((option) => ({
            value: option.projectId,
            label: option.projectName,
            projectManagerName: option.projectManagerName
        }))
        : []

    const handleProjectSelct = (select, index) => {
        addRow[index].projectId = select.value
        addRow[index].projectManagerName = select.projectManagerName
        setProName([...proName, select.projectManagerName])
        setSelect(select.value)
        console.log(select.projectManagerName)
    }

    const getAllProjects = () => {
        getAllProjectsByEmpId({
            entity: 'projects',
            organizationId: userDetails.organizationId,
            employeeId: userDetails.employeeId,
            weekendDate: location.row.weekendDate
        }).then((res) => {
            setProject(res ? res.data : [])
        })
    }
    const navigate = useNavigate()
    const onCloseHandler = () => {
        setSubmit(true)
        setShow(false)
        navigate('/timesheetList')
    }
    const onCancelHandler = () => {
        setSubmit(false)
    }

    useEffect(() => {
        getAllProjects()
        getTimeSheetById()
        handlePreviousDays()
        getAllHolidays()
        onGetHandler()
        getAllDayCapturedHours()
    }, [])

    const [indexs, setIndexS] = useState()
    const [capturedHours, setCapturedHours] = useState({})

    const getAllDayCapturedHours = () => {
        getDayCapturedHours({
            entity: 'attendance',
            weekendDate: location.row.weekendDate,
            organizationId: userDetails.organizationId,
            emplId: userDetails.employeeId
        }).then((res) => {
            console.log(res, 'checkingresponse')
            if (res.statusCode == 200) {
                setCapturedHours(res.data && res.data)
            }
        })
    }
    const handleRemove = (index) => {
        setShow(true)
        setIndexS(index)
    }

    const [days, setDays] = useState([])
    const handlePreviousDays = () => {
        let result = []
        for (let i = 0; i < 7; i++) {
            let d = new Date(location.row.weekendDate)
            d.setDate(d.getDate() - i)
            result.push(moment(d).format('YYYY-MM-DD'))
        }
        setDays(result)
    }

    const year = new Date().getFullYear()
    const [holidays, setHolidays] = useState([])
    const getAllHolidays = () => {
        getHolidayCalendarByLocationId({
            entity: 'holidays',
            organizationId: userDetails.organizationId,
            year: year,
            empId: userDetails.employeeId
        }).then((res) => {
            console.log(res.data, 'checkingHOlidays')
            setHolidays(res.data ? res.data.map((e) => e.date) : [])
        })
    }

    const getDayName = (e) => {
        let locale = 'en-US'
        return e.toLocaleDateString(locale, { weekday: 'long' })
    }
    const compareDates = days ? days.filter((e) => holidays.includes(e)) : []
    const dateGet = compareDates ? compareDates.map((e) => getDayName(new Date(e))) : []
    const dayName = dateGet ? dateGet.map((e) => e.toLowerCase()) : []

    const getMonthDayName = (e) => {
        let locale = 'en-US'
        return e.toLocaleDateString(locale, { month: 'short', day: 'numeric' })
    }

    // Arrow function to pad single-digit days with leading zeros
    const padSingleDigitDates = (dates) =>
        dates.map((date) => {
            let [month, day] = date.split(' ')
            day = day.length === 1 ? '0' + day : day
            return `${month} ${day}`
        })

    const dateMonth = days ? days.map((e) => getMonthDayName(new Date(e))) : []

    const paddedDates = padSingleDigitDates(dateMonth)

    console.log(paddedDates, 'checkingPaddingDates')

    const mon = dayName.filter((e) => e == 'monday')
    const tue = dayName.filter((e) => e == 'tuesday')
    const wed = dayName.filter((e) => e == 'wednesday')
    const thur = dayName.filter((e) => e == 'thursday')
    const frid = dayName.filter((e) => e == 'friday')
    const satr = dayName.filter((e) => e == 'saturday')
    const sund = dayName.filter((e) => e == 'sunday')

    const [totalTsHours, setTotalTsHours] = useState('')
    const [selectFiles, setSelectFiles] = useState([])
    // const [file, setFile] = useState([])
    const getTimeSheetById = () => {
        getById({
            entity: 'timesheets',
            organizationId: userDetails.organizationId,
            id: location.row.id
        }).then((res) => {
            console.log(res.data, 'chekingRespnseDAta')
            setSelectFiles(res.data ? res.data.files : [])
            setAddRow(res.data ? res.data.timesheetRows : [])
            setLoading(false)
            setTotalTsHours(res.data ? res.data.totalHours : 0)
            setProName(res.data ? res.data.timesheetRows.map((row) => row.projectManagerName) : [])
        })
    }

    const handleAddClick = () => {
        setAddRow([
            ...addRow,
            {
                sunday: 0,
                monday: 0,
                tuesday: 0,
                wednesday: 0,
                thursday: 0,
                friday: 0,
                saturday: 0,
                weekendDate: location.row.weekendDate,
                status: '',
                task: '',
                projectId: 0,
                remarks: ''
            }
        ])
    }
    const handleFileSelect = (event) => {
        const selectedFiles = event.target.files
        const newFilesArray = Array.from(selectedFiles)

        const validFileTypes = ['image/jpeg', 'image/png', 'image/gif']
        const filteredNewFiles = newFilesArray.filter((file) => validFileTypes.includes(file.type))
        const maxFiles = 5
        const maxTotalSize = 1 * 1024 * 1024

        const invalidFiles = newFilesArray.filter((file) => !validFileTypes.includes(file.type))
        if (invalidFiles.length > 0) {
            const invalidFileNames = invalidFiles.map((file) => file.name).join(', ')
            toast.error(
                `The following files have unsupported formats and will not be added: ${invalidFileNames}`
            )
        }
        // Ensure selectFiles is an array
        const existingFilesSet = new Set(
            (Array.isArray(selectFiles) ? selectFiles : []).map(
                (file) => file.name || file.fileName
            )
        )
        console.log(existingFilesSet, "chekingFileAlreadt")
        const duplicates = filteredNewFiles.filter((file) =>
            existingFilesSet.has(file.name || file.fileName)
        )

        if (duplicates.length > 0) {
            const duplicateNames = duplicates.map((file) => file.name || file.fileName).join(', ')
            toast.error(
                `The following files are duplicates and will not be added: ${duplicateNames}`
            )
        }

        const validNewFiles = filteredNewFiles.filter(
            (file) => !existingFilesSet.has(file.name || file.fileName)
        )
        setSelectFiles((prevFiles) => {
            const existingFiles = Array.isArray(prevFiles) ? prevFiles : []
            const combinedFiles = [...existingFiles, ...validNewFiles]

            if (combinedFiles.length > maxFiles) {
                toast.error(`You can only upload up to ${maxFiles} files.`)
                return existingFiles
            }
            const totalSize = existingFiles.reduce((acc, file) => acc + (file.size || 0), 0) +
                validNewFiles.reduce((acc, file) => acc + (file.size || 0), 0)

            console.log(totalSize, 'checkingTotalSize')
            if (totalSize > maxTotalSize) {
                toast.error('The total file size must not exceed 1 MB.')
                return existingFiles
            }
            return combinedFiles
        })
        // Reset the input so the same file can be selected again
        event.target.value = ''
    }

    const s = addRow.map((e) => e.sunday)
    const su = s.reduce((a, b) => Number(a) + Number(b), 0)

    const m = addRow.map((e) => e.monday)
    const mo = m.reduce((a, b) => Number(a) + Number(b), 0)

    const t = addRow.map((e) => e.tuesday)
    const tu = t.reduce((a, b) => Number(a) + Number(b), 0)

    const w = addRow.map((e) => e.wednesday)
    const we = w.reduce((a, b) => Number(a) + Number(b), 0)

    const th = addRow.map((e) => e.thursday)
    const thu = th.reduce((a, b) => Number(a) + Number(b), 0)

    const f = addRow.map((e) => e.friday)
    const fri = f.reduce((a, b) => Number(a) + Number(b), 0)

    const sa = addRow.map((e) => e.saturday)
    const sat = sa.reduce((a, b) => Number(a) + Number(b), 0)

    const totalWeekHours = mo + tu + we + thu + fri + sat + su
    console.log(totalTsHours, totalWeekHours, 'chekingHoursFromHours')

    const addTimeSheet = (e) => {
        console.log(e, 'checkingSlectFiles')
        addRow.map((l) =>
            l.status == 'Submitted'
                ? l.status
                : (l.status = e && l.status == 'Approved' ? l.status : (l.status = e))
        )

        const timesheetObj = {
            id: location.row.id,
            weekendDate: location.row.weekendDate,
            totalHours: totalWeekHours.toFixed(2),
            status: e,
            modifiedBy: userDetails.employeeId,
            employeeId: userDetails.employeeId,
            organizationId: userDetails.organizationId,
            locationId: userDetails.locationId,
            timesheetRows: addRow,
            files: selectFiles ? selectFiles.filter((e) => e.file != null) : null
        }

        console.log(timesheetObj, 'chekingTimeSheetObject')

        let projectIds =
            timesheetObj.timesheetRows && timesheetObj.timesheetRows.map((e) => e.projectId == 0)
        function projectId(projectIds) {
            return projectIds == true
        }
        if (timesheetObj.timesheetRows.length <= 0) {
            toast.error('Please add atleast one row')
        } else if (projectIds.some(projectId)) {
            toast.error('Project should not be empty')
        } else {
            let TimeSheetData = new FormData()
            // for (let i = 0; i < selectFiles &&selectFiles.length; i++) {
            //     TimeSheetData.append('files', selectFiles[i]);
            // }
            selectFiles &&
                selectFiles.forEach((file) => {
                    TimeSheetData.append('files', file)
                })
            TimeSheetData.append('timesheets', JSON.stringify(timesheetObj))
            UpdateWithFile({
                entity: 'timesheets',
                organizationId: userDetails.organizationId,
                id: timesheetObj.id,
                body: TimeSheetData
            })
                .then(
                    (res) => {
                        console.log(res.data.status, 'chekingStatusFromStatus')
                        if (res.statuscode == 'NOT_FOUND') {
                            toast.error(res.message)
                            if (select == null) {
                                const rows = [...addRow]

                                const ddd = rows.length - 1
                                rows.splice(ddd, 1)

                                setAddRow(rows)
                            }
                        }

                        if (res.data.status == 'Saved') {
                            getTimeSheetById()
                            toast.success('Saved successfully.')
                            navigate('/timesheetList')
                        } else if (res.data.status == 'Submitted') {
                            getTimeSheetById()
                            toast.success('Submitted successfully.')
                            navigate('/timesheetList')
                        } else if (res.data.status == 'Partial' && e == 'Saved') {
                            toast.success('Saved successfully.')
                            navigate('/timesheetList')
                        } else if (res.data.status == 'Partial' && e == 'Submitted') {
                            toast.success('Submitted successfully.')
                            navigate('/timesheetList')
                        } else {
                            toast.error(res.errorMessage)
                        }
                    },
                    (error) => {
                        console.log(error)
                    }
                )
                .catch((err) => {
                    console.log(err)
                })
        }
    }

    const [view, setView] = useState(false)
    const [totalValidation, setTotalValidation] = useState(false)

    const handleCloseHandler = (action) => {
        if (action == 'moreHours') {
            setView(false)
        } else if (action == 'totalValidation') {
            setTotalValidation(false)
        }
    }

    const handleKeyPress = (e) => {
        // Allow only numbers (key codes 48-57 for digits)
        const isNumberKey = e.which >= 48 && e.which <= 57

        // Allow backspace (key code 8) and delete (key code 46)
        const isBackspaceOrDelete = e.which === 8 || e.which === 46

        // If the pressed key is not a number, prevent input
        if (!(isNumberKey || isBackspaceOrDelete)) {
            e.preventDefault()
        }
    }
    const [value, setValue] = useState('')

    const [monday, setMonday] = useState()
    const [tuesday, setTuesday] = useState()
    const [wednesday, setWednesday] = useState()
    const [thursday, setThursday] = useState()
    const [friday, setFriday] = useState()
    const [saturday, setSaturday] = useState()
    const [sunday, setSunday] = useState()
    console.log(monday, tuesday, wednesday, thursday, friday, saturday, sunday)

    const proceedDeleteHandler = (e) => {
        e.preventDefault()
        const rows = [...addRow]
        rows.splice(indexs, 1)
        setAddRow(rows)
        setShow(false)
    }

    const closeHandler = () => {
        setShow(false)
    }

    const dayHours = Object.values(capturedHours).reduce((total, hours) => total + hours, 0)
    console.log(capturedHours, 'checkingDayHoursFromDays')
    const handleInputChange = (value, index, hours) => {
        const newData = [...addRow]
        newData[index][hours] = value
        if (value == '') {
            newData[index][hours] = value
        } else if (value > 24) {
            setView(true)
            setValue(value)
            newData[index][hours] = value > 24 ? 0 : value
        } else {
            const monday = newData.map((r) => r.monday)
            const mondayHours = monday.reduce((a, b) => Number(a) + Number(b), 0)
            setMonday(mondayHours)
            if (mondayHours > 24) {
                setTotalValidation(true)
                setMonday((newData[index][hours] = mondayHours > 24 ? (value = 0) : value))
            }
            const tuesday = newData.map((r) => r.tuesday)
            const tuesdayHours = tuesday.reduce((a, b) => Number(a) + Number(b), 0)
            setTuesday(tuesdayHours)
            if (tuesdayHours > 24) {
                setTotalValidation(true)
                setTuesday((newData[index][hours] = tuesdayHours > 24 ? (value = 0) : value))
            }
            const wednesday = newData.map((r) => r.wednesday)
            const wednesdayHours = wednesday.reduce((a, b) => Number(a) + Number(b), 0)
            setWednesday(wednesdayHours)
            if (wednesdayHours > 24) {
                setTotalValidation(true)
                setWednesday((newData[index][hours] = wednesdayHours > 24 ? (value = 0) : value))
            }
            const thursday = newData.map((r) => r.thursday)
            const thursdayHours = thursday.reduce((a, b) => Number(a) + Number(b), 0)
            setThursday(thursdayHours)
            if (thursdayHours > 24) {
                setTotalValidation(true)
                setThursday((newData[index][hours] = thursdayHours > 24 ? (value = 0) : value))
            }
            const friday = newData.map((r) => r.friday)
            const fridayHours = friday.reduce((a, b) => Number(a) + Number(b), 0)
            setFriday(fridayHours)
            if (fridayHours > 24) {
                setTotalValidation(true)
                setFriday((newData[index][hours] = fridayHours > 24 ? (value = 0) : value))
            }
            const saturday = newData.map((r) => r.saturday)
            const saturdayHours = saturday.reduce((a, b) => Number(a) + Number(b), 0)
            setSaturday(saturdayHours)
            if (saturdayHours > 24) {
                setTotalValidation(true)
                setSaturday((newData[index][hours] = saturdayHours > 24 ? (value = 0) : value))
            }
            const sunday = newData.map((r) => r.sunday)
            const sundayHours = sunday.reduce((a, b) => Number(a) + Number(b), 0)
            setSunday(sundayHours)
            if (sundayHours > 24) {
                setTotalValidation(true)
                setSunday((newData[index][hours] = sundayHours > 24 ? (value = 0) : value))
            }
            if (value > 8) {
                setView(true)
                setValue(value)
            }
        }
    }

    const onChangeHandler = (value, index) => {
        addRow[index].task = value
    }

    const getDatesBetween = (startDate, endDate) => {
        const start = new Date(startDate)
        const end = new Date(endDate)
        const dates = []
        let currentDate = start
        while (currentDate <= end) {
            dates.push(moment(currentDate).format('YYYY-MM-DD'))
            currentDate.setDate(currentDate.getDate() + 1) // Move to the next date
        }
        return dates
    }

    const [leaveList, setLeavesList] = useState([])
    const dates = leaveList.map((e) => getDatesBetween(e.fromDate, e.toDate))
    const lastModifiedDates = dates && dates.flatMap((e) => e)
    const compareLeavDates = days && days.filter((e) => lastModifiedDates.includes(e))
    const dateGets = compareLeavDates ? compareLeavDates.map((e) => getDayName(new Date(e))) : []
    const dayNames = dateGets ? dateGets.map((e) => e.toLowerCase()) : []
    const leaveOnMonady = dayNames.filter((e) => e == 'monday')
    const leaveOnTuseDay = dayNames.filter((e) => e == 'tuesday')
    const leaveOnWed = dayNames.filter((e) => e == 'wednesday')
    const leaveOnThur = dayNames.filter((e) => e == 'thursday')
    const leaveOnFri = dayNames.filter((e) => e == 'friday')

    const onGetHandler = () => {
        getAllByOrgIdAndEmpId({
            entity: 'leaves',
            organizationId: userDetails.organizationId,
            empId: userDetails.employeeId
        })
            .then((res) => {
                console.log(res.data, 'checkingResponseData')
                if (res.statusCode == 200) {
                    setLeavesList(
                        res.data.filter((e) => {
                            if (e.status == 'Approved') {
                                return e
                            }
                        })
                    )
                }
            })
            .catch((err) => {
                console.log(err, 'error')
            })
    }

    const [showHandler, setShowHandler] = useState(false)
    const [getData, setGetData] = useState({})
    console.log(getData, 'chekingzRoworiginalDaa')
    const onShowHandler = (row) => {
        setShowHandler(true)
        setGetData(row)
    }

    const onShowCloseHandler = () => {
        setShowHandler(false)
    }

    const sumFunction = (day) => {
        const sun = addRow
        const sunMap = sun && sun.map((e) => e[day])
        const sunSum = sunMap && sunMap.reduce((a, b) => Number(a) + Number(b), 0)
        return sunSum
    }

    const COLUMNS = [
        {
            Header: (
                <div className="clasProject">
                    <tr style={{ background: 'none' }}>
                        <th
                            style={{
                                borderBottom: 'none',
                                borderTop: 'none',
                                paddingBottom: '0px'
                            }}
                        >
                            Project{' '}
                            <span style={{ fontSize: '17px' }} className="error">
                                *
                            </span>
                        </th>
                    </tr>
                </div>
            ),
            disableSortBy: true,
            accessor: 'projectId',
            Cell: ({ row }) => (
                <>
                    <div className="timeSheetDropDown ">
                        <Select
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    border: 'none',
                                    borderBottom: '2px solid',
                                    borderBottomColor: row.original.projectId != 0 ? 'black' : 'red'
                                })
                            }}
                            className=""
                            placeholder=""
                            isDisabled={
                                row.original.status == 'Submitted' ||
                                row.original.status == 'Approved'
                            }
                            options={projectOptions}
                            defaultValue={projectOptions.filter(
                                (e) => e.value == row.original.projectId
                            )}
                            onChange={(e) => handleProjectSelct(e, row.index)}
                        />
                    </div>
                </>
            )
        },

        {
            Header: (
                <div>
                    {dayHours != 0 ? (
                        <>
                            <tr>
                                <th
                                    style={{
                                        borderBottom: 'none',
                                        borderTop: 'none',
                                        paddingBottom: '0px',
                                        position: 'absolute',
                                        left: addRow.length == 0 ? '10' : '6.1rem',
                                        top: '5.2rem',
                                        zIndex: '1'
                                    }}
                                >
                                    Captured Hours
                                </th>
                            </tr>
                            <hr className="timeSheetHeaderLine" style={{ width: '98.2%' }} />
                            <hr className="timeSheetHeaderLineUp" style={{ width: '98.2%' }} />
                            <div class="rectangleForTimeSheet"></div>
                        </>
                    ) : (
                        ''
                    )}

                    <tr style={{ background: 'none' }}>
                        <th
                            style={{
                                borderBottom: 'none',
                                borderTop: 'none',
                                paddingBottom: '0px'
                            }}
                        >
                            Task Name
                        </th>
                    </tr>
                </div>
            ),
            disableSortBy: true,
            accessor: 'task',
            Cell: ({ row }) => (
                <div className="" style={{ marginRight: '5px' }}>
                    <Form.Control
                        disabled={
                            row.original.status == 'Submitted' || row.original.status == 'Approved'
                        }
                        type="text"
                        name="task"
                        // size="sm"
                        maxLength={250}
                        defaultValue={row.original.task}
                        onChange={(e) => onChangeHandler(e.target.value, row.index)}
                    />
                </div>
            )
        },

        {
            Header: (
                <div style={{ width: '6rem' }} className="header text-left">
                    Manager
                </div>
            ),
            accessor: 'projectManagerName',
            disableSortBy: true,
            Cell: ({ row }) => {
                return (
                    <>
                        <Tooltip title={row.original.projectManagerName} open>
                            {row.original.projectManagerName}
                        </Tooltip>
                        <div className="employeeNameLenght">{row.original.projectManagerName}</div>
                    </>
                )
            }
        },

        {
            Header: (
                <div
                    className="text-center"
                    style={{
                        whiteSpace: 'wrap',
                        backgroundColor: sund && 'sunday' == 'sunday' ? 'lightgray' : '',
                        color: sund && 'sunday' == 'sunday' ? '#691ACF' : '',
                        paddingBottom: dayHours != 0 ? '20px' : ''
                    }}
                >
                    <span className="header" style={{ whiteSpace: 'nowrap' }}>
                        {paddedDates && paddedDates[6]}
                        <br />
                    </span>{' '}
                    Sun
                    {dayHours != 0 ? (
                        <>
                            <tr>
                                {/* {dayHours.toString().length == 1 ? "0" + dayHours : dayHours}.0 */}
                                <th
                                    style={{
                                        borderBottom: 'none',
                                        borderTop: 'none',
                                        left: '1rem',
                                        padding: '0px 0px 0px 18px',
                                        position: 'relative',
                                        zIndex: '1'
                                    }}
                                >
                                    {capturedHours && Number(capturedHours.sunday).toFixed(1)}
                                </th>
                            </tr>
                        </>
                    ) : (
                        ''
                    )}
                    <tr style={{ background: 'none' }}>
                        <th
                            style={{
                                borderBottom: 'none',
                                borderTop: 'none',
                                paddingBottom: '0px'
                            }}
                        >
                            {' '}
                        </th>
                    </tr>
                </div>
            ),
            disableSortBy: true,
            accessor: 'sunday',
            Cell: ({ row }) => (
                <div className="box">
                    <Form.Control
                        onKeyPress={handleKeyPress}
                        style={{
                            backgroundColor: sund && 'sunday' == 'sunday' ? 'lightgray' : '',
                            color: sund && 'sunday' == 'sunday' ? '#691ACF' : '',
                            borderColor: 'black'
                        }}
                        className="text-wrap text-right weekControl"
                        // size={sund && 'sunday' == 'sunday' ? '' : 'sm'}
                        type="text"
                        disabled={
                            row.original.status == 'Submitted' || row.original.status == 'Approved'
                        }
                        name="sunday"
                        maxlength="4"
                        defaultValue={row.original.sunday}
                        onChange={(e) => handleInputChange(e.target.value, row.index, 'sunday')}
                    />
                </div>
            ),
            Footer: (
                <>
                    <div className="box">
                        <Form.Control
                            className="text-wrap text-right weekControl footerBox"
                            value={sumFunction('sunday')}
                            size="sm"
                            disabled={true}
                            style={{
                                border: 'none',
                                backgroundColor: sund && 'sunday' == 'sunday' ? 'lightgray' : '',
                                color: sund && 'sunday' == 'sunday' ? '#691ACF' : ''
                            }}
                        />
                    </div>
                </>
            )
        },
        {
            Header: (
                <div
                    className=" text-center"
                    style={{
                        whiteSpace: 'wrap',
                        backgroundColor:
                            leaveOnMonady == 'monday' || mon == 'monday' ? 'lightgray' : '',
                        color: leaveOnMonady == 'monday' || mon == 'monday' ? '#691ACF' : '',
                        paddingBottom: dayHours != 0 ? '20px' : ''
                    }}
                >
                    <span className="header" style={{ whiteSpace: 'nowrap' }}>
                        {paddedDates && paddedDates[5]}
                        <br />
                    </span>{' '}
                    Mon
                    {dayHours != 0 ? (
                        <tr>
                            <th
                                style={{
                                    borderBottom: 'none',
                                    borderTop: 'none',
                                    left: '1rem',
                                    padding: '0px 0px 0px 18px',
                                    position: 'relative',
                                    zIndex: '1'
                                }}
                            >
                                {capturedHours && Number(capturedHours.monday).toFixed(1)}
                            </th>
                        </tr>
                    ) : (
                        ''
                    )}
                    <tr style={{ background: 'none' }}>
                        <th
                            style={{
                                borderBottom: 'none',
                                borderTop: 'none',
                                paddingBottom: '0px'
                            }}
                        >
                            {' '}
                        </th>
                    </tr>
                </div>
            ),
            disableSortBy: true,
            accessor: 'monday',
            Cell: ({ row }) => (
                <div className="box">
                    <Form.Control
                        onKeyPress={handleKeyPress}
                        style={{
                            backgroundColor:
                                leaveOnMonady == 'monday' || mon == 'monday' ? 'lightgray' : '',
                            color: leaveOnMonady == 'monday' || mon == 'monday' ? '#691ACF' : '',
                            borderColor: 'black'
                        }}
                        className="text-wrap text-right weekControl"
                        // size={leaveOnMonady == 'monday' || mon == 'monday' ? '' : 'sm'}
                        name="monday"
                        type="text"
                        disabled={
                            row.original.status == 'Submitted' || row.original.status == 'Approved'
                        }
                        maxlength="4"
                        defaultValue={row.original.monday}
                        onChange={(e) => handleInputChange(e.target.value, row.index, 'monday')}
                    />
                </div>
            ),
            Footer: (
                <>
                    <div className="box">
                        <Form.Control
                            className="text-wrap text-right weekControl footerBox"
                            value={sumFunction('monday')}
                            size="sm"
                            disabled={true}
                            style={{
                                border: 'none',
                                backgroundColor:
                                    leaveOnMonady == 'monday' || mon == 'monday' ? 'lightgray' : '',
                                color: leaveOnMonady == 'monday' || mon == 'monday' ? '#691ACF' : ''
                            }}
                        />
                    </div>
                </>
            )
        },
        {
            Header: (
                <div
                    className=" text-center"
                    style={{
                        whiteSpace: 'wrap',
                        backgroundColor:
                            leaveOnTuseDay == 'tuesday' || tue == 'tuesday' ? 'lightgray' : '',
                        color: leaveOnTuseDay == 'tuesday' || tue == 'tuesday' ? '#691ACF' : '',
                        paddingBottom: dayHours != 0 ? '20px' : ''
                    }}
                >
                    <span className="header" style={{ whiteSpace: 'nowrap' }}>
                        {paddedDates && paddedDates[4]}
                        <br />
                    </span>{' '}
                    Tue
                    {dayHours != 0 ? (
                        <tr>
                            <th
                                style={{
                                    borderBottom: 'none',
                                    borderTop: 'none',
                                    left: '1rem',
                                    padding: '0px 0px 0px 18px',
                                    position: 'relative',
                                    zIndex: '1'
                                }}
                            >
                                {' '}
                                {capturedHours && Number(capturedHours.tuesday).toFixed(1)}
                            </th>
                        </tr>
                    ) : (
                        ''
                    )}
                    <tr style={{ background: 'none' }}>
                        <th
                            style={{
                                borderBottom: 'none',
                                borderTop: 'none',
                                paddingBottom: '0px'
                            }}
                        >
                            {' '}
                        </th>
                    </tr>
                </div>
            ),
            disableSortBy: true,
            accessor: 'tuesday',
            Cell: ({ row }) => (
                <div className="box">
                    <Form.Control
                        onKeyPress={handleKeyPress}
                        style={{
                            backgroundColor:
                                leaveOnTuseDay == 'tuesday' || tue == 'tuesday' ? 'lightgray' : '',
                            color: leaveOnTuseDay == 'tuesday' || tue == 'tuesday' ? '#691ACF' : '',
                            borderColor: 'black'
                        }}
                        className="text-wrap text-right weekControl"
                        // size={leaveOnTuseDay == 'tuesday' || tue == 'tuesday' ? '' : 'sm'}
                        type="text"
                        disabled={
                            row.original.status == 'Submitted' || row.original.status == 'Approved'
                        }
                        name="tuesday"
                        maxlength="4"
                        defaultValue={row.original.tuesday}
                        onChange={(e) => handleInputChange(e.target.value, row.index, 'tuesday')}
                    />
                </div>
            ),
            Footer: (
                <>
                    <div className="box">
                        <Form.Control
                            className="text-wrap text-right weekControl footerBox"
                            value={sumFunction('tuesday')}
                            size="sm"
                            disabled={true}
                            style={{
                                border: 'none',
                                backgroundColor:
                                    leaveOnTuseDay == 'tuesday' || tue == 'tuesday'
                                        ? 'lightgray'
                                        : '',
                                color:
                                    leaveOnTuseDay == 'tuesday' || tue == 'tuesday' ? '#691ACF' : ''
                            }}
                        />
                    </div>
                </>
            )
        },
        {
            Header: (
                <div
                    className="text-center"
                    style={{
                        whiteSpace: 'wrap',
                        backgroundColor:
                            leaveOnWed == 'wednesday' || wed == 'wednesday' ? 'lightgray' : '',
                        color: leaveOnWed == 'wednesday' || wed == 'wednesday' ? '#691ACF' : '',
                        paddingBottom: dayHours != 0 ? '20px' : ''
                    }}
                >
                    <span className="header" style={{ whiteSpace: 'nowrap' }}>
                        {paddedDates && paddedDates[3]}
                        <br />
                    </span>{' '}
                    Wed
                    {dayHours != 0 ? (
                        <tr>
                            <th
                                style={{
                                    borderBottom: 'none',
                                    borderTop: 'none',
                                    left: '1rem',
                                    padding: '0px 0px 0px 18px',
                                    position: 'relative',
                                    zIndex: '1'
                                }}
                            >
                                {' '}
                                {capturedHours && Number(capturedHours.wednesday).toFixed(1)}
                            </th>
                        </tr>
                    ) : (
                        ''
                    )}
                    <tr style={{ background: 'none' }}>
                        <th
                            style={{
                                borderBottom: 'none',
                                borderTop: 'none',
                                paddingBottom: '0px'
                            }}
                        >
                            {' '}
                        </th>
                    </tr>
                </div>
            ),
            disableSortBy: true,
            accessor: 'wednesday',
            Cell: ({ row }) => (
                <div className="box">
                    <Form.Control
                        onKeyPress={handleKeyPress}
                        style={{
                            backgroundColor:
                                leaveOnWed == 'wednesday' || wed == 'wednesday' ? 'lightgray' : '',
                            color: leaveOnWed == 'wednesday' || wed == 'wednesday' ? '#691ACF' : '',
                            borderColor: 'black'
                        }}
                        className="text-wrap text-right weekControl"
                        // size={leaveOnWed == 'wednesday' || wed == 'wednesday' ? '' : 'sm'}
                        type="text"
                        disabled={
                            row.original.status == 'Submitted' || row.original.status == 'Approved'
                        }
                        name="wednesday"
                        maxlength="4"
                        defaultValue={row.original.wednesday}
                        onChange={(e) => handleInputChange(e.target.value, row.index, 'wednesday')}
                    />
                </div>
            ),
            Footer: (
                <div className="box">
                    <Form.Control
                        className="text-wrap text-right weekControl footerBox"
                        value={sumFunction('wednesday')}
                        size="sm"
                        disabled={true}
                        style={{
                            border: 'none',
                            backgroundColor:
                                leaveOnWed == 'wednesday' || wed == 'wednesday' ? 'lightgray' : '',
                            color: leaveOnWed == 'wednesday' || wed == 'wednesday' ? '#691ACF' : ''
                        }}
                    />
                </div>
            )
        },
        {
            Header: (
                <div
                    className="text-center"
                    style={{
                        whiteSpace: 'wrap',
                        backgroundColor:
                            leaveOnThur == 'thursday' || thur == 'thursday' ? 'lightgray' : '',
                        color: leaveOnThur == 'thursday' || thur == 'thursday' ? '#691ACF' : '',
                        paddingBottom: dayHours != 0 ? '20px' : ''
                    }}
                >
                    <span className="header" style={{ whiteSpace: 'nowrap' }}>
                        {paddedDates && paddedDates[2]}
                    </span>
                    <br /> Thu
                    {dayHours != 0 ? (
                        <tr>
                            <th
                                style={{
                                    borderBottom: 'none',
                                    borderTop: 'none',
                                    left: '1rem',
                                    padding: '0px 0px 0px 18px',
                                    position: 'relative',
                                    zIndex: '1'
                                }}
                            >
                                {' '}
                                {capturedHours && Number(capturedHours.thursday).toFixed(1)}
                            </th>
                        </tr>
                    ) : (
                        ''
                    )}
                    <tr style={{ background: 'none' }}>
                        <th
                            style={{
                                borderBottom: 'none',
                                borderTop: 'none',
                                paddingBottom: '0px'
                            }}
                        >
                            {' '}
                        </th>
                    </tr>
                </div>
            ),
            disableSortBy: true,
            accessor: 'thursday',
            Cell: ({ row }) => (
                <div className="box">
                    <Form.Control
                        onKeyPress={handleKeyPress}
                        style={{
                            backgroundColor:
                                leaveOnThur == 'thursday' || thur == 'thursday' ? 'lightgray' : '',
                            color: leaveOnThur == 'thursday' || thur == 'thursday' ? '#691ACF' : '',
                            borderColor: 'black'
                        }}
                        className="text-wrap text-right weekControl"
                        // size={leaveOnThur == 'thursday' || thur == 'thursday' ? '' : 'sm'}
                        type="text"
                        disabled={
                            row.original.status == 'Submitted' || row.original.status == 'Approved'
                        }
                        name="thursday"
                        maxlength="4"
                        defaultValue={row.original.thursday}
                        onChange={(e) => handleInputChange(e.target.value, row.index, 'thursday')}
                    />
                </div>
            ),
            Footer: (
                <div className="box">
                    <Form.Control
                        className="text-wrap text-right weekControl footerBox"
                        value={sumFunction('thursday')}
                        size="sm"
                        disabled={true}
                        style={{
                            border: 'none',
                            backgroundColor:
                                leaveOnThur == 'thursday' || thur == 'thursday' ? 'lightgray' : '',
                            color: leaveOnThur == 'thursday' || thur == 'thursday' ? '#691ACF' : ''
                        }}
                    />
                </div>
            )
        },
        {
            Header: (
                <div
                    className="text-center"
                    style={{
                        whiteSpace: 'wrap',
                        backgroundColor:
                            leaveOnFri == 'friday' || frid == 'friday' ? 'lightgray' : '',
                        color: leaveOnFri == 'friday' || frid == 'friday' ? '#691ACF' : '',
                        paddingBottom: dayHours != 0 ? '20px' : ''
                    }}
                >
                    <span className="header" style={{ whiteSpace: 'nowrap' }}>
                        {paddedDates && paddedDates[1]}
                    </span>
                    <br /> Fri
                    {dayHours != 0 ? (
                        <tr>
                            <th
                                style={{
                                    borderBottom: 'none',
                                    borderTop: 'none',
                                    left: '1rem',
                                    padding: '0px 0px 0px 18px',
                                    position: 'relative',
                                    zIndex: '1'
                                }}
                            >
                                {' '}
                                {capturedHours && Number(capturedHours.friday).toFixed(1)}
                            </th>
                        </tr>
                    ) : (
                        ''
                    )}
                    <tr style={{ background: 'none' }}>
                        <th
                            style={{
                                borderBottom: 'none',
                                borderTop: 'none',
                                paddingBottom: '0px'
                            }}
                        >
                            {' '}
                        </th>
                    </tr>
                </div>
            ),
            disableSortBy: true,
            accessor: 'friday',
            Cell: ({ row }) => (
                <div className="box">
                    <Form.Control
                        onKeyPress={handleKeyPress}
                        style={{
                            backgroundColor:
                                leaveOnFri == 'friday' || frid == 'friday' ? 'lightgray' : '',
                            color: leaveOnFri == 'friday' || frid == 'friday' ? '#691ACF' : '',
                            borderColor: 'black'
                        }}
                        className="text-wrap text-right weekControl"
                        // size={leaveOnFri == 'friday' || frid == 'friday' ? '' : 'sm'}
                        disabled={
                            row.original.status == 'Submitted' || row.original.status == 'Approved'
                        }
                        type="text"
                        name="friday"
                        maxlength="4"
                        defaultValue={row.original.friday}
                        onChange={(e) => handleInputChange(e.target.value, row.index, 'friday')}
                    />
                </div>
            ),
            Footer: (
                <div className="box">
                    <Form.Control
                        className="text-wrap text-right weekControl footerBox"
                        value={sumFunction('friday')}
                        size="sm"
                        disabled={true}
                        style={{
                            border: 'none',
                            backgroundColor:
                                leaveOnFri == 'friday' || frid == 'friday' ? 'lightgray' : '',
                            color: leaveOnFri == 'friday' || frid == 'friday' ? '#691ACF' : ''
                        }}
                    />
                </div>
            )
        },
        {
            Header: (
                <div
                    className="text-center"
                    style={{
                        whiteSpace: 'wrap',
                        backgroundColor: satr && 'saturday' == 'saturday' ? 'lightgray' : '',
                        color: satr && 'saturday' == 'saturday' ? '#691ACF' : '',
                        paddingBottom: dayHours != 0 ? '20px' : ''
                    }}
                >
                    <span className="header" style={{ whiteSpace: 'nowrap' }}>
                        {paddedDates && paddedDates[0]}
                    </span>
                    <br /> Sat
                    {dayHours != 0 ? (
                        <tr>
                            <th
                                style={{
                                    borderBottom: 'none',
                                    borderTop: 'none',
                                    left: '1rem',
                                    padding: '0px 0px 0px 18px',
                                    position: 'relative',
                                    zIndex: '1'
                                }}
                            >
                                {' '}
                                {capturedHours && Number(capturedHours.saturday).toFixed(1)}
                            </th>
                        </tr>
                    ) : (
                        ''
                    )}
                    <tr style={{ background: 'none' }}>
                        <th
                            style={{
                                borderBottom: 'none',
                                borderTop: 'none',
                                paddingBottom: '0px'
                            }}
                        >
                            {' '}
                        </th>
                    </tr>
                </div>
            ),
            disableSortBy: true,
            accessor: 'saturday',
            Cell: ({ row }) => (
                <div className="box">
                    <Form.Control
                
                        onKeyPress={handleKeyPress}
                        style={{
                            backgroundColor: satr && 'saturday' == 'saturday' ? 'lightgray' : '',
                            color: satr && 'saturday' == 'saturday' ? '#691ACF' : '',
                            borderColor: 'black'
                        }}
                        className="text-wrap text-right weekControl"
                        // size={satr && 'saturday' == 'saturday' ? 'sm' : 'sm'}
                        disabled={
                            row.original.status == 'Submitted' || row.original.status == 'Approved'
                        }
                        type="text"
                        name="saturday"
                        maxlength="4"
                        defaultValue={row.original.saturday}
                        onChange={(e) => handleInputChange(e.target.value, row.index, 'saturday')}
                    />
                </div>
            ),
            Footer: (
                <div className="box">
                    <Form.Control
                        className="text-wrap text-right weekControl footerBox"
                        value={sumFunction('saturday')}
                        size="sm"
                        disabled={true}
                        style={{
                            border: 'none',
                            backgroundColor: satr && 'saturday' == 'saturday' ? 'lightgray' : '',
                            color: satr && 'saturday' == 'saturday' ? '#691ACF' : ''
                        }}
                    />
                </div>
            )
        },

        {
            Header: (
                <div style={{ width: '77px' }}>
                    {dayHours != 0 ? (
                        <>
                            <tr>
                                <th
                                    style={{
                                        borderBottom: 'none',
                                        borderTop: 'none',
                                        paddingBottom: '0px',
                                        position: 'absolute',
                                        right: '5rem',
                                        top: '5.2rem',
                                        zIndex: '1'
                                    }}
                                >
                                    {dayHours.toFixed(2)}
                                </th>
                            </tr>
                        </>
                    ) : (
                        ''
                    )}

                    <tr style={{ background: 'none' }}>
                        <th
                            style={{
                                borderBottom: 'none',
                                borderTop: 'none',
                                paddingBottom: '0px'
                            }}
                        >
                            Status
                        </th>
                    </tr>
                </div>
            ),
            accessor: 'status',
            Cell: ({ row }) => {
                if (row.original.status == 'Rejected') {
                    return (
                        <span className="text-danger">
                            Rejected{' '}
                            <span
                                style={{ cursor: 'pointer' }}
                                onClick={() => onShowHandler(row.original)}
                            >
                                <i className="fa-solid fa-message"></i>
                            </span>
                        </span>
                    )
                } else if (row.original.status == 'Approved') {
                    return (
                        <span className="text-success">
                            Approved{' '}
                            <span
                                style={{ cursor: 'pointer' }}
                                onClick={() => onShowHandler(row.original)}
                            >
                                <i className="fa-solid fa-message"></i>
                            </span>
                        </span>
                    )
                } else if (row.original.status == 'Submitted') {
                    return <span className="">Submitted</span>
                } else if (row.original.status == 'Saved') {
                    return <div className="text-center">Saved</div>
                }
            }
        },
        {
            Header: 'Total',
            accessor: 'totalHours',
            disableSortBy: true,
            Cell: ({ row }) => {
                const total =
                    Number(row.original.monday) +
                    Number(row.original.tuesday) +
                    Number(row.original.wednesday) +
                    Number(row.original.thursday) +
                    Number(row.original.friday) +
                    Number(row.original.saturday) +
                    Number(row.original.sunday)
                return (
                    <div className="text-center">
                        <b>{total.toFixed(2)}</b>
                    </div>
                )
            },
            Footer: (
                <div className="text-center">
                    <b>{totalWeekHours ? totalWeekHours.toFixed(2) : totalTsHours}</b>
                </div>
            )
        },

        {
            Header: () => <div className="header text-center">Actions</div>,
            accessor: 'actions',
            disableSortBy: true,
            width: '40%',
            Cell: ({ row }) => (
                <>
                    <div className="text-center ">
                        <Button
                            type="button"
                            disabled={
                                row.original.status == 'Submitted' ||
                                row.original.status == 'Approved'
                            }
                            variant=""
                            className="iconWidth"
                            onClick={() => handleRemove(row.index)}
                        >
                            <DeleteIcon />
                        </Button>
                    </div>
                </>
            )
        }
    ]
    const check = addRow.map((e) => e.projectId)

    const handleSubmit = () => {
        let withoutProject = addRow.filter((e) => e.projectId == 0)
        if (withoutProject.length > 0) {
            toast.error('Project should not be empty')
        } else {
            setSubmit(true)
        }
    }
    const [fileOpen, setFileOpen] = useState(false)
    const [files, setFiles] = useState(null)
    const [getFile, setGetFile] = useState(null)
    const handleInitialFileShow = (element) => {
        setFileOpen(true)
        setFiles(element)
        setGetFile(element)
    }
    const handleInitialFileCloseHandler = () => {
        setFileOpen(false)
    }

    const [fileDeleteShow, setFileDeleteShow] = useState(false)
    const [index, setIndex] = useState()
    const handleDleteShowHandler = (ind) => {
        setFileDeleteShow(true)
        setIndex(ind)
    }
    const handleDleteCloseHandler = () => {
        setFileDeleteShow(false)
    }

    const handleSelectFilesDelete = () => {
        const updateSelectFiles = [...selectFiles]
        updateSelectFiles.splice(index, 1)
        setSelectFiles(updateSelectFiles)
        handleDleteCloseHandler()
    }

    const statuses = addRow.map(item => item.status)
    const isValid = statuses.every(
        status => status !== 'Rejected'
    ) && statuses.some(
        status => status === 'Submitted' || status === 'Approved'
    );
    console.log(isValid, "isValid")

    return (
        <>
            <section className="section">
                {loading ? <DetailLoader /> : ''}
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="">
                                <PageHeader pageTitle="Timesheet" />
                                <div className="card-body">
                                    <div className=" col-sm-5 rightSideHeading">
                                        Weekend Date -{' '}
                                        <span style={{ fontWeight: '500' }}>
                                            {<DateFormate date={location.row.weekendDate} />}
                                        </span>
                                    </div>
                                    <TimeSheetTable
                                        columns={COLUMNS}
                                        data={addRow}
                                        tableClasses={true}
                                        timeSheetClassName={'timeSheetRow'}
                                        footer={addRow.length != 0 ? true : false}
                                        pageSize="10"
                                    />
                                </div>

                                <div>
                                    {location.row.status == 'Submitted' ||
                                        location.row.status == 'Approved' ? (
                                        ''
                                    ) : (
                                        <>
                                            {selectFiles && selectFiles.length != 0 ? (
                                                <>
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'row',
                                                            flexWrap: 'wrap'
                                                        }}
                                                    >
                                                        {selectFiles &&
                                                            selectFiles.map((e, index) => (
                                                                <span key={index}>
                                                                    {e.name ? (
                                                                        <a
                                                                            onClick={() =>
                                                                                handleInitialFileShow(
                                                                                    e,
                                                                                    'Get'
                                                                                )
                                                                            }
                                                                        >
                                                                            <u>{e.name}</u>
                                                                        </a>
                                                                    ) : (
                                                                        <a
                                                                            onClick={() =>
                                                                                handleInitialFileShow(
                                                                                    e,
                                                                                    'Get'
                                                                                )
                                                                            }
                                                                        >
                                                                            <u>{e.fileName}</u>
                                                                        </a>
                                                                    )}
                                                                    <a
                                                                        className="error"
                                                                        onClick={() =>
                                                                           !isValid && handleDleteShowHandler(
                                                                                index
                                                                            )
                                                                        }
                                                                    >
                                                                        {' '}
                                                                        X &ensp;
                                                                    </a>
                                                                    <br />
                                                                </span>
                                                            ))}
                                                    </div>
                                                    <span type="button">
                                                        {
                                                            selectFiles && selectFiles.length == 5 ? "" :

                                                                <label
                                                                    style={{
                                                                        fontWeight: '600',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                    className=""
                                                                >
                                                                    (<u>Upload More</u>)
                                                                    <input
                                                                        type="file"
                                                                        multiple
                                                                        style={{ display: 'none' }}
                                                                        onChange={(e) =>
                                                                           !isValid && handleFileSelect(e)
                                                                        }
                                                                    />
                                                                </label>
                                                        }
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <label
                                                        type="button"
                                                        className="timeSheetImport"
                                                    >
                                                        <CiImport
                                                            className="themeColor"
                                                            size={20}
                                                        />{' '}
                                                        Attach Files
                                                        <input
                                                            type="file"
                                                            multiple
                                                            style={{ display: 'none' }}
                                                            onChange={(e) => !isValid && handleFileSelect(e)}
                                                        />
                                                    </label>
                                                </>
                                            )}
                                            &ensp;
                                            <label>{selectFiles && selectFiles.length == 5 ? "" : "Only JPEG, PNG and JPG accepted"} </label>
                                        </>
                                    )}
                                    {location.row.status == 'Approved' ||
                                        location.row.status == 'Submitted' ? (
                                        ''
                                    ) : (
                                        <Button
                                            className="addMoreBtn"
                                            variant=""
                                            disabled={
                                                location.row.status == 'Approved' ||
                                                location.row.status == 'Submitted' || isValid
                                            }
                                            onClick={handleAddClick}
                                        >
                                            {' '}
                                            Add More+
                                        </Button>
                                    )}
                                </div>

                                <div className="btnCenter mb-3">
                                    <Button
                                        variant="addbtn"
                                        type="button"
                                        className="Button"
                                        disabled={
                                            check.length && addRow.length == 0
                                                ? true
                                                : false ||
                                                location.row.status == 'Submitted' ||
                                                location.row.status == 'Approved' || isValid
                                        }
                                        onClick={() => addTimeSheet('Saved')}
                                    >
                                        Save
                                    </Button>
                                    <Button
                                        variant="addbtn"
                                        className="Button"
                                        type="button"
                                        disabled={
                                            check.length && addRow.length == 0
                                                ? true
                                                : false ||
                                                location.row.status == 'Submitted' ||
                                                location.row.status == 'Approved' || isValid
                                        }
                                        onClick={() => handleSubmit()}
                                    >
                                        Submit
                                    </Button>
                                    <Button
                                        className="Button"
                                        variant="secondary"
                                        type="button"
                                        onClick={onCloseHandler}
                                    >
                                        Close
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Modal show={view} onHide={() => handleCloseHandler('moreHours')}>
                <Modal.Header>
                    <Modal.Title>Warning</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    {value > 24
                        ? 'Entered hours are invalid.hours should not exceed 24 hours'
                        : 'Yes I have worked for more than 8 hours'}
                </Modal.Body>
                <div className="btnCenter mb-3">
                    <Button
                        variant="addbtn"
                        className="Button"
                        onClick={() => handleCloseHandler('moreHours')}
                    >
                        {value > 24 ? 'Okay' : 'Yes'}
                    </Button>
                </div>
            </Modal>
            <Modal show={submit} onHide={onCloseHandler} backdrop="static" keyboard={false}>
                <Modal.Header className="" closeButton>
                    <Modal.Title>Submit ?</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    {dayHours != 0 ? (
                        <>
                            {totalWeekHours > dayHours ? (
                                <>
                                    <div>
                                        Your submitted hours are different from captured hours.
                                    </div>{' '}
                                    <div>
                                        Please click on "Proceed" if you still want to submit the
                                        timesheet{' '}
                                    </div>{' '}
                                    <div>OR</div>
                                    <div>click on "Close" to stay on this page.</div>
                                </>
                            ) : (
                                'Are you sure that you want to submit Timesheet ?'
                            )}
                        </>
                    ) : (
                        'Are you sure that you want to submit Timesheet ?'
                    )}
                </Modal.Body>
                <div className="btnCenter mb-3">
                    <Button
                        className="Button"
                        variant="addbtn"
                        onClick={() => addTimeSheet('Submitted')}
                    >
                        Proceed
                    </Button>
                    <Button className="Button" variant="secondary" onClick={onCancelHandler}>
                        {cancelButtonName}
                    </Button>
                </div>
            </Modal>
            <Modal show={totalValidation} onHide={() => handleCloseHandler('totalValidation')}>
                <Modal.Header>
                    <Modal.Title>Warning</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBody">You entered more than 24 hours</Modal.Body>
                <div className="btnCenter mb-3">
                    <Button
                        variant="addbtn"
                        className="Button"
                        onClick={() => handleCloseHandler('totalValidation')}
                    >
                        Okay
                    </Button>
                </div>
            </Modal>
            <Modal show={show} onHide={closeHandler} backdrop="static" keyboard={false}>
                <Modal.Header className="" closeButton>
                    <Modal.Title>Delete ?</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    Are you sure that you want to delete this timesheet row request?
                </Modal.Body>
                <div className="btnCenter mb-3">
                    <Button className="Button" variant="addbtn" onClick={proceedDeleteHandler}>
                        Yes
                    </Button>
                    <Button className="Button" variant="secondary" onClick={closeHandler}>
                        No
                    </Button>
                </div>
            </Modal>

            <Modal
                show={fileOpen}
                onHide={handleInitialFileCloseHandler}
                backdrop="static"
                keyboard={false}
                size="lg"
            >
                <Modal.Header className="" closeButton>
                    <Modal.Title>{files && files ? files.name || files.fileName : ''}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    <>
                        {files && files.fileName ? (
                            <FileViewer documents={[getFile]} booleanValue={true} />
                        ) : (
                            <img
                                src={files && URL.createObjectURL(files)}
                                style={{ width: '70%', height: '300px' }}
                            />
                        )}
                    </>
                </Modal.Body>
            </Modal>
            <Modal
                show={fileDeleteShow}
                onHide={handleDleteCloseHandler}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header className="" closeButton>
                    <Modal.Title>Delete File ?</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    Are you sure that you want to delete this file request?
                </Modal.Body>
                <div className="btnCenter mb-3">
                    <Button className="Button" variant="addbtn" onClick={handleSelectFilesDelete}>
                        Yes
                    </Button>
                    <Button
                        className="Button"
                        variant="secondary"
                        onClick={handleDleteCloseHandler}
                    >
                        No
                    </Button>
                </div>
            </Modal>
            <Modal show={showHandler} size="lg" onHide={() => onShowCloseHandler()}>
                <Modal.Header closeButton={() => onShowCloseHandler()}>
                    <Modal.Title>Remarks</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '2rem',
                            alignItems: 'flex-start'
                        }}
                    >
                        <div>
                            <strong>Project Name:</strong> {getData.projectName}
                        </div>

                        {getData.remarks && getData.remarks !== 'undefined' && (
                            <div style={{ maxWidth: '400px', display: 'flex' }}>
                                <strong>Remarks:</strong>&nbsp;
                                {getData.remarks.length > 50 ? (
                                    <span style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                                        {getData.remarks}
                                    </span>
                                ) : (
                                    <span>{getData.remarks}</span>
                                )}
                            </div>
                        )}

                        <div>
                            <strong>Status:</strong>{' '}
                            {getData.status === 'Rejected' ? (
                                <span className="text-danger">Rejected</span>
                            ) : (
                                <span className="text-success">Approved</span>
                            )}
                        </div>
                    </div>
                </Modal.Body>

                {/* <div style={{ marginLeft: "40%", marginBottom: "3%" }}>
                    <Button variant='addbtn' className='Button' onClick={() => onShowCloseHandler()} >Close</Button>
                </div> */}
            </Modal>
        </>
    )
}

export default TimeSheet
