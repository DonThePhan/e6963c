const router = require("express").Router();
const { Conversation, Message } = require("../../db/models");
const onlineUsers = require("../../onlineUsers");
const cors = require("cors");
const { Op } = require("sequelize");

// expects {recipientId, text, conversationId } in body (conversationId will be null if no conversation exists yet)
router.post("/", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const senderId = req.user.id;
    const { recipientId, text, conversationId, sender, read } = req.body;

    // if we already know conversation id, we can save time and just add it to message and return
    if (conversationId) {
      const message = await Message.create({ senderId, text, conversationId, read });
      return res.json({ message, sender });
    }
    // if we don't have conversation id, find a conversation to make sure it doesn't already exist
    let conversation = await Conversation.findConversation(senderId, recipientId);

    if (!conversation) {
      // create conversation
      conversation = await Conversation.create({
        user1Id: senderId,
        user2Id: recipientId,
      });
      if (onlineUsers.includes(sender.id)) {
        sender.online = true;
      }
    }
    const message = await Message.create({
      senderId,
      text,
      conversationId: conversation.id,
      read,
    });
    res.json({ message, sender });
  } catch (error) {
    next(error);
  }
});

// change attribute read = true for all messages with matching conversation and received by user
// expects {conversationId, senderId } in body
router.patch("/read-status", cors(), async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { conversationId, senderId } = req.body;

    // confirm user logged in
    if (!req.user) {
      return res.sendStatus(401);
    }

    // confirm conversation exists & user has permission to access conversation
    const conversation = await Conversation.findConversation(userId, senderId);
    if (!conversation || conversation.id !== conversationId) {
      return res.sendStatus(401);
    }

    await Message.update(
      { read: true },
      {
        where: {
          conversationId,
          senderId,
        },
      },
    );

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

router.get("/unread-count/:conversationId", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const { conversationId } = req.params;

    const count = await Message.count({
      where: {
        conversationId,
        senderId: {
          [Op.not]: req.user.id,
        },
        read: false,
      },
    });

    res.json(count);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
