import React, { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import { useNavigate } from 'react-router-dom'
import { formatCurrency } from '../../../Common/CommonComponents/CurrencyFormate'
import { commonCrudSuccess } from '../../../Common/CommonComponents/CustomizedSuccessToastMessages'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import { ToastError, ToastSuccess } from '../../../Common/CommonComponents/ToastCustomized'
import { AddIcon, DeleteIcon, EditIcon } from '../../../Common/CommonIcons/CommonIcons'
import { appownerDeleteById, getAll } from '../../../Common/Services/CommonService'
import Table1 from '../../../Common/Table/Table1'

const ModulesList = () => {
    const [loading, setLoading] = useState(true) // State for Loader enable and disable
    const [modulesList, setmodulesList] = useState([]) // State for All modules
    const navigate = useNavigate() // declire navigation
    const [show, setShow] = useState(false) // State for modal
    const [selectedId, setSelectedId] = useState() // State for selected id to delete record

    // close the modal
    const onCloseHandler = () => {
        setShow(false)
    }

    //Fetch all modeles on component mount
    useEffect(() => {
        onGetModulesHandler()
    }, [])

    const onGetModulesHandler = () => {
        getAll({
            entity: 'modules'
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setmodulesList(res.data)
                    setLoading(false)
                } else {
                    setmodulesList([])
                }
            })
            .catch(() => {
                setLoading(false)
            })
    }

    // navigate to detail screen with id
    const onEditHandler = (id) => {
        navigate('/module', { state: { id } })
    }

    // Enable modal
    const onDeleteHandler = (id) => {
        setSelectedId(id)
        setShow(true)
    }

    // Conformation for Delete module
    const proceedDeleteHandler = () => {
        appownerDeleteById({
            entity: 'modules',
            id: selectedId,
            toastSuccessMessage: commonCrudSuccess({ screen: 'Module', operationType: 'delete' }),
            screenName: 'Module'
        })
            .then((res) => {
                setShow(false)
                if (res.statusCode == 200) {
                    ToastSuccess(res.message)
                    onCloseHandler()
                    onGetModulesHandler()
                }
            })
            .catch((err) => {
                ToastError(err.message)
            })
    }

    // colums for table
    const COLUMNS = [
        {
            Header: 'Name',
            accessor: 'name',
            Cell: ({ row }) => <div className="text-left">{row.original.name}</div>
        },
        {
            Header: 'Description',
            accessor: 'description',
            width: '40%',
            Cell: ({ row }) => <div className="text-left">{row.original.description}</div>
        },
        {
            Header: 'Price',
            accessor: 'price',
            headerAlign: 'right',
            width: '40%',
            Cell: ({ row }) => (
                <div className="numericData">{formatCurrency(row.original.price, 'INR')}</div>
            )
        },
        {
            Header: 'App Owner Only?',
            accessor: 'appownerOnly',
            width: '40%',
            Cell: ({ row }) => (
                <div className="text-left">{row.original.appownerOnly ? 'Yes' : 'No'}</div>
            )
        },
        {
            Header: 'Mandatory',
            accessor: 'required',
            width: '40%',
            Cell: ({ row }) => (
                <div className="text-left">{row.original.required ? 'Yes' : 'No'}</div>
            )
        },
        {
            Header: () => <div className="text-wrap text-right actions">Actions</div>,
            accessor: 'actions',
            disableSortBy: true,
            width: '40%',
            Cell: ({ row }) => (
                <>
                    <div className="text-right actionsWidth">
                        <Button
                            type="button"
                            variant=""
                            className="iconWidth"
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
                                <PageHeader pageTitle={'Modules'} />
                                <div className="table">
                                    <Button
                                        className="addButton"
                                        variant="addbtn"
                                        onClick={() => onEditHandler(null)}
                                    >
                                        <AddIcon />
                                    </Button>{' '}
                                    <>
                                        {' '}
                                        <div
                                            style={{
                                                marginTop: '2%',
                                                position: 'absolute',
                                                fontWeight: '500',
                                                marginLeft: '0.2%'
                                            }}
                                        ></div>
                                        <Table1
                                            key={modulesList.length}
                                            columns={COLUMNS}
                                            data={modulesList}
                                            serialNumber={true}
                                            pageSize="10"
                                        />
                                    </>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* delete modal section  */}
            <Modal show={show} onHide={onCloseHandler} backdrop="static" keyboard={false}>
                <Modal.Header className="" closeButton={() => onCloseHandler()}>
                    <Modal.Title>Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    Are you sure you want to delete this item?
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
        </>
    )
}

export default ModulesList
