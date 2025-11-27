import { Steps } from 'antd'
import { useEffect, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { toast } from 'react-toastify'
import SelfDetails from '../Employee/SelfDetails'
import HrdList from '../HRDUseOnly/HrdList'
import IndividualTrainingNeeds from '../IndividualTrainingNeeds/IndividualTrainingNeeds'
import EmployeeAndManagerReview from '../ManagerReview/EmployeeAndManagerReview'
import SelfReview from '../SelfReview/SelfReview'
// import { getById, save } from '../../../Common/Services/CommonService';
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'
import { ToastError } from '../../../Common/CommonComponents/ToastCustomized'
import { SaveWithId, getById } from '../../../Common/Services/OtherServices'

const HRReview = () => {
    const userDetails = useSelector((state) => state.user.userDetails)
    const [current, setCurrent] = useState(0)
    const [loading, setLoading] = useState(true)
    const onChange = (value) => {
        setCurrent(value)
    }

    const next = () => {
        setCurrent(current + 1)
    }

    const prev = () => {
        setCurrent(current - 1)
    }

    useEffect(() => {
        onGetApprisalHandlerById()
    }, [])

    const [apprisalForm, setApprisalForm] = useState({})
    const appraisalFormId = useLocation().state
    const onGetApprisalHandlerById = () => {
        setLoading(true)
        getById({
            entity: 'appraisals',
            organizationId: userDetails.organizationId,
            id: appraisalFormId.id
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setLoading(false)
                    setApprisalForm(res.data)
                }
            })
            .catch((err) => {
                setLoading(false)
                console.log(err, 'error')
            })
    }

    const navigate = useNavigate()
    const [formErrors, setFormErrors] = useState({})
    const validate = (values) => {
        const errors = {}

        if (values.recommendedCTC == null) {
            errors.recommendedCTC = 'Required'
        }
        if (values.year == null) {
            errors.year = 'Required'
        }
        if (values.recommendedDesignation == null) {
            errors.recommendedDesignation = 'Required'
        }
        if (!values.overallRating) {
            errors.overallRating = 'Required'
        }
        if (!values.percentageOfHike) {
            errors.percentageOfHike = 'Required'
        }
        return errors
    }

    const onHRDSaveHandler = (e) => {
        apprisalForm.status = e
        setLoading(true)
        SaveWithId({
            entity: 'appraisals',
            organizationId: userDetails.organizationId,
            id: appraisalFormId.id,
            body: apprisalForm
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setLoading(false)
                    toast.success('Reviewed Successfully.')
                    navigate('/HRReviewList')
                }
            })
            .catch((err) => {
                setLoading(false)
                setShow(false)
                ToastError(err.message)
            })
    }

    const [show, setShow] = useState(false)

    const handleSubmitShow = () => {
        if (!apprisalForm.hrReviewDTO.recommendedCTC) {
            setFormErrors(validate(apprisalForm.hrReviewDTO))
            toast.error('Please fill all *required fields...')
        } else if (
            apprisalForm.hrReviewDTO.recommendedDesignation == null ||
            apprisalForm.hrReviewDTO.recommendedDesignation == ''
        ) {
            setFormErrors(validate(apprisalForm.hrReviewDTO))
            toast.error('Please fill all *required fields...')
        } else if (!apprisalForm.hrReviewDTO.percentageOfHike) {
            setFormErrors(validate(apprisalForm.hrReviewDTO))
            toast.error('Please fill all *required fields...')
        } else if (!apprisalForm.hrReviewDTO.overallRating) {
            setFormErrors(validate(apprisalForm.hrReviewDTO))
            toast.error('Please fill all *required fields...')
        } else if (apprisalForm.hrReviewDTO.year == null) {
            setFormErrors(validate(apprisalForm.hrReviewDTO))
            toast.error('Please fill all *required fields...')
        } else {
            setShow(true)
            setFormErrors({})
        }
    }
    const [ setManagerData] = useState([])

    const items = [
        {
            title: 'Employee Review',
            content: <SelfReview isHr={true} apprisalForm={apprisalForm} readOnly={true} />
        },

        {
            title: 'Core Skills',
            content: (
                <EmployeeAndManagerReview
                    apprisalForm={apprisalForm}
                    isManager={true}
                    readOnly={true}
                />
            )
        },
        {
            title: 'Training',
            content: (
                <IndividualTrainingNeeds
                    setManagerData={setManagerData}
                    apprisalForm={apprisalForm}
                    isHr={true}
                    readOnly={true}
                />
            )
        },
        // {
        //     title: 'Manager Assessment',
        //     content: <ManagerAssessment apprisalForm={apprisalForm} readOnly={true} />
        // },

        {
            title: 'HRD',
            content: (
                <HrdList
                    error={formErrors}
                    setFormErrors={setFormErrors}
                    apprisalForm={apprisalForm}
                />
            )
        }
    ]

    return (
        <>
            {loading ? <DetailLoader /> : ''}
            <section className="section">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <SelfDetails apprisalForm={apprisalForm} readOnly={true} />

                            <div className=" card-">
                                <Steps current={current} onChange={onChange} items={items} />
                                <div>{items[current].content}</div>
                                <div style={{ marginTop: 24 }}>
                                    {current > 0 && (
                                        <Button
                                            style={{ margin: '0 8px', marginBottom: '1%' }}
                                            variant="addbtn"
                                            className="Button"
                                            onClick={() => prev()}
                                        >
                                            Previous
                                        </Button>
                                    )}
                                    {current < items.length - 1 && (
                                        <Button
                                            style={{ float: 'right', marginBottom: '1%' }}
                                            variant="addbtn"
                                            className="Button"
                                            onClick={() => next()}
                                        >
                                            Next
                                        </Button>
                                    )}
                                    {apprisalForm.status == 'Completed' ? (
                                        <>
                                            {current == items.length - 1 && (
                                                <Button
                                                    style={{ float: 'right', marginBottom: '1%' }}
                                                    variant="secondary"
                                                    className="Button"
                                                    onClick={() => navigate('/HRReviewList')}
                                                >
                                                    Back
                                                </Button>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            {current == items.length - 1 && (
                                                <Button
                                                    style={{ float: 'right', marginBottom: '1%' }}
                                                    variant="addbtn"
                                                    className="Button"
                                                    onClick={handleSubmitShow}
                                                >
                                                    Complete
                                                </Button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

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
                        onClick={() => onHRDSaveHandler('Completed')}
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

export default HRReview
