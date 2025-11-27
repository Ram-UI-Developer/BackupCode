import React from 'react'
import { Route } from 'react-router-dom'
import MyAttendance from '../../Components/Attendance/Reports/EmployeeReports/MyAttendance'
import ReportList from '../../Components/Attendance/Reports/ManagerReports/ReportList'

export default [
    <Route
        path="managerAttendanceReports"
        key="managerAttendanceReports"
        exact
        element={<ReportList />}
    />,
    <Route path="myAttendance" key="myAttendance" exact element={<MyAttendance />} />
]
