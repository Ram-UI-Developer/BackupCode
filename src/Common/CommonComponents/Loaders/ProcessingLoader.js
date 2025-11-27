import React from 'react'
import { Modal } from 'react-bootstrap'
import './DetailLoader.css'
import { LoaderGif } from '../../CommonIcons/CommonIcons'

const ProcessingLoader = (props) => {
    return (
        <div>
            <div className="blurred">
                <div className="loader-container">
                    <Modal show={true}>
                        <Modal.Body>
                            <div className="text-center textBold" style={{ padding: '4%' }}>
                                {props.data}
                            </div>
                            <center>
                                <LoaderGif height={80} width={400} />
                            </center>
                        </Modal.Body>
                    </Modal>
                </div>
            </div>
        </div>
    )
}

export default ProcessingLoader
