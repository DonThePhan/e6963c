const router = require("express").Router();
const { ConversationUser, Conversation } = require("../../db/models");
const { Op } = require("sequelize");

// add UserConversation
router.post("/", async (req, res, next) => {
	try {
		if (!req.user) {
			return res.sendStatus(401);
		}
		const userId = req.user.id;

		const { otherId, conversationId } = req.body;
		const conversation = await Conversation.findOne({
			where: {
				id: conversationId,
				[Op.or]: {
					user1Id: userId,
					user2Id: userId
				}
			}
		});

		// if no match found
		if (!conversation) {
			return res
				.sendStatus(404)
				.json({ error: `conversation with id ${conversationId} and userId ${userId} does not exist` });
		}

		const conversationUser = await ConversationUser.create({ conversationId, userId: otherId });

		res.json(conversationUser);
	} catch (error) {
		next(error);
	}
});

module.exports = router;