const TaskController = require('../controllers/admin/TaskController.js');
const PostController = require('../controllers/admin/PostController.js');
const ConversationController = require('../controllers/admin/ConversationController.js');
const uploadPostMedia = require('../middlewares/uploadPostMedia');
const ProfileController = require('../controllers/admin/ProfileController.js');
const upload = require('../middlewares/upload');
const SuperadminController = require('../controllers/admin/SuperadminController.js');
const isSuperadmin = require('../middlewares/isSuperadmin');
const express = require('express');
const router = express.Router();

// Profile routes
router.get('/profile', ProfileController.index);
router.post('/profile/upload', upload.single('profileImage'), ProfileController.uploadImage); // .single znaci da očekujemo jedan fajl oznacen sa name="profileImage" iz inputa forme
router.post('/profile/update', ProfileController.update);
// Edit profile (GET i POST)
router.get('/profile/edit', ProfileController.showEdit);
router.post('/profile/edit', ProfileController.update);

router.get('/dashboard', require('../controllers/admin/DashboardController.js'))
router.get('/task', TaskController.index)
router.get('/task/create',TaskController.create)
router.post('/task', TaskController.store)
router.delete('/task/:id', TaskController.destroy)

router.get('/social', PostController.index)
router.get('/social/create', PostController.create)
router.post('/social', uploadPostMedia.fields([{ name: 'images', maxCount: 10 }]), PostController.store)
router.delete('/social/:id', PostController.destroyPost)
router.post('/social/:id/favorite', PostController.toggleFavorite)
router.post('/social/:id/reaction', PostController.addReaction)
router.post('/social/:id/comment', PostController.addComment)
router.delete('/social/comment/:id', PostController.destroyComment)
router.post('/social/comment/:id/reaction', PostController.addCommentReaction)

router.get('/messages', require('../controllers/admin/MessagesController.js'));
router.get('/conversation', ConversationController.getConversations);
router.get('/message/:conversationId', ConversationController.getMessages);


router.get('/superadmin', isSuperadmin, SuperadminController.index)
router.get('/superadmin/create', SuperadminController.create)
router.post('/superadmin', SuperadminController.store)
router.delete('/superadmin/:id', SuperadminController.destroy)

router.patch('/superadmin/:userId/flag', SuperadminController.updateFlag)
router.patch('/superadmin/:userId/role', SuperadminController.updateRole);




module.exports = router;


