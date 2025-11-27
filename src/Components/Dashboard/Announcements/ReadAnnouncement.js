import React, { useEffect, useState } from 'react'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import { useLocation } from 'react-router-dom'
import { getById } from '../../../Common/Services/CommonService'

const ReadAnnouncement = () => {
    const announcementId = useLocation().state
    const [announcement, setAnnouncement] = useState({})

    useEffect(() => {
        onGetAnnouncementHandler()
    }, [])

    // get Announcement by id
    const onGetAnnouncementHandler = () => {
        getById({ entity: 'announcements', id: announcementId && announcementId.id })
            .then((res) => {
                if (res.statusCode == 200) {
                    setAnnouncement(res.data)
                }
            })
           .catch(()=> {}) // Handle error by doing nothing
    }

    return (
        <>
            <section className="section">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="card card-primary">
                                <PageHeader pageTitle="Announcement" />
                                <div style={{ marginLeft: '35px', marginTop: '15px' }}>
                                    <div>
                                        <span>
                                            <b>Subject :</b>
                                        </span>{' '}
                                        <span>{announcement && announcement.name}</span>
                                    </div>
                                    <br />
                                    <div>
                                        <span>
                                            <b>Body :</b>
                                        </span>{' '}
                                        <span>{announcement && announcement.body}</span>
                                    </div>
                                </div>
                                <br />
                                <br />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default ReadAnnouncement
