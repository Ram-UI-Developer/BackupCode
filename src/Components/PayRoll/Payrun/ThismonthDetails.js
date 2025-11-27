import React from 'react'
import { formatCurrencyWithoutDecimals } from '../../../Common/CommonComponents/CurrencyFormate'

const ThismonthDetails = ({ salaryComponents }) => {
    const currencyCode = 'INR' // currency format
    const earnings = salaryComponents.filter(
        (component) => component.type && component.type.label === 'Earning'
    ) // filter earning components
    const totalearnings = earnings
        .map((payRun) => payRun.amount)
        .reduce((acc, amount) => acc + amount, 0) // sum of all earnings

    const deductions = salaryComponents.filter(
        (component) => component.type && component.type.label === 'Deduction'
    ) // filter deduction components
    const totaldeductions = deductions
        .map((payRun) => payRun.amount)
        .reduce((acc, amount) => acc + amount, 0) // sum of all deduction components

    return (
        <div>
            <div className="row">
                <div className="col-sm-6" style={{ paddingLeft: '5rem' }}>
                    <tr>
                        <th className="tableHeading borderBottom2px" style={{ minWidth: '11rem' }}>
                            Earnings
                        </th>
                        <th className="tableHeading borderBottom2px" style={{ minWidth: '8rem' }}>
                            Amount
                        </th>
                    </tr>
                    {earnings.map((item) => (
                        <tr key={item.id}>
                            <td
                                style={{
                                    minWidth: '11rem',
                                    textAlign: 'left',
                                    padding: '1px 2px 1px .5rem'
                                }}
                            >
                                {item.headName}
                            </td>
                            <td
                                style={{
                                    minWidth: '8rem',
                                    textAlign: 'right',
                                    paddingRight: '2rem'
                                }}
                            >
                                {formatCurrencyWithoutDecimals(item.amount, currencyCode, 'en-IN')}
                            </td>
                        </tr>
                    ))}
                    <tr> </tr>
                    <tr>
                        <td
                            style={{
                                fontWeight: '700',
                                minWidth: '10rem',
                                textAlign: 'right',
                                borderTop: '2px solid'
                            }}
                        >
                            Total
                        </td>
                        <td
                            style={{
                                minWidth: '8rem',
                                textAlign: 'right',
                                paddingRight: '2rem',
                                borderTop: '2px solid'
                            }}
                        >
                            {formatCurrencyWithoutDecimals(totalearnings, currencyCode, 'en-IN')}
                        </td>
                    </tr>
                </div>
                <div className="col-sm-6">
                    <tr>
                        <th className="tableHeading borderBottom2px" style={{ minWidth: '10rem' }}>
                            Deductions
                        </th>
                        <th className="tableHeading borderBottom2px" style={{ minWidth: '8rem' }}>
                            Amount
                        </th>
                    </tr>

                    {deductions.map((item) => (
                        <tr key={item.id}>
                            <td
                                style={{
                                    minWidth: '10rem',
                                    textAlign: 'left',
                                    padding: '1px 2px 1px .5rem'
                                }}
                            >
                                {item.headName}
                            </td>
                            <td
                                style={{
                                    minWidth: '8rem',
                                    textAlign: 'right',
                                    paddingRight: '2rem'
                                }}
                            >
                                {formatCurrencyWithoutDecimals(item.amount, currencyCode, 'en-IN')}
                            </td>
                        </tr>
                    ))}
                    <tr> </tr>
                    <tr>
                        <td
                            style={{
                                fontWeight: '700',
                                minWidth: '10rem',
                                textAlign: 'right',
                                borderTop: '2px solid'
                            }}
                        >
                            Total
                        </td>
                        <td
                            style={{
                                minWidth: '8rem',
                                textAlign: 'right',
                                paddingRight: '2rem',
                                borderTop: '2px solid'
                            }}
                        >
                            {formatCurrencyWithoutDecimals(totaldeductions, currencyCode, 'en-IN')}
                        </td>
                    </tr>
                </div>
            </div>
        </div>
    )
}

export default ThismonthDetails
