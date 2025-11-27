import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import Modal from 'react-bootstrap/Modal'
import { useNavigate } from 'react-router-dom'
import { AddIcon, DeleteIcon, EditIcon } from '../../../Common/CommonIcons/CommonIcons'
import Table1 from '../../../Common/Table/Table1'

import { FaEye } from 'react-icons/fa6'
import { toast } from 'react-toastify'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import { getAll } from '../../../Common/Services/CommonService'
import { deleteWithoutOrgId } from '../../../Common/Services/OtherServices'

const TaxRulesList = () => {
    // Controls loading spinner or loader state
    const [loading, setLoading] = useState(true)
    // Holds list of all rules
    const [rulesList, setRulesList] = useState([])
    // Stores currently selected rule ID for edit/view actions
    const [selectedId, setSelectedId] = useState('')
    // Toggles visibility of a modal or section (e.g., rule form popup)
    const [show, setShow] = useState(false)
    // State for current year
    const [, setCurrentYear] = useState('')

    // for redirect
    const navigate = useNavigate()

    // Close Handler
    const onCloseHandler = () => {
        setShow(false)
    }

    useEffect(() => {
        const year = new Date().getFullYear()
        setCurrentYear(year)
        getAllRulesList()
    }, [])

    /**
     * Fetches all tax rules from the backend and updates the rules list state accordingly.
     * Sets loading state to true while fetching data and false once data is received.
     * @returns None
     */
    const getAllRulesList = () => {
        setLoading(true)
        getAll({
            entity: 'taxrules'
        }).then((res) => {
            if (res.statusCode == 200) {
                setLoading(false)
                setRulesList(res.data)
            }
        })
        .catch(() => {
            setLoading(false)
        })
    }

    // Edit
    const onEditHandler = (id) => {
        navigate('/taxRules', { state: { id } })
    }

    // Delete
    const onDeleteHandler = (id) => {
        setShow(true)
        setSelectedId(id)
    }

    /**
     * Handles the deletion of a tax rule entity without organization ID.
     * Sets loading state to true, makes a delete request to the server, and handles the response.
     * If the deletion is successful, shows a success message, hides the modal, and fetches all rules list.
     * If there is an error, shows an error message.
     * @returns None
     */
    const proceedDeleteHandler = () => {
        setLoading(true)
        deleteWithoutOrgId({
            entity: 'taxrules',
            id: selectedId
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setLoading(false)
                    toast.success('Deleted Successfully.')
                    setShow(false)
                    getAllRulesList()
                } else {
                    setLoading(false)
                    toast.error(res.errorMessage)
                }
            })
            .catch(() => {
                setLoading(false)
            })
    }

    // colums for table
    const COLUMNS = [
        { Header: 'Financial Year', accessor: 'financialYear' },
        {
            Header: () => (
                <div style={{ marginRight: '2.5%' }} className="header text-right holidayActions ">
                    Actions
                </div>
            ),
            accessor: 'actions',
            disableSortBy: true,
            width: '40%',
            Cell: ({ row }) => {
                const yearFrom = row.original.yearFrom
                const currentYear = new Date().getFullYear() // Get the current year
                // Check if yearFrom is less than current year
                const isYearFromLessThanCurrent = yearFrom < currentYear
                return (
                    <div
                        className="text-wrap text-right"
                        style={{ width: '130px', float: 'right' }}
                    >
                        {/* Only show View button if yearFrom is less than currentYear */}
                        {isYearFromLessThanCurrent ? (
                            <div className="text-center" style={{ paddingLeft: '15%' }}>
                                <Button
                                    variant=""
                                    className="iconWidth"
                                    style={{
                                        width: '10px',
                                        outline: 'none',
                                        border: 'none',
                                        background: 'none'
                                    }}
                                    onClick={() => onEditHandler(row.original.id)}
                                >
                                    <FaEye
                                        className="themeColor"
                                        size={20}
                                        style={{ outline: 'none' }}
                                    />
                                </Button>
                            </div>
                        ) : (
                            <>
                                {/* Show Edit and Delete buttons if yearFrom is equal to or greater than currentYear */}
                                <Button
                                    type="button"
                                    variant=""
                                    className="iconWidth"
                                    style={{
                                        outline: 'none',
                                        border: 'none',
                                        background: 'none'
                                    }}
                                    onClick={() => onEditHandler(row.original.id)}
                                >
                                    <EditIcon style={{ outline: 'none' }} />
                                </Button>
                                |
                                <Button
                                    type="button"
                                    variant=""
                                    className="iconWidth"
                                    style={{
                                        outline: 'none',
                                        border: 'none',
                                        background: 'none'
                                    }}
                                    onClick={() => onDeleteHandler(row.original.id)}
                                >
                                    <DeleteIcon style={{ outline: 'none' }} />
                                </Button>
                            </>
                        )}
                    </div>
                )
            }
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
                                <PageHeader pageTitle={'Payroll Settings'} />

                                <div className="">
                                    <Button
                                        className="addButton"
                                        variant="addbtn"
                                        onClick={() => navigate('/taxRules')}
                                    >
                                        <AddIcon />
                                    </Button>

                                    <>
                                        <Table1
                                            columns={COLUMNS}
                                            data={rulesList}
                                            key={rulesList.length}
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
            <Modal show={show} onHide={onCloseHandler} backdrop="static" keyboard={false}>
                <Modal.Header closeButton={onCloseHandler}>
                    <Modal.Title>Delete ?</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    {loading ? <DetailLoader /> : ''}
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

export default TaxRulesList
