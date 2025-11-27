// // Give the service worker access to Firebase Messaging.
// // Note that you can only use Firebase Messaging here. Other Firebase libraries
// // are not available in the service worker.


// // Replace 10.13.2 with latest version of the Firebase JS SDK.
// importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
// importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

// // Initialize the Firebase app in the service worker by passing in
// // your app's Firebase config object.
// // https://firebase.google.com/docs/web/setup#config-object

// const firebaseConfig = getFirebaseConfig();

// firebase.initializeApp({
//   firebaseConfig
// });

// // Retrieve an instance of Firebase Messaging so that it can handle background
// // messages.
// const messaging = firebase.messaging();
// console.log(messaging, "Firebase Messaging initialized in service worker");
// // console.log(messaging, "Firebase Messaging initialized in service worker");
// messaging.onBackgroundMessage((payload) => {
//   // console.log(
//   //   '[firebase-messaging-sw.js] Received background message ',
//   //   payload
//   // );
//   // Customize notification here
//   const notificationTitle = payload.notification.title;
//   const notificationOptions = {
//     body: payload.notification.body,
//     icon: '/firebase-logo.png'
//   };

//   self.registration.showNotification(notificationTitle, notificationOptions);
// });

importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

let firebaseConfig = null;

const firebaseConfigs = {
  development: {
    apiKey: "AIzaSyBIBMyoNlFOOvvxYKyAD4nan-H_LALZVQQ",
    authDomain: "workshine-web-uat.firebaseapp.com",
    projectId: "workshine-web-uat",
    storageBucket: "workshine-web-uat.firebasestorage.app",
    messagingSenderId: "1022334996988",
    appId: "1:1022334996988:web:2faf87a684b7b98e1ea279",
    measurementId: "G-TDV2MKH7LD"
  },
  production: {
    apiKey: "AIzaSyAH3a7w9J7stck1v3gRA7j49Ge3f8lbY2Y",
    authDomain: "workshine-web.firebaseapp.com",
    projectId: "workshine-web",
    storageBucket: "workshine-web.firebasestorage.app",
    messagingSenderId: "683434098729",
    appId: "1:683434098729:web:4ab178afd6473102165c38",
    measurementId: "G-B261WPLCQM"
  }
};

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SET_ENV') {
    const ENVI = event.data.env;

    let envKey = 'development'; // default
    if (ENVI === 'DEV' || ENVI === 'QA') {
      envKey = 'development'; // UAT
    } else {
      envKey = 'production';
    }

    firebaseConfig = firebaseConfigs[envKey];

    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
      const notificationTitle = payload.notification.title;
      const notificationOptions = {
        body: payload.notification.body,
        icon: '/firebase-logo.png'
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });

    console.log('[SW] Firebase initialized with config for', envKey);
  }
});
