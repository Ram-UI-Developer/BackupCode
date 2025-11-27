import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import { getByIdwithOutOrg, updateWithoutOrg } from '../../../Common/Services/CommonService'
import { cancelButtonName } from '../../../Common/Utilities/Constants'

const Settings = () => {
    const [formData, setFormData] = useState({
        id: 1,
        email: '',
        automate: false,
        address1: '',
        address2: '',
        city: '',
        stateName: '',
        countryName: '',
        zipCode: ''
    }) // State for form data to update settings
    const [formErrors, setFormErrors] = useState({}) // State for Handling Errors
    const [isAutomate, setIsAutomate] = useState(false) // State for Checkbox
    const navigate = useNavigate() // declering navigation

    // Fetch Settings on component mount
    useEffect(() => {
        onGetByIdHandler(1)
    }, [])
    const onGetByIdHandler = (id) => {
        getByIdwithOutOrg({ entity: 'settings', id: id })
            .then((res) => {
                setFormData(res.data ? res.data : {})
                setIsAutomate(res.data.automate || false)
            })
            .catch((err) => {
                console.error(err)
            })
    }

    // Change the input with validation dynamically
    const onInputChange = (e) => {
        const { name, value } = e.target

        setFormData({
            ...formData,
            [name]: value.trimStart().replace(/\s+/g, ' ')
        })

        setFormErrors({
            ...formErrors,
            [name]: value ? '' : 'Required'
        })
    }

    // Update Settings using Api
    const updateSettings = () => {
        const obj = {
            id: 1,
            email: formData.email,
            automate: isAutomate,
            address1: formData.address1,
            address2: formData.address2,
            city: formData.city,
            stateName: formData.stateName,
            countryName: formData.countryName,
            zipCode: formData.zipCode
        }

        updateWithoutOrg({ entity: 'settings', id: 1, body: obj }).then((res) => {
            if (res.statusCode === 200) {
                toast.success('Updated Successfully.')
            } else {
                toast.error(res.errorMessage)
            }
        })
    }

    return (
        <div>
            <>
                <div>
                    <section className="section  detailBackground">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="">
                                        <PageHeader pageTitle={'Settings'} />
                                        <div className="center">
                                            <form className="card-body">
                                                <div className="col-">
                                                    <Form.Group
                                                        className="mb-3 justify-content-center"
                                                        as={Row}
                                                    >
                                                        <Form.Label column sm={4}>
                                                            Email <span className="error"> * </span>
                                                        </Form.Label>
                                                        <Col sm={7}>
                                                            <Form.Control
                                                                required
                                                                type="text"
                                                                name="email"
                                                                defaultValue={formData.email}
                                                                onChange={onInputChange}
                                                                onBlur={onInputChange}
                                                            />
                                                        </Col>
                                                    </Form.Group>
                                                </div>
                                                <div className="col-">
                                                    <Form.Group
                                                        className="mb-3 justify-content-center"
                                                        as={Row}
                                                    >
                                                        <Form.Label column sm={4}>
                                                            Auto Approve New Subscribers ?
                                                        </Form.Label>
                                                        <Col sm={7}>
                                                            <input
                                                                type="checkbox"
                                                                style={{ marginTop: '2.5%' }}
                                                                checked={isAutomate}
                                                                onChange={() =>
                                                                    setIsAutomate(!isAutomate)
                                                                }
                                                            />
                                                        </Col>
                                                    </Form.Group>
                                                    {/* Address Fields */}
                                                    <h5>Address Details</h5>
                                                    {/* Address Line 1 */}
                                                    <Form.Group
                                                        className="mb-3 justify-content-center"
                                                        as={Row}
                                                    >
                                                        <Form.Label column sm={4}>
                                                            Address 1
                                                        </Form.Label>
                                                        <Col sm={7}>
                                                            <Form.Control
                                                                type="text"
                                                                name="address1"
                                                                value={formData.address1}
                                                                onChange={onInputChange}
                                                            />
                                                        </Col>
                                                    </Form.Group>

                                                    {/* Address Line 2 */}
                                                    <Form.Group
                                                        className="mb-3 justify-content-center"
                                                        as={Row}
                                                    >
                                                        <Form.Label column sm={4}>
                                                            Address 2
                                                        </Form.Label>
                                                        <Col sm={7}>
                                                            <Form.Control
                                                                type="text"
                                                                name="address2"
                                                                value={formData.address2}
                                                                onChange={onInputChange}
                                                            />
                                                        </Col>
                                                    </Form.Group>

                                                    {/* City */}
                                                    <Form.Group
                                                        className="mb-3 justify-content-center"
                                                        as={Row}
                                                    >
                                                        <Form.Label column sm={4}>
                                                            City
                                                        </Form.Label>
                                                        <Col sm={7}>
                                                            <Form.Control
                                                                type="text"
                                                                name="city"
                                                                value={formData.city}
                                                                onChange={onInputChange}
                                                            />
                                                        </Col>
                                                    </Form.Group>

                                                    {/* State Name */}
                                                    <Form.Group
                                                        className="mb-3 justify-content-center"
                                                        as={Row}
                                                    >
                                                        <Form.Label column sm={4}>
                                                            State Name
                                                        </Form.Label>
                                                        <Col sm={7}>
                                                            <Form.Control
                                                                type="text"
                                                                name="stateName"
                                                                value={formData.stateName}
                                                                onChange={onInputChange}
                                                            />
                                                        </Col>
                                                    </Form.Group>

                                                    {/* Country Name */}
                                                    <Form.Group
                                                        className="mb-3 justify-content-center"
                                                        as={Row}
                                                    >
                                                        <Form.Label column sm={4}>
                                                            Country Name
                                                        </Form.Label>
                                                        <Col sm={7}>
                                                            <Form.Control
                                                                type="text"
                                                                name="countryName"
                                                                value={formData.countryName}
                                                                onChange={onInputChange}
                                                            />
                                                        </Col>
                                                    </Form.Group>

                                                    {/* Zip Code */}
                                                    <Form.Group
                                                        className="mb-4 justify-content-center"
                                                        as={Row}
                                                    >
                                                        <Form.Label column sm={4}>
                                                            Zip Code
                                                        </Form.Label>
                                                        <Col sm={7}>
                                                            <Form.Control
                                                                type="text"
                                                                name="zipCode"
                                                                value={formData.zipCode}
                                                                onChange={onInputChange}
                                                            />
                                                        </Col>
                                                    </Form.Group>
                                                </div>

                                                <div className="btnCenter mb-3">
                                                    <Button
                                                        type="button"
                                                        variant="addbtn"
                                                        className="Button"
                                                        onClick={() => updateSettings()}
                                                        style={{ marginRight: '2%' }}
                                                    >
                                                        Update
                                                    </Button>

                                                    <Button
                                                        variant="secondary"
                                                        type="button"
                                                        className="Button"
                                                        onClick={() => navigate('/subscriberList')}
                                                        style={{ marginRight: '2%' }}
                                                    >
                                                        {cancelButtonName}
                                                    </Button>
                                                    {/* </div> */}
                                                </div>
                                            </form>
                                            <div></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </>
        </div>
    )
}

export default Settings
