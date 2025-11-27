import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import Modal from 'react-bootstrap/Modal'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { commonCrudSuccess } from '../../Common/CommonComponents/CustomizedSuccessToastMessages'
import DetailLoader from '../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../Common/CommonComponents/PageHeader'
import { ToastError, ToastSuccess } from '../../Common/CommonComponents/ToastCustomized'
import { AddIcon, DeleteIcon, EditIcon } from '../../Common/CommonIcons/CommonIcons'
import { deleteById, getAllByOrgId } from '../../Common/Services/CommonService'
import Table1 from '../../Common/Table/Table1'

const HolidayCalendarList = () => {
    const userDetails = useSelector((state) => state.user.userDetails) //fetch userdetails using redux
    const [loading, setLoading] = useState(true) //state for loader
    const [holidayCalendarList, setHolidayCalendarList] = useState([]) //state for calendarlist
    const [selectedCalendar, setSelectedCalendar] = useState({}) //state for delete the calendar
    const [show, setShow] = useState(false) // state for popups
    const navigate = useNavigate() // for redirect

    const onCloseHandler = () => {
        //function for closing popUp
        setShow(false)
    }

    useEffect(() => {
        onGetHolidaysHandler()
    }, [])

    // get Holidays from the api
    const onGetHolidaysHandler = () => {
        getAllByOrgId({ entity: 'holidays', organizationId: userDetails.organizationId }).then(
            (res) => {
                setLoading(false)
                if (res.statusCode == 200) {
                    setHolidayCalendarList(res.data)
                }
            }
        )
    }

    const onEditHandler = (id) => {
        navigate('/HolidayCalendar', { state: { id } })
    }

    const onConfirmDeleteHandler = (data) => {
        //conformation for delete holidayCalendar
        if (data.holidayDTOs == null || data.holidayDTOs.length <= 0) {
            setSelectedCalendar(data)
            setShow(true)
        } else {
            toast.error('Unable to Delete. Holiday(s) Exist!')
        }
    }

    // delete row data(holidayCalendar)
    const proceedDeleteHandler = () => {
        deleteById({
            entity: 'holidays',
            organizationId: userDetails.organizationId,
            id: selectedCalendar.id,
            screenName: 'Holiday Calendar',
            toastSuccessMessage: commonCrudSuccess({
                screen: 'Holiday Calendar',
                operationType: 'delete'
            })
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    ToastSuccess(res.message)
                    onCloseHandler()
                    onGetHolidaysHandler()
                }
            })
            .catch((e) => {
                console.log(e.message)
                ToastError(e.message)
            })
    }

    // colums for table
    const COLUMNS = [
        {
            Header: 'Year',
            accessor: 'year'
        },

        {
            Header: 'Name',
            accessor: 'name'
        },
        {
            Header: () => (
                <div className="text-wrap text-right holidayActions header ">Actions</div>
            ),
            accessor: 'actions',
            disableSortBy: true,
            width: '40%',
            Cell: (row) => (
                <div className="text-wrap text-right" style={{ width: '145px', float: 'right' }}>
                    <Button
                        type="button"
                        variant=""
                        className="iconWidth"
                        onClick={() => onEditHandler(row.row.original.id)}
                    >
                        <EditIcon />
                    </Button>
                    |
                    <Button
                        type="button"
                        variant=""
                        className="iconWidth"
                        onClick={() => onConfirmDeleteHandler(row.row.original)}
                    >
                        <DeleteIcon />
                    </Button>
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
                                <PageHeader pageTitle={'Holiday Calendars'} />

                                <div className="">
                                    <Button
                                        className="addButton"
                                        variant="addbtn"
                                        onClick={() =>
                                            navigate('/HolidayCalendar', { state: { id: null } })
                                        }
                                    >
                                        <AddIcon />
                                    </Button>
                                    {
                                        <>
                                            <Table1
                                                key={holidayCalendarList.length}
                                                columns={COLUMNS}
                                                data={holidayCalendarList}
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
            </section>
            <Modal show={show} onHide={onCloseHandler} backdrop="static" keyboard={false}>
                <Modal.Header>
                    <Modal.Title>Delete ?</Modal.Title>
                    <Button variant="secondary" onClick={onCloseHandler}>
                        X
                    </Button>
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
        </>
    )
}

export default HolidayCalendarList
