import React, { useEffect, useState } from 'react'
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io'
import { useSelector } from 'react-redux'
import { getAllByOrgId } from '../../../Common/Services/CommonService'

const AlertMessages = () => {
    const userDetails = useSelector((state) => state.user.userDetails) //fetch user details using redux
    const [announcements, setAnnouncements] = useState([]) //state for announcemnts
    const [expandedAnnouncements, setExpandedAnnouncements] = useState({}) //state for single announcement

    const toggleExpansion = (index) => {
        setExpandedAnnouncements((prev) => ({
            ...prev,
            [index]: !prev[index]
        }))
    }

    //handling html content to text
    const convertHtmlToText = (html) => {
        const doc = new DOMParser().parseFromString(html, 'text/html')
        return doc.body.textContent || doc.body.innerText || ''
    }

    //get all announcemnts
    const getAllAlters = () => {
        getAllByOrgId({
            entity: 'appownerannouncements',
            organizationId: userDetails.organizationId
        }).then((res) => {
            if (res.statusCode == 200) {
                setAnnouncements(res.data)
            }
        })
       .catch(()=> {}) // Handle error by doing nothing
    }

    useEffect(() => {
        getAllAlters()
    }, [])

    return announcements.length > 0 ? (
        <div className="alertmessage-container">
            {announcements.map((announcement, index) => (
                <div key={index} className="alertmessage">
                    <div className="announcement-header">
                        <marquee behavior="scroll" direction="left" style={{ width: '100%' }}>
                            <div className="announcement-text">{announcement.name}</div>
                        </marquee>

                        <span className="spanbody">
                            {expandedAnnouncements[index] ? (
                                <IoIosArrowUp
                                    size={20}
                                    style={{ marginLeft: '10px', cursor: 'pointer' }}
                                    onClick={() => toggleExpansion(index)}
                                />
                            ) : (
                                <IoIosArrowDown
                                    size={20}
                                    style={{ marginLeft: '10px', cursor: 'pointer' }}
                                    onClick={() => toggleExpansion(index)}
                                />
                            )}
                        </span>
                    </div>

                    {expandedAnnouncements[index] && (
                        <div className="announcement-body">
                            <p>{convertHtmlToText(announcement.body)}</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    ) : null
}

export default AlertMessages
