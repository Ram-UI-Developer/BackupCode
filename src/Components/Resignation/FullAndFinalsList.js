import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import DetailLoader from '../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../Common/CommonComponents/PageHeader'
import { AddIcon, EditIcon, ViewFile } from '../../Common/CommonIcons/CommonIcons'
import { getAllByOrgId } from '../../Common/Services/CommonService'
import Table from '../../Common/Table/Table'

const FullAndFinalsList = () => {
    const userDetails = useSelector((state) => state.user.userDetails)
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState([])

    useEffect(() => {
        getAllRecordByOrgId()
    }, [])

    //api handling for getting all records in that organization
    const getAllRecordByOrgId = () => {
        getAllByOrgId({
            entity: 'fullandfinalsettlement',
            organizationId: userDetails.organizationId
        })
            .then(
                (response) => {
                    if (response.statusCode == 200) {
                        setData(response.data ? response.data : [])
                        setLoading(false)
                    }
                },
                (err) => {
                    console.log(err)
                    setLoading(false)
                }
            )
            .catch((error) => {
                console.log(error)
                setLoading(false)
            })
    }

    //table columns
    const COLUMNS = [
        {
            Header: 'Employee Name',
            accessor: 'employeeName'
        },
        {
            Header: 'Employee Code',
            accessor: 'employeeCode'
        },
        {
            Header: 'Location Name',
            accessor: 'locationName'
        },
        {
            Header: 'Status',
            accessor: 'status.label'
        },
        {
            Header: () => <div className="text-wrap text-right actions">Actions</div>,
            accessor: 'actions',
            disableSortBy: true,
            Cell: ({ row }) => (
                <>
                    <div className="text-wrap text-right actionsWidth">
                        <Button
                            disabled={row.original.status.label == 'Completed'}
                            variant=""
                            className="iconWidth"
                            onClick={() => onShowHandler(row.original, 'updateFAFS')}
                        >
                            <EditIcon />
                        </Button>
                        |
                        <Button
                            disabled={row.original.status.label != 'Completed'}
                            variant=""
                            className="iconWidth"
                            onClick={() => onShowHandler(row.original, 'ViewFAFS')}
                        >
                            <ViewFile />
                        </Button>
                    </div>
                </>
            )
        }
    ]

    const navigate = useNavigate()

    const onShowHandler = (row, action) => {
        if (action == 'createFAFS') {
            navigate('/fullAndFinalSettllement', { state: { id: null } })
        } else if (action == 'updateFAFS') {
            navigate('/fullAndFinalSettllement', { state: { id: row.id } })
        } else if (action == 'ViewFAFS') {
            navigate('/fullAndFinalSettllement', {
                state: { employeeId: row.employeeId, name: 'viewAllDetails' }
            })
        }
    }

    return (
        <div>
            {loading ? <DetailLoader /> : ''}
            <section className="section">
                <div className="container-fluid">
                    <div className="row">
                        <PageHeader pageTitle="Full And Final Settlement Forms" />
                        <div>
                            <Button
                                className="addButton"
                                variant="addbtn"
                                onClick={() => onShowHandler(data, 'createFAFS')}
                            >
                                <AddIcon />
                            </Button>

                            <>
                                <Table 
                            key={data.length}
                                columns={COLUMNS} data={data} serialNumber={true} />{' '}
                            </>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default FullAndFinalsList
