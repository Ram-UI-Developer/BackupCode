import React from 'react'
import { HiMiniMegaphone } from 'react-icons/hi2'
import ReactHtmlParser from 'react-html-parser'

const ViewAnnouncement = ({ data, color }) => {
    const body = data.body ? data.body : ''
    const convertedBody = ReactHtmlParser(body)

    return (
        <>
            <div className="announcementCard">
                <div className="row">
                    <div className="col-sm-1 speakerBody">
                        <HiMiniMegaphone className="speaker" size={35} />
                    </div>
                    <div className="col-sm-10 announcementContent">
                        <div className="announcementName">{data.name}</div>
                        <div className="announcementBody">{convertedBody}</div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ViewAnnouncement
