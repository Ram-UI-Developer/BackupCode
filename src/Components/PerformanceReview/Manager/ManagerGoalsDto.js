import React, { useEffect, useState } from 'react'
import Table from '../../../Common/Table/Table' // Importing a custom Table component
import { Button, Form, Modal } from 'react-bootstrap' // Importing required components from react-bootstrap
import { DeleteIcon } from '../../../Common/CommonIcons/CommonIcons' // Importing custom Delete icon

// Functional component for managing the manager's goals
const ManagerGoalsDto = ({ apprisalForm, managerpreview }) => {
    // State to hold manager's goal data
    const [managerGoals, setManagerGoals] = useState(
        apprisalForm.selfreviewDTO
            ? apprisalForm.selfreviewDTO && apprisalForm.selfreviewDTO.mgrGoalDTOs
            : []
    )

    // State to store the index of the goal selected for deletion
    const [index, setIndex] = useState('')

    // useEffect hook to update the manager's goal whenever the apprisalForm changes
    useEffect(() => {
        setManagerGoals(
            apprisalForm.selfreviewDTO
                ? apprisalForm.selfreviewDTO && apprisalForm.selfreviewDTO.mgrGoalDTOs
                : []
        )
    }, [apprisalForm])

    // useEffect hook to update the apprisalForm with the new managerGoals
    useEffect(() => {
        if (apprisalForm.selfreviewDTO) {
            apprisalForm.selfreviewDTO.mgrGoalDTOs = managerGoals
        }
    }, [managerGoals])

    // Function to add a new goal for the manager
    const handleGoalsAddByManager = () => {
        setManagerGoals([
            ...managerGoals,
            {
                id: '', // Initially empty id
                name: '', // Initially empty name
                timePeriod: '', // Initially empty time period
                deadline: null, // Initially no deadline
                goalStatusEnum: 0 // Default status of goal
            }
        ])
    }

    // State to manage the visibility of the modal for deletion confirmation
    const [managerDeleteShow, setManagerDeleteShow] = useState(false)

    // Function to handle when the delete button is clicked, showing the delete confirmation modal
    const handleManagerRemove = (index) => {
        setManagerDeleteShow(true) // Show the delete confirmation modal
        setIndex(index) // Set the index of the goal to be deleted
    }

    // Function to handle the deletion of a goal after confirmation
    const proceedGoalsDeletHandler = (e) => {
        e.preventDefault()
        const rows = [...managerGoals] // Create a copy of the current goals list
        rows.splice(index, 1) // Remove the goal at the specified index
        setManagerGoals(rows) // Update the state with the new goals list
        setManagerDeleteShow(false) // Hide the delete confirmation modal
    }

    // Function to close the delete confirmation modal without performing any action
    const onCloseHandler = () => {
        setManagerDeleteShow(false) // Hide the delete confirmation modal
    }

    // Function to handle the input change for updating goal details
    const onInputhandler = (value, index, name) => {
        managerGoals[index][name] = value // Update the value of the specific field in the selected goal
    }

    // Column definitions for the table displaying manager goals
    const managerSetGoalCoumns = [
        {
            Header: 'Objective', // Column header
            accessor: 'name', // The field that this column will access in each row
            Cell: (
                { row } // Custom rendering for the cells in this column
            ) => (
                <div className="">
                    {managerpreview ? (
                        <div className="textWrap">
                            {/* // Display the goal name when in preview mode */}
                            {row.original.name}
                        </div>
                    ) : (
                        // If not in preview mode, display a form to edit the goal name
                        <Form.Control
                            as={'textarea'}
                            style={{ width: '250px', height: '30px', marginTop: '4%' }}
                            onChange={(e) => onInputhandler(e.target.value, row.index, 'name')}
                            defaultValue={row.original.name}
                            maxLength={200}
                        />
                    )}
                    <div style={{ marginLeft: '51%' }}> {row.original.name.length}/200</div>{' '}
                    {/* Show character count */}
                </div>
            )
        },
        {
            Header: 'Time frame', // Column header for the time period
            accessor: 'timePeriod', // The field that this column will access in each row
            Cell: ({ row }) => (
                <div className="">
                    {/* Display the form control for editing the time frame */}
                    <Form.Control
                        defaultValue={row.original.timePeriod}
                        onChange={(e) => onInputhandler(e.target.value, row.index, 'timePeriod')}
                        style={{ width: '150px' }}
                        maxLength={250}
                    />
                </div>
            )
        },
        {
            Header: () => <div className="text-wrap text-right actions">Actions</div>, // Column header for actions
            accessor: 'actions', // The field for actions (like delete)
            disableSortBy: true, // Disable sorting for this column
            Cell: ({ row }) => (
                <>
                    <div className="text-wrap text-center actionsWidth">
                        <Button
                            variant=""
                            className="iconWidth"
                            onClick={() => handleManagerRemove(row.index)} // Call the remove handler when the delete button is clicked
                        >
                            <DeleteIcon /> {/* Custom delete icon */}
                        </Button>
                    </div>
                </>
            )
        }
    ]

    return (
        <div>
            {/* Header for goals section */}
            <div>
                <h5 style={{ marginTop: '2%', marginBottom: '2%', color: '#364781' }}>
                    <label>Goals for the next review period(Assign by Manager)</label>
                </h5>
                <div className="table">
                    {/* Display the table with goals data */}
                    <Table columns={managerSetGoalCoumns} serialNumber={true} data={managerGoals} />
                </div>
                <span>
                    {/* Button to add new goals */}
                    <Button variant="" className="addMoreBtn" onClick={handleGoalsAddByManager}>
                        Add More+
                    </Button>
                </span>
            </div>

            {/* Modal for delete confirmation */}
            <Modal
                show={managerDeleteShow}
                onHide={onCloseHandler}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton={onCloseHandler}>
                    <Modal.Title>Delete ?</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    Are you sure you want to delete this item?
                </Modal.Body>
                <div className="btnCenter mb-3">
                    <Button
                        className="Button"
                        variant="addbtn"
                        onClick={proceedGoalsDeletHandler} // Proceed with deletion
                    >
                        Yes
                    </Button>
                    <Button
                        className="Button"
                        variant="secondary"
                        onClick={onCloseHandler} // Close modal without deletion
                    >
                        No
                    </Button>
                </div>
            </Modal>
        </div>
    )
}

export default ManagerGoalsDto // Export the component for use in other parts of the application
