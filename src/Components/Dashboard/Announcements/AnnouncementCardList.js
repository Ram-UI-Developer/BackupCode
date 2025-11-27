import React, { useEffect, useState } from 'react'
import { GrAnnounce } from 'react-icons/gr'
import { RiArrowDropDownLine } from 'react-icons/ri'
import { useSelector } from 'react-redux'
import { getAllAnnouncementsWithOrgAndLocationIdAndDate } from '../../../Common/Services/CommonService'
import moment from 'moment'
import WYSIWYGContent from '../../../Common/CommonComponents/WYSIWYGContent'
import SeeMore from '../../../Common/CommonComponents/SeeMore'

const AnnouncementCardList = () => {
    const userDetails = useSelector((state) => state.user.userDetails) //get userdetails from redux
    const [data, setData] = useState([]) //announcemnts data will be stored in this state
    const [index, setIndex] = useState(0)
    const [animationClass, setAnimationClass] = useState('')

    useEffect(() => {
        //fetch the methods while rendering the page
        onGetAnnouncemets()
    }, [])

    const onNextHandler = () => {
        //displaying to next card
        if (index !== data.length - 1) {
            setAnimationClass('slide-out-left')
            setTimeout(() => {
                setIndex(index + 1)
                setAnimationClass('slide-in-left')
            }, 500)
        }
    }

    const onPrevHandler = () => {
        //displaying to previous card
        if (index !== 0) {
            setAnimationClass('slide-out-right')
            setTimeout(() => {
                setIndex(index - 1)
                setAnimationClass('slide-in-right')
            }, 500)
        }
    }

    let today = new Date() // get current data
    //getAll announcements with locationId
    const onGetAnnouncemets = () => {
        getAllAnnouncementsWithOrgAndLocationIdAndDate({
            entity: 'announcements',
            organizationId: userDetails.organizationId,
            locationId: userDetails.locationId,
            date: moment(today).format('YYYY-MM-DD')
        }).then((res) => {
            if (res.statusCode == 200) {
                setData(res.data)
            } else {
                setData([])
            }
        })
        .catch(() => {
            setData([]) // Handle error by setting an empty list
        })
    }

    return (
        <div className="card detailBackground" style={{ height: '223px' }}>
            <div className="card-header dashboardHeading">Announcements</div>
            <div className="card-body">
                {data.length !== 0 ? (
                    <>
                        <div className={`card padding-1rem announcementCard ${animationClass}`}>
                            <div className="d-flex align-items-center">
                                <div className="speakerBody">
                                    <GrAnnounce className="speaker" size={30} />
                                </div>
                                <div className="announcementName">{data[index].name}</div>
                            </div>
                            <div
                                style={{ height: '50px', fontSize: '14px', alignContent: 'right' }}
                            >
                                <WYSIWYGContent content={data[index].body} />
                            </div>
                            <div>
                                {' '}
                                <SeeMore content={data[index].body} length={10} />
                            </div>
                        </div>
                        <div className="float-right">
                            <RiArrowDropDownLine
                                type="button"
                                onClick={onPrevHandler}
                                className={
                                    index === 0
                                        ? 'rotateLeft-90 disabledColor'
                                        : 'rotateLeft-90 themeColor'
                                }
                                size={30}
                            />
                            <RiArrowDropDownLine
                                type="button"
                                onClick={onNextHandler}
                                className={
                                    index === data.length - 1
                                        ? 'rotateRight-90 disabledColor'
                                        : 'rotateRight-90 themeColor'
                                }
                                size={30}
                            />
                        </div>
                    </>
                ) : (
                    <div className="card padding-1rem noAnnouncementCard align-items-center justify-content-center textBold">
                        No Announcements Today
                    </div>
                )}
            </div>
        </div>
    )
}

export default AnnouncementCardList
