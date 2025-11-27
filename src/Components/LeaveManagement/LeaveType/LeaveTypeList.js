import React, { useEffect, useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import Col from 'react-bootstrap/Col'
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'
import { useSelector } from 'react-redux'
import Select from 'react-select'
import { commonCrudSuccess } from '../../../Common/CommonComponents/CustomizedSuccessToastMessages'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import { ToastError, ToastSuccess } from '../../../Common/CommonComponents/ToastCustomized'
import { AddIcon, DeleteIcon, EditIcon } from '../../../Common/CommonIcons/CommonIcons'
import {
    deleteById,
    getAllByOrgId,
    getAllWithOrgAndLocationIds,
    getById
} from '../../../Common/Services/CommonService'
import Table1 from '../../../Common/Table/Table1'

const LeaveTypeList = () => {
    const entity = 'leavetypes'
    const userDetails = useSelector((state) => state.user.userDetails) //contains user details data
    const [data, setData] = useState([]) //state for setting data
    const [selectedId, setSelectedId] = useState('') //state for storing the selected id
    const [show, setShow] = useState(false) //state for showing modal pop ups
    const [loading, setLoading] = useState(true) //state for displaying loader
    const [options, setOptions] = useState([]) //state for handling drop dwown options
    const [eventSelect, setEventSelect] = useState() //state for handlingthe event selected

    const handleClose = () => {
        setShow(false)
    }

    //api handling for delete the leave type record
    const onDeleteHandler = () => {
        deleteById({
            entity: entity,
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
            locationId: userDetails.locationId == null ? 0 : userDetails.locationId,
            id: selectedId,
            toastSuccessMessage: commonCrudSuccess({
                screen: 'LeaveType',
                operationType: 'delete'
            })
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    ToastSuccess(res.message)

                    getLeaveTypeList()
                }

                setShow(false)
            })
            .catch((err) => {
                ToastError(err.message)
                console.log(err)
            })
    }

    const proceedDelete = (data) => {
        setShow(true)
        setSelectedId(data.id)
    }

    useEffect(() => {
        getLeaveTypeList()
        if (userDetails.organizationId !== null) {
            getLocationList()
        }
    }, [])

    const handleEventSelection = (selection) => {
        setEventSelect(selection.value)
        getLeaveList(selection.value)
    }

    //api handling for getting all locations  in that organization
    const getLocationList = () => {
    getAllByOrgId({ entity: 'locations', organizationId: userDetails.organizationId })
        .then(
            (res) => {
                locationHandler(res.data)
                // If only one location, set it as selected
                if (res.data.length === 1) {
                    setEventSelect(res.data[0].id)
                    getLeaveList(res.data[0].id) // Optionally fetch leave types for this location
                }
            },
            (error) => {
                console.log(error)
            }
        )
        .catch((err) => {
            console.log(err)
        })
}

    const locationHandler = (data) => {
        let optionsMapped = data.map((option) => ({
            value: option.id,
            label: option.name
        }))
        setOptions(optionsMapped)
    }

    //api handling for get all leave types by organization
    const getLeaveTypeList = () => {
        getAllByOrgId({
            entity: entity,
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId
        })
            .then(
                (res) => {
                    setLoading(false)
                    if (res.data.length >= 1) {
                        setData(res.data)
                    } else {
                        setData([])
                    }
                },
                (error) => {
                    console.log(error)
                }
            )
            .catch((err) => {
                console.log(err)
            })
    }
    //api handling for get all leave types by organization

    const getLeaveList = (locationId) => {
        setLoading(true)
        console.log(locationId, 'locationId')
        getAllWithOrgAndLocationIds({
            entity: entity,
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
            locationId: userDetails.locationId == null ? 0 : locationId
        }).then((res) => {
            console.log(res, 'responselocation')
            setLoading(false)
            setData(res.data)
        })
    }

    //table colums
    const COLUMNS = [
        {
            Header: 'Name',
            accessor: 'name',
            Cell: ({ row }) => <div className="textAlign:left">{row.original.name}</div>
        },
        {
            Header: <div className="numericColHeading">Number of Leaves</div>,
            accessor: 'numberOfDays',
            Cell: ({ row }) => <div className="numericData">{row.original.numberOfDays}</div>
        },
        {
            Header: 'Frequency',
            accessor: 'frequency',
            Cell: ({ row }) => <div className="text-left">{row.original.frequency}</div>
        },
        {
            Header: (
                <div className="text-wrap text-left actions header ">
                    {userDetails.organizationId == null ? '' : 'Location Names'}
                </div>
            ),
            accessor: 'locationName',
            Cell: ({ row }) => <div className="text-left">{row.original.locationName}</div>
        },
        {
            Header: () => <div className="text-wrap text-right actions header ">Actions</div>,
            accessor: 'actions',
            disableSortBy: true,
            Cell: ({ row }) => (
                <>
                    <div className="text-wrap text-right actionsWidth">
                        <Button
                            type="button"
                            className="iconWidth"
                            variant=""
                            onClick={() => handleEdit(row.original, row.id)}
                        >
                            <EditIcon />
                        </Button>
                        |
                        <Button
                            type="button"
                            variant=""
                            className="iconWidth"
                            onClick={() => proceedDelete(row.original, row.id)}
                        >
                            <DeleteIcon />
                        </Button>
                    </div>
                </>
            )
        }
    ]

    const navigate = useNavigate()

    const onAddHandler = () => {
        navigate('/leaveType', { state: { id: null } })
    }

    const handleEdit = (data) => {
        // navigate("/leaveType", { state: { data, id, } })
        setSelectedId(data.id)
        getById({
            entity: entity,
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
            locationId: userDetails.locationId == null ? 0 : userDetails.locationId,
            id: data.id
        })
            .then(
                (res) => {
                    // if (res.data.length > 1) {

                    // setData(res.data)
                    const data = res.data
                    const id = data.id
                    navigate('/leaveType', { state: { data, id } })
                    // }
                },
                (error) => {
                    console.log(error)
                }
            )
            .catch((err) => {
                console.log(err)
            })
    }

    return (
        <>
            {loading ? <DetailLoader /> : ''}
            <section className="section">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="">
                                <PageHeader pageTitle={'Leave Types'} />
                                <div className="card-body">
                                    {userDetails.locationId && (
                                        // <form className='addFormBody'>
                                        <form>
                                            <Form.Group
                                                className="mb-3"
                                                as={Row}
                                                style={{ justifyContent: 'flex-end' }}
                                            >
                                                <Form.Label column md={2}>
                                                    Location
                                                </Form.Label>
                                                <Col md={3}>
                                                    <Select
                                                        options={options}
                                                        value={options.filter(
                                                            (option) => option.value == eventSelect
                                                        )}
                                                        onChange={handleEventSelection}
                                                    />
                                                </Col>
                                            </Form.Group>
                                        </form>
                                    )}

                                    <>
                                        {' '}
                                        <Button
                                            className="addButton"
                                            variant="addbtn"
                                            onClick={onAddHandler}
                                        >
                                            <AddIcon />
                                        </Button>
                                        <Table1
                                            key={data.length}
                                            columns={COLUMNS}
                                            data={data}
                                            pageSize="10"
                                            serialNumber={true}
                                        />
                                    </>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
                <Modal.Header closeButton={handleClose}>
                    <Modal.Title>Delete ?</Modal.Title>
                    {/* <Button variant='secondary' onClick={handleClose}>X</Button> */}
                </Modal.Header>
                <Modal.Body style={{ textAlign: 'center' }}>
                    Are you sure you want to delete this item?
                </Modal.Body>
                <div className="btnCenter mb-4">
                    <Button className="Button" variant="addbtn" onClick={onDeleteHandler}>
                        Yes
                    </Button>
                    <Button className="Button" variant="secondary" onClick={handleClose}>
                        No
                    </Button>
                </div>
            </Modal>
        </>
    )
}

export default LeaveTypeList
