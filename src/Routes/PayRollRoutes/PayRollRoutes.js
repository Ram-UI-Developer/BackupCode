import React from 'react'
import { Route } from 'react-router-dom'
import HeadList from '../../Components/PayRoll/Heads/HeadList'
import Annexure from '../../Components/PayRoll/Reports/Annexure'
import PaySlip from '../../Components/PayRoll/Reports/PaySlip'
import SalaryComponentList from '../../Components/PayRoll/SalaryComponents/SalaryComponentList'
import SalaryTemplate from '../../Components/PayRoll/SalaryTemplets/SalaryTemplate'
import SalaryTemplateList from '../../Components/PayRoll/SalaryTemplets/SalaryTempletList'
import TaxRulesList from '../../Components/PayRoll/TaxRules/TaxRuleList'
import TaxRules from '../../Components/PayRoll/TaxRules/TaxRules'
import Payrun from '../../Components/PayRoll/Payrun/Payrun'
import PayrunList from '../../Components/PayRoll/Payrun/PayrunList'
import PaySlipHR from '../../Components/PayRoll/Reports/PaySlipHR'
import CompensationHistory from '../../Components/Users/EmployeeDetails/CompensationHistory'
import LoanTracking from '../../Components/Users/EmployeeDetails/LoanTracking'

export default [
    <Route path="headList" key="headList" exact element={<HeadList />} />,
    <Route
        path="salaryComponentList"
        key="salaryComponentList"
        exact
        element={<SalaryComponentList />}
    />,
    <Route path="salaryTemplate" key="salaryTemplate" exact element={<SalaryTemplate />} />,
    <Route
        path="salaryTemplateList"
        key="salaryTemplateList"
        exact
        element={<SalaryTemplateList />}
    />,
    <Route path="annexure" key="annexure" exact element={<Annexure />} />,
    <Route path="taxRules" key="taxRules" exact element={<TaxRules />} />,
    <Route path="myPayslips" key="myPayslips" exact element={<PaySlip />} />,
    <Route path="payslip" key="payslip" exact element={<PaySlipHR />} />,
    <Route
        path="compensationHistory"
        key="compensationHistory"
        exact
        element={<CompensationHistory />}
    />,
    <Route path="loanTracking" key="loanTracking" exact element={<LoanTracking />} />,
    <Route path="payrunList" key="payrunList" exact element={<PayrunList />} />,
    <Route path="payrun" key="payrun" exact element={<Payrun />} />,

    <Route path="taxRulesList" key="taxRulesList" exact element={<TaxRulesList />} />
]
