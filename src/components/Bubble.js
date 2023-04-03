import { StyleSheet, View, Text, TouchableWithoutFeedback } from "react-native";
import React, { useRef } from "react";
import colors from "../constants/colors";
import {
  Menu,
  MenuTrigger,
  MenuOption,
  MenuOptions,
} from "react-native-popup-menu";
import uuid from "react-native-uuid";
import * as ClipBoard from "expo-clipboard";
import MenuItem from "./MenuItem";
import { favoriteMessage } from "../utils/actions/chatActions";

const Bubble = (props) => {
  const { text, type, messageId, chatId, userId } = props;

  const bubbleStyle = { ...styles.container };
  const textStyle = { ...styles.text };
  const wrapperStyle = { ...styles.wrapper };

  const menuRef = useRef(null);
  // useRef so the menuId only generates one time instead of everytime it renders
  const menuId = useRef(uuid.v4());
  let Container = View;

  switch (type) {
    case "system":
      textStyle.color = colors.darkGray;
      bubbleStyle.backgroundColor = colors.biege;
      bubbleStyle.alignItems = "center";
      bubbleStyle.marginTop = 10;
      bubbleStyle.padding = 4;
      break;
    case "error":
      textStyle.color = "white";
      bubbleStyle.backgroundColor = colors.red;
      bubbleStyle.alignItems = "center";
      bubbleStyle.marginTop = 10;
      bubbleStyle.padding = 4;
      break;
    case "myMessage":
      wrapperStyle.justifyContent = "flex-end";
      bubbleStyle.backgroundColor = colors.bubbleGreen;
      bubbleStyle.maxWidth = "90%";
      bubbleStyle.padding = 4;
      Container = TouchableWithoutFeedback;
      break;
    case "theirMessage":
      wrapperStyle.justifyContent = "flex-start";
      bubbleStyle.backgroundColor = "white";
      bubbleStyle.maxWidth = "90%";
      bubbleStyle.padding = 4;
      Container = TouchableWithoutFeedback;
      break;
    default:
      break;
  }

  const copyToClipboard = async (text) => {
    try {
      await ClipBoard.setStringAsync(text);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={wrapperStyle}>
      <Container
        style={{ width: "100%" }}
        onLongPress={() =>
          menuRef.current.props.ctx.menuActions.openMenu(menuId.current)
        }
      >
        <View style={bubbleStyle}>
          <Text style={textStyle}>{text}</Text>

          <Menu name={menuId.current} ref={menuRef}>
            <MenuTrigger />
            <MenuOptions>
              <MenuItem
                text="Copy"
                onSelect={() => copyToClipboard(text)}
                iconName="copy"
              />
              <MenuItem
                text="Favorite"
                onSelect={() => favoriteMessage(messageId, chatId, userId)}
                iconName="star"
              />
              <MenuItem
                text="Copy"
                onSelect={() => favoriteMessage(messageId, chatId, userId)}
              />
            </MenuOptions>
          </Menu>
        </View>
      </Container>
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
