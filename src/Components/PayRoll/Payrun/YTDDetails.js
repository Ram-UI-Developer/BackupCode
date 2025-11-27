import React from 'react'
import { formatCurrencyWithoutDecimals } from '../../../Common/CommonComponents/CurrencyFormate'
import Table from '../../../Common/Table/Table'

const YTDDetails = (props) => {
    const currencyCode = 'INR' // currency format
    const date = new Date('2024-04-28') // date decleration
    const monthShortForm = date.toLocaleString('en-US', { month: 'short' }) // month decleration
    const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
    ] // all months

    // shorted months
    function getSortedMonths(startMonth) {
        const startIndex = months.findIndex(
            (month) => month.toLowerCase() === startMonth.toLowerCase()
        )

        if (startIndex === -1) {
            throw new Error('Invalid month name')
        }

        const sortedMonths = [...months.slice(startIndex), ...months.slice(0, startIndex)]
        return sortedMonths
    }

    // Example usage:
    const sortedMonths = getSortedMonths(monthShortForm)

    // columns for table
    let Columns = [
        {
            Header: 'Component',
            accessor: 'name',
            Cell: ({ row }) => <div className="text-left">{row.original.name}</div>
        },
        {
            Header: 'Type',
            accessor: 'type.label',
            Cell: ({ row }) => <div className="text-left">{row.original.type.label}</div>
        }
    ]

    // months pushed to table columns
    sortedMonths.forEach((month) =>
        Columns.push({
            Header: () => <div className="text-right header">{month}</div>,
            accessor: month,
            Cell: ({ row }) => (
                <div className="text-right">
                    {formatCurrencyWithoutDecimals(
                        row.original[month.toLowerCase()] > 0
                            ? row.original[month.toLowerCase()]
                            : '0',
                        currencyCode,
                        'en-IN'
                    )}
                </div>
            ),
            Footer: () => (
                <div
                    className="footerBox text-right"
                    style={{ marginRight: '-0.5rem', flexWrap: 'nowrap' }}
                >
                    {formatCurrencyWithoutDecimals(
                        props.ytdComponents
                            .map((ytd) => ytd[month.toLowerCase()])
                            .reduce((acc, amt) => acc + amt, 0) > 0
                            ? props.ytdComponents
                                  .map((ytd) => ytd[month.toLowerCase()])
                                  .reduce((acc, amt) => acc + amt, 0)
                            : '0',
                        currencyCode,
                        'en-IN'
                    )}
                </div>
            )
        })
    )
    // total added to table
    Columns.push({
        Header: () => <div className="text-right header">Total Amount</div>,
        accessor: 'totalAmount',
        Cell: ({ row }) => (
            <div className="text-right">
                {formatCurrencyWithoutDecimals(row.original.totalAmount, currencyCode, 'en-IN')}
            </div>
        ),
        Footer: (
            <div className="footerBox text-right" style={{ marginRight: '-0.5rem' }}>
                {formatCurrencyWithoutDecimals(
                    props.earningTotal + props.deductionTotal,
                    currencyCode,
                    'en-IN'
                )}
            </div>
        )
    })

    return (
        <div>
            <div className="row">
                <div className="col-sm-4">
                    <label>Financial Year :</label> {sortedMonths[0]} 2024 -{' '}
                    {sortedMonths[sortedMonths.length - 1]} 2025
                </div>
                <div className="col-sm-4">
                    <label>YTD Earnings Total :</label>{' '}
                    {formatCurrencyWithoutDecimals(props.earningTotal, currencyCode, 'en-IN')}
                </div>
                <div className="col-sm-4">
                    <label>YTD Deduction Total :</label>{' '}
                    {formatCurrencyWithoutDecimals(props.deductionTotal, currencyCode, 'en-IN')}
                </div>
            </div>
            <div className="card-body mb-4" style={{ overflowX: 'scroll' }}>
                <Table
                key={props.ytdComponents.length}
                    columns={Columns}
                    pagingSize={1000}
                    data={props.ytdComponents}
                    footer={true}
                    serialNumber={false}
                    removePagination={true}
                />
            </div>
        </div>
    )
}

export default YTDDetails
