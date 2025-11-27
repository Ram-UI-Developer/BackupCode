import React, { useEffect, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import FileViewer from '../../Common/CommonComponents/FileViewer'
import DetailLoader from '../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../Common/CommonComponents/PageHeader'
import { EditIcon } from '../../Common/CommonIcons/CommonIcons'
import { getAll } from '../../Common/Services/CommonService'
import Table1 from '../../Common/Table/Table1'

const MyFeedBackList = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true) // State for loader
    const [data, setData] = useState([]) // State to store feedback list data

    // Navigate to feedback page when edit button is clicked
    const handleEdit = ({ row, seen }) => {
        console.log(row, 'row', seen, 'seen')
        seen
            ? navigate('/feedback', {
                  state: { id: row.id, organizationId: row.organizationId, seen: true }
              })
            : navigate('/feedback', { state: { id: row.id, organizationId: row.organizationId } })
    }

    const files = useState([]) // State to store files for file viewer
    const [fileShow, setFileShow] = useState(false) // State to toggle modal view of files

    // Close file viewer modal
    const onCloseHandler = () => {
        setFileShow(false)
    }
    // Run only once on component mount
    useEffect(() => {
        getAllFeedBackList()
    }, [])
    // Fetch all feedback list from backend
    const getAllFeedBackList = () => {
        getAll({ entity: 'feedbacks' })
            .then((res) => {
                if (res.statusCode == 200) {
                    setData(res.data) // Set fetched data
                    setLoading(false) // Stop loader
                }
            })
            .catch(() => {})
    }

    // Table column configuration
    const columns = [
        {
            Header: 'Ticket Number',
            accessor: 'id',
            headerAlign: 'right',
            Cell: ({ row }) => <div className="numericData">{row.original.id}</div>
            // Cell: ({ row }) => (

            //     <div className={row.original && row.original.seen === false ? "bold-row numericData" : "numericData"}>
            //         {row.original.id}
            //     </div>
            // )
        },
        {
            Header: 'Subject',
            accessor: 'subject'
        },

        {
            Header: 'Organization',
            accessor: 'organizationName'
        },
        {
            Header: 'Submitted By',
            accessor: 'employeeName'
        },
        {
            Header: 'Submitted Date',
            accessor: 'submittedDate',
            Cell: ({ row }) => (
                // <div className='row.original && row.original.seen === false ? "bold-row" : "";'>
                <div className={row.original && row.original.seen === false ? 'bold-row' : ''}>
                    {row.original &&
                        row.original.feedbackDetailDTOs &&
                        row.original.feedbackDetailDTOs[0] &&
                        row.original.feedbackDetailDTOs[0]['submittedDate']}
                </div>
            )
        },
        {
            Header: 'Status',
            accessor: 'status'
        },
        {
            Header: () => <div className="text-wrap text-right actions">Actions</div>,
            accessor: 'actions',
            disableSortBy: true,
            Cell: ({ row }) => (
                <>
                    <div className="text-wrap text-center actionsWidth">
                        <Button
                            type="button"
                            className="iconWidth"
                            variant=""
                            // onClick={() => handleEdit({row:row.original,seen:row.original.seen})}
                            onClick={() =>
                                handleEdit({
                                    row: row.original,
                                    seen: row.original && row.original.seen ? false : true
                                })
                            }
                        >
                            <EditIcon />
                        </Button>
                    </div>
                </>
            )
        }
    ]
    return (
        <>
            {/* Show feedback list page if authorized */}
            <section className="section">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className=" ">
                                <PageHeader pageTitle="Support Tickets" />
                                <div className="table">
                                    {/* Show loader or table based on loading state */}
                                    {loading ? (
                                        <DetailLoader />
                                    ) : (
                                        <>
                                            <Table1
                                                columns={columns}
                                                data={data}
                                                serialNumber={true}
                                                pageSize="10"
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modal to view file attachments */}
            <Modal
                show={fileShow}
                size="lg"
                onHide={onCloseHandler}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header>
                    <Modal.Title>Preview</Modal.Title>
                    <Button variant="secondary" onClick={onCloseHandler}>
                        X
                    </Button>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    <FileViewer documents={files ? files : []} />
                </Modal.Body>
            </Modal>
        </>
    )
}
export default MyFeedBackList
