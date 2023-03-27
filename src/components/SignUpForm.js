import React, { Fragment } from "react";
import { Feather, FontAwesome5 } from "@expo/vector-icons";

import Input from "./Input";
import SubmitButton from "./SubmitButton";

const SignUpForm = (props) => {
  return (
    <Fragment>
      <Input
        label="First Name"
        icon="user"
        iconSize={20}
        iconPackage={FontAwesome5}
        errorText="some error"
      />
      <Input
        label="Last Name"
        icon="user"
        iconSize={20}
        iconPackage={FontAwesome5}
      />
      <Input label="Email" icon="mail" iconSize={20} iconPackage={Feather} />
      <Input label="Password" icon="lock" iconSize={20} iconPackage={Feather} />
      <SubmitButton
        disabled={false}
        title="SIGN UP"
        onPress={() => console.log("button pressed")}
        style={{ marginTop: 20 }}
      />
    </Fragment>
  );
};

export default SignUpForm;
