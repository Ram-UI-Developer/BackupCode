// Importing necessary dependencies
import { DatePicker } from 'antd'; // Ant Design Date Picker component
import moment from 'moment'; // Moment.js for handling dates
import { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'; // Bootstrap components for UI
import { useSelector } from 'react-redux'; // For accessing Redux state
import { update } from '../../../Common/Services/CommonService'; // Function to update data
import { getById } from '../../../Common/Services/OtherServices'; // Function to fetch data by ID
import { cancelButtonName } from '../../../Common/Utilities/Constants'; // Cancel button name constant
import { commonCrudSuccess } from '../../../Common/CommonComponents/CustomizedSuccessToastMessages';
import { ToastError, ToastSuccess } from '../../../Common/CommonComponents/ToastCustomized';
import { updateValidation } from '../../../Common/CommonComponents/FormControlValidation';
import { toast } from 'react-toastify';

// Functional component for Apprisal Update page
const ApprisalUpdate = ({ id, onEditHandlerClose }) => {
    // Accessing user details from Redux store
    const userDetails = useSelector((state) => state.user.userDetails)

    // useEffect hook to fetch apprisal data when the component is mounted
    useEffect(() => {
        onGetApprisalHandlerById()
    }, []) // Empty dependency array means this will run once when the component mounts

    // State to store the form data for apprisal
    const [apprisalForm, setApprisalForm] = useState({})
    const [compData, setCompData] = useState({})
    // Function to fetch apprisal details by ID
    const onGetApprisalHandlerById = () => {
        getById({
            entity: 'appraisals', // entity name
            organizationId: userDetails.organizationId, // organization ID
            id: id // apprisal ID
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setApprisalForm(res.data) // Set the fetched data into state
                    setCompData(res.data)
                }
            })
            .catch((err) => {
                console.log(err, 'error') // Log error in case of failure
            })
    }

    // Function to update apprisal data
    const onEditHandler = () => {
        if (updateValidation(compData, apprisalForm)) {
            toast.info('No changes made to update.')
        }
        else {
            update({
                entity: 'appraisals', // entity name
                organizationId: userDetails.organizationId, // organization ID
                id: id, // apprisal ID
                body: apprisalForm, // updated form data,
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Apprisal',
                    operationType: 'update'
                }),
                screenName: 'Apprisal'
            })

                .then((res) => {
                    if (res.statusCode == 200) {
                        ToastSuccess(res.message) // Show success toast
                        onEditHandlerClose() // Close the edit form
                    }
                })
                .catch((err) => {
                    ToastError(err.message) // Show error toast
                    console.log(err, 'error') // Log error in case of failure
                })
        }
    }

    // Handler functions to update respective date fields in apprisalForm state
    const handleSubmissionDeadline = (e) => {
        let selectDate = moment(e).format('YYYY-MM-DD')
        setApprisalForm({ ...apprisalForm, submissionDeadline: selectDate })
    }

    const handlePeerSubmissionDeadLine = (e) => {
        let selectDate = moment(e).format('YYYY-MM-DD')
        setApprisalForm({ ...apprisalForm, peerSubmissionDeadline: selectDate > apprisalForm.hrReviewDeadline ? null : selectDate })
    }

    const handleManagerDeadline = (e) => {
        let selectDate = moment(e).format('YYYY-MM-DD')
        setApprisalForm({ ...apprisalForm, managerReviewDeadline: selectDate })
    }

    const handleHrDeadline = (e) => {
        let selectDate = moment(e).format('YYYY-MM-DD')
        setApprisalForm({ ...apprisalForm, hrReviewDeadline: selectDate })
    }
    return (
        <div>
            <section className="">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="selfDetails">
                                {/* Displaying employee details in a responsive grid */}
                                <div className="row mb-2">
                                    <div className="col-sm-6">
                                        <div className="row">
                                            <div className="col-sm-5">
                                                <label>Employee Id</label>
                                            </div>
                                            <div className="col-sm-6">
                                                <span> {apprisalForm.code}</span>{' '}
                                                {/* Displaying employee ID */}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-sm-6">
                                        <div className="row">
                                            <div className="col-sm-5">
                                                <label> Employee Name</label>
                                            </div>
                                            <div className="col-sm-6">
                                                <span> {apprisalForm.employeeName}</span>{' '}
                                                {/* Displaying employee name */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* More rows to display employee details */}
                                <div className="row mb-2">
                                    <div className="col-sm-6">
                                        <div className="row">
                                            <div className="col-sm-5">
                                                <label>Date Of Joining</label>
                                            </div>
                                            <div className="col-sm-6">
                                                <span> {apprisalForm.dateOfJoining}</span>{' '}
                                                {/* Displaying date of joining */}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-sm-6">
                                        <div className="row">
                                            <div className="col-sm-5">
                                                <label> Designation</label>
                                            </div>
                                            <div className="col-sm-6">
                                                <span> {apprisalForm.designation}</span>{' '}
                                                {/* Displaying employee designation */}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Manager and review deadlines fields */}
                                <div className="row mb-2">
                                    {/* Submission Deadline */}
                                    <div className="col-sm-6" style={{ marginTop: '1%' }}>
                                        <div className="row mb-2">
                                            <div className="col-sm-5">
                                                <label>Submission Deadline</label>
                                            </div>
                                            <div className="col-sm-6">
                                                <DatePicker
                                                    allowClear={false}
                                                    className="datepicker"
                                                    value={
                                                        apprisalForm.submissionDeadline == null
                                                            ? null
                                                            : moment(apprisalForm.submissionDeadline)
                                                    }
                                                    onChange={handleSubmissionDeadline}
                                                    disabledDate={(current) => {
                                                        // Disable today and all days before peerSubmissionDeadline (if set)
                                                        const today = moment().endOf('day');
                                                        const peerDeadline = apprisalForm.peerSubmissionDeadline
                                                            ? moment(apprisalForm.peerSubmissionDeadline).endOf('day')
                                                            : null;
                                                        // Disable if current is today or before today
                                                        if (current && current.isSameOrBefore(today, 'day')) return true;
                                                        // If peer deadline exists, disable if current is before or same as peer deadline
                                                        if (peerDeadline && current && current.isSameOrAfter(peerDeadline, 'day')) return true;
                                                        return false;
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Peer Submission Deadline (conditional) */}
                                    {apprisalForm.peerId && (
                                        <div className="col-sm-6" style={{ marginTop: '1%' }}>
                                            <div className="row">
                                                <div className="col-sm-5">
                                                    <label>Peer Submission Deadline</label>
                                                </div>
                                                <div className="col-sm-6">
                                                    <DatePicker
                                                        allowClear={false}
                                                        className="datepicker"
                                                        onChange={handlePeerSubmissionDeadLine}
                                                        value={
                                                            apprisalForm.peerSubmissionDeadline == null
                                                                ? null
                                                                : moment(apprisalForm.peerSubmissionDeadline)
                                                        }
                                                        disabledDate={(current) => {
                                                            const submissionDeadline = apprisalForm.submissionDeadline
                                                                ? moment(apprisalForm.submissionDeadline).startOf('day')
                                                                : null;
                                                            const managerDeadline = apprisalForm.managerReviewDeadline
                                                                ? moment(apprisalForm.managerReviewDeadline).startOf('day')
                                                                : null;
                                                            // Disable if before submissionDeadline
                                                            if (submissionDeadline && current && current.isBefore(submissionDeadline, 'day')) return true;
                                                            // Disable if on or after managerDeadline
                                                            if (managerDeadline && current && current.isSameOrAfter(managerDeadline, 'day')) return true;
                                                            return false;
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Manager Review Deadline */}
                                    <div className="col-sm-6" style={{ marginTop: '1%' }}>
                                        <div className="row mb-2">
                                            <div className="col-sm-5">
                                                <label>Manager Review Deadline</label>
                                            </div>
                                            <div className="col-sm-6">
                                                <DatePicker
                                                    allowClear={false}
                                                    className="datepicker"
                                                    onChange={handleManagerDeadline}
                                                    value={
                                                        apprisalForm.managerReviewDeadline == null
                                                            ? null
                                                            : moment(apprisalForm.managerReviewDeadline)
                                                    }
                                                    disabledDate={(current) => {
                                                        const peerDeadline = apprisalForm.peerSubmissionDeadline
                                                            ? moment(apprisalForm.peerSubmissionDeadline).startOf('day')
                                                            : null;
                                                        const hrDeadline = apprisalForm.hrReviewDeadline
                                                            ? moment(apprisalForm.hrReviewDeadline).startOf('day')
                                                            : null;
                                                        // Disable if before peerSubmissionDeadline
                                                        if (peerDeadline && current && current.isBefore(peerDeadline, 'day')) return true;
                                                        // Disable if on or after hrReviewDeadline
                                                        if (hrDeadline && current && current.isSameOrAfter(hrDeadline, 'day')) return true;
                                                        return false;
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* HR Review Deadline */}
                                    <div className="col-sm-6" style={{ marginTop: '1%' }}>
                                        <div className="row mb-3">
                                            <div className="col-sm-5 ">
                                                <label>HR Review Deadline</label>
                                            </div>
                                            <div className="col-sm-6 ">
                                                <DatePicker
                                                    allowClear={false}
                                                    className="datepicker"
                                                    onChange={handleHrDeadline}
                                                    value={
                                                        apprisalForm.hrReviewDeadline == null
                                                            ? null
                                                            : moment(apprisalForm.hrReviewDeadline)
                                                    }
                                                    disabledDate={(current) => {
                                                        const managerDeadline = apprisalForm.managerReviewDeadline
                                                            ? moment(apprisalForm.managerReviewDeadline).startOf('day')
                                                            : null;
                                                        // Disable if before managerReviewDeadline
                                                        if (managerDeadline && current && current.isBefore(managerDeadline, 'day')) return true;
                                                        return false;
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* Update and cancel buttons */}
                            <div className="btnCenter">
                                <Button variant="addbtn" className="Button" onClick={onEditHandler}>
                                    Update
                                </Button>

                                <Button
                                    className="Button"
                                    variant="secondary"
                                    onClick={onEditHandlerClose}
                                >
                                    {cancelButtonName}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default ApprisalUpdate
