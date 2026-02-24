const User = require('../../models/User');
const Task = require('../../models/Task');

const index =async (req, res) => {

    if (!req.session.user) {
        return res.redirect('/login');
    }
    let allTasks =await Task.find({
        $or : [
            {assignedTo: req.session.user._id},
            {assignedBy: req.session.user._id},
            {public: true}
        ]
    }).populate('assignedTo')
        .populate('assignedBy');


    res.render('admin/task/index', { tasks: allTasks, title: 'Task', user: req.session.user || null, pageScript: '/js/admin/task-index.js' });
}
const create =async (req, res) => {
    const users = await User.find({})
   res.render('admin/task/create', {
       users,
       title: 'Create Task',
       user: req.session.user});
}

const store =async (req,res) => {
    let {title, description, assignedTo, public} = req.body;
    const task =await Task.create({
        title,
        description,
        assignedTo,
        public: public === "on",
        assignedBy : req.session.user._id

    });

    console.log(req.body)
    res.redirect('/admin/task');
};

const destroy =async (req,res) => {
    try {
        let id = req.params.id;
        let task = await Task.findById(id);
        let user = req.session.user;
        if (!task.isOwner(req.session.user._id) && (user.role !== 'superadmin')) {
            return res.status(401).json({msg: 'Upsss neces moci'});
        }
        let deleted = await Task.findByIdAndDelete(id); // stop
        console.log(deleted)
        res.status(200).json({msg: 'Task deleted successfully'});
    }catch (error) {
        console.log(error.message)
        res.status(500).json({msg: 'Something went wrong'});
    }
}

module.exports = {
    index, create, store, destroy
}

