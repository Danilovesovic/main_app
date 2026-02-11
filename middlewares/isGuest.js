function isGuest(req, res, next) {
    if(req.session.user){
        return   res.redirect('/admin/dashboard');
    }
    next();
}


module.exports = isGuest;
