const express = require("express");
const { scheduleEmails, scheduleTelegramMessage } = require("./jobs/scheduler");
const connectDB = require("./config/db");
const logger = require("./utils/logger");
const path = require("path");
const cron = require("node-cron");
// const sendTestEmail = require("./utils/sendTestEmail");
const emailLogsRoute = require("./routes/emailLogs");
const messageLogsRoute = require("./routes/messageLogs");
const dashboardRoute = require("./routes/dashboard");
const retryFailedMessages = require("./controllers/retryFailedMessages");
const sendTestQuestionToAdmin = require("./tests/testMessage");
require("dotenv").config();
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection:", reason);
});

const app = express();
const PORT = process.env.PORT || 3000;
(async () => {
  await connectDB();
  //scheduleEmails();
  scheduleTelegramMessage();
})();
app.use("/logs", express.static(path.join(__dirname, "logs")));

app.get("/", (req,res)=>res.status(200).send("server is up!"));

app.use("/api/logs", emailLogsRoute);
app.use("/api/logs", messageLogsRoute);

if (process.env.NODE_ENV === "development") {
  sendTestQuestionToAdmin();
}
cron.schedule("*/5 * * * *", retryFailedMessages); // every 5 minutes
app.listen(PORT, () => {
  console.log(`🚀 Server started on http://localhost:${PORT}`);
});
