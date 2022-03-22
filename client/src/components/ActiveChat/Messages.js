import React from 'react';
import { Box } from '@material-ui/core';
import { SenderBubble, OtherUserBubble } from '.';
import moment from 'moment';

const Messages = (props) => {
	const { messages, otherUser, userId } = props;

	const sortedMessages = messages.slice().sort((msgA, msgB) => new Date(msgB.createdAt) - new Date(msgA.createdAt));

	return (
		<Box>
			{sortedMessages.slice().reverse().map((message) => {
				const time = moment(message.createdAt).format('h:mm');

				return message.senderId === userId ? (
					<SenderBubble key={message.id} text={message.text} time={time} />
				) : (
					<OtherUserBubble key={message.id} text={message.text} time={time} otherUser={otherUser} />
				);
			})}
		</Box>
	);
};

export default Messages;
