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
import { useSelector } from "react-redux";
import { AntDesign, FontAwesome5 } from "@expo/vector-icons";
import FormatDate from "./formatDate";

const Bubble = (props) => {
  const { text, type, messageId, chatId, userId, date } = props;

  const favoriteMessages = useSelector(
    (state) => state.messages.favoriteMessages[chatId] ?? {}
  );

  const bubbleStyle = { ...styles.container };
  const textStyle = { ...styles.text };
  const wrapperStyle = { ...styles.wrapper };

  const menuRef = useRef(null);
  // useRef so the menuId only generates one time instead of everytime it renders
  const menuId = useRef(uuid.v4());

  let Container = View;
  let isUserMessage = false;
  const dateString = FormatDate(date);

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
      isUserMessage = true;
      break;
    case "theirMessage":
      wrapperStyle.justifyContent = "flex-start";
      bubbleStyle.backgroundColor = "white";
      bubbleStyle.maxWidth = "90%";
      bubbleStyle.padding = 4;
      Container = TouchableWithoutFeedback;
      isUserMessage = true;
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

  const isFavorite = isUserMessage && favoriteMessages[messageId] !== undefined;

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

          {dateString && (
            <View style={styles.timeContainer}>
              {isFavorite && (
                <AntDesign
                  name="star"
                  size={12}
                  color={colors.gray}
                  style={{ marginRight: 5 }}
                />
              )}
              <Text style={styles.time}>{dateString}</Text>
            </View>
          )}

          <Menu name={menuId.current} ref={menuRef}>
            <MenuTrigger />
            <MenuOptions>
              <MenuItem
                text="Copy"
                onSelect={() => copyToClipboard(text)}
                iconName="copy"
                inconPack={FontAwesome5}
              />
              <MenuItem
                text={`${isFavorite ? "UnFavorite" : "Favorite"}`}
                onSelect={() => favoriteMessage(messageId, chatId, userId)}
                iconName={isFavorite ? "star" : "staro"}
              />
              <MenuItem
                text="Reply to"
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
  timeContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 2,
  },
  time: {
    fontFamily: "regular",
    letterSpacing: 0.3,
    fontSize: 12,
    color: colors.gray,
  },
});

export default Bubble;
