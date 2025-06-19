const express = require("express");
const { scheduleEmails, scheduleTelegramMessage } = require("./jobs/scheduler");
const connectDB = require("./config/db");
const logger = require("./utils/logger");
const path = require("path");
// const sendTestEmail = require("./utils/sendTestEmail");
const emailLogsRoute = require("./routes/emailLogs");
const messageLogsRoute = require("./routes/messageLogs");
const dashboardRoute = require("./routes/dashboard");
require("dotenv").config();
// require("./bot/telegramBot"); // starts bot
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

app.get("/", dashboardRoute);

app.use("/api/logs", emailLogsRoute);
app.use("/api/logs", messageLogsRoute);

if (process.env.NODE_ENV === "development") {
  //sendTestEmail();
}

app.listen(PORT, () => {
  console.log(`🚀 Server started on http://localhost:${PORT}`);
});
