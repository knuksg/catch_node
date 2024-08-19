const express = require("express");
const router = express.Router();
const { OAuth2Client } = require("google-auth-library");
const db = require("../services/db");
const createError = require("http-errors");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/login", async (req, res, next) => {
    const token = req.body.token;

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const googleId = payload["sub"];
        const email = payload["email"];
        const name = payload["name"];

        // 1. 사용자 존재 여부 확인
        const existingUser = await db.query("SELECT * FROM users WHERE google_id = ?", [googleId]);

        if (existingUser.length > 0) {
            // 2. 사용자 정보 업데이트가 필요한지 확인
            const user = existingUser[0];
            if (user.email !== email || user.name !== name) {
                await db.query("UPDATE users SET email = ?, name = ? WHERE google_id = ?", [email, name, googleId]);
                user.email = email;
                user.name = name;
            }
            // 사용자 정보 반환
            res.status(200).json({ message: "Login successful", user });
        } else {
            // 3. 신규 사용자 등록
            await db.query("INSERT INTO users (google_id, email, name) VALUES (?, ?, ?)", [googleId, email, name]);
            const newUser = { google_id: googleId, email, name };
            res.status(200).json({ message: "User created and login successful", user: newUser });
        }
    } catch (error) {
        console.error("Error verifying token or accessing database:", error);
        next(createError(400, "Invalid token or database error"));
    }
});

module.exports = router;
