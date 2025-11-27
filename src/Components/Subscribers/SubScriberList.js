import React, { useEffect, useState } from 'react'
import { Tooltip } from 'react-bootstrap'
import Button from 'react-bootstrap/Button'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import DateFormate from '../../Common/CommonComponents/DateFormate'
import DetailLoader from '../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../Common/CommonComponents/PageHeader'
import { ToastError } from '../../Common/CommonComponents/ToastCustomized'
import { AddIcon, ApproveIcon, EditIcon, OffBoard, OffBoardAlert } from '../../Common/CommonIcons/CommonIcons'
import { appownerDeleteById, getAll, getByIdwithOutOrg } from '../../Common/Services/CommonService'
import { ManualActivateAccount } from '../../Common/Services/OtherServices'
import Table1 from '../../Common/Table/Table1'
import Modal from 'react-bootstrap/Modal'

const SubScriberList = () => {
    const [loading, setLoading] = useState(true) // State for loading indicator
    const [subscriberList, setSubscriberList] = useState([]) // State to store the list of subscribers
    const [offBoard, setOffBoard] = useState(false) // Indicates whether the organization is offboarded or inactive
    // console.log(offBoard, "offboard");
    const navigate = useNavigate() // Hook to navigate between pages
    const [orgDetails, setOrgDetails] = useState('');
    // console.log(orgDetails, "id");

    // Fetch subscriber data on component mount
    useEffect(() => {
        onGetOrgHandler()
    }, [])

    // Set local storage values when component mounts
    useEffect(() => {
        localStorage.setItem('moduleName', 'Subscribers')
        localStorage.setItem('menuItem', 0)
    }, [])

    // Function to fetch all subscribers
    const onGetOrgHandler = () => {
        getAll({ entity: 'organizations' })
            .then((res) => {
                setLoading(false)
                if (res.statusCode === 200) {
                    setSubscriberList(res.data)
                }
            })
            .catch(() => {
                setSubscriberList([]) // Handle error by setting an empty list
                setLoading(false) // Stop loading even if there's an error
            })
    }

    // Function to activate an account
    const onActivateAccount = (id) => {
        setLoading(true)
        ManualActivateAccount({ entity: 'organizations', id: id })
            .then((res) => {
                if (res.statusCode === 200) {
                    setLoading(false)
                    toast.success('Account activated successfully.')
                    onGetOrgHandler() // Refresh list after activation
                } else {
                    setLoading(false)
                    toast.error(res.errorMessage)
                }
            })
            .catch((err) => {
                setLoading(false)
                ToastError(err.message)
            })
    }

    const onOffBoarding = (e) => {
        // console.log(e, "offboard id")
        setOrgDetails(e)
        setOffBoard(true)
    }

    const onCloseHandler = () => {
        setOffBoard(false)
        setLoading(false)
    }


    const getAllData = () => {
        getByIdwithOutOrg({ entity: 'offboarding', id: orgDetails.id })
            .then((res) => {
                if (res.statusCode == 200) {
                    setLoading(false)
                    const byteCharacters = atob(res.data.bytes)
                    const byteArrays = []
                    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
                        const slice = byteCharacters.slice(offset, offset + 512)
                        const byteNumbers = new Array(slice.length)
                        for (let i = 0; i < slice.length; i++) {
                            byteNumbers[i] = slice.charCodeAt(i)
                        }
                        byteArrays.push(new Uint8Array(byteNumbers))
                    }
                    const blob = new Blob(byteArrays, { type: 'application/zip' })
                    const link = document.createElement('a')
                    link.href = URL.createObjectURL(blob)
                    link.download = `${orgDetails.name}_files.zip`
                    link.click()
                    URL.revokeObjectURL(link.href)
                    onCloseHandler()
                    toast.success(orgDetails.name + 'offboarded successfully.')
                }
            })
            .catch(() => {
                setLoading(false)
            })
    }

    const OnDeleteHandler = () => {
        setLoading(true)
        appownerDeleteById({ entity: 'offboarding', id: orgDetails.id }).then(
            (res) => {
                if (res.statusCode == 200) {
                    onCloseHandler()
                    toast.success(orgDetails.name + ' offboarded successfully.')
                }
            }
        )
            .catch(() => {
                onCloseHandler()
                setLoading(false)
            })
    }


    // Column definitions for the table
    const COLUMNS = [
        {
            Header: 'Name',
            accessor: 'name',
            Cell: ({ row }) => (
                <>
                    <Tooltip title={row.original.name} open>
                        {row.original.name}
                    </Tooltip>
                    <div className="tableLength">{row.original.name}</div>
                </>
            )
        },
        {
            Header: 'Location',
            accessor: 'locationName',
            Cell: ({ row }) => <div className="tableLength">{row.original.locationName}</div>
        },
        {
            Header: 'Contact Person',
            accessor: 'contactPerson',
            Cell: ({ row }) => (
                <>
                    <Tooltip title={row.original.firstName + ' ' + row.original.lastName} open>
                        {row.original.firstName} {row.original.lastName}
                    </Tooltip>
                    <div className="tableLength">
                        {row.original.firstName} {row.original.lastName}
                    </div>
                </>
            )
        },
        {
            Header: 'Email',
            accessor: 'email',
            Cell: ({ row }) => (
                <>
                {!offBoard ? (
                    <Tooltip title={row.original.email} open>
                        {row.original.email}
                    </Tooltip>
        ) : ""}
                    <div className="tableLength">{row.original.email}</div>
                </>
            )
        },
        {
            Header: 'Phone #',
            accessor: 'phoneNumber',
            Cell: ({ row }) => (
                <>
                {!offBoard ? (
                    <Tooltip title={row.original.phoneNumber} open>
                        {row.original.phoneNumber}
                    </Tooltip>
        ) : ""}
                    <div className="tableLength">{row.original.phoneNumber}</div>
                </>
            )
        },
        {
            Header: 'Enrolled By',
            accessor: 'enrolledBy',
            Cell: ({ row }) => (row.original.self ? 'Self' : 'Admin')
        },
        {
            Header: 'Plan',
            accessor: 'packageName',
            Cell: ({ row }) => (
                <div>
                    {row.original.packageName} ({row.original.slabRange})
                </div>
            )
        },
        {
            Header: 'Live Since',
            accessor: 'createdDate',
            Cell: ({ row }) =>
                row.original.createdDate && <DateFormate date={row.original.createdDate} />
        },
        {
            Header: 'Status',
            accessor: 'status',
            Cell: ({ row }) => (row.original.active ? 'Active' : 'Inactive')
        },
        {
            Header: () => <div className="text-wrap text-center header actions">Actions</div>,
            accessor: 'actions',
            disableSortBy: true,
            Cell: ({ row }) => (
                <div >
                    <Button
                        // className=""
                        variant=""
                        onClick={() => onOffBoarding(row.original)}
                        disabled={!row.original.active}
                    >
                        <OffBoard height={'20px'} />
                    </Button>|
                    <Button
                        // type="button"
                        variant=""
                        // className="iconWidth"
                        onClick={() => onEditHandler(row.original.id)}
                    >
                        <EditIcon />
                    </Button>
                    |
                    <Button
                        // type="button"
                        variant=""
                        // className="iconWidth"
                        disabled={row.original.emailVerified == false || row.original.active}
                        onClick={() => onActivateAccount(row.original.id)}
                    >
                        <ApproveIcon />
                    </Button>


                </div>
            )
        }
    ]

    // Function to navigate to edit page
    const onEditHandler = (id) => {
        navigate('/subscriber', { state: { id } })
    }

    return (
        <>
            {loading && <DetailLoader />}
            <section className="section">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <PageHeader pageTitle={'Subscribers'} />
                            <div className="table">
                                <Button
                                    className="addButton"
                                    variant="addbtn"
                                    onClick={() =>
                                        navigate('/packages', { state: { top: '60px' } })
                                    }
                                >
                                    <AddIcon />
                                </Button>
                                <Table1
                                    key={subscriberList.length}
                                    columns={COLUMNS}
                                    data={subscriberList}
                                    serialNumber={true}
                                    pageSize="10"
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </section>
            <Modal
                show={offBoard}
                onHide={onCloseHandler}
                backdrop="static"
                keyboard={false}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Off Boarding ?</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    <OffBoardAlert height={'50px'} />{' '}
                    <p style={{ color: 'red', marginTop: '1%' }}>
                        {' '}
                        Once you proceed, all your data will be permanently deleted and cannot be
                        recovered under any circumstances, even upon request. You will be redirected
                        to the Workshine landing page and will lose access to Workshine. This action
                        is irreversible. Are you sure you want to continue? Click 'Yes' to proceed
                        or 'Cancel' to abort
                    </p>
                </Modal.Body>
                <div className="delbtn1">
                    <Button
                        className="Button"
                        variant="addbtn"
                        type='button'
                        style={{
                            width: '30%',
                        }}
                        onClick={getAllData}
                    >
                        Download & Proceed
                    </Button>
                    <Button className="Button" variant="addbtn" type='button' style={{ zIndex: 9999,}} onClick={OnDeleteHandler}>
                        Proceed
                    </Button>
                    <Button className="Button" variant="secondary" onClick={onCloseHandler}>
                        Cancel
                    </Button>
                </div>
            </Modal>
        </>
    )
}

export default SubScriberList
