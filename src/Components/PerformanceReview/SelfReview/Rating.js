import React from 'react' // Importing React to build the component
import OptionList from './OptionList' // Importing the OptionList component to use for displaying the rating dropdown

// Rating component that renders a title label and a rating select dropdown
const Rating = (props) => {
    return (
        <div>
            {/* Wrapper div for the rating section */}
            <div className="row">
                {' '}
                {/* Bootstrap row for layout */}
                <div className="col-sm-6 mb-3">
                    {' '}
                    {/* Left column to display the title */}
                    <label>{props.data.title}</label>{' '}
                    {/* Displaying the title passed in through props */}
                </div>
                <div className="col-sm-6">
                    {' '}
                    {/* Right column to display the OptionList dropdown */}
                    <OptionList value={props.data.rate} mngRate={props.data.mngRate} />{' '}
                    {/* Passing data for rate and mngRate to OptionList */}
                </div>
            </div>
        </div>
    )
}

export default Rating // Exporting the Rating component for use in other parts of the application
