const bcrypt = require("bcryptjs");
const User = require("../../models/User");

const LoginController = async (req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if(!user){
      return  res.redirect('/');
    }
    const bpass =await bcrypt.compare(password,user.password); // true
    if(!bpass){
      return res.redirect('/');
    }

    req.session.user = user; // {}  _id
    res.redirect('/admin/dashboard');

}



module.exports = LoginController;