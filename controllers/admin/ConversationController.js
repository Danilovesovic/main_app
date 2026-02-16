const Conversation = require('../../models/Conversation');
const Message = require('../../models/Message');

const getConversations = async (req, res) => {
	try {
		const userId = req.session.user._id;

		const conversations = await Conversation.find({
			participants: userId,
		})
			.populate('participants', 'username')
			.populate('lastMessage')
			.sort({ updatedAt: -1 });

		const result = conversations.map((conversation) => {
			const lastReadEntry = conversation.lastReadAt.find(
				(r) => r.user.toString() === userId.toString()
			);

			const hasUnread =
				String(conversation.lastMessage.sender) !== userId &&
				conversation.lastMessage &&
				(!lastReadEntry || conversation.lastMessage.createdAt > lastReadEntry.date);

			return {
				_id: conversation._id,
				conversationKey: conversation.conversationKey,
				participants: conversation.participants,
				lastMessage: conversation.lastMessage,
				hasUnread,
				updatedAt: conversation.updatedAt,
			};
		});

		res.json(result);
	} catch (err) {
		res.status(500).json({ message: 'Server error' });
	}
};

const getMessages = async (req, res) => {
	try {
		const userId = req.session.user._id;
		const { conversationId } = req?.params;

		if (!conversationId) {
			return res.status(404).json({ message: 'Not Found' });
		}
		
		/* Deal with DB here */
		const conversation = await Conversation.findOne({
			_id: conversationId,
			participants: userId,
		});
		
		if (!conversation?._id) return res.status(403).json({ message: 'Forbidden' });

		const messages = await Message.find({ conversation: conversationId }).populate(
			'sender',
			'username'
		);

		await Conversation.updateOne(
			{ _id: conversationId, 'lastReadAt.user': userId },
			{
				$set: { 'lastReadAt.$.date': new Date() },
			}
		);

		await Conversation.updateOne(
			{
				_id: conversationId,
				'lastReadAt.user': { $ne: userId },
			},
			{
				$push: {
					lastReadAt: {
						user: userId,
						date: new Date(),
					},
				},
			}
		);
		/* end */

		res.json(messages);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Server error' });
	}
};

module.exports = { getConversations, getMessages };
