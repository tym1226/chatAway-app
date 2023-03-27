import React, { Fragment } from "react";
import { Feather, FontAwesome5 } from "@expo/vector-icons";

import Input from "./Input";
import SubmitButton from "./SubmitButton";

const SignInForm = (props) => {
  return (
    <Fragment>
      <Input label="Email" icon="mail" iconSize={20} iconPackage={Feather} />
      <Input label="Password" icon="lock" iconSize={20} iconPackage={Feather} />
      <SubmitButton
        disabled={false}
        title="SIGN IN"
        onPress={() => console.log("button pressed")}
        style={{ marginTop: 20 }}
      />
    </Fragment>
  );
};

export default SignInForm;
