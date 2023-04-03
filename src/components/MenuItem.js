import { StyleSheet, View, Text } from "react-native";
import React from "react";
import colors from "../constants/colors";
import { MenuOption } from "react-native-popup-menu";
import { FontAwesome5 } from "@expo/vector-icons";

const MenuItem = (props) => {
  const Icon = props.inconPack ?? FontAwesome5;
  return (
    <MenuOption onSelect={props.onSelect}>
      <View style={styles.menuItemContainer}>
        <Text style={styles.menuText}>{props.text}</Text>
        <Icon name={props.iconName} size={18} />
      </View>
    </MenuOption>
  );
};

const styles = StyleSheet.create({
  menuItemContainer: {
    borderRadius: 20,
    flexDirection: "row",
    padding: 4,
  },
  menuText: {
    flex: 1,
    fontFamily: "regular",
    letterSpacing: 0.3,
    fontSize: 16,
  },
});

export default MenuItem;
