import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { TITLE } from '../../reducers/constants'

const PageHeader = ({ pageTitle }) => {
    const dispatch = useDispatch() // declere usedispatch

    // set page tile to localstorage
    useEffect(() => {
        localStorage.setItem('title', pageTitle)
    }, [])

    // store pagetitle using redux
    useEffect(() => {
        dispatch({
            type: TITLE,

            payload: pageTitle
        })
    })

    return (
        <>
            <div style={{ marginTop: '28px' }}></div>
        </>
    )
}

export default PageHeader
