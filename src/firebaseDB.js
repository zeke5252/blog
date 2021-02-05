import { firebase } from '@firebase/app';
import 'firebase/firestore';


var firebaseConfig = {
    apiKey: "AIzaSyAzBjzFTsHGabhWIG77vhRgjNedt8w_jyA",
    authDomain: "zekeblog-e6bd3.firebaseapp.com",
    projectId: "zekeblog-e6bd3",
    storageBucket: "zekeblog-e6bd3.appspot.com",
    messagingSenderId: "56604354605",
    appId: "1:56604354605:web:641908a588bf35fa9830a4",
    measurementId: "G-S9ZT66TDN0"
  };

const firebaseApp = firebase.initializeApp(firebaseConfig);
export const db = firebaseApp.firestore();