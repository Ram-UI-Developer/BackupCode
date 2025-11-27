import React, { useEffect, useState } from 'react' // Importing necessary React hooks
import { Button, Col, Form, Row } from 'react-bootstrap' // Importing bootstrap components for styling the form and buttons
import { useSelector } from 'react-redux' // Importing to use Redux for accessing global state
import { commonCrudSuccess } from '../../../../Common/CommonComponents/CustomizedSuccessToastMessages' // Importing utility for success toast message on update operation
import Loader from '../../../../Common/CommonComponents/Loader' // Importing general loader component
import { ToastError, ToastSuccess } from '../../../../Common/CommonComponents/ToastCustomized' // Importing customized success toast for UI
import { getById } from '../../../../Common/Services/CommonService' // Importing a service method to get data by ID
import {
    getUnMaskString,
    updateAccountNumber,
    updateEsiNumber,
    updatePanNumber,
    updatePfNumber,
    updateUanNumber
} from '../../../../Common/Services/OtherServices' // Importing various service methods for unmasking and updating data
import { toast } from 'react-toastify'

// MaskingModel functional component
const MaskingModel = ({
    employeeId,
    getAllEmployees,
    heading,
    onShowModalCloseHandler,
    setGetAllData,
    getAllDta
}) => {
    const userDetails = useSelector((state) => state.user.userDetails) // Getting user details from the Redux store
    const [unMasked, setUnMasked] = useState('') // State to store unmasked data for the selected field
    const [UnMaskData, setUnMaskedData] = useState([]) // State to store all employee data fetched by ID
    const [loading, setLoading] = useState(false) // State to handle loading state
    const handleKeyDown = (event) => {
        const { value } = event.target
        const key = event.key

        // Convert to lowercase to make the check case-insensitive
        const lowerKey = key.toLowerCase()

        // Allow only lowercase a-z and numbers 0-9
        const isLetter = lowerKey >= 'a' && lowerKey <= 'z'
        const isNumber = key >= '0' && key <= '9'

        // Allow control keys like Backspace, Arrow keys, etc.
        const allowedControlKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete']
        if (allowedControlKeys.includes(key)) {
            return
        }

        if (!isLetter && !isNumber) {
            event.preventDefault()
            return
        }

        // Prevent input if value is already 20+ chars and doesn't contain a '.'
        if (value.length >= 22 && !value.includes('.')) {
            event.preventDefault()
        }
    }

    // Function to handle save operation for updating masked data based on the heading
    const onSaveObj = () => {
        setLoading(true)

        const updateFunctions = {
            'Account Number': updateAccountNumber,
            'PF Number': updatePfNumber,
            'UAN Number': updateUanNumber,
            'Pan Number': updatePanNumber,
            'Esi Number': updateEsiNumber
        }

        const fieldKeyMap = {
            'Account Number': 'accountNumber',
            'PF Number': 'pfNumber',
            'UAN Number': 'uanNumber',
            'Pan Number': 'panNumber',
            'Esi Number': 'esiNumber'
        }

        const updateFunction = updateFunctions[heading]
        const fieldKey = fieldKeyMap[heading]

        if (!updateFunction || !fieldKey) {
            console.warn(`Invalid heading: ${heading}`)
            setLoading(false)
            return
        }

        const payload = {
            entity: 'employees',
            organizationId: userDetails.organizationId,
            id: employeeId,
            [fieldKey]: unMasked,
            toastSuccessMessage: commonCrudSuccess({
                screen: heading,
                operationType: 'update'
            })
        }
        if (unMasked == UnMaskData) {
            toast.info('No changes made to update')
            setLoading(false)
        } else if (error) {
            setLoading(false)
            toast.info(error) // Show error message if validation fails
        } else {
            updateFunction(payload)
                .then((res) => {
                    if (res.statusCode == 200) {
                        getAllEmployeeById()
                        ToastSuccess(res.message)
                        onShowModalCloseHandler()
                        getAllEmployees()
                        location.reload() // Reload the page to reflect changes
                    }
                })
                .catch((err) => {
                    setLoading(false)
                    console.log(err)
                    ToastError(err.message)
                })
        }
    }

    const fieldMap = {
        'Account Number': 'accountNumber',
        'PF Number': 'pfNumber',
        'UAN Number': 'pfUan',
        'Pan Number': 'panNumber',
        'Esi Number': 'esiNumber'
    }

    // Function to fetch unmasked value for the given field (Account Number, PF Number, etc.)
    const ongetHandler = () => {
        setLoading(true) // Set loading to true when fetching data

        const selectedField = fieldMap[heading]

        if (!selectedField) return

        const payload = {
            entity: 'employees',
            organizationId: userDetails.organizationId,
            masked: getAllDta[selectedField]
        }

        getUnMaskString(payload)
            .then((res) => {
                if (res.statusCode === 200) {
                    setUnMasked(res.data)
                    setUnMaskedData(res.data)
                    setLoading(false)
                }
            })
            .catch((err) => {
                console.error(err, 'err')
                onShowModalCloseHandler()
            })
    }

    const fieldLengthRules = {
        accountNumber: { min: 9, max: 18, label: 'Account Number' },
        panNumber: { min: 10, max: 10, label: 'PAN Number' },
        pfNumber: { min: 22, max: 22, label: 'PF Number' },
        pfUan: { min: 12, max: 12, label: 'UAN Number' },
        esiNumber: { min: 17, max: 17, label: 'ESI Number' }
    }
    const [error, setError] = useState() // State to handle form errors
    const onchangevalue = (e) => {
        const { value } = e.target
        // setFormData({ ...formData, [name]: value });
        setUnMasked(e.target.value)
        const selectedField = fieldMap[heading]
        console.log(selectedField, 'selectedField')
        let errorMsg = '' // Initialize error variable
        // Validate length and set error
        if (fieldLengthRules[selectedField]) {
            const { min, max, label } = fieldLengthRules[selectedField]
            if (
                value &&
                (value.length < min || value.length > max || (min === max && value.length !== min))
            ) {
                if (min === max) {
                    errorMsg = `${label} must be exactly ${min} characters.`
                } else if (value.length < min) {
                    errorMsg = `${label} must be at least ${min} characters.`
                } else if (value.length > max) {
                    errorMsg = `${label} must be at most ${max} characters.`
                }
            }
            setError(errorMsg)
        }
    }

    useEffect(() => {
        ongetHandler() // Call to fetch unmasked value when component is mounted
    }, [])

    // Function to fetch updated employee data
    const getAllEmployeeById = () => {
        getById({
            entity: 'employees',
            organizationId: userDetails.organizationId,
            id: employeeId
        }).then((res) => {
            if (res.statusCode == 200) {
                setLoading(false)
                setGetAllData(res.data) // Update the state with fetched data
            }
        })
    }

    return (
        <>
            {loading ? (
                <Loader /> // Display loader while data is loading
            ) : (
                <div>
                    <form className="modalFormBody">
                        <div className="col-">
                            <Form.Group as={Row} className="mb-3" controlId="totalEarnings">
                                <Form.Label id="totalEarnings" column sm={4}>
                                    {heading} <span className="error">*</span> 
                                </Form.Label>
                                <Col sm={7}>
                                    <Form.Control
                                        size='sm'
                                        id="totalEarnings"
                                        onPaste={(e) => e.preventDefault()}
                                        autoComplete="off"
                                        defaultValue={unMasked} // Set the input field value to the unmasked value
                                        name="totalEarnings"
                                        onChange={onchangevalue} // Call onchangevalue function when input changes
                                        maxLength={22}
                                        onKeyDown={handleKeyDown}
                                    />
                                    {error && (
                                        <p className="error" style={{ paddingRight: '50px' }}>
                                            {error}
                                        </p>
                                    )}
                                </Col>
                            </Form.Group>
                        </div>
                    </form>
                    <div className="btnCenter">
                        <Button
                            variant="addbtn"
                            id="UpdateMasking"
                            className="Button"
                            disabled={!unMasked || error} // Disable the button if unMasked is empty or there's an error
                            onClick={onSaveObj} // Call onSaveObj when save button is clicked
                        >
                            Update
                        </Button>
                        <Button
                            className="Button"
                            id="CloseMasking"
                            variant="secondary"
                            onClick={onShowModalCloseHandler} // Close the modal when close button is clicked
                        >
                            Close
                        </Button>
                    </div>
                </div>
            )}
        </>
    )
}
export default MaskingModel
