import React from 'react'
import { Route } from 'react-router-dom'
import UsersList from '../../Components/Users/UsersList'
import User from '../../Components/Users/User'
import Role from '../../Components/Roles/Role'
import RoleList from '../../Components/Roles/RoleList'
import SubScriberList from '../../Components/Subscribers/SubScriberList'
import Subscriber from '../../Components/Subscribers/SubScriber'
import HolidayCalendarList from '../../Components/HolidayCalendar/HolidayCalendarList'
import HolidayCalendar from '../../Components/HolidayCalendar/HolidayCalendar'
import LocationList from '../../Components/Locations/LocationList'
import Location from '../../Components/Locations/Location'
import EmployeeDetails from '../../Components/Users/EmployeeDetails/EmployeeDetails'
import ClientList from '../../Components/Project/client/ClientList'
import Client from '../../Components/Project/client/Client'
import ProjectList from '../../Components/Project/project/ProjectList'
import Project from '../../Components/Project/project/Project'
import LeaveTypeList from '../../Components/LeaveManagement/LeaveType/LeaveTypeList'
import LeaveType from '../../Components/LeaveManagement/LeaveType/LeaveType'
import ChangePassword from '../../Components/Users/ChangePassword'
import LeaveBalance from '../../Components/LeaveManagement/LeaveBalance/LeaveBalance'
import EmailTemplateDefaultList from '../../Components/EmailTemplate/EmailTemplateDefaultList'
import EmailTempalteDefault from '../../Components/EmailTemplate/EmailTempalteDefault'
import Dashboard from '../../Components/Dashboard/Dashboard'
import Announcement from '../../Components/Dashboard/Announcements/Announcement'
import OrgProfile from '../../Components/Subscribers/OrgProfile'
import LeaveBalanceList from '../../Components/LeaveManagement/LeaveBalance/LeaveBalanceList'
import ReadAnnouncement from '../../Components/Dashboard/Announcements/ReadAnnouncement'
import ExpenseList from '../../Components/Expenses/AddExpenses/ExpenseList'
import Expenses from '../../Components/Expenses/AddExpenses/Expenses'
import Endpoints from '../../Components/AppOwner/Endpoints/Endpoints'
import ScreenList from '../../Components/AppOwner/Screens/ScreenList'
import Screen from '../../Components/AppOwner/Screens/Screen'
import Modules from '../../Components/AppOwner/Modules/Modules'
import ModulesList from '../../Components/AppOwner/Modules/ModulesList'
import HRHandbook from '../../Components/HR/HRHandbook/HRHandbook'
import EmpReview from '../../Components/PerformanceReview/Employee/EmpReview'
import ManagerReview from '../../Components/PerformanceReview/Manager/ManagerReview'
import HRReview from '../../Components/PerformanceReview/HRD/HRReview'
import EmployeeReviewList from '../../Components/PerformanceReview/Employee/EmployeeReviewList'
import ManagerReviewList from '../../Components/PerformanceReview/Manager/ManagerReviewList'
import HRReviewList from '../../Components/PerformanceReview/HRDUseOnly/HRReviewList'
import HRGenerateList from '../../Components/PerformanceReview/HRDUseOnly/HRGenerateList'
import PeerReviewList from '../../Components/PerformanceReview/Peer/PeerReviewList'
import PeerReview from '../../Components/PerformanceReview/Peer/PeerReview'
import AnnouncementList from '../../Components/Dashboard/Announcements/AnnouncementList'
import MyFeedBackList from '../../Components/FeedBack/MyFeedBackList'
import MyFeedBack from '../../Components/FeedBack/MyFeedBack'
import FeedBack from '../../Components/FeedBack/FeedBack'
import FeedBackList from '../../Components/FeedBack/FeedBackList'
import TimeSheetMonthlyReport from '../../Components/TimeSheets/TimeSheetMonthlyReport'
import DepartmentList from '../../Components/Organizations/Department/DepartmentList'
import ExpensesReport from '../../Components/Expenses/ExpensesReport'
import AppraisalReports from '../../Components/PerformanceReview/AppraisalReports'
import EmployeeReports from '../../Components/Users/EmployeeDetails/EmployeeReports'
import Settings from '../../Components/AppOwner/Settings/Settings'
import GenderList from '../../Components/AppOwner/SeedData/Gender/GenderList'
import MeritalStatusList from '../../Components/AppOwner/SeedData/MaritalStatus/MeritalStatusList'
import JobRoleList from '../../Components/AppOwner/SeedData/JobRoles/JobRoleList'
import ProjectStatusList from '../../Components/AppOwner/SeedData/ProjectStatus/ProjectStatusList'
import { MainPackageComponent } from '../../Components/Packages&Billigs/Packages/MainPackageComponent'
import PackagesList from '../../Components/Packages&Billigs/Packages/PackagesList'
import PackageSelection from '../../Components/Packages&Billigs/PackageSelection'
import SubscriptionPayment from '../../Components/Packages&Billigs/Billing&Payment/SubscriptionPayment'
import AppOwnerAnnouncement from '../../Components/Dashboard/Announcements/AppOwnerAnnouncement'
import OrganizationChart from '../../Components/Organizations/Department/OrganizationChart'
import DelegateList from '../../Components/Delegate/DelegateList'
import DelegateDetail from '../../Components/Delegate/DelegateDetail'
import Analytics from '../../Components/Analytics/Analytics'

export default [
    <Route path="subscriberList" key="subscriberList" exact element={<SubScriberList />} />,
    <Route path="subscriber" key="subscriber" exact element={<Subscriber />} />,
    <Route path="userList" key="userList" exact element={<UsersList />} />,
    <Route path="user" key="user" exact element={<User />} />,
    <Route path="role" key="role" exact element={<Role />} />,
    <Route path="roleList" key="roleList" exact element={<RoleList />} />,
    <Route
        path="holidayCalendarList"
        key="holidayCalendarList"
        exact
        element={<HolidayCalendarList />}
    />,
    <Route path="HolidayCalendar" key="HolidayCalendar" exact element={<HolidayCalendar />} />,
    <Route path="locationList" key="locationList" exact element={<LocationList />} />,
    <Route path="location" key="location" exact element={<Location />} />,
    <Route path="employeeDetails" key="employeeDetails" exact element={<EmployeeDetails />} />,
    <Route path="clientList" key="clientList" exact element={<ClientList />} />,
    <Route path="client" key="client" exact element={<Client />} />,
    <Route path="projectList" key="projectList" exact element={<ProjectList />} />,
    <Route path="project" key="project" exact element={<Project />} />,
    <Route path="leaveTypeList" key="leaveTypeList" exact element={<LeaveTypeList />} />,
    <Route path="leaveType" key="leaveType" exact element={<LeaveType />} />,
    <Route path="changePassword" key="changePassword" exact element={<ChangePassword />} />,
    <Route path="leaveBalance" key="leaveBalance" exact element={<LeaveBalance />} />,
    <Route
        path="emailTemplateList"
        key="emailTemplateList"
        exact
        element={<EmailTemplateDefaultList />}
    />,
    <Route path="emailTemplate" key="emailTemplate" exact element={<EmailTempalteDefault />} />,
    <Route path="/" key="dashboard" exact element={<Dashboard />} />,
    <Route path="announcement" key="announcement" exact element={<Announcement />} />,
    <Route path="organizationProfiles" key="organizationProfiles" exact element={<OrgProfile />} />,
    <Route path="leaveBalances" key="leaveBalances" exact element={<LeaveBalanceList />} />,
    <Route path="readAnnouncement" key="readAnnouncement" exact element={<ReadAnnouncement />} />,
    <Route path="Expenses" key="Expenses" exact element={<ExpenseList />} />,
    <Route path="Expense" key="Expense" exact element={<Expenses />} />,
    <Route path="endpoints" key="endpoints" exact element={<Endpoints />} />,
    <Route path="screenList" key="screenList" exact element={<ScreenList />} />,
    <Route path="screen" key="screen" exact element={<Screen />} />,
    <Route path="moduleList" key="moduleList" exact element={<ModulesList />} />,
    <Route path="module" key="moduleList" exact element={<Modules />} />,
    <Route path="hrHandbook" key="hrHandbook" exact element={<HRHandbook />} />,
    <Route path="selfratings" key="selfratings" exact element={<EmpReview />} />,
    <Route path="appraisalList" key="appraisalList" exact element={<EmployeeReviewList />} />,
    <Route path="mngRating" key="mngRating" exact element={<ManagerReview />} />,
    <Route path="hrRating" key="hrRating" exact element={<HRReview />} />,
    <Route
        path="authorizeAppraisalList"
        key="authorizeAppraisalList"
        exact
        element={<ManagerReviewList />}
    />,
    <Route path="HRReviewList" key="HRReviewList" exact element={<HRReviewList />} />,
    <Route
        path="performanceAppraisal"
        key="performanceAppraisal"
        exact
        element={<HRGenerateList />}
    />,
    <Route path="peerReviewList" key="peerReviewList" exact element={<PeerReviewList />} />,
    <Route path="peerReview" key="peerReview" exact element={<PeerReview />} />,
    <Route path="announcementList" key="announcementList" exact element={<AnnouncementList />} />,
    <Route path="myFeedbackList" key="myFeedbackList" exact element={<MyFeedBackList />} />,
    <Route path="myFeedback" key="myFeedback" exact element={<MyFeedBack />} />,
    <Route path="feedbackList" key="feedbackList" exact element={<FeedBackList />} />,
    <Route path="feedback" key="feedback" exact element={<FeedBack />} />,
    <Route
        path="timesheetsMonthlyReports"
        key="timesheetsMonthlyReports"
        exact
        element={<TimeSheetMonthlyReport />}
    />,
    <Route path="departmentList" key="departmentList" exact element={<DepartmentList />} />,
    <Route path="expensesReports" key="expensesReports" exact element={<ExpensesReport />} />,
    <Route path="appraisalReports" key="appraisalReports" exact element={<AppraisalReports />} />,
    <Route path="employeeReports" key="employeeReports" exact element={<EmployeeReports />} />,
    <Route path="settings" key="settings" exact element={<Settings />} />,
    <Route path="genderList" key="genderList" exact element={<GenderList />} />,
    <Route
        path="maritalStatusList"
        key="maritalStatusList"
        exact
        element={<MeritalStatusList />}
    />,
    <Route path="jobRoleList" key="jobRoleList" exact element={<JobRoleList />} />,
    <Route
        path="projectStatusList"
        key="projectStatusList"
        exact
        element={<ProjectStatusList />}
    />,
    <Route
        path="subscriptionPayment"
        key="subscriptionPayment"
        exact
        element={<SubscriptionPayment />}
    />,
    <Route
        path="packageSubscription"
        key="packageSubscription"
        exact
        element={<MainPackageComponent />}
    />,
    <Route path="packageList" key="packageList" exact element={<PackagesList />} />,
    <Route path="packagesselection" key="packagesselection" exact element={<PackageSelection />} />,
    <Route
        path="appOwnerAnnouncement"
        key="appOwnerAnnouncement"
        exact
        element={<AppOwnerAnnouncement />}
    />,
    <Route path="orgChart" key="orgChart" exact element={<OrganizationChart />} />,
    <Route path="delegateList" key="delegateList" exact element={<DelegateList />} />,
    <Route path="delegate" key="delegate" exact element={<DelegateDetail />} />,
    <Route path="analytics" key="analytics" exact element={<Analytics />} />
]
