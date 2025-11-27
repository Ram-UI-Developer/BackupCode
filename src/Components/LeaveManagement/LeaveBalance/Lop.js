import React, { useState } from 'react'
import Table from '../../../Common/Table/Table'

const LopView = ({ LopHistory }) => {
    const data = LopHistory
    const COLUMNS = [
        {
            Header: () => (
                <div className="text-right header" style={{ marginRight: '35%' }}>
                    Month
                </div>
            ),
            accessor: 'month',
            Cell: ({ row }) => (
                <div className="text-right" style={{ marginRight: '38%' }}>
                    {row.original.month}
                </div>
            )
        },
        {
            Header: () => (
                <div className="text-right header" style={{ marginRight: '35%' }}>
                    Year
                </div>
            ),
            accessor: 'year',
            Cell: ({ row }) => (
                <div className="text-right" style={{ marginRight: '38%' }}>
                    {row.original.year}
                </div>
            )
        },

        {
            Header: () => (
                <div className="text-right header" style={{ marginRight: '35%' }}>
                    LOP Days
                </div>
            ),
            accessor: 'lopDays',
            Cell: ({ row }) => (
                <div className="text-right" style={{ marginRight: '38%' }}>
                    {row.original.lopDays}
                </div>
            )
        }
    ]
    return (
        <div>
            <section className="section">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className=" ">
                                <h6>
                                    <label>LOP History</label>
                                </h6>
                                <div className="table">
                                    <Table columns={COLUMNS} data={data} serialNumber={true} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
export default LopView
