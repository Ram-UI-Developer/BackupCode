import React from 'react'
import './DetailLoader.css'

const DetailLoader = () => {
    return (
        <div className="blurred">
            {/* loader with blur background */}
            <div className="loader-container">
                <div className="loader"></div>
            </div>
        </div>
    )
}

export default DetailLoader
