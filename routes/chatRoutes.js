const express = require('express');
const router = express.Router();
const { sendMessage } = require('../controllers/chatController');

// POST /api/chat — AI chatbox
router.post('/chat', sendMessage);

module.exports = router;
