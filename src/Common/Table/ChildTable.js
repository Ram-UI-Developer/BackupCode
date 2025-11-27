import React from 'react'
import { usePagination, useSortBy, useTable } from 'react-table'
import { Form } from 'react-bootstrap'
import './Table.css'

const ChildTable = ({
    footer, // Whether to show the table footer
    columns, // Columns configuration (react-table format)
    data, // Table data array
    tblBodyClasses, // Class for the <tbody>
    pagingSize, // Default number of rows per page
    resetPage, // Whether to reset pagination state on changes
    pagintionStyle, // Custom styles for pagination controls
    hiddenColumn, // Array of column IDs to hide
    serialNumber // Flag to show serial number column
}) => {
    //  Setup the react-table instance with sorting and pagination
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
    // Destructure table instance methods and state
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        /* eslint-disable */
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

    // Apply hidden columns when changed
    React.useEffect(() => {
        if (hiddenColumn) {
            setHiddenColumns(hiddenColumn)
        }
    }, [hiddenColumn])

    // Render the UI for your table
    return (
        <div>
            {/* Table structure */}
            <table className="table " {...getTableProps()}>
                <thead className="tableHeader">
                    {headerGroups.map((headerGroup) => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {serialNumber && <th className="text-left">S.No</th>}
                            {headerGroup.headers.map((column) => {
                                let sortIndicator = ''
                                if (column.isSorted) {
                                    sortIndicator = column.isSortedDesc ? ' 🔽' : ' 🔼'
                                }

                                return (
                                    <th
                                        className="text-left"
                                        {...column.getHeaderProps()}
                                        {...column.getSortByToggleProps()}
                                    >
                                        {column.render('Header')}
                                        <span>{sortIndicator}</span>
                                    </th>
                                )
                            })}
                        </tr>
                    ))}
                </thead>
                <tbody
                    className={tblBodyClasses ? `${tblBodyClasses}` : ''}
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
                                            className="align-middle"
                                            style={{ wordWrap: 'break-word', padding: '2px' }}
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
                {/* Optional Table Footer */}
                {footer && (
                    <tfoot className="custom-thead">
                        {footerGroups.map((group) => (
                            <tr {...group.getFooterGroupProps()}>
                                {group.headers.map((column) => (
                                    <td {...column.getFooterProps()}>{column.render('Footer')}</td>
                                ))}
                            </tr>
                        ))}
                    </tfoot>
                )}
            </table>
            {/* Pagination Controls */}
            {data.length > 10 ? (
                <div style={pagintionStyle ? pagintionStyle : {}}>
                    <Form.Control
                        as="select"
                        className="selectNoOfRows"
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value))
                        }}
                        style={{ width: '120px', height: '38px', textAlign: 'right' }}
                    >
                        {[10, 20, 30, 40, 50].map((pageSize) => (
                            <option key={pageSize} value={pageSize}>
                                {pageSize}
                            </option>
                        ))}
                    </Form.Control>

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
            ) : (
                <div className="text-center">{data.length > 0 ? '' : 'No Data Found!'}</div>
            )}
        </div>
    )
}
export default ChildTable
