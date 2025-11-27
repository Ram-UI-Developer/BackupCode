import React, { useState } from 'react' // Importing React and hooks for state and effect handling
import { Button, Form, Modal } from 'react-bootstrap' // Importing components from 'react-bootstrap' for UI elements
import { DeleteIcon } from '../../../Common/CommonIcons/CommonIcons' // Importing icon components for delete and edit actions
// import '../../AppraisalForm/htmltable.css' // Commented out CSS import for table styling
import Select from 'react-select' // Importing react-select for dropdown functionality
import Table from '../../../Common/Table/Table' // Importing custom Table component for rendering the goal table

// Goals component accepts multiple props like goals array, setter function, and other flags such as isCompleted, peer, isHr, etc.
const Goals = ({
    goals,
    setGoals,
    isCompleted,
    employee,
    peer,
    isHr,
    manager,
    readOnly,
    formErrors
}) => {
    // State hooks to manage modal visibility (delete confirmation) and the index of the goal to be deleted
    const [deleteShow, setDeleteShow] = useState(false)
    const [index, setIndex] = useState('')

    // Options for goal status dropdown
    const options = [
        { label: 'Achieved', value: '1' },
        { label: 'Differed', value: '2' },
        { label: 'None', value: '0' }
    ]

    // Function to show the delete modal
    const handleRemove = (index) => {
        setDeleteShow(true)
        setIndex(index) // Set the index of the goal to be deleted
    }

    // Function to proceed with deletion of a goal item
    const proceedDeleteHandler = (e) => {
        e.preventDefault()
        const rows = [...goals] // Create a copy of the goals array
        rows.splice(index, 1) // Remove the goal at the given index
        setGoals(rows) // Update the goals state with the new array
        setDeleteShow(false) // Close the delete modal
    }

    // Function to close the delete modal
    const onCloseHandler = () => {
        setDeleteShow(false)
    }

    // Function to add a new goal to the goals list
    const handleAddClick = () => {
        setGoals([
            ...goals,
            {
                name: '',
                deadline: '',
                goalStatusEnum: '0' // Initializing a new goal with default values
            }
        ])
    }

    // Function to handle input changes for goal name and other fields
    const onChangeHandler = (value, index, name) => {
        goals[index][name] = value // Update the specific field of the goal at the given index
    }

    // Function to handle changes in the goal status dropdown
    const onOptionChangeHandler = (option, index, name) => {
        goals[index][name] = option.value // Update the goal's status with the selected value
    }

    // Column configuration for the goal table, including rendering logic for different columns
    const COLUMNS = [
        {
            Header: 'Objective',
            accessor: 'name',
            Cell: ({ row }) => {
                const [inputValue, setInputValue] = useState(row.original.name) // Initialize state for goal name input

                // Handle change in goal name input
                const handleChange = (value) => {
                    setInputValue(value) // Update local state with new value
                    onChangeHandler(value, row.index, 'name') // Call the parent handler to update global goals state
                }

                return (
                    <div className="">
                        {/* Render goal name input only if the user is allowed to edit */}
                        {peer || manager || isHr || isCompleted ? (
                            <p style={{ width: '250px' }}>
                                {row.original.name}{' '}
                                {/* Display goal name in paragraph if not editable */}
                            </p>
                        ) : (
                            <div>
                                <Form.Control
                                    disabled={peer || manager || readOnly} // Disable input if peer, manager, or readOnly flags are true
                                    as="textarea"
                                    style={{ width: '250px', height: '30px', marginTop: '11%' }}
                                    onChange={(e) => handleChange(e.target.value)} // Call handleChange on text input change
                                    value={inputValue} // Bind input value to state
                                    maxLength={200}
                                />
                                <div style={{ marginLeft: '71%' }}>
                                    {inputValue.length}/200{' '}
                                    {/* Display character count for the goal name */}
                                </div>
                            </div>
                        )}
                    </div>
                )
            }
        },
        {
            Header: 'Estimated Duration(Days)',
            accessor: 'deadline',
            Cell: ({ row }) => (
                <div className="deadline">
                    {/* Input field for deadline with a max length of 200 */}
                    <Form.Control
                        disabled={peer || manager || readOnly} // Disable input if peer, manager, or readOnly flags are true
                        style={{ width: '250px' }}
                        onChange={(e) => onChangeHandler(e.target.value, row.index, 'deadline')}
                        defaultValue={row.original.deadline}
                        maxLength={200}
                    />
                </div>
            )
        },
        {
            Header: 'Status',
            accessor: 'goalStatusEnum',
            Cell: ({ row }) => (
                <div className="achieved">
                    {/* Dropdown for goal status */}
                    <Select
                        isDisabled={employee || readOnly || peer} // Disable dropdown based on user roles
                        options={options} // Pass options for status (Achieved, Differed, None)
                        onChange={(e) => onOptionChangeHandler(e, row.index, 'goalStatusEnum')} // Handle status change
                        defaultValue={options.filter(
                            (e) => e.value == goals[row.index]['goalStatusEnum']
                        )} // Set default selected option
                    />
                    <span className="error">
                        {/* Display error message if available */}
                        {formErrors && formErrors.managerReviewGoal
                            ? formErrors.managerReviewGoal
                            : ' '}
                    </span>
                </div>
            )
        },
        {
            Header: () => <div className="text-wrap text-right actions">Actions</div>,
            accessor: 'actions',
            disableSortBy: true, // Disable sorting for actions column
            Cell: ({ row }) => (
                <>
                    <div className="text-wrap text-center actionsWidth">
                        {/* Button to trigger goal deletion */}
                        <Button
                            disabled={readOnly || peer || manager} // Disable delete button if the user is not authorized
                            variant=""
                            className="iconWidth"
                            onClick={() => handleRemove(row.index)} // Trigger remove function on button click
                        >
                            <DeleteIcon />
                        </Button>
                    </div>
                </>
            )
        }
    ]

    return (
        <>
            {/* Render section with goal table */}
            <section>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <h5 style={{ marginTop: '2%', marginBottom: '2%', color: '#364781' }}>
                                <label>Goals set by the manager vs achieved</label>
                            </h5>
                            <div className="">
                                <div className="table">
                                    <Table columns={COLUMNS} serialNumber={true} data={goals} />{' '}
                                    {/* Render table with goal data */}
                                </div>
                                <span>
                                    {/* Add 'Add More' button if the user is authorized */}
                                    {manager || readOnly ? (
                                        ''
                                    ) : (
                                        <Button
                                            variant=""
                                            className="addMoreBtn"
                                            disabled={readOnly || peer || manager}
                                            onClick={handleAddClick}
                                        >
                                            Add More+
                                        </Button>
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Delete confirmation modal */}
            <Modal show={deleteShow} onHide={onCloseHandler} backdrop="static" keyboard={false}>
                <Modal.Header closeButton={onCloseHandler}>
                    <Modal.Title>Delete ?</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    Are you sure you want to delete this item?
                </Modal.Body>
                <div className="btnCenter mb-3">
                    {/* Buttons for confirming or canceling the delete action */}
                    <Button className="Button" variant="addbtn" onClick={proceedDeleteHandler}>
                        Yes
                    </Button>
                    <Button className="Button" variant="secondary" onClick={onCloseHandler}>
                        No
                    </Button>
                </div>
            </Modal>
        </>
    )
}

export default Goals
