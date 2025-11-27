import React from 'react'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import { MdOutlineDragIndicator } from 'react-icons/md'
import { useGlobalFilter, usePagination, useSortBy, useTable } from 'react-table'
import './Table.css'

const DragableTable = ({
    columns,
    data,
    pagingSize,
    resetPage,
    hiddenColumn,
    draggableKey,
    serialNumber,
    setData
}) => {
    // Table instance
    const tableInstance = useTable(
        {
            columns,
            data,
            initialState: {
                pageIndex: 0,
                pageSize: pagingSize || 1000,
                hiddenColumns: hiddenColumn || []
            },
            autoResetPage: resetPage
        },
        useGlobalFilter,
        useSortBy,
        usePagination
    )

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,

        // ✅ pagination stuff
        page,
        state: { pageIndex, pageSize },
        setHiddenColumns
    } = tableInstance

    React.useEffect(() => {
        if (hiddenColumn) {
            setHiddenColumns(hiddenColumn)
        }
    }, [hiddenColumn, setHiddenColumns])

    // Drag handler
    const handleOnDragEnd = (result) => {
        if (!result.destination) return

        const items = Array.from(data)
        const [reorderedItem] = items.splice(result.source.index, 1)
        items.splice(result.destination.index, 0, reorderedItem)

        setData(items)
    }

    return (
        <div>
            <DragDropContext onDragEnd={handleOnDragEnd}>
                <table className="table" {...getTableProps()}>
                    <thead className="tableHeader">
                        {headerGroups.map((headerGroup) => (
                            <tr className="text-left" {...headerGroup.getHeaderGroupProps()}>
                                {serialNumber && <th className="text-left">S.No</th>}
                                {headerGroup.headers.map((column) => (
                                    <th
                                        className={
                                            column.headerAlign === 'right'
                                                ? 'header-right'
                                                : 'text-left'
                                        }
                                        {...column.getHeaderProps()}
                                    >
                                        {column.render('Header')}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>

                    {/* Droppable rows */}
                    <Droppable droppableId="droppable">
                        {(provided) => (
                            <tbody
                                {...getTableBodyProps()}
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                {page.map((row, index) => {
                                    prepareRow(row)
                                    return (
                                        <Draggable
                                            key={row.original[draggableKey]}
                                            draggableId={row.original[draggableKey].toString()}
                                            index={index}
                                        >
                                            {(provided) => (
                                                <tr
                                                    {...row.getRowProps()}
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                >
                                                    {serialNumber && (
                                                        <td className="serialNumber">
                                                            <MdOutlineDragIndicator className="dragIcon" />{' '}
                                                            {pageIndex * pageSize + index + 1}
                                                        </td>
                                                    )}
                                                    {row.cells.map((cell) => (
                                                        <td
                                                            className="align-middle"
                                                            style={{
                                                                wordWrap: 'break-word',
                                                                padding: '2px'
                                                            }}
                                                            {...cell.getCellProps()}
                                                        >
                                                            {cell.render('Cell')}
                                                        </td>
                                                    ))}
                                                </tr>
                                            )}
                                        </Draggable>
                                    )
                                })}
                                {provided.placeholder}
                            </tbody>
                        )}
                    </Droppable>
                </table>
            </DragDropContext>

            {/* ✅ Pagination & Rows per page */}
            {/* ✅ Pagination & Rows per page */}


        </div>
    )
}

export default DragableTable