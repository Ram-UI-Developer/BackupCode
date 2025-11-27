import React, { useEffect, useRef, useState } from 'react'
// Import necessary libraries and components
import html2canvas from 'html2canvas' // html2canvas to capture HTML as images
import { jsPDF } from 'jspdf' // jsPDF for generating PDF
import { Button, Modal } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader' // Loading indicator
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import { ViewFile } from '../../../Common/CommonIcons/CommonIcons'
import { getById } from '../../../Common/Services/CommonService'
import { SaveWithId, getAllAppraisalListByManager } from '../../../Common/Services/OtherServices'
import Table from '../../../Common/Table/Table1' // Table to display appraisal list
import { cancelButtonName } from '../../../Common/Utilities/Constants'
import EmployeeAndManagerReview from '../ManagerReview/EmployeeAndManagerReview'
import SelfReview from '../SelfReview/SelfReview'
import ManagerGoalsDto from './ManagerGoalsDto'

const ManagerReviewList = () => {
    const userDetails = useSelector((state) => state.user.userDetails) // Get user details from Redux store
    const navigate = useNavigate() // Hook for navigation
    const [loading, setLoading] = useState(false) // State to handle loading state
    const [data, setData] = useState([]) // State to hold fetched appraisal data
    const [show, setShow] = useState(false) // State to manage modal visibility
    const [apprisalForm, setApprisalForm] = useState([]) // State to hold current appraisal form data
    const pdfRef = useRef() // Ref to the section that will be converted to PDF

    const handleEdit = (id) => {
        // Function to handle editing an appraisal form
        navigate('/mngRating', { state: { id } })
    }

    useEffect(() => {
        // Fetch all appraisals when the component is mounted
        getAllAppraisals()
    }, [])

    const getAllAppraisals = () => {
        setLoading(true) // Set loading to true before fetching data
        // Fetch appraisals by manager from the backend service
        getAllAppraisalListByManager({
            entity: 'appraisals',
            organizationId: userDetails.organizationId,
            email: userDetails.email
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setLoading(false) // Set loading to false after data is fetched
                    setData(res.data) // Update the state with the fetched data
                }
            })
            .catch((err) => {
                setLoading(false) // Set loading to false if there is an error
                console.log(err, 'error')
            })
    }

    const onGetApprisalHandlerById = (id) => {
        // Fetch individual appraisal details by ID
        getById({ entity: 'appraisals', organizationId: userDetails.organizationId, id: id })
            .then((res) => {
                if (res.statusCode == 200) {
                    setApprisalForm(res.data) // Update the state with the fetched appraisal form
                }
            })
            .catch((err) => {
                console.log(err, 'error')
            })
    }

    const onViewHandler = (id) => {
        // Handle view button click to display appraisal details in a modal
        setShow(true)
        onGetApprisalHandlerById(id)
    }

    const onCloseHandler = () => {
        // Close the modal
        setShow(false)
    }

    const handleDownloadPDF = () => {
        // Handle the generation of the PDF document from the appraisal form
        const input = pdfRef.current
        if (!input) {
            console.error('PDF Ref is empty')
            return
        }
        // Convert the content to a canvas and generate the PDF
        html2canvas(input, { useCORS: true, scale: 2 })
            .then((canvas) => {
                const imgData = canvas.toDataURL('image/png')
                const pdf = new jsPDF('p', 'mm', 'a4')
                const imgWidth = 210
                const imgHeight = (canvas.height * imgWidth) / canvas.width
                let position = 0
                let pageHeight = 297

                // Loop through the content and add it to the PDF, ensuring proper pagination
                while (position < imgHeight) {
                    pdf.addImage(imgData, 'PNG', 0, position * -1, imgWidth, imgHeight)
                    position += pageHeight
                    if (position < imgHeight) {
                        pdf.addPage()
                    }
                }
                pdf.save('Appraisal_Form.pdf') // Save the generated PDF
            })
            .catch((err) => console.log(err, 'err from pdf gen'))
    }

    const onSaveHandler = (e) => {
        // Handle save functionality, updating the appraisal form status
        apprisalForm.status = e
        setShow(false)
        SaveWithId({
            entity: 'appraisals',
            organizationId: userDetails.organizationId,
            id: apprisalForm.id,
            body: apprisalForm
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    if (e == 'Reviewed') {
                        toast.success('Updated Successfully.') // Show success toast on update
                        onCloseHandler() // Close the modal after saving
                    }
                } else {
                    toast.error(res.errorMessage) // Show error toast if the API request fails
                }
            })
            .catch((err) => {
                console.log(err, 'error')
            })
    }

    const COLUMNS = [
        // Define columns for the table to display appraisal data
        {
            Header: 'Employee Id',
            accessor: 'code'
        },
        {
            Header: 'Employee Name',
            accessor: 'employeeName'
        },
        {
            Header: 'Review Period',
            accessor: 'reviewPeriod',
            Cell: ({ row }) => (
                <div style={{ minWidth: '200px' }}>
                    {row.original.reviewPeriodFrom} to {row.original.reviewPeriodTo}
                </div>
            )
        },
        {
            Header: 'Generated Date',
            accessor: 'generatedDate'
        },
        {
            Header: 'Review Deadline',
            accessor: 'managerReviewDeadline'
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
                <div className="text-wrap text-center actionsWidth">
                    {row.original.status == 'Submitted' || row.original.status == 'PeerReviewed' ? (
                        <Button
                            type="button"
                            className=""
                            variant="addbtn"
                            onClick={() => handleEdit(row.original.id)}
                        >
                            Review
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            className=""
                            variant=""
                            onClick={() => onViewHandler(row.original.id)}
                        >
                            <ViewFile />
                        </Button>
                    )}
                </div>
            )
        }
    ]

    return (
        <div>
            <section className="section">
                {loading ? <DetailLoader /> : ''} {/* Show loading spinner when loading */}
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="">
                                <PageHeader pageTitle={'Appraisal Forms'} /> {/* Page header */}
                                <div className="table">
                                    <Table columns={COLUMNS} serialNumber={true} data={data} />{' '}
                                    {/* Display table with appraisal data */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modal for viewing and updating appraisal form */}
            <Modal show={show} onHide={onCloseHandler} size="xl">
                <Modal.Header closeButton={onCloseHandler}>
                    <Modal.Title>Appraisal Form</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div style={{ marginTop: '-40px' }}>
                        <div
                            ref={pdfRef}
                            style={{ padding: '20px', background: '#fff' }}
                            id="print-table"
                        >
                            {/* Rendering the SelfReview, ManagerReview, and Goals components */}
                            <SelfReview
                                isCompleted={true}
                                apprisalForm={apprisalForm}
                                managerPrevieew={true}
                                readOnly={true}
                            />
                            <EmployeeAndManagerReview
                                isManager={true}
                                apprisalForm={apprisalForm}
                                readOnly={true}
                            />
                            <ManagerGoalsDto apprisalForm={apprisalForm} />
                        </div>
                    </div>
                </Modal.Body>
                <div className="btnCenter mb-1">
                    <Button
                        className="Button"
                        variant="addbtn"
                        onClick={() => onSaveHandler('Reviewed')}
                    >
                        Update
                    </Button>
                    <Button
                        variant="addbtn"
                        className="Button"
                        onClick={handleDownloadPDF}
                        // disabled={apprisalForm.length > 0 ? false : true}
                    >
                        Download
                    </Button>
                    <Button className="Button" variant="secondary" onClick={onCloseHandler}>
                        {cancelButtonName}
                    </Button>
                </div>
            </Modal>
        </div>
    )
}
export default ManagerReviewList
