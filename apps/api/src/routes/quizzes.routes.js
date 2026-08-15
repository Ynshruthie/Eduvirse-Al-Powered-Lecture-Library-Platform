const express = require('express');

const { authenticate } = require('../middleware/authenticate');
const { getQuizzesByCourseIds, createQuiz } = require('../data/quizzes.repository');
const { findEnrollmentsByUserId } = require('../data/enrollments.repository');
const { asyncHandler } = require('../utils/async-handler');
const { ApiError } = require('../utils/api-error');

const quizzesRouter = express.Router();

quizzesRouter.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    if (req.user.role === 'student') {
      const enrollments = await findEnrollmentsByUserId(req.user.id);
      const courseIds = enrollments.map(e => e.courseId);
      
      if (courseIds.length === 0) {
        return res.json({ success: true, data: { quizzes: [] } });
      }

      const quizzes = await getQuizzesByCourseIds(courseIds);
      return res.json({ success: true, data: { quizzes } });
    }
    
    return res.json({ success: true, data: { quizzes: [] } });
  }),
);

quizzesRouter.post(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    if (req.user.role !== 'teacher') {
      throw new ApiError(403, 'Only teachers can create quizzes');
    }

    const { courseId, title, date } = req.body;
    if (!courseId || !title || !date) {
      throw new ApiError(400, 'courseId, title, and date are required');
    }

    const quiz = await createQuiz({
      courseId,
      title,
      date
    });

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully.',
      data: { quiz },
    });
  }),
);

module.exports = { quizzesRouter };
