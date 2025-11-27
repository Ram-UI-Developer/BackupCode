import { request, request8, requestUpload } from '../Utilities/ApiHelper'
import { API_BASE_URL } from '../Utilities/Constants'

/**
 * Authenticates a user.
 * @param {Object} props - Includes body containing login credentials.
 * @returns {Promise} - API response with authentication details.
 */
export const login = (props) => {
    const { body } = props
    return request({
        url: `${API_BASE_URL}identity/login`,
        method: 'post',
        body: JSON.stringify(body)
    })
}

export const sendTokenToServer = (props) => {
    const { body } = props
    return request({
        url: `${API_BASE_URL}notifications/register-token`,
        method: 'post',
        body: JSON.stringify(body)
    })
}

/**
 * Retrieves all active employees by location.
 * @param {Object} props - Includes entity, locationId, and organizationId.
 * @returns {Promise} - API response with employee data.
 */
export const getAllEmployeesById = (props) => {
    const { entity, locationId, organizationId } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/byLocation?ids=${locationId}&status=${'Active'}`,
        method: 'get'
    })
}



/**
 * Retrieves an invoice for a subscription by subscriber ID.
 * @param {Object} props - Includes subscriptionId and organizationId.
 * @returns {Promise} - API response with invoice.
 */
export const getInvoiceBySubscriberId = (props) => {
    const { subscriptionId, organizationId } = props
    return request({
        url: `${API_BASE_URL}subscriptions/${organizationId}/getInvoice/${subscriptionId}`,
        method: 'get'
    })
}

/**
 * Retrieves an invoice for a subscription from the app owner's perspective.
 * @param {Object} props - Includes subscriptionId and organizationId.
 * @returns {Promise} - API response with invoice.
 */
export const getInvoiceBySubscriberIdAppOwner = (props) => {
    const { subscriptionId, organizationId } = props
    return request({
        url: `${API_BASE_URL}subscriptions/getSubscriberInvoice/${subscriptionId}?organizationId=${organizationId}`,
        method: 'get'
    })
}

export const notificationsById = (props) => {
    const { employeeId, } = props;
    return request({
        url: `${API_BASE_URL}notifications/messages?receiptId=${employeeId}`,
        method: "get",
    });
};


/**
 * Retrieves data by location for a given organization.
 * @param {Object} props - Includes entity, locationId, and organizationId.
 * @returns {Promise} - API response with data.
 */
export const getAllByLocation = (props) => {
    const { entity, locationId, organizationId } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/byLocation/${locationId}`,
        method: 'get'
    })
}

/**
 * Retrieves weekly captured hours for an employee.
 * @param {Object} props - Includes entity, emplId, organizationId, and weekendDate.
 * @returns {Promise} - API response with captured hours.
 */
export const getDayCapturedHours = (props) => {
    const { entity, emplId, organizationId, weekendDate } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/weeklyHours/${emplId}?weekendDate=${weekendDate}`,
        method: 'get'
    })
}

/**
 * Retrieves all punch-in records by date.
 * @param {Object} props - Includes entity, id, fromDate, and organizationId.
 * @returns {Promise} - API response with punch-in records.
 */
export const getAllPunchInsByDate = (props) => {
    const { entity, id, fromDate, organizationId } = props
    return request8({
        url: `${API_BASE_URL}${entity}/${organizationId}/byDate/${id}?from=${fromDate}`,
        method: 'get'
    })
}

/**
 * Retrieves all projects for a given employee.
 * @param {Object} props - Includes entity, organizationId, and employeeId.
 * @returns {Promise} - API response with project data.
 */
export const getAllByprojects = (props) => {
    const { entity, organizationId, employeeId } = props
    return request({
        url: `${API_BASE_URL}aggregations/${entity}/${organizationId}/allProjects/${employeeId}`,
        method: 'get'
    })
}

/**
 * Initiates the forgot password process.
 * @param {Object} props - Includes body with user email or identifier.
 * @returns {Promise} - API response with status.
 */
export const forgotPass = (props) => {
    const { body } = props
    return request({
        url: `${API_BASE_URL}users/forgotPassword`,
        method: 'put',
        body: JSON.stringify(body)
    })
}

/**
 * Changes the password for a user.
 * @param {Object} props - Includes body with old and new passwords.
 * @returns {Promise} - API response with status.
 */
export const changePassword = (props) => {
    const { body } = props
    return request({
        url: `${API_BASE_URL}users/changePassword`,
        method: 'put',
        body: JSON.stringify(body)
    })
}

/**
 * Unlocks a user account by ID.
 * @param {Object} props - Includes user ID.
 * @returns {Promise} - API response with unlock status.
 */
export const unlockUser = (props) => {
    const { id } = props
    return request({
        url: `${API_BASE_URL}users/unlock/${id}`,
        method: 'get'
    })
}

/**
 * Resets a user's password using their username.
 * @param {Object} props - Includes username.
 * @returns {Promise} - API response with reset status.
 */
export const reset = (props) => {
    const { username } = props
    return request({
        url: `${API_BASE_URL}users/resetPassword?username=${username}`,
        method: 'put',
        props: props,
        operationType: 'reset',
    })
}

/**
 * Retrieves data for a given organization and year.
 * @param {Object} props - Includes entity, organizationId, and year.
 * @returns {Promise} - API response with data.
 */
export const getAllWithOrgAndYear = (props) => {
    const { entity, organizationId, year } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/byYear/${year}`,
        method: 'get'
    })
}

/**
 * Retrieves leave records between two dates.
 * @param {Object} props - Includes entity, organizationId, id, fromDate, toDate, and status.
 * @returns {Promise} - API response with leave records.
 */
export const getLeavesBetweenDates = (props) => {
    const { entity, organizationId, id, fromDate, toDate, status } = props
    return request({
        url: `${API_BASE_URL}aggregations/${entity}/${organizationId}/all/${id}?startDate=${fromDate == undefined ? '' : fromDate
            }&endDate=${toDate == undefined ? '' : toDate}&status=${status}`,
        method: 'get'
    })
}

/**
 * Retrieves all leaves applied under a manager's ID.
 * @param {Object} props - Includes entity, organizationId, and manager id.
 * @returns {Promise} - API response with leave data.
 */
export const getAllLeavesByMngId = (props) => {
    const { entity, organizationId, id } = props
    return request({
        url: `${API_BASE_URL}aggregations/${entity}/${organizationId}/appliedLeavesByManagerId/${id}`,
        method: 'get'
    })
}

/**
 * Deletes a holiday calendar by location and year.
 * @param {Object} props - Includes entity, locationId, and year.
 * @returns {Promise} - API response indicating deletion status.
 */
export const deleteByLocationId = (props) => {
    const { entity, locationId, year } = props
    return request({
        url: `${API_BASE_URL}${entity}/delete/${locationId}/${year}`,
        method: 'delete'
    })
}

/**
 * Retrieves holiday calendar for an employee by location and year.
 * @param {Object} props - Includes entity, empId, organizationId, and year.
 * @returns {Promise} - API response with holiday calendar.
 */
export const getHolidayCalendarByLocationId = (props) => {
    const { entity, empId, organizationId, year } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/byLocation/${empId}?year=${year}`,
        method: 'get'
    })
}

/**
 * Retrieves upcoming holidays for an employee by location.
 * @param {Object} props - Includes entity, employeeId, organizationId, and year.
 * @returns {Promise} - API response with holiday list.
 */
export const getUpcomingHolidaysByLocationId = (props) => {
    const { entity, employeeId, organizationId } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/allHolidays/byLocation?employeeId=${employeeId}`,
        method: 'get'
    })
}

/**
 * Retrieves timesheet data for an employee between given dates.
 * @param {Object} props - Includes entity, organizationId, id, fromDate, toDate, and status.
 * @returns {Promise} - API response with timesheet data.
 */
export const getTimeSheet = (props) => {
    const { entity, organizationId, id, fromDate, toDate, status } = props
    return request({
        url: `${API_BASE_URL}aggregations/${entity}/${organizationId}/employee/${id}?startDate=${fromDate == undefined ? '' : fromDate
            }&endDate=${toDate == null ? '' : toDate}&status=${status == undefined ? '' : status}`,
        method: 'get'
    })
}

/**
 * Approves a record by ID with remarks.
 * @param {Object} props - Includes entity, organizationId, body, id, and reason.
 * @returns {Promise} - API response with approval status.
 */
export const ApproveById = (props) => {
    const { entity, organizationId, body, id, reason } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/approve/${id}?remarks=${reason}`,
        method: 'put',
        body: JSON.stringify(body)
    })
}

/**
 * Approves a timesheet by ID with remarks.
 * @param {Object} props - Includes entity, organizationId, id, proid, and reason.
 * @returns {Promise} - API response with approval status.
 */
export const TimesheetApproveById = (props) => {
    const { entity, organizationId, id, proid, reason } = props
    return request({
        url: `${API_BASE_URL}${entity}/approve/${organizationId}/${id}/${proid}?remarks=${reason}`,
        method: 'put'
    })
}

/**
 * Rejects a record by ID with remarks.
 * @param {Object} props - Includes entity, organizationId, body, id, and reason.
 * @returns {Promise} - API response with rejection status.
 */
export const RejectById = (props) => {
    const { entity, organizationId, body, id, reason } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/reject/${id}?remarks=${reason}`,
        method: 'put',

        body: JSON.stringify(body)
    })
}

/**
 * Rejects a timesheet by ID with remarks.
 * @param {Object} props - Includes entity, organizationId, id, proid, and reason.
 * @returns {Promise} - API response with rejection status.
 */
export const TimesheetRejectById = (props) => {
    const { entity, organizationId, id, proid, reason } = props
    return request({
        url: `${API_BASE_URL}${entity}/reject/${organizationId}/${id}/${proid}?remarks=${reason}`,
        method: 'put'
    })
}

/**
 * Retrieves timesheets assigned to a project manager.
 * @param {Object} props - Includes entity, organizationId, and id.
 * @returns {Promise} - API response with timesheet data.
 */
export const getAuthTimeSheet = (props) => {
    const { entity, organizationId, id } = props
    return request({
        url: `${API_BASE_URL}aggregations/${entity}/${organizationId}/timesheetsByProjectManager/${id}`,
        method: 'get'
    })
}

/**
 * Retrieves all submitted timesheets.
 * @param {Object} props - Includes entity, organizationId, id, projectId, empId, and weekendDate.
 * @returns {Promise} - API response with submitted timesheets.
 */
export const getAllSubmitted = (props) => {
    const { entity, organizationId, id, projectId, empId, weekendDate } = props
    return request({
        url: `${API_BASE_URL}aggregations/${entity}/${organizationId}/allSubmitted/${id}/${projectId}/${empId}/${weekendDate}`,
        method: 'get'
    })
}

/**
 * Retrieves all leave types for a location.
 * @param {Object} props - Includes entity, organizationId, and id.
 * @returns {Promise} - API response with leave types.
 */
export const getAllLeaveTypeByLocationId = (props) => {
    const { entity, organizationId, id } = props
    return request({
        url: `${API_BASE_URL}aggregations/${entity}/${organizationId}/location/${id}`,
        method: 'get'
    })
}

/**
 * Retrieves leave balance for an employee.
 * @param {Object} props - Includes entity, organizationId, locationId, and id (employeeId).
 * @returns {Promise} - API response with leave balance.
 */
export const getLeaveBalance = (props) => {
    const { entity, organizationId, locationId, id } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/byEmployee?employeeId=${id}&locationId=${locationId}`,
        method: 'get'
    })
}

/**
 * Retrieves leave balance history for an employee by leave type.
 * @param {Object} props - Includes entity, organizationId, id (leaveTypeId), and employeeId.
 * @returns {Promise} - API response with balance history.
 */
export const getLeaveBalanceHistory = (props) => {
    const { entity, organizationId, id, employeeId } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/employeeHistory/${employeeId}?leaveTypeId=${id}`,
        method: 'get'
    })
}

/**
 * Retrieves email templates for a location.
 * @param {Object} props - Includes entity, organizationId, and id.
 * @returns {Promise} - API response with email templates.
 */
export const getEmailTemplatesByLocation = (props) => {
    const { entity, organizationId, id } = props
    return request({
        url: `${API_BASE_URL}aggregations/${entity}/${organizationId}/${id}`,
        method: 'get'
    })
}

/**
 * Retrieves all email templates.
 * @param {Object} props - Includes entity and id.
 * @returns {Promise} - API response with email templates.
 */
export const getEmailTemplatesAll = (props) => {
    const { entity } = props
    return request({
        url: `${API_BASE_URL}aggregations/${entity}/all`,
        method: 'get'
    })
}

/**
 * Updates the email template status (e.g., active/deleted).
 * @param {Object} props - Includes entity, organizationId, locationId, id, and status.
 * @returns {Promise} - API response with update result.
 */
export const updateEmailStatus = (props) => {
    const { organizationId, id, status } = props
    return request({
        url: `${API_BASE_URL}emailtemplates/${organizationId}/updateStatus/${id}?deleted=${status}`,
        method: 'put'
    })
}

/**
 * Updates status by country within an organization.
 * @param {Object} props - Includes entity, organizationId, id (countryId), and status.
 * @returns {Promise} - API response with update result.
 */
export const updateStatusWithOrgId = (props) => {
    const { entity, organizationId, id, status } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/delete/byCountry?countryId=${id}&deleted=${status}`,
        method: 'delete'
    })
}

//  <-------------- dashboard services ----------->
/**
 * Fetches announcements for a specific date, organization, and location.
 * @param {Object} props - Includes entity, date, organizationId, and locationId.
 * @returns {Promise} - API response with announcements.
 */
export const getAnnouncements = (props) => {
    const { entity, date, organizationId, locationId } = props
    return request({
        url: `${API_BASE_URL}aggregations/${entity}/${date}/${organizationId}/${locationId}`,
        method: 'get'
    })
}

/**
 * Fetches upcoming holidays for the given entity.
 * @param {Object} props - Includes entity and id.
 * @returns {Promise} - API response with future holidays.
 */
export const getFutureHolidays = (props) => {
    const { entity, id } = props
    return request({
        url: `${API_BASE_URL}${entity}/getFutureHolidays/${id}`,
        method: 'get'
    })
}

/**
 * Fetches employee birthdays in the next 7 days.
 * @param {Object} props - Includes entity and id.
 * @returns {Promise} - API response with upcoming birthdays.
 */
export const getSevenDaysBirthdays = (props) => {
    const { entity, id } = props
    return request({
        url: `${API_BASE_URL}${entity}/getSevenDaysBirthdays/${id}`,
        method: 'get'
    })
}

/**
 * Fetches employee marriage anniversaries in the next 7 days.
 * @param {Object} props - Includes entity and id.
 * @returns {Promise} - API response with upcoming marriage anniversaries.
 */
export const getSevenDaysMarriageAnniversaries = (props) => {
    const { entity, id } = props
    return request({
        url: `${API_BASE_URL}${entity}/getSevenDaysMarriageAnniversaries/${id}`,
        method: 'get'
    })
}

/**
 * Fetches employee work anniversaries in the next 7 days.
 * @param {Object} props - Includes entity and id.
 * @returns {Promise} - API response with upcoming work anniversaries.
 */
export const getSevenDaysWorkAnniversaries = (props) => {
    const { entity, id } = props
    return request({
        url: `${API_BASE_URL}${entity}/getSevenDaysWorkAnniversaries/${id}`,
        method: 'get'
    })
}

/**
 * Fetches the pre-anniversary date for the organization.
 * @param {Object} props - Includes entity and id.
 * @returns {Promise} - API response with pre-anniversary information.
 */
export const getOrganizationPreAnniversary = (props) => {
    const { entity, id } = props
    return request({
        url: `${API_BASE_URL}${entity}/getOrganizationPreAnniversary/${id}`,
        method: 'get'
    })
}

/**
 * Fetches today's employee birthdays.
 * @param {Object} props - Includes entity and id.
 * @returns {Promise} - API response with today's birthdays.
 */
export const getTodaysBirthDaysById = (props) => {
    const { entity, id } = props
    return request({
        url: `${API_BASE_URL}${entity}/getTodaysBirthDays/${id}`,
        method: 'get'
    })
}

/**
 * Fetches today's employee marriage anniversaries.
 * @param {Object} props - Includes entity and id.
 * @returns {Promise} - API response with today's marriage anniversaries.
 */
export const getTodaysMarriageAnnivresariesById = (props) => {
    const { entity, id } = props
    return request({
        url: `${API_BASE_URL}${entity}/getTodaysMarriageAnnivresaries/${id}`,
        method: 'get'
    })
}

/**
 * Fetches today's employee work anniversaries.
 * @param {Object} props - Includes entity and id.
 * @returns {Promise} - API response with today's work anniversaries.
 */
export const getTodaysWorkAnnivresaries = (props) => {
    const { entity, id } = props
    return request({
        url: `${API_BASE_URL}${entity}/getTodaysWorkAnnivresaries/${id}`,
        method: 'get'
    })
}

/**
 * Fetches special congratulation events for a location within a date range.
 * @param {Object} props - Includes entity, id (location), startDate, and endDate.
 * @returns {Promise} - API response with special congratulation data.
 */
export const getSpecialCongrats = (props) => {
    const { entity, id, startDate, endDate } = props
    return request({
        url: `${API_BASE_URL}${entity}/getAllByLocations/${id}/${startDate}/${endDate}`,
        method: 'get'
    })
}

/**
 * Fetches today's company anniversary information.
 * @param {Object} props - Includes entity and id.
 * @returns {Promise} - API response with today's organization anniversary.
 */
export const getTodayCompanyAnniversary = (props) => {
    const { entity, id } = props
    return request({
        url: `${API_BASE_URL}${entity}/getOrganizationTodayAnniversary/${id}`,
        method: 'get'
    })
}

/**
 * Fetches today's employee gratitude period anniversaries.
 * @param {Object} props - Includes entity and id.
 * @returns {Promise} - API response with today's gratitude period employees.
 */
export const getgratitudeday = (props) => {
    const { entity, id } = props
    return request({
        url: `${API_BASE_URL}${entity}/getTodaysEmployeesGratitudePeriod/${id}`,
        method: 'get'
    })
}

/**
 * Fetches employee gratitude period anniversaries in the next 7 days.
 * @param {Object} props - Includes entity and id.
 * @returns {Promise} - API response with upcoming gratitude period employees.
 */
export const getSevenDaysEmployeesGratitudePeriod = (props) => {
    const { entity, id } = props
    return request({
        url: `${API_BASE_URL}${entity}/getSevenDaysEmployeesGratitudePeriod/${id}`,
        method: 'get'
    })
}

/**
 * Fetches reports by location ID for a given organization.
 * @param {Object} props - Includes entity, organizationId, and id.
 * @returns {Promise} - API response with location reports.
 */
export const getReportsByLocationId = (props) => {
    const { entity, organizationId, id } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/byLocation/${id}`,
        method: 'get'
    })
}

/**
 * Sends a holiday calendar email based on year and shift.
 * @param {Object} props - Includes entity, id, organizationId, year, and shiftId.
 * @returns {Promise} - API response after email is sent.
 */
export const sendingHolidayEmail = (props) => {
    const { entity, id, organizationId, year, shiftId } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/holidayCalender/byLocation/${id}?year=${year}&shiftId=${shiftId}`,
        method: 'post'
    })
}

/**
 * Fetches organization details by ID.
 * @param {Object} props - Includes entity and id.
 * @returns {Promise} - API response with organization details.
 */
export const getByOrganizationDetails = (props) => {
    const { entity, id } = props
    return request({
        url: `${API_BASE_URL}${entity}/getByOrganizationDetails/${id}`,
        method: 'get'
    })
}

/**
 * Submits an "About" form or content.
 * @param {Object} props - Includes entity, id, and body.
 * @returns {Promise} - API response for submission.
 */
export const about = (props) => {
    const { entity, body } = props
    return request({
        url: `${API_BASE_URL}${entity}/about`,
        method: 'post',
        body: JSON.stringify(body)
    })
}

/**
 * Fetches all leaves approved/applied by a manager within a date range.
 * @param {Object} props - Includes entity, organizationId, id, fromDate, toDate, and status.
 * @returns {Promise} - API response with leave records.
 */
export const getAllLeavesByMngIdFromToDates = (props) => {
    const { entity, organizationId, id, fromDate, toDate, status } = props
    return request({
        url: `${API_BASE_URL}aggregations/${entity}/${organizationId}/appliedLeavesByManagerId/${id}?startDate=${fromDate == undefined ? '' : fromDate
            }&endDate=${toDate == undefined ? '' : toDate}&status=${status}`,
        method: 'get'
    })
}

/**
 * Fetches timesheets submitted to a manager within a date range.
 * @param {Object} props - Includes entity, organizationId, id, fromDate, toDate, and status.
 * @returns {Promise} - API response with timesheet data.
 */
export const getAllTimeSheetsByMngIdFromToDates = (props) => {
    const { entity, organizationId, id, fromDate, toDate, status } = props
    return request({
        url: `${API_BASE_URL}aggregations/${entity}/${organizationId}/timesheetsByProjectManager/${id}?startDate=${fromDate == undefined ? '' : fromDate
            }&endDate=${toDate == undefined ? '' : toDate}&status=${status == undefined ? '' : status}`,
        method: 'get'
    })
}

/**
 * Deletes a project resource by ID for a specific organization.
 * @param {Object} props - Includes entity, organizationId, and id.
 * @returns {Promise} - API response after deletion.
 */
export const deleteProjectResourceById = (props) => {
    const { entity, organizationId, id } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/deleteResource/${id}`,
        method: 'delete',
        props: props,
        operationType: 'delete'
    })
}

/**
 * Fetches all timesheets within a date range and status.
 * @param {Object} props - Includes entity, fromDate, toDate, and status.
 * @returns {Promise} - API response with timesheet data.
 */
export const getAllSheetsByDates = (props) => {
    const { entity, fromDate, toDate, status } = props
    return request({
        url: `${API_BASE_URL}/${entity}/getAllSheetsByDates/startDate=${fromDate}/endDate=${toDate}status=${status}`,
        method: 'get'
    })
}

/**
 * Fetches all expenses by manager ID within a date range and status.
 * @param {Object} props - Includes entity, organizationId, id, startDate, endDate, and status.
 * @returns {Promise} - API response with expense data.
 */
export const expenseByMngId = (props) => {
    const { entity, organizationId, id, startDate, endDate, status } = props
    return request({
        url: `${API_BASE_URL}aggregations/${entity}/${organizationId}/allByManagerId/${id}?fromDate=${startDate}&toDate=${endDate}&status=${status}`,
        method: 'get'
    })
}

/**
 * Fetches default data by manager ID.
 * @param {Object} props - Includes entity, organizationId, and id.
 * @returns {Promise} - API response with manager-related data.
 */
export const defaultdata = (props) => {
    const { entity, organizationId, id } = props
    return request({
        url: `${API_BASE_URL}aggregations/${entity}/${organizationId}/allByManagerId/${id}`,
        method: 'get'
    })
}

/**
 * Fetches all timesheets by employee ID and date range.
 * @param {Object} props - Includes entity, organizationId, employeeId, startDate, endDate, and status.
 * @returns {Promise} - API response with timesheets.
 */
export const getAllSheetsByDatesEmployeeId = (props) => {
    const { entity, organizationId, employeeId, startDate, endDate, status } = props
    return request({
        url: `${API_BASE_URL}aggregations/${entity}/${organizationId}/allSheetsByEmployeeId/${employeeId}?fromDate=${startDate}&todate=${endDate}&status=${status}`,
        method: 'get'
    })
}

/**
 * Fetches all timesheets for a specific employee.
 * @param {Object} props - Includes entity, organizationId, and employeeId.
 * @returns {Promise} - API response with timesheets.
 */
export const getAllSheetsByEmployeeId = (props) => {
    const { entity, organizationId, employeeId } = props
    return request({
        url: `${API_BASE_URL}aggregations/${entity}/${organizationId}/allSheetsByEmployeeId/${employeeId}`,
        method: 'get'
    })
}

/**
 * Fetches all types by category ID.
 * @param {Object} props - Includes entity and categoryId.
 * @returns {Promise} - API response with types.
 */
export const getTypesById = (props) => {
    const { entity, categoryId } = props
    return request({
        url: `${API_BASE_URL}${entity}/getTypesById/${categoryId}`,
        method: 'get'
    })
}

/**
 * Fetches all timesheets by date range, location, and status.
 * @param {Object} props - Includes entity, organizationId, locationId, fromDate, toDate, and status.
 * @returns {Promise} - API response with timesheet records.
 */
export const getAllSheetsByDate = (props) => {
    const { entity, organizationId, locationId, fromDate, toDate, status } = props

    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/byLocation?id=${locationId}&status=${status ? status : ''
            }&fromDate=${fromDate ? fromDate : ''}&toDate=${toDate ? toDate : ''}`,
        method: 'get'
    })
}

/**
 * Fetches all approved timesheets by location ID.
 * @param {Object} props - Includes entity, organizationId, and locationId.
 * @returns {Promise} - API response with approved timesheets.
 */
export const getAllSheetsByLocationId = (props) => {
    const { entity, organizationId, locationId } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/byLocation?id=${locationId}&status=Approved`,
        method: 'get'
    })
}

/**
 * Fetches project details of a specific employee.
 * @param {Object} props - Includes entity, organizationId, and id (employeeId).
 * @returns {Promise} - API response with project details.
 */
export const getEmpProjectDetails = (props) => {
    const { entity, organizationId, id } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/byEmployee?employeeId=${id}`,
        method: 'get'
    })
}

/**
 * Updates the status of a resource with optional remarks.
 * @param {Object} props - Includes entity, organizationId, id, status, and remarks.
 * @returns {Promise} - API response after status update.
 */
export const updateStatus = (props) => {
    const { entity, organizationId, id, status, remarks } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/updateStatus/${id}?status=${status}&remarks=${remarks}`,
        method: 'put'
    })
}

/**
 * Fetches status of a resource by ID.
 * @param {Object} props - Includes entity, organizationId, and id.
 * @returns {Promise} - API response with status info.
 */
export const getAllStatus = (props) => {
    const { entity, organizationId, id } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/getStatus/${id}`,
        method: 'get'
    })
}

/**
 * Deletes a holiday record by ID.
 * @param {Object} props - Includes entity and id.
 * @returns {Promise} - API response after deletion.
 */
export const deleteByHolidayId = (props) => {
    const { entity, id } = props
    return request({
        url: `${API_BASE_URL}${entity}/deleteByHolidayId/${id}`,
        method: 'delete'
    })
}

/**
 * Fetches all active employees by organization ID.
 * @param {Object} props - Includes entity and organizationId.
 * @returns {Promise} - API response with active employees.
 */
export const getEmployeesByStatus = (props) => {
    const { entity, organizationId } = props
    return request({
        url: `${API_BASE_URL}${entity}/activeEmployees/${organizationId}`,
        method: 'get'
    })
}

/**
 * Fetches all approved leaves within a date range for a specific location.
 * @param {Object} props - Includes entity, organizationId, locationId, fromDate, and toDate.
 * @returns {Promise} - API response with leave records.
 */
export const getApprovedLeaves = (props) => {
    const { entity, organizationId, locationId, fromDate, toDate } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/approvedLeaves?locationId=${locationId}&startDate=${fromDate == undefined ? '' : fromDate
            }&endDate=${toDate == undefined ? '' : toDate}`,
        method: 'get'
    })
}

/**
 * Fetches all approved leave records for a specific user.
 * @param {Object} props - Includes entity and username.
 * @returns {Promise} - API response with approved leaves.
 */
export const getApprovedLeave = (props) => {
    const { entity, username } = props
    return request({
        url: `${API_BASE_URL}${entity}/getApprovedLeaves/${username}`,
        method: 'get'
    })
}

/**
 * Fetches approved timesheets within a date range for a location.
 * @param {Object} props - Includes entity, locationId, organizationId, fromDate, toDate.
 * @returns {Promise} - API response with approved timesheets.
 */
export const getApprovedTimesheets = (props) => {
    const { entity, locationId, organizationId, fromDate, toDate } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/approvedtimesheets?locationId=${locationId}&fromDate=${fromDate == undefined ? '' : fromDate
            }&toDate=${toDate == undefined ? '' : toDate}`,
        method: 'get'
    })
}

/**
 * Fetches approved timesheets by location only.
 * @param {Object} props - Includes entity, organizationId, and locationId.
 * @returns {Promise} - API response with approved timesheets.
 */
export const getApprovedTimesheet = (props) => {
    const { entity, organizationId, locationId } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/approvedtimesheets?locationId=${locationId}`,
        method: 'get'
    })
}

/**
 * Saves a file (document, attachment, etc.) for an organization.
 * @param {Object} props - Includes entity, organizationId, and body (file data).
 * @returns {Promise} - API response after saving file.
 */
export const SaveFile = (props) => {
    const { entity, organizationId, body } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/saveFiles`,
        method: 'post',
        body: JSON.stringify(body)
    })
}

/**
 * Fetches active employees under a given entity.
 * @param {Object} props - Includes entity and id (organizationId).
 * @returns {Promise} - API response with active employees.
 */
export const getActiveEmployees = (props) => {
    const { entity, id } = props
    return request({
        url: `${API_BASE_URL}aggregations/${entity}/activeEmployees/${id}`,
        method: 'get'
    })
}

/**
 * Updates a record by ID using a PUT request.
 * @param {Object} props - Includes entity, id, body, and organizationId.
 * @returns {Promise} - API response after update.
 */
export const SaveWithId = (props) => {
    const { entity, id, body, organizationId } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/update/${id}`,
        method: 'put',
        body: JSON.stringify(body)
    })
}

/**
 * Saves list order configuration.
 * @param {Object} props - Includes entity and body (order data).
 * @returns {Promise} - API response after order save.
 */
export const listOrder = (props) => {
    const { entity, body } = props
    return request({
        url: `${API_BASE_URL}${entity}/orderSave`,
        method: 'put',
        body: JSON.stringify(body)
    })
}

/**
 * Fetches all users by organization and their active package status.
 * @param {Object} props - Includes entity, organizationId, and id.
 * @returns {Promise} - API response with user list.
 */
export const getAllUsersByPackage = (props) => {
    const { entity, organizationId } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/active`,
        method: 'get'
    })
}

/**
 * Fetches appraisal list for a specific employee.
 * @param {Object} props - Includes entity, organizationId, and id (employeeId).
 * @returns {Promise} - API response with appraisal records.
 */
export const getAllEmployeeAppraisalList = (props) => {
    const { entity, organizationId, id } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/byEmployee?employeeId=${id}`,
        method: 'get'
    })
}

/**
 * Fetches all appraisal records by location ID.
 * @param {Object} props - Includes entity, organizationId, and locationId.
 * @returns {Promise} - API response with appraisals.
 */
export const getAllAppraisalListByLocation = (props) => {
    const { entity, organizationId, locationId } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/byLocation/${locationId}`,
        method: 'get'
    })
}

/**
 * Generic fetch for all records by location ID.
 * @param {Object} props - Includes entity, organizationId, and locationId.
 * @returns {Promise} - API response with relevant records.
 */
export const getAllListByLocation = (props) => {
    const { entity, organizationId, locationId } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/byLocation/${locationId}`,
        method: 'get'
    })
}

/**
 * Fetches employee attendance records by location.
 * @param {Object} props - Includes entity, organizationId, locationId, and employeeId.
 * @returns {Promise} - API response with attendance records.
 */
export const getEmployeeAttendanceByLocation = (props) => {
    const { entity, organizationId, locationId, employeeId } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/LeaveAttendance?employeeId=${employeeId}&locationId=${locationId}`,
        method: 'get'
    })
}

/**
 * Fetches employee attendance records by location and pay date range.
 * @param {Object} props - Includes entity, organizationId, locationId, employeeId, payStartDate, and payEndDate.
 * @returns {Promise} - API response with attendance records within the specified date range.
 */
export const getEmployeeAttendanceByLocationAndDates = (props) => {
    const { entity, organizationId, locationId, employeeId, payStartDate, payEndDate } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/LeaveAttendance?locationId=${locationId}&employeeId=${employeeId}&payStartDate=${payStartDate}&payEndDate=${payEndDate}`,
        method: 'get'
    })
}

/**
 * Fetches all timesheet rows for a specific employee within a given date range.
 * @param {Object} props - Includes entity, organizationId, fromDate, toDate, and employeeId.
 * @returns {Promise} - API response with timesheet data.
 */
export const getAllTimeSheetRowForPayrun = (props) => {
    const { entity, organizationId, fromDate, toDate, employeeId } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/getTimesheetView/${employeeId}?from=${fromDate}&to=${toDate}`,
        method: 'get'
    })
}

/**
 * Fetches compensation records by location and employee ID.
 * @param {Object} props - Includes entity, organizationId, locationId, and employeeId.
 * @returns {Promise} - API response with compensation data.
 */
export const getAllListCompByLocation = (props) => {
    const { entity, organizationId, locationId, employeeId } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/byEmployeeLocation/${locationId}?employeeId=${employeeId}`,
        method: 'get'
    })
}

/**
 * Fetches full and final settlement records by location and employee ID.
 * @param {Object} props - Includes entity, organizationId, locationId, and employeeId.
 * @returns {Promise} - API response with full and final settlement data.
 */
export const getAllListFUllAFinByLocationEmpId = (props) => {
    const { entity, organizationId, locationId, employeeId } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/byLocationAndEmployee?employeeId=${employeeId}&locationId=${locationId}`,
        method: 'get'
    })
}

/**
 * Fetches all employees who have resigned at a specific location.
 * @param {Object} props - Includes entity, organizationId, and locationId.
 * @returns {Promise} - API response with resignation details.
 */
export const getAllResignationEmployees = (props) => {
    const { entity, organizationId, locationId } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/all?locationId=${locationId}`,
        method: 'get'
    })
}

/**
 * Fetches a record by its ID for a specific entity and organization.
 * @param {Object} props - Includes entity, organizationId, and id.
 * @returns {Promise} - API response with the specific record.
 */
export const getById = (props) => {
    const { entity, organizationId, id } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/one/${id}`,
        method: 'get'
    })
}

/**
 * Fetches full and final settlement details for an employee by ID.
 * @param {Object} props - Includes entity, organizationId, and id (employeeId).
 * @returns {Promise} - API response with full and final settlement data.
 */
export const fullAndFinalSettlementgetById = (props) => {
    const { entity, organizationId, id } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/one?id=${id}`,
        method: 'get'
    })
}

/**
 * Fetches the list of peers for a given employee.
 * @param {Object} props - Includes entity, organizationId, and id (peerId).
 * @returns {Promise} - API response with peer details.
 */
export const peerGetList = (props) => {
    const { entity, organizationId, id } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/byPeer?peerId=${id}`,
        method: 'get'
    })
}

/**
 * Fetches the appraisal list for a specific manager.
 * @param {Object} props - Includes entity, organizationId, and email (manager's email).
 * @returns {Promise} - API response with appraisal records.
 */
export const getAllAppraisalListByManager = (props) => {
    const { entity, organizationId, email } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/byManager?email=${email}`,
        method: 'get'
    })
}

/**
 * Fetches all records for a specific ID.
 * @param {Object} props - Includes entity and id.
 * @returns {Promise} - API response with all records for the given ID.
 */
export const getAllById = (props) => {
    const { entity, id } = props
    return request({
        url: `${API_BASE_URL}${entity}/${id}/all`,
        method: 'get'
    })
}

/**
 * Fetches appraisals for a location between specified dates.
 * @param {Object} props - Includes entity, id, organizationId, fromDate, toDate, and status.
 * @returns {Promise} - API response with appraisal records within the date range.
 */
export const getAppraisalBetweenDates = (props) => {
    const { entity, id, organizationId, fromDate, toDate, status } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/byLocation/${id}?fromDate=${fromDate == undefined ? '' : fromDate
            }&toDate=${toDate == undefined ? '' : toDate}&status=${status == undefined ? 'All' : status
            }`,
        method: 'get'
    })
}

/**
 * Fetches the count of submitted items for a specific dashboard notification.
 * @param {Object} props - Includes entity, organizationId, and id.
 * @returns {Promise} - API response with the submitted count.
 */
export const getDashboardNotification = (props) => {
    const { entity, organizationId, id } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/SubmittedCount/${id}`,
        method: 'get'
    })
}

/**
 * Fetches all active peers for a specific entity and organization.
 * @param {Object} props - Includes entity, organizationId, and id.
 * @returns {Promise} - API response with the active peers.
 */
export const getPeers = (props) => {
    const { entity, organizationId } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/all?status=${'Active'}`,
        method: 'get'
    })
}

/**
 * Validates a CSV file before importing.
 * @param {Object} props - Includes entity, organizationId, id, and body (CSV file data).
 * @returns {Promise} - API response with the validation results.
 */
export const csvValidate = (props) => {
    const { entity, organizationId, body } = props
    return request8({
        url: `${API_BASE_URL}${entity}/${organizationId}/validate`,
        method: 'post',
        body: body
    })
}

/**
 * Fetches expense reports for a specific location within a given date range.
 * @param {Object} props - Includes entity, organizationId, locationId, fromDate, and toDate.
 * @returns {Promise} - API response with the expense reports.
 */
export const getExpenseReports = (props) => {
    const { entity, organizationId, locationId, fromDate, toDate } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/reports/byLocation/${locationId}?fromDate=${fromDate == undefined ? '' : fromDate
            }&toDate=${toDate == undefined ? '' : toDate}`,
        method: 'get'
    })
}

/**
 * Fetches timesheet monthly reports for a specific location and month.
 * @param {Object} props - Includes entity, organizationId, locationId, day, month, and year.
 * @returns {Promise} - API response with the monthly timesheet reports.
 */
export const getTimesheetMonthlyReports = (props) => {
    const { entity, organizationId, locationId, day, month, year } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/reports/byLocation/${locationId}?day=${day == undefined ? '' : day
            }&month=${month == undefined ? '' : month}&year=${year == undefined ? '' : year}`,
        method: 'get'
    })
}

/**
 * Fetches a captcha for verification purposes.
 * @returns {Promise} - API response with captcha data.
 */
export const getCaptcha = () => {
    return request({
        url: `${API_BASE_URL}captcha`,
        method: 'get'
    })
}

/**
 * Fetches timesheet file reports for an employee for a given day, month, and year.
 * @param {Object} props - Includes entity, organizationId, employeeId, day, month, and year.
 * @returns {Promise} - API response with timesheet file reports.
 */
export const getTimesheetFileReports = (props) => {
    const { entity, organizationId, employeeId, day, month, year } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/files/byEmployee?employeeId=${employeeId}&day=${day == undefined ? '' : day
            }&month=${month == undefined ? '' : month}&year=${year == undefined ? '' : year}`,
        method: 'get'
    })
}

/**
 * Automatically activates an account via email verification.
 * @param {Object} props - Includes entity and email.
 * @returns {Promise} - API response indicating activation status.
 */
export const AutoActivateAccount = (props) => {
    const { entity, email } = props
    return request({
        url: `${API_BASE_URL}${entity}/verify?email=${email}`,
        method: 'put'
    })
}

/**
 * Manually activates an account by ID.
 * @param {Object} props - Includes entity and id.
 * @returns {Promise} - API response indicating activation status.
 */
export const ManualActivateAccount = (props) => {
    const { entity, id } = props
    return request({
        url: `${API_BASE_URL}${entity}/active/${id}`,
        method: 'put'
    })
}

/**
 * Fetches all client resources for a specific client ID.
 * @param {Object} props - Includes entity, organizationId, and clientId.
 * @returns {Promise} - API response with all client resources.
 */
export const getAllClientResources = (props) => {
    const { entity, organizationId, id } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/byClient?clientId=${id}`,
        method: 'get'
    })
}

/**
 * Generates an annexure by amount, based on the provided template and mode.
 * @param {Object} props - Includes organizationId, amount, templateId, mode, and body.
 * @returns {Promise} - API response with the annexure generation results.
 */
export const annexureGenerationByAmount = (props) => {
    const { organizationId, amount, templateId, mode, body } = props
    return request({
        url: `${API_BASE_URL}annexure/${organizationId}/byTemplate${mode != null || undefined ? `` : `/${templateId}`
            }?amount=${amount}`,
        method: mode != null || undefined ? 'post' : 'get',
        ...(mode != null || undefined ? { body: JSON.stringify(body) } : {})
    })
}

/**
 * Fetches the percentage for a given annexure based on the provided body data.
 * @param {Object} props - Includes organizationId and body data.
 * @returns {Promise} - API response with the percentage details.
 */
export const getPercentage = (props) => {
    const { organizationId, body } = props
    return request({
        url: `${API_BASE_URL}annexure/${organizationId}/getPercentage`,
        method: 'POST',
        body: JSON.stringify(body)
    })
}

/**
 * Deletes an entity by its ID without requiring the organization ID.
 * @param {Object} props - Includes entity and id.
 * @returns {Promise} - API response for the delete operation.
 */
export const deleteWithoutOrgId = (props) => {
    const { entity, id } = props
    return request({
        url: `${API_BASE_URL}${entity}/delete/${id}`,
        method: 'delete',
        props: props,
        operationType: 'delete'
    })
}

/**
 * Fetches the salary templates for an organization and location, filtered by CTC.
 * @param {Object} props - Includes organizationId, locationId, and ctc.
 * @returns {Promise} - API response with the list of salary templates.
 */
export const getTemplteListctc = (props) => {
    const { organizationId, locationId, ctc } = props
    return request({
        url: `${API_BASE_URL}salarytemplates/${organizationId}/byLocation/${locationId}?ctc=${ctc}`,
        method: 'get'
    })
}

/**
 * Retrieves the Leave of Absence (LOP) details for an employee.
 * @param {Object} props - Includes entity, organizationId, and employeeId.
 * @returns {Promise} - API response with the employee's LOP details.
 */
export const getEmployeeLop = (props) => {
    const { entity, organizationId, employeeId } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/EmployeeLop?employeeId=${employeeId}`,
        method: 'get'
    })
}

/**
 * Generates payslips for an employee for a specific month and year.
 * @param {Object} props - Includes organizationId, month, year, and employeeId.
 * @returns {Promise} - API response with the generated payslips.
 */
export const payslipGenerationForEmployee = (props) => {
    const { organizationId, month, year, employeeId } = props
    return request({
        url: `${API_BASE_URL}payslip/${organizationId}/getPaySlips?employeeId=${employeeId}&month=${month}&year=${year}`,
        method: 'get'
    })
}

/**
 * Fetches salary templates for an organization and location.
 * @param {Object} props - Includes organizationId and locationId.
 * @returns {Promise} - API response with the list of salary templates.
 */
export const getTemplteList = (props) => {
    const { organizationId, locationId } = props
    return request({
        url: `${API_BASE_URL}salarytemplates/${organizationId}/Location/${locationId}`,
        method: 'get'
    })
}

/**
 * Updates the status of an entity by country without requiring the organization ID.
 * @param {Object} props - Includes entity, id, and status.
 * @returns {Promise} - API response for the status update operation.
 */
export const updateStatusWithoutOrgId = (props) => {
    const { entity, id, status } = props
    return request({
        url: `${API_BASE_URL}${entity}/delete/byCountry/${id}?deleted=${status}`,

        method: 'delete'
    })
}

/**
 * Updates an entity with a specific ID for a Full and Final Settlement (FAFS).
 * @param {Object} props - Includes entity, id, body, and organizationId.
 * @returns {Promise} - API response for the update operation.
 */
export const updateWithIdForFAFS = (props) => {
    const { entity, id, body, organizationId } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/update?id=${id}`,
        method: 'put',
        body: JSON.stringify(body)
    })
}

/**
 * Retrieves Full and Final Settlement (FAFS) details for an employee.
 * @param {Object} props - Includes organizationId and employeeId.
 * @returns {Promise} - API response with the FAFS details.
 */
export const getByIdForFAFS = (props) => {
    const { organizationId, employeeId } = props
    return request({
        url: `${API_BASE_URL}fullandfinalsettlement/${organizationId}/byEmployee?employeeId=${employeeId}`,
        method: 'get'
    })
}

/**
 * Saves an email type with a file attached, for a specific entity, organization, and location.
 * @param {Object} props - Includes entity, organizationId, locationId, and body (email type and file data).
 * @returns {Promise} - API response for the save operation.
 */
export const emailTypeSaveWithFile = (props) => {
    const { entity, organizationId, locationId, body } = props
    return request8({
        url: `${API_BASE_URL}${entity}/${organizationId}/save/byLocation/${locationId}`,
        body: body,
        method: 'post'
    })
}

/**
 * Updates an email type with a file attached, for a specific entity, organization, and location.
 * @param {Object} props - Includes entity, organizationId, locationId, id, and body (email type and file data).
 * @returns {Promise} - API response for the update operation.
 */
export const emailTypeUpdateWithFile = (props) => {
    const { entity, organizationId, id, body } = props
    return request8({
        url: `${API_BASE_URL}${entity}/${organizationId}/update/${id}`,
        body: body,
        method: 'put'
    })
}

/**
 * Retrieves all punch-in records for an employee within a given date range.
 * @param {Object} props - Includes entity, id, fromDate, toDate, organizationId, and any other parameters.
 * @returns {Promise} - API response with all punch-in records for the employee.
 */
export const getAllPunchInsByEmployeeId = (props) => {
    const { entity, id, organizationId } = props
    return request8({
        url: `${API_BASE_URL}${entity}/${organizationId}/byCurrentDate/${id}`,
        method: 'get',
        props: props
    })
}

/**
 * Retrieves all punch-in records for an employee without specific date range filters.
 * @param {Object} props - Includes entity, id, organizationId, and other parameters.
 * @returns {Promise} - API response with all punch-in records for the employee.
 */
export const getAllPunchInsByEmployeeIdWithoutFrom = (props) => {
    const { entity, id, organizationId } = props
    return request8({
        url: `${API_BASE_URL}${entity}/${organizationId}/byCurrentDate/${id}`,
        method: 'get'
    })
}

/**
 * Fetches all reports for a manager, including direct and indirect subordinates, and locations.
 * @param {Object} props - Includes entity, locationIds, organizationId, managerId, directSubOrdinate, and inDirectSubOrdinate.
 * @returns {Promise} - API response with the list of reports.
 */
export const getAllReportsByManagerId = (props) => {
    const {
        entity,
        organizationId,
        managerId,
        directSubOrdinate,
        inDirectSubOrdinate
    } = props
    return request8({
        url: `${API_BASE_URL}${entity}/${organizationId}/reportslist?managerId=${managerId}&directSubOrdinate=${directSubOrdinate}&inDirectSubOrdinate=${inDirectSubOrdinate}`,
        method: 'get'
    })
}

/**
 * Fetches attendance reports for an employee for a specific duration.
 * @param {Object} props - Includes entity, organizationId, employeeId, counter, and duration.
 * @returns {Promise} - API response with the employee attendance report.
 */
export const getAllAttendaceReports = (props) => {
    const { entity, organizationId, employeeId, counter, duration } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/employeereport/${employeeId}?counter=${counter}&duration=${duration}`,
        method: 'get'
    })
}

/**
 * Fetches the HR handbook for a specific organization and location.
 * @param {Object} props - Includes entity, organizationId, and locationId.
 * @returns {Promise} - API response with the HR handbook.
 */
export const getHrHandbook = (props) => {
    const { entity, organizationId, locationId } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/handbook?locationId=${locationId}`,
        method: 'get'
    })
}

/**
 * Fetches the details of a new subscriber for a specific organization and subscription ID.
 * @param {Object} props - Includes entity, organizationId, and subscriptionId.
 * @returns {Promise} - API response with the subscriber details.
 */
export const getNewSubscriber = (props) => {
    const { organizationId, subscriptionId } = props
    return request({
        url: `${API_BASE_URL}subscriptions/one?organizationId=${organizationId}&subscriptionId=${subscriptionId}`,
        method: 'get'
    })
}

/**
 * Creates a new order with the provided body data.
 * @param {Object} props - Includes body (order data).
 * @returns {Promise} - API response indicating the result of the create order operation.
 */
export const createOrder = (props) => {
    const { body } = props
    return request({
        url: `${API_BASE_URL}orders/createOrder`,
        method: 'post',
        body: JSON.stringify(body)
    })
}

/**
 * Verifies payment for a specific order and organization.
 * @param {Object} props - Includes body (payment data), organizationId, and id (order ID).
 * @returns {Promise} - API response indicating the result of the payment verification.
 */
export const verifyPayment = (props) => {
    const { body, id } = props
    return request({
        url: `${API_BASE_URL}orders/validatePayment?id=${id}`,
        method: 'put',
        body: JSON.stringify(body)
    })
}

/**
 * Fetches unmasked sensitive information (account, PF, UAN, ESI, PAN) for an employee.
 * @param {Object} props - Includes entity, organizationId, employeeId, and sensitive number flags (accNumber, pfNumber, etc.).
 * @returns {Promise} - API response with unmasked sensitive information.
 */
export const getUnMaskString = (props) => {
    const { entity, organizationId, masked } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/unmask?maskedValue=${masked}`,
        method: 'get'
    })
}

/**
 * Updates the account number for a specific employee in an organization.
 * @param {Object} props - Includes entity, organizationId, id (employee ID), and accountNumber.
 * @returns {Promise} - API response indicating the result of the update operation.
 */
export const updateAccountNumber = (props) => {
    const { entity, organizationId, id, accountNumber } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/updateAccountNumber/${id}?accountNumber=${accountNumber}`,
        method: 'PATCH',
        props: props,
        operationType: 'update'
    })
}

/**
 * Updates the PF number for a specific employee in an organization.
 * @param {Object} props - Includes entity, organizationId, id (employee ID), and pfNumber.
 * @returns {Promise} - API response indicating the result of the update operation.
 */
export const updatePfNumber = (props) => {
    const { entity, organizationId, id, pfNumber } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/updatePfNumber/${id}?pfNumber=${pfNumber}`,
        method: 'PATCH',
        props: props,
        operationType: 'update'
    })
}

/**
 * Updates the PAN number for a specific employee in an organization.
 * @param {Object} props - Includes entity, organizationId, id (employee ID), and panNumber.
 * @returns {Promise} - API response indicating the result of the update operation.
 */
export const updatePanNumber = (props) => {
    const { entity, organizationId, id, panNumber } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/updatePanNumber/${id}?panNumber=${panNumber}`,
        method: 'PATCH',
        props: props,
        operationType: 'update'
    })
}

/**
 * Updates the UAN number for a specific employee in an organization.
 * @param {Object} props - Includes entity, organizationId, id (employee ID), and uanNumber.
 * @returns {Promise} - API response indicating the result of the update operation.
 */
export const updateUanNumber = (props) => {
    const { entity, organizationId, id, uanNumber } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/updateUanNumber/${id}?uanNumber=${uanNumber}`,
        method: 'PATCH',
        props: props,
        operationType: 'update'
    })
}

/**
 * Updates the ESI number for a specific employee in an organization.
 * @param {Object} props - Includes entity, organizationId, id (employee ID), and esiNumber.
 * @returns {Promise} - API response indicating the result of the update operation.
 */
export const updateEsiNumber = (props) => {
    const { entity, organizationId, id, esiNumber } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/updateEsiNumber/${id}?esiNumber=${esiNumber}`,
        method: 'PATCH',
        props: props,
        operationType: 'update'
    })
}

/**
 * Fetches the subscription upgrade information for a specific subscription in an organization.
 * @param {Object} props - Includes entity, organizationId, and subscriptionId.
 * @returns {Promise} - API response with subscription upgrade details.
 */
export const subscriptionInfo = (props) => {
    const { entity, organizationId, subscriptionId } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/upgradeInfo?subscriptionId=${subscriptionId}`,
        method: 'get'
    })
}

/**
 * Fetches the subscription upgrade information for a specific subscription in an organization.
 * @param {Object} props - Includes entity, organizationId, and subscriptionId.
 * @returns {Promise} - API response with subscription upgrade details.
 */
export const subscriptionInfoFromAppowner = (props) => {
    const { entity, subscriptionId } = props
    return request({
        url: `${API_BASE_URL}${entity}/upgradeInfoById?subscriptionId=${subscriptionId}`,
        method: 'get'
    })
}

/**
 * Upgrades the package for a specific entity and organization based on the provided body data.
 * @param {Object} props - Includes entity, organizationId, and body (upgrade details).
 * @returns {Promise} - API response indicating the result of the upgrade operation.
 */
export const packageUpgrade = (props) => {
    const { entity, organizationId, body } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/upgrade`,
        method: 'post',
        body: JSON.stringify(body)
    })
}

/**
 * Fetches all records by organization ID.
 * @param {Object} props - Includes entity and organizationId.
 * @returns {Promise} - API response.
 */
export const getAllByDelegateManager = (props) => {
    const { entity, organizationId, id } = props
    return request({
        url: `${API_BASE_URL}${entity}/${organizationId}/all?primaryManagerId=${id}`,
        method: 'get'
    })
}

export const triggerId = ({ id }) => {
    return request({
        url: `${API_BASE_URL}notifications/trigger/${id}`,
        method: "put",
        data: { readStatus: true }, // Send `readStatus` as part of the update
    });
};
export const sessionExtend = () => {
    return request({
        url: `${API_BASE_URL}identity/extend`,
        method: 'post'
    })
}

export const sessionStatus = () => {
    return request({
        url: `${API_BASE_URL}identity/status`,
        method: 'get'
    })
}

export const click = () => {
    return request({
        url: `${API_BASE_URL}notifications/click?click=true`, // Adding click=true as a query parameter
        method: "put",
    });
};
export const chatbtserv = (props) => {
    const { body } = props
    return request({
        url: `${API_BASE_URL}chatbot/search`,
        body: JSON.stringify(body),
        method: 'post'
    })
};

export const getAllTemplates = (props) => {
    const { entity} = props
    return fetch( `${API_BASE_URL}${entity}/template`,{
        method: 'get'
    })
}

 export const uploadTemplate = (props) => {
    const { entity, body } = props
    return requestUpload({
        url: `${API_BASE_URL}${entity}/import`,
        method: 'post',
        body: body
    })
};