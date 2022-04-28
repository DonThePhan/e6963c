import axios from "axios";

export const markMessagesAsReadBackEnd = async ({ senderId, conversationId }) => {
  try {
    // patch selected convo message read status' to true in Backend
    await axios.patch("/api/messages/read-status", { senderId, conversationId });
  } catch (error) {
    console.log(error);
  }
};

export const markMessagesAsReadFrontEnd = ({ senderId, conversationId, setConversations }) => {
  // update selected convo message read status' in conversations (Frontend)
  setConversations((prevConvos) => {
    const convosCopy = prevConvos.map((convo) => {
      if (convo.id === conversationId) {
        const convoCopy = { ...convo };
        const messagesCopy = convoCopy.messages.map((message) => {
          if (senderId === message.senderId) {
            return { ...message, read: true };
          }
          return message;
        });
        convoCopy.messages = messagesCopy;
        return convoCopy;
      }

      return convo;
    });

    // only return new object if changes made. Else return prev
    if (JSON.parse(JSON.stringify(prevConvos)) === JSON.parse(JSON.stringify(convosCopy))) {
      return prevConvos;
    } else {
      return convosCopy;
    }
  });
};

export const messagesUnreadCount = async ({ conversationId }) => {
  try {
    // patch selected convo message read status' to true in Backend
    const response = await axios.get(`/api/messages/unread-count/${conversationId}`);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
