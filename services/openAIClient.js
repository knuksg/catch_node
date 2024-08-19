// const OpenAI = require("openai");

// class OpenAIAssistantClient {
//     constructor(apiKey) {
//         this.openai = new OpenAI({ apiKey });
//         this.assistantId = null;
//         this.threadId = null;
//     }

//     setAssistantId(assistantId) {
//         this.assistantId = assistantId;
//     }

//     setThreadId(threadId) {
//         this.threadId = threadId;
//     }

//     getAssistantId() {
//         return this.assistantId;
//     }

//     getThreadId() {
//         return this.threadId;
//     }

//     async createNewThread() {
//         const thread = await this.openai.beta.threads.create();
//         this.threadId = thread.id;
//     }

//     async createOrGetAssistant() {
//         if (!this.assistantId) {
//             const assistant = await this.openai.beta.assistants.create({
//                 name: "Weight Tracker",
//                 instructions: `You are a helpful assistant for tracking weight. When the user mentions today's weight,
//                     respond with a JSON String containing the function name "create_weight", the weight value
//                     provided by the user, and your response. The JSON String should be in the format:
//                     {
//                         "function_name": "create_weight",
//                         "value": "{weight}",
//                         "response": "{your_response}"
//                     }
//                     Ensure the value field contains only numbers. For other weight-related contexts,
//                     respond in a regular conversational manner.`,
//                 model: "gpt-4-turbo-preview",
//             });
//             this.assistantId = assistant.id;
//         }
//         return this.assistantId;
//     }

//     async sendMessage(message, retry = true) {
//         if (!this.assistantId) {
//             await this.createOrGetAssistant();
//         }

//         if (!this.threadId) {
//             await this.createNewThread();
//         }

//         // 메시지 추가
//         await this.openai.beta.threads.messages.create(this.threadId, {
//             role: "user",
//             content: message,
//         });

//         // Run 생성 및 완료 대기
//         const run = await this.openai.beta.threads.runs.create(this.threadId, {
//             assistant_id: this.assistantId,
//         });

//         let runStatus;
//         const startTime = Date.now();
//         const timeout = 1000; // 1초

//         try {
//             do {
//                 if (Date.now() - startTime > timeout) {
//                     throw new Error("Timeout while waiting for run to complete.");
//                 }
//                 await new Promise((resolve) => setTimeout(resolve, 1000));
//                 runStatus = await this.openai.beta.threads.runs.retrieve(this.threadId, run.id);
//             } while (runStatus.status !== "completed");

//             // 응답 메시지 검색
//             const messages = await this.openai.beta.threads.messages.list(this.threadId);
//             const assistantMessage = messages.data.find((msg) => msg.role === "assistant");

//             if (assistantMessage) {
//                 const value = assistantMessage.content[0].text.value;
//                 try {
//                     // 백틱을 제거하고 JSON 파싱
//                     const jsonValue = JSON.parse(value.replace(/```json\n|```/g, ""));
//                     return jsonValue;
//                 } catch (e) {
//                     // If parsing fails, return the value as a string
//                     return value;
//                 }
//             } else {
//                 throw new Error("No response from assistant.");
//             }
//         } catch (error) {
//             if (retry) {
//                 console.log("Timeout occurred, creating a new thread and retrying...");
//                 await this.createNewThread();
//                 return this.sendMessage(message, false); // retrying with new thread
//             } else {
//                 throw error;
//             }
//         }
//     }
// }

// module.exports = OpenAIAssistantClient;
