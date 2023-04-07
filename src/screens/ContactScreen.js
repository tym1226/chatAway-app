import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import DataItem from "../components/DataItem";
import PageContainer from "../components/PageContainer";
import PageTitle from "../components/PageTitle";
import ProfileImage from "../components/ProfileImage";
import colors from "../constants/colors";
import { getUserChats } from "../utils/actions/userActions";

const ContactScreen = (props) => {
  const storedUsers = useSelector((state) => state.users.storedUsers);
  const currentUser = storedUsers[props.route.params.uid];
  const storedChats = useSelector((state) => state.chats.chatsData);

  const [commonChats, setCommonChats] = useState([]);

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
              />
            );
          })}
        </>
      )}
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
