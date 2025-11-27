import React from 'react'
import { Col, Form, Row } from 'react-bootstrap'

// filter for table
export const GlobalFilter = ({ filter, setFilter }) => {
    return (
        <div className="globalFilter">
            <Form.Group as={Row}>
                <Form.Label column md="2">
                    Search{' '}
                </Form.Label>
                <Col sm="4" style={{ paddingTop: '3px' }}>
                    <Form.Control
                        size="sm"
                        placeholder="Type here to filter"
                        value={filter || ''}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </Col>
            </Form.Group>
        </div>
    )
}
