importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js');

const firebaseConfig = {
	apiKey: "AIzaSyBCCIJ4d-WRO50m2XHlIckl-S1mYaOJ6IY",
    authDomain: "sakurata-wapi.firebaseapp.com",
    projectId: "sakurata-wapi",
    storageBucket: "sakurata-wapi.appspot.com",
    messagingSenderId: "405230396670",
    appId: "1:405230396670:web:cc076894a9ef79261ff1af",
    measurementId: "G-P5Y77G3E6S"
};

firebase.initializeApp(firebaseConfig);
firebase.messaging();