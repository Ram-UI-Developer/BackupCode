import React, { useState } from 'react'
import PageHeader from '../../Common/CommonComponents/PageHeader'
import { Tab, Tabs } from 'react-bootstrap'
import EmployeeHeadCount from './Employee/EmployeeHeadCount';
import EmployeePayByGeneration from './Employee/EmployeePayByGeneration';
import EmployeeHeadcountByGender from './Employee/EmployeeHeadcountByGender';
import WorkforceDemographics from './WorkForceAnalytics/WorkforceDemographics';
import HeadcountAnalysis from './WorkForceAnalytics/HeadcountAnalysis';
import DiversityInclusion from './WorkForceAnalytics/DiversityInclusion';
import PredictiveWorkforceTrends from './WorkForceAnalytics/PredictiveWorkforceTrends';
import TrainingSkillsChart from './Skills/TrainingSkillsChart';
import HiringAnalytics from './Hiring/HiringAnalytics';

const Analytics = () => {
    const [next, setNext] = useState(0);

    const updateStep = (step) => {
        //handling tabs in the screen
        if (step == next) {
            return step
        } else {
            setNext(step)
        }
    }

    return (
        <div>
            <section className="section">
                <div className="container-fluid">
                    <PageHeader pageTitle="Analytics" />
                    <Tabs activeKey={next} onSelect={updateStep} >
                        <Tab eventKey={0}
                            title="Employees"
                            onClick={() => updateStep(0,)}
                            id="employeesTab"
                        >
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
                        </Tab>
                        <Tab eventKey={1}
                            onClick={() => updateStep(1)}
                            id='workforceTab'
                            title="Workforce Analytics">
                            <div className='row' id='workforce'>
                                <div className='col-sm-6'>
                                    <WorkforceDemographics />
                                </div>
                                <div className='col-sm-6'>
                                    <HeadcountAnalysis />
                                </div>
                            </div>
                        </Tab>
                        <Tab eventKey={2}
                            onClick={() => updateStep(2)}
                            id='diversityandinclusionTab'
                            title="Diversity and Inclusion">
                            <div className='row' id='diversity'>
                                <div className='col-sm-6'>
                                    <DiversityInclusion />
                                </div>
                                <div className='col-sm-6'>
                                    <PredictiveWorkforceTrends />
                                </div>
                            </div>
                        </Tab>

                        <Tab eventKey={3}
                            onClick={() => updateStep(3)}
                            id='HiringTab'
                            title="Hiring">
                                <HiringAnalytics />
                        </Tab>

                        <Tab eventKey={4}
                            onClick={() => updateStep(4)}
                            id='skillsTab'
                            title="Skills">
                                <TrainingSkillsChart />
                        </Tab>
                    </Tabs>
                </div>
            </section>
        </div>
    )
}

export default Analytics