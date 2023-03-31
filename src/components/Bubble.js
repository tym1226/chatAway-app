import { StyleSheet, View, Text } from "react-native";
import React from "react";
import colors from "../constants/colors";

const Bubble = (props) => {
  const { text, type } = props;

  const bubbleStyle = { ...styles.container };
  const textStyle = { ...styles.text };

  switch (type) {
    case "system":
      textStyle.color = colors.darkGray;
      bubbleStyle.backgroundColor = colors.biege;
      bubbleStyle.alignItems = "center";
      bubbleStyle.marginTop = 10;
      break;

    default:
      break;
  }
  return (
    <View style={styles.wrapper}>
      <View style={bubbleStyle}>
        <Text style={textStyle}>{text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    justifyContent: "center",
  },
  text: {
    fontFamily: "regular",
    letterSpacing: 0.3,
  },
  container: {
    backgroundColor: "white",
    marginBottom: 10,
    borderColor: colors.whiteBackground,
    borderWidth: 1,
    borderRadius: 5,
  },
});

export default Bubble;
