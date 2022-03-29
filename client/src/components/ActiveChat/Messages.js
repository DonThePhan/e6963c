import React from 'react';
import { Box } from '@material-ui/core';
import { SenderBubble, OtherUserBubble } from '.';
import moment from 'moment';

const Messages = (props) => {
	const { messages, otherUser, user } = props;

  // find id of last message read by other user
	const messagesReadByOther = messages.filter((message) => message.senderId === user.id && message.read);
	let lastMessageReadByOtherId;
	if (messagesReadByOther.length > 0) {
		lastMessageReadByOtherId = messagesReadByOther[0].id;
	} else {
		lastMessageReadByOtherId = null;
	}

	return (
		<Box>
			{messages.slice().reverse().map((message) => {
				const time = moment(message.createdAt).format('h:mm');

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
