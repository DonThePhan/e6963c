const Conversation = require("./conversation");
const User = require("./user");
const Message = require("./message");
const ConversationUser = require("./conversation_user");

// associations
Conversation.belongsToMany(User, {
  through: ConversationUser,
});
User.belongsToMany(Conversation, {
  through: ConversationUser,
});
ConversationUser.belongsTo(User);
User.hasMany(ConversationUser);
ConversationUser.belongsTo(Conversation);
Conversation.hasMany(ConversationUser);

User.hasMany(Conversation);
Conversation.belongsTo(User, { as: "user1" });
Conversation.belongsTo(User, { as: "user2" });
Message.belongsTo(Conversation);
Conversation.hasMany(Message);

module.exports = {
  User,
  Conversation,
  Message,
  ConversationUser,
};
