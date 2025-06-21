# Boterview

**Boterview** is a Node.js-based system that sends technical and non-technical interview questions to users via email and Telegram multiple times a day. It helps users stay consistent with interview preparation by delivering questions regularly and reinforcing learning through scheduled reminders.

---

## Features

* Sends carefully selected interview questions multiple times a day.
* Supports delivery through both email and Telegram.
* Users can choose specific subjects to focus on.
* Scheduling is handled using `node-cron`, with five deliveries each day.
* Markdown support for well-formatted answers, including code highlighting.
* Command-line tools for managing users and their subject preferences.
* Input validation for email formats and subject names.

---

## Tech Stack

* Node.js
* MongoDB (with Mongoose)
* Nodemailer (for emails)
* Telegram Bot API (`node-telegram-bot-api`)
* Marked (Markdown rendering)
* Cron jobs using `node-cron`

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/lakshaykamat/boterview.git
cd boterview
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a `.env` file

```
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password
EMAIL_TO=recipient@example.com
TELEGRAM_TOKEN=your-telegram-bot-token
NODE_ENV=development
MONGO_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/database-name?retryWrites=true&w=majority
```

---

## Scheduling Questions

Questions are sent five times a day using cron jobs. Here’s the current schedule (24-hour format):

| Time  | Description      |
| ----- | ---------------- |
| 09:00 | Morning push     |
| 11:00 | Mid-morning      |
| 13:00 | Afternoon        |
| 15:00 | Mid-afternoon    |
| 18:00 | Evening delivery |

Make sure to call both `scheduleEmails()` and `scheduleTelegram()` from the main server file to enable this.

---

## Message Format

* Emails use a clean, responsive HTML layout.
* Telegram messages support Markdown formatting.
* Code snippets are syntax-highlighted and easy to read.

---

## Future Improvements

* Web dashboard for managing users and question topics
* Feedback collection from users on each question
* Admin panel for adding and editing questions with version history

---

## Contributing

Contributions are welcome. Feel free to fork the project, suggest improvements, or fix bugs through pull requests.

---

## Author

**Lakshay Kamat**
