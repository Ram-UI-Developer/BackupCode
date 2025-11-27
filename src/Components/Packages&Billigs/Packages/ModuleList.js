import PackageModuels from './PackageModuels' // Importing the component used to render individual modules
import React from 'react' // Importing React and hooks (only useEffect and useState; useState is currently commented out below)

const ModuleList = ({ modules, showAll, onShowMoreClick }) => {
    // Props:
    // - modules: Array of module objects to display
    // - showAll: Boolean to determine if all modules should be shown
    // - onShowMoreClick: Function to toggle the showAll state in parent component
    // Decide which modules to display based on showAll flag
    const modulesToShow = showAll ? modules : modules.slice(0, 4)

    return (
        <div>
            {/* Render each module using the PackageModuels component */}
            {modulesToShow.map((module) => (
                <div key={module.id}>
                    <PackageModuels module={module} />
                </div>
            ))}

            {/* Conditionally render the 'Show More' or 'Show Less' link if there are more than 4 modules */}
            {modules.length > 4 && (
                <div style={{ textAlign: 'right' }}>
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault() // Prevent default anchor behavior
                            onShowMoreClick() // Call the parent-provided function to toggle showAll
                        }}
                        style={{ color: 'white', cursor: 'pointer' }}
                    >
                        <u>{showAll ? 'Show Less' : '+' + (modules.length - 4) + ' more'}</u>
                    </a>
                </div>
            )}
        </div>
    )
}

export default ModuleList // Export the component for use in other files
