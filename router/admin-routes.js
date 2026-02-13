const TaskController = require('../controllers/admin/TaskController.js');
const express = require('express');
const router = express.Router();

router.get('/dashboard', require('../controllers/admin/DashboardController.js'))
router.get('/task', TaskController.index)

router.get('/task/create',TaskController.create)

router.post('/task', TaskController.store)


router.delete('/task/:id', TaskController.destroy)

router.get('/messages', require('../controllers/admin/MessagesController.js'))

module.exports = router;