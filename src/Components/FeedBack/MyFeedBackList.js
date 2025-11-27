import React, { useEffect, useState, useRef } from 'react'
import Table from '../../Common/Table/Table'
import PageHeader from '../../Common/CommonComponents/PageHeader'
import { Button, Modal } from 'react-bootstrap'
import {
    CopyContent,
    EditIcon,
    NewEmail,
    Phone
} from '../../Common/CommonIcons/CommonIcons'
import { useNavigate } from 'react-router-dom'
import FileViewer from '../../Common/CommonComponents/FileViewer'
import { getAllByOrgIdAndEmpId } from '../../Common/Services/CommonService'
import { useSelector } from 'react-redux'
import DetailLoader from '../../Common/CommonComponents/Loaders/DetailLoader'

const MyFeedBackList = () => {
    // Getting logged in user details from redux store
    const userDetails = useSelector((state) => state.user.userDetails)
    // Navigation handler
    const navigate = useNavigate()
    // States to handle loading and fetched feedback data
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState([])
    // To show which copied icon is active
    const [copied, setCopied] = useState(null)
    const [show, setShow] = useState(false) // State to handle modal visibility for mobile alert

    // Handler to redirect user to edit feedback page
    const handleEdit = (id) => {
        navigate('/myFeedback', { state: { id: id } })
    }

    // Handler to redirect to add new feedback
    const onAddHandler = () => {
        navigate('/myFeedback', { state: { id: null } })
    }
    // File viewer state and handler
    const files= useState([])
    const [fileShow, setFileShow] = useState(false)

    // const handleFilesShow = (docs, action) => {
    //     setFileShow(true)
    //     setFiles(docs)
    // }

    // Modal close handler
    const onCloseHandler = () => {
        setFileShow(false)
        setShow(false)
    }

    // Function to make phone numbers clickable only on mobile
    const handlePhoneClick = (phoneNumber) => {
        if (isMobileDevice()) {
            window.location.href = `tel:${phoneNumber}`
        } else {
            setShow(true)
        }
    }

    // Utility to check if device is mobile
    const isMobileDevice = () => {
        return (
            typeof window.orientation !== 'undefined' ||
            navigator.userAgent.indexOf('IEMobile') !== -1
        )
    }

    // Refs for email and phone numbers
    const email = useRef(null)
    const phoneRef1 = useRef(null)
    const phoneRef2 = useRef(null)

    const fallbackCopyText = (text) => {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed' // Prevent scrolling to the bottom of the page
        document.body.appendChild(textarea)
        textarea.select()
        try {
            document.execCommand('copy') // Copy the text
            // console.log('Fallback copy successful');
        } catch (err) {
            // console.error('Fallback copy failed:', err);
        }
        document.body.removeChild(textarea)
    }

    // Copy handler to copy text from ref element
    const copyHandler = (ref, type) => {
        console.log(ref, 'ref')
        if (!ref || !ref.current) {
            console.error('Ref is null or undefined')
            return
        }

        const textToCopy = ref.current.textContent.trim()
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard
                .writeText(textToCopy)
                .then(() => {
                    setCopied(type)
                    setTimeout(() => setCopied(null), 2000)
                })
                .catch((err) => {
                    console.error('Failed to copy:', err)
                    fallbackCopyText(textToCopy)
                })
        } else {
            fallbackCopyText(textToCopy) // Use fallback
            setCopied(type) // Display "Copied!" even with fallback
            setTimeout(() => {
                setCopied(null)
            }, 2000)
        }
    }

    // On component mount, fetch feedback data
    useEffect(() => {
        getAllFeedBackList()
    }, [])

    // Function to fetch feedback data from API
    const getAllFeedBackList = () => {
        getAllByOrgIdAndEmpId({
            entity: 'feedbacks',
            organizationId: userDetails.organizationId,
            empId: userDetails.employeeId
        })
            .then((res) => {
                setLoading(false)
                if (res.statusCode == 200) {
                    setData(res.data)
                }
            })
            .catch(() => {
                // Optional error handling
            })
    }

    // Table column definitions
    const columns = [
        {
            Header: 'Ticket Number',
            accessor: 'id',
            headerAlign: 'right',
            Cell: ({ row }) => <div className="numericData">{row.original.id}</div>
        },
        {
            Header: 'Subject',
            accessor: 'subject'
        },

        {
            Header: 'Submitted Date',
            accessor: 'submittedDate',
            Cell: ({ row }) => (
                <div>
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
                            onClick={() => handleEdit(row.original.id)}
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
            <section className="section">
                <div className="container-fluid">
                    <PageHeader pageTitle="Help" />
                    {/* Email support section */}
                    <div className="row">
                        <div className="col-md-12">
                            <div className="card" id="cardWithBlueBackground">
                                <div>
                                    <a href="mailto:support@wokshine.com">
                                        <NewEmail />
                                    </a>
                                    <p
                                        style={{
                                            fontWeight: 'bold',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                        ref={email}
                                    >
                                        support@workshine.com
                                        <span>
                                            <button
                                                onClick={() => copyHandler(email, 'email')}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <CopyContent />
                                            </button>
                                            {copied === 'email' && (
                                                <span style={{ fontSize: '12px', color: 'green' }}>
                                                    Copied!
                                                </span>
                                            )}
                                        </span>
                                    </p>
                                    <p style={{ fontSize: '0.7rem' }}>
                                        For help, please send your requests to the given email.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Phone support section */}
                    <div className="row">
                        <div className="col-md-12">
                            <div className="card" id="cardWithBlueBackground">
                                <div>
                                    <Phone />
                                    <p>
                                        <span
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}
                                        >
                                            <button
                                                onClick={() => handlePhoneClick(phoneRef1)}
                                                style={{ background: 'none', border: 'none' }}
                                            >
                                                <span
                                                    ref={phoneRef1}
                                                    style={{ fontWeight: 'bold' }}
                                                >
                                                    +91 8074783701
                                                </span>
                                            </button>
                                            <button
                                                onClick={() => copyHandler(phoneRef1, 'phoneRef1')}
                                                style={{ background: 'none', border: 'none' }}
                                            >
                                                <CopyContent />{' '}
                                            </button>
                                            {copied === 'phoneRef1' && (
                                                <span
                                                    style={{
                                                        fontSize: '12px',
                                                        fontWeight: 'bold',
                                                        color: 'green'
                                                    }}
                                                >
                                                    Copied!
                                                </span>
                                            )}
                                        </span>

                                        <span
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}
                                        >
                                            <button
                                                onClick={() => handlePhoneClick(phoneRef2)}
                                                style={{ background: 'none', border: 'none' }}
                                            >
                                                <span
                                                    ref={phoneRef2}
                                                    style={{ fontWeight: 'bold' }}
                                                >
                                                    +91 9948571927
                                                </span>
                                            </button>
                                            <button
                                                onClick={() => copyHandler(phoneRef2, 'phoneRef2')}
                                                style={{ background: 'none', border: 'none' }}
                                            >
                                                <CopyContent />{' '}
                                            </button>
                                            {copied === 'phoneRef2' && (
                                                <span
                                                    style={{
                                                        fontSize: '12px',
                                                        fontWeight: 'bold',
                                                        color: 'green'
                                                    }}
                                                >
                                                    Copied!
                                                </span>
                                            )}
                                        </span>
                                    </p>
                                    <p style={{ fontSize: '0.7rem' }}>
                                        Contact us directly at the provided phone numbers.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            <div className="">
                                {/* Feedback table and Raise Ticket section */}
                                <div style={{ marginRight: '-2%' }}>
                                    <Button
                                        className="addButton"
                                        variant="addbtn"
                                        style={{ marginBottom: '18px', marginTop: '0px' }}
                                        onClick={onAddHandler}
                                    >
                                        Raise a Ticket ?
                                    </Button>
                                </div>
                                {/* Feedback table with conditional loader */}
                                {loading ? (
                                    <DetailLoader />
                                ) : (
                                    <>
                                        <div className="noOfRecords">
                                            {data.length > 10 ? (
                                                <span>No. of Records : {data.length}</span>
                                            ) : (
                                                ''
                                            )}
                                        </div>{' '}
                                        <Table columns={columns} serialNumber={true} data={data} />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modal to preview uploaded documents */}
            <Modal
                show={fileShow}
                size="lg"
                onHide={onCloseHandler}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Preview</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    <FileViewer documents={files ? files : []} />
                </Modal.Body>
            </Modal>
            <Modal show={show} size="md" onHide={onCloseHandler} backdrop="static" keyboard={false}>
                <Modal.Body className="modalBody">
                    <p className="text-center">This feature is available only on mobile devices</p>
                    <Button variant="addbtn" onClick={onCloseHandler}>
                        Ok
                    </Button>
                </Modal.Body>
            </Modal>
        </>
    )
}
export default MyFeedBackList
