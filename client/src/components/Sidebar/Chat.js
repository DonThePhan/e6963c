import React, { useState, useEffect } from "react";
import { Box } from "@material-ui/core";
import { BadgeAvatar, ChatContent } from "../Sidebar";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    borderRadius: 8,
    height: 80,
    boxShadow: "0 2px 10px 0 rgba(88,133,196,0.05)",
    marginBottom: 10,
    display: "flex",
    alignItems: "center",
    "&:hover": {
      cursor: "grab",
    },
  },
}));

const Chat = ({ conversation, setActiveChat, userId, activeConversation }) => {
  const classes = useStyles();
  const { otherUser } = conversation;

  const [ unread, setUnread ] = useState(
    conversation.messages.filter((message) => message.senderId === conversation.otherUser.id && !message.read).length,
  );
  const [ lastMessageId, setLastMessageId ] = useState(null);

  // when new message received
  useEffect(
    () => {
      if (conversation && conversation.messages && conversation.messages.length && conversation.messages.length > 0) {
        const lastMessage = conversation.messages[conversation.messages.length - 1];

        if (lastMessageId && lastMessage.id !== lastMessageId) {
          if (lastMessage.senderId === activeConversation) {
            setUnread(0);
          } else {
            setUnread((prev) => prev + 1);
          }
        }

        if (conversation.otherUser.id === activeConversation) {
          setUnread(0);
        }
        setLastMessageId(lastMessage.id);
      }
    },
    [ conversation, lastMessageId ],
  );

  const handleClick = async (conversation) => {
    await setActiveChat(conversation.otherUser.id);
    setUnread(0);
  };

  return (
    <Box onClick={() => handleClick(conversation)} className={classes.root}>
      <BadgeAvatar
        photoUrl={otherUser.photoUrl}
        username={otherUser.username}
        online={otherUser.online}
        sidebar={true}
      />
      <ChatContent conversation={conversation} userId={userId} unread={unread} />
    </Box>
  );
};

export default Chat;
