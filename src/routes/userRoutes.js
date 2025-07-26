const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const auth = require('../middlewares/auth'); 
const upload = require('../middlewares/upload');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile', auth, userController.getProfile);
router.patch('/avatar', auth, upload.single('avatar'), userController.updateAvatar);
module.exports = router;
