import React from 'react'
import PageHeader from '../../../../Common/CommonComponents/PageHeader'
import EmployeeReports from '../ManagerReports/EmployeeReports'
import { useSelector } from 'react-redux'

const MyAttendance = () => {
    const userDetails = useSelector((state) => state.user.userDetails) // get userdetails from redux
    return (
        <>
            <section className="section">
                <div className="container-fluid" style={{ padding: '0px' }}>
                    <PageHeader pageTitle={'My Attendance'} />
                    <div>
                        {/* passing userdetails for employee graph */}
                        <EmployeeReports empObj={userDetails} employeeList={[]} />
                    </div>
                </div>
            </section>
        </>
    )
}

export default MyAttendance
