import React from 'react' // Importing React to use JSX

// Functional component to render a single module item
const PackageModuels = ({ module }) => {
    return (
        // Container div styled with flex to align image and text horizontally
        <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* Display a small package icon before the module name */}
            <img
                src="/dist/Images/packageMark.png" // Path to the package icon image
                height="10px" // Image height
                style={{ marginRight: '8px' }} // Adds space between image and text
            />

            {/* Display the module name in a list item */}
            <li>{module.name}</li>
        </div>
    )
}

export default PackageModuels // Export the component for use in other files
