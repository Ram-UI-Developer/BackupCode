import React, { useEffect, useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import Modal from 'react-bootstrap/Modal'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import { CommentIcon, Pdf } from '../../../Common/CommonIcons/CommonIcons'
import { getById, UpdateWithFile } from '../../../Common/Services/CommonService'
import Table from '../../../Common/Table/Table'

import moment from 'moment'
import { formatCurrency } from '../../../Common/CommonComponents/CurrencyFormate'
import DateFormate from '../../../Common/CommonComponents/DateFormate'
import FileViewer from '../../../Common/CommonComponents/FileViewer'
import Loader from '../../../Common/CommonComponents/Loader'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'
import { cancelButtonName } from '../../../Common/Utilities/Constants'
import { ROUTE_NAME } from '../../../reducers/constants'
// import { FaEye } from 'react-icons/fa6'

const AuthorizeExpense = () => {
    const userDetails = useSelector((state) => state.user.userDetails)

    const [loading] = useState(false) // For UI-level loading (e.g., dropdowns, etc.)
    const [isLoading, setIsLoading] = useState(false) // For API-level loading (e.g., page or form loading)

    const navigate = useNavigate()
    // route state (may be partial when navigated from notifications)
    const location = useLocation().state || {}
    const [show, setShow] = useState(false) // General modal/show popup toggle (e.g., delete confirmation)
    const [popup, setPop] = useState(false) // For additional modals (e.g., status update popup)
    const [approve, setApprove] = useState(false) // Toggle approve confirmation popup
    const [reject, setReject] = useState(false) // Toggle reject confirmation popup
    const [authorizeRemarksView, setAuthorizeRemarksView] = useState(false) // Show remarks modal for authorization
    const [viewEmployeeFiles, setViewEmployeeFiles] = useState(false) // Toggle for employee-uploaded files preview
    const [view, setView] = useState(false) // Generic view toggle (e.g., file viewer, details popup)
    const [reimbursePop, setReimbursePop] = useState(false) // Toggle reimbursement modal

    const [, setTotalApproved] = useState(0) // Track total approved amount
    const [files, setFiles] = useState([]) // List of files uploaded or attached
    const [, setData] = useState() // Holds current data under view/edit
    const [, setChecking] = useState() // Generic state for check logic
    const [authList, setAuthList] = useState([]) // List of authorized expenses
    console.log("Auth List:", authList);
    const [expenseSheet, setExpensesheet] = useState({}) // Main expense sheet data

    // Use the fetched expenseSheet.status when available, otherwise fall back to route state.
    const currentStatus = expenseSheet?.status || location?.status || ''
    const [rejectedList, setRejectedList] = useState([]) // Items marked as rejected

    const [reimburseRemark, setreimburseRemark] = useState('') // Remark added during reimbursement
    const [remark, setremark] = useState('') // General remark input
    const [approveRemark, setApproveRemark] = useState('') // Remark added on approval
    const [remarkstate, setRemarkstate] = useState() // Used for tracking remark input state
    const [, setRowId] = useState([]) // Tracks selected rows for bulk operations
    const [error] = useState('') // Holds any global error message (e.g., from API failure or form submission)
    const [auth, setAuth] = useState([]) // Holds authorization-level users or roles
    const [showPopup, setShowPopup] = useState(false);
    const [selectedRemarks, setSelectedRemarks] = useState([]);
    const [prevRemarks, setPrevRemarks] = useState([]);
    // const [rowRemarks, setRowRemarks] = useState('');
    // arrayRemarks
    useEffect(() => {
        getExpenseSheetItems()
    }, [])

    const dispatch = useDispatch()
    useEffect(() => {
        dispatch({
            type: ROUTE_NAME,
            payload: '/authorizeExpenseList'
        })
    }, [])

    const onCloseHandler = () => {
        setViewEmployeeFiles(false)
        setView(false)
        setShow(false)
        setPop(false)
        setApprove(false)
        setReject(false)
        setReimbursePop(false)
        setAuthorizeRemarksView(false)
    }

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

    const amountChange = (value, index, row) => {
        const newData = [...authList]
        newData[index].approvedAmount = value

        const newTotal = newData.reduce(
            (a, b) => Number(b.approvedAmount) + Number(b.approvedAmount),
            0
        )

        setTotalApproved(newTotal)
        setData(value)
        setChecking(row)
        // Update the authList state
        setAuthList(newData)
    }

    const onChangeHandler = (value, id) => {
        const newData = authList.map(item =>
            item.id === id ? { ...item, approvedRemarks: value } : item
        );
        setAuthList(newData);
    };


    /**
     * Fetches the expense sheet data by ID and separates the items into
     * rejected and non-rejected lists. Initializes form states for authorization.
     */
    const getExpenseSheetItems = () => {
        setIsLoading(true)
        getById({
            entity: 'expensesheets',
            organizationId: userDetails.organizationId,
            id: location.id
        }).then((res) => {
            if (res.statusCode == 200) {
                setIsLoading(false)
                setExpensesheet(res.data)
                setPrevRemarks(() => res.data.items.map(item => item.approvedRemarks))

                setSelectedRemarks(() => res.data.items.map(item => item.approvedRemarks))

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
                getList.map((item) => {
                    if (item.approvedAmount == 0.0 && item.status == 'Submitted') {
                        item['approvedAmount'] = item['submittedAmount']
                    }
                })
                getList.map((item) => {
                    if (item.checked) {
                        item.checked = false
                    }
                })
                // setAuthList(res.data.items)
                // clear remarks for fresh entry
                const cleared = res.data.items.map(item => ({
                    ...item,

                    approvedRemarks: ""   // <--- force reset
                }))
                setAuthList(cleared)

                setRejectedList(rejList)
                setAuth(getList.map((e) => e.checked))
                const ids = []

                setRowId(ids)
            } else {
                setAuthList([])
            }
        })
    }

    const authObj = [...authList, ...rejectedList]
    // This is called when you click the eye icon
    const handleShowRemarks = () => {
        setShowPopup(true);
    };

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

    const beyondApprovedAmountMessages = authList.reduce((acc, item, index) => {
        if (item.approvedAmount >= 0 && item.approvedAmount > item.submittedAmount) {
            acc.push(index + 1)
        }
        return acc
    }, [])

    const belowZeroMessages = authList.reduce((acc, item, index) => {
        if (item.approvedAmount < 0) {
            acc.push(index + 1)
        }
        return acc
    }, [])
    const lessThanSubmittedAmountMessages = authList.reduce((acc, item, index) => {
        if (item.approvedAmount < item.submittedAmount) {
            acc.push(index + 1)
        }

        return acc
    }, [])
    const displayMessages = () => {
        let messages = []
        if (beyondApprovedAmountMessages.length > 0) {
            messages.push(
                <div key="beyondApprovedAmount" className="error">
                    {`Item(s) ${formatMessages(
                        beyondApprovedAmountMessages
                    )} have approved  amount beyond the applied amount.`}
                </div>
            )
        }

        if (belowZeroMessages.length > 0) {
            messages.push(
                <div key="belowZero" className="error">
                    {`Item(s) ${formatMessages(belowZeroMessages)} have approved amount below 0.`}
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
    const isReimburseDisabled = authList.some((item) => item.approvedAmount > item.submittedAmount)

    const isBelowZeroDisabled = authList.some((item) => item.approvedAmount < 0)

    const formatMessages = (items) => {
        const lastItem = items.pop()
        return items.length > 0 ? `${items.join(', ')} and ${lastItem}` : lastItem
    }

    // Helper function to generate error messages
    const generateErrorMessage = (items, action) => {
        const errorIndices = items.reduce((acc, item, index) => {
            // Customize the condition based on the specific validation criteria
            if (action === 'Approved' && item.checked === true && !item.approvedRemarks) {
                acc.push(index + 1)
            } else if (action === 'Rejected' && item.checked === false && !item.approvedRemarks) {
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

        return null // Return null if there are no errors
    }

    const remarkHandler = (e) => {
        let shouldSetApprove = true
        let errorMessageShown = false

        authList.forEach((item) => {
            if (item.approvedAmount < item.submittedAmount) {
                if (item.approvedRemarks == null) {
                    if (!errorMessageShown) {
                        toast.error('Enter The Remarks')
                        errorMessageShown = true
                    }
                    shouldSetApprove = false
                }
            } else if (e === 'Approved') {
                const errorMessage = generateErrorMessage(authList, 'Approved')
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
            setApprove(true)
            setRemarkstate('')
        }
    }

    const repudiatedHandler = (e) => {
        if (e === 'Rejected') {
            const errorMessage = generateErrorMessage(authList, 'Rejected')
            if (errorMessage) {
                setRemarkstate(errorMessage)
                setReject(false)
            } else {
                setReject(true)
                setRemarkstate('')
            }
        }
    }

    const remarks = (data) => {
        setPop(true)
        setremark(data)
    }

    const approveRemarks = (data) => {
        setAuthorizeRemarksView(true)
        setApproveRemark(data)
    }

    const date = new Date()
    const unChecked = () => {
        return authList.every((item) => item.checked === true)
    }

    /**
     * Handles the approval or rejection of expense sheet items.
     * Validates remarks, updates item statuses, and submits the updated sheet.
     *
     * @param {string} e - Action type: "Approved" or "Rejected"
     */
    const saveHandler = (e) => {
        setIsLoading(true)
        onCloseHandler()
        const updateStatus = (action) => {
            authList.forEach((item) => {
                if (item.checked == false) {
                    if (item.status == 'Approved') {
                        return item.status
                    } else {
                        item.status = action
                    }
                } else {
                    item.status = action === 'Approved' ? 'Rejected' : 'Approved'
                }
            })
        }

        const uncheckedItemsWithNullRemarks = authObj.filter(
            (item) =>
                item.checked === true &&
                (item.approvedRemarks === null || item.approvedRemarks === '')
        )
        const checkedItemsWithNullRemarks = authObj.filter(
            (item) =>
                item.checked === false &&
                (item.approvedRemarks === null || item.approvedRemarks === '')
        )

        if (e == 'Approved' && uncheckedItemsWithNullRemarks.length > 0) {
            setRemarkstate(true)
            return
        }
        if (e == 'Rejected' && checkedItemsWithNullRemarks.length > 0) {
            setRemarkstate(true)
            return
        }

        updateStatus(e)
        if (e == 'Approved') {
            updateStatus('Approved')
        } else if (e == 'Rejected') {
            updateStatus('Rejected')
        }

        let expenseObj = {
            id: expenseSheet.id,
            managerId: userDetails.employeeId,
            fromDate: expenseSheet.fromDate,
            toDate: expenseSheet.toDate,
            submittedDate: expenseSheet.submittedDate,
            employeeName: expenseSheet.employeeName,
            locationName: expenseSheet.locationName,
            employeeId: expenseSheet.employeeId,
            status: location.status,
            organizationId: userDetails.organizationId,
            locationId: expenseSheet.locationId,
            purposeOfExpense: expenseSheet.purposeOfExpense,
            approvedDate: moment(date).format('YYYY-MM-DD'),
            items: authList
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
            setIsLoading(true)

            if (['Rejected', 'Approved'].includes(res.data.status)) {
                toast.success(`Expense Report ${res.data.status} Successfully.`)
                navigate('/authorizeExpenseList')
            } else if (res.data.status === 'Partially_Approved') {
                toast.success('Sheet Partially Approved Successfully.')
                navigate('/authorizeExpenseList')
            } else {
                setIsLoading(false)
                toast.error(res.errorMessage)
            }
        })
    }

    const handleKeyDown = (e) => {
        if (e.keyCode == 13 && e.keyCode == 45) {
            e.preventDefault()
        }
    }
    const reimburseRemarks = (data) => {
        setReimbursePop(true)
        setreimburseRemark(data)
    }

    const hasOldRemarks = prevRemarks.some(r => r && r.trim().length > 0);


    const COLUMN = [

        {
            Header: () => <div className="text-right "></div>,
            accessor: 'checked',
            Cell: ({ row }) => (
                <>
                    <div>
                        {row.original.status === 'Approved' ||
                            row.original.status === 'Rejected' ||
                            expenseSheet.status === 'Repudiated' ||
                            expenseSheet.status === 'Reimbursed' ? (
                            <input type="checkbox" defaultChecked={true} disabled={true} />
                        ) : (
                            <input
                                type="checkbox"
                                defaultChecked={row.original.checked === false}
                                onChange={(e) => checkboxes(e, row)}
                            />
                        )}
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
            Header: () => <div className="header text-left ">Date</div>,
            accessor: 'date',
            width: '40%',
            Cell: ({ row }) => (
                <div className="text-left">{<DateFormate date={row.original.date} />}</div>
            )
        },

        {
            Header: () => <div className=" header text-right "> Applied </div>,
            accessor: 'submittedAmount',
            width: '40%',
            disableSortBy: true,
            Cell: ({ row }) => (
                <div className="text-right" style={{ marginRight: '4px' }}>
                    {row.original.submittedAmount
                        ? formatCurrency(row.original.submittedAmount, row.original.currencyCode)
                        : '---'}
                </div>
            )
        },
        {
            Header: () => <div></div>,
            accessor: 'appliedremarks',
            Cell: ({ row }) => (
                <>
                    <div>
                        {row.original.remarks ? (
                            <Button
                                variant=""
                                className=""
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
            Header: () => <div className="header text-right "> Approved </div>,
            accessor: 'approved',
            Cell: ({ row }) => (
                <div className="text-right">
                    {row.original.status === 'Submitted' ? (
                        <>
                            <form>
                                <div style={{ display: 'flex' }}>
                                    <Form.Control
                                        size="sm"
                                        type="number"
                                        name="approvedAmount"
                                        max={row.original.submittedAmount}
                                        min={0}
                                        defaultValue={
                                            row.original.approvedAmount
                                                ? row.original.approvedAmount
                                                : row.original.submittedAmount ||
                                                    row.original.approvedAmount === ''
                                                    ? (row.original.approvedAmount = 0)
                                                    : row.original.approvedAmount
                                        }
                                        onKeyDown={handleKeyDown}
                                        onBlur={(e) =>
                                            amountChange(
                                                e.target.value,
                                                row.index,
                                                row.original.submittedAmount
                                            )
                                        }
                                        onInput={(e) => {
                                            // Prevent negative values
                                            if (e.target.value < 0) {
                                                e.target.value = 0
                                            }

                                            // Restrict input of negative symbol
                                            if (e.target.value.includes('-')) {
                                                e.target.value = e.target.value.replace('-', '')
                                            }

                                            // Set to 0 if the status is "Rejected"
                                            if (row.original.status === 'Rejected') {
                                                row.original.approvedAmount = 0
                                            }
                                        }}
                                    />
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="text-right" style={{ marginRight: '4px' }}>
                            {formatCurrency(row.original.approvedAmount, row.original.currencyCode)}
                        </div>
                    )}
                </div>
            )
        },
        {
            Header: () => <div className="text-right"></div>,
            accessor: 'approvedremarks',
            Cell: ({ row }) =>
                currentStatus != 'Submitted' && (
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
            Header: () =>
                currentStatus === 'Submitted' && (
                    <div className="header text-center">Remarks</div>
                ),
            accessor: 'approvedRemarks',
            width: '40%',
            Cell: ({ row }) => {
                const [localRemark, setLocalRemark] = useState(row.original.approvedRemarks);

                const handleBlur = () => {
                    // Update the main state only when the input loses focus
                    onChangeHandler(localRemark, row.original.id);
                };

                return (
                    currentStatus === 'Submitted' && (
                        <div
                            className="custom-text-box-center"
                            style={{ paddingRight: '5%', paddingLeft: '5%' }}
                        >
                            {row.original.status === 'Submitted' ? (
                                <Form.Control
                                    type="text"
                                    name="approvedRemarks"
                                    size="sm"
                                    value={localRemark}
                                    onChange={(e) => setLocalRemark(e.target.value)}
                                    onBlur={handleBlur}
                                    maxLength={100}
                                    onKeyDown={(e) => {
                                        // Prevent typing Backspace
                                        const value = e.target.value;
                                        if (value ==0 &&
                                            e.key !== 'Tab') {
                                            e.preventDefault();
                                        }
                                    }} />
                            ) : (
                                <div style={{ textAlign: 'center' }}>
                                    {row.original.approvedRemarks?.length > 0
                                        ? row.original.approvedRemarks
                                        : '---'}
                                </div>
                            )}
                        </div>
                    )
                );
            }
        },
        ...(hasOldRemarks
            ? [{
                Header: () => <div className="header text-center">Old Remarks</div>,
                accessor: 'oldRemarks',
                Cell: ({ row }) => {
                    const oldRemark = prevRemarks[row.index];
                    return (
                        <div style={{ textAlign: "center" }}>
                            {oldRemark && oldRemark.trim().length > 0 ? (
                                <Button variant="" onClick={() => handleShowRemarks(oldRemark)}>
                                    <CommentIcon
                                        title="View Old Remarks"
                                        style={{
                                            cursor: 'pointer',
                                            color: '#007bff',
                                            height: '1.5em',
                                            width: '1.5em'
                                        }}
                                    />
                                </Button>
                            ) : (
                                <span>---</span>
                            )}
                        </div>
                    );
                }
            }]
            : []),
        {
            Header: () =>
                currentStatus != 'Submitted' &&
                currentStatus != 'Rejected' &&
                currentStatus != 'Partially_Approved' &&
                currentStatus != 'Approved' && (
                    <div className="header text-right">Reimbursed (₹)</div>
                ),
            accessor: 'reimbursedAmount',
            Cell: ({ row }) =>
                currentStatus != 'Submitted' &&
                currentStatus != 'Rejected' &&
                currentStatus != 'Approved' &&
                currentStatus != 'Partially_Approved' && (
                    <>
                        <div className=" text-center" style={{ marginLeft: '35px' }}>
                            {row.original.reimbursedAmount || row.original.reimbursedAmount == 0
                                ? formatCurrency(
                                    row.original.reimbursedAmount,
                                    row.original.currencyCode
                                )
                                : '---'}
                        </div>
                    </>
                )
        },
        {
            Header: () => <div className="text-right "></div>,
            accessor: 'reimburseremarks',
            Cell: ({ row }) =>
                currentStatus != 'Submitted' &&
                currentStatus != 'Rejected' &&
                currentStatus != 'Approved' &&
                currentStatus != 'Partially_Approved' && (
                    <>
                        <div className="text-left" style={{ marginLeft: '-20px' }}>
                            {row.original.reimbursedRemarks ? (
                                <Button
                                    type="button"
                                    variant=""
                                    className="iconWidth"
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
            Header: () => <div className="header text-left ">Status</div>,
            accessor: 'status',

            Cell: ({ row }) => (
                <>
                    <div
                        className={`text-left ${row.original.status === 'Rejected'
                            ? 'text-red'
                            : row.original.status === 'Submitted'
                                ? ''
                                : 'text-green'
                            }`}
                    >
                        {row.original.status}
                    </div>
                </>
            )
        },
        {
            Header: () => <div className="header text-right ">Files</div>,
            accessor: 'actions',
            disableSortBy: true,
            Cell: ({ row }) => (
                <div className="text-right">
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
                                    <div className="  ">
                                        <PageHeader pageTitle="Authorize Expenses" />

                                        <div className="card-body">
                                            {!loading && (
                                                <div>
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between'
                                                        }}
                                                    >
                                                        <div
                                                            style={{ marginLeft: '40px', flex: 1 }}
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
                                                                        gap: '3.7rem'
                                                                    }}
                                                                >
                                                                    <label className="mb-3">
                                                                        Expense Id{' '}
                                                                    </label>

                                                                    <div
                                                                        style={{
                                                                            marginLeft: '18px',
                                                                            fontWeight: 'bold',
                                                                            color: '#197294'
                                                                        }}
                                                                    ></div>
                                                                    <span
                                                                        style={{
                                                                            marginLeft: '-3.8rem'
                                                                        }}
                                                                    >
                                                                        {expenseSheet.id}
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
                                                                        gap: '1rem'
                                                                    }}
                                                                >
                                                                    <label className="mb-3">
                                                                        Employee Name
                                                                    </label>

                                                                    <div
                                                                        style={{
                                                                            marginLeft: '25px',
                                                                            fontWeight: 'bold',
                                                                            color: '#197294'
                                                                        }}
                                                                    ></div>
                                                                    <span
                                                                        style={{
                                                                            marginLeft: '-1.3rem'
                                                                        }}
                                                                    >
                                                                        {' '}
                                                                        {expenseSheet.employeeName}
                                                                    </span>
                                                                </div>
                                                            </h6>
                                                            {currentStatus == 'Reimbursed' && (
                                                                <h6
                                                                    style={{
                                                                        fontFamily:
                                                                            "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                                                                    }}
                                                                >
                                                                    <div
                                                                        style={{
                                                                            display: 'flex',
                                                                            gap: '2.4rem'
                                                                        }}
                                                                    >
                                                                        {currentStatus ==
                                                                            'Reimbursed' && (
                                                                                <label className="mb-3">
                                                                                    Reimbursed By
                                                                                </label>
                                                                            )}
                                                                        <div
                                                                            style={{
                                                                                marginLeft: '31px'
                                                                            }}
                                                                        >
                                                                            {currentStatus === 'Reimbursed'
                                                                                ? expenseSheet.accountantName
                                                                                : null}
                                                                        </div>
                                                                    </div>
                                                                </h6>
                                                            )}
                                                            {(currentStatus == 'Rejected' ||
                                                                currentStatus ==
                                                                'Partially_Approved' ||
                                                                currentStatus == 'Reimbursed' ||
                                                                currentStatus == 'Approved') && (
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
                                                                            {(currentStatus ==
                                                                                'Rejected' ||
                                                                                currentStatus ==
                                                                                'Partially_Approved' ||
                                                                                currentStatus ==
                                                                                'Reimbursed' ||
                                                                                currentStatus ==
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
                                                                                {currentStatus ==
                                                                                    'Rejected' ||
                                                                                    currentStatus ==
                                                                                    'Partially_Approved' ||
                                                                                    currentStatus ==
                                                                                    'Reimbursed' ||
                                                                                    currentStatus ==
                                                                                    'Approved'
                                                                                    ? expenseSheet.managerName
                                                                                    : location.managerName}
                                                                            </div>
                                                                        </div>
                                                                    </h6>
                                                                )}{' '}
                                                            {currentStatus == 'Repudiated' && (
                                                                <h6
                                                                    style={{
                                                                        fontFamily:
                                                                            "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                                                                    }}
                                                                >
                                                                    <div
                                                                        style={{
                                                                            display: 'flex',
                                                                            gap: '2.4rem'
                                                                        }}
                                                                    >
                                                                        {currentStatus ==
                                                                            'Repudiated' && (
                                                                                <label className="mb-3">
                                                                                    Repudiated By
                                                                                </label>
                                                                            )}
                                                                        <div
                                                                            style={{
                                                                                marginLeft: '32px'
                                                                            }}
                                                                        >
                                                                            {currentStatus ===
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
                                                                        gap: '3.5rem'
                                                                    }}
                                                                >
                                                                    <label className="mb-3">
                                                                        Start Date{' '}
                                                                    </label>

                                                                    <div
                                                                        style={{
                                                                            marginLeft: '18px',
                                                                            fontWeight: 'bold',
                                                                            color: '#197294'
                                                                        }}
                                                                    ></div>
                                                                    <span
                                                                        style={{
                                                                            marginLeft: '-3.4rem'
                                                                        }}
                                                                    >
                                                                        {expenseSheet.fromDate}
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
                                                                        gap: '3.5rem'
                                                                    }}
                                                                >
                                                                    <label className="mb-3">
                                                                        End Date
                                                                    </label>

                                                                    <div
                                                                        style={{
                                                                            marginLeft: '18px',
                                                                            fontWeight: 'bold',
                                                                            color: '#197294'
                                                                        }}
                                                                    ></div>
                                                                    <span
                                                                        style={{
                                                                            marginLeft: '-2.7rem'
                                                                        }}
                                                                    >
                                                                        {expenseSheet.toDate}
                                                                    </span>
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
                                                                        style={{
                                                                            marginLeft: '67px',
                                                                            fontWeight: 'bold',
                                                                            color: '#197294'
                                                                        }}
                                                                    ></div>
                                                                    <div
                                                                        style={{
                                                                            marginLeft: '-20px'
                                                                        }}
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
                                                                    >
                                                                        {expenseSheet.status}
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
                                                                        gap: '2.65rem'
                                                                    }}
                                                                >
                                                                    <label className="mb-3">
                                                                        Location{' '}
                                                                    </label>
                                                                    <span
                                                                        style={{
                                                                            fontWeight: 'bold',
                                                                            color: '#197294',
                                                                            marginLeft: '18px'
                                                                        }}
                                                                    ></span>
                                                                    <div>
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
                                                                        Submitted Date
                                                                    </label>
                                                                    <span
                                                                        style={{
                                                                            fontWeight: 'bold',
                                                                            color: '#197294',
                                                                            marginLeft: '24px'
                                                                        }}
                                                                    ></span>
                                                                    <div>
                                                                        {expenseSheet.submittedDate}
                                                                    </div>
                                                                </div>
                                                            </h6>
                                                            {(location.status == 'Rejected' ||
                                                                location.status ==
                                                                'Partially_Approved' ||
                                                                location.status == 'Reimbursed' ||
                                                                location.status == 'Approved') && (
                                                                    <h6
                                                                        style={{
                                                                            fontFamily:
                                                                                "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                                                                        }}
                                                                    >
                                                                        <div
                                                                            style={{
                                                                                display: 'flex',
                                                                                gap: '2.3rem'
                                                                            }}
                                                                        >
                                                                            {(location.status ==
                                                                                'Rejected' ||
                                                                                location.status ==
                                                                                'Partially_Approved' ||
                                                                                location.status ==
                                                                                'Reimbursed' ||
                                                                                location.status ==
                                                                                'Approved') && (
                                                                                    <label className="mb-3">
                                                                                        Authorized Date
                                                                                    </label>
                                                                                )}
                                                                            <div
                                                                                style={{
                                                                                    marginLeft: '14px'
                                                                                }}
                                                                            >
                                                                                {location.approvedDate}
                                                                            </div>
                                                                        </div>
                                                                    </h6>
                                                                )}
                                                            {location.status == 'Reimbursed' && (
                                                                <h6
                                                                    style={{
                                                                        fontFamily:
                                                                            "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                                                                    }}
                                                                >
                                                                    <div
                                                                        style={{
                                                                            display: 'flex',
                                                                            gap: '2.0rem'
                                                                        }}
                                                                    >
                                                                        {location.status ==
                                                                            'Reimbursed' && (
                                                                                <label className="mb-3">
                                                                                    Reimbursed Date
                                                                                </label>
                                                                            )}
                                                                        <div
                                                                            style={{
                                                                                marginLeft: '14px'
                                                                            }}
                                                                        >
                                                                            {location.status ===
                                                                                'Reimbursed'
                                                                                ? expenseSheet.reimbursedDate
                                                                                : null}
                                                                        </div>
                                                                    </div>
                                                                </h6>
                                                            )}
                                                            {location.status == 'Repudiated' && (
                                                                <h6
                                                                    style={{
                                                                        fontFamily:
                                                                            "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                                                                    }}
                                                                >
                                                                    <div
                                                                        style={{
                                                                            display: 'flex',
                                                                            gap: '2.0rem'
                                                                        }}
                                                                    >
                                                                        {location.status ==
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
                                                                            {location.status ===
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
                                                                        gap: '6.7rem'
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
                                                                            overflowWrap:
                                                                                'break-word',
                                                                            maxWidth: '100%'
                                                                        }}
                                                                    >
                                                                        {
                                                                            expenseSheet.purposeOfExpense
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </h6>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {!loading && expenseSheet.status === 'Submitted' && (
                                                <div>
                                                    <h6>
                                                        <div
                                                            style={{
                                                                marginLeft: '10px',
                                                                color: 'red'
                                                            }}
                                                        >
                                                            {expenseSheet.status == 'Reimbursed' ? (
                                                                ''
                                                            ) : (
                                                                <>{displayMessages()}</>
                                                            )}

                                                            {remarkstate}
                                                        </div>
                                                    </h6>
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
                                                    pageSize="10"
                                                />
                                            )}
                                            {(expenseSheet.status == 'Reimbursed' ||
                                                expenseSheet.status == 'Repudiated') && (
                                                    <div className="row">
                                                        <div
                                                            className="col-sm-5"
                                                            style={{ marginLeft: '30px' }}
                                                        >
                                                            <label>Notes </label>
                                                            <Form.Control
                                                                as="textarea"
                                                                style={{
                                                                    width: '100%',
                                                                    height: '100px',
                                                                    maxHeight: '100px'
                                                                }}
                                                                name="description"
                                                                size="sm"
                                                                value={expenseSheet.description}
                                                                disabled={!expenseSheet.description}
                                                            />
                                                        </div>

                                                        <div className="col-sm-6">
                                                            <div
                                                                className="row"
                                                                style={{ marginLeft: '-100px' }}
                                                            >
                                                                <div className="col-sm-6 text-right">
                                                                    <label>Reference No </label>
                                                                </div>
                                                                <div className="col-sm-5">
                                                                    <Form.Control
                                                                        size="sm"
                                                                        type="text"
                                                                        name="referenceNo"
                                                                        value={expenseSheet.referenceNo}
                                                                        disabled={
                                                                            !expenseSheet.referenceNo
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            <div>
                                                <br />
                                                {expenseSheet.status != 'Submitted' ? (
                                                    <div style={{ marginLeft: '45%' }}>
                                                        <Button
                                                            className="Button"
                                                            variant="secondary"
                                                            onClick={() =>
                                                                navigate('/authorizeExpenseList')
                                                            }
                                                        >
                                                            {cancelButtonName}
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div >
                                                        {!loading && (
                                                            <div className="btnCenter mb-4">
                                                                <Button
                                                                    variant="addbtn"
                                                                    type="submit"
                                                                    className="Button"
                                                                    onClick={() =>
                                                                        remarkHandler('Approved')
                                                                    }
                                                                    disabled={
                                                                        hasAmountValidationMessages() ||
                                                                        isReimburseDisabled ||
                                                                        isBelowZeroDisabled ||
                                                                        expenseSheet.status ===
                                                                        'Approved' ||
                                                                        expenseSheet.status ===
                                                                        'Rejected' ||
                                                                        unChecked()
                                                                    }
                                                                >
                                                                    Approve
                                                                </Button>
                                                                <Button
                                                                    variant="addbtn"
                                                                    type="submit"
                                                                    className="Button"
                                                                    onClick={() =>
                                                                        repudiatedHandler(
                                                                            'Rejected'
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        hasAmountValidationMessages() ||
                                                                        isReimburseDisabled ||
                                                                        isBelowZeroDisabled ||
                                                                        expenseSheet.status ===
                                                                        'Approved' ||
                                                                        expenseSheet.status ===
                                                                        'Rejected' ||
                                                                        unChecked()
                                                                    }
                                                                >
                                                                    Reject
                                                                </Button>
                                                                <Button
                                                                    className="Button"
                                                                    variant="secondary"
                                                                    onClick={() =>
                                                                        navigate(
                                                                            '/authorizeExpenseList'
                                                                        )
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
                        </div>
                    </section>
                    <Modal show={showPopup} onHide={() => setShowPopup(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>Previous Approved Remarks</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {selectedRemarks.length > 0 ? (
                                <ul style={{ paddingLeft: '1.2rem' }}>
                                    {selectedRemarks.map((remark, index) => (
                                        <li key={index}>{remark}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No approved remarks found.</p>
                            )}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowPopup(false)}>
                                Close
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    <Modal show={view} onHide={onCloseHandler} backdrop="static" keyboard={false}>
                        <Modal.Header closeButton={onCloseHandler}>
                            <Modal.Title>Expense Remarks</Modal.Title>
                        </Modal.Header>
                        <Modal.Body></Modal.Body>
                    </Modal>

                    <Modal
                        show={authorizeRemarksView}
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

                        <Modal.Body></Modal.Body>
                    </Modal>

                    <Modal
                        show={viewEmployeeFiles}
                        onHide={onCloseHandler}
                        backdrop="static"
                        keyboard={false}
                    >
                        <Modal.Header closeButton={onCloseHandler}>
                            <Modal.Title>Employee Files</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form.Control
                                type="text"
                                style={{ width: '130px', textAlign: 'center' }}
                            />
                        </Modal.Body>
                    </Modal>
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
                        show={approve}
                        onHide={onCloseHandler}
                        backdrop="static"
                        keyboard={false}
                    >
                        <Modal.Header closeButton={onCloseHandler}>
                            <Modal.Title>Approve ?</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="modalBody">
                            Are you sure you want to Approve this item
                        </Modal.Body>
                        <div className="delbtn">
                            <Button
                                className="Button"
                                variant="addbtn"
                                onClick={() => saveHandler('Approved')}
                            >
                                Yes
                            </Button>
                            <Button className="Button" variant="secondary" onClick={onCloseHandler}>
                                No
                            </Button>
                        </div>
                    </Modal>
                    <Modal show={reject} onHide={onCloseHandler} backdrop="static" keyboard={false}>
                        <Modal.Header closeButton={onCloseHandler}>
                            <Modal.Title>Reject ?</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="modalBody">
                            Are you sure you want to Reject this item
                        </Modal.Body>
                        <div className="delbtn">
                            <Button
                                className="Button"
                                variant="addbtn"
                                onClick={() => saveHandler('Rejected')}
                            >
                                Yes
                            </Button>
                            <Button className="Button" variant="secondary" onClick={onCloseHandler}>
                                No
                            </Button>
                        </div>
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
export default AuthorizeExpense
