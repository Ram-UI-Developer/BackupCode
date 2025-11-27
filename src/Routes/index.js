import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import DetailLoader from '../Common/CommonComponents/Loaders/DetailLoader'
import { ACCESS_TOKEN } from '../Common/Utilities/Constants'
import Footer from '../Components/Footer'
import Header from '../Components/Header'
import NavBar from '../Components/Header/NavBar'
import SideBar from '../Components/Header/SideBar'
import NotificationsEvent from '../Components/NotificationsEvent'
import AdminRoutes from './AdminRoutes/AdminRoutes'
import AttendanceRoutes from './AttendanceRoutes/AttendanceRoutes'
import EmployeeRoutes from './EmployeeRoutes/EmployeeRoutes'
import ExpenseRoutes from './ExpenseRoutes/ExpenseDailyRoutes'
import HomeRoutes from './HomeRoutes/HomeRoutes'
import LMSRoutes from './LMSRoutes/LMSRoutes'
import MasterRoutes from './MasterRoutes/MasterRoutes'
import PayRollRoutes from './PayRollRoutes/PayRollRoutes'
import ResignationRoutes from './ResignationRoutes/ResignationRoutes'
import TimeSheetDailyRoutes from './TimesheetRoutes/TimeSheetDailyRoutes'
import NotificationPopup from '../Components/Header/NotificationPopUp'
import { notificationsById } from '../Common/Services/OtherServices'
import useSessionHandler from './useSessionHandler'

const AppRouter = () => {
    useSessionHandler({
        warningThresholdMinutes: 30,
        checkIntervalMinutes: 30,
        sessionTimeoutMinutes: 1
    })

    let detailPaths = [
        '/subscriber',
        '/country',
        '/emailTemplate',
        '/leaveType',
        '/Expense',
        '/screen',
        '/module',
        '/feedback',
        '/location',
        '/HolidayCalendar',
        '/client',
        '/project',
        '/announcement',
        '/employeeDetails',
        '/mngRating',
        '/fullAndFinalSettllement',
        '/role',
        '/user',
        '/resignation',
        '/leave',
        '/AuthorizeLeaveDetails',
        '/newTimeSheet',
        '/reviewTimeSheet',
        '/expenseAdd',
        '/AuthorizeExpense',
        '/Reimburse',
        '/selfratings',
        '/hrRating',
        '/salaryTemplate',
        '/payrun',
        '/taxRules',
        '/ViewLeave',
        '/myFeedback',
        '/hrHandbook',
        '/leaveBalance',
        '/managerAttendanceReports',
        '/employeeProfile',
        '/login',
        '/',
        '/changePassword',
        '/subscriptionPayment',
        '/packageSubscription',
        '/packagesselection',
        '/packages',
        '/taxRulesList',
        '/orgChart',
        '/appOwnerAnnouncement',
        '/conformation',
        '/thankyou',
        '/delegateList',
        '/delegate',
        "/employeeList",
        "/analytics"
    ]

    const [notificationData, setNotificationData] = useState([
        // Mock data to replicate the screenshot
    ]);
    const [count, setCount] = useState(null) // State for notification data
    const [showNotifications, setShowNotifications] = useState(false);
    console.log(count, "Notification count")
    console.log(notificationData, "Notification data")

    const handleToggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    const [access, setAccess] = useState(true)
    const [loading, setLoading] = useState(true)
    const userDetails = useSelector((state) => state.user.userDetails)
    console.log(userDetails, "User details in AppRouter")
    let moduleNames =
        userDetails &&
        userDetails.menus &&
        userDetails['menus'].map((modules) => modules.screenDTOs.map((e) => e.path))
    let listPaths = moduleNames ? moduleNames.flat() : []
    let paths = [...listPaths, ...detailPaths]

    const [sidebarHovered, setSidebarHovered] = useState(false)

    const handleSidebarHover = (isHovered) => {
        setSidebarHovered(isHovered)
    }

    useEffect(() => {
        onAccessHandler()
    }, [])

    useEffect(() => {
        // Run once immediately
        if (userDetails && userDetails.employeeId) {
            displayNotification();

            // Then run every 60 seconds
            const interval = setInterval(() => {
                displayNotification();
            }, 180000); // 180000 milliseconds = 3 minutes

            // Cleanup interval on unmount or dependency change
            return () => clearInterval(interval)
        }
    }, [userDetails && userDetails.employeeId]);



    const displayNotification = () => {
        console.log("object")
        notificationsById({ employeeId: userDetails && userDetails.employeeId })
            .then((response) => {
                console.log(response, "Notification response")
                setNotificationData(response.messages)
                setCount(response.count)
            })
            .catch((error) => {
                console.error('Error fetching notifications:', error);
            });
    };

    const onAccessHandler = () => {
        if (window.location.pathname) {
            setLoading(false)
            setAccess(
                paths && paths.some((e) => e === window.location.pathname)
                    ? true
                    : window.location.pathname == '/'
                        ? true
                        : false
            )
        }
        if (userDetails && userDetails.organizationId == null) {
            if (window.location.pathname == 'settings') {
                setAccess(true)
            }
        }
    }



    let token = ''
    if (!token) {
        token = localStorage.getItem(ACCESS_TOKEN)
    }

    if (!token) {
        return (
            <>
                <div className="homewrapper">
                    {window.location.pathname == '/login' ? "" : <Header />}
                    <Routes>{HomeRoutes}</Routes>
                    <ToastContainer autoClose={5000} />
                </div>
            </>
        )
    }

    return (
        <>
            {loading ? <DetailLoader /> : ''}
            <>
                {!access ? (
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
                ) : (
                    <>
                        <div className="app-layout">
                            <div className={`wrapper ${sidebarHovered ? 'sidebar-hovered' : ''}`}>
                                <NavBar onToggleNotifications={handleToggleNotifications} count={count} />
                                <div className="position-fixed top-0 end-0 mt-5 me-2" style={{ zIndex: '60000' }}>
                                    <NotificationPopup
                                        show={showNotifications}
                                        onClose={() => setShowNotifications(false)}
                                        notificationData={notificationData}
                                        count={count}
                                    />
                                </div>
                                <SideBar onHoverChange={handleSidebarHover} />
                                <NotificationsEvent />
                            </div>

                            <div
                                className={`content-wrapper ${sidebarHovered ? 'content-expanded' : ''}`}
                            >
                                <Routes>
                                    {AdminRoutes}
                                    {MasterRoutes}
                                    {EmployeeRoutes}
                                    {TimeSheetDailyRoutes}
                                    {LMSRoutes}
                                    {AttendanceRoutes}
                                    {ExpenseRoutes}
                                    {PayRollRoutes}
                                    {ResignationRoutes}
                                </Routes>
                                <ToastContainer autoClose={5000} />
                            </div>

                            {/* Floating chatbot */}


                            {/* Footer */}
                            <Footer />
                        </div>

                    </>
                )}
            </>
        </>
    )
}

export default AppRouter
