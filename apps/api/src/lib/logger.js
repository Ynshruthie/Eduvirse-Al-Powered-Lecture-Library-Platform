function formatMessage(level, message) {
  return `[${new Date().toISOString()}] ${level.toUpperCase()} ${message}`;
}

const logger = {
  info(message) {
    console.log(formatMessage('info', message));
  },
  warn(message, error) {
    console.warn(formatMessage('warn', message));

    if (error) {
      console.warn(error);
    }
  },
  error(message, error) {
    console.error(formatMessage('error', message));

    if (error) {
      console.error(error);
    }
  },
};

module.exports = { logger };
