import React from 'react'
import CandidateRelatedActivities from './CandidateRelatedActivities'
import CandidateSource from './CandidateSource'
import CandidateStatusOverview from './CandidateStatusOverview'
import HiredCandidatesBySource from './HiredCandidatesBySource'
import HiringTrend from './HiringTrend'
import TopSummaryBoxes from './TopSummaryBoxes'

const HiringAnalytics = () => {
    return (
        <div>
            <div>
                <TopSummaryBoxes />
            </div>
            <div className='row'>
                <div className='col-sm-6'>
                    <CandidateRelatedActivities />
                </div>
                <div className='col-sm-6' >
                    <CandidateSource />
                </div>
            </div>
            <div className='row'>
                <div className='col-sm-4'>
                    <CandidateStatusOverview />
                </div>
                <div className='col-sm-4' >
                    <HiredCandidatesBySource />
                </div>
                <div className='col-sm-4' >
                    <HiringTrend />
                </div>
            </div>
        </div>
    )
}

export default HiringAnalytics