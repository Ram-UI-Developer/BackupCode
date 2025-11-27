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

const ScreenList = () => {
    const [loading, setLoading] = useState(true) // State for handling Loader
    const [screenList, setScreenList] = useState([]) // State for all screens
    const [show, setShow] = useState(false) // State for modal
    const [selectedId, setSelectedId] = useState('') // State for selected id to delete screen record
    const navigate = useNavigate() // declering navigation
    // close modal
    const onCloseHandler = () => {
        setShow(false)
    }
    // Fetch screens on componet mount
    useEffect(() => {
        getAllHandler()
    }, [])

    const getAllHandler = () => {
        getAll({ entity: 'screens' })
            .then((res) => {
                if (res.statusCode == 200) {
                    setScreenList(res.data)
                }
                setLoading(false)
            })
            .catch(() => {
                setLoading(false)
            })
    }

    // Navigate to Detail screen with id
    const onEditHandler = (id) => {
        navigate('/screen', { state: { id } })
    }

    // open modal
    const onDeleteHandler = (id) => {
        setSelectedId(id)
        setShow(true)
    }

    // Conformation for delete with api
    const proceedDeleteHandler = () => {
        appownerDeleteById({
            entity: 'screens',
            id: selectedId,
            toastSuccessMessage: commonCrudSuccess({ screen: 'Screen', operationType: 'delete' }),
            screenName: 'Screen'
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    ToastSuccess(res.message)
                    getAllHandler()
                    onCloseHandler()
                }
            })
            .catch((err) => {
                ToastError(err.message)
            })
    }

    // colums for table
    const COLUMNS = [
        {
            Header: 'Screen Name',
            accessor: 'name'
        },
        {
            Header: 'Path Name',
            accessor: 'path'
        },
        {
            Header: 'Current Price',
            accessor: 'currentPrice',
            headerAlign: 'right',
            Cell: ({ row }) => (
                <div className="numericData">
                    {row.original.currentPrice ? (
                        <>{formatCurrency(row.original.currentPrice, 'INR')}</>
                    ) : (
                        ''
                    )}
                </div>
            )
        },
        {
            Header: 'Latest Price',
            accessor: 'latestPrice',
            headerAlign: 'right',
            Cell: ({ row }) => <div className="numericData">&#8377;{row.original.latestPrice}</div>
        },
        {
            Header: () => <div className="text-wrap text-right actions ">Actions</div>,
            accessor: 'actions',
            disableSortBy: true,
            width: '40%',
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
                                <PageHeader pageTitle={'Screens'} />

                                <div className="table">
                                    <Button
                                        className="addButton"
                                        variant="addbtn"
                                        onClick={() => navigate('/screen', { state: { id: null } })}
                                    >
                                        <AddIcon />
                                    </Button>

                                    <Table1
                                        key={screenList.length}
                                        columns={COLUMNS}
                                        data={screenList}
                                        serialNumber={true}
                                        pageSize="10"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Modal show={show} onHide={onCloseHandler} backdrop="static" keyboard={false}>
                    <Modal.Header closeButton={onCloseHandler}>
                        <Modal.Title>Delete ?</Modal.Title>
                        {/* <Button variant="secondary" onClick={onCloseHandler}>X</Button> */}
                    </Modal.Header>
                    <Modal.Body className="modalBody">
                        Are you sure you want to delete this item?
                    </Modal.Body>
                    <div className="delbtn">
                        <Button variant="addbtn" className="Button" onClick={proceedDeleteHandler}>
                            Yes
                        </Button>
                        <Button variant="secondary" onClick={onCloseHandler} className="Button">
                            No
                        </Button>
                    </div>
                </Modal>
            </section>
        </>
    )
}

export default ScreenList
