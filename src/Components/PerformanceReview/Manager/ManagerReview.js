import React, { useState, useEffect } from 'react'
import SelfReview from '../SelfReview/SelfReview'
import EmployeeAndManagerReview from '../ManagerReview/EmployeeAndManagerReview'
import IndividualTrainingNeeds from '../IndividualTrainingNeeds/IndividualTrainingNeeds'
import SelfDetails from '../Employee/SelfDetails'
import { Steps } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button, Modal } from 'react-bootstrap'
import { SaveWithId, getById } from '../../../Common/Services/OtherServices'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import { ToastError } from '../../../Common/CommonComponents/ToastCustomized'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'

const ManagerReview = () => {
    const userDetails = useSelector((state) => state.user.userDetails)

    const [current, setCurrent] = useState(0)
    const [apprisalForm, setApprisalForm] = useState({})
    const [formErrors, setFormErrors] = useState({})
    const appraisalFormId = useLocation().state
    const [show, setShow] = useState(false)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
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

    const [managerData, setManagerData] = useState([])

    const onSubmitHandler = () => {
        if (!apprisalForm.selfreviewDTO.accomplishments['mgrComments']) {
            setFormErrors(validate(apprisalForm))
            toast.error('Please fill all *required fields...')
        } else if (!apprisalForm.selfreviewDTO.additionalSkills['mgrComments']) {
            setFormErrors(validate(apprisalForm))
            toast.error('Please fill all *required fields...')
        } else if (apprisalForm.selfreviewDTO.mgrGoalDTOs.length == 0) {
            // setFormErrors(validate(apprisalForm.managerAssessmentDTO))
            toast.error('Please add Goals for next review...')
        } else if (apprisalForm.selfreviewDTO.jobKnowl['mgrRating'] == null) {
            setFormErrors(validate(apprisalForm))
            toast.error('Please fill all *required fields...')
        } else if (apprisalForm.selfreviewDTO.probSolve['mgrRating'] == null) {
            setFormErrors(validate(apprisalForm))
            toast.error('Please fill all *required fields...')
        } else if (apprisalForm.selfreviewDTO.teamWork['mgrRating'] == null) {
            setFormErrors(validate(apprisalForm))
            toast.error('Please fill all *required fields...')
        } else if (apprisalForm.selfreviewDTO.workQuality['mgrRating'] == null) {
            setFormErrors(validate(apprisalForm))
            toast.error('Please fill all *required fields...')
        } else if (apprisalForm.selfreviewDTO.commSkills['mgrRating'] == null) {
            setFormErrors(validate(apprisalForm))
            toast.error('Please fill all *required fields...')
        } else if (apprisalForm.regulatoryDTO.inTimeframe['mgrRating'] == null) {
            toast.error('Please Choose the Rating')
        } else if (apprisalForm.regulatoryDTO.standards['mgrRating'] == null) {
            toast.error('Please Choose the Rating')
        } else if (apprisalForm.regulatoryDTO.attendance['mgrRating'] == null) {
            toast.error('Please Choose the Rating')
        } else if (apprisalForm.regulatoryDTO.loyalty['mgrRating'] == null) {
            toast.error('Please Choose the Rating')
        } else if (apprisalForm.regulatoryDTO.collaborate['mgrRating'] == null) {
            toast.error('Please Choose the Rating')
        } else if (apprisalForm.regulatoryDTO.performance['mgrRating'] == null) {
            toast.error('Please Choose the Rating')
        } else if (apprisalForm.regulatoryDTO.effectiveness['mgrRating'] == null) {
            toast.error('Please Choose the Rating')
        } else if (apprisalForm.regulatoryDTO.listening['mgrRating'] == null) {
            toast.error('Please Choose the Rating')
        } else if (apprisalForm.regulatoryDTO.proactiveness['mgrRating'] == null) {
            toast.error('Please Choose the Rating')
        } else if (apprisalForm.regulatoryDTO.policies['mgrRating'] == null) {
            toast.error('Please Choose the Rating')
        } else if (apprisalForm.regulatoryDTO.adaptSituations['mgrRating'] == null) {
            toast.error('Please Choose the Rating')
        } else if (apprisalForm.regulatoryDTO.consistent['mgrRating'] == null) {
            toast.error('Please Choose the Rating')
        }
        // else if (apprisalForm.selfreviewDTO.goalDTOs["goalStatusEnum"] == 0) {
        //     // setFormErrors(validate(apprisalForm))
        //     toast.error('Please Select goals Status...')
        // }
        // else if (apprisalForm.selfreviewDTO.goalDTOs["goalStatusEnum"] == 0) {
        //     // setFormErrors(validate(apprisalForm))
        //     toast.error('Please Select Training Status...')
        // }
        else {
            setShow(true)
            setFormErrors({})
        }
    }

    const onSaveHandler = (e) => {
        apprisalForm.status = e
        setShow(false)
        setLoading(true)
        SaveWithId({
            entity: 'appraisals',
            organizationId: userDetails.organizationId,
            id: appraisalFormId.id,
            body: apprisalForm
        })
            .then((res) => {
                setShow(false)
                if (res.statusCode == 200) {
                    setLoading(false)
                    if (e == 'Submitted') {
                        toast.success('Saved Successfully.')
                    } else {
                        toast.success('Reviewed Successfully.')
                    }

                    navigate('/authorizeAppraisalList')
                }
            })
            .catch((err) => {
                setLoading(false)
                ToastError(err.message)
            })
    }

    console.log(apprisalForm, 'apprisalForm in manager review')
    const validate = (values) => {
        const errors = {}

        if (managerData.length == 0) {
            errors.empTrainingneeded = 'Required'
        }
        if (
            !values.selfreviewDTO.accomplishments['mgrComments'] ||
            values.selfreviewDTO.accomplishments['mgrComments'].length < 0
        ) {
            errors.accomplishmentsManager = 'Required'
        }
        if (
            !values.selfreviewDTO.additionalSkills['mgrComments'] ||
            values.selfreviewDTO.additionalSkills['mgrComments'].length < 0
        ) {
            errors.additionalSkillsManager = 'Required'
        }

        if (values.selfreviewDTO.jobKnowl['mgrRating'] == null) {
            errors.jobKnowlMgr = 'Required'
        }
        if (values.selfreviewDTO.probSolve['mgrRating'] == null) {
            errors.probSolveMgr = 'Required'
        }
        if (values.selfreviewDTO.teamWork['mgrRating'] == null) {
            errors.teamWorkMgr = 'Required'
        }
        if (values.selfreviewDTO.workQuality['mgrRating'] == null) {
            errors.workQualityMgr = 'Required'
        }
        if (values.selfreviewDTO.commSkills['mgrRating'] == null) {
            errors.commSkillsMgr = 'Required'
        }
        // if (values.selfreviewDTO.goalDTOs["goalStatusEnum"] == 0) {
        //     errors.managerReviewGoal = "Required"
        // }

        //  if (values.selfreviewDTO.goalDTOs["goalStatusEnum"] == 0) {
        //     errors.managerReviewTrain = "Required"
        // }

        // Core Skills
        // if (values.regulatoryDTO.inTimeframe["mgrRating"] == null) {
        //     errors.inTimeFrameMgr = "Required"
        // }
        // if (values.regulatoryDTO.standards["mgrRating"] == null) {
        //     errors.standardsMgr = "Required"
        // }
        // if (values.regulatoryDTO.attendance["mgrRating"] == null) {
        //      errors.attendanceMgr = "Required"
        // }
        // if (values.regulatoryDTO.loyalty["mgrRating"] == null) {
        //     errors.loyaltyMgr = "Required"
        // }
        // if (values.regulatoryDTO.collaborate["mgrRating"] == null) {
        //     errors.collaborateMgr = "Required"
        // }
        // if (values.regulatoryDTO.performance["mgrRating"] == null) {
        //     errors.performanceMgr = "Required"
        // }
        // if (values.regulatoryDTO.effectiveness["mgrRating"] == null) {
        //     errors.effectivenessMgr = "Required"
        // }
        // if (values.regulatoryDTO.listening["mgrRating"] == null) {
        //     errors.listeningMgr = "Required"
        // }
        // if (values.regulatoryDTO.proactiveness["mgrRating"] == null) {
        //     errors.proactivenessMgr = "Required"
        // }
        // if (values.regulatoryDTO. policies["mgrRating"] == null) {
        //     errors.policiesMgr = "Required"
        // }
        // if (values.regulatoryDTO.adaptSituations["mgrRating"] == null) {
        //     errors.adaptSituationsMgr = "Required"
        // }
        // if (values.regulatoryDTO.consistent["mgrRating"] == null) {
        //     errors.consistentMgr = "Required"
        // }

        return errors
    }

    const items = [
        {
            title: 'Employee Review',
            content: (
                <SelfReview apprisalForm={apprisalForm} manager={true} formErrors={formErrors} />
            )
        },
        {
            title: 'Regulatory Adherence',
            content: <EmployeeAndManagerReview isManager={true} apprisalForm={apprisalForm} />
        },
        {
            title: 'Training',
            content: (
                <IndividualTrainingNeeds
                    setManagerData={setManagerData}
                    manager={true}
                    apprisalForm={apprisalForm}
                />
            )
        },

        {
            title: 'Preview',
            content: (
                <>
                    <SelfReview apprisalForm={apprisalForm} isManager={true} readOnly={true} />
                    <EmployeeAndManagerReview apprisalForm={apprisalForm} readOnly={true} />
                    <IndividualTrainingNeeds
                        setManagerData={setManagerData}
                        manager={true}
                        apprisalForm={apprisalForm}
                        readOnly={true}
                    />
                    {/* <ManagerAssessment apprisalForm={apprisalForm} readOnly={true} formErrors={formErrors} /> */}
                </>
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

                            <div className=" ">
                                <Steps current={current} onChange={onChange} items={items} />
                                <div>{items[current].content}</div>
                                <div style={{ marginTop: 5 }}>
                                    {current > 0 && (
                                        <Button
                                            variant="addbtn"
                                            style={{ margin: '0 5px' }}
                                            onClick={() => prev()}
                                        >
                                            Previous
                                        </Button>
                                    )}
                                    <Button
                                        className="mb-2 Button"
                                        variant="addbtn"
                                        style={{ marginLeft: '39%' }}
                                        onClick={() =>
                                            onSaveHandler(
                                                apprisalForm.peerId == null
                                                    ? 'Submitted'
                                                    : 'PeerReviewed'
                                            )
                                        }
                                    >
                                        Save
                                    </Button>
                                    {current < items.length - 2 && (
                                        <Button
                                            className="mb-2 Button"
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
            <Modal show={show} onHide={() => setShow(false)} backdrop="static" keyboard={false}>
                <Modal.Header className="" closeButton={() => setShow(false)}>
                    <Modal.Title>Submit?</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    Are you sure you want to submit this appraisal request?
                </Modal.Body>
                <div className="btnCenter mb-3">
                    <Button
                        className="Button"
                        variant="addbtn"
                        onClick={() => onSaveHandler('Reviewed')}
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

export default ManagerReview
