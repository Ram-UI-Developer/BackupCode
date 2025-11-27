import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { click, triggerId } from '../../Common/Services/OtherServices';

const NotificationPopup = ({ show, onClose, notificationData, count }) => {
    const popupRef = useRef(null);
    console.log(notificationData, "Notification data in popup");
    console.log(count, "Notification count in popup");
    const parsedData = notificationData.map(item => JSON.parse(item));
    console.log(parsedData, "Parsed notification data");
    const navigate = useNavigate()
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                onClose();
            }
        };
        if (show) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [show, onClose]);

    if (!show) {
        return null;
    }

const clickTrigger = async () => {
    try {
        const response = await click(); // click() must return a Promise
        if (response.status === 200) {
            console.log("Notification click recorded successfully");
            console.log(response, "Response from click trigger");
            // count =response.count // Update the state
        }
    } catch (error) {
        console.error("Error recording notification click:", error);
    }
};
                


    const handlePageRedirection = (e,notification) => {
        onClose();  
        clickTrigger(); // Call the click trigger function      
        let id = notification.dto.id;
        console.log(id, "Notification ID for redirection");
        console.log(e.target, "Clicked element in notification");
        console.log(notification, "Notification data for redirection");
        e.preventDefault();
        console.log(notification.msgIds.objectType, "Notification data in redirection");
        if(notification.msgIds.objectType === "LeaveDTO") {
            console.log("Redirecting to Leave Details");
            if(notification.dto.status === "Submitted") {
            navigate('/AuthorizeLeaveDetails', { state:  id  })
             triggerSeen(notification);
            }else{
                navigate('/leave', { state: { id}  })
                 triggerSeen(notification);
            }
        }else if(notification.msgIds.objectType === "TimesheetDTO") {
            const row = notification.dto;
            console.log(row, "Timesheet DTO for redirection");
            console.log("Redirecting to Timesheet Details");
            if(notification.dto.status === "Submitted") {
                navigate('/reviewTimeSheet', { state: { row }  })
                triggerSeen(notification);
            }else{
                navigate('/newTimeSheet', { state:  { row }  })
                 triggerSeen(notification);
            }
        }else if(notification.msgIds.objectType === "ExpenseSheetDTO") {
            console.log("Redirecting to Expense Details");
            if(notification.dto.status === "Submitted") {
                navigate('/AuthorizeExpense', { state: { id}  })
                 triggerSeen(notification);
            }else{
                navigate('/expenseAdd', { state: { id}  })
                 triggerSeen(notification);
            }
        }
    }

    const triggerSeen = (notification) => {
        triggerId({ id: notification.dto.id }).then((response) => {
            console.log(response, "Notification marked as seen");
        }).catch((error) => {
            console.error("Error marking notification as seen:", error);
        });
    }

    return (
        <>
            <div ref={popupRef} className="card shadow-lg bg-white position-absolute end-0 mt-2" style={{ width: '380px', maxHeight: '24rem', overflowY: 'auto', zIndex: 5000 }}>
                <div className="notification-arrow"></div>
                <div className="card-header border-bottom-0">
                    <p className="fw-semibold text-dark mb-0">You have <span className="fw-bold">{count}</span> new notifications</p>
                </div>
                <ul className="list-group list-group-flush">
                    {notificationData.length > 0 ? (
                        parsedData.map((notification, index) => (
                            <li key={index} className="list-group-item list-group-item-action d-flex align-items-start" style={{backgroundColor: notification.msgIds.readStatus ? "#9db9ecff" : "#07196bff",marginBottom: "0rem"}}>
                                <div className="flex-shrink-0">
                                    <i className={`fa-solid ${notification.msgIds.objectType === 'TimesheetDTO' ? 'fa-calendar-days' : 'fa-user-circle'} text-primary`}></i>
                                </div>
                                <div className="flex-grow-1" >
                                    <p className="fw-normal text-dark small mb-0">
                                        <span className="fw-bold" style={{"color":notification.msgIds.readStatus ? "#07196bff" : "#eaedf1ff" ,"marginLeft":"10px"}}  onClick={(e) => handlePageRedirection(e, notification)} >{notification.body}</span> {notification.message}
                                    </p>
                                    {/* <p className="text-muted small mt-1 mb-0">
                                        <span className="fw-semibold">{notification.date}</span> | {notification.details}
                                    </p> */}
                                </div>
                                {/* {notification.msgIds.readStatus && (
                                    <div className="flex-shrink-0 align-self-center">
                                        <span className="text-success fw-semibold small">Seen</span>
                                    </div>
                                )} */}
                            </li>
                        ))
                    ) : (
                        <li className="list-group-item text-center text-muted">
                            No new notifications.
                        </li>
                    )}
                </ul>
            </div>
            {/* <div 
            ref={popupRef} 
            className="card shadow-lg position-absolute top-100 end-0 mt-2 me-2 overflow-auto"
            style={{ maxHeight: '24rem', width: '20rem', zIndex: 1050 }}
        >
            <div className="notification-arrow"></div>

            <div className="card-header border-0">
                <p className="fw-semibold text-dark mb-0">
                    You have <span className="fw-bold">{count}</span> new notifications
                </p>
            </div>

            <ul className="list-group list-group-flush">
                {notificationData.length > 0 ? (
                    notificationData.map((notification, index) => (
                        <li 
                            key={index} 
                            className="list-group-item list-group-item-action d-flex align-items-start gap-3"
                        >
                            <div className="flex-shrink-0">
                                <i className={`fa-solid ${notification.type === 'timesheet' ? 'fa-calendar-days' : 'fa-user-circle'} text-primary`}></i>
                            </div>
                            <div className="flex-grow-1">
                                <p className="fw-normal text-dark small mb-0">
                                    <span className="fw-bold">{notification.user}</span> {notification.message}
                                </p>
                                <p className="text-muted small mt-1 mb-0">
                                    <span className="fw-semibold">{notification.date}</span> | {notification.details}
                                </p>
                            </div>
                            {notification.status === 'Seen' && (
                                <div className="flex-shrink-0 align-self-center">
                                    <span className="text-success fw-semibold small">Seen</span>
                                </div>
                            )}
                        </li>
                    ))
                ) : (
                    <li className="list-group-item text-center text-muted">
                        No new notifications.
                    </li>
                )}
            </ul>
        </div> */}
        </>
    );
};

export default NotificationPopup;