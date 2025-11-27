import React from 'react'
import { useTable, useSortBy, usePagination, useGlobalFilter } from 'react-table'
import { Form } from 'react-bootstrap'
import './Table.css'
import { GlobalFilter } from './GlobalFilter'

const PayrunTable = ({
    footer,
    columns,
    data,
    divClasses,
    tableClasses,
    tblBodyClasses,
    pagingSize,
    resetPage,
    footerStyle,
    trfooter,
    pagintionStyle,
    hiddenColumn,
    name,
    serialNumber
}) => {
    // Initialize the table with hooks and plugins
    const tableInstance = useTable(
        {
            columns,
            data,
            initialState: {
                pageIndex: 0,
                pageSize: data.length, // Set initial page size to length of data
                hiddenColumns: hiddenColumn || [] // Dynamically hide specified columns
            },
            autoResetPage: resetPage // Reset page index when data changes
        },
        useGlobalFilter, // Enable global filtering
        useSortBy, // Enable sorting
        usePagination // Enable pagination
    )

    // Destructure tableInstance props
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        page,
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

    // Hide columns dynamically when hiddenColumn prop changes
    React.useEffect(() => {
        if (hiddenColumn) {
            setHiddenColumns(hiddenColumn)
        }
    }, [hiddenColumn])

    return (
        <div>
            {/* Global Filter Input Field */}
            <div style={{ paddingLeft: '0.5rem', paddingTop: '0.2rem' }}>
                <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
            </div>
            <div className="payRunTable-wrapper">
                <div className="payRunTable-container">
                    {/* Main Table */}
                    <table className="table" style={{ marginBottom: '0px' }} {...getTableProps()}>
                        <thead className="tableHeader text-left">
                            {headerGroups.map((headerGroup) => (
                                <tr {...headerGroup.getHeaderGroupProps()}>
                                    {/* Serial number column if enabled */}
                                    {serialNumber && <th className="fixed text-left">S.No</th>}
                                    {headerGroup.headers.map((column, index) => {
                                        const isFixed = index < 2 || index >= columns.length - 2
                                        const className = isFixed
                                            ? 'fixed text-left'
                                            : index < 2
                                              ? 'fixed text-left'
                                              : 'scrollable text-left'
                                        return (
                                            <th
                                                className={className}
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
                                        )
                                    })}
                                </tr>
                            ))}
                        </thead>
                        {/* Table Body */}
                        <tbody
                            className={tblBodyClasses ? `${tblBodyClasses}` : ''}
                            {...getTableBodyProps()}
                        >
                            {page.map((row, i) => {
                                prepareRow(row)
                                return (
                                    <tr {...row.getRowProps()}>
                                        {serialNumber && (
                                            <td className="fixed align-middle serialNumber">
                                                {pageIndex * pageSize + i + 1}
                                            </td>
                                        )}
                                        {row.cells.map((cell, index) => {
                                            const isFixed = index < 2 || index >= columns.length - 2
                                            const className = isFixed
                                                ? index >= columns.length - 2
                                                    ? 'scrollable-td'
                                                    : 'fixed align-middle'
                                                : 'scrollable align-middle'
                                            return (
                                                <td
                                                    className={className}
                                                    style={{
                                                        wordWrap: 'break-word',
                                                        padding: '0px'
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
                        {/* Optional Footer */}
                        {footer && (
                            <tfoot className={`custom-thead ${footerStyle}`}>
                                {footerGroups.map((group) => (
                                    <tr className={`${trfooter}`} {...group.getFooterGroupProps()}>
                                        {group.headers.map((column, index) => {
                                            const isFixed = index < 2 || index >= columns.length - 2
                                            const className = isFixed
                                                ? index >= columns.length - 2
                                                    ? 'scrollable-td'
                                                    : 'fixed align-middle'
                                                : 'align-middle'
                                            return (
                                                <td
                                                    className={className}
                                                    {...column.getFooterProps()}
                                                    style={{
                                                        paddingLeft: '0px',
                                                        paddingRight: '0px'
                                                    }}
                                                >
                                                    {column.render('Footer')}
                                                </td>
                                            )
                                        })}
                                    </tr>
                                ))}
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
            {/* Pagination */}
            {data.length > 12 ? (
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
                                    Page {pageIndex + 1} of {pageOptions.length}
                                </a>
                            </li>
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
export default PayrunTable
