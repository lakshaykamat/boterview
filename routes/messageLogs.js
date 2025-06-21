logs.forEach((log, index) => {
  const istDate = new Date(log.sentAt.getTime() + 5.5 * 60 * 60 * 1000);
  const timestamp = istDate.toISOString().replace("T", " ").slice(0, 19).replace(/-/g, "/");

  const isBroadcast = !log.questionId;
  const user = log.userId?.email || `Chat ID: ${log.chatId}`;
  const status = log.success ? "Success" : "Failed";

  output += `#${index + 1} ${isBroadcast ? "[Broadcast]" : ""}\n`;
  output += `- Time       : ${timestamp} IST\n`;
  output += `- Status     : ${status}\n`;
  output += `- Recipient  : ${user}\n`;

  if (!isBroadcast) {
    output += `- Subject    : ${log.questionId.subject || "N/A"}\n`;
    output += `- QuestionID : ${log.questionId._id?.toString() || "N/A"}\n`;
  }

  output += `- Message    :\n${log.text}\n`;

  if (!log.success) {
    output += `- Error      : ${log.error}\n`;
  }

  output += `--------------------------------------------------\n\n`;
});
