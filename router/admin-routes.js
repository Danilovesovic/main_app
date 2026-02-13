const TaskController = require('../controllers/admin/TaskController.js');
const SuperadminController = require('../controllers/admin/SuperadminController.js');
const isSuperadmin = require('../middlewares/isSuperadmin');
const express = require('express');
const router = express.Router();

router.get('/dashboard', require('../controllers/admin/DashboardController.js'))
router.get('/task', TaskController.index)

router.get('/task/create',TaskController.create)

router.post('/task', TaskController.store)


router.delete('/task/:id', TaskController.destroy)


router.get('/superadmin', isSuperadmin, SuperadminController.index)
router.get('/superadmin/create', SuperadminController.create)
router.post('/superadmin', SuperadminController.store)
router.delete('/superadmin/:id', SuperadminController.destroy)

router.patch('/superadmin/:userId/flag', SuperadminController.updateFlag)




module.exports = router;


