import React, { useEffect } from 'react'
import PageHeader from '../../Common/CommonComponents/PageHeader'
import { useSelector } from 'react-redux'
import CurrentLeaves from './Leaves/CurrentLeaves'
import CelebrationList from './Celebrations/CelebrationList'
import AnnouncementCardList from './Announcements/AnnouncementCardList'
import HolidayCardList from './Holidays/HolidayCardList'
import LeaveBalancesCard from './Leaves/LeaveBalances/LeaveBalancesCard'
import AttendanceChart from './Attendance/AttendanceChart'
import DashboardWelcomeCard from './WishingComponents/DashboardWelcomeCard'
import PunchIn from './Attendance/PunchIn'
import AlertMessages from './WishingComponents/AlertMessages'
import SubScriberList from '../Subscribers/SubScriberList'
// import NotificationHandler from '../NotificationHandler'

const Dashboard = () => {
    const userDetails = useSelector((state) => state.user.userDetails)
    const isInternalUser =
        userDetails && userDetails.organizationId && userDetails.type === 'Internal'
    const isExternalUser =
        userDetails && userDetails.organizationId && userDetails.type === 'External'

    useEffect(() => {
        if (userDetails.organizationId) {
            localStorage.setItem('menuItem', 'dashboard')
        } else {
            localStorage.setItem('menuItem', 'Subscribers')
        }
    }, [])

    return (
        <>
         {/* <NotificationHandler /> */}
            {userDetails.organizationId ? (
                <>
                    {isInternalUser ? (
                        <section className="section">
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-md-12" style={{ marginTop: '-25px' }}>
                                        <br />
                                        <PageHeader pageTitle=" " />
                                        {userDetails.organizationId && (
                                            <div
                                                className="row"
                                                style={{ marginBottom: '5px', marginTop: '-10px' }}
                                            >
                                                <div
                                                    className="dashboardCards"
                                                    style={{ width: '100%' }}
                                                >
                                                    <AlertMessages />
                                                </div>
                                            </div>
                                        )}
                                        <div className="row">
                                            <div
                                                className="dashboardCards"
                                                style={{ width: '70%' }}
                                            >
                                                <DashboardWelcomeCard />
                                            </div>
                                            <div
                                                className="dashboardCards"
                                                style={{ width: '30%' }}
                                            >
                                                <PunchIn />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div
                                                className="dashboardCards"
                                                style={{ width: '40%' }}
                                            >
                                                <AnnouncementCardList />
                                            </div>
                                            <div
                                                className="dashboardCards"
                                                style={{ width: '30%' }}
                                            >
                                                <HolidayCardList />
                                            </div>
                                            <div
                                                className="dashboardCards"
                                                style={{ width: '30%' }}
                                            >
                                                <LeaveBalancesCard />
                                            </div>
                                        </div>
                                        <div className="row">
                                            {userDetails.todayLeaves ||
                                            userDetails.upcomingLeaves ? (
                                                <div
                                                    className="dashboardCards"
                                                    style={{ width: '32%' }}
                                                >
                                                    <div className="card detailBackground">
                                                        <div className="card-body upcomingLeavesBody">
                                                            <CurrentLeaves />
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                ''
                                            )}
                                            <div
                                                className="dashboardCards"
                                                style={{ width: '38%' }}
                                            >
                                                <div class="card detailBackground ">
                                                    <div className="card-body upcomingLeavesBody">
                                                        <CelebrationList />
                                                    </div>
                                                </div>
                                            </div>
                                            <div
                                                className="dashboardCards"
                                                style={{ width: '30%' }}
                                            >
                                                <div class="card detailBackground">
                                                    <div className="card-body upcomingLeavesBody">
                                                        <div className="dashboardHeading attendanceHeading">
                                                            Attendance
                                                        </div>
                                                        <div className="d-flex justify-content-center">
                                                            <AttendanceChart />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    ) : isExternalUser ? (
                        <section className="section">
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-md-12" style={{ marginTop: '-25px' }}>
                                        <br />
                                        <PageHeader pageTitle=" " />
                                        {userDetails.organizationId && (
                                            <div
                                                className="row"
                                                style={{ marginBottom: '5px', marginTop: '-10px' }}
                                            >
                                                <div
                                                    className="dashboardCards"
                                                    style={{ width: '100%' }}
                                                >
                                                    <AlertMessages />
                                                </div>
                                            </div>
                                        )}
                                        <div className="row">
                                            <div
                                                className="dashboardCards"
                                                style={{ width: '100%' }}
                                            >
                                                <DashboardWelcomeCard />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    ) : (
                        <section className="section">
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className=" card-primary">
                                            <div style={{ marginTop: '20%' }}>
                                                <center>
                                                    <h3>{"Page can't be found"}</h3>
                                                </center>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
                </>
            ) : (
                <>
                    <SubScriberList />
                </>
            )}
        </>
    )
}

export default Dashboard
