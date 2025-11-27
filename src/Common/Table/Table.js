import React, { useEffect, useRef, useState } from 'react'
import { Form } from 'react-bootstrap'
import { usePagination, useSortBy, useTable } from 'react-table'
import './Table.css'

const Table = ({
    footer,
    columns,
    data,
    setSelectedRows,
    recordStatus,
    selectedRows,
    checkBoxValue,
    
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
    // Ref to keep track of current page index
    const pageIndexRef = useRef(0)
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

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        page,
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

    useEffect(() => {
        setPageSize(Number(pagingSize ? pagingSize : 10))
    }, [])

    useEffect(() => {
        if (hiddenColumn) {
            setHiddenColumns(hiddenColumn)
        }
    }, [hiddenColumn])
    const handleSelectAll = (e) => {
        const { checked } = e.target
        const newSelectedRows = checked
            ? page.map((row) => row.original) // Collect all IDs from the current page
            : [] // Clear selection if unchecked

        setSelectedRows(newSelectedRows)
    }

    const [remainingRows, setRemainingRows] = useState([])
    console.log(remainingRows)

    const handleRowSelect = (rowId) => {
        const newSelectedRows = new Set(selectedRows)
        if (newSelectedRows.has(rowId)) {
            newSelectedRows.delete(rowId)
        } else {
            newSelectedRows.add(rowId)
        }
        const updatedSelectedRowIds = Array.from(newSelectedRows)
        setSelectedRows(updatedSelectedRowIds)
        // Update remainingRows by filtering out the selected rows from originalData
        const filterRemainingRows = page.filter(
            (row) => !updatedSelectedRowIds.includes(row.original)
        )
        const updatedRemainingRows = filterRemainingRows.map((row) => row.original)
        setRemainingRows(updatedRemainingRows)
    }

    // Update pageIndexRef on page change
    useEffect(() => {
        pageIndexRef.current = pageIndex
    }, [pageIndex])

    return (
        <div>
            <table className="table" {...getTableProps()} id="tableIdTable">
                <thead className="tableHeader">
                    {headerGroups.map((headerGroup) => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {/* {
                timeSheetStatus == "Approved" ||
                  timeSheetStatus == "Rejected" ||
                  timeSheetStatus == "All" ||
                  timeSheetStatus == "Partial" ? <th><div></div></th> : (<> */}
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
                                        <>
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
                                        </>
                                    )}
                                </>
                            )}

                            {serialNumber && <th className="text-left">S.No</th>}

                            {/* </>)
              } */}

                            {headerGroup.headers.map((column) => (
                                <th
                                    className={
                                        column.headerAlign == 'right' ? 'header-right' : 'text-left'
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
                                {checkBoxValue && (
                                    <>
                                        {(row.original.status &&
                                            row.original.status == 'Approved') ||
                                        (row.original.status &&
                                            row.original.status == 'Rejected') ||
                                        (row.original.status &&
                                            row.original.status == 'Partial') ? (
                                            <td>
                                                {' '}
                                                <div></div>
                                            </td>
                                        ) : (
                                            <>
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
                                                </td>{' '}
                                            </>
                                        )}
                                    </>
                                )}
                                {serialNumber && (
                                    <td className="serialNumber">{pageIndex * pageSize + i + 1}</td>
                                )}

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

export default Table
