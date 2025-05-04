# 📬 Interview Mailer

**Interview Mailer** is a Node.js-based system that sends technical and non-technical interview questions to users via email multiple times a day. It helps users prepare for interviews by consistently delivering questions and reinforcing learning through reminders.

---

## ✨ Features

* 📧 **Automated Emailing**: Sends curated interview questions multiple times daily.
* 🧠 **Subjects by Choice**: Users receive questions based on selected subjects.
* 📅 **Scheduled Delivery**: Uses `node-cron` to schedule email sends (5 times/day).
* 🧾 **Markdown Support**: Renders answers using markdown with code highlighting.
* 🧑‍💻 **CLI User Management**: Easily add, update, or list users and subjects.
* 🛡️ **Validation**: Ensures valid email formats and allowed subject names.

---

## 📦 Tech Stack

* Node.js
* MongoDB (via Mongoose)
* Nodemailer
* Marked (Markdown parser)
* Cron Jobs (`node-cron`)

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/interview-mailer.git
cd interview-mailer
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env` file

```
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password
EMAIL_TO=recipient@example.com
NODE_ENV=development
MONGO_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/database-name?retryWrites=true&w=majority
```

---

## 📅 Scheduling Emails

Emails are sent 5 times per day via cron:

| Time (24h) | Description   |
| ---------- | ------------- |
| 09:00      | Morning Push  |
| 11:00      | Mid-Morning   |
| 13:00      | Afternoon     |
| 15:00      | Mid-Afternoon |
| 18:00      | Evening       |

To enable scheduling, make sure `scheduleEmails()` is called in your main server file.

---

## 👤 Managing Users

### Add or Update User

```bash
node scripts/manageUser.js add
```

### List Users

```bash
node scripts/manageUser.js list
```

---

## 📬 Email Template

* Clean, responsive HTML template
* Code blocks styled with syntax highlighting
* Minimal, readable design

---

## 🛠️ Future Improvements

* Web dashboard for managing users and subjects
* User feedback system on questions
* Admin panel to add new questions easily

---

## 🤝 Contributing

Feel free to fork and open pull requests. Bug fixes and improvements are welcome!

---

## 🧑‍💼 Author

**Lakshay Kamat**

