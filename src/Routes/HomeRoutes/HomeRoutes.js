import React from 'react'
import { Route } from 'react-router-dom'

import HomePage from '../../Components/HomePage'
import Subscription from '../../Components/Subscribers/Subscription'
import ThankYou from '../../Components/Subscribers/ThankYou'
import ConformationPage from '../../Components/Subscribers/ConformationPage'
import PrivacyPolicy from '../../Components/PrivacyPolicy'
import Login from '../../Components/Users/TempUser/Login/Login'
import Packages from '../../Components/Packages&Billigs/Packages/Packages'
import SubscriptionPayment from '../../Components/Packages&Billigs/Billing&Payment/SubscriptionPayment'
import RefundAndReturnPolicy from '../../Components/RefundAndReturnPolicy'
import TermsAndConditions from '../../Components/TermsAndConditions'
import ResetPassword from '../../Components/Users/ResetPassword'

export default [
    <Route path="subscription" key="subscription" exact element={<Subscription />} />,
    <Route path="packages" key="packages" exact element={<Packages />} />,
    <Route path="thankyou" key="thankyou" exact element={<ThankYou />} />,
    <Route path="conformation" key="conformation" exact element={<ConformationPage />} />,
    <Route path="/" key="/" exact element={<HomePage />} />,
    <Route path="privacyPolicy" key="privacyPolicy" exact element={<PrivacyPolicy />} />,
    <Route path="login" key="login" exact element={<Login />} />,
    <Route
        path="subscriptionPayment"
        key="subscriptionPayment"
        exact
        element={<SubscriptionPayment />}
    />,
    <Route path="refundPolicy" key="refundPolicy" exact element={<RefundAndReturnPolicy />} />,
    <Route
        path="termsAndConditions"
        key="termsAndConditions"
        exact
        element={<TermsAndConditions />}
    />,
    <Route path="reset" key="reset" exact element={<ResetPassword />} />,
]
