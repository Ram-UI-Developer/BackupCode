import React from 'react'
import { useTable, useSortBy, usePagination } from 'react-table'
// import { Link } from "react-router-dom";
import { Form } from 'react-bootstrap'
import './Table.css'

/* eslint no-unused-vars: ["error", { "args": "none" }] */

const TimeSheetTable = ({
    footer,
    columns,
    data,
    divClasses,
    tableClasses,
    tblBodyClasses,
    pagingSize,
    resetPage,
    footerStyle,
    timeSheetClassName,
    trfooter,
    pagintionStyle,
    hiddenColumn,
    name,
    serialNumber
}) => {
    // Use the state and functions returned from useTable to build your UI
    const tableInstance = useTable(
        {
            columns,
            data,
            initialState: {
                pageIndex: 0,
                pageSize: pagingSize || 10,
                hiddenColumns: hiddenColumn || []
            },

            autoResetPage: resetPage
        },
        useSortBy,
        usePagination
    )
    const {
        getTableProps,
        getTableBodyProps,

        headerGroups,
        /* eslint-disable */
        rows,
        prepareRow, // Prepare the row (this function needs to be called for each row before getting the row props)
        page,
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        state: { pageIndex, pageSize },
        footerGroups,
        setHiddenColumns
        /* eslint-disable */
    } = tableInstance

    React.useEffect(() => {
        if (hiddenColumn) {
            setHiddenColumns(hiddenColumn)
        }
    }, [hiddenColumn])

    // Render the UI for your table
    return (
        <div>
            <table className="table  " {...getTableProps()}>
                <thead className="tableHeader">
                    {headerGroups.map((headerGroup) => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map((column) => (
                                <th
                                    className="timeSheetHeader"
                                    {...column.getHeaderProps()}
                                    {...column.getSortByToggleProps()}
                                >
                                    {column.render('Header')}
                                    <span>
                                        {column.isSorted
                                            ? column.isSortedDesc
                                                ? ' 🔽'
                                                : ' 🔼'
                                            : ''}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody
                    className={tblBodyClasses ? `${tblBodyClasses}` : 'tableBody'}
                    {...getTableBodyProps()}
                >
                    {page.map((row, i) => {
                        prepareRow(row)
                        return (
                            <tr {...row.getRowProps()}>
                                {serialNumber && (
                                    <td className="serialNumber">{pageIndex * pageSize + i + 1}</td>
                                )}
                                {row.cells.map((cell) => {
                                    return (
                                        <td
                                            className={timeSheetClassName}
                                            style={{
                                                wordWrap: 'break-word',
                                                padding: '2px',
                                                verticalAlign: 'middle'
                                            }}
                                            {...cell.getCellProps()}
                                        >
                                            {cell.render('Cell')}
                                        </td>
                                    )
                                })}
                            </tr>
                        )
                    })}
                </tbody>
                {footer && (
                    <tfoot className={`custom-thead ${footerStyle}`}>
                        {footerGroups.map((group) => (
                            <tr className={`${trfooter}`} {...group.getFooterGroupProps()}>
                                {group.headers.map((column) => (
                                    <td className="timeSheetFooter" {...column.getFooterProps()}>
                                        {column.render('Footer')}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tfoot>
                )}
            </table>
            {data.length > 10 ? (
                <div style={pagintionStyle ? pagintionStyle : {}}>
                    <Form.Control
                        as="select"
                        className="selectNoOfRows"
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value))
                        }}
                        style={{ width: '120px', height: '34px', textAlign: 'right' }}
                    >
                        {[10, 20, 30, 40, 50].map((pageSize) => (
                            <option key={pageSize} value={pageSize}>
                                {pageSize}
                            </option>
                        ))}
                    </Form.Control>
                    <div className="boxshadow">
                        <ul className="pagination">
                            <li
                                className="page-item"
                                onClick={() => gotoPage(0)}
                                disabled={!canPreviousPage}
                            >
                                <a href="javascript:void(0)" className="page-link" onClick={(e) => e.preventDefault()}>
                                    First
                                </a>
                            </li>
                            <li
                                className="page-item"
                                onClick={() => previousPage()}
                                disabled={!canPreviousPage}
                            >
                                <a href="javascript:void(0)" className="page-link" onClick={(e) => e.preventDefault()}>
                                    {'<'}
                                </a>
                            </li>
                            <li
                                className="page-item"
                                onClick={() => nextPage()}
                                disabled={!canNextPage}
                            >
                                <a href="javascript:void(0)" className="page-link" onClick={(e) => e.preventDefault()}>
                                    {'>'}
                                </a>
                            </li>
                            <li
                                className="page-item"
                                onClick={() => gotoPage(pageCount - 1)}
                                disabled={!canNextPage}
                            >
                                <a href="javascript:void(0)" className="page-link" onClick={(e) => e.preventDefault()}>
                                    Last
                                </a>
                            </li>
                            <li>
                                <a href="javascript:void(0)" className="page-link" onClick={(e) => e.preventDefault()}>
                                    Page {pageIndex + 1} of {pageOptions.length}{' '}
                                </a>
                            </li>
                            <li></li>{' '}
                        </ul>
                    </div>
                </div>
            ) : (
                <div className="text-center">
                    {data.length > 0 ? '' : name ? `No ${name} added yet!` : 'No Data Found!'}
                </div>
            )}
        </div>
    )
}
export default TimeSheetTable
