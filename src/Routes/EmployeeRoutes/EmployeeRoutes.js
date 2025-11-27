import React from 'react'
import { Route } from 'react-router-dom'
import ThankYou from '../../Components/Subscribers/ThankYou'
import EmployeeList from '../../Components/Users/EmployeeDetails/EmployeeList'
import EmployeeProfileDetails from '../../Components/Users/EmployeeDetails/EmployeeProfileDetails'

export default [
    <Route path="thankyou" key="thankyou" exact element={<ThankYou />} />,
    <Route path="employeeList" key="employeeList" exact element={<EmployeeList />} />,
    <Route
        path="employeeProfile"
        key="employeeProfile"
        exact
        element={<EmployeeProfileDetails />}
    />
]
