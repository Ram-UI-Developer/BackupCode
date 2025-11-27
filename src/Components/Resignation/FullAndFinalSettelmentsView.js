import React, { forwardRef, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { getByIdForFAFS } from '../../Common/Services/OtherServices'

const FullAndFinalSettelmentsView = forwardRef((props, ref) => {
    const userDetails = useSelector((state) => state.user.userDetails)
    const [data, setData] = useState({})

    useEffect(() => {
        ongetHandler()
    }, [])

    //api handling for get by id
    const ongetHandler = () => {
        getByIdForFAFS({ organizationId: userDetails.organizationId, employeeId: props.employeeId })
            .then(
                (res) => {
                    if (res.statusCode == 200) {
                        setData(res.data)
                    }
                },
                (error) => {
                    console.log(error)
                }
            )
            .catch((err) => {
                console.log(err)
            })
    }

    //method for formatting amount
    const formatNumber = (number) => {
        if (number == null) return ''
        return new Intl.NumberFormat('en-IN').format(number)
    }

    return (
        <div ref={ref}>
            <section className="section">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="card" style={{ padding: '3%' }}>
                                <div className="row">
                                    <div className="col-sm-4">
                                        <img
                                            src={`data:image/jpeg;base64,${data.logo}`}
                                            style={{
                                                marginTop: '-1rem',
                                                height: '80px',
                                                width4: '40px',
                                                marginLeft: '-1rem'
                                            }}
                                            alt="Photo"
                                            // type="button"
                                        />
                                    </div>
                                    <div className="col-sm-2">
                                        <h4 style={{ textWrap: 'nowrap' }}>
                                            {data.organizationName}
                                        </h4>
                                        <div
                                            style={{
                                                textWrap: 'nowrap',
                                                marginLeft: '-7rem',
                                                marginTop: '-0.8rem'
                                            }}
                                        >
                                            {data.locationAddress}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ marginLeft: '18rem' }}>
                                    <h5>Full And Final Settlement Form</h5>
                                </div>

                                <div className="row" style={{ paddingTop: '2rem' }}>
                                    <div className="col-6">
                                        <div className="row">
                                            <div className="col-5 mb-2 text-bold">Organization</div>
                                            <div className="col-5 mb-2">
                                                {data.organizationName}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="row">
                                            <div className="col-5 mb-2 text-bold">
                                                Employee Code
                                            </div>
                                            <div className="col-5 mb-2">{data.employeeCode}</div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="row">
                                            <div className="col-5 mb-2 text-bold">
                                                Employee Name
                                            </div>
                                            <div className="col-5 mb-2">{data.employeeName}</div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="row">
                                            <div className="col-5 mb-2 text-bold">
                                                Date Of Birth
                                            </div>
                                            <div className="col-5 mb-2">{data.dateOfBirth}</div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="row">
                                            <div className="col-5 mb-2 text-bold">PAN Number</div>
                                            <div className="col-5 mb-2">{data.pan}</div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="row">
                                            <div className="col-5 mb-2 text-bold">Joining Date</div>
                                            <div className="col-5 mb-2">{data.joiningDate}</div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="row">
                                            <div className="col-5 mb-2 text-bold">Designation</div>
                                            <div className="col-5 mb-2">{data.designation}</div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="row">
                                            <div className="col-5 mb-2 text-bold">UAN</div>
                                            <div className="col-5 mb-2">{data.uan}</div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="row">
                                            <div className="col-5 text-bold">Last Working Date</div>
                                            <div className="col-5">{data.lastWorkingDate}</div>
                                        </div>
                                    </div>
                                </div>
                                <hr style={{ borderWidth: '5px', borderColor: 'black' }} />
                                <div className="card" style={{ padding: '3%' }}>
                                    <div className="row">
                                        <div className="row">
                                            <div className="col-4 mb-2 text-bold">
                                                Days On Leave
                                            </div>
                                            <div
                                                className="col-2 mb-2"
                                                style={{ textAlign: 'right' }}
                                            >
                                                {data.absentDays}
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-4 mb-2 text-bold">
                                                Leave Balance
                                            </div>
                                            <div
                                                className="col-2 mb-2"
                                                style={{ textAlign: 'right' }}
                                            >
                                                {data.leaveBalance}
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-4 mb-2 text-bold">LOP Days</div>
                                            <div
                                                className="col-2 mb-2"
                                                style={{ textAlign: 'right' }}
                                            >
                                                {data.lopDays}
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-4 mb-2 text-bold">
                                                Leave Encashment
                                            </div>
                                            <div
                                                className="col-2 mb-2"
                                                style={{ textAlign: 'right' }}
                                            >
                                                {data.leaveEncashmentDays}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <hr style={{ borderWidth: '5px', borderColor: 'black' }} />
                                <div className="card" style={{ padding: '3%' }}>
                                    <div className="row">
                                        <div className="row">
                                            <div className="col-4 mb-2 text-bold">
                                                Salary Advanced Amount
                                            </div>
                                            <div
                                                className="col-2 mb-2"
                                                style={{ textAlign: 'right' }}
                                            >
                                                {formatNumber(data.loanAmount)}
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-4 mb-2 text-bold">
                                                Expenses Amount
                                            </div>
                                            <div
                                                className="col-2 mb-2"
                                                style={{ textAlign: 'right' }}
                                            >
                                                {formatNumber(data.reimbursementAmount)}
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-4 mb-2 text-bold">
                                                Miscellaneous Earnings Caption
                                            </div>
                                            <div className="col-3 mb-2">
                                                {data.miscellaneousEarnings == null
                                                    ? 'N/A'
                                                    : data.miscellaneousEarnings}
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-4 mb-2 text-bold">
                                                Miscellaneous Earnings Amount
                                            </div>
                                            <div
                                                className="col-2 mb-2"
                                                style={{ textAlign: 'right' }}
                                            >
                                                {formatNumber(data.miscellaneousEarningAmount)}
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-4 mb-2 text-bold">
                                                Miscellaneous Deductions Caption
                                            </div>
                                            <div className="col-3 mb-2">
                                                {data.miscellaneousDeductions == null
                                                    ? 'N/A'
                                                    : data.miscellaneousDeductions}
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-4 mb-2 text-bold">
                                                Miscellaneous Deductions Amount
                                            </div>
                                            <div
                                                className="col-2 mb-2"
                                                style={{ textAlign: 'right' }}
                                            >
                                                {formatNumber(data.miscellaneousDeductionAmount)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <hr style={{ borderWidth: '5px', borderColor: 'black' }} />
                                <div className="card" style={{ padding: '3%' }}>
                                    <div className="row">
                                        <div className="row">
                                            <div className="col-4 mb-2 text-bold">Basic</div>
                                            <div
                                                className="col-2 mb-2"
                                                style={{ textAlign: 'right' }}
                                            >
                                                {formatNumber(data.prevBasic)}
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-4 mb-2 text-bold">Tenure</div>
                                            <div
                                                className="col-2 mb-2"
                                                style={{ textAlign: 'right' }}
                                            >
                                                {data.tenure}
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-4 mb-2 text-bold">Gratuity</div>
                                            <div
                                                className="col-2 mb-2"
                                                style={{ textAlign: 'right' }}
                                            >
                                                {formatNumber(data.gratuity)}
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-4 mb-2 text-bold">OT Amount</div>
                                            <div
                                                className="col-2 mb-2"
                                                style={{ textAlign: 'right' }}
                                            >
                                                {formatNumber(data.otAmount)}
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-4 mb-2 text-bold">Bonus Amount</div>
                                            <div
                                                className="col-2 mb-2"
                                                style={{ textAlign: 'right' }}
                                            >
                                                {formatNumber(data.bonus)}
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-4 mb-2 text-bold">Net Pay</div>
                                            <div
                                                className="col-2 mb-2"
                                                style={{ textAlign: 'right' }}
                                            >
                                                {formatNumber(data.netPay)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
})
export default FullAndFinalSettelmentsView
