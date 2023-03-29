import React, { useCallback, useEffect, useReducer, useState } from "react";
import { Feather, FontAwesome5 } from "@expo/vector-icons";

import Input from "./Input";
import SubmitButton from "./SubmitButton";
import { validateInput } from "../utils/actions/formActions";
import { reducer } from "../utils/reducers/formReducer";
import { signup } from "../utils/actions/authActions";
import { ActivityIndicator, Alert } from "react-native";
import colors from "../constants/colors";
import { useDispatch, useSelector } from "react-redux";

const initialState = {
  inputValidities: {
    firstName: false,
    lastName: false,
    email: false,
    password: false,
  },
  inputValues: {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  },
  formIsValid: false,
};

const SignUpForm = (props) => {
  const dispatch = useDispatch();

  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const [formState, dispatchFormState] = useReducer(reducer, initialState);

  const inputChangedHandler = useCallback(
    (inputId, inputValue) => {
      const result = validateInput(inputId, inputValue);
      dispatchFormState({ inputId, validationResult: result, inputValue });
    },
    [dispatchFormState]
  );

  useEffect(() => {
    if (error) {
      Alert.alert("An error occurred", error, [{ text: "Got it" }]);
    }
    setError(null);
  }, [error]);

  const authHandler = useCallback(async () => {
    try {
      setIsLoading(true);

      const action = signup(
        formState.inputValues.firstName,
        formState.inputValues.lastName,
        formState.inputValues.email,
        formState.inputValues.password
      );
      setError(null);
      await dispatch(action);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  }, [dispatch, formState]);

  return (
    <>
      <Input
        id="firstName"
        label="First Name"
        icon="user"
        iconSize={20}
        iconPackage={FontAwesome5}
        onInputChanged={inputChangedHandler}
        autoCapitalize="none"
        errorText={formState.inputValidities["firstName"]}
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
      />
      <Input
        id="password"
        label="Password"
        icon="lock"
        iconSize={20}
        autoCapitalize="none"
        secureTextEntry
        iconPackage={Feather}
        onInputChanged={inputChangedHandler}
        errorText={formState.inputValidities["password"]}
      />
      {isLoading ? (
        <ActivityIndicator
          size={"small"}
          color={colors.primaryColor}
          style={{ marginTop: 10 }}
        />
      ) : (
        <SubmitButton
          title="SIGN UP"
          onPress={authHandler}
          style={{ marginTop: 20 }}
          disabled={!formState.formIsValid}
        />
      )}
    </>
  );
};

export default SignUpForm;
