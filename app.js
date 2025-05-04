const express = require("express");
const scheduleEmails = require("./jobs/scheduler");
const connectDB = require("./config/db");
const logger = require("./utils/logger");
const path = require("path");
const sendTestEmail = require("./utils/sendTestEmail");
const emailLogsRoute = require("./routes/emailLogs")
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
  scheduleEmails();
})();

app.use("/logs", express.static(path.join(__dirname, "logs")));

app.get("/", (req, res) => {
  res.send("📨 Interview Question Email Server Running!");
});

app.use('/api/logs', emailLogsRoute);

if (process.env.NODE_ENV === "development") {
  //sendTestEmail();
}

app.listen(PORT, () => {
  console.log(`🚀 Server started on http://localhost:${PORT}`);
});
