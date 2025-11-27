import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { Button, Col, Form, Row } from 'react-bootstrap'
import Modal from 'react-bootstrap/Modal'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { formatCurrency } from '../../../Common/CommonComponents/CurrencyFormate'
import DateFormate from '../../../Common/CommonComponents/DateFormate'
import FileViewer from '../../../Common/CommonComponents/FileViewer'
import Loader from '../../../Common/CommonComponents/Loader'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import { CommentIcon, Pdf } from '../../../Common/CommonIcons/CommonIcons'
import { UpdateWithFile, getById } from '../../../Common/Services/CommonService'
import Table from '../../../Common/Table/Table'
import { cancelButtonName } from '../../../Common/Utilities/Constants'
import { ROUTE_NAME } from '../../../reducers/constants'

const Reimburse = () => {
    // Accessing user details from Redux store
    const userDetails = useSelector((state) => state.user.userDetails)
    // Loading state for API calls or screen actions
    const [loading, setLoading] = useState(false)
    // Secondary loading flag for granular control (e.g., form submission)
    const [isLoading, setIsLoading] = useState(false)
    // Retrieving sheet data passed via React Router's useLocation (usually contains state from navigation)
    const sheetData = useLocation()
    // Holds all uploaded files
    const [files, setFiles] = useState([])
    // Toggles modal/view for general UI purposes (could be confirmation popup, preview, etc.)
    const [show, setShow] = useState(false)
    // Popup control flag (used for action dialogs)
    const [popup, setPop] = useState(false)
    // Controls visibility of approve popup/modal
    const [approvePop, setApprovePop] = useState(false)
    // Controls visibility of reimburse popup/modal
    const [reimbursePop, setReimbursePop] = useState(false)
    // Tracks if an expense is marked for reimbursement
    const [reimburse, setReimburse] = useState(false)
    // Tracks if an expense is marked for repudiation (i.e., rejection due to ineligibility)
    const [repudiate, setRepudiate] = useState(false)
    // Stores form data dynamically, usually used when editing or adding data
    const [formData, setFormData] = useState({})
    // List of all expense items for approval/rejection
    const [authList, setAuthList] = useState([])
    // Total reimbursed amount (sum of approved items)
    const [, setTotalReimbursed] = useState(0)
    // Array of row IDs selected for approval/rejection (checkbox-based)
    const [, setRowId] = useState([])
    // Stores main expense sheet data (e.g., metadata like date, employee, purpose)
    const [expenseSheet, setExpensesheet] = useState({})
    // Generic error message state to show validation or API errors
    const [error] = useState('')
    // Tracks whether any item has been authorized (used in submit validation)
    const [auth] = useState(false)
    // Stores items specifically marked as rejected
    const [rejectList, setRejectList] = useState([])

    const handleView = (reciept, action) => {
        const newArray = reciept.map((obj) => ({
            file: obj.billUploads,
            fileType: obj.fileType,
            fileName: obj.fileName
        }))
        setFiles(newArray)
        if (action == 'bills') {
            setShow(true)
        }
    }

    const navigate = useNavigate()

    useEffect(() => {
        getExpenseSheetItems()
    }, [])
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch({
            type: ROUTE_NAME,
            payload: '/reimburseList'
        })
    }, [])

    // close
    const onCloseHandler = () => {
        setShow(false)
        setPop(false)
        setApprovePop(false)
        setReimbursePop(false)
        setReimburse(false)
        setRepudiate(false)
    }

    const amountChange = (value, index) => {
        const newData = [...authList]

        newData[index].reimbursedAmount = value
        if (value != null) {
            const newTotal = newData.reduce((total, item) => {
                return total + (item.reimbursedAmount ? parseFloat(item.reimbursedAmount) : 0)
            }, 0)
            setTotalReimbursed(newTotal)
        }
    }

    const onChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const onChangeHandler = (value, index) => {
        const newData = [...authList]
        newData[index].reimbursedRemarks = value.trimStart().replace(/\s+/g, ' ')
        setAuthList(newData) // <-- update the state with the modified list
    }

    // getById
    const getExpenseSheetItems = () => {
        setIsLoading(true)
        getById({
            entity: 'expensesheets',
            organizationId: userDetails.organizationId,
            id: sheetData.state.id
        }).then((res) => {
            setIsLoading(false)
            if (res.statusCode == 200) {
                setExpensesheet(res.data)
                const getList = res.data.items.filter((e) => {
                    if (e.status != 'Rejected') {
                        return e
                    }
                })
                const rejList = res.data.items.filter((e) => {
                    if (e.status == 'Rejected') {
                        return e
                    }
                })
                rejList.map((item) => {
                    if (item.checked == false) {
                        item.checked = true
                    }
                })

                getList.map((item) => {
                    if (item.reimbursedAmount == 0.0 && item.status == 'Approved') {
                        item['reimbursedAmount'] = item['approvedAmount']
                    }
                })
                getList.map((item) => {
                    if (item.checked == true) {
                        item.checked = false
                    }
                })
                setRejectList(
                    res.data.items.filter((e) => {
                        if (e.status == 'Rejected') {
                            return e
                        }
                    })
                )
                setAuthList(getList)
                const ids = []

                setRowId(ids)
            } else {
                setAuthList([])
            }
        })
    }

    const beyondApprovedAmountMessages = authList.reduce((acc, item, index) => {
        if (item.reimbursedAmount >= 0 && item.reimbursedAmount > item.approvedAmount) {
            acc.push(index + 1)
        }
        return acc
    }, [])

    const belowZeroMessages = authList.reduce((acc, item, index) => {
        if (item.reimbursedAmount < 0) {
            acc.push(index + 1)
        }
        return acc
    }, [])

    const lessThanSubmittedAmountMessages = authList.reduce((acc, item, index) => {
        if (item.reimbursedAmount < item.approvedAmount) {
            acc.push(index + 1)
        }

        return acc
    }, [])

    // validationMessages
    const displayMessages = () => {
        let messages = []
        if (beyondApprovedAmountMessages.length > 0) {
            messages.push(
                <div key="beyondApprovedAmount" className="error">
                    {`Item(s) ${formatMessages(
                        beyondApprovedAmountMessages
                    )} have reimbursed amount beyond the approved amount.`}
                </div>
            )
        }

        if (belowZeroMessages.length > 0) {
            messages.push(
                <div key="belowZero" className="error">
                    {`Item(s) ${formatMessages(belowZeroMessages)} have reimbursed amount below 0.`}
                </div>
            )
        }

        if (lessThanSubmittedAmountMessages.length > 0) {
            messages.push(
                <div key="lessThanSubmittedAmount" className="error">
                    {`Item(s) ${formatMessages(
                        lessThanSubmittedAmountMessages
                    )} remarks are needed for less than the submitted amount.`}
                </div>
            )
        }
        return messages
    }

    const hasAmountValidationMessages = () => {
        return beyondApprovedAmountMessages.length > 0 || belowZeroMessages.length > 0
    }

    // Check if at least one item has reimbursedAmount greater than approvedAmount
    const isReimburseDisabled = authList.some((item) => item.reimbursedAmount > item.approvedAmount)

    // Check if at least one item has reimbursedAmount below 0
    const isBelowZeroDisabled = authList.some((item) => item.reimbursedAmount < 0)
    const unChecked = () => {
        return authList.every((item) => item.checked === true)
    }
    const formatMessages = (items) => {
        const lastItem = items.pop()
        return items.length > 0 ? `${items.join(', ')} and ${lastItem}` : lastItem
    }

    const checkboxes = (e, row) => {
        const newData = authList.map((list) => {
            if (list.id === row.original.id) {
                // Toggle the checked state
                list.checked = !e.target.checked
            }
            return list // Ensure we return the updated object for map
        })

        setAuthList(newData) // Update state with modified list
    }

    const [remark, setremark] = useState('')
    const [approveRemark, setapproveRemark] = useState('')
    const [reimburseRemark, setreimburseRemark] = useState('')

    const generateErrorMessage = (items, action) => {
        const errorIndices = items.reduce((acc, item, index) => {
            if (action === 'Reimbursed' && item.checked === true && !item.reimbursedRemarks) {
                acc.push(index + 1)
            } else if (
                action === 'Repudiated' &&
                item.checked === false &&
                !item.reimbursedRemarks
            ) {
                acc.push(index + 1)
            }
            return acc
        }, [])

        if (errorIndices.length > 0) {
            const errorMessage = `Item(s) ${formatMessages(
                errorIndices
            )} remarks are needed for rejected items.`
            return errorMessage
        }

        return null
    }

    const remarkHandler = (e) => {
        let shouldSetApprove = true
        let errorMessageShown = false

        authList.forEach((item) => {
            if (item.reimbursedAmount < item.approvedAmount) {
                if (item.reimbursedRemarks == null) {
                    if (!errorMessageShown) {
                        toast.error('Enter The Remarks')
                        errorMessageShown = true
                    }
                    shouldSetApprove = false
                }
            } else if (e === 'Reimbursed') {
                const errorMessage = generateErrorMessage(authList, 'Reimbursed')
                if (errorMessage) {
                    if (!errorMessageShown) {
                        setRemarkstate(errorMessage)
                        errorMessageShown = true
                    }
                    shouldSetApprove = false
                }
            }
        })

        if (shouldSetApprove) {
            setReimburse(true)
            setRemarkstate('')
        }
    }

    const repudiatedHandler = (e) => {
        if (e === 'Repudiated') {
            const errorMessage = generateErrorMessage(authList, 'Repudiated')
            if (errorMessage) {
                setRemarkstate(errorMessage)
                setRepudiate(false)
            } else {
                setRepudiate(true)
                setRemarkstate('')
            }
        }
    }

    const remarks = (data) => {
        setPop(true)
        setremark(data)
        setapproveRemark(data)
    }

    const approveRemarks = (data) => {
        setApprovePop(true)
        setapproveRemark(data)
    }

    const reimburseRemarks = (data) => {
        setReimbursePop(true)
        setreimburseRemark(data)
    }

    const date = new Date()

    const authObj = [...authList, ...rejectList]
    const [remarkstate, setRemarkstate] = useState()

    // save
    const saveHandler = (e) => {
        setIsLoading(true)
        onCloseHandler()
        const updateStatus = (action) => {
            authObj.forEach((item) => {
                if (item.checked == false) {
                    item.status = action
                } else if (item.status == 'Rejected') {
                    item.status = 'Rejected'
                } else {
                    item.status = action === 'Reimbursed' ? 'Repudiated' : 'Reimbursed'
                }
            })
        }
        updateStatus(e)

        authObj.some((item) => item.reimbursedRemarks == null)
        if (e == 'Reimbursed') {
            updateStatus('Reimbursed')
        } else if (e == 'Repudiated') {
            updateStatus('Repudiated')
        }
        let expenseObj = {
            id: sheetData.state.id,
            organizationId: userDetails.organizationId,
            fromDate: expenseSheet.fromDate,
            toDate: expenseSheet.toDate,
            submittedDate: expenseSheet.submittedDate,
            approvedDate: expenseSheet.approvedDate,
            employeeName: expenseSheet.employeeName,
            managerName: expenseSheet.managerName,
            locationName: expenseSheet.locationName,
            locationId: expenseSheet.locationId,
            employeeId: expenseSheet.employeeId,
            managerId: expenseSheet.managerId,
            reimbursedById: userDetails.employeeId,
            status: sheetData.state.status,
            description: formData.description ? formData.description : expenseSheet.description,
            referenceNo: formData.referenceNo ? formData.referenceNo : expenseSheet.referenceNo,
            reimbursedDate: moment(date).format('YYYY-MM-DD'),
            purposeOfExpense: expenseSheet.purposeOfExpense,
            items: authObj
        }
        setIsLoading(true)
        let form = new FormData()
        form.append('expenseSheet', JSON.stringify(expenseObj))
        UpdateWithFile({
            entity: 'expensesheets',
            organizationId: userDetails.organizationId,
            id: expenseObj.id,
            body: form
        }).then((res) => {
            setIsLoading(false)
            if (res.statusCode == 200) {
                setLoading(false)
                if (res.data.status == 'Reimbursed') {
                    toast.success('Sheet Reimbursed Successfully.')
                    navigate('/reimburseList')
                } else {
                    setIsLoading(false)
                    toast.success('Sheet Reject Successfully.')
                }
                navigate('/reimburseList')
            }
        })
    }

    const handleKeyDown = (e) => {
        if (e.keyCode == 13) {
            e.preventDefault()
        }
    }

    // columns
    const COLUMN = [
        {
            Header: () => <div className="text-right "></div>,
            accessor: 'checked',
            Cell: ({ row }) => (
                <>
                    <div>
                        <input
                            type="checkbox"
                            defaultChecked={row.original.checked == false}
                            onChange={(e) => checkboxes(e, row)}
                            disabled={
                                row.original.status === 'Reimbursed' ||
                                row.original.status === 'Repudiated'
                            }
                        />
                    </div>
                </>
            )
        },

        {
            Header: 'Category',
            accessor: 'categoryName'
        },
        {
            Header: 'Type',
            accessor: 'typeName'
        },
        {
            Header: 'Date',
            accessor: 'date',
            Cell: ({ row }) => (
                <div className="text-left">{<DateFormate date={row.original.date} />}</div>
            )
        },

        {
            Header: () => <div className="text-wrap text-right textBold "> Submitted </div>,
            accessor: 'submittedAmount',
            disableSortBy: true,
            Cell: ({ row }) => (
                <div className="text-right" style={{ paddingRight: '5%' }}>
                    {row.original.submittedAmount || row.original.submittedAmount == 0
                        ? formatCurrency(row.original.submittedAmount, row.original.currencyCode)
                        : '---'}
                </div>
            )
        },
        {
            Header: () => <div className="text-wrap text-right textBold "></div>,
            accessor: 'Remarks',
            Cell: ({ row }) => (
                <>
                    <div>
                        {row.original.remarks ? (
                            <Button
                                variant=""
                                className=""
                                size="sm"
                                onClick={() => remarks(row.original.remarks)}
                            >
                                <CommentIcon />
                            </Button>
                        ) : null}
                    </div>
                </>
            )
        },
        {
            Header: () => <div className="text-wrap text-right textBold "> Approved </div>,
            accessor: 'approvedAmount',
            Cell: ({ row }) => (
                <div className="text-right" style={{ paddingRight: '5%' }}>
                    {row.original.approvedAmount || row.original.approvedAmount == 0
                        ? formatCurrency(row.original.approvedAmount, row.original.currencyCode)
                        : '---'}
                </div>
            )
        },
        {
            Header: () => <div className="text-wrap text-right textBold  "></div>,
            accessor: 'approveRemarks',
            Cell: ({ row }) => (
                <>
                    <div>
                        {row.original.approvedRemarks ? (
                            <Button
                                variant=""
                                className=""
                                size="sm"
                                onClick={() => approveRemarks(row.original.approvedRemarks)}
                            >
                                <CommentIcon />
                            </Button>
                        ) : null}
                    </div>
                </>
            )
        },
        {
            Header: () => <div className="text-center text-wrap textBold">Reimbursed </div>,
            accessor: 'reimbursedAmount',
            Cell: ({ row }) => (
                <>
                    <div className="text-right">
                        <div
                            className="text-right"
                            style={{
                                paddingLeft: '20%',
                                paddingRight: '3%',
                                marginRight: '10px'
                            }}
                        >
                            {row.original.status === 'Approved' ? (
                                <form>
                                    <div style={{ display: 'flex' }}>
                                        <Form.Control
                                            style={{ width: '100px' }}
                                            size="sm"
                                            type="number"
                                            max={row.original.approvedAmount}
                                            name="reimbursedAmount"
                                            min={0}
                                            defaultValue={
                                                row.original.reimbursedAmount
                                                    ? row.original.reimbursedAmount
                                                    : row.original.approvedAmount ||
                                                        row.original.reimbursedAmount === ''
                                                        ? (row.original.reimbursedAmount = 0)
                                                        : row.original.reimbursedAmount
                                            }
                                            onKeyDown={handleKeyDown}
                                            onBlur={(e) => amountChange(e.target.value, row.index)}
                                            disabled={
                                                row.original.status === 'Reimbursed' ||
                                                row.original.status === 'Repudiated'
                                            }
                                        />
                                    </div>
                                </form>
                            ) : (
                                <div>
                                    {formatCurrency(
                                        row.original.reimbursedAmount,
                                        row.original.currencyCode
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )
        },

        {
            Header: () => <div className="text-wrap text-right textBold "></div>,
            accessor: 'remarks',
            Cell: ({ row }) =>
                expenseSheet.status != 'Approved' &&
                expenseSheet.status != 'Partially_Approved' && (
                    <>
                        <div>
                            {row.original.reimbursedRemarks ? (
                                <Button
                                    variant=""
                                    className=""
                                    size="sm"
                                    onClick={() => reimburseRemarks(row.original.reimbursedRemarks)}
                                >
                                    <CommentIcon />
                                </Button>
                            ) : null}
                        </div>
                    </>
                )
        },

        {
            Header: () =>
                expenseSheet.status != 'Reimbursed' &&
                expenseSheet.status != 'Repudiated' && (
                    <div className="text-center text-wrap textBold">
                        Remarks<span className="error">*</span>
                    </div>
                ),
            accessor: 'reimbursedRemarks',
            Cell: ({ row }) =>
                expenseSheet.status != 'Reimbursed' &&
                expenseSheet.status != 'Repudiated' && (
                    <>
                        <div className="custom-text-box-center" style={{ paddingRight: '5%' }}>
                            <div>
                                <Form.Control
                                    style={{ width: '150px' }}
                                    type="text"
                                    name="reimbursedRemarks"
                                    size="sm"
                                    defaultValue={row.original.reimbursedRemarks}
                                    onBlur={(e) => onChangeHandler(e.target.value, row.index)}
                                    maxLength={100}
                                />
                            </div>
                        </div>
                    </>
                )
        },
        {
            Header: 'Status',
            accessor: 'status',
            Cell: ({ row }) => (
                <>
                    <div
                        className={`text-left ${row.original.status === 'Rejected' ||
                            row.original.status === 'Repudiated'
                            ? 'text-red'
                            : 'text-green'
                            }`}
                    >
                        {row.original.status}
                    </div>
                </>
            )
        },
        {
            Header: () => <div className="text-wrap text-left textBold ">Files</div>,
            accessor: 'actions',

            disableSortBy: true,
            Cell: ({ row }) => (
                <div className="text-left">
                    {row.original.receipts.length > 0 && (
                        <Button
                            variant=""
                            className="iconWidth"
                            onClick={() => handleView(row.original.receipts, 'bills')}
                        >
                            <Pdf />
                        </Button>
                    )}
                </div>
            )
        }
    ]

    return (
        <>
            {isLoading ? <DetailLoader /> : ''}
            {auth == true ? (
                <>
                    <section className="section">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-md-12">
                                    <div className=" card-primary">
                                        <div style={{ marginTop: '3%' }}>
                                            <center>
                                                <h3>{error}</h3>
                                            </center>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </>
            ) : (
                <>
                    <section className="section detailBackground">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="">
                                        <PageHeader pageTitle="Reimburse Expenses" />
                                        <div className="card-body">
                                            {!loading && (
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between'
                                                    }}
                                                >
                                                    <div style={{ marginLeft: '40px', flex: 1 }}>
                                                        <h6
                                                            style={{
                                                                fontFamily:
                                                                    "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    display: 'flex',
                                                                    gap: '3.8rem'
                                                                }}
                                                            >
                                                                <label className="mb-3">
                                                                    Expense Id{' '}
                                                                </label>

                                                                <div style={{ marginLeft: '1rem' }}>
                                                                    {expenseSheet.id}
                                                                </div>
                                                            </div>
                                                        </h6>
                                                        <h6
                                                            style={{
                                                                fontFamily:
                                                                    "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    display: 'flex',
                                                                    gap: '0.8rem'
                                                                }}
                                                            >
                                                                <label className="mb-3">
                                                                    Employee Name{' '}
                                                                </label>

                                                                <div
                                                                    style={{ marginLeft: '1.7rem' }}
                                                                >
                                                                    {expenseSheet.employeeName}
                                                                </div>
                                                            </div>
                                                        </h6>
                                                        {expenseSheet.status == 'Reimbursed' && (
                                                            <h6
                                                                style={{
                                                                    fontFamily:
                                                                        "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                                                                }}
                                                            >
                                                                <div
                                                                    style={{
                                                                        display: 'flex',
                                                                        gap: '1.8rem'
                                                                    }}
                                                                >
                                                                    {expenseSheet.status ==
                                                                        'Reimbursed' && (
                                                                            <label className="mb-3">
                                                                                Reimbursed By
                                                                            </label>
                                                                        )}
                                                                    <div
                                                                        style={{
                                                                            marginLeft: '1.2rem'
                                                                        }}
                                                                    >
                                                                        {' '}
                                                                        {expenseSheet.status ===
                                                                            'Reimbursed'
                                                                            ? expenseSheet.accountantName
                                                                            : null}
                                                                    </div>
                                                                </div>
                                                            </h6>
                                                        )}
                                                        {(expenseSheet.status == 'Rejected' ||
                                                            expenseSheet.status ==
                                                            'Partially_Approved' ||
                                                            expenseSheet.status == 'Reimbursed' ||
                                                            expenseSheet.status == 'Approved') && (
                                                                <h6
                                                                    style={{
                                                                        fontFamily:
                                                                            "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                                                                    }}
                                                                >
                                                                    <div
                                                                        style={{
                                                                            display: 'flex',
                                                                            gap: '1.3rem'
                                                                        }}
                                                                    >
                                                                        {(expenseSheet.status ==
                                                                            'Rejected' ||
                                                                            expenseSheet.status ==
                                                                            'Partially_Approved' ||
                                                                            expenseSheet.status ==
                                                                            'Reimbursed' ||
                                                                            expenseSheet.status ==
                                                                            'Approved') && (
                                                                                <label className="mb-3">
                                                                                    Authorized By
                                                                                </label>
                                                                            )}
                                                                        <div
                                                                            style={{
                                                                                marginLeft: '31px'
                                                                            }}
                                                                        >
                                                                            {' '}
                                                                            {expenseSheet.managerName}
                                                                        </div>
                                                                    </div>
                                                                </h6>
                                                            )}
                                                        {expenseSheet.status == 'Repudiated' && (
                                                            <h6
                                                                style={{
                                                                    fontFamily:
                                                                        "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                                                                }}
                                                            >
                                                                <div
                                                                    style={{
                                                                        display: 'flex',
                                                                        gap: '1.3rem'
                                                                    }}
                                                                >
                                                                    {expenseSheet.status ==
                                                                        'Repudiated' && (
                                                                            <label className="mb-3">
                                                                                Repudiated By
                                                                            </label>
                                                                        )}
                                                                    <div
                                                                        style={{
                                                                            marginLeft: '31px'
                                                                        }}
                                                                    >
                                                                        {' '}
                                                                        {expenseSheet.status ===
                                                                            'Repudiated'
                                                                            ? expenseSheet.accountantName
                                                                            : null}
                                                                    </div>
                                                                </div>
                                                            </h6>
                                                        )}
                                                        <h6
                                                            style={{
                                                                fontFamily:
                                                                    "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    display: 'flex',
                                                                    gap: '4.0rem'
                                                                }}
                                                            >
                                                                <label className="mb-3">
                                                                    Start Date
                                                                </label>

                                                                <div style={{ marginLeft: '1rem' }}>
                                                                    {expenseSheet.fromDate}
                                                                </div>
                                                            </div>
                                                        </h6>
                                                        <h6
                                                            style={{
                                                                fontFamily:
                                                                    "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    display: 'flex',
                                                                    gap: '4.6rem'
                                                                }}
                                                            >
                                                                <label className="mb-3">
                                                                    End Date{' '}
                                                                </label>

                                                                <div style={{ marginLeft: '1rem' }}>
                                                                    {expenseSheet.toDate}
                                                                </div>
                                                            </div>
                                                        </h6>
                                                    </div>

                                                    <div
                                                        style={{
                                                            alignContent: 'flex-end',
                                                            flex: 1
                                                        }}
                                                    >
                                                        <h6
                                                            style={{
                                                                fontFamily:
                                                                    "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    display: 'flex',
                                                                    gap: '2.2rem'
                                                                }}
                                                            >
                                                                <label className="mb-3">
                                                                    Status{' '}
                                                                </label>
                                                                <div
                                                                    style={{ marginLeft: '65px' }}
                                                                ></div>
                                                                <span
                                                                    className={
                                                                        expenseSheet.status ===
                                                                            'Rejected' ||
                                                                            expenseSheet.status ===
                                                                            'Repudiated'
                                                                            ? 'text-red'
                                                                            : expenseSheet.status ===
                                                                                'Submitted' ||
                                                                                expenseSheet.status ===
                                                                                'Saved'
                                                                                ? ''
                                                                                : 'text-green'
                                                                    }
                                                                    style={{ marginLeft: '-31px' }}
                                                                >
                                                                    {expenseSheet.status}
                                                                </span>
                                                            </div>
                                                        </h6>

                                                        <h6
                                                            style={{
                                                                fontFamily:
                                                                    "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    display: 'flex',
                                                                    gap: '4.4rem'
                                                                }}
                                                            >
                                                                <label className="mb-3">
                                                                    Location{' '}
                                                                </label>

                                                                <div
                                                                    style={{ marginLeft: '1.1rem' }}
                                                                >
                                                                    {expenseSheet.locationName}
                                                                </div>
                                                            </div>
                                                        </h6>
                                                        <h6
                                                            style={{
                                                                fontFamily:
                                                                    "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    display: 'flex',
                                                                    gap: '1rem'
                                                                }}
                                                            >
                                                                <label className="mb-3">
                                                                    Submitted Date{' '}
                                                                </label>

                                                                <div
                                                                    style={{ marginLeft: '1.7rem' }}
                                                                >
                                                                    {expenseSheet.submittedDate}
                                                                </div>
                                                            </div>
                                                        </h6>
                                                        {(expenseSheet.status == 'Rejected' ||
                                                            expenseSheet.status ==
                                                            'Partially_Approved' ||
                                                            expenseSheet.status == 'Reimbursed' ||
                                                            expenseSheet.status == 'Approved') && (
                                                                <h6
                                                                    style={{
                                                                        fontFamily:
                                                                            "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                                                                    }}
                                                                >
                                                                    <div
                                                                        style={{
                                                                            display: 'flex',
                                                                            gap: '0.5rem'
                                                                        }}
                                                                    >
                                                                        {(expenseSheet.status ==
                                                                            'Rejected' ||
                                                                            expenseSheet.status ==
                                                                            'Partially_Approved' ||
                                                                            expenseSheet.status ==
                                                                            'Reimbursed' ||
                                                                            expenseSheet.status ==
                                                                            'Approved') && (
                                                                                <label className="mb-3">
                                                                                    Authorized Date
                                                                                </label>
                                                                            )}
                                                                        <div
                                                                            style={{
                                                                                marginLeft: '1.9rem'
                                                                            }}
                                                                        >
                                                                            {' '}
                                                                            {expenseSheet.approvedDate}
                                                                        </div>
                                                                    </div>
                                                                </h6>
                                                            )}
                                                        {expenseSheet.status == 'Reimbursed' && (
                                                            <h6
                                                                style={{
                                                                    fontFamily:
                                                                        "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                                                                }}
                                                            >
                                                                <div
                                                                    style={{
                                                                        display: 'flex',
                                                                        gap: '1.2rem'
                                                                    }}
                                                                >
                                                                    {expenseSheet.status ==
                                                                        'Reimbursed' && (
                                                                            <label className="mb-3">
                                                                                Reimbursed Date
                                                                            </label>
                                                                        )}
                                                                    <div
                                                                        style={{
                                                                            marginLeft: '15px'
                                                                        }}
                                                                    >
                                                                        {' '}
                                                                        {expenseSheet.status ===
                                                                            'Reimbursed'
                                                                            ? expenseSheet.reimbursedDate
                                                                            : null}
                                                                    </div>
                                                                </div>
                                                            </h6>
                                                        )}
                                                        {expenseSheet.status == 'Repudiated' && (
                                                            <h6
                                                                style={{
                                                                    fontFamily:
                                                                        "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                                                                }}
                                                            >
                                                                <div
                                                                    style={{
                                                                        display: 'flex',
                                                                        gap: '1.2rem'
                                                                    }}
                                                                >
                                                                    {expenseSheet.status ==
                                                                        'Repudiated' && (
                                                                            <label className="mb-3">
                                                                                Repudiated Date
                                                                            </label>
                                                                        )}
                                                                    <div
                                                                        style={{
                                                                            marginLeft: '15px'
                                                                        }}
                                                                    >
                                                                        {' '}
                                                                        {expenseSheet.status ===
                                                                            'Repudiated'
                                                                            ? expenseSheet.reimbursedDate
                                                                            : null}
                                                                    </div>
                                                                </div>
                                                            </h6>
                                                        )}

                                                        <h6
                                                            style={{
                                                                fontFamily:
                                                                    "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    display: 'flex',
                                                                    gap: '5.8rem'
                                                                }}
                                                            >
                                                                <div>
                                                                    <label className="mb-3">
                                                                        Purpose{' '}
                                                                    </label>
                                                                </div>
                                                                <div
                                                                    style={{
                                                                        flex: 1,
                                                                        wordBreak: 'break-word',
                                                                        whiteSpace: 'normal',
                                                                        overflowWrap: 'break-word'
                                                                    }}
                                                                >
                                                                    {expenseSheet.purposeOfExpense}
                                                                </div>
                                                            </div>
                                                        </h6>
                                                    </div>
                                                </div>
                                            )}
                                            {!loading && (
                                                <div>
                                                    {expenseSheet.status !== 'Reimbursed' &&
                                                        expenseSheet.status !== 'Repudiated' && (
                                                            <h6>
                                                                <div
                                                                    style={{
                                                                        marginLeft: '10px',
                                                                        color: 'red'
                                                                    }}
                                                                >
                                                                    {displayMessages()}
                                                                    {remarkstate}
                                                                </div>
                                                            </h6>
                                                        )}
                                                </div>
                                            )}
                                            {loading ? (
                                                <center>
                                                    <Loader />
                                                </center>
                                            ) : (
                                                <Table
                                                    columns={COLUMN}
                                                    footer={true}
                                                    data={authList}
                                                    key={authList.length}
                                                    pageSize="10"
                                                />
                                            )}
                                            {!loading && (
                                                <div className="d-flex justify-content-between mb-3 mt-3">
                                                    <div
                                                        className="col-5"
                                                    >
                                                        <Form.Group
                                                            as={Row}>
                                                            <Form.Label column sm={3}>Notes </Form.Label>
                                                            <Col sm={7}>
                                                                <Form.Control
                                                                    as="textarea"
                                                                    style={{
                                                                        width: '100%',
                                                                        height: '50px',
                                                                        maxHeight: '100px'
                                                                    }}
                                                                    name="description"
                                                                    size="sm"
                                                                    value={expenseSheet.description}
                                                                    onChange={(e) => onChange(e)}
                                                                    maxLength={250}
                                                                    disabled={
                                                                        sheetData.state.status !==
                                                                        'Approved' &&
                                                                        sheetData.state.status !==
                                                                        'Partially_Approved'
                                                                    }
                                                                />
                                                                <p
                                                                    style={{
                                                                        textAlign: 'right',
                                                                        fontSize: '85%'
                                                                    }}
                                                                >
                                                                    {formData.description ? formData.description.length:0}/250
                                                                </p>
                                                            </Col>
                                                        </Form.Group>
                                                    </div>

                                                    <div className="col-5">
                                                        <Form.Group
                                                            as={Row}
                                                        >
                                                            <Form.Label column sm={4}>Reference No </Form.Label>
                                                            <Col sm={8}>
                                                                <Form.Control
                                                                    size="sm"
                                                                    name="referenceNo"
                                                                    value={expenseSheet.referenceNo}
                                                                    onChange={(e) => onChange(e)}
                                                                    maxLength={150}
                                                                    disabled={
                                                                        sheetData.state.status !==
                                                                        'Approved' &&
                                                                        sheetData.state.status !==
                                                                        'Partially_Approved'
                                                                    }
                                                                />
                                                                {formData.referenceNo && (
                                                                    <p
                                                                        style={{
                                                                            textAlign: 'right',
                                                                            fontSize: '85%'
                                                                        }}
                                                                    >
                                                                        {
                                                                            formData.referenceNo
                                                                                .length
                                                                        }
                                                                        /150
                                                                    </p>
                                                                )}
                                                            </Col>
                                                        </Form.Group>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            {sheetData.state.status !== 'Approved' &&
                                                sheetData.state.status !== 'Partially_Approved' ? (
                                                <div
                                                    className="modalFooter"
                                                    style={{ paddingLeft: '45%' }}
                                                >
                                                    <Button
                                                        className="Button"
                                                        variant="secondary"
                                                        onClick={() => navigate('/reimburseList')}
                                                    >
                                                        {cancelButtonName}
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div>
                                                    {!loading && (
                                                        <div
                                                            className="btnCenter mb-4"
                                                        >
                                                            <Button
                                                                variant="addbtn"
                                                                type="submit"
                                                                className="Button"
                                                                onClick={() =>
                                                                    remarkHandler('Reimbursed')
                                                                }
                                                                disabled={
                                                                    hasAmountValidationMessages() ||
                                                                    isReimburseDisabled ||
                                                                    isBelowZeroDisabled ||
                                                                    expenseSheet.status ===
                                                                    'Reimbursed' ||
                                                                    expenseSheet.status ===
                                                                    'Repudiated' ||
                                                                    unChecked()
                                                                }
                                                            >
                                                                Reimburse
                                                            </Button>

                                                            <Button
                                                                variant="addbtn"
                                                                type="submit"
                                                                className="Button"
                                                                onClick={() =>
                                                                    repudiatedHandler('Repudiated')
                                                                }
                                                                disabled={
                                                                    hasAmountValidationMessages() ||
                                                                    isReimburseDisabled ||
                                                                    isBelowZeroDisabled ||
                                                                    expenseSheet.status ===
                                                                    'Reimbursed' ||
                                                                    expenseSheet.status ===
                                                                    'Repudiated' ||
                                                                    unChecked()
                                                                }
                                                            >
                                                                Reject
                                                            </Button>

                                                            <Button
                                                                className="Button"
                                                                variant="secondary"
                                                                onClick={() =>
                                                                    navigate('/reimburseList')
                                                                }
                                                            >
                                                                {cancelButtonName}
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <br />
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
                        <Modal.Header className="" closeButton={onCloseHandler}>
                            <Modal.Title>Receipts</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="modalBody">
                            <FileViewer documents={files} />
                        </Modal.Body>
                    </Modal>
                    <Modal
                        show={reimburse}
                        onHide={onCloseHandler}
                        backdrop="static"
                        keyboard={false}
                    >
                        <Modal.Header closeButton={onCloseHandler}>
                            <Modal.Title>Reimburse </Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="modalBody">
                            Are you sure you want to reimburse this item?
                            <div className="delbtn">
                                <Button
                                    className="Button"
                                    variant="addbtn"
                                    onClick={() => saveHandler('Reimbursed')}
                                >
                                    Yes
                                </Button>
                                <Button
                                    className="Button"
                                    variant="secondary"
                                    onClick={onCloseHandler}
                                >
                                    No
                                </Button>
                            </div>
                        </Modal.Body>
                    </Modal>
                    <Modal
                        show={repudiate}
                        onHide={onCloseHandler}
                        backdrop="static"
                        keyboard={false}
                    >
                        <Modal.Header closeButton={onCloseHandler}>
                            <Modal.Title>Reject </Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="modalBody">
                            Are you sure you want to reject this item?
                            <div className="delbtn">
                                <Button
                                    className="Button"
                                    variant="addbtn"
                                    onClick={() => saveHandler('Repudiated')}
                                >
                                    Yes
                                </Button>
                                <Button
                                    className="Button"
                                    variant="secondary"
                                    onClick={onCloseHandler}
                                >
                                    No
                                </Button>
                            </div>
                        </Modal.Body>
                    </Modal>

                    <Modal show={popup} onHide={onCloseHandler} backdrop="static" keyboard={false}>
                        <Modal.Header closeButton={onCloseHandler}>
                            <Modal.Title>Employee Remarks</Modal.Title>
                        </Modal.Header>
                        <form onSubmit={''}>
                            <Modal.Body>
                                <div
                                    class="col-12"
                                    style={{
                                        overflowWrap: 'break-word',
                                        wordWrap: 'break-word',
                                        wordBreak: 'break-all'
                                    }}
                                >
                                    {remark}
                                </div>
                            </Modal.Body>
                        </form>
                    </Modal>
                    <Modal
                        show={approvePop}
                        onHide={onCloseHandler}
                        backdrop="static"
                        keyboard={false}
                    >
                        <Modal.Header closeButton={onCloseHandler}>
                            <Modal.Title>Authorized Remarks</Modal.Title>
                        </Modal.Header>
                        <form onSubmit={''}>
                            <Modal.Body>
                                <div
                                    class="col-12"
                                    style={{
                                        overflowWrap: 'break-word',
                                        wordWrap: 'break-word',
                                        wordBreak: 'break-all'
                                    }}
                                >
                                    {approveRemark}
                                </div>
                            </Modal.Body>
                        </form>
                    </Modal>
                    <Modal
                        show={reimbursePop}
                        onHide={onCloseHandler}
                        backdrop="static"
                        keyboard={false}
                    >
                        <Modal.Header closeButton={onCloseHandler}>
                            <Modal.Title>Reimbursed Remarks</Modal.Title>
                        </Modal.Header>
                        <form onSubmit={''}>
                            <Modal.Body>
                                <div
                                    class="col-12"
                                    style={{
                                        overflowWrap: 'break-word',
                                        wordWrap: 'break-word',
                                        wordBreak: 'break-all'
                                    }}
                                >
                                    {reimburseRemark}
                                </div>
                            </Modal.Body>
                        </form>
                    </Modal>
                </>
            )}
        </>
    )
}
export default Reimburse
