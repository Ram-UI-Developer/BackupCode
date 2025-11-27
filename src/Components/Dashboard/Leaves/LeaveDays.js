import moment from 'moment'
import React from 'react'

const LeaveDays = ({ dates }) => {
    let Today = new Date()

    return (
        <div className="row">
            <div class="card-deck" style={{ paddingRight: '1%' }}>
                {dates.map((date, index) => (
                    <div
                        key={date}
                        class="card dayCard"
                        style={
                            date <= moment(Today).format('YYYY-MM-DD')
                                ? { color: 'white', backgroundColor: '#004aad' }
                                : { color: '#004aad' }
                        }
                    >
                        <div className="row">
                            <div className="col-sm-4">
                                {date <= moment(Today).format('YYYY-MM-DD') ? (
                                    <img
                                        src="/dist/OceanImages/checklist.png"
                                        style={{ marginLeft: '0.2%', marginBottom: '-6px' }}
                                        height={17}
                                    />
                                ) : (
                                    ' '
                                )}
                            </div>
                            <div
                                className="col-sm-8 textBold"
                                style={{ paddingLeft: '4%', paddingTop: '2%' }}
                            >
                                Day {index + 1}
                            </div>
                            <div
                                className="text-center"
                                style={{ fontSize: '9px', marginTop: '-5px' }}
                            >
                                {moment(date).format('DD/MM')}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default LeaveDays
