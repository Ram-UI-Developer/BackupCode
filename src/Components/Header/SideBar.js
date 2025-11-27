import 'bootstrap/dist/css/bootstrap.min.css'
import React, { useEffect, useState } from 'react'
import Accordion from 'react-bootstrap/Accordion'
import { useSelector } from 'react-redux'
import { Link, useLocation } from 'react-router-dom'
import MenuItemIcons from '../../Common/CommonIcons/MenuItemIcons'
import './SideBar.css'

const SideBar = () => {
    const userDetails = useSelector((state) => state.user.userDetails)
    const location = useLocation() // ✅ Add this

    let moduleNames =
        userDetails &&
        userDetails.menus &&
        userDetails['menus'].map((modules) => modules.screenDTOs.map((e) => e.path)) // Get module names from userdetails
    let listPaths = moduleNames ? moduleNames.flat() : [] // Flatten the module names
    const [d, setD] = useState() // State for toggle sidebar
    const [menuItem, setMenuItem] = useState(localStorage.getItem('menuItem')) // State for menu item

    // First useEffect - Set localStorage based on pathname
    useEffect(() => {
        if (location.pathname === '/') {
            if (userDetails.organizationId) {
                localStorage.setItem('menuItem', 'dashboard') // Set menu item to dashboard if organizationId is present
            } else {
                localStorage.setItem('menuItem', '/subscriberList')
            }
        } else if (listPaths.some((e) => e === location.pathname)) {
            // Check if the current path is in the list of paths
            localStorage.setItem('menuItem', location.pathname) // Set menu item to dashboard if organizationId is present
        } else if (location.pathname === '/hrHandbook') {
            localStorage.setItem('menuItem', 'hrHandbook') // Set menu item to hrHandbook if organizationId is present
        } else if (location.pathname === '/employeeProfile') {
            localStorage.setItem('menuItem', 'employeeProfile') // Set menu item to employeeProfile if organizationId is present
        } else if (location.pathname === '/changePassword') {
            localStorage.setItem('menuItem', 'changePassword') // Set menu item to changePassword if organizationId is present
        } else if (location.pathname === '/settings') {
            localStorage.setItem('menuItem', 'settings') // Set menu item to settings if organizationId is present
        } else if (location.pathname === '/delegateList') {
            localStorage.setItem('menuItem', 'delegateList') // Set menu item to settings if organizationId is present
        } else if (location.pathname === '/delegate') {
            localStorage.setItem('menuItem', 'delegate') // Set menu item to settings if organizationId is present
        }
    }, [location.pathname, userDetails.organizationId, listPaths])

    // Toggle sidebar
    const handleToggle = (e) => {
        if (e.target.ariaExpanded == 'false') {
            setD('false')
        } else if (e.target.ariaExpanded == 'true') {
            setD('true')
        } else if (e.target.ariaExpanded == null) {
            setD('false')
        }
    }

    // handling classname dynamically
    const handleMouseEnter = (e) => {
        e.add('sidebar-expanded')
    }

    // Handling mouse leave to remove class
    const handleMouseLeave = (e) => {
        e.remove('sidebar-expanded')
    }

    // Second useEffect - Update menuItem state when localStorage changes
    useEffect(() => {
        setMenuItem(localStorage.getItem('menuItem'))
        console.log("menuItem changed:", localStorage.getItem('menuItem'))
    }, [location.pathname]) // ✅ Use location.pathname instead of window.location.pathname

    // set local storage by onclick to srore modulename
    const onMenuHandler = (item) => {
        localStorage.setItem('menuItem', item)
    }

    return (
        <>
            <div className="logoAlign">
                <aside
                    style={{ height: d == 'false' ? '91vh' : '91.01vh' }}
                    className="main-sidebar"
                    onMouseEnter={() => handleMouseEnter(document.body.classList)}
                    onMouseLeave={() => handleMouseLeave(document.body.classList)}
                >
                    <div className="sidebar">
                        <nav className="mt-2">
                            <ul
                                className="nav nav-pills nav-sidebar flex-column mb-3 "
                                data-widget="treeview"
                                role="menu"
                                data-accordion="false"
                            >
                                <li className="nav-item">
                                    {userDetails.organizationId && (
                                        <Link
                                            className="accordion-button collapsed"
                                            to={'/'}
                                            onClick={() => onMenuHandler('dashboard')}
                                        >
                                            <Link to={'/'}>
                                                {menuItem == 'dashboard' ? (
                                                    <span
                                                        className={
                                                            menuItem == 'dashboard'
                                                                ? 'selectedMenuIcon'
                                                                : ''
                                                        }
                                                    >
                                                        .
                                                    </span>
                                                ) : (
                                                    ''
                                                )}
                                                <img
                                                    src="/dist/Images/dashboardIcon.png"
                                                    alt=""
                                                    className="sidebarIcons"
                                                />
                                                &ensp;
                                                <span
                                                    className={
                                                        menuItem == 'dashboard'
                                                            ? 'selectedMenuName menuToggle'
                                                            : 'menuToggle'
                                                    }
                                                >
                                                    Dashboard{' '}
                                                </span>
                                            </Link>
                                        </Link>
                                    )}
                                </li>
                            </ul>
                            <Accordion onClick={handleToggle} className="">
                                {userDetails && userDetails.menus ? (
                                    userDetails.menus.map((module, index) =>
                                        module.screenDTOs.length > 1 ? (
                                            <>
                                                <Accordion.Item
                                                    eventKey={`module${index}`}
                                                    key={module.id}
                                                >
                                                    <Accordion.Header>
                                                        {module.icon == null ? (
                                                            <>
                                                                {MenuItemIcons[`${module.name}`]}
                                                                &ensp;
                                                            </>
                                                        ) : (
                                                            <>
                                                                <img
                                                                    src={`data:image/jpeg;base64,${module.icon}`}
                                                                    height="20px"
                                                                />
                                                                &ensp;
                                                            </>
                                                        )}
                                                        <span
                                                            className="menuToggle"
                                                            title={
                                                                module.name.length > 12
                                                                    ? module.name
                                                                    : ''
                                                            }
                                                        >
                                                            {module.name.length > 12
                                                                ? `${module.name.substring(0, 12)}...`
                                                                : module.name}
                                                        </span>
                                                    </Accordion.Header>
                                                    <Accordion.Body>
                                                        {module.screenDTOs.map((path) => (
                                                            <li className="nav-item " key={path.id}>
                                                                <Link
                                                                    className="nav-link side"
                                                                    to={path.path}
                                                                    onClick={() =>
                                                                        onMenuHandler(path.path)
                                                                    }
                                                                >
                                                                    <Link
                                                                        className="nav-link nameing"
                                                                        to={path.path}
                                                                        onClick={() =>
                                                                            onMenuHandler(path.path)
                                                                        }
                                                                    >
                                                                        {path.icon == null ? (
                                                                            <>
                                                                                {menuItem ==
                                                                                path.path ? (
                                                                                    <span
                                                                                        className={
                                                                                            menuItem ==
                                                                                            path.path
                                                                                                ? 'selectedSubMenuIcon'
                                                                                                : ''
                                                                                        }
                                                                                    >
                                                                                        .
                                                                                    </span>
                                                                                ) : (
                                                                                    ''
                                                                                )}
                                                                                {
                                                                                    MenuItemIcons[
                                                                                        `${path.path}`
                                                                                    ]
                                                                                }{' '}
                                                                                &ensp;
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                {menuItem ==
                                                                                path.path ? (
                                                                                    <span
                                                                                        className={
                                                                                            menuItem ==
                                                                                            path.path
                                                                                                ? 'selectedSubMenuIcon'
                                                                                                : ''
                                                                                        }
                                                                                    >
                                                                                        .
                                                                                    </span>
                                                                                ) : (
                                                                                    ''
                                                                                )}
                                                                                <img
                                                                                    src={`data:image/jpeg;base64,${path.icon}`}
                                                                                    height="20px"
                                                                                />
                                                                                &ensp;
                                                                            </>
                                                                        )}
                                                                        <span
                                                                            className={
                                                                                menuItem ==
                                                                                path.path
                                                                                    ? 'selectedSubMenuName'
                                                                                    : 'pathName'
                                                                            }
                                                                        >
                                                                            {path.name}{' '}
                                                                        </span>
                                                                    </Link>
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </Accordion.Body>
                                                </Accordion.Item>
                                            </>
                                        ) : (
                                            <>
                                                {module.screenDTOs.map((path) => (
                                                    <li
                                                        className="nav-item"
                                                        key={path.id}
                                                        onClick={() => onMenuHandler(path.path)}
                                                    >
                                                        <Link
                                                            className="nav-link side"
                                                            to={path.path}
                                                            onClick={() => onMenuHandler(path.path)}
                                                        >
                                                            <Link
                                                                className="nav-link nameing"
                                                                to={path.path}
                                                            >
                                                                {module.icon == null ? (
                                                                    <>
                                                                        {menuItem == path.path ? (
                                                                            <span
                                                                                className={
                                                                                    menuItem ==
                                                                                    path.path
                                                                                        ? 'selectedMenuIcon'
                                                                                        : ''
                                                                                }
                                                                            >
                                                                                .
                                                                            </span>
                                                                        ) : (
                                                                            ''
                                                                        )}
                                                                        {
                                                                            MenuItemIcons[
                                                                                `${module.name}`
                                                                            ]
                                                                        }
                                                                        &ensp;
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        {menuItem == path.path ? (
                                                                            <span
                                                                                className={
                                                                                    menuItem ==
                                                                                    path.path
                                                                                        ? 'selectedMenuIcon'
                                                                                        : ''
                                                                                }
                                                                            >
                                                                                .
                                                                            </span>
                                                                        ) : (
                                                                            ''
                                                                        )}
                                                                        <img
                                                                            src={`data:image/jpeg;base64,${module.icon}`}
                                                                            height="20px"
                                                                        />
                                                                        &ensp;
                                                                    </>
                                                                )}
                                                                <span
                                                                    className="menuToggle"
                                                                    style={{
                                                                        marginLeft: '-0.19rem'
                                                                    }}
                                                                >
                                                                    {' '}
                                                                    <span
                                                                        className={
                                                                            menuItem == path.path
                                                                                ? 'selectedMenuName menuToggle'
                                                                                : 'menuToggle'
                                                                        }
                                                                        title={
                                                                            module.name.length > 12
                                                                                ? module.name
                                                                                : ''
                                                                        }
                                                                    >
                                                                        {module.name.length > 20
                                                                            ? `${module.name.substring(0, 16)}...`
                                                                            : module.name}
                                                                    </span>{' '}
                                                                </span>
                                                            </Link>
                                                        </Link>
                                                    </li>
                                                ))}
                                            </>
                                        )
                                    )
                                ) : (
                                    <>
                                        {userDetails.paths &&
                                            userDetails.paths.map((p) => (
                                                <li className="nav-item" key={p.path}>
                                                    <Link className="nav-link" to={p.path}>
                                                        <Link to={p.path}>
                                                            <img
                                                                src={`data:image/jpeg;base64,${p.icon}`}
                                                                height="20px"
                                                            />
                                                            &ensp;
                                                            <span className="menuToggle">
                                                                {' '}
                                                                {p.name}{' '}
                                                            </span>
                                                        </Link>
                                                    </Link>
                                                </li>
                                            ))}
                                    </>
                                )}
                            </Accordion>
                            {userDetails && userDetails.organizationId ? (
                                <>
                                    <ul
                                        className="nav nav-pills nav-sidebar flex-column mb-3"
                                        data-widget="treeview"
                                        role="menu"
                                        data-accordion="false"
                                    >
                                        {userDetails.handbook && (
                                            <li className="nav-item  nameing">
                                                <Link className="" to={'/hrHandbook'}>
                                                    <Link to={'/hrHandbook'}>
                                                        <img
                                                            src="/dist/OceanImages/book.png"
                                                            alt="dashboard"
                                                            className="sidebarIcons"
                                                        />
                                                        &ensp;
                                                        <span className="menuToggle">
                                                            {' '}
                                                            HR Handbook{' '}
                                                        </span>
                                                    </Link>
                                                </Link>
                                            </li>
                                        )}
                                    </ul>
                                </>
                            ) : (
                                <></>
                            )}
                        </nav>
                    </div>
                </aside>
            </div>
        </>
    )
}

export default SideBar
