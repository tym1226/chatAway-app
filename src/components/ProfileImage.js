import React, { useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

import UserImage from "../../assets/images/default-user-image.png";
import colors from "../constants/colors";
import {
  launchImagePicker,
  uploadImageAsync,
} from "../utils/ImagePickerHelper";
import { updateSignedInUserData } from "../utils/actions/authActions";
import { updateLoggedInUserData } from "../store/authSlice";
import { useDispatch } from "react-redux";
import { ActivityIndicator } from "react-native";
import { updateChatData } from "../utils/actions/chatActions";

const ProfileImage = (props) => {
  const dispatch = useDispatch();

  const source = props.uri ? { uri: props.uri } : UserImage;

  const [image, setImage] = useState(source);
  const [isLoading, setIsLoading] = useState(false);

  const showEditButton = props.showEditButton && props.showEditButton === true;
  const showRemoveButton =
    props.showRemoveButton && props.showRemoveButton === true;

  const userId = props.userId;
  const chatId = props.chatId;

  const pickImage = async () => {
    try {
      const tempUri = await launchImagePicker();

      if (!tempUri) {
        return;
      }

      // upload the image
      setIsLoading(true);
      const uploadUrl = await uploadImageAsync(tempUri, chatId !== undefined);
      setIsLoading(false);

      if (!uploadUrl) {
        throw new Error("Could not upload image");
      }

      if (chatId) {
        // group chat image
        await updateChatData(chatId, userId, { chatImage: uploadUrl });
      } else {
        // user profile image
        const newData = { profilePicture: uploadUrl };

        await updateSignedInUserData(userId, newData);
        dispatch(updateLoggedInUserData({ newData }));
      }

      // set the image as profile picture
      setImage({ uri: tempUri });
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };

  const Container = props.onPress || showEditButton ? TouchableOpacity : View;

  return (
    <Container onPress={props.onPress || pickImage} style={props.style}>
      {isLoading ? (
        <View
          height={props.size}
          width={props.size}
          style={styles.loadingContainer}
        >
          <ActivityIndicator size="small" color={colors.primaryColor} />
        </View>
      ) : (
        <Image
          source={image}
          style={{
            ...styles.image,
            ...{
              width: props.size,
              height: props.size,
              borderRadius: props.borderRadius ?? 50,
            },
          }}
        />
      )}
      {showEditButton && !isLoading && (
        <View style={styles.iconContainer}>
          <FontAwesome name="pencil" size={18} color="black" />
        </View>
      )}

      {showRemoveButton && !isLoading && (
        <View style={styles.removeIconContainer}>
          <FontAwesome name="close" size={10} color={colors.gray} />
        </View>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  image: {
    borderRadius: 50,
    borderColor: colors.gray,
    borderWidth: 1,
  },
  iconContainer: {
    position: "absolute",
    bottom: -8,
    right: -5,
    backgroundColor: colors.lightGray,
    borderRadius: 20,
    padding: 8,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  removeIconContainer: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
});

export default ProfileImage;
