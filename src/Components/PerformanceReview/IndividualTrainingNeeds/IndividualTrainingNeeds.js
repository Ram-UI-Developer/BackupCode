import React from 'react' // Importing React and the useState hook (though useState is not used in this component)
import TrainingNeedList from './TrainingNeedList' // Importing the TrainingNeedList component, which is used to display the training needs

const IndividualTrainingNeeds = ({
    apprisalForm,
    managerPrevieew,
    readOnly,
    peer,
    employee,
    manager,
    isHr,
    isCompleted
}) => {
    // Component receiving several props for handling the training needs data and user interactions

    return (
        <div>
            {/* Section wrapper with styling for the layout */}
            <section className="section">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="">
                                {/* Rendering the TrainingNeedList component with all the passed props */}
                                {/* This component handles the logic for displaying and managing the training needs for an individual */}
                                <TrainingNeedList
                                    isCompleted={isCompleted} // Prop to indicate if the task is completed
                                    managerPrevieew={managerPrevieew} // Prop indicating whether the manager's preview is enabled
                                    readOnly={readOnly} // Prop to make the form read-only if true
                                    peer={peer} // Peer-related data for training needs (likely from the peer review process)
                                    manager={manager} // Manager-related data for training needs
                                    employee={employee} // Employee data
                                    isHr={isHr} // Boolean flag to indicate if the user is an HR
                                    apprisalForm={apprisalForm} // The apprisal form data
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
export default IndividualTrainingNeeds
