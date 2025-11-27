import { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Select from 'react-select'
import { toast } from 'react-toastify'
import DetailLoader from '../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../Common/CommonComponents/PageHeader'
import {
    AddIcon,
    EditIcon,
    OffSwitch,
    OnSwitch
} from '../../Common/CommonIcons/CommonIcons'
import {
    getAllById,
    getAllWithOrgAndLocationIds,
    getById
} from '../../Common/Services/CommonService'
import { updateEmailStatus } from '../../Common/Services/OtherServices'
import Table1 from '../../Common/Table/Table1'

const EmailTemplateDefaultList = () => {
    const [data, setData] = useState([]) //state for setting data
    const userDetails = useSelector((state) => state.user.userDetails) //contains user details data
    const [loading, setLoading] = useState(true) //state for displaying loader
    const [selectedId, setSelectedId] = useState(userDetails.locationId)
    const [eventSelect, setEventSelect] = useState()
    const [show, setShow] = useState(false) //state for showing modal pop ups
    const [options, setOptions] = useState([]) //state for storing all the location options
    const [formErrors, setFormErrors] = useState({}) //state for handling form errors during validation

    const handleClose = () => setShow(false)
    const entity = 'emailtemplates'

    useEffect(() => {
        setLoading(true)
        getEmailTemplateList(userDetails.locationId)
        if (userDetails.organizationId !== null) {
            getLocationList()
        }
    }, [])

    useEffect(() => {
        setEventSelect(userDetails.locationId)
    }, [])

    //api handling for get all locations  list
    const getLocationList = () => {
        // emailevents/getAll
        getAllById({
            entity: 'locations',
            organizationId: userDetails.organizationId
        })
            .then(
                (res) => {
                    // setEventSelect(res.data)
                    locationHandler(res.data)
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
        // setEventSelect(data)
        let optionsMapped = data.map((option) => ({
            value: option.id,
            label: option.name
        }))
        setOptions(optionsMapped)
    }

    const toggleHandler = ( row) => {
        

        updateEmailStatus({
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
            locationId: userDetails.locationId == null ? 0 : userDetails.locationId,
            id: row.id,
            status: !row.deleted
        })
            .then((res) => {
                // setData(res.data)
                // setShow(false)
                setLoading(true)
                toast.success(res.data)
                getEmailTemplateList(eventSelect)
            })
            .catch((err) => {
                toast.error(err.message)
                setLoading(false)
                console.log(err)
            })
    }
    //api handling for delete  api
    const onDeleteHandler = () => {
        // deleteById({ entity: entity, id: selectedId })
        updateEmailStatus({ id: selectedId, status: true })
            .then(
                () => {
                    // setData(res.data)
                    setShow(false)
                    setLoading(true)
                    getEmailTemplateList(eventSelect)
                },
                (error) => {
                    console.log(error)
                }
            )
            .catch((err) => {
                console.log(err)
            })
    }

    // const proceedDelete = (data, id) => {
    //     setShow(true)
    //     setSelectedId(data.id)
    //     // onDeleteHandler()
    // }

    const handleEventSelection = (selection) => {
        setEventSelect(selection.value)
        getEmailTemplateList(selection.value)
    }
    //api handling of get all api
    const getEmailTemplateList = (locationId) => {
        // setLoading(true)
        getAllWithOrgAndLocationIds({
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
            locationId: userDetails.locationId == null ? 0 : locationId,
            entity: entity
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
                    setLoading(false)
                }
            )
            .catch((err) => {
                console.log(err)
                setLoading(false)
            })
    }
    const COLUMNS = [
        //table columns
        {
            Header: 'Event',
            accessor: 'eventName'
        },

        {
            Header: 'Name',
            accessor: 'name'
        },
        {
            Header: (
                <div className="text-wrap text-left actions header ">
                    {userDetails.organizationId == null ? '' : 'Location Name'}
                </div>
            ),
            accessor: 'locationName',
            Cell: ({ row }) => <div className="text-left">{row.original.locationName}</div>
        },
        {
            Header: 'Status',
            disableSortBy: true,
            Cell: ({ row }) => (
                <>
                    {row.original.deleted == true ? (
                        <div className="iconWidth">
                            <Button
                                type="button"
                                style={{ paddingLeft: '3px' }}
                                variant=""
                                onClick={() => toggleHandler(row.original)}
                            >
                                <OffSwitch />
                            </Button>
                        </div>
                    ) : (
                        <div className="iconWidth">
                            <Button
                                type="button"
                                style={{ paddingLeft: '3px' }}
                                variant=""
                                onClick={() => toggleHandler(row.original)}
                            >
                                <OnSwitch />
                            </Button>
                        </div>
                    )}
                </>
            )
        },
        {
            Header: () => <div className="text-wrap text-right actions">Actions</div>,
            accessor: 'actions',
            disableSortBy: true,
            Cell: ({ row }) => (
                <>
                    <div className=" text-center actionsWidth">
                        <Button
                            type="button"
                            variant=""
                            className="iconWidth"
                            onClick={() => handleEdit(row.original, row.id)}
                        >
                            <EditIcon />
                        </Button>
                        {/* |<Button type="button"
                            variant=''  className='iconWidth'
                            onClick={() => proceedDelete(row.original, row.id)}>
                            <DeleteIcon />
                        </Button> */}
                    </div>
                </>
            )
        }
    ]

    const navigate = useNavigate() //for redirect

    const onAddHandler = () => {
        const locationId = eventSelect
        navigate('/emailTemplate', { state: { id: null, locationId } })
    }

    const handleEdit = (data) => {
        setSelectedId(data.id)
        getById({
            entity: entity,
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
            locationId: userDetails.locationId == null ? 0 : eventSelect,
            id: data.id
        })
            .then(
                (res) => {
                    // if (res.data.length > 1) {

                    // setData(res.data)
                    const data = res.data
                    const id = data.id
                    const locationId = eventSelect
                    navigate('/emailTemplate', { state: { data, id, locationId } })
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
                                <PageHeader pageTitle={'Email Templates'} />

                                <div className="table">
                                    {!userDetails.organizationId ? (
                                        <Button
                                            className="addButton"
                                            variant="addbtn"
                                            onClick={onAddHandler}
                                        >
                                            <AddIcon />
                                        </Button>
                                    ) : (
                                        <div
                                            className=""
                                            style={{
                                                marginLeft: '65%',
                                                marginTop: '-10px',
                                                marginBottom: '-45px'
                                            }}
                                        >
                                            <Form.Group as={Row}>
                                                <Form.Label column sm={3}>
                                                    Location:
                                                </Form.Label>
                                                <Col sm={6}>
                                                    <Select
                                                        options={options}
                                                        value={options.filter(
                                                            (option) => option.value == eventSelect
                                                        )}
                                                        onBlur={() =>
                                                            eventSelect == undefined
                                                                ? setFormErrors({
                                                                      ...formErrors,
                                                                      location: 'Location Required'
                                                                  })
                                                                : setFormErrors({
                                                                      ...formErrors,
                                                                      location: ''
                                                                  })
                                                        }
                                                        onChange={handleEventSelection}
                                                    />
                                                    <p className="error">
                                                        {formErrors.location}
                                                    </p>
                                                </Col>
                                            </Form.Group>
                                        </div>
                                    )}

                                    <>
                                        <Table1 
                                        key={data.length}
                                        columns={COLUMNS} serialNumber={true} data={data} />
                                    </>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
                <Modal.Header>
                    <Modal.Title>Delete ?</Modal.Title>
                    <Button onClick={handleClose}>X</Button>
                </Modal.Header>
                <Modal.Body style={{ textAlign: 'center' }}>
                    Are you sure you want to delete this item?
                </Modal.Body>
                <Modal.Footer>
                    <div style={{ marginRight: '35%', display: 'flex' }}>
                        <Button
                            variant="addbtn"
                            style={{ marginRight: '2%' }}
                            onClick={onDeleteHandler}
                        >
                            Yes
                        </Button>
                        <Button
                            variant="secondary"
                            style={{ marginRight: '2%' }}
                            onClick={handleClose}
                        >
                            No
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default EmailTemplateDefaultList
