import React, { useEffect, useRef } from 'react'

const IndeterminateCheckboxSelect = ({ checked, onChange, indeterminate }) => {
    const ref = useRef(null)
    useEffect(() => {
        if (typeof indeterminate === 'boolean') {
            ref.current.indeterminate = indeterminate
        }
    }, [ref, indeterminate])
    return <input ref={ref} type="checkbox" checked={checked} onChange={onChange} />
}

export default IndeterminateCheckboxSelect
