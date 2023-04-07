import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  TextInput,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import CustomHeaderButton from "../components/CustomHeaderButton";
import PageContainer from "../components/PageContainer";
import { FontAwesome } from "@expo/vector-icons";
import colors from "../constants/colors";
import { useState } from "react";
import commonStyle from "../constants/commonStyle";
import { searchUsers } from "../utils/actions/userActions";
import DataItem from "../components/DataItem";
import { useDispatch, useSelector } from "react-redux";
import { setStoredUsers } from "../store/userSlice";
import ProfileImage from "../components/ProfileImage";

const NewChatScreen = (props) => {
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState();
  const [noResultsFound, setNoResultsFound] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [chatName, setChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  const userData = useSelector((state) => state.auth.userData);
  const storedUsers = useSelector((state) => state.users.storedUsers);

  const selectedUsersFlatList = useRef();

  const isGroupChat = props.route.params && props.route.params.isGroupChat;
  const isGroupChatDisabled = selectedUsers.length === 0 || chatName === "";

  /** add a header button to go back to chat list screen */
  useEffect(() => {
    props.navigation.setOptions({
      headerLeft: () => {
        return (
          <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
            <Item title="Close" onPress={() => props.navigation.goBack()} />
          </HeaderButtons>
        );
      },
      headerRight: () => {
        return (
          <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
            {isGroupChat && (
              <Item
                title="Create"
                disabled={isGroupChatDisabled}
                color={isGroupChatDisabled ? colors.lightGray : undefined}
                onPress={() => {
                  props.navigation.navigate("ChatList", {
                    selectedUsers,
                    chatName,
                  });
                }}
              />
            )}
          </HeaderButtons>
        );
      },
      headerTitle: isGroupChat ? "Add participants" : "New chat",
    });
  }, [chatName, selectedUsers]);

  /** search for users */
  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      // console.log("hi");
      if (!searchTerm || searchTerm === "") {
        setUsers();
        setNoResultsFound(false);
        return;
      }

      setIsLoading(true);

      /** conduct a search */
      const userResult = await searchUsers(searchTerm);
      delete userResult[userData.userId];
      setUsers(userResult);

      if (Object.keys(userResult).length === 0) {
        setNoResultsFound(true);
      } else {
        setNoResultsFound(false);

        dispatch(setStoredUsers({ newUsers: userResult }));
      }

      setIsLoading(false);
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  const userPressed = (userId) => {
    if (isGroupChat) {
      const newSelectedUsers = selectedUsers.includes(userId)
        ? selectedUsers.filter((id) => id !== userId)
        : selectedUsers.concat(userId);

      setSelectedUsers(newSelectedUsers);
    } else {
      props.navigation.navigate("ChatList", {
        selectedUserId: userId,
      });
    }
  };

  return (
    <PageContainer>
      {isGroupChat && (
        <>
          <View style={styles.chatNameContainer}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textbox}
                placeholder="Enter a name for your chat"
                autoCorrect={false}
                autoComplete="off"
                value={chatName}
                onChangeText={(text) => setChatName(text)}
              />
            </View>
          </View>

          <View style={styles.selectedUsersContainer}>
            <FlatList
              style={styles.selectedUsersList}
              data={selectedUsers}
              horizontal={true}
              keyExtractor={(item) => item}
              contentContainerStyle={{ alignItems: "center" }}
              renderItem={(itemData) => {
                const userId = itemData.item;
                const userData = storedUsers[userId];
                return (
                  <ProfileImage
                    style={styles.selectedUserStyle}
                    uri={userData.profilePicture}
                    size={40}
                    onPress={() => userPressed(userId)}
                    showRemoveButton={true}
                  />
                );
              }}
            />
          </View>
        </>
      )}

      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={18} color={colors.lightGray} />

        <TextInput
          placeholder="Search..."
          style={styles.searchBox}
          onChangeText={setSearchTerm}
        />
      </View>

      {isLoading && (
        <View style={commonStyle.center}>
          <ActivityIndicator size={"large"} color={colors.primaryColor} />
        </View>
      )}

      {!isLoading && !noResultsFound && users && (
        <FlatList
          data={Object.keys(users)}
          renderItem={(itemData) => {
            const userId = itemData.item;
            const userData = users[userId];

            return (
              <DataItem
                title={`${userData.firstName} ${userData.lastName}`}
                subTitle={userData.about}
                image={userData.profilePicture}
                onPress={() => userPressed(userId)}
                type={isGroupChat ? "checkbox" : ""}
                isChecked={selectedUsers.includes(userId)}
              />
            );
          }}
        />
      )}

      {!isLoading && !users && (
        <View style={commonStyle.center}>
          <FontAwesome
            name="users"
            size={55}
            color={colors.lightGray}
            style={styles.noResultsIcon}
          />
          <Text style={styles.noResultsText}>
            Enter a name to start a chat!
          </Text>
        </View>
      )}

      {!isLoading && noResultsFound && (
        <View style={commonStyle.center}>
          <FontAwesome
            name="question"
            size={55}
            color={colors.lightGray}
            style={styles.noResultsIcon}
          />
          <Text style={styles.noResultsText}>No users found!</Text>
        </View>
      )}
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.extraLightGray,
    height: 36,
    marginVertical: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 5,
  },
  searchBox: {
    marginLeft: 8,
    fontSize: 15,
    width: "100%",
  },
  noResultsIcon: {
    marginBottom: 20,
  },
  noResultsText: {
    color: colors.textColor,
    fontFamily: "regular",
    letterSpacing: 0.3,
    fontSize: 18,
  },
  chatNameContainer: {
    paddingVertical: 10,
  },
  inputContainer: {
    width: "100%",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: colors.extraLightGray,
    borderRadius: 2,
    flexDirection: "row",
  },
  textbox: {
    width: "100%",
    fontFamily: "regular",
    letterSpacing: 0.3,
    color: colors.textColor,
  },
  selectedUsersContainer: {
    height: 50,
    justifyContent: "center",
  },
  selectedUsersList: {
    height: 10,
    paddingTop: 10,
  },
  selectedUserStyle: {
    marginRight: 10,
    marginBottom: 10,
  },
});

export default NewChatScreen;
