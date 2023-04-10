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
import { addUserChat, deleteUserChat, getUserChats } from "./userActions";
import { getUserPushTokens } from "./authActions";

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

export const sendInfoMessage = async (chatId, senderId, messageText) => {
  await sendMessage(chatId, senderId, messageText, null, null, "info");
};

export const sendTextMessage = async (
  chatId,
  senderData,
  messageText,
  replyTo,
  chatUsers
) => {
  await sendMessage(
    chatId,
    senderData.userId,
    messageText,
    null,
    replyTo,
    null
  );

  const otherUsers = chatUsers.filter((uid) => uid !== senderData.userId);
  await sendPushNotificationForUsers(
    otherUsers,
    `${senderData.firstName} ${senderData.lastName}`,
    messageText,
    chatId
  );
};

export const sendImage = async (
  chatId,
  senderData,
  imageUrl,
  replyTo,
  chatUsers
) => {
  await sendMessage(
    chatId,
    senderData.userId,
    "Image",
    imageUrl,
    replyTo,
    null
  );

  const otherUsers = chatUsers.filter((uid) => uid !== senderData.userId);
  await sendPushNotificationForUsers(
    otherUsers,
    `${senderData.firstName} ${senderData.lastName}`,
    `${senderData.firstName} ${senderData.lastName} sent an image`,
    chatId
  );
};

const sendMessage = async (
  chatId,
  senderId,
  messageText,
  imageUrl,
  replyTo,
  type
) => {
  const app = getFirebaseApp();
  const dbRef = ref(getDatabase(app));
  const messageRef = child(dbRef, `messages/${chatId}`);

  const messageData = {
    sentBy: senderId,
    sentAt: new Date().toISOString(),
    text: messageText,
  };

  if (replyTo) {
    messageData.replyTo = replyTo;
  }

  if (imageUrl) {
    messageData.imageUrl = imageUrl;
  }

  if (type) {
    messageData.type = type;
  }

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

export const updateChatData = async (chatId, userId, chatData) => {
  const app = getFirebaseApp();
  const dbRef = ref(getDatabase(app));
  const chatRef = child(dbRef, `chats/${chatId}`);

  await update(chatRef, {
    ...chatData,
    updatedAt: new Date().toISOString(),
    updatedBy: userId,
  });
};

export const removeUserFromChat = async (
  userLoggedInData,
  userToRemoveData,
  chatData
) => {
  const userToRemoveId = userToRemoveData.userId;
  const newUsers = chatData.users.filter((uid) => uid !== userToRemoveId);
  // remove user from users list in chatData
  await updateChatData(chatData.key, userLoggedInData.userId, {
    users: newUsers,
  });
  // remove chat from use's chatlist
  const userChats = await getUserChats(userToRemoveId);
  for (const key in userChats) {
    const currentChatId = userChats[key];
    if (currentChatId === chatData.key) {
      await deleteUserChat(userToRemoveId, key);
      break;
    }
  }

  const messageText =
    userLoggedInData.userId === userToRemoveData.userId
      ? `${userLoggedInData.firstName} ${userLoggedInData.lastName} left the chat`
      : `${userLoggedInData.firstName} ${userLoggedInData.lastName} removed ${userToRemoveData.firstName} ${userToRemoveData.lastName} from the chat`;
  await sendInfoMessage(chatData.key, userLoggedInData.userId, messageText);
};

export const addUsersToChat = async (
  userLoggedInData,
  usersToAddData,
  chatData
) => {
  const existingUsers = Object.values(chatData.users);
  const newUsers = [];

  let userAddedName = "";

  usersToAddData.forEach(async (userToAdd) => {
    const userToAddId = userToAdd.userId;

    if (existingUsers.includes(userToAddId)) return;

    newUsers.push(userToAddId);

    await addUserChat(userToAddId, chatData.key);

    userAddedName = `${userToAdd.firstName} ${userToAdd.lastName}`;
  });

  if (newUsers.length === 0) {
    return;
  }
  await updateChatData(chatData.key, userLoggedInData.userId, {
    users: existingUsers.concat(newUsers),
  });

  const moreUsersMessageText =
    newUsers.length > 1 ? `and ${newUsers.length - 1} others ` : "";
  const messageText = `${userLoggedInData.firstName} ${userLoggedInData.lastName} added ${userAddedName} ${moreUsersMessageText}to the chat.`;
  await sendInfoMessage(chatData.key, userLoggedInData.userId, messageText);
};

const sendPushNotificationForUsers = (chatUsers, title, body, chatId) => {
  chatUsers.forEach(async (uid) => {
    const tokens = await getUserPushTokens(uid);

    for (const key in tokens) {
      const token = tokens[key];

      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: token,
          title,
          body,
          data: { chatId },
        }),
      });
    }
  });
};
