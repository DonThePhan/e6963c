const router = require("express").Router();
const { ConversationUser, Conversation } = require("../../db/models");
const { Op } = require("sequelize");

// add UserConversation
router.post("/", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }

    const { userId, conversationId } = req.body;

    if (userId !== req.user.id) {
      return res.sendStatus(401);
    }

    const conversation = await Conversation.findOne({
      where: {
        id: conversationId,
        userId,
      },
    });

    if (conversation) {
      return res
        .sendStatus(400)
        .json({ error: `conversation_user with conversationId ${conversationId} and userId ${userId} already exists` });
    }

    // if no match found, create entry
    const conversationUser = await ConversationUser.create({ conversationId, userId });

    res.json(conversationUser);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
