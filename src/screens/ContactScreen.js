import React from "react";
import { useEffect } from "react";
import { useCallback } from "react";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import DataItem from "../components/DataItem";
import PageContainer from "../components/PageContainer";
import PageTitle from "../components/PageTitle";
import ProfileImage from "../components/ProfileImage";
import SubmitButton from "../components/SubmitButton";
import colors from "../constants/colors";
import { removeUserFromChat } from "../utils/actions/chatActions";
import { getUserChats } from "../utils/actions/userActions";

const ContactScreen = (props) => {
  const storedUsers = useSelector((state) => state.users.storedUsers);
  const storedChats = useSelector((state) => state.chats.chatsData);
  const userData = useSelector((state) => state.auth.userData);

  const currentUser = storedUsers[props.route.params.uid];
  const chatId = props.route.params.chatId;

  const chatData = chatId && storedChats[chatId];

  const [commonChats, setCommonChats] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getCommonUserChats = async () => {
      const currentUserChats = await getUserChats(currentUser.userId);
      setCommonChats(
        Object.values(currentUserChats).filter(
          (cid) => storedChats[cid] && storedChats[cid].isGroupChat
        )
      );
    };

    getCommonUserChats();
  }, []);

  const removeFromChat = useCallback(async () => {
    try {
      setIsLoading(true);
      // remove user
      await removeUserFromChat(userData, currentUser, chatData);

      // go back after removal
      props.navigation.goBack();
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [props.navigation, isLoading]);

  return (
    <PageContainer>
      <View style={styles.topContainer}>
        <ProfileImage
          uri={currentUser.profilePicture}
          size={180}
          borderRadius={180}
          style={{ marginBottom: 20 }}
        />
        <PageTitle text={`${currentUser.firstName} ${currentUser.lastName}`} />
        {currentUser.about && (
          <Text numberOfLines={2} style={styles.about}>
            {currentUser.about}
          </Text>
        )}
      </View>

      {commonChats.length > 0 && (
        <>
          <Text style={styles.commonGroupHeading}>
            {commonChats.length} {commonChats.length === 1 ? "Group" : "Groups"}{" "}
            in Common
          </Text>
          {commonChats.map((cid) => {
            const chatData = storedChats[cid];
            return (
              <DataItem
                key={cid}
                title={chatData.chatName}
                subTitle={chatData.latestMessageText}
                type="link"
                onPress={() =>
                  props.navigation.push("ChatScreen", { chatId: cid })
                }
                image={chatData.chatImage}
              />
            );
          })}
        </>
      )}

      {chatData &&
        chatData.isGroupChat &&
        (isLoading ? (
          <ActivityIndicator size={"small"} color={colors.primaryColor} />
        ) : (
          <SubmitButton
            title="Remove from chat"
            color={colors.red}
            onPress={removeFromChat}
          />
        ))}
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  topContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  about: {
    fontFamily: "medium",
    letterSpacing: 0.3,
    color: colors.gray,
    fontSize: 16,
  },
  commonGroupHeading: {
    fontFamily: "bold",
    letterSpacing: 0.3,
    color: colors.textColor,
    marginVertical: 10,
    fontSize: 18,
  },
});

export default ContactScreen;
