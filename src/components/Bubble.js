import { StyleSheet, View, Text } from "react-native";
import React from "react";

const Bubble = ({ props }) => {
  const { text } = props;
  return (
    <View style={styles.wrapper}>
      <View>
        <Text style={styles.text}>{text}</Text>
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
});

export default Bubble;
