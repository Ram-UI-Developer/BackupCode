import React, { useState, useEffect, useRef } from 'react'
import { useTable, useSortBy, usePagination } from 'react-table'
import './Table.css'

// Main component for rendering the timesheet monthly table with pagination, sorting, and checkbox selection
const TimeSheetMonthlyTable = ({
    footer, // Enables footer section
    columns, // Columns for the table
    data, // Table data
    setSelectedRows, // Callback to update selected rows
    recordStatus, // Status to control checkbox rendering
    selectedRows, // Array of currently selected rows
    checkBoxValue, // Whether to show checkboxes
   // divClasses, // Optional styling for container div
    tableClasses, // Optional styling for table rows
    tblBodyClasses, // Optional styling for tbody
    pagingSize, // Page size
    resetPage, // Whether to reset page on data change
    footerStyle, // Custom class for footer
    trfooter, // Custom class for footer rows
  //  pagintionStyle, // Custom class for pagination
  //  removePagination, // Option to remove pagination
    hiddenColumn, // Columns to hide
 //   name, // Optional prop (not used here)
    serialNumber // Whether to show serial number column
}) => {
    // Ref to keep track of the current page index across renders
    const pageIndexRef = useRef(0)

    // useTable hook with pagination and sorting
    const tableInstance = useTable(
        {
            columns,
            data,
            initialState: {
                pageIndex: pageIndexRef.current,
                pageSize: pagingSize || 10,
                hiddenColumns: hiddenColumn || []
            },
            autoResetPage: resetPage
        },
        useSortBy,
        usePagination
    )

    // Destructure table instance properties
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        page, // Current page rows
        prepareRow,
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
    } = tableInstance

    // Set page size once on mount
    useEffect(() => {
        setPageSize(Number(pagingSize ? pagingSize : 10))
    }, [])

    // Set hidden columns when prop changes
    useEffect(() => {
        if (hiddenColumn) {
            setHiddenColumns(hiddenColumn)
        }
    }, [hiddenColumn])

    // Handles select all checkbox
    const handleSelectAll = (e) => {
        const { checked } = e.target
        const newSelectedRows = checked
            ? page.map((row) => row.original) // Select all rows on the current page
            : [] // Clear selection
        setSelectedRows(newSelectedRows)
    }

    // State for rows not selected
    const [remainingRows, setRemainingRows] = useState([])
    console.log(remainingRows)

    // Handles individual row checkbox selection
    const handleRowSelect = (rowId) => {
        const newSelectedRows = new Set(selectedRows)
        if (newSelectedRows.has(rowId)) {
            newSelectedRows.delete(rowId)
        } else {
            newSelectedRows.add(rowId)
        }

        const updatedSelectedRowIds = Array.from(newSelectedRows)
        setSelectedRows(updatedSelectedRowIds)

        // Filter out selected rows from the current page to get remaining
        const filterRemainingRows = page.filter(
            (row) => !updatedSelectedRowIds.includes(row.original)
        )
        const updatedRemainingRows = filterRemainingRows.map((row) => row.original)
        setRemainingRows(updatedRemainingRows)
    }

    // Keep the page index ref in sync with state
    useEffect(() => {
        pageIndexRef.current = pageIndex
    }, [pageIndex])

    return (
        <div className="table-container">
            <div className="table-scrollable">
                <table className="table" {...getTableProps()}>
                    <thead className="tableHeader">
                        {headerGroups.map((headerGroup) => (
                            <tr {...headerGroup.getHeaderGroupProps()}>
                                {/* Conditional checkbox column */}
                                {checkBoxValue && (
                                    <>
                                        {recordStatus == 'Approved' ||
                                        recordStatus == 'Rejected' ||
                                        recordStatus == 'All' ||
                                        recordStatus == 'Partial' ? (
                                            <th>
                                                <div></div>
                                            </th>
                                        ) : (
                                            <th className="text-left">
                                                <input
                                                    type="checkbox"
                                                    onChange={handleSelectAll}
                                                    checked={
                                                        page.length > 0 &&
                                                        page.every((row) =>
                                                            selectedRows.includes(row.original)
                                                        )
                                                    }
                                                />
                                            </th>
                                        )}
                                    </>
                                )}

                                {/* Serial number column */}
                                {serialNumber && <th className="text-left">S.No</th>}

                                {/* Render table headers */}
                                {headerGroup.headers.map((column) => {
                                    let sortIndicator = ''
                                    if (column.isSorted) {
                                        sortIndicator = column.isSortedDesc ? ' 🔽' : ' 🔼'
                                    }

                                    return (
                                        <th className={'text-left'} {...column.getHeaderProps()}>
                                            {column.render('Header')}
                                            {/* Show sort indicator */}
                                            <span>{sortIndicator}</span>
                                        </th>
                                    )
                                })}
                            </tr>
                        ))}
                    </thead>

                    <tbody className={tblBodyClasses || 'tableBody'} {...getTableBodyProps()}>
                        {/* Render paginated rows */}
                        {page.map((row, i) => {
                            prepareRow(row)
                            return (
                                <tr {...row.getRowProps()}>
                                    {/* Checkbox cell for each row */}
                                    {checkBoxValue && (
                                        <>
                                            {(row.original.status &&
                                                row.original.status == 'Approved') ||
                                            (row.original.status &&
                                                row.original.status == 'Rejected') ||
                                            (row.original.status &&
                                                row.original.status == 'Partial') ? (
                                                <td>
                                                    <div></div>
                                                </td>
                                            ) : (
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRows.includes(
                                                            row.original
                                                        )}
                                                        onChange={() =>
                                                            handleRowSelect(row.original)
                                                        }
                                                    />
                                                </td>
                                            )}
                                        </>
                                    )}

                                    {/* Serial number cell */}
                                    {serialNumber && (
                                        <td className="serialNumber">
                                            {pageIndex * pageSize + i + 1}
                                        </td>
                                    )}

                                    {/* Render row cells */}
                                    {row.cells.map((cell) => (
                                        <td
                                            className={tableClasses ? 'timeSheetRow' : 'align-left'}
                                            style={{
                                                wordWrap: 'break-word',
                                                padding: '2px',
                                                verticalAlign: 'middle'
                                            }}
                                            {...cell.getCellProps()}
                                        >
                                            {cell.render('Cell')}
                                        </td>
                                    ))}
                                </tr>
                            )
                        })}
                    </tbody>

                    {/* Optional footer rendering */}
                    {footer && (
                        <tfoot className={`custom-thead ${footerStyle}`}>
                            {footerGroups.map((group) => (
                                <tr className={`${trfooter}`} {...group.getFooterGroupProps()}>
                                    {group.headers.map((column) => (
                                        <td {...column.getFooterProps()}>
                                            {column.render('Footer')}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tfoot>
                    )}
                </table>
            </div>

            {/* Pagination controls shown only if data exceeds 10 rows */}
            {data.length > 10 && (
                <div className="pagination-container">
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
                                    Page {pageIndex + 1} of {pageOptions.length}
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    )
}

export default TimeSheetMonthlyTable
