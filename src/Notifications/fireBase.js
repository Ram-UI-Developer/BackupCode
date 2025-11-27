import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { sendTokenToServer } from '../Common/Services/OtherServices';
import { getFirebaseConfig } from './firebaseConfig';

const ENVI = JSON.parse(localStorage.getItem('url')).ENV // base url


const firebaseConfig = getFirebaseConfig();

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
const messaging = getMessaging(app);

const key = ENVI === 'DEV' || ENVI === 'QA' ? 'BKIEbNSFpSFUhzVfaxQlX3JkLXm0ibUZM35LON6FquHO_GwvmQnEKiYxBAM6Q7TTc0iGL7hnAVM7uNZj1thXMx8' :'BIlfOwTw8KCWAIBoNI6CMFEv6cWY19dEKbhd1eC9Hpjr1i6tTPItlaHYRjg8L2OeT0BfrLyNfHCNa3nhTtYlBP4';

// Helper to send token to backend
const NotificationToken = (token, userDetails) => {
    // console.log('Sending token to server:', token);
    console.log(userDetails, "User details for token");
  if (!userDetails || !userDetails.employeeId) {
    // console.error('User details missing, cannot send token');
    return;
  }
  sendTokenToServer({
    body: {
      expoToken: token,
      userId: userDetails.employeeId,
      projectId: "workshine-web"
    }
  })
    .then(() => {})
    .catch(error => {
      console.error('Error sending token:', error);
    });
};

// Generate FCM token and send to backend
export const generateToken = async (userDetails) => {
  try {
    const permission = await Notification.requestPermission();
    console.log(permission, "Notification permission status");
    if (permission !== 'granted') {
      console.error('Permission not granted for notifications');
      return;
    }
    console.log(key, "VAPID Key being used");
    const messagingToken = await getToken(messaging, {
      vapidKey: key
    });
    console.log(messagingToken, "Messaging token generated successfully");
    if (messagingToken) {
      NotificationToken(messagingToken,userDetails);
      // console.log('Messaging token generated successfully:', messagingToken);
    } else {
      // console.log('No registration token available. Request permission to generate one.');
    }
  } catch (err) {
    console.error('An error occurred while retrieving token.', err);
  }
};

// Export messaging and helpers
export { messaging, getToken, onMessage };