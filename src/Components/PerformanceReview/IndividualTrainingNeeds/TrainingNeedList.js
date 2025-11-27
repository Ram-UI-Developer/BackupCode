import { useEffect, useState } from 'react'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'
import Select from 'react-select'
import { DeleteIcon } from '../../../Common/CommonIcons/CommonIcons'
import Table from '../../../Common/Table/Table'

const TrainingNeedList = ({
    apprisalForm,
    managerPrevieew,
    peer,
    employee,
    isCompleted,
    manager,
    readOnly,
    isHr,
    formErrors
}) => {
    const [trining, setTraining] = useState(
        apprisalForm.trainingDetailsDTOs ? apprisalForm.trainingDetailsDTOs : []
    )
    const [deleteShow, setDeleteShow] = useState(false)
    const [index, setIndex] = useState('')

    useEffect(() => {
        setTraining(apprisalForm.trainingDetailsDTOs ? apprisalForm.trainingDetailsDTOs : [])
    }, [apprisalForm])

    useEffect(() => {
        if (apprisalForm.trainingDetailsDTOs) {
            apprisalForm.trainingDetailsDTOs = trining
        }
    }, [trining])

    const handleAddClick = () => {
        setTraining([
            ...trining,
            {
                id: '',
                name: '',
                trainingTime: '',
                duration: '',
                trainingStatusEnum: 0
            }
        ])
    }

    const [managerGoals, setManagerGoals] = useState(
        apprisalForm.selfreviewDTO
            ? apprisalForm.selfreviewDTO && apprisalForm.selfreviewDTO.mgrGoalDTOs
            : []
    )
    useEffect(() => {
        if (apprisalForm.selfreviewDTO) {
            apprisalForm.selfreviewDTO.mgrGoalDTOs = managerGoals
        }
    }, [managerGoals])
    const handleGoalsAddByManager = () => {
        setManagerGoals([
            ...managerGoals,
            {
                id: '',
                name: '',
                timePeriod: '',
                deadline: null,
                goalStatusEnum: 0
            }
        ])
    }

    const onInputhandler = (value, index, name) => {
        managerGoals[index][name] = value
    }

    const onChangeHandler = (value, index, name) => {
        trining[index][name] = value
    }

    const managerSetGoalCoumns = [
        {
            Header: 'Objective',
            accessor: 'name',
            Cell: ({ row }) => (
                <div className="">
                    {isHr ? (
                        <p style={{ width: '250px' }}>{row.original.name}</p>
                    ) : (
                        <Form.Control
                            disabled={readOnly}
                            as={'textarea'}
                            style={{ width: '250px', height: '30px', marginTop: '4%' }}
                            onChange={(e) => onInputhandler(e.target.value, row.index, 'name')}
                            defaultValue={row.original.name}
                            maxLength={200}
                        />
                    )}
                    <div style={{ marginLeft: '51%' }}> {row.original.name.length}/200</div>
                </div>
            )
        },
        {
            Header: 'Time frame',
            accessor: 'timePeriod',
            Cell: ({ row }) => (
                <div className="">
                    <Form.Control
                        // disabled={readOnly}
                        readOnly={readOnly}
                        defaultValue={row.original.timePeriod}
                        onChange={(e) => onInputhandler(e.target.value, row.index, 'timePeriod')}
                        style={{ width: '150px' }}
                        maxLength={250}
                    />
                </div>
            )
        },
        {
            Header: () => <div className="text-wrap text-right actions">Actions</div>,
            accessor: 'actions',
            disableSortBy: true,
            Cell: ({ row }) => (
                <>
                    <div className="text-wrap text-center actionsWidth">
                        <Button
                            variant=""
                            disabled={readOnly}
                            className="iconWidth"
                            onClick={() => handleManagerRemove(row.index)}
                        >
                            <DeleteIcon />
                        </Button>
                    </div>
                </>
            )
        }
    ]

    const proceedGoalsDeletHandler = (e) => {
        e.preventDefault()
        const rows = [...managerGoals]
        rows.splice(index, 1)
        setManagerGoals(rows)
        setManagerDeleteShow(false)
    }

    const [managerDeleteShow, setManagerDeleteShow] = useState(false)
    const handleRemove = (index) => {
        setDeleteShow(true)
        setIndex(index)
    }

    const handleManagerRemove = (index) => {
        setManagerDeleteShow(true)
        setIndex(index)
    }

    const proceedDeleteHandler = (e) => {
        e.preventDefault()
        const rows = trining
        rows.splice(index, 1)
        setTraining(rows)
        setDeleteShow(false)
    }

    const onCloseHandler = () => {
        setDeleteShow(false)
        setManagerDeleteShow(false)
    }

    const managerOptions = [
        { label: 'None', value: '0' },
        { label: 'Required', value: '1' },
        { label: 'Not Required', value: '2' },
        { label: 'Optional', value: '3' }
    ]

    const handleManagerApprovalSelection = (option, index, name) => {
        trining[index][name] = option.value
    }

    const COLUMNS = [
        {
            Header: 'Training Need',
            accessor: 'name',
            Cell: ({ row }) => (
                <div className="">
                    {peer || manager || isHr || managerPrevieew || isCompleted ? (
                        <p style={{ width: '250px' }}>{row.original.name}</p>
                    ) : (
                        <Form.Control
                            disabled={peer || manager || managerPrevieew}
                            readOnly={readOnly}
                            style={{ width: '250px' }}
                            onChange={(e) => onChangeHandler(e.target.value, row.index, 'name')}
                            defaultValue={row.original.name}
                            maxLength={200}
                        />
                    )}
                </div>
            )
        },
        {
            Header: 'When Required ?',
            accessor: 'trainingTime',
            Cell: ({ row }) => (
                <div className="">
                    <Form.Control
                        disabled={peer || manager || managerPrevieew}
                        readOnly={readOnly || managerPrevieew}
                        defaultValue={row.original.trainingTime}
                        onChange={(e) => onChangeHandler(e.target.value, row.index, 'trainingTime')}
                        style={{ width: '150px' }}
                        maxLength={20}
                    />
                </div>
            )
        },
        {
            Header: 'Estimated Duration(Days)',
            accessor: 'approximateDuration',
            Cell: ({ row }) => (
                <div className="box">
                    <Form.Control
                        disabled={peer || manager || managerPrevieew}
                        readOnly={readOnly || managerPrevieew}
                        defaultValue={row.original.duration}
                        onChange={(e) => onChangeHandler(e.target.value, row.index, 'duration')}
                        style={{ width: '150px' }}
                        maxLength={200}
                    />
                </div>
            )
        },
        {
            Header: 'Manager Approval',
            accessor: '',
            Cell: ({ row }) => (
                <div className="box">
                    <Select
                        isDisabled={employee || peer || readOnly || managerPrevieew}
                        options={managerOptions}
                        defaultValue={managerOptions.filter(
                            (e) => e.value == trining[row.index]['trainingStatusEnum']
                        )}
                        onChange={(e) =>
                            handleManagerApprovalSelection(e, row.index, 'trainingStatusEnum')
                        }
                        style={{ width: '150px' }}
                    />
                    <span className="error">
                        {formErrors && formErrors.managerReviewTrain
                            ? formErrors.managerReviewTrain
                            : ' '}
                    </span>
                </div>
            )
        },
        {
            Header: () => <div className="text-wrap text-right actions">Actions</div>,
            accessor: 'actions',
            disableSortBy: true,
            Cell: ({ row }) => (
                <>
                    <div className="text-wrap text-center actionsWidth">
                        <Button
                            variant=""
                            disabled={peer || readOnly || managerPrevieew}
                            className="iconWidth"
                            onClick={() => handleRemove(row.index)}
                        >
                            <DeleteIcon />
                        </Button>
                    </div>
                </>
            )
        }
    ]
    const [formData, setFormData] = useState()
    const onHandleChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
        // apprisalForm.selfreviewDTO[name].employeeReview = value
        // if (isEmployee) {
        //   apprisalForm.employeeComments = value
        // }
        // else if (isPeer) {
        //   apprisalForm.peerComments = value
        // }
        // else if (isManager) {
        //   apprisalForm.managerComments = value
        // }
        // else if (isHr) {
        //   apprisalForm.hrComments = value
        // }
        apprisalForm[name] = value
    }
    const onEmployeeHandle = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
        apprisalForm.extraContribution = value
    }
    return (
        <>
            <div>
                <section className="">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-md-12">
                                {isCompleted ? (
                                    ''
                                ) : (
                                    <div className="">
                                        <h5
                                            style={{
                                                marginTop: '2%',
                                                marginBottom: '2%',
                                                color: '#364781'
                                            }}
                                        >
                                            <label>Trainings Needed</label>
                                        </h5>
                                        <div className="table">
                                            <Table
                                                columns={COLUMNS}
                                                serialNumber={true}
                                                data={trining}
                                            />
                                        </div>
                                        <span>
                                            {manager ||
                                            readOnly ||
                                            isCompleted ||
                                            managerPrevieew == true ? (
                                                ''
                                            ) : (
                                                <Button
                                                    className="addMoreBtn"
                                                    variant=""
                                                    disabled={peer || manager || readOnly}
                                                    onClick={handleAddClick}
                                                >
                                                    Add More+
                                                </Button>
                                            )}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div>
                                <h5 style={{ marginTop: '2%', color: '#364781' }}>
                                    <label>Extra Contribution</label>
                                </h5>
                                <label style={{ fontSize: '113%' }}>
                                    Please describe any additional contributions you made during the
                                    appraisal period that were not covered in the previous
                                    sections.{' '}
                                </label>
                                <label>Employee :</label>
                                {peer || manager || isHr || isCompleted || managerPrevieew ? (
                                    <p>{apprisalForm && apprisalForm.extraContribution}</p>
                                ) : (
                                    <Form.Control
                                        className="textBox"
                                        as={'textarea'}
                                        // required
                                        disabled={peer || manager}
                                        readOnly={readOnly}
                                        defaultValue={
                                            apprisalForm && apprisalForm.extraContribution
                                        }
                                        onChange={onEmployeeHandle}
                                        name="extraContribution"
                                        type="text"
                                        maxLength={1000}
                                    />
                                )}
                                <p className="textAreaDatalength">
                                    {apprisalForm && apprisalForm.extraContribution == null
                                        ? 0
                                        : apprisalForm && apprisalForm.extraContribution.length}
                                    /1000
                                </p>
                            </div>
                            {employee || peer || isCompleted ? (
                                ''
                            ) : (
                                <div>
                                    <h5
                                        style={{
                                            marginTop: '2%',
                                            marginBottom: '2%',
                                            color: '#364781'
                                        }}
                                    >
                                        <label>
                                            Goals for the next review period(Assign by Manager)
                                            <span className="error">*</span>
                                        </label>
                                    </h5>
                                    <div className="table">
                                        <Table
                                            columns={managerSetGoalCoumns}
                                            serialNumber={true}
                                            data={managerGoals}
                                        />
                                    </div>
                                    <span>
                                        {readOnly ? (
                                            ''
                                        ) : (
                                            <Button
                                                variant=""
                                                className="addMoreBtn"
                                                disabled={peer || employee || readOnly}
                                                onClick={handleGoalsAddByManager}
                                            >
                                                Add More+
                                            </Button>
                                        )}
                                    </span>
                                </div>
                            )}

                            <div>
                                <h5 style={{ marginTop: '2%', color: '#364781' }}>
                                    <label>Other Comments(Optional)</label>
                                </h5>
                                {isCompleted || managerPrevieew ? (
                                    <div>
                                        <div className="col-">
                                            <Form.Group
                                                as={Row}
                                                className="mb-3"
                                                controlId="formGroupToDate"
                                            >
                                                <Form.Label column sm={3}>
                                                    Employee Comments :
                                                </Form.Label>
                                                <Col md={6}>
                                                    <p>
                                                        {apprisalForm &&
                                                            apprisalForm.employeeComments}
                                                    </p>
                                                    <p className="textAreaDatalength">
                                                        {apprisalForm &&
                                                        apprisalForm.employeeComments == null
                                                            ? 0
                                                            : apprisalForm &&
                                                              apprisalForm.employeeComments.length}
                                                        /1000
                                                    </p>
                                                </Col>
                                            </Form.Group>
                                        </div>
                                        {apprisalForm.peerId == null ? (
                                            ''
                                        ) : (
                                            <div className="col-">
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-3"
                                                    controlId="formGroupToDate"
                                                >
                                                    <Form.Label column sm={3}>
                                                        Peer Comments :
                                                    </Form.Label>
                                                    <Col sm={6}>
                                                        <p>
                                                            {apprisalForm &&
                                                                apprisalForm.peerComments}
                                                        </p>
                                                        <p className="textAreaDatalength">
                                                            {apprisalForm &&
                                                            apprisalForm.peerComments == null
                                                                ? 0
                                                                : apprisalForm &&
                                                                  apprisalForm.peerComments.length}
                                                            /1000
                                                        </p>
                                                    </Col>
                                                </Form.Group>
                                            </div>
                                        )}
                                        <div className="col-">
                                            <Form.Group
                                                as={Row}
                                                className="mb-3"
                                                controlId="formGroupToDate"
                                            >
                                                <Form.Label column sm={3}>
                                                    Manager Comments :
                                                </Form.Label>
                                                <Col md={6}>
                                                    <p>
                                                        {apprisalForm &&
                                                            apprisalForm.managerComments}
                                                    </p>
                                                    <p className="textAreaDatalength">
                                                        {apprisalForm &&
                                                        apprisalForm.managerComments == null
                                                            ? 0
                                                            : apprisalForm &&
                                                              apprisalForm.managerComments.length}
                                                        /1000
                                                    </p>
                                                </Col>
                                            </Form.Group>
                                        </div>
                                        <div className="col-">
                                            <Form.Group
                                                as={Row}
                                                className="mb-3"
                                                controlId="formGroupToDate"
                                            >
                                                <Form.Label column sm={3}>
                                                    HR Comments :
                                                </Form.Label>
                                                <Col md={6}>
                                                    <p>{apprisalForm && apprisalForm.hrComments}</p>
                                                    <p className="textAreaDatalength">
                                                        {apprisalForm &&
                                                        apprisalForm.hrComments == null
                                                            ? 0
                                                            : apprisalForm &&
                                                              apprisalForm.hrComments.length}
                                                        /1000
                                                    </p>
                                                </Col>
                                            </Form.Group>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        {employee == true ? (
                                            <div className="col-">
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-3"
                                                    controlId="formGroupToDate"
                                                >
                                                    <Form.Label column sm={3}>
                                                        Employee Comments :
                                                    </Form.Label>
                                                    <Col md={6}>
                                                        <Form.Control
                                                            className="textBox"
                                                            as={'textarea'}
                                                            // required
                                                            disabled={peer || manager}
                                                            readOnly={readOnly}
                                                            defaultValue={
                                                                apprisalForm &&
                                                                apprisalForm.employeeComments
                                                            }
                                                            onChange={onHandleChange}
                                                            name="employeeComments"
                                                            type="text"
                                                            maxLength={1000}
                                                        />
                                                        <p className="textAreaDatalength">
                                                            {apprisalForm &&
                                                            apprisalForm.employeeComments == null
                                                                ? 0
                                                                : apprisalForm &&
                                                                  apprisalForm.employeeComments
                                                                      .length}
                                                            /1000
                                                        </p>
                                                    </Col>
                                                </Form.Group>
                                            </div>
                                        ) : (
                                            ''
                                        )}

                                        {peer ? (
                                            <>
                                                <div className="col-">
                                                    <Form.Group
                                                        as={Row}
                                                        className="mb-3"
                                                        controlId="formGroupToDate"
                                                    >
                                                        <Form.Label column sm={3}>
                                                            Employee Comments :
                                                        </Form.Label>
                                                        <Col md={6}>
                                                            <p>
                                                                {apprisalForm &&
                                                                    apprisalForm.employeeComments}
                                                            </p>
                                                            <p className="textAreaDatalength">
                                                                {apprisalForm &&
                                                                apprisalForm.employeeComments ==
                                                                    null
                                                                    ? 0
                                                                    : apprisalForm &&
                                                                      apprisalForm.employeeComments
                                                                          .length}
                                                                /1000
                                                            </p>
                                                        </Col>
                                                    </Form.Group>
                                                </div>

                                                <div className="col-">
                                                    <Form.Group
                                                        as={Row}
                                                        className="mb-3"
                                                        controlId="formGroupToDate"
                                                    >
                                                        <Form.Label column sm={3}>
                                                            Peer Comments :
                                                        </Form.Label>
                                                        <Col sm={6}>
                                                            <Form.Control
                                                                className="textBox"
                                                                as={'textarea'}
                                                                // required
                                                                disabled={employee || manager}
                                                                readOnly={readOnly}
                                                                defaultValue={
                                                                    apprisalForm &&
                                                                    apprisalForm.peerComments
                                                                }
                                                                onChange={onHandleChange}
                                                                name="peerComments"
                                                                type="text"
                                                                maxLength={1000}
                                                            />
                                                            <p className="textAreaDatalength">
                                                                {apprisalForm &&
                                                                apprisalForm.peerComments == null
                                                                    ? 0
                                                                    : apprisalForm &&
                                                                      apprisalForm.peerComments
                                                                          .length}
                                                                /1000
                                                            </p>
                                                        </Col>
                                                    </Form.Group>
                                                </div>
                                            </>
                                        ) : (
                                            ''
                                        )}

                                        {manager == true ? (
                                            <>
                                                <div className="col-">
                                                    <Form.Group
                                                        as={Row}
                                                        className="mb-3"
                                                        controlId="formGroupToDate"
                                                    >
                                                        <Form.Label column sm={3}>
                                                            Employee Comments :
                                                        </Form.Label>
                                                        <Col md={6}>
                                                            <p>
                                                                {apprisalForm &&
                                                                    apprisalForm.employeeComments}
                                                            </p>
                                                            <p className="textAreaDatalength">
                                                                {apprisalForm &&
                                                                apprisalForm.employeeComments ==
                                                                    null
                                                                    ? 0
                                                                    : apprisalForm &&
                                                                      apprisalForm.employeeComments
                                                                          .length}
                                                                /1000
                                                            </p>
                                                        </Col>
                                                    </Form.Group>
                                                </div>
                                                {apprisalForm.peerId == null ? (
                                                    ''
                                                ) : (
                                                    <div className="col-">
                                                        <Form.Group
                                                            as={Row}
                                                            className="mb-3"
                                                            controlId="formGroupToDate"
                                                        >
                                                            <Form.Label column sm={3}>
                                                                Peer Comments :
                                                            </Form.Label>
                                                            <Col sm={6}>
                                                                <p>
                                                                    {apprisalForm &&
                                                                        apprisalForm.peerComments}
                                                                </p>
                                                                <p className="textAreaDatalength">
                                                                    {apprisalForm &&
                                                                    apprisalForm.peerComments ==
                                                                        null
                                                                        ? 0
                                                                        : apprisalForm &&
                                                                          apprisalForm.peerComments
                                                                              .length}
                                                                    /1000
                                                                </p>
                                                            </Col>
                                                        </Form.Group>
                                                    </div>
                                                )}
                                                <div className="col-">
                                                    <Form.Group
                                                        as={Row}
                                                        className="mb-3"
                                                        controlId="formGroupToDate"
                                                    >
                                                        <Form.Label column sm={3}>
                                                            Manager Comments :
                                                        </Form.Label>
                                                        <Col md={6}>
                                                            <Form.Control
                                                                className="textBox"
                                                                as={'textarea'}
                                                                // required
                                                                disabled={employee || peer}
                                                                readOnly={readOnly}
                                                                defaultValue={
                                                                    apprisalForm &&
                                                                    apprisalForm.managerComments
                                                                }
                                                                onChange={onHandleChange}
                                                                name="managerComments"
                                                                type="text"
                                                                maxLength={1000}
                                                            />
                                                            <p className="textAreaDatalength">
                                                                {apprisalForm &&
                                                                apprisalForm.managerComments == null
                                                                    ? 0
                                                                    : apprisalForm &&
                                                                      apprisalForm.managerComments
                                                                          .length}
                                                                /1000
                                                            </p>
                                                        </Col>
                                                    </Form.Group>
                                                </div>
                                            </>
                                        ) : (
                                            ''
                                        )}

                                        {isHr == true ? (
                                            <>
                                                <div className="col-">
                                                    <Form.Group
                                                        as={Row}
                                                        className="mb-3"
                                                        controlId="formGroupToDate"
                                                    >
                                                        <Form.Label column sm={3}>
                                                            Employee Comments :
                                                        </Form.Label>
                                                        <Col md={6}>
                                                            <p>
                                                                {apprisalForm &&
                                                                    apprisalForm.employeeComments}
                                                            </p>
                                                            <p className="textAreaDatalength">
                                                                {apprisalForm &&
                                                                apprisalForm.employeeComments ==
                                                                    null
                                                                    ? 0
                                                                    : apprisalForm &&
                                                                      apprisalForm.employeeComments
                                                                          .length}
                                                                /1000
                                                            </p>
                                                        </Col>
                                                    </Form.Group>
                                                </div>
                                                {apprisalForm.peerId == null ? (
                                                    ''
                                                ) : (
                                                    <div className="col-">
                                                        <Form.Group
                                                            as={Row}
                                                            className="mb-3"
                                                            controlId="formGroupToDate"
                                                        >
                                                            <Form.Label column sm={3}>
                                                                Peer Comments :
                                                            </Form.Label>
                                                            <Col sm={6}>
                                                                <p>
                                                                    {apprisalForm &&
                                                                        apprisalForm.peerComments}
                                                                </p>
                                                                <p className="textAreaDatalength">
                                                                    {apprisalForm &&
                                                                    apprisalForm.peerComments ==
                                                                        null
                                                                        ? 0
                                                                        : apprisalForm &&
                                                                          apprisalForm.peerComments
                                                                              .length}
                                                                    /1000
                                                                </p>
                                                            </Col>
                                                        </Form.Group>
                                                    </div>
                                                )}
                                                <div className="col-">
                                                    <Form.Group
                                                        as={Row}
                                                        className="mb-3"
                                                        controlId="formGroupToDate"
                                                    >
                                                        <Form.Label column sm={3}>
                                                            Manager Comments :
                                                        </Form.Label>
                                                        <Col md={6}>
                                                            <p>
                                                                {apprisalForm &&
                                                                    apprisalForm.managerComments}
                                                            </p>
                                                            <p className="textAreaDatalength">
                                                                {apprisalForm &&
                                                                apprisalForm.managerComments == null
                                                                    ? 0
                                                                    : apprisalForm &&
                                                                      apprisalForm.managerComments
                                                                          .length}
                                                                /1000
                                                            </p>
                                                        </Col>
                                                    </Form.Group>
                                                </div>

                                                <div className="col-">
                                                    <Form.Group
                                                        as={Row}
                                                        className="mb-3"
                                                        controlId="formGroupToDate"
                                                    >
                                                        <Form.Label column sm={3}>
                                                            HR Comments :
                                                        </Form.Label>
                                                        <Col md={6}>
                                                            <Form.Control
                                                                className="textBox"
                                                                as={'textarea'}
                                                                // required
                                                                disabled={
                                                                    employee || peer || manager
                                                                }
                                                                readOnly={
                                                                    apprisalForm.status ==
                                                                    'Completed'
                                                                }
                                                                defaultValue={
                                                                    apprisalForm &&
                                                                    apprisalForm.hrComments
                                                                }
                                                                onChange={onHandleChange}
                                                                name="hrComments"
                                                                type="text"
                                                                maxLength={1000}
                                                            />
                                                            <p className="textAreaDatalength">
                                                                {apprisalForm &&
                                                                apprisalForm.hrComments == null
                                                                    ? 0
                                                                    : apprisalForm &&
                                                                      apprisalForm.hrComments
                                                                          .length}
                                                                /1000
                                                            </p>
                                                        </Col>
                                                    </Form.Group>
                                                </div>
                                            </>
                                        ) : (
                                            ''
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Modal show={deleteShow} onHide={onCloseHandler} backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete ?</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    Are you sure you want to delete this item?
                </Modal.Body>
                <div className="btnCenter mb-3">
                    <Button className="Button" variant="addbtn" onClick={proceedDeleteHandler}>
                        Yes
                    </Button>
                    <Button className="Button" variant="secondary" onClick={onCloseHandler}>
                        No
                    </Button>
                </div>
            </Modal>

            <Modal
                show={managerDeleteShow}
                onHide={onCloseHandler}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header>
                    <Modal.Title>Delete ?</Modal.Title>
                    <Button variant="secondary" onClick={onCloseHandler}>
                        X
                    </Button>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    Are you sure you want to delete this item?
                </Modal.Body>
                <div className="delbtn">
                    <Button className="Button" variant="addbtn" onClick={proceedGoalsDeletHandler}>
                        Yes
                    </Button>
                    <Button className="Button" variant="secondary" onClick={onCloseHandler}>
                        No
                    </Button>
                </div>
            </Modal>
        </>
    )
}
export default TrainingNeedList
