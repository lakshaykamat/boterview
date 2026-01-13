const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize, errors } = format;
const fs = require('fs');
const path = require('path');

// Custom log format
const customFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} | ${level} | ${stack || message}`;
});

// Create logs directory if it doesn't exist (with error handling for serverless)
const logsDir = path.join(__dirname, '../logs');
try {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
} catch (err) {
  // In serverless environments, directory creation might fail
  // We'll fall back to console-only logging
  console.warn('Could not create logs directory, using console-only logging:', err.message);
}

const loggerTransports = [
  new transports.Console({
    format: combine(colorize(), customFormat)
  })
];

// Only add file transports if logs directory exists and is writable
if (fs.existsSync(logsDir)) {
  try {
    loggerTransports.push(
      new transports.File({ filename: path.join(logsDir, 'error.log'), level: 'error' }),
      new transports.File({ filename: path.join(logsDir, 'combined.log') })
    );
  } catch (err) {
    console.warn('Could not initialize file transports:', err.message);
  }
}

const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    customFormat
  ),
  transports: loggerTransports,
  exceptionHandlers: fs.existsSync(logsDir) ? [
    new transports.File({ filename: path.join(logsDir, 'exceptions.log') })
  ] : [
    new transports.Console({ format: combine(colorize(), customFormat) })
  ],
  rejectionHandlers: fs.existsSync(logsDir) ? [
    new transports.File({ filename: path.join(logsDir, 'rejections.log') })
  ] : [
    new transports.Console({ format: combine(colorize(), customFormat) })
  ]
});

module.exports = logger;
