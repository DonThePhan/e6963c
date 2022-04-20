import axios from "axios";

export const markMessagesAsReadBackEnd = async ({ userId, conversationId }) => {
  try {
    // patch selected convo message read status' to true in Backend
    await axios.patch("/api/messages/messages-read", { senderId: userId, conversationId });
  } catch (error) {
    console.log(error);
  }
};

export const markMessagesAsReadFrontEnd = ({ userId, conversationId, setConversations }) => {
  // update selected convo message read status' in conversations (Frontend)
  setConversations((prev) => {
    const convosCopy = JSON.parse(JSON.stringify(prev)).map((convo) => {
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
    });

    // only return new object if changes made. Else return prev
    if (JSON.parse(JSON.stringify(prev)) === JSON.parse(JSON.stringify(convosCopy))) {
      return prev;
    } else {
      return convosCopy;
    }
  });
};
