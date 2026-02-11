const Dashboard = async (req,res) => {
   let user = req.session.user;
   res.render('admin/dashboard',{user, title: 'Dashboard'});
}



module.exports = Dashboard;