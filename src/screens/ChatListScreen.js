import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";

const ChatListScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text>Chat List Screen</Text>
      <Button
        title="go to chat"
        onPress={() => {
          navigation.navigate("ChatScreen");
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ChatListScreen;
