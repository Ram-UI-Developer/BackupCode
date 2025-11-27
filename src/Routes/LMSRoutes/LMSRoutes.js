import React from 'react'
import { Route } from 'react-router-dom'
import Leave from '../../Components/LeaveManagement/ApplyLeave/Leave'
import LeavesList from '../../Components/LeaveManagement/ApplyLeave/LeavesList'
import AuthorizeLeaveDetails from '../../Components/LeaveManagement/AuthorizeLeaves/AuthorizeLeaveDetails'
import AuthorizeLeaves from '../../Components/LeaveManagement/AuthorizeLeaves/AuthorizeLeaves'
import ViewLeave from '../../Components/LeaveManagement/ViewLeave/ViewLeave'
import ViewLeaveList from '../../Components/LeaveManagement/ViewLeave/ViewLeaveList'

export default [
    <Route path="leaveList" key="leaveList" exact element={<LeavesList />} />,
    <Route path="authorizeLeaves" key="authorizeLeaves" exact element={<AuthorizeLeaves />} />,
    <Route path="leave" key="leave" exact element={<Leave />} />,
    <Route
        path="AuthorizeLeaveDetails"
        key="AuthorizeLeaveDetails"
        exact
        element={<AuthorizeLeaveDetails />}
    />,
    <Route path="leavesReports" key="leavesReports" exact element={<ViewLeaveList />} />,
    <Route path="ViewLeave" key="ViewLeave" exact element={<ViewLeave />} />
]
