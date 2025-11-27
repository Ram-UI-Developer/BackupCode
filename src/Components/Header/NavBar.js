import { Tooltip } from 'antd'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { ACCESS_TOKEN, themeColor } from '../../Common/Utilities/Constants'
import { NOTIFICATIONS, TITLE, USER_DETAILS } from '../../reducers/constants'
import { logout } from '../../Common/Services/CommonService'
import { ToastError } from '../../Common/CommonComponents/ToastCustomized'
import Chatbot from '../../Common/CommonComponents/Chatbot'

const NavBar = ({ onToggleNotifications, count }) => {
    const userDetails = useSelector((state) => state.user.userDetails) // Get userdetails form redux
    const title = useSelector((state) => state.title.title) // Get Title from redux
    const [vis, setVis] = useState() // State for conditonal rendaring profile
    const [displayImage, setDisplayImage] = useState(false) // State for confirming image present or not
    const [profile, setProfile] = useState('') // State for username
    // const [notificationData, setNotificationData] = useState([])
   
    const dispatch = useDispatch() // declearing dispatch

    // get image
    const getImageApi = (fileName) => {
        let imgUrl = `http://106.51.52.207:8092/workshine/v1/Employee/download/getFileByFileName?employeeId=${userDetails.employeeId}&uploadStream=USER&fileName=${fileName}`
        imageGetApi(imgUrl)
    }

    const imageGetApi = async (imgUrl) => {
        const options = {
            method: 'post'
        }
        const res = await fetch(imgUrl, options)
        if (res.status == 200) {
            setDisplayImage(true)
        } else {
            profileSelctName()
        }
    }

    // function for set initials
    const profileSelctName = () => {
        let intials
        intials = userDetails.firstName.charAt(0) + userDetails.lastName.charAt(0)
        setProfile(intials)
    }

    // function for image settings
    const settingImage = () => {
        const filePath = userDetails.photoPath
        if (filePath != null) {
            const file = filePath.slice(31)
            const fileName = file.substring(0, file.length - 1)
            getImageApi(fileName)
        } else if (userDetails.firstName && userDetails.lastName) {
            profileSelctName()
        } else {
            setDisplayImage(true)
        }
    }
    // checking condition via org id
    useEffect(() => {
        settingImage()
        if (userDetails.organizationId == null) {
            setVis(false)
        } else {
            setVis(true)
        }
    }, [])



    const navigate = useNavigate() // decleration of navigation
    const employee = userDetails.employeeId // employee id
    // navigation for employee profile
    const handlenavigate = () => {
        navigate('/employeeProfile', { state: { employee } })
    }

    // Logout function
    const logoutProcess = () => {
        logout({id:userDetails.employeeId})
            .then((res) => {
                if (res.status == 'success') {
                    localStorage.removeItem(ACCESS_TOKEN)
                    window.location.href = '/'
                    dispatch({
                        type: TITLE,
                        payload: ' '
                    })

                    dispatch({
                        type: NOTIFICATIONS,
                        payload: ' '
                    })
                    dispatch({
                        type: USER_DETAILS,
                        payload: ''
                    })
                }
            })
            .catch((error) => {
                if (error.message == 'Token Expired' || error.message == 'Session expired') {
                    localStorage.removeItem(ACCESS_TOKEN)
                     dispatch({
                        type: TITLE,
                        payload: ' '
                    })

                    dispatch({
                        type: NOTIFICATIONS,
                        payload: ' '
                    })
                    dispatch({
                        type: USER_DETAILS,
                        payload: ''
                    })
                    window.location.href = '/'
                } else {
                    ToastError(error.message)
                    //  localStorage.removeItem(ACCESS_TOKEN)
                    // window.location = '/'
                    //  dispatch({
                    //     type: TITLE,
                    //     payload: ' '
                    // })

                    // dispatch({
                    //     type: NOTIFICATIONS,
                    //     payload: ' '
                    // })
                    // dispatch({
                    //     type: USER_DETAILS,
                    //     payload: ''
                    // })
                }
            })
    }

    return (
        <>
            <nav className="main-header navbar navbar-expand navbar-white navbar-light">
                <div className="sidebarHeader">
                    <img
                        alt="Workshine Logo"
                        src={
                            userDetails.organizationId == null
                                ? '/dist/Images/Workshine.png'
                                : userDetails.logo
                                    ? `data:image/jpeg;base64,${userDetails.logo}`
                                    : '/dist/Images/Workshine.png'
                        }
                        className={userDetails.organizationId == null ? 'workshineLogo' : 'appLogo'}
                    />
                </div>
                <div className="pageHeader">{title}</div>
                <ul className="navbar-nav ml-auto">
                    <div>
                        <Chatbot />
                    </div>
                    <li className="nav-item dropdown">
                        <div className="user-panel  d-flex">
                            <span
                                className="dropdown"
                                style={{
                                    marginTop: '-16px',
                                    marginBottom: '-10px',
                                    marginRight: '20px'
                                }}
                            >
                                <div style={{ marginLeft: '10px' }} className=" mt-3 d-flex"  >
                                    {userDetails.organizationId != null && 
                                    <div class="notification-container" onClick={onToggleNotifications}>
                                        <img 
                                            src={'/dist/Images/bell-solid-full.png'}
                                            style={{ cursor: 'pointer',height: '30px', width: '30px' }}
                                            alt="Notification Bell"
                                        />
                                        {count > 0 && (
                                        <span class="notification-count">{count}</span>
                                        )}
                                    </div>}
                                    
                                    &emsp;
                                    <Tooltip
                                        placement="bottomLeft"
                                        color={themeColor}
                                        title={
                                            <>
                                                <div style={{ padding: '10px' }}>
                                                    {vis && (
                                                        <p onClick={handlenavigate}>
                                                            <Link
                                                                to="#"
                                                                style={{ fontSize: '18px' }}
                                                            >
                                                                <i
                                                                    style={{
                                                                        marginRight: '5%',
                                                                        color: 'white'
                                                                    }}
                                                                    class="nav-icon fa fa-user-circle"
                                                                    aria-hidden="true"
                                                                ></i>
                                                                <span
                                                                    className="brand-text font-weight-light"
                                                                    style={{ color: 'white' }}
                                                                >
                                                                    {' '}
                                                                    Profile{' '}
                                                                </span>
                                                            </Link>
                                                        </p>
                                                    )}
                                                    <p>
                                                        <Link
                                                            to="changePassword"
                                                            style={{
                                                                fontSize: '18px',
                                                                display: 'flex'
                                                            }}
                                                        >
                                                            <i
                                                                style={{
                                                                    marginRight: '2%',
                                                                    color: 'white'
                                                                }}
                                                                class="fa-sharp fa-solid fa-pen-field"
                                                                aria-hidden="true"
                                                            ></i>
                                                            <span
                                                                className="brand-text font-weight-light"
                                                                style={{
                                                                    color: 'white',
                                                                    whiteSpace: 'pre'
                                                                }}
                                                            >
                                                                {' '}
                                                                Change Password{' '}
                                                            </span>
                                                        </Link>
                                                    </p>
                                                    {/* {vis && (
                            <p >
                              <Link to="/delegateList" style={{ fontSize: "18px" }}>
                                <i
                                  style={{ marginRight: "5%", color: "white" }}
                                  class="nav-icon fa-solid fa-share-from-square"
                                  aria-hidden="true"
                                ></i>
                                <span
                                  className="brand-text font-weight-light"
                                  style={{ color: "white" }}
                                >
                                  {" "}
                                  Delegate{" "}
                                </span>
                              </Link>
                            </p>
                          )} */}

                                                    {userDetails.organizationId == null && (
                                                        <p>
                                                            <Link
                                                                to="settings"
                                                                style={{
                                                                    fontSize: '18px',
                                                                    display: 'flex'
                                                                }}
                                                            >
                                                                <i
                                                                    style={{
                                                                        marginRight: '5%',
                                                                        color: 'white'
                                                                    }}
                                                                    class="fa-sharp fa-regular fa-gear"
                                                                    aria-hidden="true"
                                                                ></i>
                                                                <span
                                                                    className="brand-text font-weight-light"
                                                                    style={{
                                                                        color: 'white',
                                                                        whiteSpace: 'pre'
                                                                    }}
                                                                >
                                                                    {' '}
                                                                    Settings{' '}
                                                                </span>
                                                            </Link>
                                                        </p>
                                                    )}

                                                    <p onClick={logoutProcess}>
                                                        <Link to="#" style={{ fontSize: '18px' }}>
                                                            <i
                                                                style={{
                                                                    marginRight: '5%',
                                                                    color: 'white'
                                                                }}
                                                                class="fa-solid fa-right-from-bracket"
                                                            ></i>
                                                            <span
                                                                className="brand-text font-weight-light"
                                                                style={{ color: 'white' }}
                                                            >
                                                                {' '}
                                                                Logout{' '}
                                                            </span>
                                                        </Link>
                                                    </p>
                                                </div>
                                            </>
                                        }
                                    >
                                        {displayImage ? (
                                            <img
                                                className="appOwnerImg"
                                                type="button"
                                                style={{
                                                    width: '35px',
                                                    height: '39px'
                                                }}
                                                src={'/dist/img/user1-128x128.png'}
                                                alt="user"
                                            />
                                        ) : (
                                            <p
                                                style={{ marginBottom: '10px' }}
                                                className="img"
                                                alt="User"
                                                type="button"
                                            >
                                                {userDetails.photo ? (
                                                    <img
                                                        style={{
                                                            borderRadius: '50%',
                                                            width: '40px',
                                                            height: '40px',
                                                            marginTop: '-15%'
                                                        }}
                                                        src={`data:image/jpeg;base64,${userDetails.photo}`}
                                                    />
                                                ) : (
                                                    profile
                                                )}
                                            </p>
                                        )}
                                    </Tooltip>
                                </div>
                            </span>
                        </div>
                    </li>

                    {/* <li className="nav-item dropdown">
            <Link className="nav-link" data-toggle="dropdown" to="#"></Link>
          </li> */}
                </ul>
            </nav>
        </>
    )
}

export default NavBar
