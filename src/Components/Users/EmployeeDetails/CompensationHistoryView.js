import React, { useEffect, useState } from 'react'
import Table from '../../../Common/Table/Table' // Importing a custom Table component
import { Button, Modal, Tab, Tabs } from 'react-bootstrap' // Importing necessary components from React Bootstrap
import { getAllListCompByLocation } from '../../../Common/Services/OtherServices' // Importing service to get compensation records by location
import { useSelector } from 'react-redux' // Importing useSelector hook to access Redux store
import Annexure from '../../PayRoll/Reports/Annexure' // Importing the Annexure component to show detailed compensation info

// Functional component to view compensation history
const CompensationHistoryView = ({ locId, id }) => {
    // Extracting user details from Redux store
    const userDetails = useSelector((state) => state.user.userDetails)

    // State hooks for managing data and modal visibility
    const [data, setData] = useState([]) // To store compensation history data
    const [annexureRead, setAnnexureRead] = useState(false) // To control visibility of the Annexure modal
    const [ctc, setCtc] = useState() // To store the current CTC value
    const [action, setAction] = useState('') // To store the action (e.g., "readOnly")
    const [templateId, setTemplateId] = useState() // To store the template ID for the selected compensation record
    const [currencyCode, setCurrencyCode] = useState('') // To store the currency code

    // Function to open the Annexure modal with relevant data
    const onAnexureShowHandler = (id, value, code, mode) => {
        setTemplateId(id)
        setAnnexureRead(true)
        setCtc(value)
        setCurrencyCode(code)
        setAction(mode)
    }

    // Function to close the Annexure modal
    const onAnexureCloseHandler = () => {
        setAnnexureRead(false)
    }

    // Table column configurations for displaying the compensation data
    const COLUMNS = [
        {
            Header: 'From Date', // Column header for 'From Date'
            accessor: 'fromDate' // Field to access in data
        },

        {
            Header: 'CTC', // Column header for 'CTC'
            accessor: 'ctc', // Field to access in data
            // Custom cell rendering for CTC
            Cell: ({ row }) => (
                <span
                    onClick={() =>
                        onAnexureShowHandler(
                            row.original.templateId,
                            row.original.ctc,
                            row.original.currencyCode,
                            'readOnly'
                        )
                    }
                >
                    <a className="">
                        <u>{row.original.ctc.toLocaleString()}</u>
                    </a>
                </span>
            )
        },
        {
            Header: 'Currency', // Column header for 'Currency'
            accessor: 'currencyCode', // Field to access in data
            Cell: ({ row }) => <span>{row.original.currencyCode}</span> // Displaying currency code
        },
        {
            Header: 'Modified Date', // Column header for 'Modified Date'
            accessor: 'lastModifiedDate' // Field to access in data
        }
    ]

    // useEffect hook to fetch compensation data when locId or id changes
    useEffect(() => {
        if (locId && id) {
            getAllRecordsByLocation() // Call the function to fetch records based on location and employee ID
        } else {
            console.log('locId or id is undefined') // Error handling if locId or id are undefined
        }
    }, [locId, id])

    // Function to fetch all compensation records by location
    const getAllRecordsByLocation = () => {
        getAllListCompByLocation({
            entity: 'compensation',
            organizationId: userDetails.organizationId,
            locationId: locId,
            employeeId: id
        })
            .then(
                (res) => {
                    if (res.statusCode == 200) {
                        setData(res.data ? res.data : []) // Store fetched data in state
                    }
                },
                (err) => {
                    console.log(err) // Log error if request fails
                }
            )
            .catch((error) => {
                console.log(error) // Catch and log any errors
            })
    }

    // JSX structure
    return (
        <div>
            <Tabs>
                <Tab eventKey="compensationHistory">
                    {/* Compensation History Section */}
                    <section className="section">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-md-12">
                                    <div className=" ">
                                        <h6>
                                            <label>Compensation History</label>
                                        </h6>
                                        <div className="table">
                                            {/* Table Component displaying compensation history */}
                                            <Table
                                                columns={COLUMNS}
                                                data={data}
                                                serialNumber={true}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Modal for viewing Annexure */}
                    <Modal centered show={annexureRead} onHide={onAnexureCloseHandler} size="lg">
                        <Modal.Header closeButton>
                            <Modal.Title>Annexure</Modal.Title>
                            {/* Close button to hide the modal */}
                        </Modal.Header>
                        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                            {/* Annexure component with necessary props */}
                            <Annexure
                                templateId={templateId}
                                averageSal={ctc}
                                action={action}
                                currencyCode={currencyCode ? currencyCode : 'INR'}
                            />
                        </Modal.Body>
                        <div style={{ marginLeft: '43%', marginBottom: '3%' }}>
                            {/* Close button in modal footer */}
                            <Button
                                id="closeAnnexure"
                                className="Button"
                                variant="secondary"
                                onClick={onAnexureCloseHandler}
                            >
                                Close
                            </Button>
                        </div>
                    </Modal>
                </Tab>
            </Tabs>
        </div>
    )
}
export default CompensationHistoryView
