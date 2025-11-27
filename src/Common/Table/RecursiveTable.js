import React from 'react'

/**
 * RecursiveTable Component
 * - Recursively renders table headers and rows from nested column definitions and data.
 * - Useful for exporting or displaying complex/nested data structures (like hierarchies).
 *
 * Props:
 * - data: The table row data.
 * - columns: Column definitions with potential nested children.
 * - childArray: Key pointing to nested data arrays (used in recursion).
 * - exportType: Currently unused (could be used for conditionally rendering for export).
 */
const RecursiveTable = (data, columns, childArray) => {
    /**
     * Renders headers recursively based on column definitions.
     * Handles nested column headers by rendering a nested <thead> row.
     */
    const renderHeaders = (columns) => {
        return columns.map((column, index) => {
            if (column.children) {
                return (
                    <th colSpan={column.children.length} key={index}>
                        {column.Header}
                        <table>
                            <thead>
                                <tr>{renderHeaders(column.children)}</tr>
                            </thead>
                        </table>
                    </th>
                )
            } else {
                return <th key={index}>{column.Header}</th>
            }
        })
    }
    /**
     * Renders rows of data based on column structure.
     * Supports arrays (nested tables), objects (flattened as key-value pairs), and primitives.
     */
    const renderRows = (data, columns) => {
        return data.map((item, index) => {
            const cells = columns.map((column, colIndex) => {
                if (column.accessor) {
                    const value = item[column.accessor]
                    // Handle nested array values (e.g., children)
                    if (Array.isArray(value)) {
                        return (
                            <td key={`${index}-${colIndex}`} colSpan={column.children.length}>
                                <table>
                                    <tbody>
                                        {renderRows(item[column.accessor] || [], column.children)}
                                    </tbody>
                                </table>
                            </td>
                        )
                    }
                    // Handle nested object values (e.g., single object instead of array)
                    else if (typeof value === 'object' && value !== null) {
                        return Object.entries(value).map(([key, val]) => {
                            return <td key={key}>{String(val)}</td>
                        })
                    }
                    // Handle primitive values (string, number, etc.)
                    else {
                        return <td key={`${index}-${colIndex}`}>{item[column.accessor]}</td>
                    }
                }
                // If no accessor is defined, render fallback
                return <td key={`${index}-${colIndex}`}>N/A</td>
            })

            return <tr key={index}>{cells}</tr>
        })
    }

    return (
        <table id="table-to-xls" border="1">
            <thead>
                <tr>{renderHeaders(columns)}</tr>
            </thead>
            <tbody>{renderRows(data, columns, childArray)}</tbody>
        </table>
    )
}

export default RecursiveTable
