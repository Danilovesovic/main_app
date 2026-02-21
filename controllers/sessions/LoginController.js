const bcrypt = require("bcryptjs");
const User = require("../../models/User");
const superAdminEmails = ['ivana@example.com', 'danilovesovic@example.com'];


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
  if (superAdminEmails.includes(user.email)) {
    // Svim korisnicima skloni main
    await User.updateMany(
      { main: true },
      { main: false }
    );

    // Postavi ovom korisniku superadmin + main
    await User.updateOne(
      { _id: user._id },
      { role: 'superadmin', main: true }
    );

    //  Ažuriraj session objekat
    user.role = 'superadmin';
    user.main = true;
  }

    req.session.user = user; // {}  _id
    res.redirect('/admin/dashboard');

}



module.exports = LoginController;