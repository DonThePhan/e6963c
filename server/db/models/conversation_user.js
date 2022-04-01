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

module.exports = ConversationUser;
