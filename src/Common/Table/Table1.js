import React, { useState, useEffect, useRef } from 'react'
import { useTable, useSortBy, usePagination, useGlobalFilter } from 'react-table'
import { Form } from 'react-bootstrap'
import './Table.css'
import { GlobalFilter } from './GlobalFilter'

// Table component definition
const Table = ({
    footer, // Boolean to show/hide footer
    columns, // Column structure for the table
    data, // Data to be rendered in the table
    setSelectedRows, // Function to set selected rows (checkbox feature)
    recordStatus, // Used to conditionally render checkboxes
    selectedRows, // List of selected rows
    checkBoxValue, // Flag to enable checkboxes
    // divClasses,           // Optional CSS class for container (currently unused)
    tableClasses, // CSS class for table row styling
    tblBodyClasses, // CSS class for <tbody>
    pagingSize, // Number of rows per page
    resetPage, // Boolean to reset pagination
    footerStyle, // CSS class for table footer
    trfooter, // CSS class for footer row
    pagintionStyle, // Optional inline style for pagination controls
    // removePagination,     // Currently unused
    hiddenColumn, // List of column IDs to be hidden
    name, // Used in "No Data Found" message
    serialNumber // Flag to show serial number column
}) => {
    // Keeps track of current page index between renders
    const pageIndexRef = useRef(0)

    // Setup react-table with sorting and pagination
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
        useGlobalFilter, // Add this plugin
        useSortBy,
        usePagination
    )

    // Destructure necessary properties from react-table instance
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        page, // Current page data
        rows,
        prepareRow,
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        state: { pageIndex, pageSize, globalFilter },
        footerGroups,
        setHiddenColumns,
        setGlobalFilter
    } = tableInstance

    // Set page size on component mount
    useEffect(() => {
        setPageSize(Number(pagingSize ? pagingSize : 10))
    }, [])

    // Update hidden columns when prop changes
    useEffect(() => {
        if (hiddenColumn) {
            setHiddenColumns(hiddenColumn)
        }
    }, [hiddenColumn])

    // Handles "Select All" checkbox
    const handleSelectAll = (e) => {
        const { checked } = e.target
        const newSelectedRows = checked
            ? page.map((row) => row.original) // Select all rows on current page
            : [] // Deselect all
        setSelectedRows(newSelectedRows)
    }

    // Local state to track non-selected rows (optional use)
    const [ setRemainingRows] = useState([])

    // Handles individual row checkbox toggle
    const handleRowSelect = (rowId) => {
        const newSelectedRows = new Set(selectedRows)
        if (newSelectedRows.has(rowId)) {
            newSelectedRows.delete(rowId)
        } else {
            newSelectedRows.add(rowId)
        }
        const updatedSelectedRowIds = Array.from(newSelectedRows)
        setSelectedRows(updatedSelectedRowIds)

        // Track rows that are not selected
        const filterRemainingRows = page.filter(
            (row) => !updatedSelectedRowIds.includes(row.original)
        )
        const updatedRemainingRows = filterRemainingRows.map((row) => row.original)
        setRemainingRows(updatedRemainingRows)
    }

    // Keep the page index in sync with ref
    useEffect(() => {
        pageIndexRef.current = pageIndex
    }, [pageIndex])

    return (
        <div className={data && data.length > 10 ? 'table1withFilter' : ''}>
            {/* <div className="magin"> */}
            {/*resolved jira ticket 1849 */}
            {data && data.length > 10 && (
                <>
                    <div style={{ position: 'relative', top: '-6rem' }}>
                        {' '}
                        <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
                    </div>
                    <div style={{ marginRight: '3%' }} className="glbnoOfRecrds">
                        No. of Records :{rows ? rows.length : data.length}
                    </div>
                </>
            )}
            <table className="table" {...getTableProps()} id="table1">
                <thead className="tableHeader">
                    {headerGroups.map((headerGroup) => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {/* Conditional rendering of the "select all" checkbox based on recordStatus */}
                            {checkBoxValue && (
                                <>
                                    {recordStatus === 'Approved' ||
                                        recordStatus === 'Rejected' ||
                                        recordStatus === 'All' ||
                                        recordStatus === 'Partial' ? (
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

                            {/* Optional serial number column */}
                            {serialNumber && <th className="text-left">S.No</th>}

                            {/* Render column headers with sorting icons */}
                            {headerGroup.headers.map((column) => (
                                <th
                                    className={
                                        column.headerAlign === 'right'
                                            ? 'header-right'
                                            : 'text-left'
                                    }
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

                <tbody className={tblBodyClasses || 'tableBody'} {...getTableBodyProps()}>
                    {page.map((row, i) => {
                        prepareRow(row)
                        return (
                            <tr {...row.getRowProps()}>
                                {/* Conditional rendering of row-level checkboxes */}
                                {checkBoxValue && (
                                    <>
                                        {row.original.status === 'Approved' ||
                                            row.original.status === 'Rejected' ||
                                            row.original.status === 'Partial' ? (
                                            <td>
                                                <div></div>
                                            </td>
                                        ) : (
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRows.includes(row.original)}
                                                    onChange={() => handleRowSelect(row.original)}
                                                />
                                            </td>
                                        )}
                                    </>
                                )}

                                {/* Render serial number */}
                                {serialNumber && (
                                    <td className="serialNumber">{pageIndex * pageSize + i + 1}</td>
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
                                    <td {...column.getFooterProps()}>{column.render('Footer')}</td>
                                ))}
                            </tr>
                        ))}
                    </tfoot>
                )}
            </table>

            {/* Pagination section */}
            {data.length > 10 ? (
                <div style={pagintionStyle || {}}>
                    {/* Page size selection dropdown */}
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

                    {/* Pagination navigation */}
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
            ) : (
                // Message shown when no data is found
                <div className="text-center">
                    {data.length > 0 ? '' : name ? `No ${name} added yet!` : 'No Data Found!'}
                </div>
            )}
        </div>
    )
}
export default Table;
