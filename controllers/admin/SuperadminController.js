const User = require('../../models/User');

const index =async (req, res) => {
    let allUsers =await User.find({});
   res.render('admin/superadmin/index', { 
        users: allUsers,
        title: "Superuser",
        user: req.session.user  
    });
}
const create = async (req, res) => {
    let allUsers =await User.find({});
  
   res.render('admin/superadmin/create', {
       users: allUsers,
       title: 'Create User',
       user: req.session.user});
}
const store =async (req,res) => {
    let {username, email, password, role,flag} = req.body;
    const user =await User.create({
        username,
        email,
        password,
        role,
        flag 

    });

    console.log(req.body)
    res.redirect('/admin/superadmin');
};

const destroy =async (req,res) => {
    try {
        let { id } = req.params;    // MongoDB _id
        // let user = await User.findById(id); 
      
        let deleted = await User.findByIdAndDelete(id);
        
        if(!deleted) {
            // Ako korisnik ne postoji
            return res.status(404).json({ msg: 'User not found' });
        }
        console.log('Obrisan korisnik:',deleted)
        res.status(200).json({msg: 'User deleted successfully'});
    }catch (error) {
        console.log(error.message)
        res.status(500).json({msg: 'Something went wrong'});
    }
}


module.exports = {
    index,
    create,
    store,
    destroy
}