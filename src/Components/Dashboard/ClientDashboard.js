import React from 'react'
import DashboardWelcomeCard from './WishingComponents/DashboardWelcomeCard'
import PageHeader from '../../Common/CommonComponents/PageHeader'
import AlertMessages from './WishingComponents/AlertMessages'
import { useSelector } from 'react-redux'

const ClientDashboard = () => {
    const userDetails = useSelector((state) => state.user.userDetails)
    return (
        <>
            <section className="section">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12" style={{ marginTop: '-25px' }}>
                            <br />
                            <PageHeader pageTitle=" " />

                            <div
                                className="row"
                                style={{ marginBottom: '5px', marginTop: '-10px' }}
                            >
                                {userDetails.organizationId != null ? (
                                    <div className="dashboardCards" style={{ width: '100%' }}>
                                        <AlertMessages />
                                    </div>
                                ) : (
                                    ''
                                )}
                            </div>

                            <div className="row">
                                <div className="dashboardCards" style={{ width: '100%' }}>
                                    <DashboardWelcomeCard />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default ClientDashboard
