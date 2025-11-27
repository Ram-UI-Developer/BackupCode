import React, { useEffect, useState } from 'react'
import OptionList from '../SelfReview/OptionList'

const EmployeeAndManagerReview = ({ isEmployee, apprisalForm, isManager, isPeer, readOnly }) => {
    // Define a state variable for storing the rating information from the appraisal form's regulatoryDTO
    const [rating, setRating] = useState(apprisalForm.regulatoryDTO)

    // useEffect hook to update the rating state whenever the regulatoryDTO in the appraisal form changes
    useEffect(() => {
        setRating(apprisalForm.regulatoryDTO)
    }, [rating])

    // Function to handle changes in the rating selection (employee, peer, or manager rating)
    const onChangeHandler = (select, name) => {
        // Update the rating object with the selected rating value for the given name
        setRating({ ...rating[name], empRating: select.value }) // Update employee rating
        setRating({ ...rating[name], mgrRating: select.value }) // Update manager rating

        // If the user is an employee, update the 'empRating' for the selected criteria and calculate the overall rating for the employee
        if (isEmployee) {
            apprisalForm.regulatoryDTO[name] = {
                ...apprisalForm.regulatoryDTO[name],
                empRating: select.value
            }
            // Calculate the employee's overall rating based on individual ratings for different criteria
            apprisalForm.regulatoryDTO.empOverallRating =
                (apprisalForm.regulatoryDTO.standards['empRating'] +
                    apprisalForm.regulatoryDTO.attendance['empRating'] +
                    apprisalForm.regulatoryDTO.loyalty['empRating'] +
                    apprisalForm.regulatoryDTO.collaborate['empRating'] +
                    apprisalForm.regulatoryDTO.performance['empRating'] +
                    apprisalForm.regulatoryDTO.effectiveness['empRating'] +
                    apprisalForm.regulatoryDTO.listening['empRating'] +
                    apprisalForm.regulatoryDTO.proactiveness['empRating'] +
                    apprisalForm.regulatoryDTO.policies['empRating'] +
                    apprisalForm.regulatoryDTO.adaptSituations['empRating'] +
                    apprisalForm.regulatoryDTO.consistent['empRating'] +
                    apprisalForm.regulatoryDTO.inTimeframe['empRating']) /
                12 // The sum of individual ratings divided by the number of criteria (12)
        }
        // If the user is a peer, update the 'peerRating' for the selected criteria and calculate the overall rating for the peer
        else if (isPeer) {
            apprisalForm.regulatoryDTO[name] = {
                ...apprisalForm.regulatoryDTO[name],
                peerRating: select.value
            }
            // Calculate the peer's overall rating based on individual ratings for different criteria
            apprisalForm.regulatoryDTO.peerOverallRating =
                (apprisalForm.regulatoryDTO.inTimeframe['peerRating'] +
                    apprisalForm.regulatoryDTO.standards['peerRating'] +
                    apprisalForm.regulatoryDTO.attendance['peerRating'] +
                    apprisalForm.regulatoryDTO.loyalty['peerRating'] +
                    apprisalForm.regulatoryDTO.collaborate['peerRating'] +
                    apprisalForm.regulatoryDTO.performance['peerRating'] +
                    apprisalForm.regulatoryDTO.effectiveness['peerRating'] +
                    apprisalForm.regulatoryDTO.listening['peerRating'] +
                    apprisalForm.regulatoryDTO.policies['peerRating'] +
                    apprisalForm.regulatoryDTO.proactiveness['peerRating'] +
                    apprisalForm.regulatoryDTO.adaptSituations['peerRating'] +
                    apprisalForm.regulatoryDTO.consistent['peerRating']) /
                12 // The sum of individual ratings divided by the number of criteria (12)
        }
        // If the user is a manager, update the 'mgrRating' for the selected criteria and calculate the overall rating for the manager
        else {
            apprisalForm.regulatoryDTO[name] = {
                ...apprisalForm.regulatoryDTO[name],
                mgrRating: select.value
            }
            // Calculate the manager's overall rating based on individual ratings for different criteria
            apprisalForm.regulatoryDTO.mrgOverallRating =
                (apprisalForm.selfreviewDTO.jobKnowl['mgrRating'] +
                    apprisalForm.selfreviewDTO.probSolve['mgrRating'] +
                    apprisalForm.selfreviewDTO.teamWork['mgrRating'] +
                    apprisalForm.selfreviewDTO.workQuality['mgrRating'] +
                    apprisalForm.selfreviewDTO.commSkills['mgrRating'] +
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
                    apprisalForm.regulatoryDTO.consistent['mgrRating']) /
                17 // The sum of individual ratings divided by the number of criteria (17)
        }
    }

    return (
        <div>
            {/* disable employee,manager,hr and peer conditionally and input filed of comment section*/}
            <section className="section">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="">
                                <div className="coreSkillTable">
                                    <div
                                        className={
                                            apprisalForm.peerId == null
                                                ? 'withoutpeerHeadings'
                                                : 'CoreSkillHeaddings'
                                        }
                                    >
                                        <div className="row">
                                            <div
                                                className="col-sm-4 lines"
                                                style={{ fontWeight: 'bolder' }}
                                            >
                                                Competency
                                            </div>
                                            <div className="col-sm-8">
                                                <div className="row ">
                                                    <div
                                                        className={
                                                            apprisalForm.peerId == null
                                                                ? 'col-sm-6 lines'
                                                                : 'col-sm-4 lines'
                                                        }
                                                        style={{ fontWeight: 'bolder' }}
                                                    >
                                                        Employee Rating
                                                    </div>

                                                    {apprisalForm.peerId == null ? (
                                                        ''
                                                    ) : (
                                                        <div
                                                            className="col-sm-4 lines"
                                                            style={{ fontWeight: 'bolder' }}
                                                        >
                                                            Peer Rating
                                                        </div>
                                                    )}
                                                    <div
                                                        className={
                                                            apprisalForm.peerId == null
                                                                ? 'col-sm-6 lines withOutPeerRHead '
                                                                : 'col-sm-4 lines managerRHead'
                                                        }
                                                        style={{ fontWeight: 'bolder' }}
                                                    >
                                                        Manager Rating
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-sm-4 lines">
                                                Completion of work within the time frame
                                            </div>
                                            <div className="col-sm lines">
                                                <div className="col-sm">
                                                    <div className="row">
                                                        <div
                                                            className={
                                                                apprisalForm.peerId == null
                                                                    ? 'col-sm-6 lines'
                                                                    : 'col-sm-4 lines'
                                                            }
                                                        >
                                                            <OptionList
                                                                readOnly={
                                                                    isPeer || isManager || readOnly
                                                                }
                                                                name={'inTimeframe'}
                                                                selectedValue={
                                                                    apprisalForm.regulatoryDTO &&
                                                                    apprisalForm.regulatoryDTO
                                                                        .inTimeframe
                                                                        ? apprisalForm.regulatoryDTO
                                                                              .inTimeframe[
                                                                              'empRating'
                                                                          ]
                                                                        : 0
                                                                }
                                                                // selectedValue={apprisalForm.regulatoryDTO && apprisalForm.regulatoryDTO.jobReqRes ? apprisalForm.regulatoryDTO.jobReqRes[isManager ? 'mgrRating' : 'empRating'] : 0}
                                                                onChangeHandler={onChangeHandler}
                                                            />
                                                        </div>
                                                        {apprisalForm.peerId == null ? (
                                                            ''
                                                        ) : (
                                                            <div className="col-sm-4 lines">
                                                                <OptionList
                                                                    readOnly={
                                                                        isEmployee ||
                                                                        isManager ||
                                                                        readOnly
                                                                    }
                                                                    name={'inTimeframe'}
                                                                    selectedValue={
                                                                        apprisalForm.regulatoryDTO &&
                                                                        apprisalForm.regulatoryDTO
                                                                            .inTimeframe
                                                                            ? apprisalForm
                                                                                  .regulatoryDTO
                                                                                  .inTimeframe[
                                                                                  'peerRating'
                                                                              ]
                                                                            : 0
                                                                    }
                                                                    // selectedValue={apprisalForm.regulatoryDTO && apprisalForm.regulatoryDTO.jobReqRes ? apprisalForm.regulatoryDTO.jobReqRes[isManager ? 'mgrRating' : 'empRating'] : 0}
                                                                    onChangeHandler={
                                                                        onChangeHandler
                                                                    }
                                                                />
                                                            </div>
                                                        )}

                                                        <div
                                                            className={
                                                                apprisalForm.peerId == null
                                                                    ? 'col-sm-6 lines withOutPeerRHead  '
                                                                    : 'col-sm-4 lines managerRHead '
                                                            }
                                                        >
                                                            <OptionList
                                                                readOnly={
                                                                    isEmployee || isPeer || readOnly
                                                                }
                                                                name={'inTimeframe'}
                                                                selectedValue={
                                                                    apprisalForm.regulatoryDTO &&
                                                                    apprisalForm.regulatoryDTO
                                                                        .inTimeframe
                                                                        ? apprisalForm.regulatoryDTO
                                                                              .inTimeframe[
                                                                              'mgrRating'
                                                                          ]
                                                                        : 0
                                                                }
                                                                // selectedValue={apprisalForm.regulatoryDTO && apprisalForm.regulatoryDTO.jobReqRes ? apprisalForm.regulatoryDTO.jobReqRes[isManager ? 'mgrRating' : 'empRating'] : 0}
                                                                onChangeHandler={onChangeHandler}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-4 lines">
                                                Upholding professional standards and ethical
                                                behavior
                                            </div>
                                            <div className="col-sm lines">
                                                <div className="col-sm">
                                                    <div className="row">
                                                        <div
                                                            className={
                                                                apprisalForm.peerId == null
                                                                    ? 'col-sm-6 lines'
                                                                    : 'col-sm-4 lines '
                                                            }
                                                        >
                                                            <OptionList
                                                                readOnly={
                                                                    isPeer || isManager || readOnly
                                                                }
                                                                name={'standards'}
                                                                selectedValue={
                                                                    apprisalForm.regulatoryDTO &&
                                                                    apprisalForm.regulatoryDTO
                                                                        .standards
                                                                        ? apprisalForm.regulatoryDTO
                                                                              .standards[
                                                                              'empRating'
                                                                          ]
                                                                        : 0
                                                                }
                                                                // selectedValue={apprisalForm.regulatoryDTO && apprisalForm.regulatoryDTO.jobReqRes ? apprisalForm.regulatoryDTO.jobReqRes[isManager ? 'mgrRating' : 'empRating'] : 0}
                                                                onChangeHandler={onChangeHandler}
                                                            />
                                                        </div>
                                                        {apprisalForm.peerId == null ? (
                                                            ''
                                                        ) : (
                                                            <div className="col-sm-4 lines">
                                                                <OptionList
                                                                    readOnly={
                                                                        isEmployee ||
                                                                        isManager ||
                                                                        readOnly
                                                                    }
                                                                    name={'standards'}
                                                                    selectedValue={
                                                                        apprisalForm.regulatoryDTO &&
                                                                        apprisalForm.regulatoryDTO
                                                                            .standards
                                                                            ? apprisalForm
                                                                                  .regulatoryDTO
                                                                                  .standards[
                                                                                  'peerRating'
                                                                              ]
                                                                            : 0
                                                                    }
                                                                    // selectedValue={apprisalForm.regulatoryDTO && apprisalForm.regulatoryDTO.jobReqRes ? apprisalForm.regulatoryDTO.jobReqRes[isManager ? 'mgrRating' : 'empRating'] : 0}
                                                                    onChangeHandler={
                                                                        onChangeHandler
                                                                    }
                                                                />
                                                            </div>
                                                        )}

                                                        <div
                                                            className={
                                                                apprisalForm.peerId == null
                                                                    ? 'col-sm-6 lines withOutPeerRHead'
                                                                    : 'col-sm-4 lines managerRHead'
                                                            }
                                                        >
                                                            <OptionList
                                                                readOnly={
                                                                    isEmployee || isPeer || readOnly
                                                                }
                                                                name={'standards'}
                                                                selectedValue={
                                                                    apprisalForm.regulatoryDTO &&
                                                                    apprisalForm.regulatoryDTO
                                                                        .standards
                                                                        ? apprisalForm.regulatoryDTO
                                                                              .standards[
                                                                              'mgrRating'
                                                                          ]
                                                                        : 0
                                                                }
                                                                // selectedValue={apprisalForm.regulatoryDTO && apprisalForm.regulatoryDTO.jobReqRes ? apprisalForm.regulatoryDTO.jobReqRes[isManager ? 'mgrRating' : 'empRating'] : 0}
                                                                onChangeHandler={onChangeHandler}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-4 lines">
                                                Regularity and timeliness in attendance
                                            </div>
                                            <div className="col-sm lines">
                                                <div className="col-sm">
                                                    <div className="row">
                                                        <div
                                                            className={
                                                                apprisalForm.peerId == null
                                                                    ? 'col-sm-6 lines'
                                                                    : 'col-sm-4 lines '
                                                            }
                                                        >
                                                            <OptionList
                                                                readOnly={
                                                                    isPeer || isManager || readOnly
                                                                }
                                                                name={'attendance'}
                                                                selectedValue={
                                                                    apprisalForm.regulatoryDTO &&
                                                                    apprisalForm.regulatoryDTO
                                                                        .attendance
                                                                        ? apprisalForm.regulatoryDTO
                                                                              .attendance[
                                                                              'empRating'
                                                                          ]
                                                                        : 0
                                                                }
                                                                // selectedValue={apprisalForm.regulatoryDTO && apprisalForm.regulatoryDTO.jobReqRes ? apprisalForm.regulatoryDTO.jobReqRes[isManager ? 'mgrRating' : 'empRating'] : 0}
                                                                onChangeHandler={onChangeHandler}
                                                            />
                                                        </div>
                                                        {apprisalForm.peerId == null ? (
                                                            ''
                                                        ) : (
                                                            <div className="col-sm-4 lines">
                                                                <OptionList
                                                                    readOnly={
                                                                        isEmployee ||
                                                                        isManager ||
                                                                        readOnly
                                                                    }
                                                                    name={'attendance'}
                                                                    selectedValue={
                                                                        apprisalForm.regulatoryDTO &&
                                                                        apprisalForm.regulatoryDTO
                                                                            .attendance
                                                                            ? apprisalForm
                                                                                  .regulatoryDTO
                                                                                  .attendance[
                                                                                  'peerRating'
                                                                              ]
                                                                            : 0
                                                                    }
                                                                    // selectedValue={apprisalForm.regulatoryDTO && apprisalForm.regulatoryDTO.jobReqRes ? apprisalForm.regulatoryDTO.jobReqRes[isManager ? 'mgrRating' : 'empRating'] : 0}
                                                                    onChangeHandler={
                                                                        onChangeHandler
                                                                    }
                                                                />
                                                            </div>
                                                        )}

                                                        <div
                                                            className={
                                                                apprisalForm.peerId == null
                                                                    ? 'col-sm-6 lines withOutPeerRHead'
                                                                    : 'col-sm-4 lines managerRHead'
                                                            }
                                                        >
                                                            <OptionList
                                                                readOnly={
                                                                    isEmployee || isPeer || readOnly
                                                                }
                                                                name={'attendance'}
                                                                selectedValue={
                                                                    apprisalForm.regulatoryDTO &&
                                                                    apprisalForm.regulatoryDTO
                                                                        .attendance
                                                                        ? apprisalForm.regulatoryDTO
                                                                              .attendance[
                                                                              'mgrRating'
                                                                          ]
                                                                        : 0
                                                                }
                                                                // selectedValue={apprisalForm.regulatoryDTO && apprisalForm.regulatoryDTO.jobReqRes ? apprisalForm.regulatoryDTO.jobReqRes[isManager ? 'mgrRating' : 'empRating'] : 0}
                                                                onChangeHandler={onChangeHandler}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-4 lines">
                                                Dedication and loyalty towards work and organization
                                            </div>
                                            <div className="col-sm lines">
                                                <div className="col-sm">
                                                    <div className="row">
                                                        <div
                                                            className={
                                                                apprisalForm.peerId == null
                                                                    ? 'col-sm-6 lines'
                                                                    : 'col-sm-4 lines '
                                                            }
                                                        >
                                                            <OptionList
                                                                readOnly={
                                                                    isPeer || isManager || readOnly
                                                                }
                                                                name={'loyalty'}
                                                                selectedValue={
                                                                    apprisalForm.regulatoryDTO &&
                                                                    apprisalForm.regulatoryDTO
                                                                        .loyalty
                                                                        ? apprisalForm.regulatoryDTO
                                                                              .loyalty['empRating']
                                                                        : 0
                                                                }
                                                                // selectedValue={apprisalForm.regulatoryDTO && apprisalForm.regulatoryDTO.jobReqRes ? apprisalForm.regulatoryDTO.jobReqRes[isManager ? 'mgrRating' : 'empRating'] : 0}
                                                                onChangeHandler={onChangeHandler}
                                                            />
                                                        </div>
                                                        {apprisalForm.peerId == null ? (
                                                            ''
                                                        ) : (
                                                            <div className="col-sm-4 lines">
                                                                <OptionList
                                                                    readOnly={
                                                                        isEmployee ||
                                                                        isManager ||
                                                                        readOnly
                                                                    }
                                                                    name={'loyalty'}
                                                                    selectedValue={
                                                                        apprisalForm.regulatoryDTO &&
                                                                        apprisalForm.regulatoryDTO
                                                                            .loyalty
                                                                            ? apprisalForm
                                                                                  .regulatoryDTO
                                                                                  .loyalty[
                                                                                  'peerRating'
                                                                              ]
                                                                            : 0
                                                                    }
                                                                    // selectedValue={apprisalForm.regulatoryDTO && apprisalForm.regulatoryDTO.jobReqRes ? apprisalForm.regulatoryDTO.jobReqRes[isManager ? 'mgrRating' : 'empRating'] : 0}
                                                                    onChangeHandler={
                                                                        onChangeHandler
                                                                    }
                                                                />
                                                            </div>
                                                        )}
                                                        <div
                                                            className={
                                                                apprisalForm.peerId == null
                                                                    ? 'col-sm-6 lines withOutPeerRHead'
                                                                    : 'col-sm-4 lines managerRHead'
                                                            }
                                                        >
                                                            <OptionList
                                                                readOnly={
                                                                    isEmployee || isPeer || readOnly
                                                                }
                                                                name={'loyalty'}
                                                                selectedValue={
                                                                    apprisalForm.regulatoryDTO &&
                                                                    apprisalForm.regulatoryDTO
                                                                        .loyalty
                                                                        ? apprisalForm.regulatoryDTO
                                                                              .loyalty['mgrRating']
                                                                        : 0
                                                                }
                                                                // selectedValue={apprisalForm.regulatoryDTO && apprisalForm.regulatoryDTO.jobReqRes ? apprisalForm.regulatoryDTO.jobReqRes[isManager ? 'mgrRating' : 'empRating'] : 0}
                                                                onChangeHandler={onChangeHandler}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-4 lines">
                                                Ability to collaborate with diverse individuals
                                            </div>
                                            <div className="col-sm lines">
                                                <div className="col-sm">
                                                    <div className="row">
                                                        <div
                                                            className={
                                                                apprisalForm.peerId == null
                                                                    ? 'col-sm-6 lines'
                                                                    : 'col-sm-4 lines '
                                                            }
                                                        >
                                                            <OptionList
                                                                readOnly={
                                                                    isPeer || isManager || readOnly
                                                                }
                                                                name={'collaborate'}
                                                                selectedValue={
                                                                    apprisalForm.regulatoryDTO &&
                                                                    apprisalForm.regulatoryDTO
                                                                        .collaborate
                                                                        ? apprisalForm.regulatoryDTO
                                                                              .collaborate[
                                                                              'empRating'
                                                                          ]
                                                                        : 0
                                                                }
                                                                // selectedValue={apprisalForm.regulatoryDTO && apprisalForm.regulatoryDTO.jobReqRes ? apprisalForm.regulatoryDTO.jobReqRes[isManager ? 'mgrRating' : 'empRating'] : 0}
                                                                onChangeHandler={onChangeHandler}
                                                            />
                                                        </div>
                                                        {apprisalForm.peerId == null ? (
                                                            ''
                                                        ) : (
                                                            <div className="col-sm-4 lines">
                                                                <OptionList
                                                                    readOnly={
                                                                        isEmployee ||
                                                                        isManager ||
                                                                        readOnly
                                                                    }
                                                                    name={'collaborate'}
                                                                    selectedValue={
                                                                        apprisalForm.regulatoryDTO &&
                                                                        apprisalForm.regulatoryDTO
                                                                            .collaborate
                                                                            ? apprisalForm
                                                                                  .regulatoryDTO
                                                                                  .collaborate[
                                                                                  'peerRating'
                                                                              ]
                                                                            : 0
                                                                    }
                                                                    // selectedValue={apprisalForm.regulatoryDTO && apprisalForm.regulatoryDTO.jobReqRes ? apprisalForm.regulatoryDTO.jobReqRes[isManager ? 'mgrRating' : 'empRating'] : 0}
                                                                    onChangeHandler={
                                                                        onChangeHandler
                                                                    }
                                                                />
                                                            </div>
                                                        )}
                                                        <div
                                                            className={
                                                                apprisalForm.peerId == null
                                                                    ? 'col-sm-6 lines withOutPeerRHead'
                                                                    : 'col-sm-4 lines managerRHead'
                                                            }
                                                        >
                                                            <OptionList
                                                                readOnly={
                                                                    isEmployee || isPeer || readOnly
                                                                }
                                                                name={'collaborate'}
                                                                selectedValue={
                                                                    apprisalForm.regulatoryDTO &&
                                                                    apprisalForm.regulatoryDTO
                                                                        .collaborate
                                                                        ? apprisalForm.regulatoryDTO
                                                                              .collaborate[
                                                                              'mgrRating'
                                                                          ]
                                                                        : 0
                                                                }
                                                                // selectedValue={apprisalForm.regulatoryDTO && apprisalForm.regulatoryDTO.jobReqRes ? apprisalForm.regulatoryDTO.jobReqRes[isManager ? 'mgrRating' : 'empRating'] : 0}
                                                                onChangeHandler={onChangeHandler}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-4 lines">
                                                Consistency and reliability in performing duties
                                            </div>
                                            <div className="col-sm lines">
                                                <div className="col-sm">
                                                    <div className="row">
                                                        <div
                                                            className={
                                                                apprisalForm.peerId == null
                                                                    ? 'col-sm-6 lines'
                                                                    : 'col-sm-4 lines '
                                                            }
                                                        >
                                                            <OptionList
                                                                readOnly={
                                                                    isPeer || isManager || readOnly
                                                                }
                                                                name={'performance'}
                                                                selectedValue={
                                                                    apprisalForm.regulatoryDTO &&
                                                                    apprisalForm.regulatoryDTO
                                                                        .performance
                                                                        ? apprisalForm.regulatoryDTO
                                                                              .performance[
                                                                              'empRating'
                                                                          ]
                                                                        : 0
                                                                }
                                                                // selectedValue={apprisalForm.regulatoryDTO && apprisalForm.regulatoryDTO.jobReqRes ? apprisalForm.regulatoryDTO.jobReqRes[isManager ? 'mgrRating' : 'empRating'] : 0}
                                                                onChangeHandler={onChangeHandler}
                                                            />
                                                        </div>
                                                        {apprisalForm.peerId == null ? (
                                                            ''
                                                        ) : (
                                                            <div className="col-sm-4 lines">
                                                                <OptionList
                                                                    readOnly={
                                                                        isEmployee ||
                                                                        isManager ||
                                                                        readOnly
                                                                    }
                                                                    name={'performance'}
                                                                    selectedValue={
                                                                        apprisalForm.regulatoryDTO &&
                                                                        apprisalForm.regulatoryDTO
                                                                            .performance
                                                                            ? apprisalForm
                                                                                  .regulatoryDTO
                                                                                  .performance[
                                                                                  'peerRating'
                                                                              ]
                                                                            : 0
                                                                    }
                                                                    // selectedValue={apprisalForm.regulatoryDTO && apprisalForm.regulatoryDTO.jobReqRes ? apprisalForm.regulatoryDTO.jobReqRes[isManager ? 'mgrRating' : 'empRating'] : 0}
                                                                    onChangeHandler={
                                                                        onChangeHandler
                                                                    }
                                                                />
                                                            </div>
                                                        )}
                                                        <div
                                                            className={
                                                                apprisalForm.peerId == null
                                                                    ? 'col-sm-6 lines withOutPeerRHead'
                                                                    : 'col-sm-4 lines managerRHead'
                                                            }
                                                        >
                                                            <OptionList
                                                                readOnly={
                                                                    isEmployee || isPeer || readOnly
                                                                }
                                                                name={'performance'}
                                                                selectedValue={
                                                                    apprisalForm.regulatoryDTO &&
                                                                    apprisalForm.regulatoryDTO
                                                                        .performance
                                                                        ? apprisalForm.regulatoryDTO
                                                                              .performance[
                                                                              'mgrRating'
                                                                          ]
                                                                        : 0
                                                                }
                                                                // selectedValue={apprisalForm.regulatoryDTO && apprisalForm.regulatoryDTO.jobReqRes ? apprisalForm.regulatoryDTO.jobReqRes[isManager ? 'mgrRating' : 'empRating'] : 0}
                                                                onChangeHandler={onChangeHandler}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-4 lines">
                                                Effectiveness in conveying information
                                            </div>
                                            <div className="col-sm lines">
                                                <div className="col-sm">
                                                    <div className="row">
                                                        <div
                                                            className={
                                                                apprisalForm.peerId == null
                                                                    ? 'col-sm-6 lines '
                                                                    : 'col-sm-4 lines '
                                                            }
                                                        >
                                                            <OptionList
                                                                readOnly={
                                                                    isPeer || isManager || readOnly
                                                                }
                                                                name={'effectiveness'}
                                                                selectedValue={
                                                                    apprisalForm.regulatoryDTO &&
                                                                    apprisalForm.regulatoryDTO
                                                                        .effectiveness
                                                                        ? apprisalForm.regulatoryDTO
                                                                              .effectiveness[
                                                                              'empRating'
                                                                          ]
                                                                        : 0
                                                                }
                                                                // selectedValue={apprisalForm.regulatoryDTO && apprisalForm.regulatoryDTO.jobReqRes ? apprisalForm.regulatoryDTO.jobReqRes[isManager ? 'mgrRating' : 'empRating'] : 0}
                                                                onChangeHandler={onChangeHandler}
                                                            />
                                                        </div>
                                                        {apprisalForm.peerId == null ? (
                                                            ''
                                                        ) : (
                                                            <div className="col-sm-4 lines">
                                                                <OptionList
                                                                    readOnly={
                                                                        isEmployee ||
                                                                        isManager ||
                                                                        readOnly
                                                                    }
                                                                    name={'effectiveness'}
                                                                    selectedValue={
                                                                        apprisalForm.regulatoryDTO &&
                                                                        apprisalForm.regulatoryDTO
                                                                            .effectiveness
                                                                            ? apprisalForm
                                                                                  .regulatoryDTO
                                                                                  .effectiveness[
                                                                                  'peerRating'
                                                                              ]
                                                                            : 0
                                                                    }
                                                                    // selectedValue={apprisalForm.regulatoryDTO && apprisalForm.regulatoryDTO.jobReqRes ? apprisalForm.regulatoryDTO.jobReqRes[isManager ? 'mgrRating' : 'empRating'] : 0}
                                                                    onChangeHandler={
                                                                        onChangeHandler
                                                                    }
                                                                />
                                                            </div>
                                                        )}
                                                        <div
                                                            className={
                                                                apprisalForm.peerId == null
                                                                    ? 'col-sm-6 lines withOutPeerRHead'
                                                                    : 'col-sm-4 lines managerRHead'
                                                            }
                                                        >
                                                            <OptionList
                                                                readOnly={
                                                                    isEmployee || isPeer || readOnly
                                                                }
                                                                name={'effectiveness'}
                                                                selectedValue={
                                                                    apprisalForm.regulatoryDTO &&
                                                                    apprisalForm.regulatoryDTO
                                                                        .effectiveness
                                                                        ? apprisalForm.regulatoryDTO
                                                                              .effectiveness[
                                                                              'mgrRating'
                                                                          ]
                                                                        : 0
                                                                }
                                                                // selectedValue={apprisalForm.regulatoryDTO && apprisalForm.regulatoryDTO.jobReqRes ? apprisalForm.regulatoryDTO.jobReqRes[isManager ? 'mgrRating' : 'empRating'] : 0}
                                                                onChangeHandler={onChangeHandler}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-4 lines">
                                                Active and attentive listening
                                            </div>
                                            <div className="col-sm lines">
                                                <div className="col-sm">
                                                    <div className="row">
                                                        <div
                                                            className={
                                                                apprisalForm.peerId == null
                                                                    ? 'col-sm-6 lines'
                                                                    : 'col-sm-4 lines '
                                                            }
                                                        >
                                                            <OptionList
                                                                readOnly={
                                                                    isPeer || isManager || readOnly
                                                                }
                                                                name={'listening'}
                                                                selectedValue={
                                                                    apprisalForm.regulatoryDTO &&
                                                                    apprisalForm.regulatoryDTO
                                                                        .listening
                                                                        ? apprisalForm.regulatoryDTO
                                                                              .listening[
                                                                              'empRating'
                                                                          ]
                                                                        : 0
                                                                }
                                                                // selectedValue={apprisalForm.regulatoryDTO && apprisalForm.regulatoryDTO.jobReqRes ? apprisalForm.regulatoryDTO.jobReqRes[isManager ? 'mgrRating' : 'empRating'] : 0}
                                                                onChangeHandler={onChangeHandler}
                                                            />
                                                        </div>
                                                        {apprisalForm.peerId == null ? (
                                                            ''
                                                        ) : (
                                                            <div className="col-sm-4 lines">
                                                                <OptionList
                                                                    readOnly={
                                                                        isEmployee ||
                                                                        isManager ||
                                                                        readOnly
                                                                    }
                                                                    name={'listening'}
                                                                    selectedValue={
                                                                        apprisalForm.regulatoryDTO &&
                                                                        apprisalForm.regulatoryDTO
                                                                            .listening
                                                                            ? apprisalForm
                                                                                  .regulatoryDTO
                                                                                  .listening[
                                                                                  'peerRating'
                                                                              ]
                                                                            : 0
                                                                    }
                                                                    // selectedValue={apprisalForm.regulatoryDTO && apprisalForm.regulatoryDTO.jobReqRes ? apprisalForm.regulatoryDTO.jobReqRes[isManager ? 'mgrRating' : 'empRating'] : 0}
                                                                    onChangeHandler={
                                                                        onChangeHandler
                                                                    }
                                                                />
                                                            </div>
                                                        )}
                                                        <div
                                                            className={
                                                                apprisalForm.peerId == null
                                                                    ? 'col-sm-6 lines withOutPeerRHead'
                                                                    : 'col-sm-4 lines managerRHead'
                                                            }
                                                        >
                                                            <OptionList
                                                                readOnly={
                                                                    isEmployee || isPeer || readOnly
                                                                }
                                                                name={'listening'}
                                                                selectedValue={
                                                                    apprisalForm.regulatoryDTO &&
                                                                    apprisalForm.regulatoryDTO
                                                                        .listening
                                                                        ? apprisalForm.regulatoryDTO
                                                                              .listening[
                                                                              'mgrRating'
                                                                          ]
                                                                        : 0
                                                                }
                                                                // selectedValue={apprisalForm.regulatoryDTO && apprisalForm.regulatoryDTO.jobReqRes ? apprisalForm.regulatoryDTO.jobReqRes[isManager ? 'mgrRating' : 'empRating'] : 0}
                                                                onChangeHandler={onChangeHandler}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-4 lines">
                                                Proactiveness and creative thinking
                                            </div>
                                            <div className="col-sm lines">
                                                <div className="col-sm">
                                                    <div className="row">
                                                        <div
                                                            className={
                                                                apprisalForm.peerId == null
                                                                    ? 'col-sm-6 lines'
                                                                    : 'col-sm-4 lines '
                                                            }
                                                        >
                                                            <OptionList
                                                                readOnly={
                                                                    isPeer || isManager || readOnly
                                                                }
                                                                name={'proactiveness'}
                                                                selectedValue={
                                                                    apprisalForm.regulatoryDTO &&
                                                                    apprisalForm.regulatoryDTO
                                                                        .proactiveness
                                                                        ? apprisalForm.regulatoryDTO
                                                                              .proactiveness[
                                                                              'empRating'
                                                                          ]
                                                                        : 0
                                                                }
                                                                // selectedValue={apprisalForm.regulatoryDTO && apprisalForm.regulatoryDTO.jobReqRes ? apprisalForm.regulatoryDTO.jobReqRes[isManager ? 'mgrRating' : 'empRating'] : 0}
                                                                onChangeHandler={onChangeHandler}
                                                            />
                                                        </div>
                                                        {apprisalForm.peerId == null ? (
                                                            ''
                                                        ) : (
                                                            <div className="col-sm-4 lines">
                                                                <OptionList
                                                                    readOnly={
                                                                        isEmployee ||
                                                                        isManager ||
                                                                        readOnly
                                                                    }
                                                                    name={'proactiveness'}
                                                                    selectedValue={
                                                                        apprisalForm.regulatoryDTO &&
                                                                        apprisalForm.regulatoryDTO
                                                                            .proactiveness
                                                                            ? apprisalForm
                                                                                  .regulatoryDTO
                                                                                  .proactiveness[
                                                                                  'peerRating'
                                                                              ]
                                                                            : 0
                                                                    }
                                                                    // selectedValue={apprisalForm.regulatoryDTO && apprisalForm.regulatoryDTO.jobReqRes ? apprisalForm.regulatoryDTO.jobReqRes[isManager ? 'mgrRating' : 'empRating'] : 0}
                                                                    onChangeHandler={
                                                                        onChangeHandler
                                                                    }
                                                                />
                                                            </div>
                                                        )}
                                                        <div
                                                            className={
                                                                apprisalForm.peerId == null
                                                                    ? 'col-sm-6 lines withOutPeerRHead'
                                                                    : 'col-sm-4 lines managerRHead'
                                                            }
                                                        >
                                                            <OptionList
                                                                readOnly={
                                                                    isEmployee || isPeer || readOnly
                                                                }
                                                                name={'proactiveness'}
                                                                selectedValue={
                                                                    apprisalForm.regulatoryDTO &&
                                                                    apprisalForm.regulatoryDTO
                                                                        .proactiveness
                                                                        ? apprisalForm.regulatoryDTO
                                                                              .proactiveness[
                                                                              'mgrRating'
                                                                          ]
                                                                        : 0
                                                                }
                                                                // selectedValue={apprisalForm.regulatoryDTO && apprisalForm.regulatoryDTO.jobReqRes ? apprisalForm.regulatoryDTO.jobReqRes[isManager ? 'mgrRating' : 'empRating'] : 0}
                                                                onChangeHandler={onChangeHandler}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-4 lines">
                                                Adherence to organizational policies and procedures
                                            </div>
                                            <div className="col-sm lines">
                                                <div className="col-sm">
                                                    <div className="row">
                                                        <div
                                                            className={
                                                                apprisalForm.peerId == null
                                                                    ? 'col-sm-6 lines'
                                                                    : 'col-sm-4 lines '
                                                            }
                                                        >
                                                            <OptionList
                                                                readOnly={
                                                                    isPeer || isManager || readOnly
                                                                }
                                                                name={'policies'}
                                                                selectedValue={
                                                                    apprisalForm.regulatoryDTO &&
                                                                    apprisalForm.regulatoryDTO
                                                                        .policies
                                                                        ? apprisalForm.regulatoryDTO
                                                                              .policies['empRating']
                                                                        : 0
                                                                }
                                                                // selectedValue={apprisalForm.regulatoryDTO && apprisalForm.regulatoryDTO.jobReqRes ? apprisalForm.regulatoryDTO.jobReqRes[isManager ? 'mgrRating' : 'empRating'] : 0}
                                                                onChangeHandler={onChangeHandler}
                                                            />
                                                        </div>
                                                        {apprisalForm.peerId == null ? (
                                                            ''
                                                        ) : (
                                                            <div className="col-sm-4 lines">
                                                                <OptionList
                                                                    readOnly={
                                                                        isEmployee ||
                                                                        isManager ||
                                                                        readOnly
                                                                    }
                                                                    name={'policies'}
                                                                    selectedValue={
                                                                        apprisalForm.regulatoryDTO &&
                                                                        apprisalForm.regulatoryDTO
                                                                            .policies
                                                                            ? apprisalForm
                                                                                  .regulatoryDTO
                                                                                  .policies[
                                                                                  'peerRating'
                                                                              ]
                                                                            : 0
                                                                    }
                                                                    // selectedValue={apprisalForm.regulatoryDTO && apprisalForm.regulatoryDTO.jobReqRes ? apprisalForm.regulatoryDTO.jobReqRes[isManager ? 'mgrRating' : 'empRating'] : 0}
                                                                    onChangeHandler={
                                                                        onChangeHandler
                                                                    }
                                                                />
                                                            </div>
                                                        )}
                                                        <div
                                                            className={
                                                                apprisalForm.peerId == null
                                                                    ? 'col-sm-6 lines withOutPeerRHead'
                                                                    : 'col-sm-4 lines managerRHead'
                                                            }
                                                        >
                                                            <OptionList
                                                                readOnly={
                                                                    isEmployee || isPeer || readOnly
                                                                }
                                                                name={'policies'}
                                                                selectedValue={
                                                                    apprisalForm.regulatoryDTO &&
                                                                    apprisalForm.regulatoryDTO
                                                                        .policies
                                                                        ? apprisalForm.regulatoryDTO
                                                                              .policies['mgrRating']
                                                                        : 0
                                                                }
                                                                // selectedValue={apprisalForm.regulatoryDTO && apprisalForm.regulatoryDTO.jobReqRes ? apprisalForm.regulatoryDTO.jobReqRes[isManager ? 'mgrRating' : 'empRating'] : 0}
                                                                onChangeHandler={onChangeHandler}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-4 lines">
                                                Ability to adapt to changing situations
                                            </div>
                                            <div className="col-sm lines">
                                                <div className="col-sm">
                                                    <div className="row">
                                                        <div
                                                            className={
                                                                apprisalForm.peerId == null
                                                                    ? 'col-sm-6 lines'
                                                                    : 'col-sm-4 lines '
                                                            }
                                                        >
                                                            <OptionList
                                                                readOnly={
                                                                    isPeer || isManager || readOnly
                                                                }
                                                                name={'adaptSituations'}
                                                                selectedValue={
                                                                    apprisalForm.regulatoryDTO &&
                                                                    apprisalForm.regulatoryDTO
                                                                        .adaptSituations
                                                                        ? apprisalForm.regulatoryDTO
                                                                              .adaptSituations[
                                                                              'empRating'
                                                                          ]
                                                                        : 0
                                                                }
                                                                // selectedValue={apprisalForm.regulatoryDTO && apprisalForm.regulatoryDTO.jobReqRes ? apprisalForm.regulatoryDTO.jobReqRes[isManager ? 'mgrRating' : 'empRating'] : 0}
                                                                onChangeHandler={onChangeHandler}
                                                            />
                                                        </div>
                                                        {apprisalForm.peerId == null ? (
                                                            ''
                                                        ) : (
                                                            <div className="col-sm-4 lines">
                                                                <OptionList
                                                                    readOnly={
                                                                        isEmployee ||
                                                                        isManager ||
                                                                        readOnly
                                                                    }
                                                                    name={'adaptSituations'}
                                                                    selectedValue={
                                                                        apprisalForm.regulatoryDTO &&
                                                                        apprisalForm.regulatoryDTO
                                                                            .adaptSituations
                                                                            ? apprisalForm
                                                                                  .regulatoryDTO
                                                                                  .adaptSituations[
                                                                                  'peerRating'
                                                                              ]
                                                                            : 0
                                                                    }
                                                                    // selectedValue={apprisalForm.regulatoryDTO && apprisalForm.regulatoryDTO.jobReqRes ? apprisalForm.regulatoryDTO.jobReqRes[isManager ? 'mgrRating' : 'empRating'] : 0}
                                                                    onChangeHandler={
                                                                        onChangeHandler
                                                                    }
                                                                />
                                                            </div>
                                                        )}
                                                        <div
                                                            className={
                                                                apprisalForm.peerId == null
                                                                    ? 'col-sm-6 lines withOutPeerRHead'
                                                                    : 'col-sm-4 lines managerRHead'
                                                            }
                                                        >
                                                            <OptionList
                                                                readOnly={
                                                                    isEmployee || isPeer || readOnly
                                                                }
                                                                name={'adaptSituations'}
                                                                selectedValue={
                                                                    apprisalForm.regulatoryDTO &&
                                                                    apprisalForm.regulatoryDTO
                                                                        .adaptSituations
                                                                        ? apprisalForm.regulatoryDTO
                                                                              .adaptSituations[
                                                                              'mgrRating'
                                                                          ]
                                                                        : 0
                                                                }
                                                                // selectedValue={apprisalForm.regulatoryDTO && apprisalForm.regulatoryDTO.jobReqRes ? apprisalForm.regulatoryDTO.jobReqRes[isManager ? 'mgrRating' : 'empRating'] : 0}
                                                                onChangeHandler={onChangeHandler}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-4 lines">
                                                Consistent adherence to rules and regulations
                                            </div>
                                            <div className="col-sm lines">
                                                <div className="col-sm">
                                                    <div className="row">
                                                        <div
                                                            className={
                                                                apprisalForm.peerId == null
                                                                    ? 'col-sm-6 lines'
                                                                    : 'col-sm-4 lines '
                                                            }
                                                        >
                                                            <OptionList
                                                                readOnly={
                                                                    isPeer || isManager || readOnly
                                                                }
                                                                name={'consistent'}
                                                                selectedValue={
                                                                    apprisalForm.regulatoryDTO &&
                                                                    apprisalForm.regulatoryDTO
                                                                        .consistent
                                                                        ? apprisalForm.regulatoryDTO
                                                                              .consistent[
                                                                              'empRating'
                                                                          ]
                                                                        : 0
                                                                }
                                                                // selectedValue={apprisalForm.regulatoryDTO && apprisalForm.regulatoryDTO.jobReqRes ? apprisalForm.regulatoryDTO.jobReqRes[isManager ? 'mgrRating' : 'empRating'] : 0}
                                                                onChangeHandler={onChangeHandler}
                                                            />
                                                        </div>
                                                        {apprisalForm.peerId == null ? (
                                                            ''
                                                        ) : (
                                                            <div className="col-sm-4 lines">
                                                                <OptionList
                                                                    readOnly={
                                                                        isEmployee ||
                                                                        isManager ||
                                                                        readOnly
                                                                    }
                                                                    name={'consistent'}
                                                                    selectedValue={
                                                                        apprisalForm.regulatoryDTO &&
                                                                        apprisalForm.regulatoryDTO
                                                                            .consistent
                                                                            ? apprisalForm
                                                                                  .regulatoryDTO
                                                                                  .consistent[
                                                                                  'peerRating'
                                                                              ]
                                                                            : 0
                                                                    }
                                                                    // selectedValue={apprisalForm.regulatoryDTO && apprisalForm.regulatoryDTO.jobReqRes ? apprisalForm.regulatoryDTO.jobReqRes[isManager ? 'mgrRating' : 'empRating'] : 0}
                                                                    onChangeHandler={
                                                                        onChangeHandler
                                                                    }
                                                                />
                                                            </div>
                                                        )}
                                                        <div
                                                            className={
                                                                apprisalForm.peerId == null
                                                                    ? 'col-sm-6 lines withOutPeerRHead'
                                                                    : 'col-sm-4 lines managerRHead'
                                                            }
                                                        >
                                                            <OptionList
                                                                readOnly={
                                                                    isEmployee || isPeer || readOnly
                                                                }
                                                                name={'consistent'}
                                                                selectedValue={
                                                                    apprisalForm.regulatoryDTO &&
                                                                    apprisalForm.regulatoryDTO
                                                                        .consistent
                                                                        ? apprisalForm.regulatoryDTO
                                                                              .consistent[
                                                                              'mgrRating'
                                                                          ]
                                                                        : 0
                                                                }
                                                                // selectedValue={apprisalForm.regulatoryDTO && apprisalForm.regulatoryDTO.jobReqRes ? apprisalForm.regulatoryDTO.jobReqRes[isManager ? 'mgrRating' : 'empRating'] : 0}
                                                                onChangeHandler={onChangeHandler}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {isEmployee ? (
                                            ''
                                        ) : (
                                            <div className="row">
                                                <div
                                                    className="col-sm-4 lines overallrating"
                                                    style={{ fontWeight: 'bolder' }}
                                                >
                                                    Overall Rating
                                                </div>
                                                <div className="col-sm-8">
                                                    <div className="row">
                                                        <div
                                                            className={
                                                                apprisalForm.peerId == null
                                                                    ? 'col-sm-6 lines overallrating'
                                                                    : 'col-sm-4 lines overallrating '
                                                            }
                                                            style={{ fontWeight: 'bolder' }}
                                                        >
                                                            <span className="text-right">
                                                                {' '}
                                                                {apprisalForm.regulatoryDTO &&
                                                                apprisalForm.regulatoryDTO
                                                                    .empOverallRating == null
                                                                    ? 0
                                                                    : apprisalForm.regulatoryDTO &&
                                                                      apprisalForm.regulatoryDTO
                                                                          .empOverallRating}
                                                            </span>
                                                        </div>
                                                        {apprisalForm.peerId == null ? (
                                                            ''
                                                        ) : (
                                                            <div
                                                                className="col-sm-4 lines overallrating"
                                                                style={{ fontWeight: 'bolder' }}
                                                            >
                                                                <span className="text-right">
                                                                    {' '}
                                                                    {apprisalForm.regulatoryDTO &&
                                                                    apprisalForm.regulatoryDTO
                                                                        .peerOverallRating == null
                                                                        ? 0
                                                                        : apprisalForm.regulatoryDTO &&
                                                                          apprisalForm.regulatoryDTO
                                                                              .peerOverallRating}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div
                                                            className={
                                                                apprisalForm.peerId == null
                                                                    ? 'col-sm-6 lines withOutPeerRHead overallrating'
                                                                    : 'col-sm-4 lines managerRHead overallrating '
                                                            }
                                                            style={{ fontWeight: 'bolder' }}
                                                        >
                                                            <span className="text-right">
                                                                {' '}
                                                                {apprisalForm.regulatoryDTO &&
                                                                apprisalForm.regulatoryDTO
                                                                    .mrgOverallRating == null
                                                                    ? 0
                                                                    : apprisalForm.regulatoryDTO &&
                                                                      apprisalForm.regulatoryDTO
                                                                          .mrgOverallRating}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default EmployeeAndManagerReview
