const express = require('express');

const { healthRouter } = require('./health.routes');
const { authRouter } = require('./auth.routes');
const { categoriesRouter } = require('./categories.routes');
const { coursesRouter } = require('./courses.routes');
const { enrollmentsRouter } = require('./enrollments.routes');
const { teacherPortalsRouter } = require('./teacher-portals.routes');
const { announcementsRouter } = require('./announcements.routes');
const { assignmentsRouter } = require('./assignments.routes');
const { quizzesRouter } = require('./quizzes.routes');
const { analyticsRouter } = require('./analytics.routes');
const { lecturesRouter } = require('./lectures.routes');
const { chatRouter } = require('./chat.routes');

const apiRouter = express.Router();

apiRouter.get('/', (_req, res) => {
  res.json({
    success: true,
    service: 'eduvirse-api',
    version: 'v1',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      categories: '/api/categories',
      courses: '/api/courses',
      enrollments: '/api/enrollments',
      teacherPortals: '/api/teacher-portals',
      announcements: '/api/announcements',
      lectures: '/api/lectures',
      chat: '/api/chat',
    },
  });
});

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/categories', categoriesRouter);
apiRouter.use('/courses', coursesRouter);
apiRouter.use('/enrollments', enrollmentsRouter);
apiRouter.use('/teacher-portals', teacherPortalsRouter);
apiRouter.use('/announcements', announcementsRouter);
apiRouter.use('/assignments', assignmentsRouter);
apiRouter.use('/quizzes', quizzesRouter);
apiRouter.use('/analytics', analyticsRouter);
apiRouter.use('/lectures', lecturesRouter);
apiRouter.use('/chat', chatRouter);

module.exports = { apiRouter };
