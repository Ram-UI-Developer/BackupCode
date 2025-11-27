import React, { useEffect, useState } from 'react'
import { Col, Form, Row } from 'react-bootstrap'
import Table from '../../../Common/Table/Table'
import { getAllListCompByLocation } from '../../../Common/Services/OtherServices'
import { useSelector } from 'react-redux'
import Loader from '../../../Common/CommonComponents/Loader'

const LoanModal = ({ locId, id }) => {
    const userDetails = useSelector((state) => state.user.userDetails) // get user details from redux
    const [data, setData] = useState([]) // State for loan data
    const [repaymentDto, setRepaymentDto] = useState([]) // State for paments history
    const [loading, setLoading] = useState(true) // State for handling loader

    // Fetch loans to componet on mount
    useEffect(() => {
        getAllRecordsByLocation()
    }, [])
    const getAllRecordsByLocation = () => {
        getAllListCompByLocation({
            entity: 'loans',
            organizationId: userDetails.organizationId,
            locationId: locId,
            employeeId: id
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setLoading(false)
                    setData(res.data)
                    setRepaymentDto(res.data.map((e) => e.repaymentDTOs))
                }
            })
            .catch(() => {
                setLoading(false)
            })
    }

    // convetion of number format
    const formatNumber = (number) => {
        if (number == null) return ''
        return new Intl.NumberFormat().format(number)
    }

    // columns table
    const columns = [
        {
            Header: () => (
                <div style={{ marginRight: '35%' }} className="text-right header">
                    Month
                </div>
            ),
            accessor: 'month',
            Cell: ({ row }) => (
                <div style={{ marginRight: '36%' }} className="text-right">
                    {row.original.month}
                </div>
            )
        },
        {
            Header: () => (
                <div style={{ marginRight: '35%' }} className="text-right header">
                    Amount
                </div>
            ),
            accessor: 'deductionAmount',
            Cell: ({ row }) => (
                <div style={{ marginRight: '38%' }} className="text-right">
                    {formatNumber(row.original.deductionAmount)}
                </div>
            )
        }
    ]

    return (
        <>
            {loading ? (
                <div className="d-flex justify-content-center align-items-center">
                    <Loader />
                </div>
            ) : (
                <div>
                    <div className="row">
                        <div className="col-6">
                            <Form.Group as={Row}>
                                <Form.Label column sm={5}>
                                    Total Loan{' '}
                                </Form.Label>
                                <Col sm={4} style={{ marginTop: '2%' }}>
                                    {data && data.map((e) => formatNumber(e.amount))}
                                </Col>
                            </Form.Group>
                        </div>
                        <div className="col-6">
                            <Form.Group as={Row}>
                                <Form.Label style={{ marginLeft: '-9%' }} column sm={5}>
                                    Received{' '}
                                </Form.Label>
                                <Col sm={4} style={{ marginTop: '2%' }}>
                                    <span style={{ marginRight: '-50%' }}>
                                        {data && data.map((e) => formatNumber(e.paidAmount))}
                                    </span>
                                </Col>
                            </Form.Group>
                        </div>
                        <div className="col-6" style={{ marginLeft: '-1.3%' }}>
                            <Form.Group as={Row}>
                                <Form.Label column sm={5}>
                                    Tenure{' '}
                                </Form.Label>
                                <Col sm={4} style={{ marginTop: '2%' }}>
                                    {data && data.map((e) => e.installments)}
                                </Col>
                            </Form.Group>
                        </div>
                        <div className="col-6">
                            <Form.Group as={Row}>
                                <Form.Label column sm={5}>
                                    {' '}
                                    Pending Amount{' '}
                                </Form.Label>
                                <Col sm={4} style={{ marginTop: '2%' }}>
                                    {data && data.map((e) => formatNumber(e.pendingAmount))}
                                </Col>
                            </Form.Group>
                        </div>
                    </div>
                    <div>
                        {repaymentDto.map((reData) => (
                            <Table
                                key={reData.length}
                                columns={columns}
                                data={reData}
                                serialNumber={true}
                            />
                        ))}
                    </div>
                </div>
            )}
        </>
    )
}
export default LoanModal
