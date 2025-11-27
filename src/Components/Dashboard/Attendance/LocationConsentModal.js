import React from 'react'
import Modal from 'react-bootstrap/Modal'
import { Button } from 'react-bootstrap'
import { cancelButtonName } from '../../../Common/Utilities/Constants'

const LocationConsentModal = ({ show, onAccept, onDecline }) => {
    return (
        <Modal show={show} onHide={onDecline} backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title>Location Permission</Modal.Title>
            </Modal.Header>
            <Modal.Body className="modalBody">
                To punch in/out, we need access to your location to verify attendance.
            </Modal.Body>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    paddingBottom: '3%'
                }}
            >
                <Button variant="addbtn" className="Button" onClick={onAccept}>
                    Allow
                </Button>

                <Button variant="secondary" className="Button" onClick={onDecline}>
                    {cancelButtonName}
                </Button>
            </div>
        </Modal>
    )
}

export default LocationConsentModal
