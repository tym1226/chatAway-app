import { child, get, getDatabase, off, onValue, ref } from "firebase/database";
import React, { useRef, useState, useEffect } from "react";
import { ActivityIndicator, View, KeyboardAvoidingView } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import colors from "../constants/colors";
import commonStyle from "../constants/commonStyle";
import { setChatsData } from "../store/chatSlice";
import { setChatMessages, setFavoriteMessages } from "../store/messagesSlice";
import { setStoredUsers } from "../store/userSlice";
import { getFirebaseApp } from "../utils/firebaseHelper";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

import StackNavigator from "./StackNavigator";
import { StackActions, useNavigation } from "@react-navigation/native";

const MainNavigator = (props) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(true);

  const userData = useSelector((state) => state.auth.userData);
  const storedUsers = useSelector((state) => state.users.storedUsers);

  // the push token is different by user by device
  const [expoPushToken, setExpoPushToken] = useState("");
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        // handle received notification, do nothing for now
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const { data } = response.notification.request.content;
        const chatId = data["chatId"];

        if (chatId) {
          const pushAction = StackActions.push("ChatScreen", { chatId });
          navigation.dispatch(pushAction);
        } else {
          console.log("no chatId sent with notification");
        }
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

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

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  } else {
    console.log("Must use physical device for Push Notifications");
  }

  return token;
}
