const express = require("express");
const { scheduleEmails, scheduleTelegramMessage } = require("./jobs/scheduler");
const connectDB = require("./config/db");
const logger = require("./utils/logger");
const path = require("path");
const cron = require("node-cron");
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

const MAX_RETRIES = 3;
const INITIAL_DELAY = 2000; // 2 seconds

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryOperation(operation, operationName, retryCount = 0) {
  try {
    return await operation();
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      const delay = INITIAL_DELAY * Math.pow(2, retryCount);
      logger.warn(`${operationName} failed (attempt ${retryCount + 1}/${MAX_RETRIES + 1}): ${error.message}. Retrying in ${delay}ms...`);
      await sleep(delay);
      return retryOperation(operation, operationName, retryCount + 1);
    }
    logger.error(`${operationName} failed after ${MAX_RETRIES + 1} attempts: ${error.message}`);
    throw error;
  }
}

(async () => {
  try {
    await retryOperation(
      () => connectDB(),
      "Database connection"
    );
    logger.info("✅ Database connected successfully");

    // Schedule Telegram messages with retry
    await retryOperation(
      () => {
        scheduleTelegramMessage();
        return Promise.resolve();
      },
      "Telegram message scheduling"
    );
    logger.info("✅ Telegram messages scheduled");

    // Optionally schedule emails
    // await retryOperation(
    //   () => {
    //     scheduleEmails();
    //     return Promise.resolve();
    //   },
    //   "Email scheduling"
    // );
  } catch (error) {
    logger.error("❌ Failed to initialize application:", error);
    process.exit(1);
  }
})();

app.use("/logs", express.static(path.join(__dirname, "logs")));

app.get("/", (req, res) => {
  res.status(200).send("server is up!");
});

app.use("/api/logs", emailLogsRoute);
app.use("/api/logs", messageLogsRoute);
app.use("/api/dashboard", dashboardRoute);

if (process.env.NODE_ENV === "development") {
  // sendTestQuestionToAdmin();
}

// Retry failed messages every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  try {
    await retryOperation(
      () => retryFailedMessages(),
      "Retry failed messages"
    );
  } catch (error) {
    logger.error("Failed to retry messages:", error);
  }
});

app.listen(PORT, () => {
  logger.info(`🚀 Server started on http://localhost:${PORT}`);
});
