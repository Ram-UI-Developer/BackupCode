import { Checkbox } from 'antd'
import React, { useEffect, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import { toast } from 'react-toastify'
import { handleKeyPress, updateValidation } from '../../../Common/CommonComponents/FormControlValidation'
import Loader from '../../../Common/CommonComponents/Loader'
import TableHeader from '../../../Common/CommonComponents/TableHeader'
import { AddIcon, ChangeIcon, DeleteIcon, EditIcon } from '../../../Common/CommonIcons/CommonIcons'
import { getAll } from '../../../Common/Services/CommonService'
import DragableTable from '../../../Common/Table/DragableTable'
import { cancelButtonName } from '../../../Common/Utilities/Constants'

const MenuList = ({ menus, setMenus, Data, setChange }) => {
    const [show, setShow] = useState(false) // Modal visibility control
    const [loading, setLoading] = useState(false) // Loading spinner control while fetching screens
    const [modelHeading, setModelHeading] = useState('') // Modal header title, either 'Add' or 'Update'
    const [pathList, setPathList] = useState([]) // Stores all available screen objects fetched from backend
    const [formErrors, setFormErrors] = useState({}) // Object to track validation errors for form inputs
    const [pathIds, setPathIds] = useState([]) // Array of selected screen IDs for a menu item
    const [formData, setFormData] = useState('') // Form data for the menu being added or edited
    const [index, setIndex] = useState('') // Index of the menu item being edited (used for updating)
    const [screens, setScreens] = useState([]) // Array of selected screen objects (resolved from pathIds)
    const [dashboard, setDashboard] = useState(false) // Boolean to track whether "Dashboard?" is checked
    const [row, setRow] = useState({}) // Current row data being edited

    // Modal close handler
    const onCloseHandler = () => {
        setShow(false)
        setFormData({})
        setPathIds([])
        setIcon(null)
        setDashboard(false)
    }
    // Modal open handler for adding
    const onAddHandler = () => {
        setShow(true)
        setModelHeading('Add')

    }
    // Modal open handler for editing
    const onEditHandler = (row, index) => {
        setShow(true)
        setModelHeading('Update')
        setFormData(row)
        setIcon(row.icon)
        setIndex(index)
        setPathIds(row.screens)
        setDashboard(row.dashboard)
        setRow(row)

    }

    useEffect(() => {
        getAllScreens()
    }, [])

    // Input change handler
    const onInputChange = (e) => {
        const { name } = e.target
        setFormData({
            ...formData,
            [e.target.name]: e.target.value.trimStart().replace(/\s+/g, ' ')
        })
        !e.target.value
            ? setFormErrors({ ...formErrors, [name]: 'Required' })
            : setFormErrors({ ...formErrors, [name]: '' })
    }

    const getAllScreens = () => {
        getAll({ entity: 'screens' })
            .then((res) => {
                setLoading(false)
                if (res.statusCode == 200) {
                    setPathList(res.data)
                }
            })
            .catch(() => {
                setPathList([])
                setLoading(false)
            })
    }

    // Checkbox group change handler
    const SelectHandler = (checkedValues) => {
        checkedValues.length == 0
            ? setFormErrors({ ...formErrors, screens: 'Required' })
            : setFormErrors({ ...formErrors, screens: '' })
        // Maintain only selected screens
        setPathIds((prev) => {
            const updated = [...prev]
            checkedValues.forEach((val) => {
                if (!updated.includes(val)) {
                    updated.push(val)
                }
            })
            return updated.filter((val) => checkedValues.includes(val))
        })
    }
    // Format path options for checkbox group
    const CheckboxGroup = Checkbox.Group
    const AllPaths = pathList
        ? pathList.map((option) => ({
            value: option.id,
            label: option.name + '(' + option.path + ')'
        }))
        : []

    const [icon, setIcon] = useState(null) // state for icon

    // File select and base64 convert
    const handleFileSelect = (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0]

            // Check the file size
            if (file.size > 10240) {
                setFormErrors({
                    ...formErrors,
                    fileSize: 'File size should not exceed more than 10kb'
                })
                setIcon(icon ? icon : null)
            } else {
                setChange(false)
                setFormErrors({ ...formErrors, fileSize: '' })
                const reader = new FileReader()
                reader.onload = (readerEvent) => {
                    // readerEvent.target.result contains the Base64-encoded string
                    const base64String = readerEvent.target.result
                    const base64Data = base64String.split(',')[1]

                    setIcon(base64Data) // Store the Base64 data or do something with it
                }

                // Read the file as a Data URL (Base64 format)
                reader.readAsDataURL(file)
            }
        }
    }

    // Save menu entry
    const onSaveHandler = () => {
        let obj = {
            name: formData.name,
            dashboard: dashboard,
            icon: icon,
            screens: screens.map((e) => e.id),
            screensTotalPrice: screens
                .map((e) => e.currentPrice)
                .reduce((sum, current) => sum + current, 0)
        }
        if (!formData.name) {
            setFormErrors(validate(obj))
        } else if (pathIds.length < 1) {
            toast.warning('At least one screen is needed.')
            setFormErrors(validate(obj))
        } else if (icon == null) {
            toast.error('please upload screen icon')
        } else {
            setMenus([...menus, obj])
            onCloseHandler()
            setChange(false)
        }
    }
    // Update menu entry
    const onUpdateHandler = () => {
        let obj = {
            id: formData.id,
            name: formData.name,
            dashboard: dashboard,
            fileName: null,
            fileType: null,
            icon: icon,
            screens: pathIds,
            screenDTOs: null,
            screensTotalPrice: screens
                .map((e) => e.currentPrice)
                .reduce((sum, current) => sum + current, 0)
        }
        console.log('obj', obj, row)
       
        if(updateValidation(obj, row)) {
            toast.info('No changes detected to update.')
            return
        }
        if (!formData.name) {
            setFormErrors(validate(obj))
        } else if (pathIds.length < 1) {
            toast.warning('At least one screen is needed.')
            setFormErrors(validate(obj))
        } else if (icon == null) {
            toast.error('please upload screen icon')
        } else {
            let newData = [...menus]
            newData[index] = obj
            setMenus(newData)
            onCloseHandler()
        }
    }
    // Delete handler
    const proceedDelete = (row, index) => {
        setMenus((prevMenus) => {
            const updatedMenus = [...prevMenus]
            updatedMenus.splice(index, 1)
            return updatedMenus
        })
    }

    // Form validation
    const validate = (values) => {
        const errors = {}
        if (!values.name || values.name.length < 0) {
            errors.name = 'Required'
        } else {
            errors.name = ''
        }
        if (values.screens.length < 1) {
            errors.screens = 'Required'
        } else {
            errors.screens = ''
        }
        if (icon && icon.type != 'image/png') {
            errors.fileType = 'File size should not exceed more than 100kb'
        }
        return errors
    }
    // Table column definitions
    const columns = React.useMemo(
        () => [
            { Header: 'Name', accessor: 'name' },
            {
                Header: 'Price',
                accessor: 'screensTotalPrice',
                headerAlign: 'right',
                Cell: ({ row }) => (
                    <div className="numericData">
                        &#8377;{' '}
                        {row.original.screensTotalPrice
                            ? row.original.screensTotalPrice.toFixed(2)
                            : ''}
                    </div>
                )
            },
            {
                Header: () => <div className="text-wrap text-right actions">Actions</div>,
                accessor: 'actions',
                disableSortBy: true,
                Cell: ({ row }) => (
                    <>
                        <div className="text-wrap text-right actionsWidth">
                            <Button
                                type="button"
                                className="iconWidth"
                                variant=""
                                onClick={() => onEditHandler(row.original, row.index)}
                            >
                                <EditIcon />
                            </Button>
                            |
                            <Button
                                type="button"
                                className="iconWidth"
                                variant=""
                                onClick={() => proceedDelete(row.original.id, row.index)}
                            >
                                <DeleteIcon />
                            </Button>
                        </div>
                    </>
                )
            }
        ],
        []
    )
    // Screen table columns
    const screenColumns = React.useMemo(
        () => [
            { Header: 'Name', accessor: 'name' },
            { Header: 'Path', accessor: 'path' },
            {
                Header: 'Price',
                accessor: 'currentPrice',
                headerAlign: 'right',
                Cell: ({ row }) => (
                    <div className="numericData">
                        &#8377; {row.original.currentPrice.toFixed(2)}
                    </div>
                )
            }
        ],
        []
    )
    // Update screen list based on selected screen IDs
    useEffect(() => {
        setScreens(
            pathIds &&
            pathIds
                .map((key) => pathList.find((obj) => obj.id === key))
                .filter((obj) => obj !== undefined)
        )

    }, [pathIds])

    return (
        <>
            <div className="col-sm-12">
                <TableHeader tableTitle={'Menus'} />
                <div className="">
                    <Button className="addButton" variant="addbtn" onClick={onAddHandler}>
                        <AddIcon />
                    </Button>

                    {loading ? (
                        <div
                            className="d-flex justify-content-center align-items-center"
                            style={{ height: '70vh' }}
                        >
                            {' '}
                            <Loader />{' '}
                        </div>
                    ) : (
                        <DragableTable
                            columns={columns}
                            data={menus}
                            setData={setMenus}
                            draggableKey={'name'}
                            serialNumber={true}
                        />
                    )}
                </div>
            </div>
            {/* Modal Section */}
            <Modal
                show={show}
                size="xl"
                onHide={() => onCloseHandler()}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton={() => onCloseHandler()}>
                    <Modal.Title>{modelHeading} Menu</Modal.Title>
                </Modal.Header>
                <Modal.Body className="">
                    <div className="col-10">
                        <Form.Group as={Row} className="mb-3" controlId="formGroupBranch">
                            <Form.Label column sm={3}>
                                Name <span className="error">*</span>
                            </Form.Label>
                            <Col sm={7} style={{ paddingLeft: '1px' }}>
                                <Form.Control
                                    required
                                    size="md"
                                    type="text"
                                    name="name"
                                    defaultValue={formData.name}
                                    onChange={onInputChange}
                                    onKeyPress={(e) => handleKeyPress(e, setFormErrors)}
                                    onPaste={(e) => handleKeyPress(e, setFormErrors)}
                                    onInput={(e) => handleKeyPress(e, setFormErrors)}
                                    maxLength={50}
                                />
                                {formErrors.name && (
                                    <p className="error">{formErrors.name}</p>
                                )}
                            </Col>
                        </Form.Group>
                    </div>
                    <div className="col-10">
                        <Form.Group as={Row} className="mb-3" controlId="formGroupBranch">
                            <Form.Label column sm={3}>
                                Dashboard?
                            </Form.Label>
                            <Col sm={7} style={{ paddingLeft: '1px' }}>
                                <input
                                    type="checkbox"
                                    name="dashboard"
                                    checked={dashboard}
                                    onChange={() => setDashboard(!dashboard)}
                                />
                            </Col>
                        </Form.Group>
                    </div>
                    <div class="col-10">
                        <Form.Group as={Row} className="mb-3" controlId="formGroupToDate">
                            <Form.Label className="fieldLable" column md={4}>
                                Menu Icon <span className="error">*</span>
                            </Form.Label>
                            <Col md={6} style={{ marginLeft: '-35px' }}>
                                <>
                                    <div className="d-flex align-items-center">
                                        <div
                                            className="d-flex justify-content-center align-items-center textFieldSub"
                                            style={{
                                                height: '70px',
                                                width: '70px',
                                                border: '1px #999999 dashed',
                                                backgroundColor: icon ? '#004aad' : ''
                                            }}
                                        >
                                            <img
                                                src={
                                                    icon
                                                        ? `data:image/jpeg;base64,${icon}`
                                                        : Data.id !== null && icon
                                                            ? `data:image/jpeg;base64,${icon}`
                                                            : '/dist/Images/add-photo.png'
                                                }
                                                style={{ height: '20px' }}
                                                alt="Logo"
                                                onClick={() =>
                                                    document.getElementById('fileInput').click()
                                                }
                                            // type="button"
                                            />
                                        </div>
                                        <div style={{ paddingLeft: '6px' }}>
                                            <a
                                                className=""
                                                style={{ fontWeight: '600', paddingLeft: '6px' }}
                                                onClick={() =>
                                                    document.getElementById('fileInput').click()
                                                }
                                            >
                                                <ChangeIcon />
                                            </a>
                                        </div>
                                    </div>

                                    <input
                                        type="file"
                                        id="fileInput"
                                        title="allowed only png"
                                        accept="image/png"
                                        style={{ display: 'none' }}
                                        onChange={(e) => handleFileSelect(e)}
                                    />
                                </>
                                <p className="error textFieldSub">{formErrors.fileSize}</p>
                            </Col>
                        </Form.Group>
                    </div>
                    <div className="col-sm-12">
                        <DragableTable
                            columns={screenColumns}
                            data={screens}
                            setData={setScreens}
                            draggableKey={'name'}
                            serialNumber={true}
                            setChange={setChange}
                        />
                    </div>
                    <div className="col-12">
                        <Form.Group>
                            <Form.Label>
                                Screens <span className="error">*</span>
                            </Form.Label>
                            <br />
                            <CheckboxGroup
                                className="checkbox-group mb-4"
                                options={AllPaths}
                                value={pathIds} // Bind state to the component
                                onChange={SelectHandler} // Update state on change
                            />
                            <p className="error">{formErrors.screens}</p>
                        </Form.Group>
                    </div>
                    <div className="btnCenter mb-3">
                        {modelHeading == 'Add' ? (
                            <Button className="Button" variant="addbtn" onClick={onSaveHandler}>
                                Save
                            </Button>
                        ) : (
                            <Button className="Button" variant="addbtn" onClick={onUpdateHandler}>
                                Update
                            </Button>
                        )}
                        <Button
                            className="Button"
                            variant="secondary"
                            onClick={() => onCloseHandler()}
                        >
                            {cancelButtonName}
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    )
}

export default MenuList
