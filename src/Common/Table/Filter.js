import React from 'react'
import { Form } from 'react-bootstrap'
import Row from 'react-bootstrap/Row'

const Filter = ({ filter, setFilter }) => {
    return (
        <div className=" col-3" style={{ marginLeft: '75%', paddingBottom: '2%' }}>
            <Form.Group className="icon" as={Row}>
                <Form.Control
                    size="sm"
                    className="input"
                    type="search"
                    value={filter || ''}
                    placeholder="Search by Employee Id/Email"
                    onChange={(e) => setFilter(e.target.value)}
                />
            </Form.Group>
        </div>
    )
}
export default Filter
