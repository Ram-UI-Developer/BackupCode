import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Loader from '../../../Common/CommonComponents/Loader'
import {
    getAllCurrentCelebrations,
    getAllUpCommingCelebrations
} from '../../../Common/Services/CommonService'
import Celebration from './Celebration'

const CelebrationList = () => {
    const userDetails = useSelector((state) => state.user.userDetails) // Get user details form Redux
    const [data, setData] = useState([]) // State for data getting from apis
    const [currentLength, setCurrentLength] = useState(0) // State for current celebrations length
    const [upcomingLength, setUpcomingLength] = useState(0) // State for upcoming celebrations length
    const [index, setIndex] = useState(0) // State for index
    const [underLine, setUnderLine] = useState('current') // State for underlien under the heading
    const [animationClass, setAnimationClass] = useState('') // State for Animation calss
    const [loading, setLoading] = useState(true) // State for handling Loader

    let today = new Date() // today date
    let nextMonthDate = new Date(new Date().setDate(today.getDate() + 30)) // Nextmonth date

    // Fetch api for upcoming Celebrations
    const onGetUpcommingCelebrations = () => {
        setLoading(true)
        getAllUpCommingCelebrations({
            entity: 'employees',
            organizationId: userDetails.organizationId,
            locationId: 0,
            endDate: moment(nextMonthDate).format('YYYY-MM-DD')
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setLoading(false)
                    setData(res.data)
                    setIndex(0)
                } else {
                    setData([])
                }
                setUnderLine('upcomming')
            })
            .catch(() => {
                setLoading(false)
            })
    }

    // Fetch celebrations and upcoming celebration on componet mount
    useEffect(() => {
        onGetCurrentCelebrations()
        onGetUpcommingCelebrationsCount()
    }, [])

    // Fetch api for upcoming Celebrations count
    const onGetUpcommingCelebrationsCount = () => {
        getAllUpCommingCelebrations({
            entity: 'employees',
            organizationId: userDetails.organizationId,
            locationId: 0,
            endDate: moment(nextMonthDate).format('YYYY-MM-DD')
        }).then((res) => {
            if (res.statusCode == 200) {
                setUpcomingLength(res.data.length)
            }
        })
        .catch(() => {
            setUpcomingLength(0)
        })
    }

    // Fetch api for current celebrations
    const onGetCurrentCelebrations = () => {
        setLoading(true)
        getAllCurrentCelebrations({
            entity: 'employees',
            organizationId: userDetails.organizationId,
            locationId: 0,
            date: moment(today).format('YYYY-MM-DD')
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setLoading(false)
                    setIndex(0)
                    setCurrentLength(res.data.length)
                    setData(res.data)
                } else {
                    setData([])
                }
                setUnderLine('current')
            })
            .catch(() => {
                setLoading(false)
            })
    }

    // Scroll to next card
    const onNextHandler = () => {
        if (index !== data.length - 1) {
            setAnimationClass('slide-out-left')
            setTimeout(() => {
                setIndex(index + 1)
                setAnimationClass('slide-in-left')
            }, 500)
        }
    }
    // scroll to previous card
    const onPrevHandler = () => {
        if (index !== 0) {
            setAnimationClass('slide-out-right')
            setTimeout(() => {
                setIndex(index - 1)
                setAnimationClass('slide-in-right')
            }, 500)
        }
    }

    return (
        <>
            <div>
                <div className="">
                    {/* headings with decoration */}
                    <div className="d-flex justify-content-between">
                        <div
                            type="button"
                            className=" dashboardHeadings underline"
                            onClick={() => onGetCurrentCelebrations()}
                        >
                            <div className="dashboardCelebrationsHeadings">
                                Celebrations{currentLength > 0 && '(' + currentLength + ')'}
                            </div>
                            {underLine == 'current' ? <hr className="hrline" /> : ''}
                        </div>
                        {userDetails.upcomingCelebrations && (
                            <div
                                type="button"
                                className=" dashboardHeadings underline"
                                onClick={() => onGetUpcommingCelebrations()}
                            >
                                <div className="dashboardCelebrationsHeadings">
                                    Upcoming Celebrations
                                    {upcomingLength > 0 && '(' + upcomingLength + ')'}
                                </div>
                                {underLine == 'upcomming' ? <hr className="hrlineUpcoming" /> : ''}
                            </div>
                        )}
                    </div>
                    {/* loader */}
                    {loading ? (
                        <div
                            className="d-flex justify-content-center align-items-center"
                            style={{ height: '30vh' }}
                        >
                            <Loader />
                        </div>
                    ) : (
                        <div className="celebrationCards">
                            {/* Content in the card */}
                            {data.length > 0 ? (
                                <>
                                    <Celebration
                                        data={data[index]}
                                        mode={underLine}
                                        styleName={animationClass}
                                    />
                                    <div className="float-right" style={{ marginTop: '10px' }}>
                                        {/* <RiArrowDropDownLine type='button' onClick={onPrevHandler} style={{ padding: "2px" }} className={index == 0 ? 'rotateLeft-90 disabledColor' : 'rotateLeft-90 themeColor'} size={50} /> */}
                                        {/* <RiArrowDropDownLine type='button' onClick={onNextHandler} style={{ padding: "2px" }} className={index == data.length - 1 ? "rotateRight-90 disabledColor" : 'rotateRight-90 themeColor'} size={50} /> */}
                                        <i
                                            style={{ padding: '2px' }}
                                            type="button"
                                            onClick={onPrevHandler}
                                            className={
                                                index == 0
                                                    ? 'fa-solid fa-angle-left fa-lg disabledColor me-2'
                                                    : 'fa-solid fa-angle-left fa-lg themeColor me-2'
                                            }
                                        ></i>{' '}
                                        &emsp;&emsp;
                                        <i
                                            style={{ padding: '2px' }}
                                            type="button"
                                            onClick={onNextHandler}
                                            className={
                                                index == data.length - 1
                                                    ? 'fa-solid fa-angle-right fa-lg disabledColor me-2'
                                                    : 'fa-solid fa-angle-right fa-lg  themeColor me-2'
                                            }
                                        ></i>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {underLine == 'current' ? (
                                        <div className="card padding-1rem noCelebrationCard align-items-center justify-content-center textBold">
                                            No Celebrations Today
                                        </div>
                                    ) : (
                                        <div className="card padding-1rem noCelebrationCard align-items-center justify-content-center textBold">
                                            No Upcoming Celebrations for the next 30 days.
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default CelebrationList
