import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap'
import Button from 'react-bootstrap/Button'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { commonCrudSuccess } from '../../../Common/CommonComponents/CustomizedSuccessToastMessages'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import { ToastError, ToastSuccess } from '../../../Common/CommonComponents/ToastCustomized'
import { AddIcon, DeleteIcon, EditIcon } from '../../../Common/CommonIcons/CommonIcons'
import {
    deleteById,
    getAll,
    getAllById,
    getByIdwithOutOrg
} from '../../../Common/Services/CommonService'
import { deleteWithoutOrgId } from '../../../Common/Services/OtherServices'
import Table1 from '../../../Common/Table/Table1'

const AnnouncementList = () => {
    const userDetails = useSelector((state) => state.user.userDetails) //fetch userdetails using redux
    const [loading, setLoading] = useState(true) //state for page loader
    const [data, setData] = useState([]) //state for column data
    const [show, setShow] = useState(false) //state for pop up
    const [selectedId, setSelectedId] = useState() //state for selected id to delete
    // for redirect
    const navigate = useNavigate()
    useEffect(() => {
        getAnnouncementsHandler()
    }, [])

    //getAll announcements
    const getAnnouncementsHandler = () => {
        {
            //getAll announcements by orgId
            userDetails.organizationId
                ? getAllById({
                    entity: 'announcements',
                    organizationId: userDetails.organizationId
                })
                    .then((res) => {
                        setLoading(false)
                        if (res.statusCode == 200) {
                            setData(res.data ? res.data : [])
                        }
                    })
                    .catch(() => {
                        setLoading(false)
                    })
                : //getAll announcemnts for app owner
                getAll({
                    entity: 'appownerannouncements'
                })
                    .then((res) => {
                        setLoading(false)
                        if (res.statusCode == 200) {
                            setData(res.data ? res.data : [])
                        }
                    })
                    .catch(() => {
                        setLoading(false)
                    })
        }
    }

    const onCloseHandler = () => {
        setShow(false)
    }

    //getById
    const onEditHandler = (id) => {
        {
            userDetails.organizationId == null
                ? getByIdwithOutOrg({
                    entity: 'appownerannouncements',
                    id: id
                })
                    .then(
                        (res) => {
                            const data = res.data
                            const id = data.id
                            navigate('/appOwnerAnnouncement', { state: { data, id } })
                        }
                        
                    )
                    .catch(()=> {}) // Handle error by doing nothing
                : navigate('/announcement', { state: { id } })
        }
    }

    //delete handler
    const onDeleteHandler = (id) => {
        setSelectedId(id)
        setShow(true)
    }

    // delete row data
    const proceedDeleteHandler = () => {
        if (userDetails.organizationId != null) {
            deleteById({
                entity: 'announcements',
                organizationId: userDetails.organizationId,
                id: selectedId,
                screenName: 'Announcement',
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Announcement',
                    operationType: 'delete'
                })
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        ToastSuccess(res.message)
                        onCloseHandler()
                        getAnnouncementsHandler()
                    }
                })
                .catch((e) => {
                    ToastError(e.message)
                })
        } else {
            deleteWithoutOrgId({
                entity: 'appownerannouncements',
                id: selectedId,
                screenName: 'Announcement',
                toastSuccessMessage: commonCrudSuccess({
                    screen: 'Announcement',
                    operationType: 'delete'
                })
            })
                .then((res) => {
                    if (res.statusCode == 200) {
                        ToastSuccess(res.message)
                        onCloseHandler()
                        getAnnouncementsHandler()
                    }
                })
                .catch((e) => {
                    ToastError(e.message)
                })
        }
    }
    // colums for table
    const COLUMNS = [
        {
            Header: 'Name',
            accessor: 'name'
        },

        {
            Header: 'From',
            accessor: 'effectiveStartDate'
        },
        {
            Header: 'To',
            accessor: 'effectiveEndDate'
        },
        {
            Header: () => <div className="text-wrap text-right actions ">Actions</div>,
            accessor: 'actions',
            disableSortBy: true,
            Cell: ({ row }) => (
                <>
                    <div className="text-wrap text-right actionsWidth">
                        <Button
                            type="button"
                            className="iconWidth"
                            variant=""
                            onClick={() => onEditHandler(row.original.id)}
                        >
                            <EditIcon />
                        </Button>
                        |
                        <Button
                            type="button"
                            variant=""
                            className="iconWidth"
                            onClick={() => onDeleteHandler(row.original.id)}
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
            {loading ? <DetailLoader /> : ''}
            <section className="section">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="">
                                <PageHeader pageTitle="Announcements" />

                                <div className="table">
                                    {
                                        <>
                                            <Button
                                                className="addButton"
                                                variant="addbtn"
                                                onClick={() => {
                                                    userDetails.organizationId != null
                                                        ? navigate('/announcement', {
                                                            state: { id: null }
                                                        })
                                                        : navigate('/appOwnerAnnouncement', {
                                                            state: { id: null }
                                                        })
                                                }}
                                            >
                                                <AddIcon />
                                            </Button>
                                            <Table1
                                                key={data.length}
                                                columns={COLUMNS}
                                                serialNumber={true}
                                                data={data}
                                                pageSize="10"
                                            />
                                        </>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Modal show={show} onHide={onCloseHandler} backdrop="static" keyboard={false}>
                    <Modal.Header className="modalHeader" closeButton={onCloseHandler}>
                        <Modal.Title>Delete ?</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="modalBody">
                        Are you sure you want to delete this item ?
                    </Modal.Body>
                    <div className="delbtn">
                        <Button className="Button" variant="addbtn" onClick={proceedDeleteHandler}>
                            Yes
                        </Button>
                        <Button className="Button" variant="secondary" onClick={onCloseHandler}>
                            No
                        </Button>
                    </div>
                </Modal>
            </section>
        </>
    )
}

export default AnnouncementList
