import React, { useState } from 'react'
import { Modal } from 'react-bootstrap'

const SeeMore = ({ content, length }) => {
    const [show, setShow] = useState(false) // State for Modal

    // cleaing content
    const cleanContent = (html) => {
        return html.replace(/style="[^"]*"/g, '')
    }

    // displaying content
    const getDisplayContent = () => {
        const words = content.split(' ')
        const slicedContent = words.join(' ')
        return cleanContent(slicedContent)
    }

    // Show modal
    const onShowHandler = () => {
        setShow(true)
    }

    // Close modal
    const onCloseHandler = () => {
        setShow(false)
    }

    return (
        <div>
            {content.length > length && (
                <div
                    onClick={onShowHandler}
                    className="wysiwygSeeMore themeColor"
                    style={{ fontSize: '11px' }}
                >
                    {'See more'}
                </div>
            )}
            <Modal show={show} size="lg" onHide={onCloseHandler} backdrop="static" keyboard={false}>
                <Modal.Header closeButton={onCloseHandler}>
                    <Modal.Title>Announcement </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div
                        className="announcementBody1 justify-content-center"
                        style={{ fontSize: '14px' }}
                        dangerouslySetInnerHTML={{ __html: getDisplayContent() }}
                    />
                </Modal.Body>
            </Modal>
        </div>
    )
}

export default SeeMore
