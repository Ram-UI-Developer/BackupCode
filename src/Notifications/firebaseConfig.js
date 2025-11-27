const ENVI = JSON.parse(localStorage.getItem('url')).ENV // base url


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

export const getFirebaseConfig = () => {
  let env;

  if (ENVI === 'DEV') {
    env = 'production';
  } else if (ENVI === 'QA') {
    env = 'production'; // Or whatever you call the UAT config
  } else {
    env = 'development'; // Default to production
  }

  return firebaseConfigs[env];
};

