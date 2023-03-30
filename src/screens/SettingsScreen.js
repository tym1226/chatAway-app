import {
  Feather,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import React, { useReducer, useCallback, useState } from "react";
import { StyleSheet, ActivityIndicator, View, Text } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Input from "../components/Input";
import PageContainer from "../components/PageContainer";
import PageTitle from "../components/PageTitle";
import { validateInput } from "../utils/actions/formActions";
import { reducer } from "../utils/reducers/formReducer";
import SubmitButton from "../components/SubmitButton";
import colors from "../constants/colors";
import {
  updateSignedInUserData,
  userLogout,
} from "../utils/actions/authActions";
import { updateLoggedInUserData } from "../store/authSlice";
import ProfileImage from "../components/ProfileImage";
import { ScrollView } from "react-native";

const SettingsScreen = (props) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMsg, setShowSuccessMsg] = useState(false);
  const userData = useSelector((state) => state.auth.userData);

  const firstName = userData.firstName || "";
  const lastName = userData.lastName || "";
  const email = userData.email || "";
  const about = userData.about || "";

  const initialState = {
    inputValidities: {
      firstName: undefined,
      lastName: undefined,
      email: undefined,
      about: undefined,
    },
    inputValues: {
      firstName,
      lastName,
      email,
      about,
    },
    formIsValid: false,
  };

  const [formState, dispatchFormState] = useReducer(reducer, initialState);

  const inputChangedHandler = useCallback(
    (inputId, inputValue) => {
      const result = validateInput(inputId, inputValue);
      dispatchFormState({ inputId, validationResult: result, inputValue });
    },
    [dispatchFormState]
  );

  const saveHandler = useCallback(async () => {
    const updatedValues = formState.inputValues;
    try {
      setIsLoading(true);
      await updateSignedInUserData(userData.userId, updatedValues);
      dispatch(updateLoggedInUserData({ newData: updatedValues }));

      setShowSuccessMsg(true);

      setTimeout(() => {
        setShowSuccessMsg(false);
      }, 3000);
    } catch (err) {
      console.error();
    } finally {
      setIsLoading(false);
    }
  }, [formState, dispatch]);

  const hasChanges = () => {
    const currentValues = formState.inputValues;
    return (
      currentValues.firstName != firstName ||
      currentValues.lastName != lastName ||
      currentValues.email != email ||
      currentValues.about != about
    );
  };

  return (
    <PageContainer>
      <PageTitle text="Settings" />
      <ScrollView contentContainerStyle={styles.formContainer}>
        <ProfileImage
          size={100}
          userId={userData.userId}
          uri={userData.profilePicture}
        />

        <Input
          id="firstName"
          label="First Name"
          icon="user"
          iconSize={20}
          iconPackage={FontAwesome5}
          onInputChanged={inputChangedHandler}
          autoCapitalize="none"
          errorText={formState.inputValidities["firstName"]}
          initialValue={userData.firstName}
        />
        <Input
          id="lastName"
          label="Last Name"
          icon="user"
          iconSize={20}
          iconPackage={FontAwesome5}
          onInputChanged={inputChangedHandler}
          autoCapitalize="none"
          errorText={formState.inputValidities["lastName"]}
          initialValue={userData.lastName}
        />
        <Input
          id="email"
          label="Email"
          icon="mail"
          iconSize={20}
          iconPackage={Feather}
          onInputChanged={inputChangedHandler}
          keyboardType="email-address"
          autoCapitalize="none"
          errorText={formState.inputValidities["email"]}
          initialValue={userData.email}
        />
        <Input
          id="about"
          label="About yourself"
          icon="table-of-contents"
          iconSize={20}
          autoCapitalize="none"
          iconPackage={MaterialCommunityIcons}
          onInputChanged={inputChangedHandler}
          errorText={formState.inputValidities["about"]}
          initialValue={userData.about}
        />
        <View style={{ marginTop: 20 }}>
          {showSuccessMsg && (
            <Text
              style={{
                color: colors.red,
              }}
            >
              Updates saved!
            </Text>
          )}
          {isLoading ? (
            <ActivityIndicator
              size={"small"}
              color={colors.primaryColor}
              style={{ marginTop: 10 }}
            />
          ) : (
            hasChanges() && (
              <SubmitButton
                title="SAVE"
                onPress={saveHandler}
                style={{ marginTop: 20 }}
                disabled={!formState.formIsValid}
              />
            )
          )}
        </View>
        <SubmitButton
          title="LOG OUT"
          onPress={() => dispatch(userLogout())}
          style={{ marginTop: 20 }}
          color={colors.red}
        />
      </ScrollView>
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    alignItems: "center",
  },
});

export default SettingsScreen;
