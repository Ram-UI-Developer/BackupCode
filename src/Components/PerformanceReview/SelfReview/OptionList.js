import React from 'react' // Importing React library to build the component
import Select from 'react-select' // Importing the Select component from react-select for dropdown functionality

// OptionList component that renders a select dropdown for rating options
const OptionList = ({ name, selectedValue, onChangeHandler,  readOnly }) => {
    // List of rating options to display in the select dropdown
    const ratingOptions = [
        {
            value: 1,
            label: 'Poor (1)' // Rating option for Poor with a value of 1
        },
        {
            value: 2,
            label: 'Needs Improvement (2)' // Rating option for Needs Improvement with a value of 2
        },
        {
            value: 3,
            label: 'Below Expectations(3)' // Rating option for Below Expectations with a value of 3
        },
        {
            value: 4,
            label: 'Meets expectation(4)' // Rating option for Meets Expectation with a value of 4
        },
        {
            value: 5,
            label: 'Exceeds Expectations (5)' // Rating option for Exceeds Expectations with a value of 5
        }
    ]

    return (
        <>
            {/* Select component to allow user to pick a rating, with conditional disabling based on readOnly */}
            <Select
                isDisabled={readOnly} // If readOnly is true, the select dropdown will be disabled
                onChange={(e) => onChangeHandler(e, name)} // The handler function is called when a new value is selected
                options={ratingOptions} // The options for the dropdown are provided here
                id={ratingOptions.map((item, index) => index + 1)} // Dynamic ID based on rating options (though this may not be ideal as IDs should be unique, the mapping here might lead to duplicates)
                name={name} // The name prop is used to identify the select element in forms
                value={
                    selectedValue
                        ? ratingOptions.filter((e) => e.value == selectedValue)
                        : { label: 'Choose Rating' }
                } // Sets the value of the dropdown based on selectedValue prop, defaults to "Choose Rating" if no value is selected
            />
        </>
    )
}

export default OptionList // Exporting the OptionList component for use in other parts of the application
