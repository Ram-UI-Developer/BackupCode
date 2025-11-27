import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { getAllAnnouncementsWithOrgAndLocationIdAndDate } from '../../../Common/Services/CommonService'
import ViewAnnouncement from './ViewAnnouncement'

const ViewAnnouncementList = () => {
    const userDetails = useSelector((state) => state.user.userDetails) //

    const [data, setData] = useState([])
    useEffect(() => {
        onGetAnnouncemets()
    }, [])

    let today = new Date() //storing the current date
    //getAll announcements by locationId
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
    }

    return (
        <>
            <div>
                <div className="">
                    <div className="dashboardHeadings">
                        Announcements{data && data.length > 0 && '(' + data.length + ')'}
                    </div>
                    {data && data.length > 0 ? (
                        <>
                            <div className="announcementsHeight">
                                {data.map((announcement) => (
                                    <ViewAnnouncement data={announcement} length={data.length} />
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="announcementCard">
                                <div className="row">No Announcements Today</div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    )
}

export default ViewAnnouncementList
