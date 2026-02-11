const express = require('express');
const router = express.Router();

router.use('/', require('./session-routes'));
router.use('/admin', require('../middlewares/isAuth'));
router.use('/admin', require('./admin-routes'));

module.exports = router;