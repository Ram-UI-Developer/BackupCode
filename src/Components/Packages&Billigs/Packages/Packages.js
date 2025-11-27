import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import DetailLoader from '../../../Common/CommonComponents/Loaders/DetailLoader'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import { getAllWithoutToken, save } from '../../../Common/Services/CommonService'
import { packageUpgrade } from '../../../Common/Services/OtherServices'
import PackageSelection from '../PackageSelection'

const Packages = () => {
    const userDetails = useSelector((state) => state.user.userDetails) // Get userdetails form redux

    const [packages, setPackages] = useState([]) // State for all packages
    const [isLoading, setIsLoading] = useState(true) // State for loader

    const navigate = useNavigate()
    const location = useLocation().state // get data through previous page

    //Fetching api for Renewal package and navigate to next page
    const onRenewalHandler = (plan, slabId) => {
        setIsLoading(true)
        const slab = plan.slabs.find((item) => item.id == slabId)
        const obj = {
            organizationId: userDetails.organizationId,
            packageId: plan.id,
            packageName: plan.name,
            slabId: slabId,
            fromRange: slab.fromRange,
            toRange: slab.toRange,
            total: plan.total,
            discount: slab.discounts[slab.discounts.length - 1].value,
            afterDiscount: slab.afterDiscount
        }

        save({ entity: 'subscriptions', organizationId: userDetails.organizationId, body: obj })
            .then((res) => {
                if (res) {
                    if (res.statusCode == 200) {
                        navigate(
                            `/subscriptionPayment?id=${res.data.id}&&organizationId=${res.data.organizationId}`,
                            { state: { plan: plan } }
                        )
                    }
                }
            })
            .catch(() => {
                setIsLoading(false)
            })
    }

    //Fetching api for Upgrade package and navigate to next page
    const onUpgradeHandler = (plan, slabId) => {
        setIsLoading(true)
        const slab = plan.slabs.find((item) => item.id == slabId)
        const obj = {
            organizationId: userDetails.organizationId,
            packageId: plan.id,
            packageName: plan.name,
            slabId: slabId,
            fromRange: slab.fromRange,
            toRange: slab.toRange,
            total: plan.total,
            discount: slab.discounts[slab.discounts.length - 1].value,
            afterDiscount: slab.afterDiscount
        }

        packageUpgrade({
            entity: 'subscriptions',
            organizationId: userDetails.organizationId,
            body: obj
        })
            .then((res) => {
                if (res) {
                    if (res.statusCode == 200) {
                        navigate(
                            `/subscriptionPayment?id=${res.data.id}&&organizationId=${res.data.organizationId}`,
                            { state: { plan: plan } }
                        )
                    }
                }
            })
            .catch(() => {
                setIsLoading(false)
            })
    }

    // using login and id and onclick perameters performing actions (eg: renuwal,new user, ...)
    const onProceedHandler = (plan, id) => {
        if (id) {
            if (userDetails && userDetails.organizationId) {
                if (location && location.type && location.type == 'renewal') {
                    onRenewalHandler(plan, id)
                } else {
                    onUpgradeHandler(plan, id)
                }
            } else if (location) {
                navigate('/subscriber', { state: { plan: plan, slabId: id } })
            } else {
                navigate('/subscription', { state: { plan: plan, slabId: id } })
            }
        } else {
            toast.info('Please select atleast one package')
        }
    }

    // Fetch packages when componet mount
    useEffect(() => {
        onGetHandler()
    }, [])

    const onGetHandler = () => {
        getAllWithoutToken({ entity: 'packages/home' })
            .then((res) => {
                setIsLoading(false)
                if (res.statusCode == 200) {
                    const activePackages = res.data.filter(
                        (item) => item.active && item.slabs && item.slabs.length > 0
                    )
                    const withoutFreePackages = activePackages.filter((item) => !item.free)
                    setPackages(location && location.payment ? withoutFreePackages : activePackages) // #1704 : if payment is true then show only paid packages
                }
            })
            .catch(() => {
                setIsLoading(false)
            })
    }

    return (
        <div className="mb-5">
            {isLoading ? <DetailLoader /> : ''}
            <PageHeader pageTitle="Packages" />
            <div className="packages">
                <div
                    className="package-wrapper"
                    style={{ marginTop: location ? location.top : '0px' }}
                >
                    <>
                        <PackageSelection
                            packageSelectionData={packages}
                            onProceedHandler={onProceedHandler}
                            subscriptionInfo={
                                location && location.subscriptionHistory
                                    ? location.subscriptionHistory
                                    : {}
                            }
                        />
                    </>
                </div>
            </div>
        </div>
    )
}

export default Packages
