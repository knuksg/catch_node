const OpenAIAssistantClient = require("../services/openAIClient");
const db = require("../config/db");

const sendMessage = async (req, res) => {
    const { message, assistantId, threadId } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    const openAIClient = new OpenAIAssistantClient(process.env.OPENAI_API_KEY);

    try {
        // assistantId가 제공되면 설정, 아니면 기본값 사용
        if (assistantId) {
            openAIClient.setAssistantId(assistantId);
        }

        // threadId가 제공되면 설정, 아니면 새로 생성
        if (threadId) {
            openAIClient.setThreadId(threadId);
        } else {
            await openAIClient.createNewThread();
        }

        const response = await openAIClient.sendMessage(message);

        // // 파일에 메시지와 응답 저장
        // const logFileName = `chat_${threadId || openAIClient.getThreadId()}.txt`;
        // const logFilePath = path.join(__dirname, "logs", logFileName);

        // const logMessage = `User: ${message}\nChatGPT: ${
        //     typeof response === "object" ? response.response : response
        // }\n\n`;

        // // 디렉터리 확인 후 없으면 생성
        // if (!fs.existsSync(path.dirname(logFilePath))) {
        //     fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
        // }

        // // 메시지와 응답을 파일에 추가
        // fs.appendFileSync(logFilePath, logMessage);

        if (typeof response === "object") {
            res.json({
                response: response.response,
                function_name: response.function_name,
                value: response.value,
                assistantId: openAIClient.getAssistantId(),
                threadId: openAIClient.getThreadId(),
            });
        } else {
            res.json({
                response: response,
                assistantId: openAIClient.getAssistantId(),
                threadId: openAIClient.getThreadId(),
            });
        }
    } catch (error) {
        console.error("Error in sendMessage:", error);
        res.status(500).json({ error: error.message });
    }
};

const saveChatInfo = async (req, res) => {
    const uid = req.uid; // 인증 미들웨어에서 설정된 uid 사용
    const { assistantId, threadId } = req.body;

    if (!uid || !assistantId || !threadId) {
        return res.status(400).json({ error: "uid, assistantId, and threadId are required" });
    }

    try {
        await db.query(
            `INSERT INTO chat_info (uid, assistant_id, thread_id, created_at)
             VALUES (?, ?, ?, NOW())
             ON DUPLICATE KEY UPDATE
             assistant_id = VALUES(assistant_id),
             thread_id = VALUES(thread_id),
             created_at = NOW()`,
            [uid, assistantId, threadId]
        );
        res.status(200).send({ message: "Conversation saved successfully" });
    } catch (error) {
        console.error("Error in saveConversation:", error);
        res.status(500).json({ error: "Failed to save conversation" });
    }
};

const getChatInfo = async (req, res) => {
    const uid = req.uid; // 인증 미들웨어에서 설정된 uid 사용

    try {
        const [results] = await db.query(`SELECT assistant_id, thread_id FROM chat_info WHERE uid = ?`, [uid]);
        if (results.length > 0) {
            res.status(200).send(results[0]);
        } else {
            res.status(200).send({ assistant_id: null, thread_id: null });
        }
    } catch (error) {
        console.error("Error in getConversation:", error);
        res.status(500).json({ error: "Failed to load conversation" });
    }
};

// 서버 시작 시 삭제 이벤트 생성
createDeletionEvent();

module.exports = { sendMessage, saveChatInfo, getChatInfo };
