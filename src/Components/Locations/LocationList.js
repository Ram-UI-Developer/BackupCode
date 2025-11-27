import React, { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { commonCrudSuccess } from '../../Common/CommonComponents/CustomizedSuccessToastMessages'
import DetailLoader from '../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../Common/CommonComponents/PageHeader'
import { ToastError, ToastSuccess } from '../../Common/CommonComponents/ToastCustomized'
import { AddIcon, DeleteIcon, EditIcon } from '../../Common/CommonIcons/CommonIcons'
import { deleteById, getAllByOrgId } from '../../Common/Services/CommonService'
import Table1 from '../../Common/Table/Table1'

const LocationList = () => {
    const userDetails = useSelector((state) => state.user.userDetails) //fetch userdetails using redux
    const [loading, setLoading] = useState(true) //state for page loader
    const [locationList, setLocationList] = useState([]) //state for locationList
    const [selectedId, setSelectedId] = useState() //state for selected locationId to delete
    const [show, setShow] = useState(false) // state for popup
    const navigate = useNavigate() // for redirect

    const onCloseHandler = () => {
        //handling close handler for delete popUp
        setShow(false)
    }

    useEffect(() => {
        onGetLocationsHandler()
    }, [])

    // get Locations from the organizationId
    const onGetLocationsHandler = () => {
        getAllByOrgId({ entity: 'locations', organizationId: userDetails.organizationId })
            .then((res) => {
                if (res.statusCode == 200) {
                    setLocationList(res.data)
                }
                setLoading(false)
            })
            .catch((err) => {
                console.log(err, 'error')
            })
    }

    const onEditHandler = (id) => {
        //navigate to ocation detail screen
        navigate('/location', { state: { id } })
    }

    const onDeleteHandler = (id) => {
        //handling the location delete popUp
        setSelectedId(id)
        setShow(true)
    }

    // delete row data
    const proceedDeleteHandler = () => {
        deleteById({
            entity: 'locations',
            organizationId: userDetails.organizationId,
            id: selectedId,
            screenName: 'Location',
            toastSuccessMessage: commonCrudSuccess({ screen: 'Location', operationType: 'delete' })
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    // toast.success("Record deleted successfully.")
                    ToastSuccess(res.message)
                    onCloseHandler()
                    onGetLocationsHandler()
                }
            })
            .catch((e) => {
                console.log(e.message)
                ToastError(e.message)
            })
    }
    // colums for table
    const locationCOLUMNS = [
        // {
        //     Header: "Name",
        //     accessor: "name",
        //     Cell: ({ row }) => (
        //         <>
        //             <div className='tableData' >
        //                 {row.original.name} {row.original.headOffice? <>
        //                     <img className='headQuartersIcon' src='/dist/Images/HQ.png' alt='img' />
        //                 </> : ""}
        //             </div>
        //         </>
        //     ),
        // },
        {
            Header: 'Name',
            accessor: 'name',
            Cell: ({ row }) => (
                <>
                    <div className="tableData nameCell">
                        <span className="nameText" title={row.original.name}>
                            {row.original.name}
                        </span>
                        {row.original.headOffice && (
                            <img className="headQuartersIcon" src="/dist/Images/HQ.png" alt="img" />
                        )}
                    </div>
                </>
            )
        },
        {
            Header: 'Address',
            accessor: 'address1',
            Cell: ({ row }) => (
                <>
                    <div className="tableData">{row.original.address1}</div>
                </>
            )
        },
        {
            Header: 'City',
            accessor: 'city'
        },
        {
            Header: 'State',
            accessor: 'stateName'
        },
        {
            Header: 'Country',
            accessor: 'countryName'
        },

        {
            Header: () => <div className="text-left header"> Postal / Zip Code </div>,
            accessor: 'zipCode',
            Cell: ({ row }) => (
                <>
                    <div className="text-left">{row.original.zipCode}</div>
                </>
            )
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
                            disabled={row.original.headOffice}
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
                                <PageHeader pageTitle="Locations" />

                                <div className="">
                                    <Button
                                        className="addButton"
                                        variant="addbtn"
                                        onClick={() =>
                                            navigate('/location', { state: { id: null } })
                                        }
                                    >
                                        <AddIcon />
                                    </Button>
                                    {
                                        <>
                                            <Table1
                                            key={locationList.length}
                                                columns={locationCOLUMNS}
                                                data={locationList}
                                                serialNumber={true}
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

export default LocationList
