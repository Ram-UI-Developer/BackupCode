// Import necessary modules and components
import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import { FaPhoneAlt } from 'react-icons/fa'
import { MdEmail } from 'react-icons/md'
import ModuleList from './Packages/ModuleList'
import PackageSlabsCount from './Packages/PackageSlabsCount'

const PackageSelection = (props) => {
    // Destructure props
    const { packageSelectionData, onProceedHandler } = props

    // State variables for managing UI and data
    const [data, setData] = useState(packageSelectionData)
    const [selectedPlan, setSelectedPlan] = useState('Free') // Default selected plan
    const [selectedSlabId, setSelectedSlabId] = useState({}) // Store selected slab id for each plan
    const [slabPrice, setSlabPrice] = useState({}) // Store final price (after discount) for each slab
    const [plan, setPlan] = useState(packageSelectionData.find((p) => p.free === true)) // Default plan (Free)
    const [slabTotalPRice, setSlabTotalPRice] = useState({}) // Store total (before discount) price
    const [slabDiscount, setSlabDiscount] = useState({}) // Store discount percentage per plan
    const [forFree, setForFree] = useState({})
    // useEffect to initialize states when component mounts or packageSelectionData updates
    console.log(forFree, 'chekingResponseFrom')
    useEffect(() => {
        const initialSlabSelection = {}
        const initialSlabPrices = {}
        const initialSlabTotalPRice = {}
        const initialSlabDiscounts = {}
        const initialModuleStatus = {}

        // Loop through plans and set defaults
        packageSelectionData.forEach((plan) => {
            initialSlabSelection[plan.name] = plan.slabs[0].id
            initialSlabPrices[plan.name] = plan.slabs[0].afterDiscount
            initialSlabTotalPRice[plan.name] = plan.slabs[0].price
            initialSlabDiscounts[plan.name] = plan.slabs[0].discount
            initialModuleStatus[plan.name] = plan.free
        })

        // Set state values
        setSelectedSlabId(initialSlabSelection)
        setSlabPrice(initialSlabPrices)
        setSlabTotalPRice(initialSlabTotalPRice)
        setSlabDiscount(initialSlabDiscounts)
        setForFree(initialModuleStatus)
        setData(packageSelectionData)
        setPlan(packageSelectionData.find((p) => p.free === true))

        // Set default module visibility
        const initialModulesVisibility = {}
        packageSelectionData.forEach((plan) => {
            initialModulesVisibility[plan.name] = false
        })
        setModulesVisibility(initialModulesVisibility)
    }, [packageSelectionData])

    // Handle slab (user count) selection change
    const handleSlabChange = (e, slabName, price, priceOfSlab, discountFromSlab) => {
        setSlabPrice((prevState) => ({
            ...prevState,
            [plan.name]: price
        }))
        setSlabTotalPRice((prevState) => ({
            ...prevState,
            [plan.name]: priceOfSlab
        }))
        setSlabDiscount((prevState) => ({
            ...prevState,
            [plan.name]: discountFromSlab
        }))
        setSelectedSlabId((prevState) => ({
            ...prevState,
            [plan.name]: slabName
        }))
    }

    // Handle plan card click (select plan and reset slabs)
    const handleCardClick = (plan) => {
        setPlan(plan)
        setSelectedPlan(plan.name === selectedPlan ? null : plan.name)

        // Reset slab selection for all plans
        setSelectedSlabId((prevState) => {
            const updatedSelectedSlabs = { ...prevState }
            packageSelectionData.forEach((p) => {
                updatedSelectedSlabs[p.name] = p.slabs[0].id
            })
            return updatedSelectedSlabs
        })

        // Reset slab prices
        setSlabPrice((prevState) => {
            const updatedSlabPrices = { ...prevState }
            packageSelectionData.forEach((p) => {
                updatedSlabPrices[p.name] = p.slabs[0].afterDiscount
            })
            return updatedSlabPrices
        })

        // Reset total prices
        setSlabTotalPRice((prevState) => {
            const updatedSlabPrices = { ...prevState }
            packageSelectionData.forEach((p) => {
                updatedSlabPrices[p.name] = p.slabs[0].price
            })
            return updatedSlabPrices
        })
    }

    // Toggle module visibility for a specific plan
    const [modulesVisibility, setModulesVisibility] = useState({})
    const handleShowMoreClick = (planName) => {
        setModulesVisibility((prevState) => ({
            ...prevState,
            [planName]: !prevState[planName]
        }))
    }

    // Utility: Format number to INR format with 2 decimal places
    const formatNumber = (number) => {
        if (number == null) return ''
        return new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(number)
    }

    let displayPrice = '0.00'

    if (selectedPlan != null) {
        if (plan && plan.name && formatNumber(slabPrice[plan.name])) {
            displayPrice = formatNumber(slabPrice[plan.name])
        }
    }
    return (
        <>
            {/* Scrollable plan cards section */}
            <div
                className="packageMainCss"
                style={{
                    overflow: data && data.length > 4 ? 'scroll' : '',
                    justifyContent: data && data.length > 4 ? '' : 'center'
                }}
            >
                {data.map((list) => (
                    <div
                        className="pacakageCard"
                        style={{
                            transition: 'transform 2s ease-in-out',
                            flexWrap: 'nowrap'
                        }}
                    >
                        <div
                            className="packageSelectionCard"
                            style={{
                                boxShadow:
                                    selectedPlan === list.name
                                        ? '0px 4px 18px 0px rgba(19, 11, 177, 0.25) inset, 0px 0px 22px 8px #3CB30D'
                                        : '0 2px 5px rgba(0,0,0,0.1)',
                                border: selectedPlan === list.name ? '3px solid #3CB30D;' : '',
                                padding: '20px',
                                borderRadius: '8px',
                                flex: 1
                            }}
                        >
                            {/* Plan Title and Pricing */}
                            <div style={{ marginTop: list.free === true ? '10%' : '10%' }}>
                                <div
                                    style={{
                                        height: '70px',
                                        alignItems: list.free === true ? 'flex-end' : '',
                                        display: list.free === true ? 'flex' : '',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <h6 style={{ textAlign: 'center', color: 'white' }}>
                                        {list.name}
                                    </h6>
                                    {list.free === true ? (
                                        ''
                                    ) : (
                                        <>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                {slabPrice[list.name] ? (
                                                    <>
                                                        <h5
                                                            style={{
                                                                display: 'inline-block',
                                                                color: 'yellow'
                                                            }}
                                                        >
                                                            &#8377;{' '}
                                                            {formatNumber(slabPrice[list.name])}
                                                        </h5>
                                                    </>
                                                ) : (
                                                    <h5
                                                        style={{
                                                            display: 'inline-block',
                                                            color: 'yellow',
                                                            marginLeft: '3.5rem'
                                                        }}
                                                    >
                                                        &#8377; 0.00
                                                    </h5>
                                                )}
                                                <span
                                                    style={{
                                                        display: 'inline-block',
                                                        marginLeft: '5px',
                                                        marginTop: '-10px'
                                                    }}
                                                >
                                                    {' '}
                                                    per user/year
                                                </span>
                                            </div>
                                            {/* issue #1444: adding space */}
                                            <div style={{ height: '1px' }}> </div>
                                            {/* Discount Section */}
                                            <div>
                                                {slabDiscount[list.name] == 0 ? (
                                                    ''
                                                ) : (
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            marginTop: '-1rem',
                                                            justifyContent: 'center'
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                textDecorationLine: 'line-through',
                                                                textDecorationColor: 'red',
                                                                fontSize: '18px'
                                                            }}
                                                        >
                                                            {'(' +
                                                                '₹' +
                                                                formatNumber(
                                                                    slabTotalPRice[list.name]
                                                                ) +
                                                                ')'}
                                                        </div>{' '}
                                                        <div
                                                            style={{
                                                                marginTop: '1%',
                                                                color: 'yellow'
                                                            }}
                                                        >
                                                            {'(' +
                                                                slabDiscount[list.name] +
                                                                '%' +
                                                                ' ' +
                                                                'savings' +
                                                                ')'}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                                {/* Plan Select Button */}
                                <div
                                    style={{
                                        textAlign: 'center',
                                        marginTop: list.free === true ? '12.5%' : '12.5%'
                                    }}
                                >
                                    <Button
                                        variant=""
                                        className="no-hover-effect"
                                        onClick={() => handleCardClick(list)}
                                        style={{
                                            padding: '3% 25% 3% 25%',
                                            backgroundColor:
                                                selectedPlan === list.name ? '#B2FF5B' : 'white',
                                            color: 'black'
                                        }}
                                    >
                                        Select Plan
                                    </Button>
                                </div>

                                {/* Modules List with Show More */}
                                <div
                                    style={{
                                        height: modulesVisibility[list.name] ? 'auto' : '130px',
                                        marginTop: '10%'
                                    }}
                                >
                                    <label style={{ color: 'white' }}>Modules</label>
                                    <ModuleList
                                        modules={list.modules}
                                        showAll={modulesVisibility[list.name]}
                                        onShowMoreClick={() => handleShowMoreClick(list.name)}
                                    />
                                </div>
                                {/* // Render the user count slabs section for the current plan */}
                                <div>
                                    {/* Label for User Count section */}
                                    <label style={{ color: 'white', marginTop: '10%' }}>
                                        User Count
                                    </label>

                                    {/* Loop through each slab in the current plan and render the PackageSlabsCount component */}
                                    {list.slabs.map((count) => (
                                        <div key={count.id}>
                                            <PackageSlabsCount
                                                employeesCount={count} // Pass current slab data (like min/max users, pricing etc.)
                                                selectedSlab={
                                                    selectedSlabId[list.name] || list.slabs[0].id
                                                } // Use selected slab id or default to first
                                                onSlabChange={handleSlabChange} // Callback to handle when slab is changed
                                                isDisabled={list.name !== selectedPlan} // Disable selection if this is not the active (selected) plan
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {
                // Check if there is any data to display
                data.length != 0 ? (
                    // Footer row containing contact info and total payable section
                    <div
                        className="row"
                        style={{
                            justifyContent: 'center',
                            gap: '10px',
                            marginTop: data && data.length > 4 ? '2.5%' : '-1.8%'
                        }}
                    >
                        {/* Contact information section (left side) */}
                        <div className="packeageSlectionFooter1 col-sm-6">
                            Contact Sales &ensp; <FaPhoneAlt /> +91236754231 &ensp; <MdEmail />{' '}
                            sales@workshine.com
                        </div>

                        {/* Total payable and Proceed button (right side) */}
                        <div className="packeageSlectionFooter2 col-sm-6">
                            {/* Display total payable amount based on selected plan and selected slab price */}
                            <span
                                style={{
                                    display: 'inline-block',
                                    float: 'left',
                                    fontWeight: '600'
                                }}
                            >
                                Total payable : &#8377;
                                {/* {displayPrice} */}
                                {!plan
                                    ? '0:00'
                                    : plan && forFree[plan.name] == true
                                      ? '0.00'
                                      : displayPrice}
                            </span>

                            {/* Proceed button triggers onProceedHandler with selected plan and slab info */}
                            <Button
                                variant=""
                                sm={4}
                                style={{
                                    display: 'inline-block',
                                    float: 'right',
                                    backgroundColor: 'white',
                                    color: 'black',
                                    hover: 'none'
                                }}
                                onClick={() =>
                                    onProceedHandler(
                                        selectedPlan == null ? null : plan,
                                        selectedPlan == null
                                            ? null
                                            : plan && selectedSlabId[plan.name]
                                    )
                                }
                            >
                                Proceed
                            </Button>
                        </div>
                    </div>
                ) : (
                    ''
                ) // If no data, render nothing
            }
        </>
    )
}
export default PackageSelection
