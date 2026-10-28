const express = require('express');
const router  = express.Router();
const { signup, login, getMe, getWorkers, registerWorker } = require('../controllers/authController');
const { authMiddleware, adminOnly } = require('../middleware/auth');

router.post('/signup',   signup);
router.post('/login',    login);
router.get('/me',        authMiddleware, getMe);
router.get('/workers',   authMiddleware, adminOnly, getWorkers);
router.post('/register', authMiddleware, adminOnly, registerWorker);

module.exports = router;
