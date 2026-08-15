const { app } = require('./app');
const { env } = require('./config/env');
const { bootstrapStorage } = require('./data/users.repository');
const { bootstrapEnrollmentStorage } = require('./data/enrollments.repository');
const { bootstrapCommentsStorage } = require('./data/comments.repository');
const { bootstrapNotificationsStorage } = require('./data/notifications.repository');
const { bootstrapAssignmentsStorage } = require('./data/assignments.repository');
const { bootstrapQuizzesStorage } = require('./data/quizzes.repository');
const { bootstrapAnalyticsStorage } = require('./data/analytics.repository');
const { bootstrapLectureSummariesStorage } = require('./data/lecture-summaries.repository');
const { logger } = require('./lib/logger');
const { setupSocketIO } = require('./socket');

async function startServer() {
  await bootstrapStorage();
  await bootstrapEnrollmentStorage();
  await bootstrapCommentsStorage();
  await bootstrapNotificationsStorage();
  await bootstrapAssignmentsStorage();
  await bootstrapQuizzesStorage();
  await bootstrapAnalyticsStorage();
  await bootstrapLectureSummariesStorage();

  const server = app.listen(env.port, () => {
    logger.info(`API server listening on http://localhost:${env.port}`);
  });

  const io = setupSocketIO(server);

  const shutdown = (signal) => {
    logger.info(`${signal} received. Shutting down gracefully.`);
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

startServer().catch((error) => {
  logger.error('Failed to start API server', error);
  process.exit(1);
});
