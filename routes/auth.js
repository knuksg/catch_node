var express = require("express");
var router = express.Router();
const db = require("../config/db");

// 로그인 시 유저 정보 확인 및 등록 로직
router.post("/login", async function (req, res, next) {
    const { uid, email } = req.body;
    console.log("uid: " + uid + ", email: " + email);

    if (!uid || !email) {
        return res.status(400).json({ error: "UID와 이메일을 모두 제공해야 합니다." });
    }

    try {
        // 1. 유저가 데이터베이스에 존재하는지 확인
        const user = await db.query("SELECT * FROM users WHERE uid = ?", [uid]);
        console.log("user: " + user);

        if (user.length > 0) {
            // 유저가 이미 존재하는 경우
            return res.status(200).json({ message: "유저가 이미 존재합니다.", user: user[0] });
        } else {
            // 2. 유저가 존재하지 않으면 등록
            await db.query("INSERT INTO users (uid, email) VALUES (?, ?)", [uid, email]);
            const newUser = await db.query("SELECT * FROM users WHERE uid = ?", [uid]);
            return res.status(201).json({ message: "새 유저가 등록되었습니다.", user: newUser[0] });
        }
    } catch (err) {
        console.error("데이터베이스 에러:", err);
        return res.status(500).json({ error: "서버 에러가 발생했습니다." });
    }
});

module.exports = router;
