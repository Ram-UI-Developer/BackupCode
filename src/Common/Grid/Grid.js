import React, { useState } from 'react'
import { Form } from 'react-bootstrap'

export const Grid = (props) => {
    const { data, columns } = props

    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(6)

    const filteredColumns = columns.filter((column) => column.accessor !== 'actions')
    const actionColumns = columns.filter((column) => column.accessor == 'actions')

    // Calculate the data for the current page
    const indexOfLastItem = currentPage * pageSize
    const indexOfFirstItem = indexOfLastItem - pageSize
    const currentItems = data.slice(indexOfFirstItem, indexOfLastItem)

    // Pagination Controls
    const totalPages = Math.ceil(data.length / pageSize)

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage)
        }
    }
    return (
        <div>
            <div className="card">
                <div className="card-container row">
                    {currentItems.map((item, index) => (
                        <div className="card gridCard col-sm-4 mb-3 ">
                            <div className="">
                                {actionColumns.map((column, i) => (
                                    <div className="col-sm-6 editIcon">
                                        {/* <div className='headerText'>{column.Header}</div> */}
                                        <div className="">
                                            {column.Cell
                                                ? column.Cell({
                                                      value: item[column.accessor],
                                                      row: { original: item }
                                                  })
                                                : item[column.accessor] || 'N/A'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="row columnRow">
                                {filteredColumns.map((column, i) => (
                                    <div
                                        className={`col-sm-6 mb-2 ${i % 2 == 0 ? 'text-left' : 'text-right'}`}
                                    >
                                        {/* <div key={i} className="col-sm-6 mb-2"> */}
                                        <div className="headerText">{column.Header}</div>
                                        <div
                                            className={`${i % 2 == 0 ? 'textAlignmentLeft' : 'text-right'}`}
                                        >
                                            {/* <div className=""> */}
                                            {column.Cell
                                                ? column.Cell({
                                                      value: item[column.accessor],
                                                      row: { original: item }
                                                  })
                                                : item[column.accessor] || 'N/A'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                {data.length <= 0 ? (
                    <h6 className="gridError">No Data Found</h6>
                ) : (
                    <>
                        <div className=" pageNationFormControl">
                            <Form.Control
                                as="select"
                                value={pageSize}
                                className="selectNoOfRows"
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value))
                                    setCurrentPage(1) // Reset to first page
                                }}
                                style={{ width: '120px', height: '34px', textAlign: 'right' }}
                            >
                                {[3, 6, 12, 18].map((size) => (
                                    <option key={size} value={size}>
                                        {size}
                                    </option>
                                ))}
                            </Form.Control>
                        </div>
                        <div className="">
                            <ul className="pagination">
                                <li
                                    className="page-item"
                                    onClick={() => handlePageChange(1)}
                                    disabled={currentPage === 1}
                                >
                                    <a href="javascript:void" className="page-link">
                                        First
                                    </a>
                                </li>
                                <li
                                    className="page-item"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    <a href="javascript:void" className="page-link">
                                        {'<'}
                                    </a>
                                </li>
                                <li
                                    className="page-item"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    <a href="javascript:void" className="page-link">
                                        {'>'}
                                    </a>
                                </li>
                                <li
                                    className="page-item"
                                    onClick={() => handlePageChange(totalPages)}
                                    disabled={currentPage === totalPages}
                                >
                                    <a href="javascript:void" className="page-link">
                                        Last
                                    </a>
                                </li>
                                <li>
                                    <a className="page-link" href="javascript:void">
                                        Page {currentPage} of {totalPages}{' '}
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
