import React from 'react'
import { useTable } from 'react-table'

// Component for rendering a table with optional expandable rows
const ExpandedTable = ({ columns, data, expandedRow, renderLeaveTypeHistory, header }) => {
    // Create a table instance using the useTable hook from react-table
    const tableInstance = useTable({ columns, data })

    // Destructure the properties and methods needed from the table instance
    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance

    return (
        <table {...getTableProps()} className="table" id="expandedTable">
            {
                // Conditionally render the table header only if `header` prop is falsy
                header ? (
                    ''
                ) : (
                    <thead className="tableHeader">
                        {headerGroups.map((headerGroup) => (
                            // Render each header group row
                            <tr {...headerGroup.getHeaderGroupProps()}>
                                {headerGroup.headers.map((column) => (
                                    // Render each header column
                                    <th className="text-left" {...column.getHeaderProps()}>
                                        {column.render('Header')}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                )
            }

            <tbody {...getTableBodyProps()}>
                {rows.map((row) => {
                    // Prepare the row for rendering
                    prepareRow(row)
                    return (
                        // Use React.Fragment to group the row and its optional expanded content
                        <React.Fragment key={row.id}>
                            <tr {...row.getRowProps()}>
                                {row.cells.map((cell) => (
                                    // Render each cell in the row
                                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                ))}
                            </tr>
                            {
                                // Conditionally render the expanded content for the row
                                // Only render if the current row's index matches the expandedRow prop
                                expandedRow === row.index && renderLeaveTypeHistory(row.original)
                            }
                        </React.Fragment>
                    )
                })}
            </tbody>
        </table>
    )
}

export default ExpandedTable
