import { Steps } from 'antd'; // Importing Steps component from Ant Design for multi-step navigation
import { useEffect, useState } from 'react'; // Importing necessary hooks from React
import { Button, Modal } from 'react-bootstrap'; // Importing Button and Modal from react-bootstrap for UI
import { toast } from 'react-toastify'; // Importing toast for displaying notifications
import SelfDetails from '../Employee/SelfDetails'; // Importing SelfDetails component
import IndividualTrainingNeeds from '../IndividualTrainingNeeds/IndividualTrainingNeeds'; // Importing IndividualTrainingNeeds component
import EmployeeAndManagerReview from '../ManagerReview/EmployeeAndManagerReview'; // Importing EmployeeAndManagerReview component
import SelfReview from '../SelfReview/SelfReview'; // Importing SelfReview component
// Importing services to fetch and save appraisal data
// import { getById } from '../../../Common/Services/CommonService'; // This is commented out
import { validate } from 'react-email-validator'; // Importing email validation utility
import { useSelector } from 'react-redux'; // Importing useSelector to access the Redux state
import { useLocation, useNavigate } from 'react-router-dom'; // Importing hooks from react-router-dom for navigation and location handling
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'; // Importing DetailLoader for loading UI
import { SaveWithId, getById } from '../../../Common/Services/OtherServices'; // Importing SaveWithId and getById service functions

// PeerReview functional component
const PeerReview = () => {
    const userDetails = useSelector((state) => state.user.userDetails) // Retrieving user details from Redux store
    const [current, setCurrent] = useState(0) // State to track the current step in the multi-step process
    const [apprisalForm, setApprisalForm] = useState({}) // State to hold the appraisal form data
    const appraisalFormId = useLocation().state // Getting the appraisal form ID from the location state
    const [show, setShow] = useState(false) // State to handle the visibility of the modal
    const navigate = useNavigate() // Hook to navigate between routes
    const [formErrors, setFormErrors] = useState({}) // State to handle form validation errors
    const [loading, setLoading] = useState(true) // State to handle loading state

    // Function to handle step change in Steps component
    const onChange = (value) => {
        setCurrent(value)
    }

    // Functions to go to the next or previous step in the Steps component
    const next = () => {
        setCurrent(current + 1)
    }

    const prev = () => {
        setCurrent(current - 1)
    }

    // useEffect hook to fetch appraisal form details when component mounts
    useEffect(() => {
        onGetApprisalHandlerById()
    }, [])

    // Function to fetch appraisal form details by ID
    const onGetApprisalHandlerById = () => {
        setLoading(true)
        getById({
            entity: 'appraisals',
            organizationId: userDetails.organizationId,
            id: appraisalFormId.id
        })
            .then((res) => {
                if (res.statusCode === 200) {
                    setLoading(false)
                    setApprisalForm(res.data)
                }
            })
            .catch((err) => {
                setLoading(false)
                console.log(err, 'error')
            })
    }

    // Function to handle form submission
    const onSubmitHandler = () => {
        const peerReviewFields = [
            'jobKnowl',
            'probSolve',
            'teamWork',
            'workQuality',
            'commSkills'
            // Add more if needed
        ]

        const missingField = peerReviewFields.find(
            (field) =>
                !(
                    apprisalForm.selfreviewDTO[field] &&
                    apprisalForm.selfreviewDTO[field]['peerReview']
                )
        )

        if (missingField) {
            setFormErrors(validater(apprisalForm))
            toast.error('Please fill all *required fields...')
            return
        }

        setFormErrors({})

        const isValidEmail =
            apprisalForm && apprisalForm.managerEmail ? validate(apprisalForm.managerEmail) : false // assuming `validate` returns a boolean for email here
        if (!isValidEmail) {
            setFormErrors({ ...formErrors, managerEmail: 'Enter Valid Email' })
            toast.error('Please Enter Valid Email...')
        } else {
            setShow(true)
            setFormErrors({})
        }
    }

    // Function to handle saving/submitting the form
    const onSaveHandler = (e) => {
        apprisalForm.status = e // Sets the status based on the action (Save/Submit)
        setLoading(true)
        setShow(false) // Hides the modal

        SaveWithId({
            entity: 'appraisals',
            id: appraisalFormId.id,
            organizationId: userDetails.organizationId,
            body: apprisalForm
        })
            .then((res) => {
                if (res.statusCode === 200) {
                    setLoading(false)
                    if (e === 'Submitted') {
                        toast.success('Saved Successfully.')
                    } else {
                        toast.success('Submitted Successfully.')
                    }
                    navigate('/peerReviewList') // Navigates to the peer review list page after submission
                }
            })
            .catch((err) => {
                setLoading(false)
                console.log(err, 'error')
            })
    }

    // Function to validate form fields
    const validater = (values) => {
        const errors = {}
        // Validation checks for different fields...
        if (!values.projects || values.projects.length < 0) {
            errors.projects = 'Required'
        } else {
            errors.projects = ' '
        }
        // Similar validation checks for other fields...
        return errors
    }

    // Step items for the multi-step process
    const items = [
        {
            title: 'Self Review',
            content: <SelfReview peer={true} apprisalForm={apprisalForm} formErrors={formErrors} />
        },
        {
            title: 'Regulatory Adherence',
            content: (
                <EmployeeAndManagerReview
                    formErrors={formErrors}
                    isPeer={true}
                    apprisalForm={apprisalForm}
                />
            )
        },
        {
            title: 'Training',
            content: <IndividualTrainingNeeds peer={true} apprisalForm={apprisalForm} />
        },
        {
            title: 'Preview',
            content: (
                <>
                    <SelfReview
                        peer={true}
                        apprisalForm={apprisalForm}
                        readOnly={true}
                        formErrors={formErrors}
                    />
                    <EmployeeAndManagerReview readOnly={true} apprisalForm={apprisalForm} />
                    <IndividualTrainingNeeds
                        peer={true}
                        apprisalForm={apprisalForm}
                        readOnly={true}
                    />
                </>
            )
        }
    ]

    return (
        <>
            {loading ? <DetailLoader /> : ''}{' '}
            {/* Show loading spinner if data is still being fetched */}
            <section className="section">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            {/* Displaying self details */}
                            <SelfDetails
                                apprisalForm={apprisalForm}
                                errors={formErrors}
                                readOnly={true}
                            />

                            <div className="card-">
                                {/* Ant Design Steps component to handle multi-step process */}
                                <Steps current={current} onChange={onChange} items={items} />

                                {/* Content of the current step */}
                                <div>{items[current].content}</div>
                                <div style={{ marginTop: 5 }}>
                                    {/* Navigation buttons for steps */}
                                    {current > 0 && (
                                        <Button
                                            variant="addbtn"
                                            className="Button"
                                            style={{ margin: '0 5px' }}
                                            onClick={() => prev()}
                                        >
                                            Previous
                                        </Button>
                                    )}
                                    <Button
                                        className="mb-2 Button"
                                        variant="addbtn"
                                        style={{ marginLeft: '37%' }}
                                        onClick={() => onSaveHandler('Submitted')}
                                    >
                                        Save
                                    </Button>
                                    {current < items.length - 2 && (
                                        <Button
                                            className="mb-2 Button "
                                            variant="addbtn"
                                            style={{ float: 'right', marginRight: '10px' }}
                                            onClick={() => next()}
                                        >
                                            Next
                                        </Button>
                                    )}
                                    {current === items.length - 2 && (
                                        <Button
                                            className="mb-2 Button"
                                            variant="addbtn"
                                            style={{ float: 'right', marginRight: '10px' }}
                                            onClick={() => next()}
                                        >
                                            Preview
                                        </Button>
                                    )}
                                    {current === items.length - 1 && (
                                        <Button
                                            className="mb-2 Button"
                                            variant="addbtn"
                                            style={{ float: 'right', marginRight: '10px' }}
                                            onClick={() => onSubmitHandler()}
                                        >
                                            Submit
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* Modal for confirmation before submission */}
            <Modal show={show} onHide={() => setShow(false)} backdrop="static" keyboard={false}>
                <Modal.Header className="" closeButton={() => setShow(false)}>
                    <Modal.Title>Submit?</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    Are you sure that you want to submit this Appraisal request?
                </Modal.Body>

                <div className="btnCenter mb-3">
                    <Button
                        className="Button"
                        variant="addbtn"
                        onClick={() => onSaveHandler('PeerReviewed')}
                    >
                        Yes
                    </Button>
                    <Button className="Button" variant="secondary" onClick={() => setShow(false)}>
                        No
                    </Button>
                </div>
            </Modal>
        </>
    )
}

export default PeerReview
