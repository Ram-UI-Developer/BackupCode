import React from 'react' // Importing React to use JSX and build the component

const TrainingNeed = (props) => {
    return (
        <div>
            {/* Wrapper div for the training need row */}
            <div style={{ marginLeft: '5%' }}>
                {/* Table to display training need details */}
                <table>
                    {/* Table row to display one set of data for the training need */}
                    <tr>
                        {/* Displaying the index (likely for row numbering or identification) */}
                        <td style={{ textAlign: 'center' }}>{props.index}</td>
                        {/* Displaying the 'trainingNeed' from the data prop, in a text input field with default value */}
                        <td>
                            {' '}
                            <input defaultValue={props.data.trainingNeed} />
                        </td>
                        {/* Displaying the 'whenRequired' from the data prop, in a text input field with default value */}
                        <td>
                            <input defaultValue={props.data.whenRequired} />
                        </td>
                        {/* Displaying the 'approximateDuration' from the data prop, in a text input field with default value */}
                        <td>
                            <input defaultValue={props.data.approximateDuration} />
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    )
}
export default TrainingNeed
