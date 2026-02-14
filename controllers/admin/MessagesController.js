const User = require('../../models/User');

const Messages = async (req, res) => {
	const sessionUser = req.session.user;
	const users = await User.find({ _id: { $ne: sessionUser._id } }).select('_id').select('username');

	res.render('admin/messages', { title: 'Messages', user: sessionUser, users });
};

module.exports = Messages;
