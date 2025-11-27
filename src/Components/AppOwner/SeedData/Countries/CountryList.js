import React, { useEffect, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import DetailLoader from '../../../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../../../Common/CommonComponents/PageHeader'
import { AddIcon, EditIcon, OffSwitch, OnSwitch } from '../../../../Common/CommonIcons/CommonIcons'
import { deleteById, getAllByOrgId } from '../../../../Common/Services/CommonService'
import {
    updateStatusWithOrgId,
    updateStatusWithoutOrgId
} from '../../../../Common/Services/OtherServices'
import Table1 from '../../../../Common/Table/Table1'

const CountryList = () => {
    const userDetails = useSelector((state) => state.user.userDetails) //contains user details data
    const entityName = userDetails.organizationId == null ? 'countries' : 'organizationCountry'

    const [data, setData] = useState([]) //state for setting data
   
    const [loading, setLoading] = useState(true) //state for displaying loader

    // state for popups
    const [show, setShow] = useState(false)

    // for redirect
    const navigate = useNavigate()

    const onCloseHandler = () => {
        setShow(false)
    }

    useEffect(() => {
        onGetHandler()
    }, [])

    //api handling for get all api
    const onGetHandler = () => {
        getAllByOrgId({
            entity: entityName,
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId
        })
            .then(
                (res) => {
                    setData(res.data ? res.data : [])
                    setLoading(false)
                },
                (error) => {
                    console.log(error)
                }
            )
            .catch((err) => {
                console.log(err)
            })
    }

    const onEditHandler = (id) => {
        navigate('/country', { state: { id } })
    }

   

    // delete row data
    //api handling for delete  record
    const proceedDeleteHandler = () => {
        const selectedId =null;
        deleteById({
            entity: entityName,
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
            id: selectedId
        }).then((res) => {
            if (res.statusCode == 200) {
                toast.success('Record deleted successfully.')
                onGetHandler()
                onCloseHandler()
            } else {
                toast.error(res.errorMessage)
            }
        
        })
        .catch((err) => {
                        setLoading(false)
                        toast.error(err.message)
                    })
    }

    //api handling for status update to country data with organizationId
    const onStatusChangeHandler = (row) => {
        updateStatusWithOrgId({
            entity: entityName,
            organizationId: userDetails.organizationId == null ? 0 : userDetails.organizationId,
            id: row.countryId,
            status: !row.deleted
        }).then((res) => {
            if (res.statusCode == 200) {
                toast.success('Status updated successfully.')
                onGetHandler()
                onCloseHandler()
            } else {
                toast.error(res.errorMessage)
            }
        })
    }

    //api handling for status update to country data without organizationId

    const onStatusHandler = (row) => {
        const currentStatus = row.deleted !== undefined ? row.deleted : false

        const newStatus = !currentStatus

        updateStatusWithoutOrgId({
            entity: entityName,
            id: row.id,
            status: newStatus
        })
            .then((res) => {
                if (res.statusCode === 200) {
                    toast.success('Status updated successfully.')
                    onGetHandler()
                    onCloseHandler()
                } else {
                    toast.error(res.errorMessage)
                }
            })
            .catch((error) => {
                console.error('Error updating status:', error)
                toast.error('An error occurred while updating the status.')
            })
    }

    const getStatus = (row) => {
        return row.deleted !== undefined ? row.deleted : false
    }

    // colums for table
    const COLUMNS = [
        {
            Header: 'Name',
            accessor: 'name'
        },
        {
            Header: 'ISD Code',
            accessor: 'isdCode',
            headerAlign: 'right',
            Cell: ({ row }) => <div className="numericData">{row.original.isdCode}</div>
        },
        {
            Header: 'ISO Code',
            accessor: 'isoCode'
        },
        {
            Header: 'ISO Number Code',
            accessor: 'isoNumberCode',
            headerAlign: 'right',
            Cell: ({ row }) => <div className="numericData">{row.original.isoNumberCode}</div>
        },

        {
            Header: (
                <span style={{ marginRight: '20px' }}>
                    {userDetails.organizationId == null ? 'Actions' : 'Status'}
                </span>
            ),

            accessor: 'status',
            headerAlign: 'right',
            Cell: ({ row }) => (
                <div style={{ paddingRight: '10px' }}>
                    {userDetails.organizationId == null ? (
                        <div className="text-center" style={{ display: 'flex', float: 'right' }}>
                            <Button
                                className="iconWidth"
                                variant=""
                                onClick={() => onEditHandler(row.original.id)}
                            >
                                <EditIcon />
                            </Button>
                            <span style={{ marginTop: '10px' }}>|</span>

                            {getStatus(row.original) ? (
                                <div className="" style={{ height: '20px', width: '45px' }}>
                                    <Button
                                        type="button"
                                        variant=""
                                        onClick={() => onStatusHandler(row.original)}
                                    >
                                        <OffSwitch />
                                    </Button>
                                </div>
                            ) : (
                                <div className="iconWidth text-right">
                                    <Button
                                        type="button"
                                        variant=""
                                        onClick={() => onStatusHandler(row.original)}
                                    >
                                        <OnSwitch />
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-wrap" style={{ float: 'right', marginRight: '25px' }}>
                            {row.original.deleted ? (
                                <div className="iconWidth">
                                    <Button
                                        type="button"
                                        variant=""
                                        onClick={() => onStatusChangeHandler(row.original)}
                                    >
                                        <OffSwitch />
                                    </Button>
                                </div>
                            ) : (
                                <div className="iconWidth text-right">
                                    <Button
                                        type="button"
                                        variant=""
                                        onClick={() => onStatusChangeHandler(row.original)}
                                    >
                                        <OnSwitch />
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
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
                                <PageHeader pageTitle="Countries" />

                                <div className="table">
                                    {
                                        <>
                                            {userDetails.organizationId ? (
                                                <Button className="addButton" variant=""></Button>
                                            ) : (
                                                <Button
                                                    className="addButton"
                                                    variant="addbtn"
                                                    onClick={() =>
                                                        navigate('/country', {
                                                            state: { id: null }
                                                        })
                                                    }
                                                >
                                                    <AddIcon />
                                                </Button>
                                            )}
                                            <Table1
                                            key={data.length}
                                                columns={COLUMNS}
                                                data={data}
                                                pageSize="10"
                                                serialNumber={true}
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
                        {/* <Button variant="secondary" onClick={onCloseHandler}>X</Button> */}
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

export default CountryList
