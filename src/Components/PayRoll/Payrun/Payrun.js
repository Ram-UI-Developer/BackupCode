import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import React, { useEffect, useState } from 'react'
import { Button, Modal, Tooltip } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import { ToastError } from '../../../Common/CommonComponents/ToastCustomized'
import { Printer, XlSheet } from '../../../Common/CommonIcons/CommonIcons'
import { getPayrun, save, updatePayRunObj } from '../../../Common/Services/CommonService'
import PayRunDetailTable from '../../../Common/Table/PayRunDetailTable'
import { cancelButtonName } from '../../../Common/Utilities/Constants'
import LeavesModal from './LeavesModal'
import LoanModal from './LoanModal'
import LopDaysModal from './LopDaysModal'
import LopModal from './LopModal'
import ThismonthDetails from './ThismonthDetails'
import TimeSheetModal from './TimeSheetModal'
import YTDDetails from './YTDDetails'

const Payrun = () => {
    const userDetails = useSelector((state) => state.user.userDetails) // Get userdetails from redux
    const locationData = useLocation().state // Data from navigation state
    const [loading, setLoading] = useState(true) // State for  handling loader
    const [formErrors, setFormErrors] = useState({}) // State handling form errors
    const [show, setShow] = useState(false) // State for modal window
    const [modelHeading, setModelHeading] = useState('') // State for modal heading
    const [payrun, setPayRun] = useState({}) // State for payrun
    const [data, setData] = useState([]) // State for employees payroll
    const onCloseHandler = () => {
        setShow(false) // Close modal
    }
    const [row, setRow] = useState({}) // State for individual row
    const [rowIndex, setRowIndex] = useState('') // State for row index
    // Show Modal
    const onShowHandler = (headding, row, index) => {
        setShow(true)
        setRow(row)
        setModelHeading(headding)
        setRowIndex(index)
    }

    // Indian number format
    const formatNumber = (number) => {
        if (number == null) return ''
        return new Intl.NumberFormat('en-IN').format(number)
    }

    // Fetch payrun to component on mount
    useEffect(() => {
        onGetDataHandler()
    }, [])

    const onGetDataHandler = () => {
        getPayrun({
            entity: 'payrun',
            organizationId: userDetails.organizationId,
            location: locationData.row.locationId,
            year: locationData.row.year,
            month: locationData.row.month
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setPayRun(res.data)
                    setData(res.data ? res.data.employeePay : [])
                }
                setLoading(false)
            })
            .catch(() => {
                setLoading(false)
            })
    }

    // Update payrun row
    const onUpdatePayrun = (row, index) => {
        row.status = { value: 1, label: 'Saved' }
        updatePayRunObj({
            entity: 'monthlypayrun',
            organizationId: userDetails.organizationId,
            id: row.id,
            body: row
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    let newData = [...data]
                    newData[index] = res.data
                    setData(newData)
                    onCloseHandler()
                }
            })
            .catch((err) => {
                ToastError(err.message)
            })
    }

    // input change handler
    const onChangeHandler = (e, index) => {
        const { name, value } = e.target
        if (name === 'loanAmount' && parseFloat(value) > parseFloat(data[index]['loanBalance'])) {
            alert('The loan amount value cannot be greater than the loan balance.')
            return
        }
        if (
            name === 'lopDays' &&
            parseFloat(value) > parseFloat(Math.abs(data[index]['leaveBalance']))
        ) {
            alert('The LOP days value cannot be greater than the leave balance.')
            return
        }
        data[index][name] = Number(value)
    }

    // change tax value
    const onBlurHandlerForTax = (index) => {
        let newData = [...data]
        let deductions = newData[index]['salaryComponents'].filter(
            (component) => component.type && component.type.label === 'Deduction'
        )
        let deductionsWithoutTax = deductions.filter((item) => item.headName != 'Income Tax (TDS)')
        const totaldeductions = deductionsWithoutTax
            .map((payRun) => payRun.amount)
            .reduce((acc, amount) => acc + amount, 0)
        newData[index]['netPay'] = data[index]['thisMonth'] - totaldeductions - data[index]['tax']
        setData(newData)
    }

    // Save payrun with api
    const onSaveHandler = () => {
        let obj = {
            id: payrun.id,
            locationId: payrun.locationId,
            locationName: payrun.locationName,
            month: payrun.month,
            noOfHolidays: payrun.noOfHolidays,
            noOfdays: payrun.noOfdays,
            organizationId: payrun.organizationId,
            employeePay: data,
            status:
                payrun.status.label == 'Initiated'
                    ? {
                          value: 1,
                          label: 'Saved'
                      }
                    : payrun.status,
            workingDays: payrun.workingDays,
            year: payrun.year,
            startDate: payrun.startDate,
            endDate: payrun.endDate,
            initiatedBy: payrun.initiatedBy,
            initiatedDate: payrun.initiatedDate,
            submitted: payrun.submitted,
            submittedDate: payrun.submittedDate,
            approved: payrun.approved,
            approvedDate: payrun.approvedDate,
            completed: payrun.completed,
            completedDate: payrun.completedDate
        }
        setLoading(true)
        save({ entity: 'monthlypayrun', organizationId: userDetails.organizationId, body: obj })
            .then((res) => {
                if (res.statusCode == 200) {
                    setLoading(false)
                    toast.success('Saved successfully...')
                    window.history.back()
                } else {
                    setLoading(false)
                    toast.error(res.errorMessage)
                }
            })
            .catch((err) => {
                setLoading(false)
                ToastError(err.message)
            })
    }

    // update statuses
    const onGenerateHandler = (status) => {
        let obj = {
            id: payrun.id,
            locationId: payrun.locationId,
            locationName: payrun.locationName,
            month: payrun.month,
            noOfHolidays: payrun.noOfHolidays,
            noOfdays: payrun.noOfdays,
            organizationId: payrun.organizationId,
            employeePay: data,
            status: status,
            workingDays: payrun.workingDays,
            year: payrun.year,
            startDate: payrun.startDate,
            endDate: payrun.endDate,
            initiatedBy: payrun.initiatedBy,
            initiatedDate: payrun.initiatedDate,
            submitted: status.label == 'Submitted' ? userDetails.employeeId : payrun.submitted,
            submittedDate: payrun.submittedDate,
            approved: status.label == 'Approved' ? userDetails.employeeId : payrun.approved,
            approvedDate: payrun.approvedDate,
            completed: status.label == 'Completed' ? userDetails.employeeId : payrun.completed,
            completedDate: payrun.completedDate
        }
        if (data.some((item) => item.netPay < 0)) {
            let namesList = data.filter((item) => item.netPay < 0).map((e) => e.employeeName)
            setFormErrors({ ...formErrors, netPay: `${namesList} netpay was less then 0` })
            window.scrollTo(0, 0)
        } else {
            setLoading(true)
            save({ entity: 'monthlysalary', organizationId: userDetails.organizationId, body: obj })
                .then((res) => {
                    if (res.statusCode == 200) {
                        setLoading(false)
                        toast.success(`${status.label} Successfully.`)
                        window.history.back()
                    } else {
                        setLoading(false)
                        toast.error(res.errorMessage)
                    }
                })
                .catch((err) => {
                    setLoading(false)
                    ToastError(err.message)
                })
        }
    }

    // number validations
    const handleKeyPress = (event) => {
        const regex = /^[0-9.]$/
        const key = String.fromCharCode(event.charCode)

        if (!regex.test(key)) {
            event.preventDefault()
        }
    }

    // Columns for table
    const COLUMNS = [
        {
            Header: () => (
                <div className="tableHeading text-wrap" style={{ minWidth: '8rem' }}>
                    Employee
                </div>
            ),
            accessor: 'employeeName',
            Cell: ({ row }) => (
                <>
                    <Tooltip title={row.original.employeeName} open>
                        {row.original.employeeName}
                    </Tooltip>
                    <div
                        className="tableLength"
                        style={{
                            minWidth: '120px',
                            whiteSpace: 'nowrap',
                            fontWeight:
                                row.original.lopDays > 0 ||
                                row.original.reimbursementAmount ||
                                row.original.loanAmount ||
                                row.original.otAmount ||
                                row.original.bonus > 0
                                    ? '600'
                                    : '',
                            background:
                                row.original.lopDays > 0 ||
                                row.original.reimbursementAmount ||
                                row.original.loanAmount ||
                                row.original.otAmount ||
                                row.original.bonus > 0
                                    ? '#FAFD61'
                                    : ''
                        }}
                    >
                        {row.index + 1}. {row.original.employeeName}
                    </div>
                </>
            )
        },
        {
            Header: 'Code',
            accessor: 'employeeCode',
            Cell: ({ row }) => (
                <div
                    style={{
                        paddingLeft: '4px',
                        minWidth: '6rem',
                        background:
                            row.original.lopDays > 0 ||
                            row.original.reimbursementAmount ||
                            row.original.loanAmount ||
                            row.original.otAmount ||
                            row.original.bonus > 0
                                ? '#FAFD61'
                                : '',
                        fontWeight:
                            row.original.lopDays > 0 ||
                            row.original.reimbursementAmount ||
                            row.original.loanAmount ||
                            row.original.otAmount ||
                            row.original.bonus > 0
                                ? '600'
                                : ''
                    }}
                >
                    {row.original.employeeCode}
                </div>
            )
        },
        {
            Header: (
                <div className="text-center">
                    <div className="text-center header">Attendance</div>
                    <tr style={{ background: 'none' }}>
                        <th
                            className="border"
                            style={{ borderBottom: 'none', padding: '0px 3px 0px 3px' }}
                        >
                            {' '}
                            Timesheets{' '}
                        </th>
                        <th
                            className="border"
                            style={{ borderBottom: 'none', padding: '0px 3px 0px 3px' }}
                        >
                            {' '}
                            Leaves{' '}
                        </th>
                        <th
                            className="border"
                            style={{ borderBottom: 'none', padding: '0px 3px 0px 3px' }}
                        >
                            {' '}
                            Leave Bal{' '}
                        </th>
                        <th
                            className="border"
                            style={{ borderBottom: 'none', padding: '0px 3px 0px 3px' }}
                        >
                            {' '}
                            LOP
                        </th>
                    </tr>
                </div>
            ),
            accessor: 'attendance',
            disableSortBy: true,
            Cell: ({ row }) => (
                <div className="text-right d-flex" style={{ flexDirection: 'row-reverse' }}>
                    <tr>
                        <td
                            className="border"
                            style={{
                                verticalAlign: 'middle',
                                padding: '0px 5px',
                                minWidth: '5.3rem',
                                textAlign: 'right'
                            }}
                        >
                            <a
                                className=""
                                onClick={() => onShowHandler('TimeSheet Details', row.original)}
                            >
                                {row.original.approvedHours}/{row.original.submittedHours}
                            </a>
                        </td>
                        <td
                            className="border"
                            style={{
                                verticalAlign: 'middle',
                                padding: '0px 5px',
                                minWidth: '3.5rem',
                                textAlign: 'right'
                            }}
                        >
                            <a
                                className=""
                                onClick={() => onShowHandler('Leave Details', row.original)}
                            >
                                {' '}
                                {row.original.absentDays == 0 ? '' : row.original.absentDays}
                            </a>
                        </td>
                        <td
                            className=""
                            style={{
                                verticalAlign: 'middle',
                                padding: '0px 5px',
                                minWidth: '4.5rem',
                                textAlign: 'right',
                                border: row.original.leaveBalance < 0 && '2px solid red'
                            }}
                        >
                            <a
                                className=""
                                onClick={() => onShowHandler('LOP Details', row.original)}
                            >
                                {row.original.leaveBalance}
                            </a>
                        </td>
                        <td
                            className=""
                            style={{
                                padding: '0px',
                                textAlign: 'right',
                                minWidth: '2.2rem',
                                fontSize: row.original.lopDays <= 0 && '11px',
                                verticalAlign: 'middle',
                                border: row.original.lopDays > 0 && '2px solid red',
                                paddingRight: '2px'
                            }}
                        >
                            <a
                                className=""
                                onClick={() => onShowHandler('LOP Days', row.original, row.index)}
                            >
                                {' '}
                                {row.original.lopDays > 0 ? row.original.lopDays : '+Add'}
                            </a>
                        </td>
                    </tr>
                </div>
            )
        },

        {
            Header: () => <div className="tableHeading text-center">Expenses</div>,
            accessor: 'reimbursementAmount',
            disableSortBy: true,
            Cell: ({ row }) => (
                <div style={{ width: '4.5rem' }}>
                    <input
                        name="reimbursementAmount"
                        className="eliminateControls"
                        defaultValue={row.original.reimbursementAmount}
                        style={{
                            maxWidth: '4.5rem',
                            textAlign: 'right',
                            border:
                                row.original.reimbursementAmount > 0
                                    ? '2px solid #37DC1B'
                                    : '1px solid'
                        }}
                        type="number"
                        onChange={(e) => onChangeHandler(e, row.index)}
                        onBlur={() =>
                            payrun.status.label != 'Completed' &&
                            onUpdatePayrun(row.original, row.index)
                        }
                        onKeyPress={handleKeyPress}
                        readOnly={payrun.status.label == 'Completed'}
                    />
                </div>
            )
        },
        {
            Header: (
                <div className="text-center">
                    <div className="text-center header">Salary Advance</div>
                    <tr style={{ float: 'right', background: 'none' }}>
                        <th
                            className="border"
                            style={{
                                borderBottom: 'none',
                                padding: '0px 12px 0px 12px',
                                minWidth: '4.1rem'
                            }}
                        >
                            {' '}
                            Balance{' '}
                        </th>
                        <th
                            className="border"
                            style={{
                                borderBottom: 'none',
                                paddingBottom: '0px',
                                paddingTop: '0px',
                                minWidth: '4.1rem'
                            }}
                        >
                            {' '}
                            Instlmt{' '}
                        </th>
                    </tr>
                </div>
            ),
            accessor: 'loanAmount',
            disableSortBy: true,
            Cell: ({ row }) => (
                <div className="d-flex" style={{ flexDirection: 'row-reverse' }}>
                    <tr>
                        <td
                            className="border"
                            style={{
                                verticalAlign: 'middle',
                                padding: '0px 5px',
                                minWidth: '4.7rem',
                                textAlign: 'right'
                            }}
                        >
                            <a
                                className=""
                                onClick={() => onShowHandler('Loan Details', row.original)}
                            >
                                {' '}
                                {row.original.loanBalance == 0
                                    ? ''
                                    : formatNumber(row.original.loanBalance)}
                            </a>
                        </td>
                        <td
                            className=""
                            style={{
                                padding: '0px',
                                textAlign: 'right',
                                minWidth: '4.1rem',
                                borderTop: 'none'
                            }}
                        >
                            {row.original.loanBalance > 0 ? (
                                <input
                                    name="loanAmount"
                                    className="eliminateControls"
                                    defaultValue={row.original.loanAmount}
                                    style={{
                                        maxWidth: '4rem',
                                        textAlign: 'right',
                                        border:
                                            row.original.loanAmount > 0
                                                ? '2px solid red'
                                                : '1px solid'
                                    }}
                                    type="number"
                                    onChange={(e) => onChangeHandler(e, row.index)}
                                    onBlur={() =>
                                        payrun.status.label != 'Completed' &&
                                        onUpdatePayrun(row.original, row.index)
                                    }
                                    onKeyPress={handleKeyPress}
                                    readOnly={payrun.status.label == 'Completed'}
                                />
                            ) : (
                                <div style={{ minHeight: '1.4rem' }}>{''}</div>
                            )}
                        </td>
                    </tr>
                </div>
            )
        },

        {
            Header: () => <div className="tableHeading text-center">OT</div>,
            accessor: 'otAmount',
            disableSortBy: true,
            Cell: ({ row }) => (
                <div style={{ minWidth: '3rem', paddingRight: '3px' }}>
                    <input
                        name="otAmount"
                        className="eliminateControls"
                        defaultValue={row.original.otAmount}
                        style={{
                            maxWidth: '4rem',
                            textAlign: 'right',
                            border: row.original.otAmount > 0 ? '2px solid #37DC1B' : '1px solid'
                        }}
                        type="number"
                        onChange={(e) => onChangeHandler(e, row.index)}
                        onBlur={() =>
                            payrun.status.label != 'Completed' &&
                            onUpdatePayrun(row.original, row.index)
                        }
                        onKeyPress={handleKeyPress}
                        readOnly={payrun.status.label == 'Completed'}
                    />
                </div>
            )
        },
        {
            Header: () => <div className="tableHeading text-center">Bonus</div>,
            accessor: 'bonus',
            disableSortBy: true,
            Cell: ({ row }) => (
                <div style={{ minWidth: '3rem' }}>
                    <input
                        name="bonus"
                        className="eliminateControls"
                        defaultValue={row.original.bonus}
                        style={{
                            maxWidth: '4rem',
                            textAlign: 'right',
                            border: row.original.bonus > 0 ? '2px solid #37DC1B' : '1px solid'
                        }}
                        type="number"
                        onChange={(e) => onChangeHandler(e, row.index)}
                        onBlur={() =>
                            payrun.status.label != 'Completed' &&
                            onUpdatePayrun(row.original, row.index)
                        }
                        onKeyPress={handleKeyPress}
                        readOnly={payrun.status.label == 'Completed'}
                    />
                </div>
            )
        },

        {
            Header: (
                <div className="text-center">
                    <div className="text-center header">YTD</div>
                    <tr style={{ textAlign: 'center', background: 'none' }}>
                        <th
                            className="border"
                            style={{
                                borderBottom: 'none',
                                paddingBottom: '0px',
                                paddingTop: '0px',
                                minWidth: '5.1rem'
                            }}
                        >
                            Earnings
                        </th>
                        <th
                            className="border"
                            style={{
                                borderBottom: 'none',
                                paddingBottom: '0px',
                                paddingTop: '0px',
                                minWidth: '5.1rem'
                            }}
                        >
                            {' '}
                            Tax{' '}
                        </th>
                    </tr>
                </div>
            ),
            accessor: 'ytdIncome',
            disableSortBy: true,
            Cell: ({ row }) => (
                <div className="text-right number">
                    <tr>
                        <td
                            className="border"
                            style={{
                                verticalAlign: 'middle',
                                padding: '0px 5px',
                                minWidth: '5.1rem',
                                textAlign: 'right'
                            }}
                        >
                            <a
                                className=""
                                onClick={() => onShowHandler(`YTD Details`, row.original)}
                            >
                                {' '}
                                {formatNumber(row.original.ytdIncome)}{' '}
                            </a>
                        </td>
                        <td
                            className="border"
                            style={{
                                verticalAlign: 'middle',
                                padding: '0px 5px',
                                minWidth: '5.0rem',
                                textAlign: 'right'
                            }}
                        >
                            <a
                                className=""
                                onClick={() => onShowHandler(`YTD Details`, row.original)}
                            >
                                {' '}
                                {formatNumber(row.original.ytdTax)}{' '}
                            </a>
                        </td>
                    </tr>
                </div>
            )
        },

        {
            Header: (
                <div className="text-right">
                    <div className="text-center header">This Pay Period</div>
                    <tr style={{ float: 'right', background: 'none' }}>
                        <th
                            className="currentnet"
                            style={{
                                borderBottom: 'none',
                                paddingBottom: '0px',
                                paddingTop: '0px',
                                paddingRight: '5px',
                                background: '#F1F9FC'
                            }}
                        >
                            Earnings
                        </th>
                        <th
                            className="prevnet"
                            style={{
                                borderBottom: 'none',
                                padding: '0px 21px 0px 21px',
                                background: '#F1F9FC'
                            }}
                        >
                            {' '}
                            Tax{' '}
                        </th>
                    </tr>
                </div>
            ),
            accessor: 'thisMonth',
            disableSortBy: true,
            Cell: ({ row }) => (
                <div style={{ float: 'right' }}>
                    <tr>
                        <td
                            style={{
                                verticalAlign: 'middle',
                                textAlign: 'right',
                                padding: '0px 5px',
                                minWidth: '4.45rem'
                            }}
                        >
                            <a
                                className=""
                                onClick={() =>
                                    onShowHandler(`Earning and deduction details`, row.original)
                                }
                            >
                                {' '}
                                {formatNumber(row.original.thisMonth)}
                            </a>
                        </td>
                        <td
                            style={{
                                verticalAlign: 'middle',
                                textAlign: 'right',
                                padding: '0px 0px',
                                minWidth: '4rem'
                            }}
                        >
                            <input
                                name="tax"
                                className="eliminateControls"
                                defaultValue={row.original.tax}
                                style={{ width: '4rem', textAlign: 'right', border: '1px solid' }}
                                type="number"
                                onChange={(e) => onChangeHandler(e, row.index)}
                                onBlur={() =>
                                    payrun.status.label != 'Completed' &&
                                    onBlurHandlerForTax(row.index)
                                }
                                onKeyPress={handleKeyPress}
                                readOnly={
                                    payrun.status.label == 'Completed' || row.original.tax < 0
                                }
                            />
                        </td>
                    </tr>
                </div>
            ),
            Footer: (
                <div className="footerBox justify-content text-right">
                    <div className="text-right textBold ">
                        {' '}
                        {formatNumber(
                            data
                                ? data
                                      .map((payRun) => payRun.thisMonth)
                                      .reduce((acc, thisMonth) => acc + thisMonth, 0)
                                : 0
                        )}
                    </div>

                    <div className="text-right textBold" style={{ minWidth: '4.3rem' }}>
                        {formatNumber(
                            data
                                ? data
                                      .map((payRun) => payRun.tax)
                                      .filter((val) => val >= 0)
                                      .reduce((acc, tax) => acc + tax, 0)
                                : 0
                        )}
                    </div>
                </div>
            )
        },

        {
            Header: (
                <div className="text-right">
                    <div className="text-center header">Net Pay</div>
                    <tr style={{ float: 'right', background: 'none' }}>
                        <th
                            className="currentnet"
                            style={{
                                borderBottom: 'none',
                                paddingBottom: '0px',
                                paddingTop: '0px',
                                paddingRight: '5px',
                                background: '#F1F9FC'
                            }}
                        >
                            Current
                        </th>
                        <th
                            className="prevnet"
                            style={{
                                borderBottom: 'none',
                                padding: '0px 19px 0px 19.5px',
                                background: '#F1F9FC'
                            }}
                        >
                            {' '}
                            Diff{' '}
                        </th>
                    </tr>
                </div>
            ),
            accessor: 'netPay',
            disableSortBy: true,
            Cell: ({ row }) => (
                <div style={{ float: 'right' }}>
                    <tr>
                        <td
                            style={{
                                verticalAlign: 'middle',
                                textAlign: 'right',
                                padding: '0px 5px',
                                minWidth: '4rem'
                            }}
                        >
                            {formatNumber(row.original.netPay.toFixed(0))}
                        </td>
                        <td
                            style={{
                                verticalAlign: 'middle',
                                textAlign: 'right',
                                padding: '0px 0px',
                                minWidth: '4rem',
                                color:
                                    row.original.netPay - row.original.prevNetPay > 0
                                        ? '#37DC1B'
                                        : 'red'
                            }}
                        >
                            {formatNumber(
                                (row.original.netPay - row.original.prevNetPay).toFixed(0)
                            )}
                        </td>
                    </tr>
                </div>
            ),
            Footer: (
                <div className="footerBox justify-content text-right">
                    <div className="text-right textBold">
                        {formatNumber(
                            data
                                ? data
                                      .map((payRun) => payRun.netPay)
                                      .reduce((acc, netPay) => acc + netPay, 0)
                                      .toFixed(0)
                                : 0
                        )}
                    </div>
                    <div style={{ minWidth: '4rem' }}></div>
                </div>
            )
        }
    ]

    // Download excel
    const exportToExcel = (data) => {
        // Create a new workbook and add a worksheet
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Payrun Data')

        // Set up headers with merged cells
        worksheet.mergeCells('C1:F1') // Attendance
        worksheet.mergeCells('H1:I1') // Salary Advance
        worksheet.mergeCells('L1:M1') // YTD
        worksheet.mergeCells('N1:O1') // This Pay Period
        worksheet.mergeCells('P1:Q1') // Net Pay

        worksheet.mergeCells('A1:A2') // Employee
        worksheet.mergeCells('B1:B2') // Code
        worksheet.mergeCells('G1:G2') // Expenses
        worksheet.mergeCells('J1:J2') // OT
        worksheet.mergeCells('K1:K2') // Bonus

        // Add headers to the worksheet
        worksheet.getCell('A1').value = 'Employee'
        worksheet.getCell('B1').value = 'Code'
        worksheet.getCell('C1').value = 'Attendance'
        worksheet.getCell('G1').value = 'Expenses'
        worksheet.getCell('H1').value = 'Salary Advance'
        worksheet.getCell('J1').value = 'OT'
        worksheet.getCell('K1').value = 'Bonus'
        worksheet.getCell('L1').value = 'YTD'
        worksheet.getCell('N1').value = 'This Pay Period'
        worksheet.getCell('P1').value = 'Net Pay'

        // Subheaders
        worksheet.getCell('C2').value = 'Timesheets'
        worksheet.getCell('D2').value = 'Leaves'
        worksheet.getCell('E2').value = 'Leave Bal'
        worksheet.getCell('F2').value = 'LOP Days'
        worksheet.getCell('H2').value = 'Balance'
        worksheet.getCell('I2').value = 'Instlmt'
        worksheet.getCell('L2').value = 'Earnings'
        worksheet.getCell('M2').value = 'Tax'
        worksheet.getCell('N2').value = 'Earnings'
        worksheet.getCell('O2').value = 'Tax'
        worksheet.getCell('P2').value = 'Current'
        worksheet.getCell('Q2').value = 'Diff'

        // Format header cells (center alignment)
        ;['A1', 'B1', 'C1', 'G1', 'H1', 'J1', 'K1', 'L1', 'N1', 'P1'].forEach((cell) => {
            worksheet.getCell(cell).alignment = { vertical: 'middle', horizontal: 'center' }
            worksheet.getCell(cell).font = { bold: true }
        })
        ;['C2', 'D2', 'E2', 'F2', 'H2', 'I2', 'L2', 'M2', 'N2', 'O2', 'P2', 'Q2'].forEach(
            (cell) => {
                worksheet.getCell(cell).alignment = { vertical: 'middle', horizontal: 'center' }
                worksheet.getCell(cell).font = { bold: true }
            }
        )

        // Add data rows
        data.forEach((row) => {
            worksheet.addRow([
                row.employeeName,
                row.employeeCode,
                `${row.approvedHours}/${row.submittedHours}`,
                row.absentDays === 0 ? '' : row.absentDays,
                row.leaveBalance,
                row.lopDays,
                row.reimbursementAmount,
                row.loanBalance === 0 ? '' : row.loanBalance,
                row.loanAmount,
                row.otAmount,
                row.bonus,
                row.ytdIncome,
                row.ytdTax,
                row.thisMonth,
                row.tax,
                row.netPay,
                row.netPay - row.prevNetPay
            ])
        })

        // Save the workbook to a file
        workbook.xlsx.writeBuffer().then((buffer) => {
            const blob = new Blob([buffer], { type: 'application/octet-stream' })
            saveAs(blob, 'Payrun_Data.xlsx')
        })
    }

    

    return (
        <>
            {loading ? <DetailLoader /> : ''}
            <section className="section" style={{ marginTop: '59px' }}>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="">
                                <PageHeader pageTitle={'Payrun'} />

                                <div className="row" style={{ marginTop: '45px' }}>
                                    <div className="col-sm-12 mb-0">
                                        <div className="row">
                                            <div className="col-sm-6">
                                                <label>Month : </label> {locationData.row.year}-
                                                {locationData.row.month} &emsp;
                                                <label>From : </label> {locationData.row.startDate}{' '}
                                                &emsp;
                                                <label>To : </label> {locationData.row.endDate}{' '}
                                                &emsp;
                                            </div>
                                            <div className="col-sm-2"></div>
                                            <div className="d-flex col-sm-4 justify-content-between">
                                                <div className="">
                                                    <label>Total Days : </label>{' '}
                                                    {payrun && payrun.noOfdays}
                                                </div>
                                                <div className="text-right">
                                                    <label>Working Days : </label>{' '}
                                                    {payrun && payrun.workingDays} &emsp;
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-sm-6">
                                        <label>Initiated By : &ensp;</label>{' '}
                                        {payrun && payrun.initiatedBy}
                                        {payrun &&
                                            payrun.initiatedDate &&
                                            '(' + payrun.initiatedDate + ')'}
                                    </div>
                                    <div className="col-sm-2"></div>
                                    <div className="col-sm-4">
                                        <label>Submitted By : </label>{' '}
                                        {payrun && payrun.submittedBy}
                                        {payrun &&
                                            payrun.submittedDate &&
                                            '(' + payrun.submittedDate + ')'}
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-6">
                                        <label>Approved By : </label> {payrun && payrun.approvedBy}
                                        {payrun &&
                                            payrun.approvedDate &&
                                            '(' + payrun.approvedDate + ')'}
                                    </div>
                                    <div className="col-sm-2"></div>
                                    <div className="col-sm-4">
                                        <label>Completed By : </label>{' '}
                                        {payrun && payrun.completedBy}
                                        {payrun &&
                                            payrun.completedDate &&
                                            '(' + payrun.completedDate + ')'}
                                    </div>
                                </div>
                                <div className="error">{formErrors && formErrors.netPay}</div>
                                <div className="justify-content">
                                    <div className="">
                                        <label>Location :</label> {locationData.row.locationName}
                                    </div>

                                    <div style={{ float: 'right', marginRight: '1rem' }}>
                                        <a className="" onClick={() => exportToExcel(data)}>
                                            {' '}
                                            Export to Excel{' '}
                                        </a>
                                        <span type="button" onClick={() => exportToExcel(data)}>
                                            <XlSheet height="25px" />
                                        </span>
                                        <a className=""> Print </a>
                                        <span type="button">
                                            <Printer height="25px" />
                                        </span>
                                    </div>
                                </div>

                                <div className="card-body mb-4">
                                    {loading ? (
                                        ''
                                    ) : (
                                        <PayRunDetailTable
                                        key={data.length}
                                            columns={COLUMNS}
                                            serialNumber={false}
                                            data={data}
                                            pageSize="10"
                                        />
                                    )}
                                </div>
                                <div className="btnCenter mb-3">
                                    {payrun &&
                                        payrun.status &&
                                        payrun.status.label != 'Completed' && (
                                            <Button
                                                disabled={data.length <= 0}
                                                className="Button"
                                                variant="addbtn"
                                                onClick={onSaveHandler}
                                            >
                                                Save
                                            </Button>
                                        )}
                                    {((payrun &&
                                        payrun.status &&
                                        payrun.status.label == 'Initiated') ||
                                        (payrun &&
                                            payrun.status &&
                                            payrun.status.label == 'Saved')) && (
                                        <Button
                                            disabled={data.length <= 0}
                                            className="Button"
                                            variant="addbtn"
                                            onClick={() =>
                                                onGenerateHandler({ value: 3, label: 'Submitted' })
                                            }
                                        >
                                            Submit
                                        </Button>
                                    )}
                                    {payrun &&
                                        payrun.status &&
                                        payrun.status.label == 'Submitted' && (
                                            <Button
                                                className="Button"
                                                variant="addbtn"
                                                disabled={data.length <= 0}
                                                onClick={() =>
                                                    onGenerateHandler({
                                                        value: 4,
                                                        label: 'Approved'
                                                    })
                                                }
                                            >
                                                Approve
                                            </Button>
                                        )}
                                    {payrun &&
                                        payrun.status &&
                                        payrun.status.label == 'Approved' && (
                                            <Button
                                                className="Button"
                                                variant="addbtn"
                                                disabled={data.length <= 0}
                                                onClick={() =>
                                                    onGenerateHandler({
                                                        value: 5,
                                                        label: 'Completed'
                                                    })
                                                }
                                            >
                                                Complete
                                            </Button>
                                        )}

                                    <Button
                                        className="Button"
                                        variant="secondary"
                                        onClick={() => window.history.back()}
                                    >
                                        {cancelButtonName}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* modal section */}
            <Modal
                show={show}
                size={modelHeading == 'YTD Details' ? 'xl' : 'lg'}
                onHide={onCloseHandler}
                backdrop="static"
                dialogClassName={modelHeading == 'YTD Details' ? 'custom-modal' : ''}
                keyboard={false}
            >
                <Modal.Header closeButton={onCloseHandler}>
                    <Modal.Title>
                        {modelHeading}-
                        <span style={{ color: '#197294', fontSize: '22px' }}>
                            {row.employeeName}
                        </span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    {modelHeading == 'LOP Details' && (
                        <LopModal id={row.employeeId} locId={row.locationId} />
                    )}

                    {modelHeading == 'Leave Details' && (
                        <LeavesModal
                            id={row.employeeId}
                            locId={row.locationId}
                            fromDate={payrun.startDate}
                            toDate={payrun.endDate}
                        />
                    )}

                    {modelHeading == 'TimeSheet Details' && (
                        <TimeSheetModal
                            fromDate={payrun.startDate}
                            toDate={payrun.endDate}
                            id={row.employeeId}
                        />
                    )}

                    {modelHeading == 'Loan Details' && (
                        <LoanModal id={row.employeeId} locId={row.locationId} />
                    )}
                    {modelHeading == 'Earning and deduction details' && (
                        <ThismonthDetails salaryComponents={row.salaryComponents} />
                    )}
                    {modelHeading == 'YTD Details' && (
                        <YTDDetails
                            ytdComponents={row.ytdCalculations}
                            deductionTotal={row.ytdDeductions}
                            earningTotal={row.ytdIncome}
                            startDate={payrun.startDate}
                        />
                    )}

                    {modelHeading == 'LOP Days' && (
                        <LopDaysModal
                            row={row}
                            rowIndex={rowIndex}
                            onUpdatePayrun={onUpdatePayrun}
                            status={payrun.status.label}
                            onCloseHandler={onCloseHandler}
                        />
                    )}
                </Modal.Body>
            </Modal>
        </>
    )
}

export default Payrun
