import React from "react";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import PageContainer from "../components/PageContainer";
import PageTitle from "../components/PageTitle";
import ProfileImage from "../components/ProfileImage";
import colors from "../constants/colors";

const ContactScreen = (props) => {
  const storedUsers = useSelector((state) => state.users.storedUsers);
  const currentUser = storedUsers[props.route.params.uid];
  const storedChats = useSelector((state) => state.chats.chatsData);

  const [commonChats, setCommonChats] = useState([]);

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
});

export default ContactScreen;
