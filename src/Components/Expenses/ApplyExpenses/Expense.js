import { DatePicker } from 'antd'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import Select from 'react-select'
import { toast } from 'react-toastify'
import { formatCurrency } from '../../../Common/CommonComponents/CurrencyFormate'
import { commonCrudSuccess } from '../../../Common/CommonComponents/CustomizedSuccessToastMessages'
import DateFormate from '../../../Common/CommonComponents/DateFormate'
import FileViewer from '../../../Common/CommonComponents/FileViewer'
import Loader from '../../../Common/CommonComponents/Loader'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import { ToastError, ToastSuccess } from '../../../Common/CommonComponents/ToastCustomized'
import {
    AddIcon,
    CommentIcon,
    DeleteIcon,
    EditIcon,
    Pdf
} from '../../../Common/CommonIcons/CommonIcons'
import {
    getAllById,
    getById,

    SaveWithFile,
    UpdateWithFile
} from '../../../Common/Services/CommonService'
import Table from '../../../Common/Table/Table'
import { cancelButtonName } from '../../../Common/Utilities/Constants'
import { ROUTE_NAME } from '../../../reducers/constants'
import {
    compareArrayOfObjects,
    updateValidation
} from '../../../Common/CommonComponents/FormControlValidation'

const Expense = () => {
    // login user details
    const userDetails = useSelector((state) => state.user.userDetails)
    // State to manage global loading spinner
    const [loading, setLoading] = useState(false)

    // Holds the list of items (e.g., expenses or categories)
    const [itemList, setItemList] = useState([])

    // Stores the list of available currencies fetched from backend
    const [curriencies, setCurriencies] = useState()

    // Hook to programmatically navigate between routes
    const navigate = useNavigate()

    // Start date selected in the form/filter
    const [startDate, setStartDate] = useState(null)

    // Temporary date holder (can be reused in modals, filters, etc.)
    const [date, setDate] = useState(null)

    // Controls the visibility of modals/popups
    const [show, setShow] = useState(false)

    // Toggle to show/hide receipt upload section
    const [receipts, setReceipts] = useState(false)

    // End date selected in the form/filter
    const [endDate, setEndDate] = useState(null)

    // Stores form-level input like remarks
    const [formData, setFormData] = useState({ remarks: '' })

    // Stores expense sheet form data like purpose of expense
    const [sheetFormData, setSheetFormData] = useState({ purposeOfExpense: '' })

    // Controls visibility of a generic component (e.g., modal or overlay)
    const [visible, setVisible] = useState(false)

    // Holds selected bill files (File objects)
    const [bills, setBills] = useState([])

    // Holds file names of selected bills
    const [billsName, setBillsName] = useState([])

    // Holds array of selected files for upload
    const [selectFiles, setSelectFiles] = useState([])

    // Stores names of selected files for display purposes
    const [selectedFilesName, setSelectedFilesName] = useState([])

    // Stores validation errors for the entire form
    const [formErrors, setFormErrors] = useState({})

    // Selected expense type ID
    const [typeId, setTypeId] = useState()

    // Selected expense type name
    const [typeName, setTypeName] = useState('')

    // Selected currency ID
    const [currencyId, setCurrencyId] = useState()

    // Selected currency name
    const [currencyName, setCurrencyName] = useState()

    // Index of an item (used for editing or updating list items)
    const [indexs, setIndexS] = useState()

    // General data list used for dynamic rendering (e.g., dynamic rows)
    const [dataList, setDataList] = useState([])

    // Toggles comment input or section
    const [comment, setComment] = useState(false)

    // Toggles view mode for previewing or read-only
    const [view, setView] = useState(false)

    // Index for handling edit/view of a specific item
    const [index, setIndex] = useState(null)

    // Stores list of categories fetched by organization ID
    const [categoryList, setCategoryList] = useState([])

    // Selected category ID
    const [categoryId, setCategoryId] = useState('')

    // Selected category name
    const [categoryName, setCategoryName] = useState('')
    //Store the current mode: 'add', 'edit', 'view'
    const [mode, setMode] = useState('')

    // Specific loading state for button operations (save/update)
    const [isLoading, setIsLoading] = useState(false)
    // Tracks if the expenseSheet has been submitted
    const [submit, setSubmit] = useState()
    const [change, setChange] = useState(true)

    // Constants for file limits
    const MAX_FILES_PER_ITEM = 5
    const MAX_FILE_SIZE_PER_ITEM = 1 * 1024 * 1024 // 1MB in bytes

    const onCloseHandler = () => {
        setCategoryId(null)
        setCategoryName('')
        setTypeId(null)
        setTypeName('')
        setFormErrors({})
        setView(false)
        setShow(false)
        setSubmit(false)
        setComment(false)
        setReceipts(false)
    }

    const sheetData = useLocation().state

    const dispatch = useDispatch()
    useEffect(() => {
        dispatch({
            type: ROUTE_NAME,
            payload: '/expensesList'
        })
    }, [])
    useEffect(() => {
        if (sheetData == null) {
            setMode('add')
        } else {
            if (sheetData.status == 'Saved' || sheetData.status == 'Rejected') {
                setMode('edit')
                onGetDataHandler()
            } else {
                setMode('view')
                onGetDataHandler()
            }
        }
    }, [])

    const onStartDateHandler = (e) => {
        const newDate = moment(e).format('YYYY-MM-DD');
        setStartDate(newDate);
        setDataList(prev => ({ ...prev, fromDate: newDate })); // update dataList
    };

    const onEndDateHandler = (e) => {
        const newDate = moment(e).format('YYYY-MM-DD');
        setEndDate(newDate);
        setDataList(prev => ({ ...prev, toDate: newDate })); // update dataList
    };

    const handleComment = (e, action) => {
        setFormData(e)
        if (action == 'submit') {
            setVisible('submit')
        }
        if (action == 'approve') {
            setVisible('approve')
        }
        if (action == 'reimburse') {
            setVisible('reimburse')
        }
        setComment(true)
    }

    const handleView = (reciept, action) => {
        const newArray = reciept.map((obj) => ({
            file: obj.billUploads,
            fileType: obj.fileType,
            fileName: obj.fileName
        }))
        setBills(newArray)

        if (action == 'bills') {
            setReceipts(true)
        }
    }
    const [row, setRow] = useState('')
    // Function to handle showing the modal for creating or updating an expense item
    // One if is for creating new expense item, aftter filling the required fields(startDate, endDate, purposeOfExpense) 
    //Second if is for verifying enddate should not be before start date
    // If both conditions are met, it sets the view to true and fetches categories and currencies
    const handleShow = (action, row, index) => {
        setRow(row)
        setIndex(index)
        if (action == 'create') {
            if (startDate == null || endDate == null || sheetFormData.purposeOfExpense == '') {
                toast.error('Enter the required fields')
                setView(false)
            }
            else if (startDate && endDate && moment(startDate).isAfter(endDate)) {
                toast.error('Start date cannot be after end date')
                setView(false)

            } else {
                setView(true)
                setVisible('create')
                setFormData('')
                setDate(null)
                setCategoryName('')
                setTypeName('')
                setTypeId(null)
                onGetCategoryHandler()
                setCurrencyName('')
                setCurrencyId(null)
                setFormErrors('')
                setBills([])
                setBillsName([])
                onGetCurrencyHandler()
            }
        } else {
            setVisible('update')
            setCategoryId(row.categoryId)
            setCategoryName(row.categoryName)
            setTypeId(row.typeId)
            setTypeName(row.typeName)
            setDate(row.date)
            setFormData(row)
            setCurrencyName(row.currencyCode)
            setCurrencyId(row.currencyId)
            onGetCategoryHandler()
            setView(true)
            setFormErrors('')
            const existingReceipts = row.receipts.map(file => ({
                id: file.id,
                fileName: file.fileName || file.name,
                fileType: file.fileType || file.type,
                billUploads: file.billUploads || file
            }));


            setBills(existingReceipts);
            setBillsName(existingReceipts.map(file => file.fileName));
            setSelectedFilesName(existingReceipts.map(file => file.fileName));

            onGetCurrencyHandler()
        }
    }
    // New handler for bill file selection and validation
    const handleBillFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        if (newFiles.length === 0) return;

        const MAX_FILES_PER_ITEM = 5;
        const MAX_SIZE_PER_FILE = 1 * 1024 * 1024; // 1MB per file
        const MAX_TOTAL_SIZE_PER_ITEM = 1 * 1024 * 1024; // 1MB for all files combined

        // Existing files (actual File objects)
        const existingFiles = bills.filter(bill => bill.billUploads instanceof File);
        const existingFileNames = new Set([...billsName, ...selectedFilesName]);

        let currentTotalSize = existingFiles.reduce((sum, file) => sum + file.billUploads.size, 0);
        let totalSizeAfterAdding = currentTotalSize;
        let totalFilesAfterAdding = existingFiles.length;

        let validFiles = [];
        let invalidFiles = [];

        for (const file of newFiles) {
            if (file.size > MAX_SIZE_PER_FILE) {
                invalidFiles.push({ file, reason: 'size' });
            } else if (existingFileNames.has(file.name)) {
                invalidFiles.push({ file, reason: 'duplicate' });
            } else if (totalFilesAfterAdding + 1 > MAX_FILES_PER_ITEM) {
                invalidFiles.push({ file, reason: 'count' });
            } else if (totalSizeAfterAdding + file.size > MAX_TOTAL_SIZE_PER_ITEM) {
                invalidFiles.push({ file, reason: 'totalSize' });
            } else {
                validFiles.push(file);
                totalFilesAfterAdding += 1;
                totalSizeAfterAdding += file.size;
            }
        }

        // Handle errors
        const errors = {};
        const newFormErrors = { ...formErrors };
        let errorChanged = false;

        if (invalidFiles.some(f => f.reason === 'size')) {
            errors.size = 'Each file must be ≤ 1MB.';
        } else if (formErrors.size) {
            delete newFormErrors.size;
            errorChanged = true;
        }

        if (invalidFiles.some(f => f.reason === 'duplicate')) {
            errors.duplicates = 'Duplicate file names are not allowed.';
        } else if (formErrors.duplicates) {
            delete newFormErrors.duplicates;
            errorChanged = true;
        }

        if (invalidFiles.some(f => f.reason === 'count')) {
            errors.count = `Only ${MAX_FILES_PER_ITEM} files allowed per item.`;
        } else if (formErrors.count) {
            delete newFormErrors.count;
            errorChanged = true;
        }

        if (invalidFiles.some(f => f.reason === 'totalSize')) {
            errors.totalSize = 'Total size of all files in this item must not exceed 1MB.';
        } else if (formErrors.totalSize) {
            delete newFormErrors.totalSize;
            errorChanged = true;
        }

        // Show error toast if any invalids, but DON'T return
        if (Object.keys(errors).length > 0) {
            setFormErrors({ ...newFormErrors, ...errors });
            toast.error(Object.values(errors).join(' '));
        }

        // If previously there were errors but now fixed
        if (errorChanged) {
            setFormErrors(newFormErrors);
        }

        // ✅ Add valid files even if some invalids exist
        if (validFiles.length > 0) {
            const newFileObjects = validFiles.map(file => ({
                fileName: file.name,
                fileType: file.type,
                billUploads: file,
            }));

            const updatedBills = [...bills, ...newFileObjects];
            const updatedNames = updatedBills.map(file =>
                file.billUploads instanceof File ? file.fileName : file.name
            );

            setBills(updatedBills);
            setSelectFiles(prev => [...prev, ...validFiles]);
            setBillsName(updatedNames);
            setSelectedFilesName(updatedNames);
        }

        e.target.value = null;
    };


    // input handling
    const onChangeHandler = (e) => {
        const { name, value } = e.target

        let newValue = value

        // If the field is "submittedAmount", process it as a number
        if (name === 'submittedAmount') {
            let numericValue = parseFloat(value)

            if (isNaN(numericValue)) {
                numericValue = '' // Keep it empty instead of 0
            } else if (numericValue > 1000000) {
                numericValue = 1000000 // Enforce max limit
            }

            newValue = numericValue
        }

        setFormData({
            ...formData,
            [name]: newValue
        })

        setFormErrors({
            ...formErrors,
            [name]: value.trim() ? '' : 'Required'
        })
    }

    const onSheetChangeHandler = (e) => {
        const { name, value } = e.target
        setSheetFormData({
            ...sheetFormData,
            [name]: value.trimStart().replace(/\s+/g, ' ')
        })
        !e.target.value
            ? setFormErrors({ ...formErrors, [name]: 'Required' })
            : setFormErrors({ ...formErrors, [name]: '' })
    }

    const handleDateChange = (e) => {
        const selectedDate = moment(e).format('YYYY-MM-DD')
        setDate(selectedDate)
        setFormErrors({
            ...formErrors,
            date: !e ? 'Required' : ''
        })
    }

    const disabledDate = (current) => {
        if (!startDate || !endDate) {
            return false
        }
        if (current.isSame(startDate, 'day') || current.isSame(endDate, 'day')) {
            return false
        }

        return !current.isBetween(startDate, endDate, null, '[]')
    }

    const validate = (values) => {
        setIsLoading(false)
        const errors = {}
        if (!values.categoryName) {
            errors.categoryName = 'Required'
        }
        if (!values.date) {
            errors.date = 'Required'
        }
        if (!values.submittedAmount) {
            errors.submittedAmount = 'Required'
        }
        if (values.submittedAmount <= 0) {
            errors.submittedAmount = 'Below 0 is not allowed'
        }
        if (!values.purposeOfExpense) {
            errors.purposeOfExpense = 'Required'
        }
        if (!values.currencyId) {
            errors.currencyId = 'Required'
        }
        return errors
    }

    let billObjects = []

    const handleSubmit = () => {
        setSubmit(true)
    }
    const validateItem = (values) => {
        const errors = {}
        if (!values.categoryName) {
            errors.categoryName = 'Required'
        }
        if (!values.date) {
            errors.date = 'Required'
        }
        if (!values.submittedAmount) {
            errors.submittedAmount = 'Required'
        } else if (values.submittedAmount <= 0) {
            errors.submittedAmount = 'Below 0 and 0 is not allowed'
        }
        if (!values.currencyId) {
            errors.currencyId = 'Required'
        }
        return errors
    }



    // Handler to add a new expense item to the list
    const onAddHandler = (status) => {
        if (bills) {
            billObjects = bills
            // .map((bill) => ({
            //     fileName: bill.name,
            //     fileType: bill.type,
            //     billUploads: bill
            // }))
        }
        let addObj = {
            categoryName: categoryName,
            typeName: typeName,
            typeId: typeId,
            categoryId: categoryId,
            date: date,
            status: status,
            currencyId: currencyId,
            currencyCode: currencyName,
            submittedAmount: formData.submittedAmount,
            receipts: billObjects ? billObjects : null,
            remarks: formData.remarks
        }
        // Fixed issue on expense update isn't happening even if there is a change
        setChange(false)
        const itemErrors = validateItem(addObj)
        if (Object.keys(itemErrors).length > 0) {
            setFormErrors(itemErrors)
            return
        } else {
            // Re-validate just in case, though handleBillFileChange should catch most issues
            const currentItemFiles = bills.filter(bill => bill.billUploads instanceof File);
            const totalItemFileSize = currentItemFiles.reduce((acc, file) => acc + file.billUploads.size, 0);

            if (currentItemFiles.length > MAX_FILES_PER_ITEM) {
                toast.error(`Cannot add item: exceeds ${MAX_FILES_PER_ITEM} files per item.`);
                return;
            }
            if (totalItemFileSize > MAX_FILE_SIZE_PER_ITEM) {
                toast.error(`Cannot add item: total file size exceeds ${MAX_FILE_SIZE_PER_ITEM / (1024 * 1024)}MB per item.`);
                return;
            }


            setItemList([...itemList, addObj])
            onCloseHandler()
        }
    }

    // item object update handler
    const onUpdateHandler = (e) => {
        if (bills) {
            billObjects = bills.map((bill) => {
                const fileName =
                    bill.billUploads instanceof File
                        ? bill.fileName
                        : bill.id
                            ? bill.fileName
                            : bill.name

                const fileType =
                    bill.billUploads instanceof File
                        ? bill.fileType
                        : bill.id
                            ? bill.fileType
                            : bill.type

                const billUploads =
                    bill.billUploads instanceof File
                        ? bill.billUploads
                        : bill.id
                            ? bill.billUploads
                            : bill

                return {
                    id: bill.id,
                    fileName: fileName,
                    fileType: fileType,
                    billUploads: billUploads
                }
            })
        }

        // Build the updated item object
        const updatedItem = {
            ...itemList[index], // or row, depending on your logic
            // ...other fields...
            receipts: billObjects // <-- this should now include all files
            // ...other fields...
        }

        // Update the itemList with the updated item at the correct index
        const updatedItemList = [...itemList]
        updatedItemList[index] = updatedItem
        setItemList(updatedItemList)

        const updateItemObj = {
            id: formData && formData.id,
            categoryName: categoryName,
            categoryId: categoryId,
            typeName: typeName,
            typeId: typeId,
            currencyId: currencyId,
            currencyCode: currencyName,
            date: date,
            status: e,
            submittedAmount: formData.submittedAmount,
            receipts: billObjects ? billObjects : null,
            remarks: formData.remarks
        }
        if (
            updateValidation(row, formData) &&
            row.categoryName == categoryName &&
            row.typeName == typeName &&
            row.date == date &&
            row.currencyCode == currencyName &&
            row.receipts.length != 0
        ) {
            setChange(true)
            onCloseHandler()
        } else if (!updateItemObj.categoryName) {
            setFormErrors(validate(updateItemObj))
        } else if (!updateItemObj.date) {
            setFormErrors(validate(updateItemObj))
        } else if (!updateItemObj.submittedAmount) {
            setFormErrors(validate(updateItemObj))
        } else if (updateItemObj.submittedAmount < 0) {
            setFormErrors(validate(updateItemObj))
        } else if (!updateItemObj.currencyCode) {
            setFormErrors(validate(updateItemObj))
        } else {
            // Re-validate just in case, though handleBillFileChange should catch most issues
            const currentItemFiles = bills.filter(bill => bill.billUploads instanceof File);
            const totalItemFileSize = currentItemFiles.reduce((acc, file) => acc + file.billUploads.size, 0);

            if (currentItemFiles.length > MAX_FILES_PER_ITEM) {
                toast.error(`Cannot update item: exceeds ${MAX_FILES_PER_ITEM} files per item.`);
                return;
            }
            if (totalItemFileSize > MAX_FILE_SIZE_PER_ITEM) {
                toast.error(`Cannot update item: total file size exceeds ${MAX_FILE_SIZE_PER_ITEM / (1024 * 1024)}MB per item.`);
                return;
            }

            const updatedItemList = [...itemList];
            updatedItemList[index] = updateItemObj;
            setItemList(updatedItemList);

            setChange(false)
            onCloseHandler()
        }
    }

    // API handler to fetch expense categories by organization ID
    const onGetCategoryHandler = () => {
        getAllById({
            entity: 'expensecategories',
            organizationId: userDetails.organizationId
        })
            .then((res) => {
                setLoading(false)
                if (res.statusCode == 200) {
                    setCategoryList(res.data)
                }
            })
            .catch((err) => {
                console.log(err, 'error')
            })
    }

    const categoryOptions = categoryList
        ? categoryList.map((option) => ({
            value: option.id,
            label: option.name
        }))
        : []

    const onCategoryChangeHandler = (option) => {
        setFormErrors({
            ...formErrors,
            categoryName: !option ? 'Required' : ''
        })
        setCategoryId(option.value)
        setCategoryName(option.label)
        setTypeId(null)
        setTypeName('')
    }

    const typeFilter = categoryList.filter((e) => {
        if (e.id == categoryId) {
            return e
        }
    })

    const optionsForType = typeFilter.map((e) => e.typeDTOs)
    // api handling for get Type by categoryid
    const options = optionsForType[0]

    const typeOptions = options
        ? options.map((options) => ({
            value: options.id,
            label: options.name
        }))
        : []

    const handleTypeSelection = (option) => {
        setTypeId(option.value)
        setTypeName(option.label)
    }

    // API handler to fetch all currencies by organization ID
    const onGetCurrencyHandler = () => {
        getAllById({
            entity: 'currencies',
            organizationId: userDetails.organizationId
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setCurriencies(res.data)
                }
            })
            .catch((err) => {
                console.log(err, 'error')
            })
    }
    const currenciesOptions = curriencies
        ? curriencies.map((option) => ({
            value: option.id,
            label: option.currencyCode
        }))
        : []

    const handleCurrencySelection = (option) => {
        setFormErrors({
            ...formErrors,
            currencyId: !option ? 'Required' : '' // #1773: replaced currenecyName with currencyId
        })
        setCurrencyId(option.value)
        setCurrencyName(option.label)
    }

    const handleRemove = (index) => {
        setShow(true)
        setIndexS(index)
    }

    const deleteBills = (index, element) => {
        const updatedBills = [...bills]
        updatedBills.splice(index, 1)
        const updatedSelectedFiles = selectFiles.filter((file) => file.name !== element)

        const nameArray = updatedBills.map((file) => {
            const fileName =
                file.billUploads instanceof File
                    ? file.fileName
                    : file.id
                        ? file.fileName
                        : file.name

            return fileName
        })

        setBills(updatedBills)
        setBillsName(nameArray)
        setSelectFiles(updatedSelectedFiles)
        setSelectedFilesName(nameArray)
        const fileInput = document.getElementById('fileInput')
        fileInput.value = null
    }

    // Handler to delete an expense item from the list based on the selected index
    const proceedDeleteHandler = (e) => {
        e.preventDefault()
        const rows = [...itemList]
        rows.splice(indexs, 1)
        setItemList(rows)
        setShow(false)
    }
    const currentDate = new Date()
    const submittedDate = currentDate

    // Save Api
    const proceedSaveHandler = (status) => {
        const modifiedItemList = itemList.map((item) => ({
            ...item,
            receipts: item.receipts.map((receipt) => ({
                ...receipt,
                billUploads: receipt.id ? receipt.billUploads : null
            }))
        }))

        // 🔹 Check total file size before saving
        const MAX_TOTAL_SIZE = 10 * 1024 * 1024 // 10MB
        let totalSize = 0

        modifiedItemList.forEach((item) => {
            item.receipts.forEach((receipt) => {
                if (receipt.billUploads instanceof File) {
                    totalSize += receipt.billUploads.size
                }
            })
        })

        if (selectFiles) {
            selectFiles.forEach((file) => {
                totalSize += file.size
            })
        }

        if (totalSize > MAX_TOTAL_SIZE) {
            toast.error('Total file size exceeds 10MB. Submission not allowed.')
            return
        }

        const saveObj = {
            id: dataList && dataList.id,
            fromDate: startDate,
            toDate: endDate,
            status: status.obj,
            purposeOfExpense: sheetFormData.purposeOfExpense,
            submittedDate: moment(submittedDate).format('YYYY-MM-DD'),
            employeeId: userDetails.employeeId,
            organizationId: userDetails.organizationId,
            locationId: userDetails.locationId,
            items: modifiedItemList
        }

        if (!saveObj.purposeOfExpense) {
            setFormErrors(validate(saveObj))
        } else {
            setIsLoading(true)
            let form = new FormData()
            form.append('expenseSheet', JSON.stringify(saveObj))
            selectFiles &&
                selectFiles.forEach((file) => {
                    form.append('file', file)
                })

            SaveWithFile({
                entity: 'expensesheets',
                organizationId: userDetails.organizationId,
                body: form,
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Expensesheets',
                    operationType: status.method
                })
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        ToastSuccess(res.message)
                        setFormErrors({})
                        onCloseHandler()
                        navigate('/expensesList')
                    }
                    setLoading(false)
                })
                .catch((err) => {
                    setIsLoading(false)
                    console.log(err, 'error')
                    ToastError(err.message)
                })
        }
    }

    // Update Api
    const proceedUpdateHandler = (status) => {
        const modifiedItemList = itemList.map((item) => ({
            ...item,
            receipts: item.receipts.map((receipt) => ({
                ...receipt,
                billUploads: receipt.id ? receipt.billUploads : null
            }))
        }))

        // 🔹 Check total file size before updating
        const MAX_TOTAL_SIZE = 10 * 1024 * 1024 // 10MB
        let totalSize = 0

        modifiedItemList.forEach((item) => {
            item.receipts.forEach((receipt) => {
                if (receipt.billUploads instanceof File) {
                    totalSize += receipt.billUploads.size
                }
            })
        })

        if (selectFiles) {
            selectFiles.forEach((file) => {
                totalSize += file.size
            })
        }

        if (totalSize > MAX_TOTAL_SIZE) {
            toast.error('Total file size exceeds 10MB. Submission not allowed.')
            return
        }

        const saveObj = {
            id: dataList && dataList.id,
            fromDate: startDate,
            toDate: endDate,
            status: status.obj,
            purposeOfExpense: sheetFormData.purposeOfExpense,
            submittedDate: moment(submittedDate).format('YYYY-MM-DD'),
            employeeId: userDetails.employeeId,
            organizationId: userDetails.organizationId,
            locationId: userDetails.locationId,
            items: modifiedItemList
        }


        if (!saveObj.purposeOfExpense) {
            setFormErrors(validate(saveObj))
        } else if (
            updateValidation(dataList, sheetFormData) &&
            change &&
            status.obj == 'Saved' && // #1763: validating by status also
            dataList.items.length == modifiedItemList.length &&
            compareArrayOfObjects(dataList.items, modifiedItemList) &&
            change
            // ){
        ) {
            toast.info('No changes made to update.')
        } else {
            setIsLoading(true)
            let form = new FormData()
            form.append('expenseSheet', JSON.stringify(saveObj))
            selectFiles &&
                selectFiles.forEach((file) => {
                    form.append('file', file)
                })

            UpdateWithFile({
                entity: 'expensesheets',
                organizationId: userDetails.organizationId,
                id: sheetData.id,
                body: form,
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Expensesheets',
                    operationType: status.method
                })
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        ToastSuccess(res.message)
                        navigate('/expensesList')
                    }
                    setLoading(false)
                })
                .catch((err) => {
                    setIsLoading(false)
                    console.log(err, 'error')
                    ToastError(err.message)
                })
        }
        onCloseHandler()
    }

    // Get sheet by sheetId
    const onGetDataHandler = () => {
        setIsLoading(true)
        getById({
            entity: 'expensesheets',
            organizationId: userDetails.organizationId,
            id: sheetData.id
        })
            .then((res) => {
                setLoading(false)
                if (res.statusCode == 200) {
                    setIsLoading(false)
                    setDataList(res.data)
                    setStartDate(res.data.fromDate)
                    setEndDate(res.data.toDate)
                    setItemList(res.data.items)
                    setSheetFormData(res.data)
                    // 🔑 Reset mode after fetching fresh data
                    if (res.data.status === 'Saved' || res.data.status === 'Rejected') {
                        setMode('edit')
                    } else {
                        setMode('view')
                    }
                } else {
                    setDataList([])
                }
            })
            .catch((err) => {
                setIsLoading(false)
                console.log(err, 'error')
            })
    }

    // table colums for table
    const COLUMNSEDIT = [
        {
            Header: 'S.No',
            accessor: '',
            width: '40%',
            Cell: ({ row }) => (
                <>
                    <div className="text-wrap text-right tableDataSerialNumber">
                        {row.index + 1}
                    </div>
                </>
            )
        },
        {
            Header: 'Date',
            accessor: 'date',
            Cell: ({ row }) => (
                <div className="text-left">{<DateFormate date={row.original.date} />}</div>
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
            Header: () => <div className=" header text-right "> Applied </div>,
            accessor: 'submittedAmount',
            Cell: ({ row }) => (
                <>
                    <div className="text-right" style={{ marginRight: '4px' }}>
                        {row.original.submittedAmount || row.original.submittedAmount == 0
                            ? formatCurrency(
                                row.original.submittedAmount,
                                row.original.currencyCode
                            )
                            : '---'}
                    </div>
                </>
            )
        },
        {
            Header: () => <div className="text-left "></div>,
            accessor: 'remarks',
            Cell: ({ row }) => (
                <>
                    <div>
                        {row.original.remarks ? (
                            <Button
                                type="button"
                                variant=""
                                className="iconWidth"
                                onClick={() => handleComment(row.original, 'submit')}
                            >
                                <CommentIcon />
                            </Button>
                        ) : null}
                    </div>
                </>
            )
        },
        {
            Header: () => <div className="header text-right ">Approved </div>,
            accessor: 'approvedAmount',
            Cell: ({ row }) => (
                <>
                    <div
                        style={{
                            textAlign:
                                row.original.approvedAmount || row.original.approvedAmount === 0
                                    ? 'right'
                                    : 'center'
                        }}
                    >
                        {row.original.approvedAmount || row.original.approvedAmount == 0
                            ? formatCurrency(row.original.approvedAmount, row.original.currencyCode)
                            : '---'}
                    </div>
                </>
            )
        },
        {
            Header: () => <div className="text-left"></div>,
            accessor: 'approvedRemarks',
            Cell: ({ row }) => (
                <>
                    <div>
                        {row.original.approvedRemarks ? (
                            <Button
                                type="button"
                                variant=""
                                className="iconWidth"
                                onClick={() => handleComment(row.original, 'approve')}
                            >
                                <CommentIcon />
                            </Button>
                        ) : null}
                    </div>
                </>
            )
        },
        {
            Header: () => <div className="header text-right ">Reimbursed </div>,
            accessor: 'reimbursedAmount',
            Cell: ({ row }) => (
                <>
                    <div
                        style={{
                            textAlign:
                                row.original.reimbursedAmount || row.original.reimbursedAmount === 0
                                    ? 'right'
                                    : 'center'
                        }}
                    >
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
            Header: () => <div className="text-left"></div>,
            accessor: 'reimbursedRemarks',
            Cell: ({ row }) => (
                <>
                    <div>
                        {row.original.reimbursedRemarks ? (
                            <Button
                                type="button"
                                variant=""
                                className="iconWidth"
                                // size="sm"
                                onClick={() => handleComment(row.original, 'reimburse')}
                            >
                                <CommentIcon />
                            </Button>
                        ) : null}
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
                            : row.original.status === 'Submitted' ||
                                row.original.status === 'Saved'
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
            Header: 'Receipts',
            accessor: 'receipts',
            Cell: ({ row }) => (
                <>
                    <div className="text-left">
                        {row.original.receipts.length > 0 && (
                            <Button
                                type="button"
                                variant=""
                                className="iconWidth"
                                onClick={() => handleView(row.original.receipts, 'bills')}
                            >
                                <Pdf />
                            </Button>
                        )}
                    </div>
                </>
            )
        },
        {
            Header: () =>
                mode !== 'view' && <div className="text-wrap text-right actions">Actions</div>,
            accessor: 'actions',
            disableSortBy: true,
            width: '40%',
            Cell: ({ row }) => (
                <>
                    {mode !== 'view' && (
                        <div className="text-right actionsWidth">
                            <Button
                                type="button"
                                variant=""
                                className="iconWidth"
                                disabled={
                                    (row.original.status != 'Saved' &&
                                        row.original.status != 'Rejected') ||
                                    mode == 'view'
                                }
                                onClick={() => handleShow('update', row.original, row.index)}
                            >
                                <EditIcon />
                            </Button>
                            |
                            <Button
                                type="button"
                                disabled={
                                    (row.original.status != 'Saved' &&
                                        dataList.status != 'Rejected') ||
                                    itemList.length === 1
                                }
                                variant=""
                                className="iconWidth"
                                onClick={() => handleRemove(row.index)}
                            >
                                <DeleteIcon />
                            </Button>
                        </div>
                    )}
                </>
            )
        }
    ]
    const COLUMNSADD = [
        {
            Header: 'S.No',
            accessor: '',
            width: '40%',
            Cell: ({ row }) => (
                <>
                    <div className="text-wrap text-right tableDataSerialNumber">
                        {row.index + 1}
                    </div>
                </>
            )
        },
        {
            Header: 'Date',
            accessor: 'date',
            Cell: ({ row }) => (
                <div className="text-left">{<DateFormate date={row.original.date} />}</div>
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
            Header: () => <div className="text-wrap text-right actions">Applied</div>,
            accessor: 'submittedAmount',
            Cell: ({ row }) => (
                <>
                    <div className="text-right">
                        {row.original.submittedAmount || row.original.submittedAmount == 0
                            ? formatCurrency(
                                row.original.submittedAmount,
                                row.original.currencyCode
                            )
                            : '---'}
                    </div>
                </>
            )
        },
        {
            Header: () => <div className="text-left "></div>,
            accessor: 'remarks',
            Cell: ({ row }) => (
                <>
                    <div>
                        {row.original.remarks ? (
                            <Button
                                type="button"
                                variant=""
                                className="iconWidth"
                                // size="sm"
                                onClick={() => handleComment(row.original, 'submit')}
                            >
                                <CommentIcon />
                            </Button>
                        ) : null}
                    </div>
                </>
            )
        },
        {
            Header: () => <div className="text-wrap text-right actions">Receipts</div>,
            accessor: 'receipts',
            Cell: ({ row }) => (
                <>
                    <div className="text-right" style={{ paddingRight: '25px' }}>
                        {row.original.receipts.length > 0 && (
                            <Button
                                type="button"
                                variant=""
                                className="iconWidth"
                                onClick={() => handleView(row.original.receipts, 'bills')}
                            >
                                <Pdf />
                            </Button>
                        )}
                    </div>
                </>
            )
        },
        {
            Header: () => <div className="text-wrap text-right actions">Actions</div>,
            accessor: 'actions',
            disableSortBy: true,
            width: '40%',
            Cell: ({ row }) => (
                <>
                    <div className="text-right actionsWidth">
                        <Button
                            type="button"
                            variant=""
                            className="iconWidth"
                            onClick={() => handleShow('update', row.original, row.index)}
                        >
                            <EditIcon />
                        </Button>
                        |
                        <Button
                            type="button"
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

    return (
        <>
            {isLoading ? <DetailLoader /> : ''}
            <section className="section detailBackground">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="">
                                {mode == 'add' && <PageHeader pageTitle={'Add Expenses'} />}
                                {mode == 'edit' && <PageHeader pageTitle={'Edit Expenses'} />}
                                {mode == 'view' && <PageHeader pageTitle={'View Expenses'} />}
                                <div className="table">
                                    {!loading && (
                                        <div
                                            class="row filterForm"
                                            style={{ marginLeft: '4px', paddingBottom: '20PX' }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between'
                                                }}
                                            >
                                                <div style={{ marginLeft: '40px', flex: 1 }}>
                                                    {mode != 'add' && (
                                                        <>
                                                            <h6
                                                                style={{
                                                                    fontFamily:
                                                                        "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                                                                    ...(mode !== 'view' && {})
                                                                }}
                                                            >
                                                                <div
                                                                    style={{
                                                                        display: 'flex',
                                                                        gap: '1.8rem'
                                                                    }}
                                                                >
                                                                    <label className="mb-2">
                                                                        Expense Id{' '}
                                                                    </label>

                                                                    <div
                                                                        style={{
                                                                            marginLeft: '1.3rem'
                                                                        }}
                                                                    >
                                                                        {dataList.id}
                                                                    </div>
                                                                </div>
                                                            </h6>
                                                            {dataList.status == 'Saved' && (
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
                                                                        <div
                                                                            style={{
                                                                                color: '#197294',
                                                                                fontWeight: 'bold'
                                                                            }}
                                                                        >
                                                                            <label className="mb-2">
                                                                                {' '}
                                                                                Saved Date
                                                                            </label>
                                                                        </div>
                                                                        <span
                                                                            style={{
                                                                                marginLeft: '9px',
                                                                                color: '#197294',
                                                                                fontWeight: 'bold'
                                                                            }}
                                                                        ></span>
                                                                        <div
                                                                            style={{
                                                                                marginLeft:
                                                                                    '-2.5rem'
                                                                            }}
                                                                        >
                                                                            {dataList.submittedDate}
                                                                        </div>
                                                                    </div>
                                                                </h6>
                                                            )}

                                                            {dataList.status == 'Reimbursed' && (
                                                                <h6
                                                                    style={{
                                                                        fontFamily:
                                                                            "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                                                                    }}
                                                                >
                                                                    <div
                                                                        style={{
                                                                            display: 'flex',
                                                                            gap: '0.9rem'
                                                                        }}
                                                                    >
                                                                        {dataList.status ==
                                                                            'Reimbursed' && (
                                                                                <label>
                                                                                    Reimbursed By{' '}
                                                                                </label>
                                                                            )}

                                                                        <div
                                                                            style={{
                                                                                marginLeft: '1.6rem'
                                                                            }}
                                                                        >
                                                                            {dataList.status ===
                                                                                'Reimbursed'
                                                                                ? dataList.accountantName
                                                                                : null}
                                                                        </div>
                                                                    </div>
                                                                </h6>
                                                            )}
                                                            {(dataList.status == 'Rejected' ||
                                                                dataList.status ==
                                                                'Partially_Approved' ||
                                                                dataList.status == 'Reimbursed' ||
                                                                dataList.status == 'Approved') && (
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
                                                                            {(dataList.status ==
                                                                                'Rejected' ||
                                                                                dataList.status ==
                                                                                'Partially_Approved' ||
                                                                                dataList.status ==
                                                                                'Reimbursed' ||
                                                                                dataList.status ==
                                                                                'Approved') && (
                                                                                    <label className="mb-2">
                                                                                        Authorized By
                                                                                    </label>
                                                                                )}

                                                                            <div
                                                                                style={{
                                                                                    marginLeft: '0.5rem'
                                                                                }}
                                                                            >
                                                                                {dataList.managerName}
                                                                            </div>
                                                                        </div>
                                                                    </h6>
                                                                )}
                                                            {dataList.status == 'Repudiated' && (
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
                                                                        {dataList.status ==
                                                                            'Repudiated' && (
                                                                                <label className="mb-2">
                                                                                    Repudiated By
                                                                                </label>
                                                                            )}

                                                                        <div
                                                                            style={{
                                                                                marginLeft: '0.5rem'
                                                                            }}
                                                                        >
                                                                            {dataList.status ===
                                                                                'Repudiated'
                                                                                ? dataList.accountantName
                                                                                : null}
                                                                        </div>
                                                                    </div>
                                                                </h6>
                                                            )}
                                                        </>
                                                    )}
                                                    <h6>
                                                        <Form.Group
                                                            as={Row}
                                                            className="mb-3"
                                                            controlId="formGroupToDate"
                                                        >
                                                            <Form.Label
                                                                column
                                                                md={4}
                                                                style={{
                                                                    fontFamily:
                                                                        "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                                                                    paddingRight: '1px',
                                                                    marginTop: startDate
                                                                        ? '-10px'
                                                                        : '0px'
                                                                }}
                                                            >
                                                                Start Date{' '}
                                                                <span className="error">*</span>
                                                            </Form.Label>
                                                            {mode != 'view' ? (
                                                                <Col md={6}>
                                                                    <DatePicker
                                                                        style={{
                                                                            marginLeft: '-6.5rem'
                                                                        }}
                                                                        className="datepicker"
                                                                        placeholder=""
                                                                        inputReadOnly={true}
                                                                        format={'DD-MM-YYYY'}
                                                                        clearIcon={false}
                                                                        onChange={(e) =>
                                                                            onStartDateHandler(e)
                                                                        }
                                                                        name="startDate"
                                                                        disabled={
                                                                            dataList.status ==
                                                                            'Submitted'
                                                                        }
                                                                        value={
                                                                            startDate == null
                                                                                ? null
                                                                                : moment(startDate)
                                                                        }
                                                                        disabledDate={(current) => {
                                                                            const first = moment(
                                                                                userDetails.dateOfJoining,
                                                                                'YYYY-MM-DD'
                                                                            )
                                                                            const today = moment()
                                                                            return (
                                                                                current < first ||
                                                                                current > today
                                                                            )
                                                                        }}
                                                                    />
                                                                </Col>
                                                            ) : (
                                                                <Col md={6}>
                                                                    <Form.Control
                                                                        style={{
                                                                            fontSize: '12px',
                                                                            border: 'none',
                                                                            marginLeft: '-6.5rem',
                                                                            marginTop: '-10px'
                                                                        }}
                                                                        value={moment(
                                                                            startDate
                                                                        ).format('YYYY-MM-DD')}
                                                                    />
                                                                </Col>
                                                            )}
                                                        </Form.Group>
                                                    </h6>
                                                    <h6 style={{ marginTop: '-15px' }}>
                                                        <Form.Group
                                                            as={Row}
                                                            className="mb-0"
                                                            controlId="formGroupToDate"
                                                        >
                                                            <Form.Label
                                                                column
                                                                md={4}
                                                                style={{
                                                                    fontFamily:
                                                                        "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                                                                    paddingRight: '0px',
                                                                    marginTop: endDate
                                                                        ? '-7px'
                                                                        : '0px'
                                                                }}
                                                            >
                                                                End Date{' '}
                                                                <span className="error">*</span>
                                                            </Form.Label>
                                                            {mode != 'view' ? (
                                                                <Col md={6}>
                                                                    <DatePicker
                                                                        placeholder=""
                                                                        inputReadOnly={true}
                                                                        name="endDate"
                                                                        style={{
                                                                            marginLeft: '-6.5rem'
                                                                        }}
                                                                        onChange={(e) =>
                                                                            onEndDateHandler(e)
                                                                        }
                                                                        format={'DD-MM-YYYY'}
                                                                        clearIcon={false}
                                                                        value={
                                                                            endDate == null
                                                                                ? null
                                                                                : moment(endDate)
                                                                        }
                                                                        disabled={
                                                                            startDate == null ||
                                                                            mode == 'view'
                                                                        }
                                                                        disabledDate={(current) => {
                                                                            const first = moment(
                                                                                startDate,
                                                                                'YYYY-MM-DD'
                                                                            )
                                                                            const today = moment()
                                                                            return (
                                                                                current < first ||
                                                                                current > today
                                                                            )
                                                                        }}
                                                                    />
                                                                </Col>
                                                            ) : (
                                                                <Col md={6}>
                                                                    <Form.Control
                                                                        style={{
                                                                            fontSize: '12px',
                                                                            border: 'none',
                                                                            marginLeft: '-6.5rem',
                                                                            marginTop: '-7px'
                                                                        }}
                                                                        value={moment(
                                                                            endDate
                                                                        ).format('YYYY-MM-DD')}
                                                                    />
                                                                </Col>
                                                            )}
                                                        </Form.Group>
                                                    </h6>
                                                </div>
                                                <div style={{ alignContent: 'flex-end', flex: 1 }}>
                                                    {mode != 'add' && (
                                                        <>
                                                            <h6
                                                                style={{
                                                                    fontFamily:
                                                                        "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                                                                }}
                                                            >
                                                                <div
                                                                    style={{
                                                                        display: 'flex',
                                                                        gap: '2.7rem'
                                                                    }}
                                                                >
                                                                    <label className="mb-2">
                                                                        Status{' '}
                                                                    </label>
                                                                    <span
                                                                        style={{
                                                                            fontWeight: 'bold',
                                                                            color: '#197294',
                                                                            marginLeft: '83px'
                                                                        }}
                                                                    ></span>{' '}
                                                                    <span
                                                                        className={
                                                                            dataList.status ===
                                                                                'Rejected' ||
                                                                                dataList.status ===
                                                                                'Repudiated'
                                                                                ? 'text-red'
                                                                                : dataList.status ===
                                                                                    'Submitted' ||
                                                                                    dataList.status ===
                                                                                    'Saved'
                                                                                    ? ''
                                                                                    : 'text-green'
                                                                        }
                                                                        style={{
                                                                            marginLeft: '-43px'
                                                                        }}
                                                                    >
                                                                        {dataList.status}
                                                                    </span>
                                                                </div>
                                                            </h6>

                                                            {(dataList.status == 'Rejected' ||
                                                                dataList.status ==
                                                                'Partially_Approved' ||
                                                                dataList.status == 'Reimbursed' ||
                                                                dataList.status == 'Approved') && (
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
                                                                            {(dataList.status ==
                                                                                'Rejected' ||
                                                                                dataList.status ==
                                                                                'Partially_Approved' ||
                                                                                dataList.status ==
                                                                                'Reimbursed' ||
                                                                                dataList.status ==
                                                                                'Approved') && (
                                                                                    <label>
                                                                                        Authorized Date{' '}
                                                                                    </label>
                                                                                )}
                                                                            <span
                                                                                style={{
                                                                                    marginLeft: '27px'
                                                                                }}
                                                                            ></span>
                                                                            <div
                                                                                style={{
                                                                                    marginLeft: '1.1rem'
                                                                                }}
                                                                            >
                                                                                {dataList.approvedDate}
                                                                            </div>
                                                                        </div>
                                                                    </h6>
                                                                )}
                                                            {dataList.status == 'Reimbursed' && (
                                                                <h6
                                                                    style={{
                                                                        fontFamily:
                                                                            "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                                                                    }}
                                                                >
                                                                    <div
                                                                        style={{
                                                                            display: 'flex',
                                                                            gap: '0.1rem'
                                                                        }}
                                                                    >
                                                                        {dataList.status ==
                                                                            'Reimbursed' && (
                                                                                <label className="mb-2">
                                                                                    Reimbursed Date
                                                                                </label>
                                                                            )}
                                                                        <span
                                                                            style={{
                                                                                marginLeft: '20px'
                                                                            }}
                                                                        ></span>
                                                                        <div
                                                                            style={{
                                                                                marginLeft: '1.6rem'
                                                                            }}
                                                                        >
                                                                            {dataList.status ===
                                                                                'Reimbursed'
                                                                                ? dataList.reimbursedDate
                                                                                : null}
                                                                        </div>
                                                                    </div>
                                                                </h6>
                                                            )}
                                                            {dataList.status == 'Repudiated' && (
                                                                <h6
                                                                    style={{
                                                                        fontFamily:
                                                                            "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                                                                    }}
                                                                >
                                                                    <div
                                                                        style={{
                                                                            display: 'flex',
                                                                            gap: '0.3rem',
                                                                            paddingBottom: '10px'
                                                                        }}
                                                                    >
                                                                        {dataList.status ==
                                                                            'Repudiated' && (
                                                                                <div
                                                                                    style={{
                                                                                        fontWeight:
                                                                                            'bold',
                                                                                        color: '#004aad'
                                                                                    }}
                                                                                >
                                                                                    Repudiated Date
                                                                                </div>
                                                                            )}
                                                                        <span
                                                                            style={{
                                                                                marginLeft: '24px'
                                                                            }}
                                                                        ></span>
                                                                        <div
                                                                            style={{
                                                                                marginLeft: '1.5rem'
                                                                            }}
                                                                        >
                                                                            {dataList.status ===
                                                                                'Repudiated'
                                                                                ? dataList.reimbursedDate
                                                                                : null}
                                                                        </div>
                                                                    </div>
                                                                </h6>
                                                            )}

                                                            {dataList.status != 'Saved' && (
                                                                <h6
                                                                    style={{
                                                                        fontFamily:
                                                                            "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                                                                    }}
                                                                >
                                                                    <div
                                                                        style={{
                                                                            display: 'flex',
                                                                            gap: '2.6rem'
                                                                        }}
                                                                    >
                                                                        <div
                                                                            style={{
                                                                                fontWeight: 'bold',
                                                                                color: '#197294'
                                                                            }}
                                                                        >
                                                                            <label className="mb-2">
                                                                                Submitted Date
                                                                            </label>
                                                                        </div>
                                                                        <span
                                                                            style={{
                                                                                marginLeft: '2%',
                                                                                color: '#197294',
                                                                                fontWeight: 'bold'
                                                                            }}
                                                                        ></span>
                                                                        <div
                                                                            style={{
                                                                                marginLeft: '-30px'
                                                                            }}
                                                                        >
                                                                            {dataList.submittedDate}
                                                                        </div>
                                                                    </div>
                                                                </h6>
                                                            )}
                                                        </>
                                                    )}
                                                    <h6>
                                                        <Form.Group
                                                            as={Row}
                                                            className="mb-0"
                                                            controlId="formGroupBranch"
                                                        >
                                                            <Form.Label
                                                                column
                                                                md={4}
                                                                style={{ marginTop: '-10px' }}
                                                            >
                                                                Purpose{' '}
                                                                <span className="error">*</span>
                                                                <span
                                                                    style={{
                                                                        float: 'right',
                                                                        marginLeft: '40px',
                                                                        marginTop: '-30px'
                                                                    }}
                                                                ></span>{' '}
                                                            </Form.Label>
                                                            {mode != 'view' ? (
                                                                <Col sm={5}>
                                                                    <Form.Control
                                                                        required
                                                                        size="sm"
                                                                        as="textarea"
                                                                        onChange={
                                                                            onSheetChangeHandler
                                                                        }
                                                                        name="purposeOfExpense"
                                                                        value={
                                                                            sheetFormData.purposeOfExpense ||
                                                                            ''
                                                                        }
                                                                        maxLength={100}
                                                                        style={{
                                                                            resize: 'vertical',
                                                                            height: '40px',
                                                                            width: '250px',
                                                                            marginLeft: '-50px'
                                                                        }}
                                                                    />
                                                                    {formErrors.purposeOfExpense && (
                                                                        <p className="error">
                                                                            {
                                                                                formErrors.purposeOfExpense
                                                                            }
                                                                        </p>
                                                                    )}
                                                                    {!formErrors.purposeOfExpense && (
                                                                        <p
                                                                            style={{
                                                                                // textAlign: "right",
                                                                                fontSize: '65%',
                                                                                marginTop: '7px',
                                                                                marginRight:
                                                                                    '-30px',
                                                                                paddingLeft: '175px'
                                                                            }}
                                                                        >
                                                                            {sheetFormData.purposeOfExpense
                                                                                ? sheetFormData
                                                                                    .purposeOfExpense
                                                                                    .length
                                                                                : 0}
                                                                            /100
                                                                        </p>
                                                                    )}
                                                                </Col>
                                                            ) : (
                                                                <Col>
                                                                    <Form.Control
                                                                        as="textarea"
                                                                        value={
                                                                            dataList.purposeOfExpense
                                                                        }
                                                                        disabled={
                                                                            !dataList.purposeOfExpense ||
                                                                            dataList.status ==
                                                                            'Submitted' ||
                                                                            dataList.status ==
                                                                            'Reimbursed' ||
                                                                            dataList.status ==
                                                                            'Approved' ||
                                                                            dataList.status ==
                                                                            'Repudiated' ||
                                                                            dataList.status ==
                                                                            'Partially Approved'
                                                                        }
                                                                        style={{
                                                                            resize: 'none',

                                                                            border: 'none',
                                                                            width: '250px',
                                                                            marginLeft: '-48px',
                                                                            marginTop: '-10px'
                                                                        }}
                                                                    />
                                                                </Col>
                                                            )}
                                                        </Form.Group>
                                                    </h6>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {!loading &&
                                        (mode === 'add' ||
                                            dataList.status === 'Saved' ||
                                            dataList.status === 'Rejected') && (
                                            <Button
                                                className="addButton"
                                                variant="addbtn"
                                                onClick={() => handleShow('create')}
                                            >
                                                <AddIcon />
                                            </Button>
                                        )}{' '}
                                    {loading ? (
                                        <center>
                                            <Loader />
                                        </center>
                                    ) : mode == 'edit' || mode == 'view' ? (
                                        <Table
                                            columns={COLUMNSEDIT}
                                            data={itemList}
                                            setChange={setChange}
                                            pageSize="10"
                                            key={itemList.length}
                                        />
                                    ) : (
                                        <Table columns={COLUMNSADD} data={itemList} key={itemList.length} pageSize="10" />
                                    )}
                                </div>
                                {mode != 'view' && !loading && (
                                    <div className="btnCenter mb-4">
                                        {(mode === 'add' || mode === 'edit') &&
                                            itemList.length > 0 && (
                                                <Button
                                                    className="Button"
                                                    variant="addbtn"
                                                    onClick={() =>
                                                        mode === 'add'
                                                            ? proceedSaveHandler({
                                                                obj: 'Saved',
                                                                method: 'save'
                                                            })
                                                            : proceedUpdateHandler({
                                                                obj: 'Saved',
                                                                method: 'update'
                                                            })
                                                    }
                                                >
                                                    {mode === 'add' ? 'Save' : 'Update'}
                                                </Button>
                                            )}
                                        {mode != 'view' && itemList.length > 0 && (
                                            <Button
                                                className="Button"
                                                variant="addbtn"
                                                onClick={() => handleSubmit()}
                                            >
                                                Submit
                                            </Button>
                                        )}
                                        {mode != 'view' && itemList.length > 0 && (
                                            <Button
                                                className="Button"
                                                variant="secondary"
                                                onClick={() => navigate('/expensesList')}
                                            >
                                                {cancelButtonName}
                                            </Button>
                                        )}
                                        {itemList.length <= 0 && (
                                            <div>
                                                <Button
                                                    className="Button"
                                                    variant="secondary"
                                                    onClick={() => navigate('/expensesList')}
                                                >
                                                    {cancelButtonName}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {(dataList.status == 'Reimbursed' ||
                                    dataList.status == 'Repudiated') && (
                                        <>
                                            <div className="row">
                                                <div
                                                    className="col-sm-5"
                                                    style={{ marginLeft: '30px' }}
                                                >
                                                    <label>Notes </label>
                                                    <Form.Control
                                                        as="textarea"
                                                        style={{
                                                            backgroundColor:
                                                                !dataList.description || dataList.status === 'Reimbursed'
                                                                    ? '#e9ecef'
                                                                    : 'white', width: '100%',
                                                            height: '100px',
                                                            maxHeight: '100px'
                                                        }}
                                                        name="description"
                                                        size="sm"
                                                        value={dataList.description}
                                                        disabled={

                                                            !dataList.description ||
                                                            dataList.status == 'Reimbursed'
                                                        }
                                                    />
                                                </div>

                                                <div className="col-sm-6">
                                                    <div
                                                        className="row"
                                                        style={{ marginLeft: '-110px' }}
                                                    >
                                                        <div className="col-sm-6 text-right">
                                                            <label>Reference No </label>
                                                        </div>
                                                        <div className="col-sm-5">
                                                            <Form.Control
                                                                size="sm"
                                                                as="textarea"
                                                                style={{
                                                                    backgroundColor:
                                                                        !dataList.description || dataList.status === 'Reimbursed'
                                                                            ? '#e9ecef'
                                                                            : 'white',
                                                                    width: '100%',
                                                                    height: '100px',
                                                                    maxHeight: '100px'
                                                                }}
                                                                name="referenceNo"
                                                                value={dataList.referenceNo}
                                                                disabled={
                                                                    !dataList.referenceNo ||
                                                                    dataList.status == 'Reimbursed'
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                <br />
                                {mode == 'view' && (
                                    <div style={{ marginLeft: '40%' }}>
                                        <Button
                                            className="Button"
                                            variant="secondary"
                                            onClick={() => navigate('/expensesList')}
                                        >
                                            {cancelButtonName}
                                        </Button>
                                    </div>
                                )}
                                <br />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Modal show={show} onHide={onCloseHandler} backdrop="static" keyboard={false}>
                <Modal.Header className="">
                    <Modal.Title>Delete ?</Modal.Title>
                    <Button variant="secondary" onClick={onCloseHandler}>
                        X
                    </Button>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    Are you sure you want to delete this item?
                </Modal.Body>
                <div className="delbtn">
                    <Button className="Button" variant="addbtn" onClick={proceedDeleteHandler}>
                        Yes
                    </Button>
                    <Button className="Button" variant="secondary" onClick={onCloseHandler}>
                        No
                    </Button>
                </div>
            </Modal>

            <Modal
                show={receipts}
                onHide={onCloseHandler}
                backdrop="static"
                keyboard={false}
                size="lg"
            >
                <Modal.Header className="" closeButton={onCloseHandler}>
                    <Modal.Title>Receipts</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    <FileViewer documents={bills} />
                </Modal.Body>
            </Modal>

            <Modal show={comment} onHide={onCloseHandler} backdrop="static" keyboard={false}>
                <Modal.Header className="" closeButton={onCloseHandler}>
                    {visible == 'submit' && <Modal.Title>Remarks</Modal.Title>}
                    {visible == 'approve' && <Modal.Title>Authorized Remarks</Modal.Title>}
                    {visible == 'reimburse' && <Modal.Title>Reimbursed Remarks</Modal.Title>}
                </Modal.Header>
                {visible == 'submit' && (
                    <Modal.Body
                        className="modalBody"
                        style={{
                            overflowWrap: 'break-word',
                            wordWrap: 'break-word',
                            wordBreak: 'break-all'
                        }}
                    >
                        {formData.remarks}
                    </Modal.Body>
                )}
                {visible == 'approve' && (
                    <Modal.Body
                        className="modalBody"
                        style={{
                            overflowWrap: 'break-word',
                            wordWrap: 'break-word',
                            wordBreak: 'break-all'
                        }}
                    >
                        {formData.approvedRemarks}
                    </Modal.Body>
                )}
                {visible == 'reimburse' && (
                    <Modal.Body
                        className="modalBody"
                        style={{
                            overflowWrap: 'break-word',
                            wordWrap: 'break-word',
                            wordBreak: 'break-all'
                        }}
                    >
                        {formData.reimbursedRemarks}
                    </Modal.Body>
                )}
            </Modal>

            <Modal show={submit} onHide={onCloseHandler} backdrop="static" keyboard={false}>
                <Modal.Header className="" closeButton={onCloseHandler}>
                    <Modal.Title>Submit </Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    Are you sure do you want to submit this item?
                </Modal.Body>
                <div className="btnCenter mb-4">
                    {mode == 'edit' ? (
                        <Button
                            className="Button"
                            variant="addbtn"
                            onClick={() =>
                                proceedUpdateHandler({ obj: 'Submitted', method: 'submitte' })
                            }
                        >
                            Yes
                        </Button>
                    ) : (
                        <Button
                            className="Button"
                            variant="addbtn"
                            onClick={() =>
                                proceedSaveHandler({ obj: 'Submitted', method: 'submitte' })
                            }
                        >
                            Yes
                        </Button>
                    )}

                    <Button className="Button" variant="secondary" onClick={onCloseHandler}>
                        No
                    </Button>
                </div>
            </Modal>

            <Modal
                className=""
                show={view}
                onHide={onCloseHandler}
                size="lg"
                style={{ marginLeft: '9px' }}
            >
                <Modal.Header closeButton={onCloseHandler}>
                    {visible == 'create' && <Modal.Title>Add Items</Modal.Title>}
                    {visible == 'update' && <Modal.Title>Edit Items</Modal.Title>}
                </Modal.Header>
                <Modal.Body>
                    <div className="">
                        <form className="modalFormBody">
                            <Row>
                                <div className="col-6">
                                    <Form.Group
                                        as={Row}
                                        className="mb-3"
                                        controlId="formGroupBranch"
                                    >
                                        <Form.Label column sm={4}>
                                            Category <span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={7}>
                                            <Select
                                                required
                                                size=""
                                                value={categoryOptions.filter(
                                                    (e) => e.value == categoryId
                                                )}
                                                onChange={onCategoryChangeHandler}
                                                placeholder={categoryName || 'Select Category'}
                                                options={categoryOptions}
                                            />
                                            <p className="error">{formErrors.categoryName}</p>
                                        </Col>
                                    </Form.Group>
                                </div>

                                <div className="col-6">
                                    <Form.Group
                                        as={Row}
                                        className="mb-3"
                                        controlId="formGroupBranch"
                                    >
                                        <Form.Label column sm={3}>
                                            Type
                                        </Form.Label>
                                        <Col sm={8}>
                                            <Select
                                                size=""
                                                options={typeOptions}
                                                onChange={handleTypeSelection}
                                                value={typeOptions.filter((e) => e.value == typeId)}
                                            />
                                        </Col>
                                    </Form.Group>
                                </div>

                                <div className="col-6">
                                    <Form.Group
                                        as={Row}
                                        className="mb-3"
                                        controlId="formGroupBranch"
                                    >
                                        <Form.Label column sm={4}>
                                            Date <span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={7}>
                                            <DatePicker
                                                format={'DD-MM-YYYY'}
                                                placeholder=""
                                                inputReadOnly={true}
                                                size="sm"
                                                value={date == null ? null : moment(date)}
                                                allowClear={false}
                                                onChange={handleDateChange}
                                                disabledDate={disabledDate}
                                            />
                                            <p className="error">{formErrors.date}</p>
                                        </Col>
                                    </Form.Group>
                                </div>

                                <div className="col-6">
                                    <Form.Group
                                        as={Row}
                                        className="mb-3"
                                        controlId="formGroupBranch"
                                    >
                                        <Form.Label column sm={3}>
                                            Amount<span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={8}>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px'
                                                }}
                                            >
                                                {/* Currency Dropdown */}
                                                <div style={{ width: '120px' }}>
                                                    <Select
                                                        value={currenciesOptions.filter(
                                                            (e) =>
                                                                e.value == currencyId &&
                                                                e.label == currencyName
                                                        )}
                                                        placeholder="Currency"
                                                        options={currenciesOptions}
                                                        onChange={handleCurrencySelection}
                                                    />
                                                    <p
                                                        className="error"
                                                        style={{
                                                            minHeight: '20px',
                                                            marginBottom: '0'
                                                        }}
                                                    >
                                                        {/* // #1773: replaced currenecyName with currencyId */}
                                                        {formErrors.currencyId}
                                                    </p>
                                                </div>

                                                {/* Amount Input Field */}
                                                <div style={{ flex: 1 }}>
                                                    <Form.Control
                                                        className="expenseAmount"
                                                        required
                                                        size="md"
                                                        type="number"
                                                        min="0"
                                                        onChange={(e) => {
                                                            if (e.target.value.length <= 7) {
                                                                onChangeHandler(e);
                                                            } else {
                                                                e.target.value = e.target.value.slice(0, 7);
                                                                onChangeHandler(e);
                                                            }
                                                        }}
                                                        name="submittedAmount"
                                                        defaultValue={formData.submittedAmount}
                                                        onKeyDown={(e) => {
                                                            // Prevent typing more than 7 digits
                                                            const value = e.target.value;
                                                            if (value && value.length >= 7 &&
                                                                e.key !== 'Backspace' &&
                                                                e.key !== 'Delete' &&
                                                                e.key !== 'ArrowLeft' &&
                                                                e.key !== 'ArrowRight' &&
                                                                e.key !== 'Tab') {
                                                                e.preventDefault();
                                                            }
                                                        }}
                                                        maxLength={7}
                                                    />
                                                    <p
                                                        className="error"
                                                        style={{
                                                            minHeight: '20px',
                                                            marginBottom: '0'
                                                        }}
                                                    >
                                                        {formErrors.submittedAmount}
                                                    </p>
                                                </div>
                                            </div>
                                        </Col>
                                    </Form.Group>
                                </div>

                                <div className="col-6">
                                    <Form.Group
                                        as={Row}
                                        className="mb-3"
                                        controlId="formGroupBranch"
                                    >
                                        <Form.Label column sm={4}>
                                            Receipts <span className="error"></span>
                                        </Form.Label>
                                        <Col sm={7}>
                                            <Form.Control
                                                required
                                                id="fileInput"
                                                size="sm"
                                                type="file"
                                                multiple
                                                accept=".pdf,.png,.jpeg,.jpg"
                                                name="billUploads"
                                                onChange={(e) => {
                                                    const files = Array.from(e.target.files);
                                                    const invalidFiles = files.filter(file => {
                                                        const ext = file.name.toLowerCase().split('.').pop();
                                                        return !['pdf', 'png', 'jpeg', 'jpg'].includes(ext);
                                                    });

                                                    if (invalidFiles.length > 0) {
                                                        setFormErrors({
                                                            ...formErrors,
                                                            size: 'Only PDF, PNG, and JPEG files are allowed'
                                                        });
                                                        e.target.value = null;
                                                        return;
                                                    }
                                                    handleBillFileChange(e);
                                                }}
                                            />

                                            {bills && bills.length > 0 ? (
                                                <div
                                                    style={{
                                                        textAlign: 'left',
                                                        fontSize: '85%',
                                                        fontWeight: '500',
                                                        color: '#374681'
                                                    }}
                                                >
                                                    {bills.map((file, index) => (
                                                        <span key={index}>
                                                            {file.fileName || file.name}
                                                            <a style={{ color: 'red', cursor: 'pointer' }} onClick={() => deleteBills(index)}> X </a>
                                                            <br />
                                                        </span>
                                                    ))}

                                                </div>
                                            ) : (
                                                !formErrors.size && (
                                                    <p
                                                        style={{
                                                            textAlign: 'left',
                                                            fontSize: '85%',
                                                            fontWeight: '500',
                                                            color: '#374681'
                                                        }}
                                                    >
                                                        {' '}
                                                        'Only PDF, PNG, and JPEG files accepted each
                                                        file 1MB.'
                                                    </p>
                                                )
                                            )}
                                            {formErrors.size && (
                                                <div className="error">{formErrors.size}</div>
                                            )}
                                            {formErrors.duplicates && (
                                                <div className="error">{formErrors.duplicates}</div>
                                            )}
                                        </Col>
                                    </Form.Group>
                                </div>

                                <div className="col-6">
                                    <Form.Group
                                        as={Row}
                                        className="mb-3"
                                        controlId="formGroupBranch"
                                    >
                                        <Form.Label column sm={3}>
                                            Remarks
                                        </Form.Label>
                                        <Col sm={8}>
                                            <Form.Control
                                                required
                                                size="sm"
                                                as="textarea"
                                                onChange={onChangeHandler}
                                                name="remarks"
                                                defaultValue={formData.remarks}
                                                maxLength={150}
                                            />
                                            {formData.remarks && (
                                                <p style={{ textAlign: 'right', fontSize: '85%' }}>
                                                    {formData.remarks.length}/150
                                                </p>
                                            )}
                                        </Col>
                                    </Form.Group>
                                </div>
                            </Row>
                        </form>
                    </div>
                </Modal.Body>
                <div className="btnCenter mb-4">
                    {visible == 'create' && (
                        <Button
                            variant="addbtn"
                            className="Button"
                            onClick={() => onAddHandler('Saved')}
                            style={{ width: '101px' }}
                        >
                            Add to List
                        </Button>
                    )}
                    {visible == 'update' && (
                        <Button
                            className="Button"
                            variant="addbtn"
                            onClick={() => onUpdateHandler('Saved')}
                        >
                            Update
                        </Button>
                    )}
                    <Button className="Button" variant="secondary" onClick={onCloseHandler}>
                        {cancelButtonName}
                    </Button>
                </div>
            </Modal>
        </>
    )
}

export default Expense
