import React from 'react'
import { Route } from 'react-router-dom'
import Resignation from '../../Components/Resignation/Resignation'
import ResignationApproveHRList from '../../Components/Resignation/ResignationApproveHRList'
import ResignationApproveManagerList from '../../Components/Resignation/ResignationApproveManagerList'
import FullAndFinalSettllements from '../../Components/Resignation/FullAndFinalSettllements'
import FullAndFinalsList from '../../Components/Resignation/FullAndFinalsList'
import ResignationList from '../../Components/Resignation/ResignationList'

export default [
    <Route path="resignation" key="resignation" exact element={<Resignation />} />,
    <Route
        path="resignationHRList"
        key="resignationHRList"
        exact
        element={<ResignationApproveHRList />}
    />,
    <Route
        path="resignationManagerList"
        key="resignationManagerList"
        exact
        element={<ResignationApproveManagerList />}
    />,
    <Route path="resignationList" key="resignationList" exact element={<ResignationList />} />,
    <Route
        path="fullAndFinalSettllement"
        key="fullAndFinalSettllement"
        exact
        element={<FullAndFinalSettllements />}
    />,
    <Route
        path="fullAndFinalSettllementList"
        key="fullAndFinalSettllementList"
        exact
        element={<FullAndFinalsList />}
    />
]
