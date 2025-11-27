import React from 'react'
import { Route } from 'react-router-dom'
import TimeSheet from '../../Components/TimeSheets/TimeSheet'
import AuthorizeTimeSheet from '../../Components/TimeSheets/AuthorizeTimeSheet'
import TimeSheetList from '../../Components/TimeSheets/TimeSheetList'
import ReviewTimeSheet from '../../Components/TimeSheets/ReviewTimeSheet'
import ViewTimeSheetList from '../../Components/TimeSheets/ViewTimeSheets/ViewTimeSheetList'
import ViewTimeSheet from '../../Components/TimeSheets/ViewTimeSheets/ViewTimeSheet'

export default [
    <Route path="newTimeSheet" key="newTimeSheet" exact element={<TimeSheet />} />,
    <Route path="timesheetList" key="timesheetList" exact element={<TimeSheetList />} />,
    <Route
        path="authorizeTimesheet"
        key="authorizeTimesheet"
        exact
        element={<AuthorizeTimeSheet />}
    />,
    <Route path="reviewTimeSheet" key="reviewTimeSheet" exact element={<ReviewTimeSheet />} />,
    <Route
        path="timesheetsweeklyReports"
        key="timesheetsweeklyReports"
        exact
        element={<ViewTimeSheetList />}
    />,
    <Route path="ViewTimeSheet" key="ViewTimeSheet" exact element={<ViewTimeSheet />} />
]
