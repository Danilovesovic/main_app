const express = require("express");
const router = express.Router();
const isAuth = require("../middlewares/isAuth");
router.use("/", require("./session-routes"));
// router.use('/admin', require('../middlewares/isAuth'));
router.use("/admin", isAuth, require("./admin-routes"));

//route for 404 page -nikola
router.use(require("../middlewares/404"));
module.exports = router;
