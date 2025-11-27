import React, { useEffect, useState } from 'react' // Import React and hooks for state and side-effects
import { Button, Col, Form, Row } from 'react-bootstrap' // Import Bootstrap components for form and layout
import { cancelButtonName } from '../../../../Common/Utilities/Constants' // Import constant for cancel button name
import TableWith5Rows from '../../../../Common/Table/TableWith5Rows' // Import a reusable table component
import { DatePicker } from 'antd' // Import DatePicker from Ant Design for date selection
import Select from 'react-select' // Import Select component for dropdowns
import { useSelector } from 'react-redux' // Import to use redux state
import moment from 'moment' // Import moment.js for date formatting and comparison
import { toast } from 'react-toastify' // Import toast notifications
import { getAllByOrgId } from '../../../../Common/Services/CommonService' // Import API call to fetch job roles

const JobRoleModal = (props) => {
    // Destructure props passed to the component
    const {
        jobRoleDtos,
        table,
        setShowModal,
        setJobRoleDtos,
        doj,
        setJobRoleName,
        jobRoleName,
        onShowModalCloseHandler,
        jobRole,
        setJobRole,
        orgDate
    } = props

    // Retrieve user details from the redux store
    const userDetails = useSelector((state) => state.user.userDetails)
    const jobRoleDtosDate = jobRoleDtos.length != 0 ? jobRoleDtos[0].startDate : doj
    console.log('jobRoleDtosDate', jobRoleDtosDate)
    // State to manage form errors
    const [formErrors, setFormErrors] = useState({})

    // Validation function for job role form inputs
    const validateForJobRole = (values) => {
        const errors = {}

        // If no job role is selected
        if (values.jobRoleId == null) {
            errors.jobRoleId = 'Required'
        }
        // If no start date is selected
        if (values.startDate == null) {
            errors.jobRoleDate = 'Required'
        }

        return errors
    }

    // Fetch the list of all job roles from the server when the component mounts
    useEffect(() => {
        handleGetAllJobRoles()
    }, []) // Empty dependency array ensures it runs once after the initial render

    const [jobRoleList, setJobRoleList] = useState([]) // State to store the list of job roles fetched from the server

    // Function to fetch job roles based on the user's organization ID
    const handleGetAllJobRoles = () => {
        getAllByOrgId({ entity: 'jobrole', organizationId: userDetails.organizationId }).then(
            (res) => {
                if (res.statusCode == 200) {
                    setJobRoleList(res.data ? res.data : []) // Update jobRoleList with data from the response
                }
            }
        )
    }

    // Map job role list to options for the Select dropdown
    const jobRoleOptions = jobRoleList.map((option) => ({
        value: option.id,
        label: option.name
    }))

    // Handler to set selected job role
    const handleJobRoleSelection = (select) => {
        setJobRole(select.value) // Set selected job role ID
        setJobRoleName(select.label) // Set selected job role name
    }

    // State for storing the selected job role start date
    const [jobRoleStartDate, setJobRoleStartDate] = useState(null)

    // Handler for selecting a job role start date
    const hnadleSelectJobRoleDate = (e) => {
        const selectedDate = moment(e).format('YYYY-MM-DD') // Format the selected date
        if (selectedDate < orgDate) {
            // If selected date is before the foundation date, show error and reset
            setJobRoleStartDate(null)
            toast.error('Effective date must not precede foundation date')
        } else {
            setJobRoleStartDate(selectedDate) // Set the selected start date
        }
    }

    // Remove duplicates from the job role data array
    const removeDuplicates = (array) => {
        const seen = new Set()
        const filteredArray = array.filter((item) => {
            const isDuplicate = seen.has(item.jobRoleId)
            seen.add(item.jobRoleId) // Add jobRoleId to the set to track uniqueness
            return !isDuplicate
        })

        // Show a toast error if duplicates are found
        if (filteredArray.length < array.length) {
            toast.error('Job role already exists.')
        }
        return filteredArray
    }

    // Function to add a new job role to the list
    const addJobRoleDtos = () => {
        const jobRoleObj = {
            id: null, // Placeholder for new job role entry
            jobRoleId: jobRole, // The selected job role ID
            startDate: jobRoleStartDate, // The selected start date
            jobRoleName: jobRoleName // The selected job role name
        }

        // Validate the form fields
        if (jobRoleObj.jobRoleId == undefined || null) {
            setFormErrors(validateForJobRole(jobRoleObj)) // Show error if job role is not selected
        } else if (jobRoleObj.startDate == null) {
            setFormErrors(validateForJobRole(jobRoleObj)) // Show error if start date is not selected
        } else {
            const nullObj = jobRoleDtos.findIndex((e) => e.id === null)
            if (nullObj !== -1) {
                jobRoleDtos[nullObj] = jobRoleObj
            }
            else {
                // If valid, add the job role to the jobRoleDtos array and remove duplicates
                const jobRoleData = [...jobRoleDtos, jobRoleObj]
                setJobRoleDtos(removeDuplicates(jobRoleData)) // Update the jobRoleDtos state with the new data
                setJobRole() // Close the modal after adding the job role
            }
            setShowModal(false)
        }
    }

    // Define columns for the job role table
    const JobRoleColumns = [
        {
            Header: () => (
                <div className="text-left header" style={{ marginLeft: '8rem' }}>
                    Name
                </div>
            ),
            accessor: 'jobRoleName',
            Cell: ({ row }) => (
                <div style={{ marginLeft: '8rem' }} className="text-left">
                    {row.original.jobRoleName}
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
            {table ? (
                <div className="table">
                    {jobRoleDtos != null ? (
                        <TableWith5Rows
                            columns={JobRoleColumns}
                            serialNumber={true}
                            data={jobRoleDtos}
                        />
                    ) : (
                        []
                    )}
                </div>
            ) : (
                // Form for adding a new job role when `table` is false
                <div>
                    <div className="row table">
                        <Row>
                            {/* Job role dropdown */}
                            <div className="col-6">
                                <Form.Group as={Row} className="mb-3" controlId="jobRoleId">
                                    <Form.Label id="jobRoleId" column sm={4}>
                                        Job Role<span className="error">*</span>
                                    </Form.Label>
                                    <Col sm={7}>
                                        <Select
                                            id="jobRoleId"
                                            placeholder=""
                                            onChange={handleJobRoleSelection} // Handle job role selection
                                            options={jobRoleOptions} // Populate options from jobRoleOptions
                                            required
                                            onBlur={() =>
                                                !jobRole
                                                    ? setFormErrors({
                                                        ...formErrors,
                                                        jobRoleId: 'Required'
                                                    })
                                                    : setFormErrors({
                                                        ...formErrors,
                                                        jobRoleId: ''
                                                    })
                                            }
                                            value={jobRoleOptions.filter((e) => e.value == jobRole)} // Preselect the current job role
                                        />
                                        <p className="error">{formErrors.jobRoleId}</p>
                                    </Col>
                                </Form.Group>
                            </div>

                            {/* Effective date picker */}
                            <div className="col-6" style={{ marginRight: '-50px' }}>
                                <Form.Group as={Row} className="mb-3" controlId="jobRoleDate">
                                    <Form.Label id="jobRoleDate" column sm={5}>
                                        Effective Date <span className="error">*</span>
                                    </Form.Label>
                                    <Col sm={7}>
                                        <DatePicker
                                            id="jobRoleDate"
                                            placeholder="Select Date"
                                            allowClear={false}
                                            onChange={hnadleSelectJobRoleDate} // Handle date change
                                            disabledDate={(current) => {
                                                // jobRoleDtosDate is expected to be a string in 'YYYY-MM-DD' format or a Date object
                                                // Convert to moment for comparison
                                                const effectiveDate = moment(jobRoleDtosDate, 'YYYY-MM-DD');
                                                // Disable all dates before the effective date (inclusive)
                                                return current && current.isBefore(effectiveDate, 'day');
                                            }}
                                            required
                                            format={'DD-MM-YYYY'}
                                            size="sm"
                                            onBlur={(e) =>
                                                !e.target.value
                                                    ? setFormErrors({
                                                        ...formErrors,
                                                        jobRoleDate: 'Required'
                                                    })
                                                    : setFormErrors({
                                                        ...formErrors,
                                                        jobRoleDate: ''
                                                    })
                                            }
                                            name="dateOfJoining"
                                        />
                                        <p className="error">{formErrors.jobRoleDate}</p>
                                    </Col>
                                </Form.Group>
                            </div>
                        </Row>
                    </div>

                    {/* Display table with added job roles */}
                    <div className="table">
                        {jobRoleDtos != null ? (
                            <TableWith5Rows
                                columns={JobRoleColumns}
                                serialNumber={true}
                                data={jobRoleDtos}
                            />
                        ) : (
                            []
                        )}
                    </div>

                    {/* Buttons for adding or canceling */}
                    <div className="btnCenter">
                        <Button
                            className="Button"
                            id="AddJobRoles"
                            variant="addbtn"
                            onClick={addJobRoleDtos}
                        >
                            Add
                        </Button>
                        <Button
                            className="Button"
                            id="CancelJobRoles"
                            variant="secondary"
                            onClick={onShowModalCloseHandler}
                        >
                            {cancelButtonName}
                        </Button>
                    </div>
                </div>
            )}
        </>
    )
}

export default JobRoleModal
