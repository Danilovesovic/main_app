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
    //AKo je baza prazna, prvi User ce biti main Superadmin koga nece moci niko da obrise
    let allUsers = await User.find({});
    let emptyBase = (allUsers.length === 0) ? true : false;

    const user =await User.create({
        username,
        email,
        password,
        role,
        main: emptyBase,
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
const updateFlag = async (req, res) => {
    try {
        const { userId } = req.params;       // _id korisnika
        const { flag } = req.body;       // nova boja

        const user = await User.findByIdAndUpdate(userId, { flag }, { new: true });
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.status(200).json({ msg: 'Flag updated successfully', user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Something went wrong' });
    }
};
const updateRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        const user = await User.findByIdAndUpdate(
            userId,
            { role },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.status(200).json({ user });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};





module.exports = {
    index,
    create,
    store,
    destroy,
    updateFlag,
    updateRole
}