const User = require('../../models/User');

const Messages = async (req, res) => {
	const users = await User.find({});
	const sessionUser = req.session.user;

	res.render('admin/messages', { title: 'Messages', user: sessionUser, users });
};

module.exports = Messages;
