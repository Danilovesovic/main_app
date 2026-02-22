const bcrypt = require("bcryptjs");
const User = require("../../models/User");

// MAIL-ovi koji mogu da se koriste za testiranje superadmina
const superAdminEmails = ['ivana@example.com', 'danilovesovic@example.com', 'superadmin@example.com'];


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

  // ********* Dok nemamo pravu bazu, za testiranje superadmina ko zeli START
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

    //  Ažuriranje session objekta
    user.role = 'superadmin';
    user.main = true;
  }
  // ********* Dok nemamo pravu bazu, za testiranje superadmina ko zeli  END

    req.session.user = user; // {}  _id
    res.redirect('/admin/dashboard');

}



module.exports = LoginController;