import React, { useEffect, useState } from 'react' // Importing necessary React hooks
import { Form } from 'react-bootstrap' // Importing Bootstrap Form component for rendering form elements

// Main functional component for drag-and-drop functionality
const DragAndDropDed = ({
    data = [], // Data to be displayed in the left column (the list from which items are dragged)
    updateData = [], // Data to be displayed in the right column (the list where items are dropped)
    setList = [], // State update function to set the left list data
    setListUpdateData = [], // State update function to set the updated list data
    formErrors, // Object containing form errors to display
    totalPercentage, // Total percentage, used for validation before dragging into the right list
    percentageCalc, // Function to calculate percentages on drop
    componentId, // ID of the component for validation
    formData, // The data associated with the form (e.g., ranges, etc.)
    validate1,
    validate2,
    validate3, // Validation functions for different conditions
    setFormErrors // Function to set form errors
}) => {
    // State hooks for various parts of the component
    const [items, setItems] = useState(updateData) // State to hold items in the right list (dropped items)
    const [items1, setItems1] = useState([]) // State to hold items in the left list (not yet dropped)
    const [draggedItem, setDraggedItem] = useState(null) // State to hold the current item being dragged
    const [inputValue, setInputValue] = useState('') // State to handle input value for filtering
    const [filteredData, setFilteredData] = useState(items1) // State for the filtered items in the left list

    // useEffect hook to handle updates when the `data` or `updateData` change
    useEffect(() => {
        // Set `items` and `items1` based on `updateData` and `data`
        setItems(updateData)
        setItems1(data.filter((item) => !updateData.some((i) => i.id === item.id))) // Set items1 to only items not in `updateData`
        setFilteredData(data.filter((item) => !updateData.some((i) => i.id === item.id))) // Filter out items already in `updateData`
    }, [data, updateData])

    const [action, setAction] = useState('') // State to track the current action (e.g., drag)
    useEffect(() => {
        // Call percentage calculation if dragging action occurs
        if (action === 'Drag') {
            percentageCalc() // Update percentage calculation when items are dragged
        }
    }, [items]) // Dependency array ensures this effect runs when `items` changes

    // Function that is triggered when an item starts being dragged
    const onDragStart = (e, item) => {
        e.dataTransfer.setData('application/json', JSON.stringify(item)) // Store the dragged item data in the event
        setDraggedItem(item) // Set the dragged item state
    }

    // Function that is triggered when the dragging ends
    const onDragEnd = () => {
        setDraggedItem(null) // Reset dragged item state
    }

    // Function to filter the left list based on the user's input
    const handleFilter = (input) => {
        const filtered = items1
            .filter((item) =>
                Object.values(item).some(
                    (val) => String(val).toLowerCase().includes(input.toLowerCase()) // Check if any value matches the input
                )
            )
            .sort((a, b) => a.headName - b.headName) // Sort by `headName` (or any other property)

        setFilteredData(filtered) // Update the filtered data
    }

    // Handle input change for the search filter
    const handleChange = (e) => {
        const value = e.target.value
        setInputValue(value) // Update the input value state
        handleFilter(value) // Filter the data based on the input value
    }

    const [required, setRequired] = useState([]) // State to track if an item already exists in the list

    // Event triggered when an item is dropped into a list
    const onDropEvent = (e, targetList) => {
        e.preventDefault() // Prevent default behavior for drop event
        if (draggedItem) {
            // Perform form validations before allowing the item to be dropped
            if (formData.fromRange == undefined) {
                setFormErrors(validate1(formData)) // Call validate1 if `fromRange` is undefined
            } else if (formData.toRange == undefined) {
                setFormErrors(validate2(formData)) // Call validate2 if `toRange` is undefined
            } else if (componentId == undefined) {
                setFormErrors(validate3(formData)) // Call validate3 if `componentId` is undefined
            }
            // Handle list1 (right side) drop event
            else if (
                targetList === 'list1' &&
                items.some((item) => item.headId === draggedItem.headId)
            ) {
                setRequired(
                    items.filter((item) => {
                        if (item.headId == draggedItem.headId) {
                            return item // Prevent duplicates based on headId
                        }
                    })
                )
            }
            // Handle list1 (right side) drop if the item is not already there
            else if (targetList === 'list1' && !items.some((item) => item.id === draggedItem.id)) {
                setAction('Drag') // Set action to "Drag" to trigger percentage calculation
                // Update state for lists and data to handle drag-and-drop
                setItems((prevItems) => removeDuplicates([...prevItems, draggedItem]))
                setItems1((prevItems1) =>
                    removeDuplicates(prevItems1.filter((item) => item.id !== draggedItem.id))
                )
                setList((prevItems1) =>
                    removeDuplicates(prevItems1.filter((item) => item.id !== draggedItem.id))
                )
                setListUpdateData((prevItems) => removeDuplicates([...prevItems, draggedItem]))
            }
            // Handle list2 (left side) drop if the item is not already there
            else if (targetList === 'list2' && !items1.some((item) => item.id === draggedItem.id)) {
                setAction('Drag')
                setItems1((prevItems1) => removeDuplicates([...prevItems1, draggedItem]))
                setItems((prevItems) =>
                    removeDuplicates(prevItems.filter((item) => item.id !== draggedItem.id))
                )
                setList((prevItems1) => removeDuplicates([...prevItems1, draggedItem]))
                setListUpdateData((prevItems) =>
                    removeDuplicates(prevItems.filter((item) => item.id !== draggedItem.id))
                )
            }
        }
    }

    // Function to manage the allowed drop action based on the target list
    const allowedDragable = (e, action) => {
        e.preventDefault() // Prevent default behavior for dragover event
        if (draggedItem) {
            if (action === 'list1' && !items.some((item) => item.id === draggedItem.id)) {
                e.dataTransfer.dropEffect = 'move' // Allow drop if the item is not already in list1
            } else if (action === 'list2' && !items1.some((item) => item.id === draggedItem.id)) {
                e.dataTransfer.dropEffect = 'move' // Allow drop if the item is not already in list2
            } else {
                e.dataTransfer.dropEffect = 'none' // Prevent drop if conditions are not met
            }
        } else {
            e.dataTransfer.dropEffect = 'none' // Prevent drop if no item is being dragged
        }
    }

    // Utility function to remove duplicates based on item id
    const removeDuplicates = (array) => {
        const seen = new Set()
        return array.filter((item) => {
            const isDuplicate = seen.has(item.id) // Check if the item id is already seen
            seen.add(item.id) // Add item id to the set
            return !isDuplicate // Only include items that are not duplicates
        })
    }

    return (
        <div>
            <div className="row">
                {/* Left side list container */}
                <div
                    style={{
                        overflowX: filteredData.length >= 7 ? 'auto' : '',
                        overflowY: filteredData.length >= 7 ? 'scroll' : ''
                    }}
                    className="col-5 card dragCard horizontal-container"
                    onDrop={(e) => onDropEvent(e, 'list2')} // Handle drop on the left list
                    onDragOver={(e) => allowedDragable(e, 'list2')} // Allow drag over if drop is valid
                >
                    {/* Input for search/filter */}
                    <Form.Control
                        type="text"
                        value={inputValue}
                        onChange={handleChange} // Update input value on change
                        placeholder="Search..."
                        className="searchGlass"
                    />
                    {/* Render filtered data as items */}
                    {filteredData.map((item) => (
                        <div
                            key={item.id}
                            className="listItem"
                            draggable
                            onDragStart={(e) => onDragStart(e, item)} // Trigger drag start event
                            onDragEnd={onDragEnd} // Trigger drag end event
                        >
                            <img
                                src="/dist/OceanImages/dragleft.png"
                                height={'18px'}
                                alt="drag icon"
                            />{' '}
                            {item.name}
                        </div>
                    ))}
                </div>

                {/* Right side list container */}
                <div
                    className="col-5 card dragCard horizontal-container"
                    style={{
                        marginLeft: '1%',
                        overflowX: items.length >= 7 ? 'auto' : '',
                        overflowY: items.length >= 7 ? 'scroll' : ''
                    }}
                    onDrop={(e) => onDropEvent(e, 'list1')} // Handle drop on the right list
                    onDragOver={(e) => totalPercentage <= 100 && allowedDragable(e, 'list1')} // Allow drag over if totalPercentage is within limits
                >
                    {/* Render items in the right list */}
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="droplistItem"
                            draggable
                            onDragStart={(e) => onDragStart(e, item)}
                            onDragEnd={onDragEnd}
                        >
                            <img
                                src="/dist/OceanImages/dragright.png"
                                height={'20px'}
                                alt="drag icon"
                            />{' '}
                            {item.name}
                        </div>
                    ))}
                </div>

                {/* Display error message if a duplicate item is found */}
                {required.length !== 0 ? (
                    <p style={{ marginLeft: '50%' }} className="error">
                        {required[0].headName} Component Already Existed
                    </p>
                ) : (
                    ''
                )}

                {/* Display form error for deductions */}
                <p style={{ marginLeft: '50%' }} className="error">
                    {formErrors.deductions}
                </p>
            </div>
        </div>
    )
}

export default DragAndDropDed
