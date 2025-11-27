import React from 'react'
import { useGlobalFilter, useTable } from 'react-table'
import { GlobalFilter1 } from './GlobalFilter1'
import './Table.css' // Add custom CSS for sticky headers and columns

const PayRunDetailTable = ({ columns, data }) => {
    // Initialize the table instance with plugins
    const {
        getTableProps, // Props for <table>
        getTableBodyProps, // Props for <tbody>
        headerGroups, // Array of header groups for rendering <thead>
        footerGroups, // Array of footer groups for rendering <tfoot>
        rows, // Array of filtered rows to render
        state: { globalFilter }, // Current global filter value
        prepareRow, // Prepares a row (required before rendering)
        setGlobalFilter // Function to update global filter value
    } = useTable(
        {
            columns,
            data,
            initialState: { globalFilter: '' } // Default filter
        },
        useGlobalFilter // Enables global search
    )

    return (
        <div>
            {/* Global search bar */}
            <div style={{ paddingLeft: '0.5rem', paddingTop: '0.3rem' }}>
                <GlobalFilter1 globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
            </div>
            {/* Scrollable table wrapper */}
            <div className="table-container">
                <table {...getTableProps()} className="sticky-table">
                    <thead>
                        {headerGroups.map((headerGroup) => (
                            <tr {...headerGroup.getHeaderGroupProps()}>
                                {headerGroup.headers.map((column, index) => {
                                    // Determine if column should be sticky (left/right)
                                    const isStickyLeft = index < 2 // First two columns
                                    const isStickyRight = index >= headerGroup.headers.length - 2 // Last two columns
                                    return (
                                        <th
                                            {...column.getHeaderProps()}
                                            className={
                                                isStickyLeft
                                                    ? 'sticky-left'
                                                    : isStickyRight
                                                      ? 'sticky-right'
                                                      : ''
                                            }
                                        >
                                            {column.render('Header')}
                                        </th>
                                    )
                                })}
                            </tr>
                        ))}
                    </thead>
                    {/* Table body */}
                    <tbody {...getTableBodyProps()}>
                        {rows.map((row) => {
                            prepareRow(row)
                            return (
                                <tr {...row.getRowProps()}>
                                    {row.cells.map((cell, index) => {
                                        const isStickyLeft = index < 2 // First two columns
                                        const isStickyRight = index >= row.cells.length - 2 // Last two columns
                                        return (
                                            <td
                                                {...cell.getCellProps()}
                                                className={
                                                    isStickyLeft
                                                        ? 'sticky-left'
                                                        : isStickyRight
                                                          ? 'sticky-right'
                                                          : ''
                                                }
                                            >
                                                {cell.render('Cell')}
                                            </td>
                                        )
                                    })}
                                </tr>
                            )
                        })}
                    </tbody>
                    {/* Table footer */}
                    <tfoot>
                        {footerGroups.map((footerGroup) => (
                            <tr {...footerGroup.getFooterGroupProps()}>
                                {footerGroup.headers.map((column, index) => {
                                    const isStickyLeft = index < 2 // First two columns
                                    const isStickyRight = index >= footerGroup.headers.length - 2 // Last two columns
                                    return (
                                        <td
                                            {...column.getFooterProps()}
                                            className={
                                                isStickyLeft
                                                    ? 'sticky-left'
                                                    : isStickyRight
                                                      ? 'sticky-right'
                                                      : ''
                                            }
                                        >
                                            {column.render('Footer')}
                                        </td>
                                    )
                                })}
                            </tr>
                        ))}
                    </tfoot>
                </table>
            </div>
        </div>
    )
}

export default PayRunDetailTable
