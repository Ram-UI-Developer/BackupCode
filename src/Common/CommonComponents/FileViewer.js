import React, { useState } from 'react'
import Button from 'react-bootstrap/Button'

const FileViewer = ({ documents, booleanValue }) => {
    const [startIndex, setStartIndex] = useState(0) // State for index
    const itemsPerPage = 5
    const [selectedFileIndex, setSelectedFileIndex] = useState(0) // state for selected file indux number

    // Update selectedinded state by clicking file
    const handleFileClick = (index) => {
        setSelectedFileIndex(index)
    }

    // Update startIndex by clicliing next
    const handleNextClick = () => {
        setStartIndex((prevIndex) => prevIndex + itemsPerPage)
    }
    // Update startIndex by clicliing prev
    const handlePrevClick = () => {
        setStartIndex((prevIndex) => prevIndex - itemsPerPage)
    }

    const visibleFiles = documents.slice(startIndex, startIndex + itemsPerPage) // slicing docs by startindex and items per page

    // function for download file
    const downloadFile = (file, fileType) => {
        const url =
            file instanceof Blob ? URL.createObjectURL(file) : `data:${fileType};base64,${file}`
        const a = document.createElement('a')
        a.href = url
        a.download =
            file instanceof Blob ? 'downloaded_file' : 'downloaded_file.' + fileType.split('/')[1]
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }

    return (
        <>
            {documents.length > 0 && (
                <div>
                    {documents[selectedFileIndex].fileType.startsWith('image/') ? (
                        <img
                            src={
                                documents[selectedFileIndex].file instanceof Blob
                                    ? URL.createObjectURL(documents[selectedFileIndex].file)
                                    : `data:${documents[selectedFileIndex].fileType};base64,${documents[selectedFileIndex].file}`
                            }
                            style={{ width: '70%', height: '300px' }}
                            alt="File Preview"
                        />
                    ) : (
                        <iframe
                            src={
                                documents[selectedFileIndex].file instanceof Blob
                                    ? URL.createObjectURL(documents[selectedFileIndex].file)
                                    : `data:${documents[selectedFileIndex].fileType};base64,${documents[selectedFileIndex].file}`
                            }
                            style={{ width: '100%', height: '500px' }}
                            title="File Preview"
                        />
                    )}
                    {!booleanValue && (
                        <div style={{ marginTop: '1.5%' }}>
                            <Button
                                onClick={() =>
                                    downloadFile(
                                        documents[selectedFileIndex].file,
                                        documents[selectedFileIndex].fileType
                                    )
                                }
                            >
                                Download
                            </Button>
                        </div>
                    )}
                </div>
            )}
            {!booleanValue && documents.length > 0 && (
                <div style={{ overflowX: 'scroll' }}>
                    <Button onClick={handlePrevClick} variant="" disabled={startIndex === 0}>
                        {'<<'}
                    </Button>
                    {visibleFiles.map((file, index) => (
                        <a
                            key={file.name}
                            onClick={() => handleFileClick(startIndex + index)}
                            style={{
                                paddingRight: '10px',
                                paddingLeft: '10px',
                                borderRadius: 'px',
                                color: index === selectedFileIndex ? 'white' : '#374681',
                                backgroundColor:
                                    index === selectedFileIndex ? '#374681' : 'transparent'
                            }}
                        >
                            {file.fileName}
                        </a>
                    ))}
                    <Button
                        onClick={handleNextClick}
                        variant=""
                        disabled={startIndex + itemsPerPage >= documents.length}
                    >
                        {'>>'}
                    </Button>
                </div>
            )}
        </>
    )
}

export default FileViewer
