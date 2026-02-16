const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConversationSchema = new Schema(
	{
		participants: [
			{
				type: Schema.Types.ObjectId,
				ref: 'User',
				required: true,
			},
		],
		lastMessage: {
			type: Schema.Types.ObjectId,
			ref: 'Message',
		},
		lastReadAt: [
			{
				user: {
					type: Schema.Types.ObjectId,
					ref: 'User',
				},
				date: {
					type: Date,
					default: Date.now,
				},
			},
		],
	},
	{ timestamps: true }
);

const Conversation = mongoose.model('Conversation', ConversationSchema);

module.exports = Conversation;
