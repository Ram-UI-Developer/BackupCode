import React, { useEffect, useState } from 'react'
import { Form } from 'react-bootstrap'

// The DragAndDrop component allows users to drag and drop items between two lists.
// It accepts props for managing data, validation, and form errors, among others.
const DragAndDrop = ({
    data = [],
    updateData = [],
    setUpdateData = [],
    setData = [],
    formErrors,
    percentageCalc,
    totalPercentage,
    componentId,
    formData,
    validate1,
    validate2,
    validate3,
    setFormErrors
}) => {
    // State to hold the list of items in both "dragged" and "dropped" lists
    const [items, setItems] = useState(updateData) // Items currently in the "dropped" list (list1)
    const [items1, setItems1] = useState([]) // Items that are available to be dragged (list2)
    const [draggedItem, setDraggedItem] = useState(null) // The item that is currently being dragged
    const [inputValue, setInputValue] = useState('') // Value of the search input field
    const [filteredData, setFilteredData] = useState(items1) // Data filtered based on search input

    // Utility function to remove duplicate items from an array based on 'id'
    const removeDuplicates = (array) => {
        const seen = new Set()
        return array.filter((item) => {
            const isDuplicate = seen.has(item.id)
            seen.add(item.id)
            return !isDuplicate
        })
    }

    // useEffect hook to update items and filtered data whenever data or updateData changes
    useEffect(() => {
        setItems(updateData) // Updates items when updateData changes
        setItems1(
            removeDuplicates(data.filter((item) => !updateData.some((i) => i.id === item.id)))
        ) // Updates available items for dragging
        setFilteredData(data.filter((item) => !updateData.some((i) => i.id === item.id))) // Filters data based on updateData
    }, [data, updateData])

    const [action, setAction] = useState('') // Tracks the action being performed, used for percentage calculation
    useEffect(() => {
        // Calls percentageCalc when the "Drag" action occurs (indicating an item was dragged)
        if (action === 'Drag') {
            percentageCalc()
        }
    }, [items])

    // Handle the start of a drag event
    const onDragStart = (e, item) => {
        e.dataTransfer.setData('application/json', JSON.stringify(item)) // Set the dragged item data
        setDraggedItem(item) // Set the dragged item in state
    }

    // Handle the end of a drag event
    const onDragEnd = () => {
        setDraggedItem(null) // Clear the dragged item from state
    }

    // Function to handle filtering based on user input in the search box
    const handleFilter = (input) => {
        const filtered = items1
            .filter((item) =>
                Object.values(item).some((val) =>
                    String(val).toLowerCase().includes(input.toLowerCase())
                )
            )
            .sort((a, b) => a.headName - b.headName) // Sort the filtered data (can modify the sorting as required)
        setFilteredData(filtered) // Update the filtered data state
    }

    // Function to handle changes in the search input field
    const handleChange = (e) => {
        const value = e.target.value
        setInputValue(value) // Update the input value state
        handleFilter(value) // Trigger filtering of data
    }

    const [required, setRequired] = useState([]) // Holds items that are already in the list to prevent duplicates

    // Handles the drop event when an item is dropped into a list
    const onDropEvent = (e, targetList) => {
        e.preventDefault()
        if (draggedItem) {
            // Validation before allowing the drop
            if (formData.fromRange === undefined) {
                setFormErrors(validate1(formData)) // Validate "fromRange"
            } else if (formData.toRange === undefined) {
                setFormErrors(validate2(formData)) // Validate "toRange"
            } else if (componentId === undefined) {
                setFormErrors(validate3(formData)) // Validate "componentId"
            } else if (
                targetList === 'list1' &&
                items.some((item) => item.headId === draggedItem.headId)
            ) {
                // If the item is already in the list, set an error
                setRequired(items.filter((item) => item.headId === draggedItem.headId))
            } else if (
                targetList === 'list1' &&
                !items.some((item) => item.id === draggedItem.id)
            ) {
                // If it's a valid drop to list1 (dropped list), update the lists accordingly
                setRequired([])
                setAction('Drag')
                setItems((prevItems) => removeDuplicates([...prevItems, draggedItem])) // Add item to list1
                setItems1((prevItems1) =>
                    removeDuplicates(prevItems1.filter((item) => item.id !== draggedItem.id))
                ) // Remove item from list2
                setUpdateData((prevItems) => removeDuplicates([...prevItems, draggedItem])) // Update the updateData
                setData((prevItems1) =>
                    removeDuplicates(prevItems1.filter((item) => item.id !== draggedItem.id))
                ) // Update the data
            } else if (
                targetList === 'list2' &&
                !items1.some((item) => item.id === draggedItem.id)
            ) {
                // If it's a valid drop to list2 (available list), update the lists accordingly
                setAction('Drag')
                setItems1((prevItems1) => removeDuplicates([...prevItems1, draggedItem])) // Add item to list2
                setItems((prevItems) =>
                    removeDuplicates(prevItems.filter((item) => item.id !== draggedItem.id))
                ) // Remove item from list1
                setUpdateData((prevItems) =>
                    removeDuplicates(prevItems.filter((item) => item.id !== draggedItem.id))
                ) // Update the updateData
                setData((prevItems1) => removeDuplicates([...prevItems1, draggedItem])) // Update the data
            }
        }
    }

    // Function to determine if an item is allowed to be dragged over a specific list (based on conditions)
    const allowedDragable = (e, action) => {
        e.preventDefault()
        if (draggedItem) {
            // If the dragged item is not already in the list, allow the drop
            if (action === 'list1' && !items.some((item) => item.id === draggedItem.id)) {
                e.dataTransfer.dropEffect = 'move' // Indicate that the drop action is a "move"
            } else if (action === 'list2' && !items1.some((item) => item.id === draggedItem.id)) {
                e.dataTransfer.dropEffect = 'move' // Indicate that the drop action is a "move"
            } else {
                e.dataTransfer.dropEffect = 'none' // Disallow the drop
            }
        } else {
            e.dataTransfer.dropEffect = 'none' // Disallow the drop if no item is being dragged
        }
    }

    return (
        <div>
            <div className="row">
                {/* List 2: Items that can be dragged */}
                <div
                    style={{
                        overflowX: filteredData.length >= 7 ? 'auto' : '',
                        overflowY: filteredData.length >= 7 ? 'scroll' : ''
                    }}
                    className="col-5 card dragCard horizontal-container"
                    onDrop={(e) => onDropEvent(e, 'list2')}
                    onDragOver={(e) => allowedDragable(e, 'list2')}
                >
                    <Form.Control
                        type="text"
                        value={inputValue}
                        onChange={handleChange}
                        placeholder="Search..."
                        className="searchGlass"
                    />
                    {filteredData.map((item) => (
                        <div
                            key={item.id}
                            className="listItem"
                            draggable
                            onDragStart={(e) => onDragStart(e, item)}
                            onDragEnd={onDragEnd}
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

                {/* List 1: Dropped items */}
                <div
                    style={{
                        marginLeft: '1%',
                        overflowX: items.length >= 7 ? 'auto' : '',
                        overflowY: items.length >= 7 ? 'scroll' : ''
                    }}
                    className="col-5 card dragCard horizontal-container"
                    onDrop={(e) => onDropEvent(e, 'list1')}
                    onDragOver={(e) => totalPercentage <= 100 && allowedDragable(e, 'list1')}
                >
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

                {/* Display error message if a duplicate item was added */}
                {required.length !== 0 && (
                    <p style={{ marginLeft: '50%' }} className="error">
                        {required.length === 0 ? [] : required[0].headName} Component Already
                        Existed
                    </p>
                )}

                {/* Display any form error related to earnings */}
                <p style={{ marginLeft: '50%' }} className="error">
                    {formErrors.earnings}
                </p>
            </div>
        </div>
    )
}

export default DragAndDrop
