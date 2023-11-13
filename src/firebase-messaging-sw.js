importScripts("https://www.gstatic.com/firebasejs/10.4.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.4.0/firebase-messaging-compat.js");
firebase.initializeApp ({
  apiKey: "AIzaSyCr8qfAN_0Q9vmoVE86OhtgrNyZ2K33d3U",
  authDomain: "chat-7ab9c.firebaseapp.com",
  projectId: "chat-7ab9c",
  storageBucket: "chat-7ab9c.appspot.com",
  messagingSenderId: "604627397530",
  appId: "1:604627397530:web:afa64ed09e36dbd368a823",
  measurementId: "G-DSCMXWQHKC"
})
// const app = initializeApp(firebase);
// console.log(app)
const messaging = firebase.messaging();
console.log(messaging)

messaging.onBackgroundMessage(function(payload) {
  console.log('[src/firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = 'Background Message Title';
  const notificationOptions = {
    body: 'Background Message body.',
    icon: '/firebase-logo.png'
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);

  // self.addEventListener('push', function(event) {
  //     const push = event.data.json();
  //     const title = push.data.title;
  //     console.log(push.data)
  //     const options = JSON.parse(push.data.options);
  //     event.waitUntil(registration.showNotification(title, options));
  // });
});
