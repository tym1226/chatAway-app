import React from "react";
import { StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import colors from "../constants/colors";
import ProfileImage from "./ProfileImage";
import { Feather, Ionicons } from "@expo/vector-icons";

const DataItem = (props) => {
  const { title, subTitle, image, type, isChecked } = props;
  return (
    <TouchableWithoutFeedback onPress={props.onPress}>
      <View style={styles.container}>
        <ProfileImage uri={image} size={40} />

        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.subTitle} numberOfLines={1}>
            {subTitle}
          </Text>
        </View>
        {type === "checkbox" && (
          <View
            style={{
              ...styles.iconContainer,
              ...(isChecked && styles.checkedStyle),
            }}
          >
            <Feather name="check" size={18} color="white" />
          </View>
        )}

        {type === "link" && (
          <View>
            <Ionicons
              name="chevron-forward-outline"
              size={22}
              color={colors.gray}
            />
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingVertical: 7,
    borderBottomColor: colors.extraLightGray,
    borderBottomWidth: 1,
    alignItems: "center",
    minHeight: 50,
  },
  textContainer: {
    marginLeft: 14,
    flex: 1,
  },
  title: {
    fontFamily: "medium",
    fontSize: 16,
    letterSpacing: 0.3,
  },
  subTitle: {
    fontFamily: "regular",
    fontSize: 16,
    color: colors.gray,
    letterSpacing: 0.3,
  },
  iconContainer: {
    backgroundColor: "white",
    borderWidth: 1,
    borderRadius: 15,
    borderColor: colors.lightGray,
  },
  checkedStyle: {
    backgroundColor: colors.primaryColor,
    borderColor: "transparent",
  },
});

export default DataItem;
