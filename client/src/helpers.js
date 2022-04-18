import axios from "axios";

export const markMessagesAsRead = async ({ userId, conversationId, setConversations }) => {
  try {
    // patch selected convo message read status' to true in backend
    await axios.patch("/api/messages/messages-read", { senderId: userId, conversationId });
  } catch (error) {
    console.log(error);
  }

  // update selected convo message read status' in conversations
  setConversations((prev) =>
    prev.map((convo) => {
      if (convo.id === conversationId) {
        const convoCopy = JSON.parse(JSON.stringify(convo));
        convoCopy.messages.forEach((message) => {
          if (userId === message.senderId) {
            message.read = true;
          }
        });
        return convoCopy;
      } else {
        return convo;
      }
    }),
  );
};
