import React, { useState, useEffect } from "react";
import { Box } from "@material-ui/core";
import { SenderBubble, OtherUserBubble } from ".";
import moment from "moment";

const Messages = (props) => {
  const { messages, otherUser, user } = props;

  const [ initialLoad, setInitialLoad ] = useState(true);

  // find id of last message read by other user
  const [ lastMessageReadByOtherId, setLastMessageReadByOtherId ] = useState(null);

  useEffect(
    () => {
      if (initialLoad) {
        // on component mount, check for last message read
        const messagesReadByOther = messages.filter((message) => message.senderId === user.id && message.read);
        if (messagesReadByOther.length > 0) {
          setLastMessageReadByOtherId(messagesReadByOther[messagesReadByOther.length - 1].id);
        }
      } else {
        // subsequently, check if last message was sent from user and if it was read
        const lastMessage = messages[messages.length - 1];

        if (lastMessage.senderId === user.id && lastMessage.read) {
          setLastMessageReadByOtherId(lastMessage.id);
        }
      }
    },
    [ messages, user, initialLoad ],
  );

  useEffect(
    () => {
      setInitialLoad(false);
    },
    [ initialLoad ],
  );

  return (
    <Box>
      {messages.map((message) => {
        const time = moment(message.createdAt).format("h:mm");

        return message.senderId === user.id ? (
          <SenderBubble
            key={message.id}
            lastMessageReadByOtherId={lastMessageReadByOtherId}
            messageId={message.id}
            text={message.text}
            time={time}
            otherUser={otherUser}
          />
        ) : (
          <OtherUserBubble key={message.id} text={message.text} time={time} otherUser={otherUser} />
        );
      })}
    </Box>
  );
};

export default Messages;
