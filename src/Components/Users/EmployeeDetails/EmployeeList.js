import { Row } from 'antd'; // Import Row component from Ant Design
import Papa from 'papaparse'; // Import Papa for CSV parsing
import { useEffect, useState } from 'react'; // Import React library
import { Button, Form, Modal, Tooltip } from 'react-bootstrap'; // Import necessary components from react-bootstrap
import { CiImport } from 'react-icons/ci'; // Import CiImport icon from react-icons
import { useSelector } from 'react-redux'; // Import useSelector hook from react-redux
import { useNavigate } from 'react-router-dom'; // Import json and useNavigate from react-router-dom
import { toast } from 'react-toastify'; // Import toast for notifications
import { commonCrudSuccess } from '../../../Common/CommonComponents/CustomizedSuccessToastMessages';
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'; // Import DetailLoader component
import PageHeader from '../../../Common/CommonComponents/PageHeader'; // Import PageHeader component
import { ToastError, ToastSuccess } from '../../../Common/CommonComponents/ToastCustomized';
import { AddIcon, CompIcon, DeleteIcon, EditIcon } from '../../../Common/CommonIcons/CommonIcons'; // Import icons for different actions
import { deleteById, getAllReporties } from '../../../Common/Services/CommonService'; // Import service functions for API requests
import {
    SaveFile,
    csvValidate
} from '../../../Common/Services/OtherServices'; // Import other service functions
import Table from '../../../Common/Table/Table'; // Import Table component
import Table1 from '../../../Common/Table/Table1'; // Import Table1 component
import Annexure from '../../PayRoll/Reports/Annexure'; // Import Annexure component
import CompensationHistory from './CompensationHistory'; // Import CompensationHistory component

const EmployeeList = () => {
    const userDetails = useSelector((state) => state.user.userDetails) // Access user details from Redux store
    useEffect(() => {
        // useEffect hook to run once when the component is mounted
        getEmployeeList() // Fetch employee list
    }, []) // Empty dependency array to run only on mount
    const formatNumber = (number) => {
        // Function to format numbers with commas
        if (number == null) return '' // Return empty string if number is null
        return new Intl.NumberFormat('en-IN').format(number) // Format the number as per Indian numbering system
    }
    const handleNavigate = (id, row) => {
        // Function to navigate to employee details page
        navigate('/employeeDetails', { state: { id, row } }) // Navigate with state containing ID and row data
    }
    const [isValidated, setIsValidated] = useState(false) // State for validation status
    const [selectedFiles, setSelectedFiles] = useState([]) // State to store selected files
    const [fileError, setFileError] = useState('') // State for file error messages
    const [pop, setPop] = useState() // State for popup visibility
    const [employeeList, setEmployeeList] = useState([]) // State to store the employee list
    const [loading, setLoading] = useState(true) // State for loading status

    const getEmployeeList = () => {
        // Function to fetch employee list from API
        getAllReporties({
            entity: 'employees',
            organizationId: userDetails.organizationId,
            employee:userDetails.employeeId
        })
            .then(
                (response) => {
                    // Handle successful response
                    if (response.statusCode == 200) {
                        setLoading(false) // Set loading state to false after fetching data
                        setEmployeeList(response.data ? response.data : []) // Set employee list from response data
                    }
                },
               
            )
            .catch((error) => {
                // Catch any other errors
                console.log(error) // Log error to console
                setLoading(false) // Set loading state to false
            })
    }

    const [show, setShow] = useState() // State for showing modal
    const [selectId, setSelectId] = useState([]) // State to store selected ID for delete action

    const onDeleteHandler = (row) => {
        // Function to handle delete action
        setShow(true) // Show the delete confirmation modal
        setSelectId(row.original.id) // Set selected ID for delete
    }

    const proceedDeleteHandler = () => {
        // Function to handle deletion after confirmation
        deleteById({
            entity: 'employees',
            organizationId: userDetails.organizationId,
            id: selectId,
            toastSuccessMessage: commonCrudSuccess({ screen: 'Employee', operationType: 'delete' }),
            screenName: 'Employee'
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setLoading(false)
                    ToastSuccess(res.message) // Show success notification
                    onCloseHandler() // Close the modal
                    getEmployeeList() // Refresh employee list
                }
            })
            .catch((err) => {
                setLoading(false)
                ToastError(err.message)
            })
    }

    const onCloseHandler = () => {
        // Function to close modals and reset state
        setShow(false)
        setPop(false)
        setFileError('')
        setData([])
        setVis(false)
        setSelectedFiles([])
    }

    const [data, setData] = useState([]) // State to store CSV data
    const [vis, setVis] = useState(false) // State to control visibility of the validation status

    const [action, setAction] = useState('') // State for action type
    const [templateId, setTemplateId] = useState(50) // State for template ID
    const [ctc, setCtc] = useState(1000000) // State for CTC

    const [aneShow, setAneShow] = useState(false) // State for showing annexure modal

    const onGetAnexuerHandler = (mode, row) => {
        // Function to handle annexure modal open
        setAneShow(true) // Show annexure modal
        setCtc(row.ctc) // Set CTC value for the annexure
        setTemplateId(row.templateId) // Set template ID for the annexure
        setAction(mode) // Set the mode for annexure (e.g., readOnly)
    }

    const onGetAnexuerCloseHandler = () => {
        // Function to close annexure modal
        setAneShow(false) // Hide annexure modal
    }

    const [compensationShow, setCompensations] = useState(false) // State for compensation modal visibility
    const [empId, setEmpId] = useState() // State for employee ID
    const [locationId, setLocationId] = useState() // State for location ID

    const [isModalOpen, setIsModalOpen] = useState(false) // State for modal visibility
    const [empdoj, setEmpDoj] = useState() // State for employee date of joining
    const onCompensationShowHandler = (row) => {
        // Function to show compensation modal
        setEmpDoj(row.dateOfJoining) // Set employee date of joining
        setIsModalOpen(true) // Show compensation modal
        setCompensations(true) // Set compensation modal visibility to true
        setEmpId(row.id) // Set employee ID for compensation
        setLocationId(row.locationId) // Set location ID for compensation
    }

    const onCompensationCloseHandler = () => {
        // Function to close compensation modal
        setIsModalOpen(false) // Hide compensation modal
        setCompensations(false) // Set compensation modal visibility to false
    }

    // columns for table
    const COLUMNS = [
        {
            Header: 'Name',
            accessor: 'name',
            Cell: ({ row }) => (
                <>
                    {!pop && !isModalOpen && !show && (
                        <Tooltip title={row.original.name} open>
                            {row.original.name}
                        </Tooltip>
                    )}

                    <div className="employeeNameLenght">{row.original.name}</div>
                </>
            )
        },

        {
            Header: 'Joining Date',
            accessor: 'dateOfJoining'
        },
        {
            Header: 'Location',
            accessor: 'locationName'
        },
        {
            Header: 'Email',
            accessor: 'email',
            Cell: ({ row }) => (
                <>
                    {!pop && !isModalOpen && !show && (
                        <Tooltip title={row.original.email} open>
                            {row.original.email}
                        </Tooltip>
                    )}
                    <div className="tableLength">{row.original.email}</div>
                </>
            )
        },
        {
            Header: 'Phone #',
            accessor: 'phoneNumber'
        },
        {
            Header: 'Reporting Manager',
            accessor: 'managerName'
        },
        {
            Header: <div className="text-center header"> Shift</div>,
            accessor: 'shiftName',
            Cell: ({ row }) => {
                const shift = row.original.shiftName
                return (
                    <div className="text-left">
                        {shift &&
                            shift.slice(
                                shift && shift.indexOf('(') + 1,
                                shift && shift.indexOf(')')
                            )}
                    </div>
                )
            }
        },
        {
            Header: <div className="text-right header">CTC</div>,
            accessor: 'ctc',
            Cell: ({ row }) => (
                <div
                    className="text-right"
                    id="Annexutrepopup"
                    onClick={() => onGetAnexuerHandler('readOnly', row.original)}
                >
                    <a className="">
                        <u>
                            {' '}
                            {row.original.currencySymbol}
                            {row.original.ctc == 0 ? '' : formatNumber(row.original.ctc)}
                        </u>
                    </a>
                </div>
            )
        },
        {
            Header: <div className="text-right header">Status</div>,
            accessor: 'status',
            Cell: ({ row }) => {
                if (row.original.status == 'Active') {
                    return <div className="text-black text-right">{row.original.status}</div>
                } else if (row.original.status == 'Draft') {
                    return <div className="text-orange text-right">{row.original.status}</div>
                } else {
                    return <div className="text-red text-right">{row.original.status}</div>
                }
            }
        },
        {
            Header: () => (
                <div style={{ marginLeft: '3.5rem' }} className=" text-center actions header">
                    Actions
                </div>
            ),
            accessor: 'actions',
            disableSortBy: true,
            Cell: ({ row }) => (
                <>
                    <div className="text-right">
                        {row.original.status != 'Active' ? (
                            ''
                        ) : (
                            <>
                                <Button
                                    type="button"
                                    id="compensation"
                                    className="iconWidth"
                                    variant=""
                                    onClick={() => onCompensationShowHandler(row.original)}
                                >
                                    <CompIcon />
                                </Button>
                                |
                            </>
                        )}
                        <Button
                            id="employeeEdit"
                            type="button"
                            className="iconWidth"
                            variant=""
                            onClick={() => handleNavigate(row.original.id, row.original)}
                        >
                            <EditIcon />
                        </Button>
                        |
                        {
                            <Button
                                id="employeeDelete"
                                type="button"
                                disabled={row.original.status != 'Draft' ? true : false}
                                variant=""
                                className="iconWidth"
                                onClick={() => onDeleteHandler(row)}
                            >
                                <DeleteIcon />
                            </Button>
                        }
                    </div>
                </>
            )
        }
    ]
    const navigate = useNavigate()

    // CSVFile Reader && Upload
    const handleFileChange = (event) => {
        setSelectedFiles(event.target.files[0])
        setFileError('')
        setVis(false)
        setIsValidated(false)
        const file = event.target.files[0]
        const reader = new FileReader()
        if (!file || (file.type !== 'text/csv' && !file.name.toLowerCase().endsWith('.csv'))) {
            setFileError('Please upload a valid CSV file.')
            setData([])
        } else {
            reader.onload = () => {
                const csvData = reader.result
                Papa.parse(csvData, {
                    complete: (result) => {
                        // Get headers from CSV file
                        const csvHeaders = result.meta.fields || []
                        // Get expected headers from CSVValidateColumns (excluding S.No, Status, Remarks columns)
                        const expectedHeaders = CSVValidateColumns.map((col) =>
                            typeof col.accessor === 'string' ? col.accessor : null
                        ).filter(
                            (h) =>
                                h && h !== '' && h !== 'importStatus' && h !== 'importErrorMessage'
                        )

                        // Compare headers (case-insensitive)
                        const missingHeaders = expectedHeaders.filter(
                            (h) => !csvHeaders.map((x) => x.toLowerCase()).includes(h.toLowerCase())
                        )
                        if (missingHeaders.length > 0) {
                            setFileError(
                                `CSV header mismatch. Missing columns: ${missingHeaders.join(', ')}`
                            )
                            setData([])
                            return
                        }

                        // Filter out empty rows
                        const filteredRows = result.data.filter(
                            (row) =>
                                row &&
                                Object.values(row).some(
                                    (value) =>
                                        value !== null &&
                                        value !== undefined &&
                                        String(value).trim() !== ''
                                )
                        )
                        if (filteredRows.length === 0) {
                            setFileError('Enter valid data in the file')
                        }
                        setData(filteredRows)
                    },
                    header: true, // Treat the first row as headers
                    skipEmptyLines: true
                })
            }
            reader.readAsText(file)
        }
    }

    const [validateData, setValidatedata] = useState([]) // State to store validated data, initialized as an empty array
    const [errorMessage, setErrorMessage] = useState('') // State to store error messages, initialized as an empty string
    // csvValidate is called to validate the files against the employees entity and the given organization ID
    const onValidateTheFiles = () => {
        setIsValidated(true)
        let locationData = new FormData()
        selectedFiles && locationData.append('file', selectedFiles)
        csvValidate({
            entity: 'employees',
            organizationId: userDetails.organizationId,
            body: locationData
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setVis(true)
                    setData(res.data)

                    setErrorMessage(res.message)
                    setValidatedata(
                        res.data.filter((e) => {
                            if (e.importStatus) {
                                return e
                            }
                        })
                    )
                } else {
                    toast.error(res.errorMessage)
                }
            })
            .catch((error) => {
                console.error('API Request Error:', error)
                toast.error(error.message)
            })
    }

    // Call the SaveFile API function to save the validated employee data
    const onSaveFile = () => {
        SaveFile({
            entity: 'employees',
            organizationId: userDetails.organizationId,
            body: validateData
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setPop(false)
                    toast.success('Imported succesfully.')
                    getEmployeeList()
                } else {
                    toast.error(res.errorMessage)
                }
            })
            .catch((error) => {
                console.error('API Request Error:', error)
            })
        // }
    }

    // columns for csv table
    const CSVCOLUMNS = [
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
            Header: () => <div className="header">{vis ? 'Status' : ''}</div>,
            accessor: 'importStatus',
            Cell: ({ row }) => {
                if (vis && !row.original.importStatus) {
                    return <span className="error">Error</span>
                } else if (vis && row.original.importStatus) {
                    return <span className="text-success">Success</span>
                }
            }
        },
        {
            Header: () => <div className="header">{vis ? 'Remarks' : ''}</div>,
            accessor: 'importErrorMessage',
            Cell: ({ row }) => (
                <div style={{ width: vis ? '12rem' : '0px' }} className="error">
                    {row.original.importErrorMessage}
                </div>
            )
        },
        {
            Header: 'Code',
            accessor: 'code',
            Cell: ({ row }) => <div style={{ width: '5rem' }}>{row.original.code}</div>
        },

        {
            Header: 'Date Of Birth',
            accessor: 'dateOfBirth',
            Cell: ({ row }) => <div>{row.original.dateOfBirth}</div>
        },
        {
            Header: 'Date Of Joining',
            accessor: 'dateOfJoining',
            Cell: ({ row }) => <div>{row.original.dateOfJoining}</div>
        },

        {
            Header: 'First Name',
            accessor: 'firstName'
        },
        {
            Header: 'Last Name',
            accessor: 'lastName'
        },

        {
            Header: 'Title',
            accessor: 'title'
        },
        {
            Header: 'Phone #',
            accessor: 'phoneNumber'
        },
        {
            Header: 'Email',
            accessor: 'email',
            Cell: ({ row }) => (
                <>
                    {!pop && (
                        <Tooltip title={row.original.email} open>
                            {row.original.email}
                        </Tooltip>
                    )}
                    <div className="tableLength">{row.original.email}</div>
                </>
            )
        },
        {
            Header: 'Alternate Email',
            accessor: 'alternateEmail'
        },
        {
            Header: 'Nationality',
            accessor: 'nationality'
        },

        {
            Header: 'BloodGroup',
            accessor: 'bloodGroup'
        },
        {
            Header: 'Job Role',
            accessor: 'jobRole',
            Cell: ({ row }) => <div style={{ minWidth: '200px' }}>{row.original.jobRole}</div>
        },
        {
            Header: 'Department',
            accessor: 'department'
        },
        {
            Header: 'Location Name',
            accessor: 'locationName'
        },
        {
            Header: 'Gender',
            accessor: 'gender'
        },
        {
            Header: 'Marriage Date',
            accessor: 'marriageDate'
        },
        {
            Header: 'Alternate Phone #',
            accessor: 'alternatePhoneNumber'
        },
        {
            Header: 'Marital Status',
            accessor: 'maritalStatus'
        },
        {
            Header: 'Country',
            accessor: 'countryName',
            Cell: ({ row }) => {
                const addresses = row.original.addressDTOs
                return (
                    <>
                        {addresses && addresses.length > 0
                            ? addresses.map((address, index) => (
                                  <div key={index}>{address.countryName || 'N/A'}</div>
                              ))
                            : 'N/A'}
                    </>
                )
            }
        },
        {
            Header: 'State',
            accessor: 'stateName',
            Cell: ({ row }) => {
                const addresses = row.original.addressDTOs
                return (
                    <>
                        {addresses && addresses.length > 0
                            ? addresses.map((address, index) => (
                                  <div key={index}>{address.stateName || 'N/A'}</div>
                              ))
                            : 'N/A'}
                    </>
                )
            }
        },
        {
            Header: 'City',
            accessor: 'city',
            Cell: ({ row }) => {
                const addresses = row.original.addressDTOs
                return (
                    <>
                        {addresses && addresses.length > 0
                            ? addresses.map((address, index) => (
                                  <div key={index}>{address.city || 'N/A'}</div>
                              ))
                            : 'N/A'}
                    </>
                )
            }
        },
        {
            Header: 'Zip code',
            accessor: 'zipCode',
            Cell: ({ row }) => {
                const addresses = row.original.addressDTOs
                return (
                    <>
                        {addresses && addresses.length > 0
                            ? addresses.map((address, index) => (
                                  <div key={index}>{address.zipCode || 'N/A'}</div>
                              ))
                            : 'N/A'}
                    </>
                )
            }
        },
        {
            Header: 'Address',
            accessor: 'address1',
            Cell: ({ row }) => {
                const addresses = row.original.addressDTOs
                return (
                    <>
                        {addresses && addresses.length > 0
                            ? addresses.map((address, index) => (
                                  <div key={index}>{address.address1 || 'N/A'}</div>
                              ))
                            : 'N/A'}
                    </>
                )
            }
        }
    ]
    // csv validate columns
    const CSVValidateColumns = [
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
            Header: () => <div className="header">{vis ? 'Status' : ''}</div>,
            accessor: 'importStatus',
            Cell: ({ row }) => {
                if (vis && !row.original.importStatus) {
                    return <span className="error">Error</span>
                } else if (vis && row.original.importStatus) {
                    return <span className="text-success">Success</span>
                }
            }
        },
        {
            Header: () => <div className="header">{vis ? 'Remarks' : ''}</div>,
            accessor: 'importErrorMessage',
            Cell: ({ row }) => (
                <div style={{ width: vis ? '12rem' : '0px' }} className="error">
                    {row.original.importErrorMessage}
                </div>
            )
        },
        {
            Header: 'Code',
            accessor: 'code',
            Cell: ({ row }) => <div style={{ width: '5rem' }}>{row.original.code}</div>
        },

        {
            Header: 'Date Of Birth',
            accessor: 'dateOfBirth',
            Cell: ({ row }) => <div>{row.original.dateOfBirth}</div>
        },
        {
            Header: 'Date Of Joining',
            accessor: 'dateOfJoining',
            Cell: ({ row }) => <div>{row.original.dateOfJoining}</div>
        },

        {
            Header: 'First Name',
            accessor: 'firstName'
        },
        {
            Header: 'Last Name',
            accessor: 'lastName'
        },

        {
            Header: 'Title',
            accessor: 'title'
        },
        {
            Header: 'Phone #',
            accessor: 'phoneNumber'
        },
        {
            Header: 'Email',
            accessor: 'email',
            Cell: ({ row }) => (
                <>
                    {!pop && (
                        <Tooltip title={row.original.email} open>
                            {row.original.email}
                        </Tooltip>
                    )}
                    <div className="tableLength">{row.original.email}</div>
                </>
            )
        },
        {
            Header: 'Alternate Email',
            accessor: 'alternateEmail'
        },
        {
            Header: 'Nationality',
            accessor: 'nationality'
        },

        {
            Header: 'BloodGroup',
            accessor: 'bloodGroup'
        },
        {
            Header: 'Job Role',
            accessor: 'jobRole',
            Cell: ({ row }) => <div style={{ minWidth: '200px' }}>{row.original.jobRole}</div>
        },
        {
            Header: 'Department',
            accessor: 'department'
        },
        {
            Header: 'Location Name',
            accessor: 'locationName'
        },
        {
            Header: 'Gender',
            accessor: 'gender'
        },
        {
            Header: 'Marriage Date',
            accessor: 'marriageDate'
        },
        {
            Header: 'Alternate Phone #',
            accessor: 'alternatePhoneNumber'
        },
        {
            Header: 'Country',
            accessor: 'country'
        },
        {
            Header: 'State',
            accessor: 'state'
        },
        {
            Header: 'City',
            accessor: 'city'
        },
        {
            Header: 'Zip code',
            accessor: 'ZipCode'
        },
        {
            Header: 'Address',
            accessor: 'address'
        }
    ]
    return (
        <div>
            <>
                <section className="section">
                    {loading ? <DetailLoader /> : ''}{' '}
                    {/* Display loading spinner when data is loading */}
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-md-12">
                                <div className=" ">
                                    <PageHeader pageTitle="Employees" />{' '}
                                    {/* Page header for employees section */}
                                    <div className="table">
                                        <>
                                            <Button
                                                id="addEmployee"
                                                className="addButton"
                                                variant="addbtn"
                                                onClick={() =>
                                                    navigate('/employeeDetails', {
                                                        state: { id: null } // Navigate to employee details page with null ID
                                                    })
                                                }
                                            >
                                                <AddIcon /> {/* Button for adding new employee */}
                                            </Button>
                                            <div
                                                style={{
                                                    float: 'right',
                                                    marginTop: '8px',
                                                    padding: '10px'
                                                }}
                                            >
                                                <label
                                                    type="button"
                                                    id="employeeImport"
                                                    className="employeeImport"
                                                    onClick={() => setPop(true)} // Trigger file import modal on click
                                                >
                                                    <CiImport className="themeColor" size={32} />{' '}
                                                    {/* Import icon */}
                                                    Import
                                                </label>
                                            </div>
                                            &emsp;
                                            {/* Table columns configuration */}
                                            <Table1
                                                columns={COLUMNS}
                                                data={employeeList}
                                                serialNumber={true}
                                            />
                                        </>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Modal Pop Up for Annexure */}
                <Modal
                    centered
                    show={aneShow}
                    onHide={onGetAnexuerCloseHandler}
                    backdrop="static"
                    keyboard={false}
                    size="lg"
                >
                    <Modal.Header closeButton={onGetAnexuerCloseHandler}>
                        <Modal.Title>Annexure</Modal.Title> {/* Modal title */}
                    </Modal.Header>
                    <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                        <Annexure
                            templateId={templateId}
                            averageSal={ctc}
                            action={action}
                            currencyCode={'INR'}
                        />
                    </Modal.Body>
                </Modal>

                {/* Modal Pop Up for Compensation History */}
                {/* Show compensation modal based on state */}
                {/* Close handler for compensation modal */}

                <Modal
                    show={compensationShow}
                    onHide={onCompensationCloseHandler}
                    className="custom-modal"
                    keyboard={false}
                    size="lg"
                >
                    <Modal.Header closeButton={onCompensationCloseHandler}>
                        <Modal.Title>Compensation History</Modal.Title> {/* Modal title */}
                    </Modal.Header>
                    <Modal.Body>
                        <div style={{ marginTop: '-13%' }}>
                            <CompensationHistory
                                booleanValue={true}
                                onCompensationCloseHandler={onCompensationCloseHandler}
                                id={empId}
                                doj={empdoj}
                                locId={locationId}
                            />
                            <div className="singleBackButton">
                                {/* Close compensation modal */}
                                <Button
                                    id="compensationClose"
                                    variant="secondary"
                                    className="Button"
                                    onClick={onCompensationCloseHandler}
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </Modal.Body>
                </Modal>

                {/* Modal for Delete Confirmation */}
                <div>
                    {/* Close handler for delete modal */}
                    {/* Show delete confirmation modal based on state */}
                    <Modal show={show} onHide={onCloseHandler} backdrop="static" keyboard={false}>
                        <Modal.Header className="modalHeader" closeButton={onCloseHandler}>
                            <Modal.Title>Delete ?</Modal.Title> {/* Modal title */}
                        </Modal.Header>
                        <Modal.Body className="modalBody">
                            {/* Delete confirmation message */}
                            Are you sure you want to delete this item?
                        </Modal.Body>
                        <div className="btnCenter mb-3">
                            {/* Trigger delete action */}
                            <Button
                                id="employeeDeleteProceed"
                                className="Button"
                                variant="addbtn"
                                onClick={proceedDeleteHandler}
                            >
                                Yes
                            </Button>
                            {/* Close the modal without deletion */}
                            <Button
                                id="employeeDeleteClose"
                                className="Button"
                                variant="secondary"
                                onClick={onCloseHandler}
                            >
                                No
                            </Button>
                        </div>
                    </Modal>
                </div>

                {/* Modal for Viewing Employee Status */}
                <div>
                    <Modal
                        size="xl"
                        show={pop}
                        backdrop="static"
                        style={{ marginTop: '-2%' }}
                        onHide={onCloseHandler}
                        keyboard={false}
                    >
                        <Modal.Header closeButton={onCloseHandler}>
                            <Modal.Title>File Import</Modal.Title> {/* Modal title */}
                        </Modal.Header>
                        <Modal.Body>
                            <div style={{ marginLeft: '84%' }}>
                                {/* Link to download CSV template */}
                                <a
                                    id="employeeimportFileDownload"
                                    href="/dist/Pdf/EmployecsvFile.csv"
                                    download="EmployecsvFile.csv"
                                >
                                    <u>Download CSV Template</u>
                                </a>
                            </div>
                            <div className="modalFormBody" style={{ maxWidth: '100%' }}>
                                <div className="col-">
                                    <Form.Group
                                        as={Row}
                                        className="mb-3"
                                        controlId="employeeimportFileUpload"
                                    >
                                        <Form.Label
                                            id="employeeimportFileUpload"
                                            style={{ paddingRight: '5%', marginTop: '1.5%' }}
                                        >
                                            Upload File
                                        </Form.Label>
                                        {/* Handle file change */}
                                        {/* Accept only CSV files */}
                                        <Form.Control
                                            id="employeeimportFileUpload"
                                            style={{ width: '40%' }}
                                            size="sm"
                                            type="file"
                                            onChange={handleFileChange}
                                            accept={'.csv'}
                                        />
                                    </Form.Group>
                                    <p
                                        className="error"
                                        style={{ paddingLeft: '13%', marginTop: '-2%' }}
                                    >
                                        {fileError} {/* Display file error if any */}
                                    </p>
                                </div>
                                <p
                                    style={{
                                        fontSize: '85%',
                                        fontWeight: '500',
                                        color: '#374681',
                                        marginTop: '-2%',
                                        paddingLeft: '13%'
                                    }}
                                >
                                    {fileError ? ' ' : ' Only CSV files accepted.'}
                                </p>
                                {vis && (
                                    <>
                                        {data.length != validateData.length ? (
                                            <>
                                                {/* Display error message if validation fails */}
                                                <label className="header"> Error Message </label>:
                                                <span className="error"> {errorMessage}</span>
                                            </>
                                        ) : (
                                            ''
                                        )}
                                    </>
                                )}
                                {/* Show CSV validation table if validation is triggered */}
                                {data.length > 0 && !isValidated && (
                                    <div style={{ marginTop: '3%', overflowY: 'scroll' }}>
                                        <Table data={data} columns={CSVValidateColumns} />
                                    </div>
                                )}
                                {/* Show validated CSV data table */}
                                {data.length > 0 && isValidated && (
                                    <div style={{ marginTop: '3%', overflowY: 'scroll' }}>
                                        <Table data={data} columns={CSVCOLUMNS} />
                                    </div>
                                )}
                            </div>
                        </Modal.Body>
                        <div className="btnCenter mb-3">
                            {/* Trigger file validation */}
                            {data.length == 0 ? (
                                ''
                            ) : (
                                <Button
                                    id="employeeimportFileValidate"
                                    className="Button"
                                    variant="addbtn"
                                    onClick={onValidateTheFiles}
                                >
                                    Validate
                                </Button>
                            )}
                            {/* Disable proceed button if no valid data */}
                            {/* Trigger save file action */}
                            {vis && (
                                <Button
                                    className="Button"
                                    id="employeeimportFileSave"
                                    variant="addbtn"
                                    disabled={validateData.length <= 0}
                                    onClick={onSaveFile}
                                >
                                    Proceed
                                </Button>
                            )}
                            {/* Close file import modal */}
                            <Button
                                variant="secondary"
                                className="Button"
                                id="employeeimportFileClose"
                                onClick={onCloseHandler}
                            >
                                Close
                            </Button>
                        </div>
                    </Modal>
                </div>
            </>
        </div>
    )
}
export default EmployeeList
