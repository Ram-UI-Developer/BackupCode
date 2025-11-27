import { Steps } from 'antd'
import { useEffect, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { toast } from 'react-toastify'
import IndividualTrainingNeeds from '../IndividualTrainingNeeds/IndividualTrainingNeeds'
import EmployeeAndManagerReview from '../ManagerReview/EmployeeAndManagerReview'
import SelfReview from '../SelfReview/SelfReview'
import SelfDetails from './SelfDetails'
// import { getById } from '../../../Common/Services/CommonService';
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import { res, validate } from 'react-email-validator'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'
import { getAllById } from '../../../Common/Services/CommonService'
import { SaveWithId, getById } from '../../../Common/Services/OtherServices'

const EmpReview = () => {
    const userDetails = useSelector((state) => state.user.userDetails)
    const [current, setCurrent] = useState(0)
    const [countries, setCountries] = useState()

    const [apprisalForm, setApprisalForm] = useState({})
    const appraisalFormId = useLocation().state
    const [show, setShow] = useState(false)
    const [countryIsoCode, setCountryIsoCode] = useState()

    const [countryIsdCode, setCountryIsdCode] = useState()
    const navigate = useNavigate()
    const [formErrors, setFormErrors] = useState({})
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
        onGetCountriesHandler()
    }, [])
    useEffect(() => {
    if (countries&&countries.length > 0) {
        onGetApprisalHandlerById(countries)
    }
}, [countries])
    const onGetCountriesHandler = () => {
        setLoading(true)
        getAllById({
            entity: 'organizationCountry',
            organizationId: userDetails.organizationId
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setLoading(false)
                    const filteredCountries = res.data.filter((country) => !country.deleted)
                    setCountries(filteredCountries)
                }
            })
            .catch((err) => {
                setLoading(false)
                console.log(err, 'error')
            })
    }

    const onGetApprisalHandlerById = (filteredCountries) => {
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

                    if (filteredCountries) {
                        const matchedCountry =
                            filteredCountries &&
                            filteredCountries.find(
                                (country) => country.countryId === res.data.countryId
                            )

                        if (matchedCountry) {
                            setCountryIsoCode(matchedCountry.isoCode + '+' + matchedCountry.isdCode)
                            setCountryIsdCode(matchedCountry.isdCode)
                        }
                    }
                }
            })
            .catch((err) => {
                setLoading(false)
                console.log(err, 'error')
            })
    }

   

    const onSubmitHandler = () => {
        let value = '+' + countryIsdCode + apprisalForm.managerContactNumber
        const phoneNumber = parsePhoneNumberFromString(value, countryIsoCode)

        if (!apprisalForm.projects) {
            setFormErrors(validater(apprisalForm))
            toast.error(`Please fill all *required fields...`)
        } else if (apprisalForm.managerContactNumber && apprisalForm.countryId == null) {
            toast.error('Please Choose the country field')
        } else if (phoneNumber && !phoneNumber.isValid()) {
            toast.error('Please enter valid phone number')
        } else if (!apprisalForm.selfreviewDTO.accomplishments['empComments']) {
            setFormErrors(validater(apprisalForm))
            toast.error('Please fill all *required fields...')
        } else if (!apprisalForm.selfreviewDTO.additionalSkills['empComments']) {
            setFormErrors(validater(apprisalForm))
            toast.error('Please fill all *required fields...')
        } else if (!apprisalForm.selfreviewDTO.jobKnowl['employeeReview']) {
            setFormErrors(validater(apprisalForm))
            toast.error('Please fill all *required fields...')
        } else if (!apprisalForm.selfreviewDTO.probSolve['employeeReview']) {
            setFormErrors(validater(apprisalForm))
            toast.error('Please fill all *required fields...')
        } else if (!apprisalForm.selfreviewDTO.teamWork['employeeReview']) {
            setFormErrors(validater(apprisalForm))
            toast.error('Please fill all *required fields...')
        } else if (!apprisalForm.selfreviewDTO.workQuality['employeeReview']) {
            setFormErrors(validater(apprisalForm))
            toast.error('Please fill all *required fields...')
        } else if (!apprisalForm.selfreviewDTO.commSkills['employeeReview']) {
            setFormErrors(validater(apprisalForm))
            toast.error('Please fill all *required fields...')
        } else if (apprisalForm.regulatoryDTO.inTimeframe['empRating'] == null) {
            toast.error('Please Choose the Rating')
        } else if (apprisalForm.regulatoryDTO.standards['empRating'] == null) {
            toast.error('Please Choose the Rating')
        } else if (apprisalForm.regulatoryDTO.attendance['empRating'] == null) {
            toast.error('Please Choose the Rating')
        } else if (apprisalForm.regulatoryDTO.loyalty['empRating'] == null) {
            toast.error('Please Choose the Rating')
        } else if (apprisalForm.regulatoryDTO.collaborate['empRating'] == null) {
            toast.error('Please Choose the Rating')
        } else if (apprisalForm.regulatoryDTO.performance['empRating'] == null) {
            toast.error('Please Choose the Rating')
        } else if (apprisalForm.regulatoryDTO.effectiveness['empRating'] == null) {
            toast.error('Please Choose the Rating')
        } else if (apprisalForm.regulatoryDTO.listening['empRating'] == null) {
            toast.error('Please Choose the Rating')
        } else if (apprisalForm.regulatoryDTO.proactiveness['empRating'] == null) {
            toast.error('Please Choose the Rating')
        } else if (apprisalForm.regulatoryDTO.policies['empRating'] == null) {
            toast.error('Please Choose the Rating')
        } else if (apprisalForm.regulatoryDTO.adaptSituations['empRating'] == null) {
            toast.error('Please Choose the Rating')
        } else if (apprisalForm.regulatoryDTO.consistent['empRating'] == null) {
            toast.error('Please Choose the Rating')
        } else {
            setFormErrors({})
            validate(apprisalForm && apprisalForm.managerEmail)
            if (!res) {
                setFormErrors({ ...formErrors, managerEmail: 'Enter Valid Email' })
                toast.error('Please Enter Valid Email...')
            } else {
                setShow(true)
                setFormErrors({})
            }
        }
    }

    const onSaveHandler = (e) => {
        let value = '+' + countryIsdCode + apprisalForm.managerContactNumber
        const phoneNumber = parsePhoneNumberFromString(value, countryIsoCode)
        if (apprisalForm.managerContactNumber && apprisalForm.countryId == null) {
            toast.error('Please Choose the country field')
        } else if (
            apprisalForm.managerContactNumber &&
            apprisalForm.managerContactNumber.length == 1
        ) {
            toast.error('Please enter valid phone number')
        } else if (phoneNumber && !phoneNumber.isValid()) {
            toast.error('Please enter valid phone number')
        } else {
            setLoading(true)
            apprisalForm.status = e
            setShow(false)

            SaveWithId({
                entity: 'appraisals',
                id: appraisalFormId.id,
                organizationId: userDetails.organizationId,
                body: apprisalForm
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        setLoading(false)
                        if (e == 'Saved') {
                            toast.success('Saved Successfully.')
                        } else {
                            toast.success('Submitted Successfully.')
                        }
                        navigate('/appraisalList')
                    }
                })
                .catch((err) => {
                    setLoading(false)
                    toast.error(err.message)
                    console.log(err, 'error')
                })
        }
    }

    const validater = (values) => {
        const errors = {}
        if (!values.projects || values.projects.length < 0) {
            errors.projects = 'Required'
        } else {
            errors.projects = ' '
        }

        if (
            !values.selfreviewDTO.accomplishments['empComments'] ||
            values.selfreviewDTO.accomplishments['empComments'].length < 0
        ) {
            errors.accomplishments = 'Required'
        } else {
            errors.accomplishments = ' '
        }
        if (
            !values.selfreviewDTO.additionalSkills['empComments'] ||
            values.selfreviewDTO.additionalSkills['empComments'].length < 0
        ) {
            errors.additionalSkills = 'Required'
        }
        if (
            !values.selfreviewDTO.jobKnowl['employeeReview'] ||
            values.selfreviewDTO.jobKnowl['employeeReview'].length < 0
        ) {
            errors.jobKnowlEmp = 'Required'
        }
        if (
            !values.selfreviewDTO.probSolve['employeeReview'] ||
            values.selfreviewDTO.probSolve['employeeReview'].length < 0
        ) {
            errors.probSolveEmp = 'Required'
        } else {
            errors.probSolveEmp = ' '
        }
        if (
            !values.selfreviewDTO.teamWork['employeeReview'] ||
            values.selfreviewDTO.teamWork['employeeReview'].length < 0
        ) {
            errors.teamWorkEmp = 'Required'
        } else {
            errors.teamWorkEmp = ' '
        }
        if (
            !values.selfreviewDTO.workQuality['employeeReview'] ||
            values.selfreviewDTO.workQuality['employeeReview'].length < 0
        ) {
            errors.workQualityEmp = 'Required'
        } else {
            errors.workQualityEmp = ' '
        }
        if (
            !values.selfreviewDTO.commSkills['employeeReview'] ||
            values.selfreviewDTO.commSkills['employeeReview'].length < 0
        ) {
            errors.commSkillsEmp = 'Required'
        } else {
            errors.commSkillsEmp = ' '
        }
        return errors
    }
    const  setManagerData= null;

    const items = [
        {
            title: 'Self Review',
            content: (
                <SelfReview
                    employee={true}
                    apprisalForm={apprisalForm}
                    formErrors={formErrors}
                    // readOnly={true}
                    // isPeer={true}
                />
            )
        },
        {
            title: 'Regulatory Adherence',
            content: <EmployeeAndManagerReview isEmployee={true} apprisalForm={apprisalForm} />
        },
        {
            title: 'Training',
            content: (
                <IndividualTrainingNeeds
                    setManagerData={setManagerData}
                    employee={true}
                    apprisalForm={apprisalForm}
                />
            )
        },

        {
            title: 'Preview',
            content: (
                <>
                    <SelfReview
                        apprisalForm={apprisalForm}
                        employee={true}
                        readOnly={true}
                        formErrors={formErrors}
                    />
                    <EmployeeAndManagerReview
                        apprisalForm={apprisalForm}
                        isEmployee={true}
                        readOnly={true}
                    />
                    <IndividualTrainingNeeds
                        setManagerData={setManagerData}
                        employee={true}
                        apprisalForm={apprisalForm}
                        readOnly={true}
                    />
                </>
            )
        }
    ]

    return (
        <>
            <section className="section">
                {loading ? <DetailLoader /> : ''}
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <SelfDetails
                                countryIsdCode={countryIsdCode}
                                countryIsoCode={countryIsoCode}
                                apprisalForm={apprisalForm}
                                errors={formErrors}
                            />

                            <div className="">
                                <Steps current={current} onChange={onChange} items={items} />

                                <div>{items[current].content}</div>
                                <div style={{ marginTop: 5 }}>
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
                                        onClick={() => onSaveHandler('Saved')}
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
            <Modal show={show} onHide={() => setShow(false)} backdrop="static" keyboard={false}>
                <Modal.Header className="" closeButton onHide={() => setShow(false)}>
                    <Modal.Title>Submit?</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    Are you sure that you want to submit this Appraisal request?
                </Modal.Body>

                <div className="btnCenter mb-3">
                    <Button
                        className="Button"
                        variant="addbtn"
                        onClick={() => onSaveHandler('Submitted')}
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

export default EmpReview
