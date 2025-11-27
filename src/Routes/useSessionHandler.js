import { useEffect, useRef } from 'react';
import { ACCESS_TOKEN } from '../Common/Utilities/Constants';
import {
    sessionExtend,
    sessionStatus
} from '../Common/Services/OtherServices';
import { logout } from '../Common/Services/CommonService';
import { useSelector } from 'react-redux';
import { NOTIFICATIONS, TITLE, USER_DETAILS } from '../reducers/constants';
import { useDispatch } from 'react-redux';

const useSessionHandler = ({
    warningThresholdMinutes = 60,
    checkIntervalMinutes = 60,
    sessionTimeoutMinutes = 60
}) => {
    const userDetails = useSelector((state) => state.user.userDetails)
    const lastActivityTime = useRef(Date.now());
    const warningShown = useRef(false);
    const activityTimeout = useRef(null);
    const checkInterval = useRef(null);
    const lastExtendTime = useRef(0);
    const extendCooldownMs = sessionTimeoutMinutes * 60 * 1000;
    const dispatch = useDispatch();

    const getToken = () => {
        return localStorage.getItem(ACCESS_TOKEN) || sessionStorage.getItem(ACCESS_TOKEN);
    };

    // Track user activity
    const handleActivity = () => {
        const now = Date.now();
        lastActivityTime.current = now;
        warningShown.current = false;

        // Only extend session if cooldown time passed
        if (now - lastExtendTime.current >= extendCooldownMs) {
            extendSession();
            lastExtendTime.current = now;
        }

        if (activityTimeout.current) clearTimeout(activityTimeout.current);
        activityTimeout.current = setTimeout(() => {
            console.log('User inactive.');
        }, 29 * 60 * 1000);
    };

    const setupActivityListeners = () => {
        const events = [
            'mousedown',
            'mousemove',
            'keypress',
            'scroll',
            'touchstart',
            'click'
        ];
        events.forEach(event => document.addEventListener(event, handleActivity, true));
        return () => events.forEach(event => document.removeEventListener(event, handleActivity, true));
    };

    const checkSessionStatus = async () => {
        if (getToken()) {
            sessionStatus()
                .then(res => {

                const message = (res.message || '').trim().toLowerCase();

                    if (res.status === 200) {
                        const data = res.data;
                        if (!data.active) {
                            handleSessionExpired();
                        } else if (data.remainingMinutes <= warningThresholdMinutes && !warningShown.current) {
                            showSessionWarning(data.remainingMinutes);
                        }
                    } else if (message === 'token expired' || message == 'session expired') {
                        handleSessionExpired();
                    }
                })
                .catch(err => {
                    console.error('Session check failed:', err);
                    const message = (err.message || '').trim().toLowerCase();
                    if (message === 'token expired' || message == 'session expired') {
                        handleSessionExpired();
                    }
                });
        }
    };

    const extendSession = async () => {
        if (!getToken()) return;
        sessionExtend()
            .then(res => {
                if (res.status === 200) {
                    console.log('Session extended successfully.');
                } else {
                    console.log(res);
                }
            })
            .catch(err => {
                const message = (err.message || '').trim().toLowerCase();
                if (message === 'token expired' || message == 'session expired') {
                    handleSessionExpired();
                } else
                    console.error('Error extending session:', err);

            });
    };

    const showSessionWarning = (remainingMinutes) => {
        warningShown.current = true;
        if (window.confirm(`Session expires in ${remainingMinutes} min. Stay logged in?`)) {
            extendSession();
            warningShown.current = false;
        } else {
            Logout();
        }
    };

    const Logout = async () => {
        logout({ id: userDetails.employeeId })
            .then(() => {
                clearToken();
                window.location.href = '/login';
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
            })
            .catch(err => {
                console.error('Logout failed:', err);
                clearToken();
                window.location.href = '/login';
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
            });
    };

    const handleSessionExpired = () => {
        console.log('Session expired. Logging out...');
        clearToken();
        window.alert('Session expired. Please login again.');
        window.location.href = '/login';
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
    };


    const clearToken = () => {
        localStorage.removeItem(ACCESS_TOKEN);
        sessionStorage.removeItem(ACCESS_TOKEN);
    };

    useEffect(() => {
        const removeListeners = setupActivityListeners();
        checkInterval.current = setInterval(checkSessionStatus, checkIntervalMinutes * 60 * 1000);

        return () => {
            removeListeners();
            if (checkInterval.current) clearInterval(checkInterval.current);
            if (activityTimeout.current) clearTimeout(activityTimeout.current);
        };
    }, []);
};

export default useSessionHandler;
