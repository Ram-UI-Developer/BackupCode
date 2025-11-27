import React, {  useLayoutEffect } from 'react';
import EmployeeHeadCount from './Employee/EmployeeHeadCount';
import EmployeePayByGeneration from './Employee/EmployeePayByGeneration';
import EmployeeHeadcountByGender from './Employee/EmployeeHeadcountByGender';
import WorkforceDemographics from './WorkForceAnalytics/WorkforceDemographics';
import HeadcountAnalysis from './WorkForceAnalytics/HeadcountAnalysis';
import DiversityInclusion from './WorkForceAnalytics/DiversityInclusion';
import PredictiveWorkforceTrends from './WorkForceAnalytics/PredictiveWorkforceTrends';

const WorkforceDashboard = ({ id }) => {

    useLayoutEffect(() => {
        if (id) {
            const target = document.getElementById(id);
            if (target) {
                target.scrollIntoView({
                    behavior: "smooth",  // 👈 smooth scrolling
                    block: "start",      // 👈 aligns to top
                });
            }
        }
    }, [id]);

    return (
        <div className="mt-3">
            <div className="row" id="employeeAnalytics">
                {/* Pie Chart Card */}
                <div className="col-sm-4">
                    <EmployeeHeadCount />
                </div>

                {/* Empty Card */}
                <div className="col-sm-4">
                    <EmployeePayByGeneration />
                </div>

                {/* Text Card */}
                <div className="col-sm-4">
                    <EmployeeHeadcountByGender />
                </div>
            </div>
            <div>
                <h3>Workforce Analytics</h3>
            </div>
            <div>
                <div className='row' id='workforce'>
                    <div className='col-sm-6'>
                        <WorkforceDemographics />
                    </div>
                    <div className='col-sm-6'>
                        <HeadcountAnalysis />
                    </div>
                </div>
                <div className='row' id='diversity'>
                    <div className='col-sm-6'>
                        <DiversityInclusion />
                    </div>
                    <div className='col-sm-6'>
                        <PredictiveWorkforceTrends />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkforceDashboard;
