import React from 'react'
import { Route } from 'react-router-dom'
import ReimburseList from '../../Components/Expenses/Reimburseexpense/ReimburseList'
import Reimburse from '../../Components/Expenses/Reimburseexpense/Reimburse'
import AuthorizeExpenseList from '../../Components/Expenses/Authorize/AuthorizeExpenseList'
import AuthorizeExpense from '../../Components/Expenses/Authorize/AuthorizeExpense'
import ExpenseAdd from '../../Components/Expenses/ApplyExpenses/Expense'
import ExpensesList from '../../Components/Expenses/ApplyExpenses/ExpensesList'
export default [
    <Route path="reimburseList" key="reimburse" exact element={<ReimburseList />} />,
    <Route path="reimburse" key="reimburse" exact element={<Reimburse />} />,
    <Route
        path="authorizeExpenseList"
        key="authorizeExpenseList"
        exact
        element={<AuthorizeExpenseList />}
    />,
    <Route path="authorizeExpense" key="authorizeExpense" exact element={<AuthorizeExpense />} />,
    <Route path="expenseAdd" key="expenseAdd" exact element={<ExpenseAdd />} />,
    <Route path="expensesList" key="expensesList" exact element={<ExpensesList />} />
]
