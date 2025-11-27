import React from 'react' // Import React and useState (though useState is not used here)

// Functional component to render a single employee count slab as a radio button
const PackageSlabsCount = ({ employeesCount, selectedSlab, onSlabChange, isDisabled }) => {
    return (
        <div>
            {/* Radio input for selecting a specific employee slab */}
            <input
                type="radio"
                name={`employeesSlab-${employeesCount.id}`} // Unique name per slab to group radios correctly
                value={employeesCount.id} // Value set to the slab's ID
                checked={selectedSlab === employeesCount.id} // Checked if this slab is currently selected
                onChange={(e) =>
                    onSlabChange(
                        e,
                        employeesCount.id, // ID of the slab
                        employeesCount.afterDiscount, // Discounted price
                        employeesCount.price, // Original price
                        employeesCount.discount, // Discount amount or percentage
                        employeesCount
                    )
                }
                disabled={isDisabled} // Disable the input if isDisabled is true
            />
            &ensp; {/* Adds a bit of horizontal space between the input and the text */}
            {/* Display the range of employees for the slab */}
            <span>
                {employeesCount.fromRange}-{employeesCount.toRange}
            </span>
        </div>
    )
}

export default PackageSlabsCount // Export the component so it can be used elsewhere
