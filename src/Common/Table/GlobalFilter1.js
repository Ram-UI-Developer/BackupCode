import React from 'react'
import { Col, Form, Row } from 'react-bootstrap'
// filter for payroll table
export const GlobalFilter1 = ({ globalFilter, setGlobalFilter }) => {
    return (
        <div className="globalFilter1">
            <Form.Group as={Row}>
                <Form.Label column md="2">
                    Search
                </Form.Label>
                <Col sm="4">
                    <Form.Control
                        size="sm"
                        placeholder="Type here to filter"
                        value={globalFilter || ''}
                        onChange={(e) => setGlobalFilter(e.target.value)} // Use setGlobalFilter
                    />
                </Col>
            </Form.Group>
        </div>
    )
}
