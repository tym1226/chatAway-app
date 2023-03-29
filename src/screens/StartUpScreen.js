import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useDispatch } from "react-redux";

import colors from "../constants/colors";
import commonStyle from "../constants/commonStyle";
import { authenticate, setDidTryAutoLogin } from "../store/authSlice";
import { getUserData } from "../utils/actions/userActions";

const StartUpScreen = (props) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const tryLogin = async () => {
      const storedAuthInfo = await AsyncStorage.getItem("userData");

      if (!storedAuthInfo) {
        dispatch(setDidTryAutoLogin());
        return;
      }

      const parsedData = JSON.parse(storedAuthInfo);
      const { token, userId, expiryDate: expiryDateString } = parsedData;
      const expiryDate = new Date(expiryDateString);

      // unusable storage info handling
      if (expiryDate <= new Date() || !token || !userId) {
        dispatch(setDidTryAutoLogin());
        return;
      }

      // found userdata in storage
      const userData = await getUserData(userId);
      dispatch(authenticate({ token, userData }));
    };

    tryLogin();
  }, [dispatch]);

  return (
    <View style={commonStyle.center}>
      <ActivityIndicator size="large" color={colors.primaryColor} />
    </View>
  );
};

export default StartUpScreen;
