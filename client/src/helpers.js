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
  setConversations((prev) => {
    const convosCopy = JSON.parse(JSON.stringify(prev)).map((convo) => {
      if (convo.id === conversationId) {
        const convoCopy = JSON.parse(JSON.stringify(convo));
        convoCopy.messages.forEach((message) => {
          if (senderId === message.senderId) {
            message.read = true;
          }
        });
        return convoCopy;
      } else {
        return convo;
      }
    });

    // only return new object if changes made. Else return prev
    if (JSON.parse(JSON.stringify(prev)) === JSON.parse(JSON.stringify(convosCopy))) {
      return prev;
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
