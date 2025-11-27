import React, { useEffect, useState } from 'react' // Importing necessary React hooks
import RatingList from './RatingList' // Importing RatingList component
import Goals from './Goals' // Importing Goals component
import Form from 'react-bootstrap/Form' // Importing Form from React Bootstrap
import Row from 'react-bootstrap/Row' // Importing Row from React Bootstrap
import Col from 'react-bootstrap/Col' // Importing Col from React Bootstrap

// The SelfReview component handles the self-review form, displaying and managing user input based on different roles (employee, manager, HR, etc.)
const SelfReview = ({
    apprisalForm,
    isCompleted,
    managerPrevieew,
    employee,
    formErrors,
    peer,
    isHr,
    manager,
    readOnly
}) => {
    // Declaring state to store the goals associated with the self-review
    const [goals, setGoals] = useState(
        apprisalForm.selfreviewDTO ? apprisalForm.selfreviewDTO.goalDTOs : []
    )

    // Using the useEffect hook to set form data and goals when apprisalForm is updated
    useEffect(() => {
        setFormData(apprisalForm && apprisalForm.selfreviewDTO) // Setting form data based on apprisalForm's selfreviewDTO
        setGoals(apprisalForm.selfreviewDTO ? apprisalForm.selfreviewDTO.goalDTOs : []) // Setting goals if available in the selfreviewDTO
    }, [apprisalForm]) // Re-running when apprisalForm changes

    // useEffect hook to update the goalDTOs in apprisalForm when the goals state changes
    useEffect(() => {
        if (apprisalForm.selfreviewDTO) {
            apprisalForm.selfreviewDTO.goalDTOs = goals // Syncing updated goals back to apprisalForm
        }
    }, [goals]) // Re-running when goals state changes

    // Declaring state to hold form data, including user inputs like comments
    const [formData, setFormData] = useState({})

    // Handler to manage changes to input fields in the form
    const onInputHandler = (e) => {
        const { name, value } = e.target // Destructuring name and value from the event target
        setFormData({ ...formData, [name]: value }) // Updating formData state with the new value
        // Updating the apprisalForm's selfreviewDTO based on the input change
        if (apprisalForm.selfreviewDTO) {
            // If the current user is an employee, update the empComments, otherwise update mgrComments
            // Extract the base object for updating comments
            const review = apprisalForm.selfreviewDTO[name]
            // Assign the appropriate comment field based on the 'employee' condition
            if (employee) {
                review.empComments = value
            } else {
                review.mgrComments = value
            }
        }
    }

    // Returning the JSX that renders the self-review section, including input fields and other components
    return (
        <>
            <section className="section">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="">
                                {/* Goals Component for managing the goals section */}
                                <Goals
                                    isCompleted={isCompleted}
                                    managerPrevieew={managerPrevieew}
                                    goals={goals}
                                    setGoals={setGoals}
                                    readOnly={readOnly}
                                    formErrors={formErrors}
                                    peer={peer}
                                    isHr={isHr}
                                    employee={employee}
                                    manager={manager}
                                />

                                {/* Section for performance highlights */}
                                <div style={{ marginLeft: '2%', marginRight: '2%' }}>
                                    <h5
                                        style={{
                                            marginTop: '2%',
                                            marginBottom: '1%',
                                            color: '#364781'
                                        }}
                                    >
                                        <label>Performance Highlights</label>
                                    </h5>
                                    <div className="col-">
                                        {/* Input group for "accomplishments" (Employee's performance highlights) */}
                                        <Form.Group
                                            as={Row}
                                            className="mb-3"
                                            controlId="formGroupToDate"
                                        >
                                            <Form.Label className="" column md={12}>
                                                1. With Respect to your performance, what are a few
                                                areas where you made a big impact in the review
                                                period <span className="error">*</span> ?
                                            </Form.Label>
                                            <Col md={12}>
                                                <div>
                                                    <label>Employee</label>
                                                    {
                                                        // Depending on user roles (managerPreview, peer, etc.), show either a read-only paragraph or a text input
                                                        managerPrevieew ||
                                                        peer ||
                                                        manager ||
                                                        isHr ||
                                                        isCompleted ? (
                                                            <p>
                                                                {apprisalForm.selfreviewDTO &&
                                                                    apprisalForm.selfreviewDTO
                                                                        .accomplishments[
                                                                        'empComments'
                                                                    ]}
                                                            </p>
                                                        ) : (
                                                            <Form.Control
                                                                className="textBox"
                                                                as={'textarea'}
                                                                readOnly={readOnly}
                                                                defaultValue={
                                                                    apprisalForm.selfreviewDTO &&
                                                                    apprisalForm.selfreviewDTO
                                                                        .accomplishments[
                                                                        'empComments'
                                                                    ]
                                                                }
                                                                onChange={onInputHandler}
                                                                required
                                                                name="accomplishments"
                                                                type="text"
                                                                maxLength={1000}
                                                            />
                                                        )
                                                    }
                                                    {/* Display error message if there are validation errors */}
                                                    <span className="error">
                                                        {formErrors && formErrors.accomplishments
                                                            ? formErrors.accomplishments
                                                            : ' '}
                                                    </span>
                                                    <p className="textAreaDatalength">
                                                        {apprisalForm.selfreviewDTO &&
                                                        apprisalForm.selfreviewDTO
                                                            .accomplishments &&
                                                        apprisalForm.selfreviewDTO.accomplishments[
                                                            'empComments'
                                                        ] == null
                                                            ? 0
                                                            : apprisalForm.selfreviewDTO &&
                                                              apprisalForm.selfreviewDTO
                                                                  .accomplishments['empComments']
                                                                  .length}
                                                        /1000
                                                    </p>
                                                </div>

                                                {/* Manager comment section */}
                                                {employee || peer ? (
                                                    ''
                                                ) : (
                                                    <div>
                                                        <label style={{ marginTop: '2%' }}>
                                                            Manager <span className="error">*</span>
                                                        </label>
                                                        {managerPrevieew ||
                                                        employee ||
                                                        peer ||
                                                        isHr ? (
                                                            <p>
                                                                {apprisalForm.selfreviewDTO &&
                                                                    apprisalForm.selfreviewDTO
                                                                        .accomplishments[
                                                                        'mgrComments'
                                                                    ]}
                                                            </p>
                                                        ) : (
                                                            <Form.Control
                                                                className="textBox"
                                                                as={'textarea'}
                                                                disabled={employee || peer}
                                                                readOnly={readOnly}
                                                                defaultValue={
                                                                    apprisalForm.selfreviewDTO &&
                                                                    apprisalForm.selfreviewDTO
                                                                        .accomplishments[
                                                                        'mgrComments'
                                                                    ]
                                                                }
                                                                onChange={onInputHandler}
                                                                required
                                                                name="accomplishments"
                                                                type="text"
                                                                maxLength={1000}
                                                            />
                                                        )}
                                                        <span className="error">
                                                            {formErrors &&
                                                            formErrors.accomplishmentsManager
                                                                ? formErrors.accomplishmentsManager
                                                                : ' '}
                                                        </span>
                                                        <p className="textAreaDatalength">
                                                            {apprisalForm.selfreviewDTO &&
                                                            apprisalForm.selfreviewDTO
                                                                .accomplishments &&
                                                            apprisalForm.selfreviewDTO
                                                                .accomplishments['mgrComments'] ==
                                                                null
                                                                ? 0
                                                                : apprisalForm.selfreviewDTO &&
                                                                  apprisalForm.selfreviewDTO
                                                                      .accomplishments[
                                                                      'mgrComments'
                                                                  ].length}
                                                            /1000
                                                        </p>
                                                    </div>
                                                )}
                                            </Col>
                                        </Form.Group>
                                    </div>

                                    {/* Input group for "additional skills" (areas for improvement) */}
                                    <div className="col-">
                                        <Form.Group
                                            as={Row}
                                            className="mb-3"
                                            controlId="formGroupToDate"
                                        >
                                            <Form.Label className="" column md={12}>
                                                2. With Respect to your performance, what are a few
                                                areas that could have gone better in the review
                                                period <span className="error">*</span> ?
                                            </Form.Label>
                                            <Col md={12}>
                                                <div>
                                                    <label>Employee</label>
                                                    {managerPrevieew ||
                                                    peer ||
                                                    manager ||
                                                    isHr ||
                                                    isCompleted ? (
                                                        <p>
                                                            {apprisalForm.selfreviewDTO &&
                                                                apprisalForm.selfreviewDTO
                                                                    .additionalSkills[
                                                                    'empComments'
                                                                ]}
                                                        </p>
                                                    ) : (
                                                        <Form.Control
                                                            className="textBox"
                                                            as={'textarea'}
                                                            required
                                                            readOnly={readOnly}
                                                            defaultValue={
                                                                apprisalForm.selfreviewDTO &&
                                                                apprisalForm.selfreviewDTO
                                                                    .additionalSkills['empComments']
                                                            }
                                                            onChange={onInputHandler}
                                                            name="additionalSkills"
                                                            type="text"
                                                            maxLength={1000}
                                                        />
                                                    )}

                                                    {/* Display error message if there are validation errors */}
                                                    <span className="error">
                                                        {formErrors && formErrors.additionalSkills
                                                            ? formErrors.additionalSkills
                                                            : ' '}
                                                    </span>
                                                    <p className="textAreaDatalength">
                                                        {apprisalForm.selfreviewDTO &&
                                                        apprisalForm.selfreviewDTO
                                                            .additionalSkills &&
                                                        apprisalForm.selfreviewDTO.additionalSkills[
                                                            'empComments'
                                                        ] == null
                                                            ? 0
                                                            : apprisalForm.selfreviewDTO &&
                                                              apprisalForm.selfreviewDTO
                                                                  .additionalSkills['empComments']
                                                                  .length}
                                                        /1000
                                                    </p>
                                                </div>

                                                {/* Manager comment section */}
                                                {employee || peer ? (
                                                    ''
                                                ) : (
                                                    <div>
                                                        <label style={{ marginTop: '2%' }}>
                                                            Manager <span className="error">*</span>
                                                        </label>
                                                        {managerPrevieew ||
                                                        employee ||
                                                        peer ||
                                                        isHr ? (
                                                            <p>
                                                                {apprisalForm.selfreviewDTO &&
                                                                    apprisalForm.selfreviewDTO
                                                                        .additionalSkills[
                                                                        'mgrComments'
                                                                    ]}
                                                            </p>
                                                        ) : (
                                                            <Form.Control
                                                                className="textBox"
                                                                as={'textarea'}
                                                                required
                                                                readOnly={readOnly}
                                                                disabled={employee || peer}
                                                                defaultValue={
                                                                    apprisalForm.selfreviewDTO &&
                                                                    apprisalForm.selfreviewDTO
                                                                        .additionalSkills[
                                                                        'mgrComments'
                                                                    ]
                                                                }
                                                                onChange={onInputHandler}
                                                                name="additionalSkills"
                                                                type="text"
                                                                maxLength={1000}
                                                            />
                                                        )}
                                                        <span className="error">
                                                            {formErrors &&
                                                            formErrors.additionalSkillsManager
                                                                ? formErrors.additionalSkillsManager
                                                                : ' '}
                                                        </span>
                                                        <p className="textAreaDatalength">
                                                            {apprisalForm.selfreviewDTO &&
                                                            apprisalForm.selfreviewDTO
                                                                .additionalSkills &&
                                                            apprisalForm.selfreviewDTO
                                                                .additionalSkills['mgrComments'] ==
                                                                null
                                                                ? 0
                                                                : apprisalForm.selfreviewDTO &&
                                                                  apprisalForm.selfreviewDTO
                                                                      .additionalSkills[
                                                                      'mgrComments'
                                                                  ].length}
                                                            /1000
                                                        </p>
                                                    </div>
                                                )}
                                            </Col>
                                        </Form.Group>
                                    </div>
                                </div>

                                {/* RatingList Component to manage ratings section */}
                                <RatingList
                                    isCompleted={isCompleted}
                                    managerPrevieew={managerPrevieew}
                                    apprisalForm={apprisalForm}
                                    isHr={isHr}
                                    readOnly={readOnly}
                                    manager={manager}
                                    formErrors={formErrors}
                                    employee={employee}
                                    peer={peer}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
export default SelfReview
