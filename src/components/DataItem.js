import React from "react";
import { StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import colors from "../constants/colors";
import ProfileImage from "./ProfileImage";
import { Feather, Ionicons, AntDesign } from "@expo/vector-icons";

const imageSize = 40;

const DataItem = (props) => {
  const { title, subTitle, image, type, isChecked, icon } = props;

  const hideImage = props.hideImage && props.hideImage === true;

  return (
    <TouchableWithoutFeedback onPress={props.onPress}>
      <View style={styles.container}>
        {!icon && !hideImage && <ProfileImage uri={image} size={imageSize} />}

        {icon && (
          <View style={styles.leftIconContainer}>
            <AntDesign name={icon} size={26} color={colors.blue} />
          </View>
        )}
        <View style={styles.textContainer}>
          <Text
            style={{
              ...styles.title,
              ...{ color: type === "button" ? colors.blue : colors.textColor },
            }}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subTitle && (
            <Text style={styles.subTitle} numberOfLines={1}>
              {subTitle}
            </Text>
          )}
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
  leftIconContainer: {
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    width: imageSize,
    height: imageSize,
  },
});

export default DataItem;
