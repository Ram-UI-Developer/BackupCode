import React, { useEffect, useState } from 'react'
import { Form } from 'react-bootstrap'
import { toast } from 'react-toastify'

// PackageSubscription component
const PackageSubscription = ({
    data = [],
    updateData = [],
    total,
    setTotal,
    setUpdateData = [],
    setData = []
}) => {
    // State hooks to manage the items, dragged items, and filtered data
    const [items, setItems] = useState(updateData) // Items that are selected by the user
    const [items1, setItems1] = useState([]) // Available items to choose from
    const [draggedItem, setDraggedItem] = useState(null) // Store the item currently being dragged
    const [inputValue, setInputValue] = useState('') // Store the search input value
    const [filteredData, setFilteredData] = useState(items1) // Filtered items based on the search input

    // Utility function to remove duplicate items based on their 'id'
    const removeDuplicates = (array) => {
        const seen = new Set()
        return array.filter((item) => {
            const isDuplicate = seen.has(item.id)
            seen.add(item.id)
            return !isDuplicate
        })
    }

    useEffect(() => {
        // Update items and items1 when the 'data' or 'updateData' changes
        setItems(updateData)
        setItems1(
            removeDuplicates(data.filter((item) => !updateData.some((i) => i.id === item.id)))
        )
        setFilteredData(data.filter((item) => !updateData.some((i) => i.id === item.id)))
    }, [data, updateData])

    useEffect(() => {
        // Calculate the total price of selected items whenever 'items' changes
        const initialTotalPrice = items.reduce((sum, current) => sum + current.price, 0)
        setTotal(initialTotalPrice)
    }, [items])

    // Drag event handlers
    const onDragStart = (e, item) => {
        e.dataTransfer.setData('application/json', JSON.stringify(item)) // Store the dragged item in the dataTransfer object
        setDraggedItem(item) // Store the dragged item in the state
    }

    const onDragEnd = () => {
        setDraggedItem(null) // Reset dragged item when dragging ends
    }

    // Handle the filtering of items based on the search input value
    const handleFilter = (input) => {
        const filtered = items1
            .filter((item) =>
                Object.values(item).some((val) =>
                    String(val).toLowerCase().includes(input.toLowerCase())
                )
            )
            .sort((a, b) => a.headName - b.headName) // Sort the filtered data (in this case, by 'headName')
        setFilteredData(filtered) // Update filteredData state
    }

    const handleChange = (e) => {
        const value = e.target.value
        setInputValue(value) // Update search input value
        handleFilter(value) // Filter the items based on the new input value
    }

    // State to keep track of mandatory items

    // Handle the drop event when dragging items between lists
    const onDropEvent = (e, targetList) => {
        e.preventDefault() // Prevent default behavior of the drop
        if (draggedItem) {
            if (targetList === 'list1' && !items.some((item) => item.id === draggedItem.id)) {
                // If the item is dropped into 'list1' (Selected Modules) and it's not already in 'items'
                setItems((prevItems) => removeDuplicates([...prevItems, draggedItem])) // Add item to 'items'
                setItems1((prevItems1) =>
                    removeDuplicates(prevItems1.filter((item) => item.id !== draggedItem.id))
                ) // Remove item from 'items1'
                setUpdateData((prevItems) => removeDuplicates([...prevItems, draggedItem])) // Add item to 'updateData'
                setData((prevItems1) =>
                    removeDuplicates(prevItems1.filter((item) => item.id !== draggedItem.id))
                ) // Remove item from 'data'
            } else if (
                targetList === 'list2' &&
                !items1.some((item) => item.id === draggedItem.id)
            ) {
                // If the item is dropped into 'list2' (Available Modules) and it's not already in 'items1'
                setItems1((prevItems1) => removeDuplicates([...prevItems1, draggedItem])) // Add item to 'items1'
                setItems((prevItems) =>
                    removeDuplicates(prevItems.filter((item) => item.id !== draggedItem.id))
                ) // Remove item from 'items'
                setUpdateData((prevItems) =>
                    removeDuplicates(prevItems.filter((item) => item.id !== draggedItem.id))
                ) // Remove item from 'updateData'
                setData((prevItems1) => removeDuplicates([...prevItems1, draggedItem])) // Add item to 'data'
            }
            const newTotalPrice = items.reduce((sum, current) => sum + current.price, 0) // Calculate the new total price
            setTotal(newTotalPrice) // Update the total price
        }
    }

    let toastShown = false

    // Handle drag events when dragging items between lists
    const allowedDragable = (e, action) => {
        e.preventDefault() // Prevent default behavior of the drag
        if (draggedItem) {
            if (draggedItem.required) {
                e.dataTransfer.dropEffect = 'none' // Prevent drag if item is mandatory
                if (!toastShown) {
                    toast.error(
                        'Mandatory modules cannot be removed from the selected modules list'
                    ) // Show toast if a mandatory item is being dragged
                    toastShown = true // Set the flag to true so it doesn't show again
                }
                return
            } else if (action === 'list1' && !items.some((item) => item.id === draggedItem.id)) {
                e.dataTransfer.dropEffect = 'move' // Allow drop in 'list1' if item is not already in 'items'
            } else if (action === 'list2' && !items1.some((item) => item.id === draggedItem.id)) {
                e.dataTransfer.dropEffect = 'move' // Allow drop in 'list2' if item is not already in 'items1'
            } else {
                e.dataTransfer.dropEffect = 'none' // Disallow drop if the conditions are not met
            }
        } else {
            e.dataTransfer.dropEffect = 'none' // Disallow drop if no item is being dragged
        }
    }

    // Format number to the Indian currency style (with commas and two decimal places)
    const formatNumber = (number) => {
        if (number == null) return ''
        return new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(number)
    }

    return (
        <div>
            <div className="row">
                <div className="row">
                    <label className="col-sm-6">Available Modules</label>
                    <label className="col-sm-6" style={{ position: 'relative', left: '1%' }}>
                        Selected Modules
                    </label>
                </div>

                {/* Left Div (Available Modules) */}
                <div
                    style={{
                        overflowX: filteredData.length >= 7 ? 'auto' : '',
                        overflowY: filteredData.length >= 7 ? 'scroll' : ''
                    }}
                    className="col-sm-6 card dragCard horizontal-container"
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

                {/* Right Div (Selected Modules) */}
                <div
                    style={{
                        overflowX: items.length >= 7 ? 'auto' : '',
                        overflowY: items.length >= 7 ? 'scroll' : ''
                    }}
                    className="col-sm-6 card dragCard horizontal-container"
                    onDrop={(e) => onDropEvent(e, 'list1')}
                    onDragOver={(e) => allowedDragable(e, 'list1')}
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

                <div className="" style={{ display: 'flex', flexDirection: 'row-reverse' }}>
                    <div className="packageTotal">
                        <span style={{ fontSize: '20px' }}>Subscription cost </span>(per user/year)
                        : &#8377; {formatNumber(total ? total : 0)}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PackageSubscription
