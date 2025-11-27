import { request, request8, requestWithoutToken } from '../Utilities/ApiHelper'
import { API_BASE_URL } from '../Utilities/Constants'

/**
 * Sends a login request to the identity API endpoint.
 * @param {Object} props - Contains the request body and any additional options.
 * @returns {Promise} - Result of the API call.
 */
export const Login = (props) => {
    const { body } = props
    return request({
        url: `${API_BASE_URL}identity/login`,
        method: 'post',
        body: JSON.stringify(body)
    })
}

// ********************** Save ********************** //

/**
 * Saves an entity under a specific organization.
 * @param {Object} props - Props include entity, organizationId, body, and more.
 * @returns {Promise} - Result of the API call.
 */
export const save = (props) => {
    const { entity, organizationId, body } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/save`,
        method: 'post',
        props: props,
        operationType: 'save',
        body: JSON.stringify(body)
    })
}

export const save1 = (props) => {
    const { organizationId,body } = props;

    const username = 'user';
    const password = 'INFY@123';
    const basicAuth = btoa(`${username}:${password}`);

    return request({
        url: `http://192.168.88.38:8087/api/managerdelegate/${organizationId}/save`,
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${basicAuth}`
        },
        operationType: 'save',
        body: JSON.stringify(body)
    });
};

export const getAllByOrgId1 = (props) => {

    const {id,organizationId} = props

    const username = 'aggregations';
    const password = 'INFY@123';
    const basicAuth = btoa(`${username}:${password}`);

    return request({
        url: `http://192.168.88.38:8091/api/managerdelegate/${organizationId}/all?primaryManagerId=${id}`,
        method: 'get',
        headers: {
            'Authorization': `Basic ${basicAuth}`
        },
    })
}

export const getById1 = (props) => {
    const { id,organizationId, } = props
     const username = 'aggregations';
    const password = 'INFY@123';
    const basicAuth = btoa(`${username}:${password}`);
    return request({
        url: `http://192.168.88.38:8091/api/managerdelegate/${organizationId}/one/${id}`,
        method: 'get',
         headers: {
            'Authorization': `Basic ${basicAuth}`
        },
    })
}

export const update1 = (props) => {
    const { id,organizationId,body } = props;

    const username = 'user';
    const password = 'INFY@123';
    const basicAuth = btoa(`${username}:${password}`);

    return request({
        url: `http://192.168.88.38:8087/api/managerdelegate/${organizationId}/update/${id}`,
        method: 'put',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${basicAuth}`
        },
        operationType: 'update',
        body: JSON.stringify(body)
    });
};

export const deleteById1 = (props) => {
    const { id,organizationId } = props;

    const username = 'user';
    const password = 'INFY@123';
    const basicAuth = btoa(`${username}:${password}`);

    return request({
        url: `http://192.168.88.38:8087/api/managerdelegate/${organizationId}/delete/${id}`,
        method: 'delete',
        headers: {
            'Authorization': `Basic ${basicAuth}`
        },
        operationType: 'delete',
    });
};


/**
 * Saves an entity along with file data using a different request method (likely for file uploads).
 * @param {Object} props - Props include entity, organizationId, and FormData body.
 * @returns {Promise} - Result of the API call.
 */
export const SaveWithFile = (props) => {
    const { entity, organizationId, body } = props
    return request8({
        url: `${API_BASE_URL}${entity}/${organizationId}/save`,
        method: 'post',
        body: body,
        props: props,
        operationType: 'save'
    })
}

/**
 * Saves an entity with both organization and location identifiers.
 * @param {Object} props - Props include entity, organizationId, locationId, and body.
 * @returns {Promise} - Result of the API call.
 */
export const saveWithOrgAndLocationIds = (props) => {
    const { entity, organizationId, locationId, body } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/save/byLocation/${locationId}`,
        method: 'post',
        props: props,
        operationType: 'save',
        body: JSON.stringify(body)
    })
}

/**
 * Saves an entity without specifying an organization.
 * @param {Object} props - Props include entity and body.
 * @returns {Promise} - Result of the API call.
 */
export const saveWithoutOrg = (props) => {
    const { entity, body } = props
    return request({
        url: `${API_BASE_URL}${entity}/save`,
        method: 'post',
        props: props,
        operationType: 'save',

        body: JSON.stringify(body)
    })
}

/**
 * Saves an entity with file data but without an organization ID.
 * @param {Object} props - Props include entity and FormData body.
 * @returns {Promise} - Result of the API call.
 */
export const SaveWithFileWithoutOrg = (props) => {
    const { entity, body } = props
    return request8({
        url: `${API_BASE_URL}${entity}/save`,
        method: 'post',
        props: props,
        operationType: 'save',
        body: body
    })
}

// ****************************** Update ******************************//
/**
 * Updates an entity using organization ID and record ID.
 * @param {Object} props - Includes entity name, org ID, record ID, and request body.
 * @returns {Promise} - Result of the API call.
 */
export const update = (props) => {
    const { entity, organizationId, id, body } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/update/${id}`,
        method: 'put',
        props: props,
        operationType: 'update',
        body: JSON.stringify(body)
    })
}
/**
 * Updates an entity with file data using organization ID and record ID.
 * @param {Object} props - Includes entity, org ID, record ID, and FormData body.
 * @returns {Promise} - Result of the API call.
 */

export const UpdateWithFile = (props) => {
    const { entity, organizationId, id, body } = props
    return request8({
        url: `${API_BASE_URL}${entity}/${organizationId}/update/${id}`,
        method: 'put',
        props: props,
        operationType: 'update',
        body: body
    })
}
/**
 * Updates an entity with file data but without an organization ID.
 * @param {Object} props - Includes entity, record ID, and file data body.
 * @returns {Promise} - Result of the API call.
 */
export const updateWithoutOrgFile = (props) => {
    const { entity, id, body } = props
    return request8({
        url: `${API_BASE_URL}${entity}/update/${id}`,
        method: 'put',
        body: body,
        props: props,
        operationType: 'update'
    })
}
/**
 * Updates an entity without organization ID and without file data.
 * @param {Object} props - Includes entity, record ID, and JSON body.
 * @returns {Promise} - Result of the API call.
 */
export const updateWithoutOrg = (props) => {
    const { entity, id, body } = props
    return request({
        url: `${API_BASE_URL}${entity}/update/${id}`,
        method: 'put',
        props: props,
        operationType: 'update',
        body: JSON.stringify(body)
    })
}
/**
 * Updates an entity using organization ID, location ID, and record ID.
 * @param {Object} props - Includes entity, org ID, location ID, record ID, and body.
 * @returns {Promise} - Result of the API call.
 */
export const updateWithOrgAndLocationIds = (props) => {
    const { entity, organizationId, locationId, id, body } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/byLocation/${locationId}/update/${id}`,
        method: 'put',
        body: JSON.stringify(body)
    })
}

// ************************* Authorization ********************** //
/**
 * Approves a timesheet entry for a specific project and employee.
 * @param {Object} props - Includes entity, organizationId, timesheet ID, project ID, and approval reason.
 * @returns {Promise} - Result of the API call.
 */
export const approveTimesheet = (props) => {
    const { entity, organizationId, id, proid, reason } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/approve/byTimesheetAndProject?id=${id}&projectId=${proid}&remarks=${reason}`,
        method: 'put'
    })
}

/**
 * Rejects a timesheet entry for a specific project and employee.
 * @param {Object} props - Includes entity, organizationId, timesheet ID, project ID, and rejection reason.
 * @returns {Promise} - Result of the API call.
 */
export const rejectTimesheet = (props) => {
    const { entity, organizationId, id, proid, reason } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/reject/byTimesheetAndProject/${id}?projectId=${proid}&remarks=${reason}`,
        method: 'put'
    })
}

// ***************************** Delete ***********************//
/**
 * Deletes a record by its ID within a specific organization.
 * @param {Object} props - Includes entity, organizationId, and record ID.
 * @returns {Promise} - Result of the API call.
 */
export const deleteById = (props) => {
    const { entity, organizationId, id } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/delete/${id}`,
        method: 'delete',
        props: props,
        operationType: 'delete'
    })
}

/**
 * Deletes a record by ID without including the organization ID (used for App Owner context).
 * @param {Object} props - Includes entity and record ID.
 * @returns {Promise} - Result of the API call.
 */
export const appownerDeleteById = (props) => {
    const { entity, id } = props

    return request({
        url: `${API_BASE_URL}${entity}/delete/${id}`,
        method: 'delete',
        props: props,
        operationType: 'delete'
    })
}

/**
 * Deletes a package by its ID passed as a query parameter.
 * @param {Object} props - Includes entity and record ID.
 * @returns {Promise} - Result of the API call.
 */
export const PackageDeleteById = (props) => {
    const { entity, id } = props

    return request({
        url: `${API_BASE_URL}${entity}/delete?id=${id}`,
        method: 'delete',
        props: props,
        operationType: 'delete'
    })
}

/**
 * Deletes a record by ID and also includes an employee ID in the query (for more specific filtering).
 * @param {Object} props - Includes entity, org ID, record ID, and employee ID.
 * @returns {Promise} - Result of the API call.
 */
export const deletewithPerams = (props) => {
    const { entity, organizationId, id, employeeId } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/delete?id=${id}&employeeId=${employeeId}`,
        method: 'delete',
        props: props,
        operationType: 'delete'
    })
}

// ************************* Get all ********************** //
/**
 * Fetches all records for the specified entity.
 * @param {Object} props - Includes the entity name.
 * @returns {Promise} - API response.
 */
export const getAll = (props) => {
    const { entity } = props
    return request({
        url: `${API_BASE_URL}${entity}/all`,
        method: 'get'
    })
}

/**
 * Fetches all records for an entity without including an access token.
 * @param {Object} props - Includes the entity name.
 * @returns {Promise} - API response.
 */
export const getAllWithoutToken = (props) => {
    const { entity } = props
    return requestWithoutToken({
        url: `${API_BASE_URL}${entity}/all`,
        method: 'get'
    })
}

/**
 * Fetches all records by organization ID.
 * @param {Object} props - Includes entity and organizationId.
 * @returns {Promise} - API response.
 */
export const getAllByOrgId = (props) => {
    const { entity, organizationId } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/all`,
        method: 'get'
    })
}
export const getAllReporties = (props) => {
    const { entity, organizationId,employee} = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/getEmployeesByReportees/${employee}`,
        method: 'get'
    })
}


/**
 * Fetches all records by org ID, with optional month, year, and location filters.
 * @param {Object} props - Includes entity, organizationId, locationId, month, and year.
 * @returns {Promise} - API response.
 */
export const getAllByOrgIdWithMonthAndYear = (props) => {
    const { entity, organizationId, locationId, month, year } = props
    return request({
        url:
            month || year
                ? `${API_BASE_URL}${entity}/${organizationId}/all?year=${year}&month=${month}&locationId=${locationId}`
                : `${API_BASE_URL}${entity}/${organizationId}/all`,
        method: 'get'
    })
}

/**
 * Fetches pay run data for a specific location and date.
 * @param {Object} props - Includes entity, organizationId, location, month, and year.
 * @returns {Promise} - API response.
 */
export const getPayrun = (props) => {
    const { entity, organizationId, location, month, year } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/one/${location}?year=${year}&month=${month}`,
        method: 'get'
    })
}

/**
 * Fetches all records by organization and location ID.
 * @param {Object} props - Includes entity, organizationId, and locationId.
 * @returns {Promise} - API response.
 */
export const getAllWithOrgAndLocationIds = (props) => {
    const { entity, organizationId, locationId } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/byLocation/${locationId}`,
        method: 'get'
    })
}

/**
 * Fetches announcements for a specific organization and location on a given date.
 * @param {Object} props - Includes entity, organizationId, locationId, and date.
 * @returns {Promise} - API response.
 */
export const getAllAnnouncementsWithOrgAndLocationIdAndDate = (props) => {
    const { entity, organizationId, locationId, date } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/byLocation/${locationId}?date=${date}`,
        method: 'get'
    })
}

/**
 * Fetches all current (today's) celebrations for a specific organization and location.
 * @param {Object} props - Includes entity, organizationId, locationId, and date (endDate filter).
 * @returns {Promise} - API response.
 */
export const getAllCurrentCelebrations = (props) => {
    const { entity, organizationId, locationId, date } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/todayCelebrations/byLocation/${locationId}?endDate=${date}`,
        method: 'get'
    })
}
/**
 * Fetches all upcoming celebrations for a given organization and location.
 * @param {Object} props - Includes entity, organizationId, locationId, and endDate (filter).
 * @returns {Promise} - API response.
 */
export const getAllUpCommingCelebrations = (props) => {
    const { entity, organizationId, locationId, endDate } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/upcomingCelebrations/byLocation/${locationId}?endDate=${endDate}`,
        method: 'get'
    })
}
/**
 * Fetches all records for a given organization filtered by a specific status.
 * @param {Object} props - Includes entity, organizationId, and status.
 * @returns {Promise} - API response.
 */
export const getAllByIdWithStatus = (props) => {
    const { entity, organizationId, status } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/all?status=${status}`,
        method: 'get'
    })
}

/**
 * Fetches all active employees for a given organization.
 * @param {Object} props - Includes entity, organizationId, and status.
 * @returns {Promise} - API response.
 */
export const getAllByOrgIdActiveStatus = (props) => {
    const { entity, organizationId } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/activeEmployees`,
        method: 'get'
    })
}

/**
 * Fetches records for a specific employee in an organization based on the employee's ID.
 * @param {Object} props - Includes entity, organizationId, and empId.
 * @returns {Promise} - API response.
 */
export const getAllByOrgIdAndEmpId = (props) => {
    const { entity, organizationId, empId } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/byEmployee?employeeId=${empId}`,
        method: 'get'
    })
}

/**
 * Fetches all projects associated with an employee for a given organization and weekend date.
 * @param {Object} props - Includes entity, organizationId, employeeId, and weekendDate.
 * @returns {Promise} - API response.
 */
export const getAllProjectsByEmpId = (props) => {
    const { entity, organizationId, employeeId, weekendDate } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/allProjects?employeeId=${employeeId}&weekendDate=${weekendDate}`,
        method: 'get'
    })
}

/**
 * Fetches all applied leaves for a manager's direct and indirect subordinates in a given organization.
 * @param {Object} props - Includes entity, organizationId, empId (manager's ID), direct and indirect subordinates.
 * @returns {Promise} - API response.
 */
export const getAllLeavesByManagerId = (props) => {
    const { entity, organizationId, empId, direct, inDirect } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/appliedLeaves?managerId=${empId}&status=${'Submitted'}&directSubOrdinates=${direct}&inDirectSubOrdinates=${inDirect}`,
        method: 'get'
    })
}

/**
 * Fetches all expenses for an organization managed by a specific manager.
 * @param {Object} props - Includes entity, organizationId, and empId (manager's ID).
 * @returns {Promise} - API response.
 */
export const getAllExpensesByManagerId = (props) => {
    const { entity, organizationId, empId } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/byManager?managerId=${empId}`,
        method: 'get'
    })
}

/**
 * Fetches records for a specific HR manager in an organization based on HR manager's ID.
 * @param {Object} props - Includes entity, organizationId, and empId (HR manager's ID).
 * @returns {Promise} - API response.
 */
export const getAllByHRId = (props) => {
    const { entity, organizationId, empId } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/byHrManager?hrManagerId=${empId}`,
        method: 'get'
    })
}
/**
 * Fetches personal details of an employee in a given organization by employee ID.
 * @param {Object} props - Includes organizationId, employeeId, and ctc.
 * @returns {Promise} - API response with employee personal details.
 */
export const getEmployeePersonalDetails = (props) => {
    const { organizationId, employeeId } = props
    return request({
        url: `${API_BASE_URL}employees/${organizationId}/profileById/${employeeId}`,
        method: 'get'
    })
}
/**
 * Fetches all submitted timesheets for a given project and organization based on timesheet ID.
 * @param {Object} props - Includes entity, organizationId, id (project manager's ID), timeSheetId, and weekendDate.
 * @returns {Promise} - API response with submitted timesheets.
 */
export const getAllSubmittedTimesheets = (props) => {
    const { entity, organizationId, id, timeSheetId, weekendDate } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/byTimesheet/${timeSheetId}?projectManagerId=${id}&weekendDate=${weekendDate}`,
        method: 'get'
    })
}

/**
 * Fetches all timesheets submitted by direct and indirect subordinates under a project manager for a given organization.
 * @param {Object} props - Includes entity, organizationId, empId (manager's ID), resourceId (client manager's ID), direct, and inDirect subordinates.
 * @returns {Promise} - API response with timesheet records.
 */
export const getAllTimeSheetsByManagerId = (props) => {
    const { entity, organizationId, empId, resourceId, direct, inDirect } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/byProjectManager?managerId=${empId}&clientManagerId=${resourceId}&status=${'Submitted'}&directSubOrdinates=${direct}&inDirectSubOrdinates=${inDirect}`,
        method: 'get'
    })
}

/**
 * Fetches the current leaves for employees at a specific location, for a given manager in the organization.
 * @param {Object} props - Includes entity, organizationId, empId (manager's ID), locationId, and reason.
 * @returns {Promise} - API response with the current leave records.
 */
export const currentLeavesByLocationId = (props) => {
    const { entity, organizationId, empId, locationId } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/todayLeaves?managerId=${empId}&locationId=${locationId}&startDate&endDate`,
        method: 'get'
    })
}

/**
 * Fetches the upcoming leaves for employees at a specific location within a given date range, for a manager in the organization.
 * @param {Object} props - Includes entity, organizationId, empId (manager's ID), locationId, startDate, endDate, and reason.
 * @returns {Promise} - API response with the upcoming leave records.
 */
export const upcommingLeavesByLocationId = (props) => {
    const { entity, organizationId, empId, locationId, endDate } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/upcomingLeaves?managerId=${empId}&locationId=${locationId}&startDate&endDate=${endDate}`,
        method: 'get'
    })
}

/**
 * Rejects a timesheet by its ID for a specific project in the organization.
 * @param {Object} props - Includes entity, organizationId, id (timesheet ID), proid (project ID), and reason for rejection.
 * @returns {Promise} - API response indicating success or failure of the rejection.
 */
export const TimesheetRejectById = (props) => {
    const { entity, organizationId, id, proid, reason } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/reject/byTimesheetAndProject?id=${id}&projectId=${proid}&remarks=${reason}`,
        method: 'put'
    })
}

/**
 * Fetches all unused events for a specific location in the organization.
 * @param {Object} props - Includes entity, organizationId, and locationId.
 * @returns {Promise} - API response with unused events.
 */
export const getAllUnUsedEvents = (props) => {
    const { entity, organizationId, locationId } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/unUsedEvent/${locationId}`,
        method: 'get'
    })
}

// *********************** Get By Id ******************* //
/**
 * Fetches a record by its ID for a specific entity and organization.
 * @param {Object} props - Includes entity, organizationId, id (record ID).
 * @returns {Promise} - API response with the record details.
 */
export const getById = (props) => {
    const { entity, organizationId, id } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/one/${id}`,
        method: 'get'
    })
}

/**
 * Fetches a holiday record by its ID for a specific entity and organization.
 * @param {Object} props - Includes entity, organizationId, id (holiday ID).
 * @returns {Promise} - API response with the holiday details.
 */
export const getHolidayById = (props) => {
    const { entity, organizationId, id } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/byHoliday/${id}`,
        method: 'get'
    })
}

/**
 * Fetches a record by its ID without requiring the organization ID.
 * @param {Object} props - Includes entity, id (record ID).
 * @returns {Promise} - API response with the record details.
 */
export const getByIdwithOutOrg = (props) => {
    const { entity, id } = props
    return request({
        url: `${API_BASE_URL}${entity}/one/${id}`,
        method: 'get'
    })
}

/**
 * Fetches the holiday calendar for a specific location and year within the organization.
 * @param {Object} props - Includes entity, locationId, organizationId, and year.
 * @returns {Promise} - API response with the holiday calendar.
 */
export const getHolidayCalendarByLocationIdAndYear = (props) => {
    const { entity, locationId, organizationId, year } = props

    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/byLocation/${locationId}?year=${year}`,
        method: 'get'
    })
}

/**
 * Fetches appraisal details by appraisal ID for a specific employee in the organization.
 * @param {Object} props - Includes entity, organizationId, id (appraisal ID).
 * @returns {Promise} - API response with the appraisal details for the employee.
 */
export const getAppraisalsByIdForEmployee = (props) => {
    const { entity, organizationId, id } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/one/byEmployee?appraisalId=${id}`,
        method: 'get'
    })
}

// ******************** Filters Using Dates ****************** //
/**
 * Fetches data for an employee between specified dates and status.
 * @param {Object} props - Includes entity, organizationId, empId (employee ID), fromDate, toDate, status.
 * @returns {Promise} - API response with data for the employee between the given dates and status.
 */
export const getDataBetweenDatesByEmpId = (props) => {
    const { entity, organizationId, empId, fromDate, toDate, status } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/byEmployee?employeeId=${empId}&&startDate=${fromDate == undefined ? '' : fromDate
            }&endDate=${toDate == undefined ? '' : toDate}&status=${status == undefined ? 'All' : status
            }`,
        method: 'get'
    })
}

/**
 * Fetches data for an employee under a manager between specified dates and status.
 * @param {Object} props - Includes entity, organizationId, empId (employee ID), fromDate, toDate, status, direct, inDirect (subordinate data).
 * @returns {Promise} - API response with the data for the employee under the manager between the given dates and status.
 */
export const getDataBetweenDatesByMngId = (props) => {
    const { entity, organizationId, empId, fromDate, toDate, status, direct, inDirect } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/appliedLeaves?managerId=${empId}&&startDate=${fromDate == undefined ? '' : fromDate
            }&endDate=${toDate == undefined ? '' : toDate}&status=${status == '' ? 'All' : status
            }&directSubOrdinates=${direct}&inDirectSubOrdinates=${inDirect}`,
        method: 'get'
    })
}

/**
 * Fetches expenses for an employee under a manager between specified dates and status.
 * @param {Object} props - Includes entity, organizationId, empId (manager ID), fromDate, toDate, status.
 * @returns {Promise} - API response with the expenses data for the manager between the given dates and status.
 */
export const getExpensesBetweenDatesByMngId = (props) => {
    const { entity, organizationId, empId, fromDate, toDate, status } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/byManager?managerId=${empId}&&startDate=${fromDate == undefined ? '' : fromDate
            }&endDate=${toDate == undefined ? '' : toDate}&status=${status}`,
        method: 'get'
    })
}

/**
 * Fetches timesheet data for an employee under a manager between specified dates and status.
 * @param {Object} props - Includes entity, organizationId, id (manager ID), resourceId, fromDate, toDate, status, direct, inDirect (subordinate data).
 * @returns {Promise} - API response with the timesheet data for the manager between the given dates and status.
 */
export const getTimesheetsBetweenDatesByMngId = (props) => {
    const { entity, organizationId, id, resourceId, fromDate, toDate, status, direct, inDirect } =
        props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/byProjectManager?managerId=${id}&clientManagerId=${resourceId}&startDate=${fromDate == undefined ? '' : fromDate
            }&endDate=${toDate == undefined ? '' : toDate}&status=${status == undefined ? 'Submitted' : status
            }&directSubOrdinates=${direct}&inDirectSubOrdinates=${inDirect}`,
        method: 'get'
    })
}

/**
 * Authorizes all provided timesheets for a manager with an approval reason.
 * @param {Object} props - Includes entity, organizationId, managerId, reason, and body (list of timesheet IDs).
 * @returns {Promise} - API response after authorizing timesheets.
 */
export const TimeSheetAuthorizeAll = (props) => {
    const { entity, organizationId, managerId, reason, body } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/authorizeAll?managerId=${managerId}&status=Approved&reason=${reason}`,
        body: JSON.stringify(body),
        method: 'put'
    })
}

/**
 * Rejects all provided timesheets for a manager with a rejection reason.
 * @param {Object} props - Includes entity, organizationId, managerId, reason, and body (list of timesheet IDs).
 * @returns {Promise} - API response after rejecting timesheets.
 */
export const TimeSheetRejectAll = (props) => {
    const { entity, organizationId, managerId, reason, body } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/authorizeAll?managerId=${managerId}&status=Rejected&reason=${reason}`,
        body: JSON.stringify(body),
        method: 'put'
    })
}

/**
 * Retrieves all states by ID.
 * @param {Object} props - Includes entity and id.
 * @returns {Promise} - API response with state data.
 */
export const getAllStatesById = (props) => {
    const { entity, id } = props
    return request({
        url: `${API_BASE_URL}${entity}/${id}`,
        method: 'get'
    })
}

/**
 * Retrieves all timesheets for an employee by ID.
 * @param {Object} props - Includes entity, organizationId, and id (employee ID).
 * @returns {Promise} - API response with timesheet data.
 */
export const getAllTisheetsById = (props) => {
    const { entity, organizationId, id } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/employee/${id}`,
        method: 'get'
    })
}

/**
 * Retrieves all records by organization and location ID.
 * @param {Object} props - Includes entity, organizationId, and locationId.
 * @returns {Promise} - API response with all matching records.
 */
export const getAllByOrgIdLocationId = (props) => {
    const { entity, organizationId, locationId } = props
    return request({
        url:
            organizationId !== null
                ? `${API_BASE_URL}${entity}/all`
                : `${API_BASE_URL}${entity}/${organizationId}/${locationId}`,
        method: 'get'
    })
}

/**
 * Cancels a record by ID for a specific organization.
 * @param {Object} props - Includes entity, organizationId, id, and body.
 * @returns {Promise} - API response after cancellation.
 */
export const cancelApi = (props) => {
    const { entity, organizationId, id, body } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/cancel/${id}`,
        method: 'put',
        body: JSON.stringify(body)
    })
}

/**
 * Updates a record by ID.
 * @param {Object} props - Includes entity, id, and body.
 * @returns {Promise} - API response after update.
 */
export const updateWithId = (props) => {
    const { entity, id, body } = props
    return request({
        url: `${API_BASE_URL}${entity}/update/${id}`,
        method: 'put',
        body: JSON.stringify(body)
    })
}

/**
 * Retrieves all leave records for a specific employee by ID.
 * @param {Object} props - Includes entity and id.
 * @returns {Promise} - API response with leave data.
 */
export const getLeavesById = (props) => {
    const { entity, id } = props
    return request({
        url: `${API_BASE_URL}${entity}/getAllLeaveByEmployee/${id}`,
        method: 'get'
    })
}

/**
 * Updates a record by ID with file upload support (no organization ID).
 * @param {Object} props - Includes entity, id, and body (file data).
 * @returns {Promise} - API response after update.
 */
export const updateWithFileWithoutOrg = (props) => {
    const { entity, id, body } = props
    return request8({
        url: `${API_BASE_URL}${entity}/update/${id}`,
        method: 'put',
        body: body
    })
}

/**
 * Retrieves a record by organization ID, location ID, and record ID.
 * @param {Object} props - Includes entity, organizationId, locationId, and id.
 * @returns {Promise} - API response with the matching record.
 */
export const getByIdWithOrgAndLocationIds = (props) => {
    const { entity, organizationId, locationId, id } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/${locationId}/${id}`,
        method: 'get'
    })
}

/**
 * Deletes a record by organization ID, location ID, and record ID.
 * @param {Object} props - Includes entity, organizationId, locationId, and id.
 * @returns {Promise} - API response after deletion.
 */
export const deleteWithOrgAndLocationIds = (props) => {
    const { entity, organizationId, locationId, id } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/${locationId}/delete/${id}`,
        method: 'delete'
    })
}

/**
 * Retrieves all records for a given organization ID.
 * @param {Object} props - Includes entity and organizationId.
 * @returns {Promise} - API response with all records.
 */
export const getAllById = (props) => {
    const { entity, organizationId } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/all`,
        method: 'get'
    })
}

/**
 * Retrieves appraisal reports by location within a date range.
 * @param {Object} props - Includes entity, organizationId, locationId, fromDate, and toDate.
 * @returns {Promise} - API response with appraisal reports.
 */
export const getAppraisalReports = (props) => {
    const { entity, organizationId, locationId } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/reports/byLocation/${locationId}`,
        method: 'get'
    })
}

/**
 * Retrieves appraisal reports by review period.
 * @param {Object} props - Includes entity, organizationId, locationId, and reviewPeriod.
 * @returns {Promise} - API response with appraisal reports.
 */
export const getAppraisalReportsByDate = (props) => {
    const { entity, organizationId, locationId, reviewPeriod } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/reports/byLocation/${locationId}?reviewPeriod=${reviewPeriod}`,
        method: 'get'
    })
}

/**
 * Retrieves review periods by location.
 * @param {Object} props - Includes entity, organizationId, and locationId.
 * @returns {Promise} - API response with review periods.
 */
export const getReviewPeriod = (props) => {
    const { entity, organizationId, locationId } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/reviewPeriod/byLocation/${locationId} `,
        method: 'get'
    })
}

/**
 * Updates the pay run object for a given organization.
 * @param {Object} props - Includes entity, organizationId, id, and body.
 * @returns {Promise} - API response after update.
 */
export const updatePayRunObj = (props) => {
    const { entity, organizationId, body } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/update`,
        method: 'post',
        body: JSON.stringify(body)
    })
}

/**
 * Saves or updates a monthly pay run.
 * @param {Object} props - Includes entity, organizationId, id, and body.
 * @returns {Promise} - API response after update.
 */
export const savePayRun = (props) => {
    const { entity, organizationId, id, body } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/UpdateMonthlyPayRun/${id}`,
        method: 'put',
        body: JSON.stringify(body)
    })
}

/**
 * Generates a pay run for a specified employee and month.
 * @param {Object} props - Includes entity, organizationId, year, month, locationId, and employeeId.
 * @returns {Promise} - API response after pay run generation.
 */
export const generatePayrun = (props) => {
    const { entity, organizationId, year, month, locationId, employeeId } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/generate/${locationId}?year=${year}&month=${month}&employeeId=${employeeId}`,
        method: 'post',
        props: props,
        operationType: 'generate'
    })
}

/**
 * Retrieves employee data filtered by gender and marital status.
 * @param {Object} props - Includes entity, organizationId, locationId, and employeeId.
 * @returns {Promise} - API response with employee data.
 */
export const getAllWithGenderandMartial = (props) => {
    const { entity, organizationId, locationId, employeeId } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/byGenderByMartial?locationId=${locationId}&employeeId=${employeeId}`,
        method: 'get'
    })
}

/**
 * Retrieves balance data filtered by gender and marital status.
 * @param {Object} props - Includes entity, organizationId, locationId, and employeeId.
 * @returns {Promise} - API response with balance data.
 */
export const getAllWithGenderandMartialBal = (props) => {
    const { entity, organizationId, locationId, employeeId } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/byGenderByMartialBal?locationId=${locationId}&employeeId=${employeeId}`,
        method: 'get'
    })
}

/**
 * Deletes a state record by ID for a specific organization.
 * @param {Object} props - Includes entity, organizationId, and id.
 * @returns {Promise} - API response after deletion.
 */
export const stateDeleteById = (props) => {
    const { entity, organizationId, id } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/stateDelete/${id}`,
        method: 'delete'
    })
}

 export const logout = async (props) => {
    const { id } = props;
    const env = JSON.parse(localStorage.getItem('url')).ENV
    return request({
        url: `${API_BASE_URL}identity/logout?id=${id}&env=${env}&type=${'web'}`,
        method: 'post',
    })
  };
