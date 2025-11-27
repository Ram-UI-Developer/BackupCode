import React from 'react'

const WYSIWYGContent = ({ content }) => {
    const cleanContent = (html) => {
        //clearing the unwanted spaces in the content
        return html.replace(/style="[^"]*"/g, '')
    }

    const getDisplayContent = () => {
        //handling the content to display
        const words = content.split(' ')
        const slicedContent = words.slice(0, 10).join(' ')
        return cleanContent(slicedContent)
    }

    return (
        <div>
            <div
                className="announcementBody"
                dangerouslySetInnerHTML={{ __html: getDisplayContent() }}
            />
        </div>
    )
}

export default WYSIWYGContent
