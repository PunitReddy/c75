import * as firebase from 'firebase';
require('@firebase/firestore')

var firebaseConfig = {
    apiKey: "AIzaSyC-tmsYJXgioW4BBupMHogoUDmCpn0Ji5E",
    authDomain: "wily-57e73.firebaseapp.com",
    projectId: "wily-57e73",
    databaseURL:"https://wily-57e73.firebaseio.com",
    storageBucket: "wily-57e73.appspot.com",
    messagingSenderId: "171833213458",
    appId: "1:171833213458:web:d8c6ad8a0d288584438ecb"
  };
  
  let firebaseApp ; if (!firebase.apps.length) { firebaseApp = firebase.initializeApp(firebaseConfig); } 
  else { firebaseApp = firebase.app(); // if already initialized, use that one 
  } export const auth = app.auth(); export default app;