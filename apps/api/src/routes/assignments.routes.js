const express = require('express');

const { authenticate } = require('../middleware/authenticate');
const { getAssignmentsByCourseIds, createAssignment } = require('../data/assignments.repository');
const { findEnrollmentsByUserId } = require('../data/enrollments.repository');
const { asyncHandler } = require('../utils/async-handler');
const { ApiError } = require('../utils/api-error');

const assignmentsRouter = express.Router();

assignmentsRouter.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    if (req.user.role === 'student') {
      const enrollments = await findEnrollmentsByUserId(req.user.id);
      const courseIds = enrollments.map(e => e.courseId);
      
      if (courseIds.length === 0) {
        return res.json({ success: true, data: { assignments: [] } });
      }

      const assignments = await getAssignmentsByCourseIds(courseIds);
      return res.json({ success: true, data: { assignments } });
    }
    
    return res.json({ success: true, data: { assignments: [] } });
  }),
);

assignmentsRouter.post(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    if (req.user.role !== 'teacher') {
      throw new ApiError(403, 'Only teachers can create assignments');
    }

    const { courseId, title, dueDate } = req.body;
    if (!courseId || !title || !dueDate) {
      throw new ApiError(400, 'courseId, title, and dueDate are required');
    }

    const assignment = await createAssignment({
      courseId,
      title,
      dueDate
    });

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully.',
      data: { assignment },
    });
  }),
);

module.exports = { assignmentsRouter };
