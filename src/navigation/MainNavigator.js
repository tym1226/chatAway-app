import { child, getDatabase, onValue, ref } from "firebase/database";
import React from "react";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { getFirebaseApp } from "../utils/firebaseHelper";

import StackNavigator from "./StackNavigator";

const MainNavigator = (props) => {
  const userData = useSelector((state) => state.auth.userData);
  const storedUsers = useSelector((state) => state.users.storedUsers);

  useEffect(() => {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const userChatRef = child(dbRef, `userChats/${userData.userId}`);

    onValue(userChatRef, (querySnapshot) => {
      const chatIdsData = querySnapshot.val() || {};
      const chatIds = Object.values(chatIdsData);
      console.log(chatIds);
    });
  }, []);

  return <StackNavigator />;
};

export default MainNavigator;
