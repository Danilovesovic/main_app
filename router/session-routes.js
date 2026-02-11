const isGuest = require('../middlewares/isGuest');
const express = require('express');
const router = express.Router();

router.get('/',isGuest, function(req, res){
    res.render('index');
});

router.get('/register', isGuest, function(req, res){
    res.render('register');
});

router.get('/logout', function(req, res){
    req.session.destroy();
    res.redirect('/');
})

router.post('/login', require('../controllers/sessions/LoginController.js'))
router.post('/register', require('../controllers/sessions/RegisterController.js'))
module.exports = router;
