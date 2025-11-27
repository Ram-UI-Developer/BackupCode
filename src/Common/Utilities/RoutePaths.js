import React from 'react'

export const menuIcons = {
    Dashboard: <i className="nav-icon fas fa-tachometer-alt"></i>,
    Masters: <i className="nav-icon fas fa-tree"></i>,
    TimeSheet: <i class="nav-icon fas fa-calendar-alt"></i>,
    Employee: <i className="nav-icon far fa-user"></i>
}

export const menuMapping = (menuName) => {
    return menuIcons[menuName] ? menuIcons[menuName] : ' '
}

export const routePaths = {
    Dashboard: '/dashboard',
    Client: '/client',

    Project: '/project',

    Activity: '/activity',
    Task: '/task',
    Shift: '/shift',
    Holiday: '/holiday',
    'TimeSheet Daily': '/TimesheetDail',
    'TimeSheet Weekly': '/plant',
    'Add Employee': '/addEmployee',
    'List Employee': '/listEmployee',
    PermanentEmployee: '/permanentEmployee',
    'Thank You': '/thankyou'
}

export const routeMapping = (menuName) => {
    return routePaths[menuName] ? routePaths[menuName] : ''
}
