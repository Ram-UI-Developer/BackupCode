import React, { useEffect, useState } from 'react'
import OptionList from './OptionList'
import { Col, Form, Row } from 'react-bootstrap'

const RatingList = ({
    apprisalForm,
    managerPrevieew,
    isCompleted,
    readOnly,
    peer,
    isHr,
    employee,
    formErrors,
    manager
}) => {
    // Declaring state for manager's rating (mgrRating), initialized with apprisalForm's selfreviewDTO
    const [mgrRating, setMgrRating] = useState(apprisalForm && apprisalForm.selfreviewDTO)

    // Effect hook to update mgrRating and formData whenever apprisalForm is updated
    useEffect(() => {
        setMgrRating(apprisalForm.selfreviewDTO) // Set manager's rating to selfreviewDTO of apprisalForm
        setFormData(apprisalForm.selfreviewDTO) // Set form data to selfreviewDTO of apprisalForm
    }, [apprisalForm]) // Dependency array ensures this runs when apprisalForm changes

    // onChangeHandler function that updates mgrRating based on the selected value and also updates apprisalForm's relevant fields
    const onChangeHandler = (select, name) => {
        // Updating the mgrRating state with the new rating value for the specific 'name' (e.g., commSkills, jobKnowl, etc.)
        setMgrRating({ ...mgrRating[name], mgrRating: select.value })

        // If apprisalForm's selfreviewDTO exists, update its respective rating (mgrRating) for the given 'name'
        if (apprisalForm.selfreviewDTO) {
            apprisalForm.selfreviewDTO[name] = {
                ...apprisalForm.selfreviewDTO[name],
                mgrRating: select.value
            }
        }

        // Recalculating and updating the overall rating for regulatoryDTO based on all the ratings in selfreviewDTO and regulatoryDTO
        apprisalForm.regulatoryDTO.mrgOverallRating =
            (apprisalForm.selfreviewDTO.commSkills['mgrRating'] +
                apprisalForm.regulatoryDTO.inTimeframe['mgrRating'] +
                apprisalForm.regulatoryDTO.standards['mgrRating'] +
                apprisalForm.regulatoryDTO.attendance['mgrRating'] +
                apprisalForm.regulatoryDTO.loyalty['mgrRating'] +
                apprisalForm.regulatoryDTO.collaborate['mgrRating'] +
                apprisalForm.regulatoryDTO.performance['mgrRating'] +
                apprisalForm.regulatoryDTO.effectiveness['mgrRating'] +
                apprisalForm.regulatoryDTO.listening['mgrRating'] +
                apprisalForm.regulatoryDTO.proactiveness['mgrRating'] +
                apprisalForm.regulatoryDTO.policies['mgrRating'] +
                apprisalForm.regulatoryDTO.adaptSituations['mgrRating'] +
                apprisalForm.regulatoryDTO.consistent['mgrRating'] +
                apprisalForm.selfreviewDTO.jobKnowl['mgrRating'] +
                apprisalForm.selfreviewDTO.probSolve['mgrRating'] +
                apprisalForm.selfreviewDTO.teamWork['mgrRating'] +
                apprisalForm.selfreviewDTO.workQuality['mgrRating']) /
            17 // Averaging all the ratings to calculate the overall manager's rating
    }

    // Declaring state for formData to manage form inputs
    const [formData, setFormData] = useState()

    // onInputHandler function that handles changes to the form inputs (like employee review or peer review)
    const onInputHandler = (e) => {
        // Checking if 'Ctrl + A' is pressed, and if so, resetting the formData and apprisalForm fields
        if (e.ctrlKey && e.key === 'a') {
            e.preventDefault() // Prevent the default behavior (selecting all text)
            setFormData({}) // Reset formData to its initial empty state

            // Reset each field in apprisalForm's selfreviewDTO to its initial state
            if (apprisalForm.selfreviewDTO) {
                Object.keys(apprisalForm.selfreviewDTO).forEach((key) => {
                    apprisalForm.selfreviewDTO[key] = { employeeReview: '', peerReview: '' }
                })
            }
        }

        // Logging the employeeReview value for commSkills in selfreviewDTO for debugging purposes
        console.log(
            apprisalForm.selfreviewDTO && apprisalForm.selfreviewDTO.commSkills['employeeReview'],
            'checkingEmployeeReview'
        )

        // Destructuring the name and value from the input event
        const { name, value } = e.target

        // Updating formData state with the new input value
        setFormData({ ...formData, [name]: value })

        // Updating apprisalForm's selfreviewDTO with the respective review (either employeeReview or peerReview) based on the user role
        if (apprisalForm.selfreviewDTO) {
            // If employee, update employeeReview; otherwise, update peerReview
            const updatedReview = {
                ...apprisalForm.selfreviewDTO[name],
                [employee ? 'employeeReview' : 'peerReview']: value
            }
            // Apply the update to apprisalForm
            apprisalForm.selfreviewDTO[name] = updatedReview
        }
    }
    return (
        <>
            {/* ratings for employee ,peer,hr,manager */}
            <div style={{ marginLeft: '2%' }}>
                <h5 style={{ marginTop: '2%', color: '#364781' }}>
                    <label>Competency Assessment</label>
                </h5>

                <div class="col-">
                    <Form.Group as={Row} className="mb-3" controlId="formGroupToDate">
                        <Form.Label className="compatancyAssessment" column md={12}>
                            <label style={{ fontSize: '15px' }}>
                                1.Job Knowledge and Development
                            </label>
                            <div>
                                <label>
                                    How well do you understand your job responsibilities and the
                                    tasks associated with them ? <span className="error">*</span>
                                </label>
                            </div>
                        </Form.Label>
                        <Col md={12}>
                            <div>
                                <label>Employee Review</label>
                                {managerPrevieew || peer || manager || isHr || isCompleted ? (
                                    <p>
                                        {apprisalForm.selfreviewDTO &&
                                            apprisalForm.selfreviewDTO.jobKnowl['employeeReview']}
                                    </p>
                                ) : (
                                    <Form.Control
                                        className="textBox"
                                        as={'textarea'}
                                        required
                                        // disabled={peer || manager}
                                        readOnly={readOnly}
                                        defaultValue={
                                            apprisalForm.selfreviewDTO &&
                                            apprisalForm.selfreviewDTO.jobKnowl['employeeReview']
                                        }
                                        onChange={onInputHandler}
                                        name="jobKnowl"
                                        type="text"
                                        maxLength={1000}
                                    />
                                )}

                                <span className="error">
                                    {formErrors && formErrors.jobKnowlEmp
                                        ? formErrors.jobKnowlEmp
                                        : ' '}
                                </span>
                                <p className="textAreaDatalength">
                                    {apprisalForm.selfreviewDTO &&
                                    apprisalForm.selfreviewDTO.jobKnowl &&
                                    apprisalForm.selfreviewDTO.jobKnowl['employeeReview'] == null
                                        ? 0
                                        : apprisalForm.selfreviewDTO &&
                                          apprisalForm.selfreviewDTO.jobKnowl['employeeReview']
                                              .length}
                                    /1000
                                </p>
                            </div>
                            {employee ? (
                                ''
                            ) : (
                                <>
                                    {' '}
                                    {apprisalForm.peerId == null ? (
                                        ''
                                    ) : (
                                        <div>
                                            <label style={{ marginTop: '1%' }}>
                                                Peer Review/Team Lead
                                            </label>
                                            {managerPrevieew || employee || manager || isHr ? (
                                                <p>
                                                    {apprisalForm.selfreviewDTO &&
                                                        apprisalForm.selfreviewDTO.jobKnowl[
                                                            'peerReview'
                                                        ]}
                                                </p>
                                            ) : (
                                                <Form.Control
                                                    className="textBox"
                                                    as={'textarea'}
                                                    required
                                                    // disabled={employee || manager}
                                                    readOnly={readOnly}
                                                    defaultValue={
                                                        apprisalForm.selfreviewDTO &&
                                                        apprisalForm.selfreviewDTO.jobKnowl[
                                                            'peerReview'
                                                        ]
                                                    }
                                                    onChange={onInputHandler}
                                                    name="jobKnowl"
                                                    type="text"
                                                    maxLength={1000}
                                                />
                                            )}

                                            <span className="error">
                                                {formErrors && formErrors.jobKnowlPeer
                                                    ? formErrors.jobKnowlPeer
                                                    : ' '}
                                            </span>
                                            <p className="textAreaDatalength">
                                                {apprisalForm.selfreviewDTO &&
                                                apprisalForm.selfreviewDTO.jobKnowl &&
                                                apprisalForm.selfreviewDTO.jobKnowl['peerReview'] ==
                                                    null
                                                    ? 0
                                                    : apprisalForm.selfreviewDTO &&
                                                      apprisalForm.selfreviewDTO.jobKnowl[
                                                          'peerReview'
                                                      ].length}
                                                /1000
                                            </p>
                                        </div>
                                    )}
                                    {peer ? (
                                        ''
                                    ) : (
                                        <>
                                            <label style={{ marginTop: '1%' }}>
                                                Manager Rating <span className="error">*</span>
                                            </label>
                                            <Col sm={4} style={{ marginLeft: '-1.6%' }}>
                                                <OptionList
                                                    // readOnly={readOnly}
                                                    readOnly={employee || readOnly || peer}
                                                    name={'jobKnowl'}
                                                    selectedValue={
                                                        apprisalForm.selfreviewDTO &&
                                                        apprisalForm.selfreviewDTO.jobKnowl
                                                            ? apprisalForm.selfreviewDTO.jobKnowl[
                                                                  'mgrRating'
                                                              ]
                                                            : 1
                                                    }
                                                    onChangeHandler={onChangeHandler}
                                                />
                                                <span className="error">
                                                    {formErrors && formErrors.jobKnowlMgr
                                                        ? formErrors.jobKnowlMgr
                                                        : ' '}
                                                </span>
                                            </Col>
                                        </>
                                    )}
                                </>
                            )}
                        </Col>
                    </Form.Group>
                </div>

                <div class="col-">
                    <Form.Group as={Row} className="mb-3" controlId="formGroupToDate">
                        <Form.Label className="compatancyAssessment" column md={12}>
                            <label style={{ fontSize: '15px' }}>
                                {' '}
                                2.Problem Solving & Decision Making
                            </label>
                            <div>
                                <label>
                                    How does the employee approach challenges and find solutions
                                    ?(Please provide an example)
                                    <span className="error">*</span>{' '}
                                </label>
                            </div>
                        </Form.Label>
                        <Col md={12}>
                            <div>
                                <label>Employee Review</label>
                                {managerPrevieew || peer || manager || isHr || isCompleted ? (
                                    <p>
                                        {apprisalForm.selfreviewDTO &&
                                            apprisalForm.selfreviewDTO.probSolve['employeeReview']}
                                    </p>
                                ) : (
                                    <Form.Control
                                        className="textBox"
                                        as={'textarea'}
                                        required
                                        // disabled={peer || manager}
                                        readOnly={readOnly}
                                        defaultValue={
                                            apprisalForm.selfreviewDTO &&
                                            apprisalForm.selfreviewDTO.probSolve['employeeReview']
                                        }
                                        onChange={onInputHandler}
                                        name="probSolve"
                                        type="text"
                                        maxLength={1000}
                                    />
                                )}

                                <span className="error">
                                    {formErrors && formErrors.probSolveEmp
                                        ? formErrors.probSolveEmp
                                        : ' '}
                                </span>
                                <p className="textAreaDatalength">
                                    {apprisalForm.selfreviewDTO &&
                                    apprisalForm.selfreviewDTO.probSolve &&
                                    apprisalForm.selfreviewDTO.probSolve['employeeReview'] == null
                                        ? 0
                                        : apprisalForm.selfreviewDTO &&
                                          apprisalForm.selfreviewDTO.probSolve['employeeReview']
                                              .length}
                                    /1000
                                </p>
                            </div>

                            {employee ? (
                                ''
                            ) : (
                                <>
                                    {apprisalForm.peerId == null ? (
                                        ''
                                    ) : (
                                        <div>
                                            <label style={{ marginTop: '1%' }}>
                                                Peer Review/Team Lead
                                            </label>
                                            {managerPrevieew || employee || manager || isHr ? (
                                                <p>
                                                    {apprisalForm.selfreviewDTO &&
                                                        apprisalForm.selfreviewDTO.probSolve[
                                                            'peerReview'
                                                        ]}
                                                </p>
                                            ) : (
                                                <Form.Control
                                                    className="textBox"
                                                    as={'textarea'}
                                                    required
                                                    // disabled={employee || manager}
                                                    readOnly={readOnly}
                                                    defaultValue={
                                                        apprisalForm.selfreviewDTO &&
                                                        apprisalForm.selfreviewDTO.probSolve[
                                                            'peerReview'
                                                        ]
                                                    }
                                                    onChange={onInputHandler}
                                                    name="probSolve"
                                                    type="text"
                                                    maxLength={1000}
                                                />
                                            )}

                                            <span className="error">
                                                {formErrors && formErrors.probSolvePeer
                                                    ? formErrors.probSolvePeer
                                                    : ' '}
                                            </span>
                                            <p className="textAreaDatalength">
                                                {apprisalForm.selfreviewDTO &&
                                                apprisalForm.selfreviewDTO.probSolve &&
                                                apprisalForm.selfreviewDTO.probSolve[
                                                    'peerReview'
                                                ] == null
                                                    ? 0
                                                    : apprisalForm.selfreviewDTO &&
                                                      apprisalForm.selfreviewDTO.probSolve[
                                                          'peerReview'
                                                      ].length}
                                                /1000
                                            </p>
                                        </div>
                                    )}
                                    {peer ? (
                                        ''
                                    ) : (
                                        <>
                                            <label style={{ marginTop: '1%' }}>
                                                Manager Rating <span className="error">*</span>
                                            </label>
                                            <Col sm={4} style={{ marginLeft: '-1.6%' }}>
                                                <OptionList
                                                    // readOnly={readOnly}
                                                    readOnly={employee || readOnly || peer}
                                                    name={'probSolve'}
                                                    selectedValue={
                                                        apprisalForm.selfreviewDTO &&
                                                        apprisalForm.selfreviewDTO.probSolve
                                                            ? apprisalForm.selfreviewDTO.probSolve[
                                                                  'mgrRating'
                                                              ]
                                                            : 1
                                                    }
                                                    onChangeHandler={onChangeHandler}
                                                />
                                                <span className="error">
                                                    {formErrors && formErrors.probSolveMgr
                                                        ? formErrors.probSolveMgr
                                                        : ' '}
                                                </span>
                                            </Col>
                                        </>
                                    )}
                                </>
                            )}
                        </Col>
                    </Form.Group>
                </div>

                <div class="col-">
                    <Form.Group as={Row} className="mb-3" controlId="formGroupToDate">
                        <Form.Label className="compatancyAssessment" column md={12}>
                            <label style={{ fontSize: '15px' }}>
                                {' '}
                                3.Teamwork and Collaboration
                            </label>
                            <div>
                                {' '}
                                <label>
                                    How does the employee interact with team members and contribute
                                    to team goals ?<span className="error">*</span>
                                </label>
                            </div>
                        </Form.Label>
                        <Col md={12}>
                            <div>
                                <label>Employee Review</label>
                                {managerPrevieew || peer || manager || isHr || isCompleted ? (
                                    <p>
                                        {apprisalForm.selfreviewDTO &&
                                            apprisalForm.selfreviewDTO.teamWork['employeeReview']}
                                    </p>
                                ) : (
                                    <Form.Control
                                        className="textBox"
                                        as={'textarea'}
                                        required
                                        // disabled={peer || manager}
                                        readOnly={readOnly}
                                        defaultValue={
                                            apprisalForm.selfreviewDTO &&
                                            apprisalForm.selfreviewDTO.teamWork['employeeReview']
                                        }
                                        onChange={onInputHandler}
                                        name="teamWork"
                                        type="text"
                                        maxLength={1000}
                                    />
                                )}

                                <span className="error">
                                    {formErrors && formErrors.teamWorkEmp
                                        ? formErrors.teamWorkEmp
                                        : ' '}
                                </span>
                                <p className="textAreaDatalength">
                                    {apprisalForm.selfreviewDTO &&
                                    apprisalForm.selfreviewDTO.teamWork &&
                                    apprisalForm.selfreviewDTO.teamWork['employeeReview'] == null
                                        ? 0
                                        : apprisalForm.selfreviewDTO &&
                                          apprisalForm.selfreviewDTO.teamWork['employeeReview']
                                              .length}
                                    /1000
                                </p>
                            </div>
                            {employee ? (
                                ''
                            ) : (
                                <>
                                    {apprisalForm.peerId == null ? (
                                        ''
                                    ) : (
                                        <div>
                                            <label style={{ marginTop: '1%' }}>
                                                Peer Review/Team Lead
                                            </label>
                                            {managerPrevieew || employee || manager || isHr ? (
                                                <p>
                                                    {apprisalForm.selfreviewDTO &&
                                                        apprisalForm.selfreviewDTO.teamWork[
                                                            'peerReview'
                                                        ]}
                                                </p>
                                            ) : (
                                                <Form.Control
                                                    className="textBox"
                                                    as={'textarea'}
                                                    required
                                                    // disabled={employee || manager}
                                                    readOnly={readOnly}
                                                    defaultValue={
                                                        apprisalForm.selfreviewDTO &&
                                                        apprisalForm.selfreviewDTO.teamWork[
                                                            'peerReview'
                                                        ]
                                                    }
                                                    onChange={onInputHandler}
                                                    name="teamWork"
                                                    type="text"
                                                    maxLength={1000}
                                                />
                                            )}

                                            <span className="error">
                                                {formErrors && formErrors.teamWorkPeer
                                                    ? formErrors.teamWorkPeer
                                                    : ' '}
                                            </span>
                                            <p className="textAreaDatalength">
                                                {apprisalForm.selfreviewDTO &&
                                                apprisalForm.selfreviewDTO.teamWork &&
                                                apprisalForm.selfreviewDTO.teamWork['peerReview'] ==
                                                    null
                                                    ? 0
                                                    : apprisalForm.selfreviewDTO &&
                                                      apprisalForm.selfreviewDTO.teamWork[
                                                          'peerReview'
                                                      ].length}
                                                /1000
                                            </p>
                                        </div>
                                    )}

                                    {peer ? (
                                        ''
                                    ) : (
                                        <>
                                            <label style={{ marginTop: '1%' }}>
                                                Manager Rating <span className="error">*</span>
                                            </label>
                                            <Col sm={4} style={{ marginLeft: '-1.6%' }}>
                                                <OptionList
                                                    // readOnly={readOnly}
                                                    readOnly={employee || readOnly || peer}
                                                    name={'teamWork'}
                                                    selectedValue={
                                                        apprisalForm.selfreviewDTO &&
                                                        apprisalForm.selfreviewDTO.teamWork
                                                            ? apprisalForm.selfreviewDTO.teamWork[
                                                                  'mgrRating'
                                                              ]
                                                            : 1
                                                    }
                                                    onChangeHandler={onChangeHandler}
                                                />
                                                <span className="error">
                                                    {formErrors && formErrors.teamWorkMgr
                                                        ? formErrors.teamWorkMgr
                                                        : ' '}
                                                </span>
                                            </Col>
                                        </>
                                    )}
                                </>
                            )}
                        </Col>
                    </Form.Group>
                </div>

                <div class="col-">
                    <Form.Group as={Row} className="mb-3" controlId="formGroupToDate">
                        <Form.Label className="compatancyAssessment" column md={12}>
                            <label style={{ fontSize: '15px' }}>
                                {' '}
                                4.Adaptability and Flexibility
                            </label>
                            <div>
                                <label>
                                    How effectively do you adapt to changes and unexpected
                                    challenges ?<span className="error">*</span>
                                </label>
                            </div>
                        </Form.Label>
                        <Col md={12}>
                            <div>
                                <label>Employee Review</label>
                                {managerPrevieew || peer || manager || isHr || isCompleted ? (
                                    <p>
                                        {apprisalForm.selfreviewDTO &&
                                            apprisalForm.selfreviewDTO.workQuality[
                                                'employeeReview'
                                            ]}
                                    </p>
                                ) : (
                                    <Form.Control
                                        className="textBox"
                                        as={'textarea'}
                                        required
                                        // disabled={peer || manager}
                                        readOnly={readOnly}
                                        defaultValue={
                                            apprisalForm.selfreviewDTO &&
                                            apprisalForm.selfreviewDTO.workQuality['employeeReview']
                                        }
                                        onChange={onInputHandler}
                                        name="workQuality"
                                        type="text"
                                        maxLength={1000}
                                    />
                                )}

                                <span className="error">
                                    {formErrors && formErrors.workQualityEmp
                                        ? formErrors.workQualityEmp
                                        : ' '}
                                </span>
                                <p className="textAreaDatalength">
                                    {apprisalForm.selfreviewDTO &&
                                    apprisalForm.selfreviewDTO.workQuality &&
                                    apprisalForm.selfreviewDTO.workQuality['employeeReview'] == null
                                        ? 0
                                        : apprisalForm.selfreviewDTO &&
                                          apprisalForm.selfreviewDTO.workQuality['employeeReview']
                                              .length}
                                    /1000
                                </p>
                            </div>

                            {employee ? (
                                ''
                            ) : (
                                <>
                                    {apprisalForm.peerId == null ? (
                                        ''
                                    ) : (
                                        <div>
                                            <label style={{ marginTop: '1%' }}>
                                                Peer Review/Team Lead
                                            </label>
                                            {managerPrevieew || employee || manager || isHr ? (
                                                <p>
                                                    {apprisalForm.selfreviewDTO &&
                                                        apprisalForm.selfreviewDTO.workQuality[
                                                            'peerReview'
                                                        ]}
                                                </p>
                                            ) : (
                                                <Form.Control
                                                    className="textBox"
                                                    as={'textarea'}
                                                    required
                                                    // disabled={employee || manager}
                                                    readOnly={readOnly}
                                                    defaultValue={
                                                        apprisalForm.selfreviewDTO &&
                                                        apprisalForm.selfreviewDTO.workQuality[
                                                            'peerReview'
                                                        ]
                                                    }
                                                    onChange={onInputHandler}
                                                    name="workQuality"
                                                    type="text"
                                                    maxLength={1000}
                                                />
                                            )}

                                            <span className="error">
                                                {formErrors && formErrors.workQualityPeer
                                                    ? formErrors.workQualityPeer
                                                    : ' '}
                                            </span>
                                            <p className="textAreaDatalength">
                                                {apprisalForm.selfreviewDTO &&
                                                apprisalForm.selfreviewDTO.workQuality &&
                                                apprisalForm.selfreviewDTO.workQuality[
                                                    'peerReview'
                                                ] == null
                                                    ? 0
                                                    : apprisalForm.selfreviewDTO &&
                                                      apprisalForm.selfreviewDTO.workQuality[
                                                          'peerReview'
                                                      ].length}
                                                /1000
                                            </p>
                                        </div>
                                    )}
                                    {/* 
                            <p className='textAreaDatalength'>{formData && formData.additionalSkills ? formData.additionalSkills.length : 0}/1000</p> */}
                                    {peer ? (
                                        ''
                                    ) : (
                                        <>
                                            <label style={{ marginTop: '1%' }}>
                                                Manager Rating <span className="error">*</span>
                                            </label>
                                            <Col sm={4} style={{ marginLeft: '-1.6%' }}>
                                                <OptionList
                                                    // readOnly={readOnly}
                                                    readOnly={employee || readOnly || peer}
                                                    name={'workQuality'}
                                                    selectedValue={
                                                        apprisalForm.selfreviewDTO &&
                                                        apprisalForm.selfreviewDTO.workQuality
                                                            ? apprisalForm.selfreviewDTO
                                                                  .workQuality['mgrRating']
                                                            : 1
                                                    }
                                                    onChangeHandler={onChangeHandler}
                                                />
                                                <span className="error">
                                                    {formErrors && formErrors.workQualityMgr
                                                        ? formErrors.workQualityMgr
                                                        : ' '}
                                                </span>
                                            </Col>
                                        </>
                                    )}
                                </>
                            )}
                        </Col>
                    </Form.Group>
                </div>

                <div class="col-">
                    <Form.Group as={Row} className="mb-3" controlId="formGroupToDate">
                        <Form.Label className="compatancyAssessment" column md={12}>
                            <label style={{ fontSize: '15px' }}>
                                {' '}
                                5.Personal Development and Leadership skills
                            </label>
                            <div>
                                <label>
                                    How do you lead, motivate, and guide your team ?
                                    <span className="error">*</span>
                                </label>{' '}
                            </div>
                        </Form.Label>
                        <Col md={12}>
                            <div>
                                <label>Employee Review</label>
                                {managerPrevieew || peer || manager || isHr || isCompleted ? (
                                    <p>
                                        {apprisalForm.selfreviewDTO &&
                                            apprisalForm.selfreviewDTO.commSkills['employeeReview']}
                                    </p>
                                ) : (
                                    <Form.Control
                                        className="textBox"
                                        as={'textarea'}
                                        required
                                        // disabled={peer || manager}
                                        readOnly={readOnly}
                                        defaultValue={
                                            (apprisalForm.selfreviewDTO &&
                                                apprisalForm.selfreviewDTO.commSkills[
                                                    'employeeReview'
                                                ]) ||
                                            ''
                                        }
                                        onChange={onInputHandler}
                                        name="commSkills"
                                        type="text"
                                        maxLength={1000}
                                    />
                                )}
                                <span className="error">
                                    {formErrors && formErrors.commSkillsEmp
                                        ? formErrors.commSkillsEmp
                                        : ' '}
                                </span>
                                <p className="textAreaDatalength">
                                    {apprisalForm.selfreviewDTO &&
                                    apprisalForm.selfreviewDTO.commSkills &&
                                    apprisalForm.selfreviewDTO.commSkills['employeeReview'] == null
                                        ? 0
                                        : apprisalForm.selfreviewDTO &&
                                          apprisalForm.selfreviewDTO.commSkills['employeeReview']
                                              .length}
                                    /1000
                                </p>
                            </div>
                            {employee ? (
                                ''
                            ) : (
                                <>
                                    {apprisalForm.peerId == null ? (
                                        ''
                                    ) : (
                                        <div>
                                            <label style={{ marginTop: '1%' }}>
                                                Peer Review/Team Lead
                                            </label>
                                            {managerPrevieew || employee || manager || isHr ? (
                                                <p>
                                                    {apprisalForm.selfreviewDTO &&
                                                        apprisalForm.selfreviewDTO.workQuality[
                                                            'peerReview'
                                                        ]}
                                                </p>
                                            ) : (
                                                <Form.Control
                                                    className="textBox"
                                                    as={'textarea'}
                                                    required
                                                    disabled={employee || manager}
                                                    readOnly={readOnly}
                                                    defaultValue={
                                                        apprisalForm.selfreviewDTO &&
                                                        apprisalForm.selfreviewDTO.commSkills[
                                                            'peerReview'
                                                        ]
                                                    }
                                                    onChange={onInputHandler}
                                                    name="commSkills"
                                                    type="text"
                                                    maxLength={1000}
                                                />
                                            )}
                                            <span className="error">
                                                {formErrors && formErrors.commSkillsPeer
                                                    ? formErrors.commSkillsPeer
                                                    : ' '}
                                            </span>
                                            <p className="textAreaDatalength">
                                                {apprisalForm.selfreviewDTO &&
                                                apprisalForm.selfreviewDTO.commSkills &&
                                                apprisalForm.selfreviewDTO.commSkills[
                                                    'peerReview'
                                                ] == null
                                                    ? 0
                                                    : apprisalForm.selfreviewDTO &&
                                                      apprisalForm.selfreviewDTO.commSkills[
                                                          'peerReview'
                                                      ].length}
                                                /1000
                                            </p>
                                        </div>
                                    )}

                                    {peer ? (
                                        ''
                                    ) : (
                                        <>
                                            <label style={{ marginTop: '1%' }}>
                                                Manager Rating <span className="error">*</span>
                                            </label>
                                            <Col sm={4} style={{ marginLeft: '-1.6%' }}>
                                                <OptionList
                                                    // readOnly={readOnly}
                                                    readOnly={employee || readOnly || peer}
                                                    name={'commSkills'}
                                                    selectedValue={
                                                        apprisalForm.selfreviewDTO &&
                                                        apprisalForm.selfreviewDTO.commSkills
                                                            ? apprisalForm.selfreviewDTO.commSkills[
                                                                  'mgrRating'
                                                              ]
                                                            : 1
                                                    }
                                                    onChangeHandler={onChangeHandler}
                                                />
                                                <span className="error">
                                                    {formErrors && formErrors.commSkillsMgr
                                                        ? formErrors.commSkillsMgr
                                                        : ' '}
                                                </span>
                                            </Col>
                                        </>
                                    )}
                                </>
                            )}
                        </Col>
                    </Form.Group>
                </div>
            </div>
        </>
    )
}

export default RatingList
