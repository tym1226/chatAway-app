import { createSlice } from "@reduxjs/toolkit";

const messagesSlice = createSlice({
  name: "messages",
  initialState: {
    messagesData: {},
    favoriteMessages: {},
  },
  reducers: {
    setChatMessages: (state, action) => {
      const existingMessages = state.messagesData;

      const { chatId, messagesData } = action.payload;

      existingMessages[chatId] = messagesData;

      state.messagesData = existingMessages;
    },
    addFavoriteMessage: (state, action) => {
      const { favoriteMessageData } = action.payload;
      state.favoriteMessages[favoriteMessageData.messageId] =
        favoriteMessageData;
    },
    removeFavoriteMessage: (state, action) => {
      const { messageId } = action.payload;
      delete state.favoriteMessages[messageId];
    },
    setFavoriteMessages: (state, action) => {
      const { favoriteMessages } = action.payload;
      state.favoriteMessages = { ...favoriteMessages };
    },
  },
});

export const {
  setChatMessages,
  addFavoriteMessage,
  removeFavoriteMessage,
  setFavoriteMessages,
} = messagesSlice.actions;
export default messagesSlice.reducer;
