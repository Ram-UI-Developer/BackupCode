import React, { useEffect, useState } from 'react'
import { Button, Col, Form, Modal, Row, Tabs, Tooltip } from 'react-bootstrap'
import Tab from 'react-bootstrap/Tab'
import { useSelector } from 'react-redux'
import Select from 'react-select'
import {
    handleKeyPress,
} from '../../../Common/CommonComponents/FormControlValidation'
import { AddIcon, DeleteIcon, EditIcon } from '../../../Common/CommonIcons/CommonIcons'
import { getAllByOrgId } from '../../../Common/Services/CommonService'
import Table from '../../../Common/Table/Table'

const Skills = ({ skillsList, setSkillget, dateOfBirth }) => {
    const userDetails = useSelector((state) => state.user.userDetails) // Retrieve user details from the Redux store using the useSelector hook
    const [show, setShow] = useState('') // Local state to control visibility of the modal (or any UI component)
    const [visible, setVisible] = useState(false) // Local state to manage whether a component is visible or not, possibly for a modal or dropdown
    const [formData, setFormData] = useState('') // Local state to store the form data which might be used for form submission
    const [data, setData] = useState(skillsList) // Local state for managing the list of skills, initially set to 'skillsList'

    const allowedDateOfJoining = new Date(dateOfBirth) // Set the allowed date of joining by calculating the date 18 years after the date of birth
    allowedDateOfJoining.setFullYear(allowedDateOfJoining.getFullYear() + 18)
    const yearsBefore = 18 // Define the age restriction (18 years)
    // Generate an array of years from the current year to the 18 years before, for selection in UI (such as a dropdown)
    const yearArray = Array.from({ length: yearsBefore }, (e, i) => {
        return allowedDateOfJoining.getFullYear() - i // Generate years back from the  calculated allowed year
    })
    // Handle changes in input fields by updating the formData state, keeping track of each field's value
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }
    // Update the 'data' state and fetch skill level when the skills list changes
    useEffect(() => {
        setData(skillsList)
    }, [skillsList])

    const [levelGet, setLevelGet] = useState([]) // Local state to store the list of skill levels fetched from an API
    // Function to fetch skill levels from the API based on the organization ID
    const getSkillLevel = () => {
        getAllByOrgId({ entity: 'skilllevels', organizationId: userDetails.organizationId }).then(
            (res) => {
                if (res.statusCode == 200) {
                    setLevelGet(res.data)
                }
            }
        )
            .catch((err) => {
                console.log(err, 'error') // Log any errors that occur during the API call
            })
    }
    // Mapping the skill levels into a format that can be used for the select options (label, value)
    const levelOptions = levelGet
        ? levelGet.map((option) => ({
            label: option.name,
            value: option.id
        }))
        : []
    // Local state to manage the selected skill level ID and its name
    const [level, setLevel] = useState('')
    const [levelName, setLevelName] = useState('')
    // Handler for skill level selection, updating the selected level ID and name
    const handleLevelSelection = (selection) => {
        setLevel(selection.value)
        setLevelName(selection.label)
    }
    const [formErrors, setFormErrors] = useState({}) // Local state to store form errors and validate inputs
    // Validation function to check if the necessary fields are filled out
    const validate = (values) => {
        const errors = {}
        if (!values.skill) {
            errors.skill = 'Required'
        }
        if (!values.levelId) {
            errors.levelId = 'Required'
        }
        if (!values.expInMonths) {
            errors.expInMonths = 'Required'
        }
        if (!values.expInYears) {
            errors.expInYears = 'Required'
            // alues.expInYears == '0' ||
            // errors.expInMonths = "Required";
        }
        if (!values.noOfProjectsWorked) {
            errors.noOfProjectsWorked = 'Required'
        }
        return errors
    }
    // Local state to manage the month selection for experience and used month
    const [monthSelect, setMonthSelect] = useState('')
    // Array of month options to be used in the select dropdown (01 to 12)
    const monthOptions = [
        { label: '0', value: '0' },
        { label: '01', value: '01' },
        { label: '02', value: '02' },
        { label: '03', value: '03' },
        { label: '04', value: '04' },
        { label: '05', value: '05' },
        { label: '06', value: '06' },
        { label: '07', value: '07' },
        { label: '08', value: '08' },
        { label: '09', value: '09' },
        { label: '10', value: '10' },
        { label: '11', value: '11' }
    ]
    // Handler to update the selected month for either experience in months or used month
    const handleMonthSelect = (select, action) => {
        if (action == 'expInMonths') {
            setMonthSelect(select.value)
        }
    }
    const [yearSelect, setYearSelect] = useState() // Local state to manage the year selection for experience
    // Mapping the generated yearArray into a format that can be used for the year select dropdown
    const yearOptions = yearArray.map((e) => ({
        label: e,
        value: e
    }))
    // Handler to update the selected year when the user selects a year
    const handleYearSelction = (select) => {
        setYearSelect(select.value)
    }
    // Function to save a new skill
    const saveSkill = () => {
        // Set default value of experience years to "0" if it's not provided
        // const expYears = formData.expInYears || '0'
        // Create an object containing all the skill data to be saved
        const SkillObj = {
            skill: formData.skill,
            levelId: level,
            expInYears: formData.expInYears,
            expInMonths: monthSelect,
            description: formData.description,
            levelName: levelName,
            lastUsedYear: yearSelect
            // lastUsedMonth: usedMonth,
        }

        // Validation checks to ensure the required fields are filled out
        if (!SkillObj.skill || SkillObj.skill == undefined) {
            setFormErrors(validate(SkillObj))
        } else if (SkillObj.levelId == '') {
            setFormErrors(validate(SkillObj))
        } else if (!SkillObj.expInYears) {
            setFormErrors(validate(SkillObj))
        } else if (!SkillObj.expInYears || SkillObj.expInMonths == '') {
            setFormErrors(validate(SkillObj))
        } else {
            // If all validations pass, add the skill data to the list
            const skiillData = [...data, SkillObj]
            setSkillget(skiillData)
            setData(skiillData)
            onCloseHandler()
        }
    }
    // Function to update an existing skill
    const updateSkill = () => {
        // Create an object to hold the updated skill data
        const SkillObjUpdate = {
            id: skillEdit.id,
            email: formData.email ? formData.email : skillEdit.email,
            skill: formData.skill !== undefined ? formData.skill : skillEdit.skill,
            levelId: level ? level : skillEdit.levelId,
            expInYears: formData.expInYears !== undefined ? formData.expInYears : skillEdit.expInYears,
            expInMonths: monthSelect,
            description: formData.description !== undefined ? formData.description : skillEdit.description,
            levelName: levelName ? levelName : skillEdit.levelName,
            lastUsedYear: yearSelect,
            organizationId: skillEdit.organizationId
            // lastUsedMonth: usedMonth
        }

        // Validation checks to ensure the required fields are filled out
        if (!SkillObjUpdate.skill || SkillObjUpdate.skill == undefined) {
            setFormErrors(validate(SkillObjUpdate))
        } else if (SkillObjUpdate.levelId == '') {
            setFormErrors(validate(SkillObjUpdate))
        } else if (!SkillObjUpdate.expInYears) {
            setFormErrors(validate(SkillObjUpdate))
        } else if (!SkillObjUpdate.expInMonths || SkillObjUpdate.expInMonths == '') {
            setFormErrors(validate(SkillObjUpdate))
        } else {
            // If all validations pass, update the skill in the data array
            const skillData = [...skillsList]
            skillData[index] = SkillObjUpdate
            setSkillget(skillData)
            onCloseHandler()
        }
    }
    const [index, setIndex] = useState(null) // State to track the index of the skill being edited
    // columns for skills table
    const COLUMNS = [
        {
            Header: 'Skill',
            accessor: 'skill',
            Cell: ({ row }) => (
                <>
                    {!show && (
                        <Tooltip title={row.original.skill} open>
                            {row.original.skill}
                        </Tooltip>
                    )}
                    <div className="tableLength">{row.original.skill}</div>
                </>
            )
        },
        {
            Header: 'Level',
            accessor: 'levelName',
            Cell: ({ row }) => <span>{row.original.levelName}</span>
        },
        {
            Header: 'Experience',
            accessor: '',
            Cell: ({ row }) => (
                <span>
                    {row.original.expInYears}Y-{row.original.expInMonths}M
                </span>
            )
        },
        {
            Header: 'Description',
            accessor: 'description',
            Cell: ({ row }) => (
                <>
                    {!show && (
                        <Tooltip title={row.original.description} open>
                            {row.original.description}
                        </Tooltip>
                    )}
                    <div className="tableLength">{row.original.description}</div>
                </>
            )
        },

        {
            Header: () => <div className="text-wrap text-right actions">Actions</div>,
            accessor: 'actions',
            disableSortBy: true,
            Cell: ({ row }) => (
                <>
                    <div className="text-wrap text-right actionsWidth">
                        <Button
                            id="editSkill"
                            variant=""
                            className="iconWidth"
                            onClick={() => onShowHandler('update', row.original, row.index)}
                        >
                            <EditIcon />
                        </Button>
                        |
                        <Button
                            id="deleteSkill"
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

    const [deleteShow, setDeleteShow] = useState(false) // State for controlling the visibility of the delete confirmation modal
    const [indexs, setIndexS] = useState() // State to track the index of the item to be deleted
    // Function to handle the removal of an item, it shows the confirmation modal and sets the index of the item to delete
    const handleRemove = (index) => {
        setDeleteShow(true)
        setIndexS(index)
    }
    // Function to handle the proceed button in the delete confirmation modal
    const proceedDeleteHandler = (e) => {
        e.preventDefault()
        const rows = [...data]
        rows.splice(indexs, 1)
        setSkillget(rows)
        setDeleteShow(false)
    }
    const [skillEdit, setSkillEdit] = useState({}) // State to manage the data of the skill being edited
    // Function to handle showing the modal for either creating or updating a skill
    const onShowHandler = (action, row, index) => {
        getSkillLevel()
        setIndex(index)
        if (action == 'create') {
            setVisible('create')
            setShow(true)
            setFormData('')
            setLevel('')
        } else {
            setSkillEdit(row)
            setFormData(row)
            setVisible('update')
            setLevel(row.levelId)
            setMonthSelect(row.expInMonths)
            setYearSelect(row.lastUsedYear)
            setShow(true)
        }
    }
    // Function to handle closing the form/modal and resetting the form's state
    const onCloseHandler = () => {
        setShow(false)
        setDeleteShow(false)
        setSkillEdit('')
        setYearSelect('')
        setFormErrors({})
        setMonthSelect('')
    }
    // Function to handle keyboard input for validating numeric fields
    const handleKeyDown = (event) => {
        const key = String.fromCharCode(event.charCode)
        const { name, value } = event.target
        const isDigit = key >= '0' && key <= '9'
        const isDot = key === '.'

        if (!isDigit && !isDot) {
            event.preventDefault()
        }
        // Checks if the value exceeds the allowed number range based on the length of the year array
        else if (value > yearArray.length.toString()) {
            event.preventDefault()
            setFormErrors({ ...formErrors, [name]: 'Enter valid number' })
        }
        // Prevents the input if the value length reaches 2 and does not include a dot (decimal point)
        if (value.length >= 2 && !value.includes('.')) {
            event.preventDefault()
        }
    }
    return (
        <>
            <Tabs>
                <Tab eventKey="family">
                    <div className="card-body" style={{ marginTop: '1%' }}>
                        <Button
                            id="addSkill"
                            className="addButton"
                            variant="addbtn"
                            onClick={() => onShowHandler('create')}
                        >
                            <AddIcon />
                            {/* Displays the AddIcon component inside the button */}
                        </Button>
                        {/* Table component displays the data in a table format */}
                        {data ? (
                            <Table
                                columns={COLUMNS}
                                data={data}
                                serialNumber={true}
                                name={'skill records'}
                            />
                        ) : (
                            <p className="emptyDataMessage">No skill records added yet!</p>
                        )}
                    </div>
                </Tab>
            </Tabs>
            <Modal className="" show={show} onHide={onCloseHandler} size="xl">
                <Modal.Header closeButton={onCloseHandler}>
                    <Modal.Title>Skill</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* input fields for skills form */}
                    <div className="">
                        <form className="modalFormBody">
                            <Row>
                                <div className="col-7">
                                    <Form.Group as={Row} className="mb-3" controlId="skillName">
                                        <Form.Label id="skillName" column sm={3}>
                                            Skill <span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={6}>
                                            <Form.Control
                                                id="skillName"
                                                maxLength={50}
                                                onChange={handleInputChange}
                                                required
                                                // onKeyPress={(e) => handleKeyPress(e)}
                                                onBlur={(e) =>
                                                    !e.target.value
                                                        ? setFormErrors({
                                                            ...formErrors,
                                                            skill: 'Required'
                                                        })
                                                        : setFormErrors({
                                                            ...formErrors,
                                                            skill: ''
                                                        })
                                                }
                                                defaultValue={skillEdit && skillEdit.skill}
                                                name="skill"
                                                type="text"
                                                size="sm"
                                                onKeyPress={(e) => handleKeyPress(e, setFormErrors)}
                                                onPaste={(e) => handleKeyPress(e, setFormErrors)}
                                                onInput={(e) => handleKeyPress(e, setFormErrors)}
                                            />
                                            {formErrors.skill && (
                                                <p className="error">{formErrors.skill}</p>
                                            )}
                                        </Col>
                                    </Form.Group>
                                </div>

                                <div className="col-5">
                                    <Form.Group as={Row} className="mb-3" controlId="skillLevel">
                                        <Form.Label id="skillLevel" column sm={4}>
                                            Level <span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={8}>
                                            <Select
                                                size="sm"
                                                id="skillLevel"
                                                required
                                                placeholder=""
                                                name="levelId"
                                                value={levelOptions.filter((e) => e.value == level)}
                                                onBlur={() =>
                                                    !level
                                                        ? setFormErrors({
                                                            ...formErrors,
                                                            levelId: 'Required'
                                                        })
                                                        : setFormErrors({
                                                            ...formErrors,
                                                            levelId: ''
                                                        })
                                                }
                                                onChange={handleLevelSelection}
                                                options={levelOptions}
                                            />
                                            <p className="error">{formErrors.levelId}</p>
                                        </Col>
                                    </Form.Group>
                                </div>

                                <div className="col-7">
                                    <Form.Group
                                        as={Row}
                                        className="mb-3"
                                        controlId="skillExperience"
                                    >
                                        <Form.Label id="skillExperience" column sm={3}>
                                            Experience <span className="error">*</span>
                                        </Form.Label>
                                        <Col sm={3}>
                                            <Form.Control
                                                id="skillExperience"
                                                onChange={handleInputChange}
                                                type="number"
                                                min={0}
                                                size='sm'
                                                max={50}
                                                maxLength={2}
                                                onKeyPress={handleKeyDown}
                                                placeHolder="Years"
                                                onBlur={(e) =>
                                                    !e.target.value
                                                        ? setFormErrors({
                                                            ...formErrors,
                                                            expInYears: 'Required'
                                                        })
                                                        : setFormErrors({
                                                            ...formErrors,
                                                            expInYears: ''
                                                        })
                                                }
                                                defaultValue={skillEdit && skillEdit.expInYears}
                                                name="expInYears"
                                            />
                                            <p
                                                style={{
                                                    textWrap: 'nowrap',
                                                    marginRight:
                                                        formErrors.expInYears ==
                                                            'Enter valid number'
                                                            ? '3.5rem'
                                                            : ''
                                                }}
                                                className="error"
                                            >
                                                {formErrors.expInYears}
                                            </p>
                                        </Col>
                                        <Col sm={3}>
                                            <Select
                                                size="sm"
                                                id="skillExperience"
                                                placeholder="Months"
                                                onChange={(e) =>
                                                    handleMonthSelect(e, 'expInMonths')
                                                }
                                                options={monthOptions}
                                                className="text-right"
                                                onBlur={() =>
                                                    !monthSelect
                                                        ? setFormErrors({
                                                            ...formErrors,
                                                            expInMonths: 'Required'
                                                        })
                                                        : setFormErrors({
                                                            ...formErrors,
                                                            expInMonths: ''
                                                        })
                                                }
                                                value={monthOptions.filter(
                                                    (e) => e.value == monthSelect
                                                )}
                                            />
                                            <p className="error">{formErrors.expInMonths}</p>
                                        </Col>
                                    </Form.Group>
                                </div>

                                <div className="col-5">
                                    <Form.Group as={Row} className="mb-3" controlId="skillLastUsed">
                                        <Form.Label id="skillLastUsed" column sm={4}>
                                            Last Used
                                        </Form.Label>
                                        <Col sm={5}>
                                            <Select
                                                size="sm"
                                                id="skillLastUsed"
                                                options={yearOptions}
                                                onChange={handleYearSelction}
                                                required
                                                placeholder="Year"
                                                isDisabled={allowedDateOfJoining == 'Invalid Date'}
                                                onBlur={() =>
                                                    !yearSelect
                                                        ? setFormErrors({
                                                            ...formErrors,
                                                            noOfProjectsWorked: 'Required'
                                                        })
                                                        : setFormErrors({
                                                            ...formErrors,
                                                            noOfProjectsWorked: ''
                                                        })
                                                }
                                                value={yearOptions.filter(
                                                    (e) => e.value == yearSelect
                                                )}
                                            />
                                        </Col>
                                    </Form.Group>
                                </div>

                                <div className="col-7">
                                    <Form.Group
                                        as={Row}
                                        className="mb-3"
                                        controlId="skillDescription"
                                    >
                                        <Form.Label id="skillDescription" column sm={3}>
                                            Description
                                        </Form.Label>
                                        <Col sm={6}>
                                            <Form.Control
                                                id="skillDescription"
                                                required
                                                rows={3}
                                                size="sm"
                                                as="textarea"
                                                name="description"
                                                onChange={handleInputChange}
                                                maxLength={150}
                                                placeholder="e.g:Built interactive web applications using React and Node.js..."
                                                defaultValue={skillEdit && skillEdit.description}
                                            />
                                        </Col>
                                    </Form.Group>
                                </div>
                            </Row>
                        </form>
                    </div>
                </Modal.Body>
                {/* save and update buttons */}
                <div className="btnCenter" style={{ margin: '2% 0% 2% 0%' }}>
                    {visible == 'create' && (
                        <Button
                            id="cretaeSkill"
                            className="Button"
                            variant="addbtn"
                            onClick={saveSkill}
                        >
                            Add
                        </Button>
                    )}
                    {visible == 'update' && (
                        <Button
                            id="updateSkill"
                            className="Button"
                            onClick={updateSkill}
                            variant="addbtn"
                        >
                            Update
                        </Button>
                    )}
                    <Button
                        id="closeSkill"
                        className="Button"
                        variant="secondary"
                        onClick={onCloseHandler}
                    >
                        Close
                    </Button>
                </div>
            </Modal>
            {/* delete modal popup */}
            <Modal show={deleteShow} onHide={onCloseHandler} backdrop="static" keyboard={false}>
                <Modal.Header closeButton={onCloseHandler}>
                    <Modal.Title>Delete ?</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    Are you sure you want to delete this item?
                </Modal.Body>
                <div className="btnCenter mb-3">
                    <Button
                        id="deleteYes"
                        className="Button"
                        variant="addbtn"
                        onClick={proceedDeleteHandler}
                    >
                        Yes
                    </Button>
                    <Button
                        id="deleteNo"
                        className="Button"
                        variant="secondary"
                        onClick={onCloseHandler}
                    >
                        No
                    </Button>
                </div>
            </Modal>
        </>
    )
}
export default Skills
