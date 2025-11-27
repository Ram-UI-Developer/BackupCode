import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Loader from '../../../Common/CommonComponents/Loader'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import { getHrHandbook } from '../../../Common/Services/OtherServices'

const HRHandbook = () => {
    const userDetails = useSelector((state) => state.user.userDetails)

    const [handbook, setHandbook] = useState(null)

    useEffect(() => {
        onGetHandbookHandler()
    }, [])

    const onGetHandbookHandler = () => {
        getHrHandbook({
            entity: 'locations',
            organizationId: userDetails.organizationId,
            locationId: userDetails.locationId
        })
            .then((res) => {
                if (res.statusCode == 200) {
                    setHandbook(res.data ? res.data.handbook : null)
                }
            })
            .catch((err) => {
                console.log(err)
            })
    }

    return (
        <>
            <section className="section">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className=" card-primary">
                                <PageHeader pageTitle="HR Handbook" />

                                {handbook ? (
                                    <div className="">
                                        <iframe
                                            src={`data:application/pdf;base64,${handbook}`}
                                            width="100%"
                                            height="700px"
                                        ></iframe>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <Loader />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default HRHandbook
