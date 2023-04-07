import { child, get, getDatabase, off, onValue, ref } from "firebase/database";
import React from "react";
import { useState, useEffect } from "react";
import { ActivityIndicator, View, KeyboardAvoidingView } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import colors from "../constants/colors";
import commonStyle from "../constants/commonStyle";
import { setChatsData } from "../store/chatSlice";
import { setChatMessages, setFavoriteMessages } from "../store/messagesSlice";
import { setStoredUsers } from "../store/userSlice";
import { getFirebaseApp } from "../utils/firebaseHelper";

import StackNavigator from "./StackNavigator";

const MainNavigator = (props) => {
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(true);

  const userData = useSelector((state) => state.auth.userData);
  const storedUsers = useSelector((state) => state.users.storedUsers);

  useEffect(() => {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const userChatsRef = child(dbRef, `userChats/${userData.userId}`);
    const refs = [userChatsRef];

    onValue(userChatsRef, (querySnapshot) => {
      const chatIdsData = querySnapshot.val() || {};
      const chatIds = Object.values(chatIdsData);

      const chatsData = {};
      let chatsFoundCount = 0;

      for (let i = 0; i < chatIds.length; i++) {
        const chatId = chatIds[i];
        const chatRef = child(dbRef, `chats/${chatId}`);
        refs.push(chatRef);

        onValue(chatRef, (chatSnapshot) => {
          chatsFoundCount++;

          const data = chatSnapshot.val();

          if (data) {
            // remove a chat if a user was removed or left
            if (!data.users.includes(userData.userId)) {
              return;
            }

            data.key = chatSnapshot.key;
            data.users.forEach((userId) => {
              if (storedUsers[userId]) return;

              const userRef = child(dbRef, `users/${userId}`);

              get(userRef).then((userSnapshot) => {
                const userSnapshotData = userSnapshot.val();
                dispatch(setStoredUsers({ newUsers: { userSnapshotData } }));
              });
              refs.push(userRef);
            });

            chatsData[chatSnapshot.key] = data;
          }

          if (chatsFoundCount >= chatIds.length) {
            dispatch(setChatsData({ chatsData }));
            setIsLoading(false);
          }
        });

        // retrieve messages
        const messagesRef = child(dbRef, `messages/${chatId}`);
        refs.push(messagesRef);

        onValue(messagesRef, (messagesSnapshot) => {
          const messagesData = messagesSnapshot.val();
          dispatch(setChatMessages({ chatId, messagesData }));
        });

        if (chatsFoundCount === 0) {
          setIsLoading(false);
        }
      }
    });

    const userFavoriteMessagesRef = child(
      dbRef,
      `userFavoriteMessages/${userData.userId}`
    );
    refs.push(userFavoriteMessagesRef);
    onValue(userFavoriteMessagesRef, (querySnapshot) => {
      const favoriteMessages = querySnapshot.val() ?? {};
      dispatch(setFavoriteMessages({ favoriteMessages }));
    });

    return () => {
      // unsubsribe to firebase listeners
      refs.forEach((ref) => off(ref));
    };
  }, []);

  if (isLoading) {
    <View>
      <ActivityIndicator
        size={"large"}
        color={colors.primaryColor}
        style={commonStyle.center}
      />
    </View>;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StackNavigator />
    </KeyboardAvoidingView>
  );
};

export default MainNavigator;
