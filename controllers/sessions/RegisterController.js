const User = require('../../models/User');
const bcrypt = require('bcryptjs');


const RegisterController = async (req, res) => {
    const {username, email, password} = req.body;

    try {

        const testUser = await User.findOne({email}); // {}
        console.log(testUser)
        if (testUser) {
            return res.status(400).json({msg: 'User already exists'});
        }
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);
        const newUser = new User({username, email, password: hashPassword, profileImage: '/assets/profiles/default.png', role: "admin", main: false });
        await newUser.save();
        // ???
        res.redirect('/');
    } catch (error) {
        console.log(error.message);
        res.redirect('/register');

    }
}

module.exports = RegisterController;