const express = require('express');

const { authenticate } = require('../middleware/authenticate');
const { enrollmentsService } = require('../services/enrollments.service');
const { coursesService } = require('../services/courses.service');
const { asyncHandler } = require('../utils/async-handler');

const enrollmentsRouter = express.Router();

enrollmentsRouter.use(authenticate);

enrollmentsRouter.get(
  '/teacher-stats',
  asyncHandler(async (req, res) => {
    const stats = await enrollmentsService.getTeacherStats(req.user.id, req.user.name);
    res.json({
      success: true,
      data: stats,
    });
  }),
);

enrollmentsRouter.get(
  '/me',
  asyncHandler(async (req, res) => {
    const enrollments = await enrollmentsService.listForUser(req.user.id);

    res.json({
      success: true,
      data: { enrollments },
    });
  }),
);

enrollmentsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const enrollment = await enrollmentsService.enrollUser(req.user.id, req.body.courseId);

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course.',
      data: { enrollment },
    });
  }),
);

enrollmentsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await enrollmentsService.removeEnrollment(req.user.id, req.params.id);

    res.json({
      success: true,
      message: 'Successfully unenrolled from course.',
    });
  }),
);

enrollmentsRouter.patch(
  '/:courseId/progress',
  asyncHandler(async (req, res) => {
    const updated = await enrollmentsService.updateProgress(
      req.user.id,
      req.params.courseId,
      req.body.completedLectures
    );

    res.json({
      success: true,
      message: 'Progress updated successfully.',
      data: { enrollment: updated },
    });
  }),
);

module.exports = { enrollmentsRouter };
