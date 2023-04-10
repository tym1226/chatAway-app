import React, { useCallback, useEffect, useReducer, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSelector } from "react-redux";
import DataItem from "../components/DataItem";
import Input from "../components/Input";
import PageContainer from "../components/PageContainer";
import PageTitle from "../components/PageTitle";
import ProfileImage from "../components/ProfileImage";
import SubmitButton from "../components/SubmitButton";
import colors from "../constants/colors";
import {
  addUsersToChat,
  removeUserFromChat,
  updateChatData,
} from "../utils/actions/chatActions";
import { validateInput } from "../utils/actions/formActions";
import { reducer } from "../utils/reducers/formReducer";

const ChatSettingsScreen = (props) => {
  const chatId = props.route.params.chatId;

  const chatData = useSelector((state) => state.chats.chatsData[chatId] || {});
  const userData = useSelector((state) => state.auth.userData);
  const storedUsers = useSelector((state) => state.users.storedUsers);
  const favoriteMessages = useSelector(
    (state) => state.messages.favoriteMessages[chatId] ?? {}
  );

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMsg, setShowSuccessMsg] = useState(false);

  const initialState = {
    inputValidities: { chatName: undefined },
    inputValues: { chatName: chatData.chatName },
    formIsValid: false,
  };

  const selectedUsers = props.route.params.selectedUsers;
  useEffect(() => {
    if (!selectedUsers) {
      return;
    }

    const selectedUserData = [];
    selectedUsers.forEach((uid) => {
      if (uid === userData.userId) return;

      if (!storedUsers[uid]) {
        // console.log("No user data found in the data store");
        return;
      }

      selectedUserData.push(storedUsers[uid]);

      addUsersToChat(userData, selectedUserData, chatData);
    });
  }, [selectedUsers]);

  const [formState, dispatchFormState] = useReducer(reducer, initialState);

  const inputChangedHandler = useCallback(
    (inputId, inputValue) => {
      const result = validateInput(inputId, inputValue);
      dispatchFormState({ inputId, validationResult: result, inputValue });
    },
    [dispatchFormState]
  );

  const saveHandler = useCallback(async () => {
    const updatedValues = formState.inputValues;
    try {
      setIsLoading(true);
      await updateChatData(chatId, userData.userId, updatedValues);

      setShowSuccessMsg(true);

      setTimeout(() => {
        setShowSuccessMsg(false);
      }, 1500);
    } catch (err) {
      console.error();
    } finally {
      setIsLoading(false);
    }
  }, [formState]);

  const hasChanges = () => {
    const currentValues = formState.inputValues;
    return currentValues.chatName != chatData.chatName;
  };

  const leaveChat = useCallback(async () => {
    try {
      setIsLoading(true);
      // remove user
      await removeUserFromChat(userData, userData, chatData);

      props.navigation.popToTop();
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [props.navigation, isLoading]);

  if (!chatData.users) {
    return null;
  }

  return (
    <PageContainer>
      <PageTitle text="Chat Settings" />

      <ScrollView contentContainerStyle={styles.ScrollView}>
        <ProfileImage
          showEditButton={true}
          size={100}
          chatId={chatId}
          userId={userData.userId}
          uri={chatData.chatImage}
        />

        <Text
          style={{
            marginTop: 15,
            fontFamily: "medium",
            color: colors.darkGray,
          }}
        >
          {chatData.chatName}
        </Text>
        <Input
          id="chatName"
          label="Chat name"
          autoCapitalize="none"
          initialValue={chatData.chatName}
          allowEmpty={false}
          onInputChanged={inputChangedHandler}
          errorText={formState.inputValidities["chatName"]}
        />

        <View style={styles.sectionContainer}>
          <Text style={styles.heading}>
            {chatData.users.length} Participants
          </Text>

          <DataItem
            title="Add participants"
            icon="pluscircleo"
            type="button"
            onPress={() =>
              props.navigation.navigate("NewChat", {
                isGroupChat: true,
                existingUsers: chatData.users,
                chatId,
              })
            }
          />
          {chatData.users.slice(0, 6).map((uid) => {
            const currentUser = storedUsers[uid];
            return (
              <DataItem
                key={uid}
                image={currentUser.profilePicture}
                title={`${currentUser.firstName} ${currentUser.lastName}`}
                subTitle={currentUser.about}
                type={uid !== userData.userId && "link"}
                onPress={() =>
                  uid !== userData.userId &&
                  props.navigation.navigate("Contact", { uid, chatId })
                }
              />
            );
          })}

          {chatData.users.length > 6 && (
            <DataItem
              type={"link"}
              title="View all"
              hideImage={true}
              onPress={() =>
                props.navigation.navigate("DataList", {
                  title: "Participants",
                  data: chatData.users,
                  type: "users",
                  chatId,
                })
              }
            />
          )}
        </View>

        {showSuccessMsg && (
          <Text style={{ color: colors.primaryColor }}>Saved!</Text>
        )}
        <View style={{ marginVertical: 5 }}></View>
        {isLoading ? (
          <ActivityIndicator size={"small"} color={colors.primaryColor} />
        ) : (
          hasChanges() && (
            <SubmitButton
              title="Save Changes"
              color={colors.primaryColor}
              onPress={saveHandler}
              disabled={!formState.formIsValid}
            />
          )
        )}

        {
          <DataItem
            type={"link"}
            title="Favorite messages"
            hideImage={true}
            onPress={() =>
              props.navigation.navigate("DataList", {
                title: "Favorite Messages",
                data: Object.values(favoriteMessages),
                type: "messages",
              })
            }
          />
        }
      </ScrollView>

      {
        <SubmitButton
          title="Leave chat"
          color={colors.red}
          style={{ marginBottom: 25 }}
          onPress={() => leaveChat()}
        />
      }
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  ScrollView: {
    justifyContent: "center",
    alignItems: "center",
  },
  sectionContainer: {
    width: "100%",
    marginTop: 10,
  },
  heading: {
    marginVertical: 8,
    color: colors.textColor,
    fontFamily: "bold",
    letterSpacing: 0.3,
  },
});

export default ChatSettingsScreen;
