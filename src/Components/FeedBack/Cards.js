import React, { useState, useEffect } from 'react'
import { Button, Col, Modal } from 'react-bootstrap'
import Card from 'react-bootstrap/Card'
import ReactHtmlParser from 'react-html-parser'
import FileViewer from '../../Common/CommonComponents/FileViewer'
// Cards component to display individual feedback or support ticket comment
const Cards = ({ data, name, align }) => {
    const [files, setFiles] = useState([]) // State to store attached files
    const [fileShow, setFileShow] = useState(false) // State to control file preview modal visibility
    const [alignState, setAlignState] = useState(null) // State to manage alignment (left or right)
    // Set initial alignment state on component mount_
    useEffect(() => {
        setAlignState(align)
    }, [])
    // Handler to close the file preview modal
    const onCloseHandler = () => {
        setFileShow(false)
    }

    // Function to calculate number of days since the feedback was submitted
    const ondayCount = (date) => {
        let newDate = new Date()
        let submittedDate = new Date(date)
        let noOfDays = Math.floor((newDate - submittedDate) / (1000 * 60 * 60 * 24))

        if (noOfDays > 0) {
            if (noOfDays == 1) {
                return noOfDays + ' day ago'
            } else {
                return noOfDays + ' days ago'
            }
        } else {
            return 'Today'
        }
    }
    // Handler to show file preview modal and set selected documents
    const onFileHandler = (docs) => {
        setFileShow(true)
        setFiles(docs)
    }

    return (
        <>
            {/* Card displaying individual feedback message */}
            <Col
                md={10}
                className={
                    alignState == 'left' ? 'feedbackBodyAlign mb-3' : 'feedbackBodyAlign1 mb-3'
                }
            >
                <Card className="chartCard bg-white">
                    {/* Card header showing who submitted and when */}
                    <Card.Header
                        className={alignState == 'left' ? 'chartCardHeader' : 'chartCardHeader1'}
                    >
                        {data.submittedBy == 0 ? 'Admin' : name}
                        <span
                            className=""
                            style={{ fontSize: '12px', float: 'right', color: 'black' }}
                        >
                            {ondayCount(data.submittedDate)}
                        </span>
                    </Card.Header>
                    {/* Card body showing the message content and attachments if any */}
                    <Card.Body className="chartBody">
                        <Card.Text>
                            {ReactHtmlParser(data.body.replace(/\n/g, "<br/>"))}
                        </Card.Text>
                        {data.attachmentDTOs && data.attachmentDTOs.length > 0 && (
                            <div
                                className="PreviewFile"
                                type="button"
                                onClick={() => onFileHandler(data.attachmentDTOs)}
                            >
                                Preview Files
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </Col>
            {/* Modal to show file preview */}
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

export default Cards
