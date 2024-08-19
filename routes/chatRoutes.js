const express = require("express");
const { sendMessage, saveChatInfo, getChatInfo } = require("../controllers/chatController");
const router = express.Router();

router.post("/", sendMessage);
router.post("/threadId", saveChatInfo);
router.get("/threadId", getChatInfo);

module.exports = router;
