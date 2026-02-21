function isSuperadmin(req, res, next) {

if(req.session.user && req.session.user.role === 'superadmin'){
        return next();
    } 
        res.redirect('/login');
    

  //  if (req.session.user.role !== "superadmin"){
  //    return  false;
  //  }
  //  next();
}


module.exports = isSuperadmin;