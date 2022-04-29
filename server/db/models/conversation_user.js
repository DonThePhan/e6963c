const db = require("../db");
const Sequelize = require("sequelize");

const ConversationUser = db.define("conversation_user", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
});

// find conversations given user ID
ConversationUser.findConversations = async function(userId) {
  const conversations = await ConversationUser.findAll({
    where: userId,
  });

  // return conversation or null if it doesn't exist
  return conversations;
};

module.exports = ConversationUser;
