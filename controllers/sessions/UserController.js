const UserController = async (req, res) => {
	const user = req.session.user;

	if (!user?._id) {
		return res.status(401).json({ msg: 'Unauthorized' });
	}

	res.status(200).json({ id: user._id, username: user.username, role: user.role });
};

module.exports = UserController;
