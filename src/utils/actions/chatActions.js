import {
  child,
  get,
  getDatabase,
  push,
  ref,
  remove,
  set,
  update,
} from "firebase/database";
import { getFirebaseApp } from "../firebaseHelper";

export const createChat = async (loggedInUserId, chatData) => {
  const newChatData = {
    ...chatData,
    createdBy: loggedInUserId,
    updatedBy: loggedInUserId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const app = getFirebaseApp();
  const dbRef = ref(getDatabase(app));
  const newChat = await push(child(dbRef, "chats"), newChatData);

  const chatUsers = newChatData.users;
  for (let i = 0; i < chatUsers.length; i++) {
    const userId = chatUsers[i];
    await push(child(dbRef, `userChats/${userId}`), newChat.key);
  }

  return newChat.key;
};

export const sendTextMessage = async (chatId, senderId, messageText) => {
  const app = getFirebaseApp();
  const dbRef = ref(getDatabase(app));
  const messageRef = child(dbRef, `messages/${chatId}`);

  const messageData = {
    sentBy: senderId,
    sentAt: new Date().toISOString(),
    text: messageText,
  };

  await push(messageRef, messageData);

  const chatRef = child(dbRef, `chats/${chatId}`);
  await update(chatRef, {
    updatedBy: senderId,
    updatedAt: new Date().toISOString(),
    latestMessageText: messageText,
  });
};

export const favoriteMessage = async (messageId, chatId, userId) => {
  try {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const childRef = child(
      dbRef,
      `userFavoriteMessages/${userId}/${chatId}/${messageId}`
    );

    const snapshot = await get(childRef);

    if (snapshot.exists()) {
      // favorite item exists, un-favorite
      await remove(childRef);
    } else {
      // ... does not exist, favorite it
      const favoritedMessageData = {
        messageId,
        chatId,
        favoriteAt: new Date().toISOString(),
      };

      await set(childRef, favoritedMessageData);
    }
  } catch (err) {
    console.log(err);
  }
};
