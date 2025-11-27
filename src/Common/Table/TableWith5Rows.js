import React from 'react'
import { useTable, useSortBy, usePagination } from 'react-table'
import { Form } from 'react-bootstrap'
import './Table.css'

const TableWith5Rows = ({
    footer,
    columns,
    data,
    tblBodyClasses,
    pagingSize,
    resetPage,
    pagintionStyle,
    hiddenColumn,
    serialNumber
}) => {
    // Use the state and functions returned from useTable to build your UI
    const tableInstance = useTable(
        {
            columns,
            data,
            initialState: {
                pageIndex: 0,
                pageSize: pagingSize || 5,
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
            <table id="tableWithrows" className="table  " {...getTableProps()}>
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
                                        className={
                                            column.headerAlign == 'right'
                                                ? 'header-right'
                                                : 'text-left'
                                        }
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
            {data.length > 5 ? (
                <div style={pagintionStyle ? pagintionStyle : {}}>
                    <Form.Control
                        as="select"
                        className="selectNoOfRows"
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value))
                        }}
                        style={{
                            width: '120px',
                            height: '38px',
                            marginBottom: '-5%',
                            textAlign: 'right'
                        }}
                    >
                        {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                            <option key={pageSize} value={pageSize}>
                                {pageSize}
                            </option>
                        ))}
                    </Form.Control>

                    <ul
                        className="pagination"
                        style={{
                            float: 'right',
                            position: 'relative',
                            top: '2px'
                        }}
                    >
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
export default TableWith5Rows
