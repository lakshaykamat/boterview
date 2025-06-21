const TelegramBot = require("node-telegram-bot-api");
const handleStart = require("./handlers/start.handler");
const handleStop = require("./handlers/stop.handler");
const handleSettings = require("./handlers/setting.handler");
const handleAdmin = require("./handlers/admin.handler");
const handleMarkSeen = require("./handlers/handleSeen");
const handleHistory = require("./handlers/history.handler");

const TOKEN = process.env.TELEGRAM_BOT_TOKEN

// // File-based subscriber fallback (optional)
// const SUBSCRIBERS_FILE = path.join(__dirname, "../storage/subscribers.json");
// const loadSubscribers = () => fs.existsSync(SUBSCRIBERS_FILE)
//   ? new Set(JSON.parse(fs.readFileSync(SUBSCRIBERS_FILE)))
//   : new Set();
// const subscribedUsers = loadSubscribers();

// Init bot
const bot = new TelegramBot(TOKEN, { polling: true });

// Register handlers
handleStart(bot);
handleStop(bot);
handleSettings(bot)
handleAdmin(bot)
handleHistory(bot)
handleMarkSeen(bot)
module.exports = { bot };
