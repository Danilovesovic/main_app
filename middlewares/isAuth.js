function isAuth(req, res, next) {
   if(!req.session.user){
       // admin ili superadmin
     return   res.redirect('/');
   }
   next();
}


module.exports = isAuth;

