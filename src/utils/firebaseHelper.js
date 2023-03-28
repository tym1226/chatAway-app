// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

export const getFirebaseApp = () => {
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyCFnYxn-PrX91ojbutFZszTzxzAz5EGSqo",
    authDomain: "chataway-375f3.firebaseapp.com",
    projectId: "chataway-375f3",
    storageBucket: "chataway-375f3.appspot.com",
    messagingSenderId: "425193484987",
    appId: "1:425193484987:web:be39d6afdfaf3c7b9d2f9e",
    measurementId: "G-HBVY531VW9",
  };

  // Initialize Firebase
  return initializeApp(firebaseConfig);
};
