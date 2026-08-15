const express = require('express');

const { authenticate } = require('../middleware/authenticate');
const { coursesService } = require('../services/courses.service');
const { teacherPortalsService } = require('../services/teacher-portals.service');
const { asyncHandler } = require('../utils/async-handler');

const coursesRouter = express.Router();

coursesRouter.get(
  '/mine',
  authenticate,
  asyncHandler(async (req, res) => {
    const courses = await coursesService.getCoursesByTeacher(req.user.id, req.user.name);
    res.json({
      success: true,
      data: { courses },
    });
  }),
);

coursesRouter.post(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const course = await teacherPortalsService.createRecordedCourse(req.user, req.body);

    res.status(201).json({
      success: true,
      message: 'Course created successfully.',
      data: { course },
    });
  }),
);

coursesRouter.post(
  '/live',
  authenticate,
  asyncHandler(async (req, res) => {
    const course = await teacherPortalsService.createLiveCourse(req.user, req.body);

    res.status(201).json({
      success: true,
      message: 'Live course created successfully.',
      data: { course },
    });
  }),
);

coursesRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const courses = await coursesService.listCourses(req.query);

    res.json({
      success: true,
      data: { courses },
    });
  }),
);

coursesRouter.get(
  '/:id/related',
  asyncHandler(async (req, res) => {
    const course = await coursesService.getCourseById(req.params.id);
    const courses = await coursesService.getRelatedCourses(course.category, req.params.id, req.query.limit || 3);

    res.json({
      success: true,
      data: { courses },
    });
  }),
);

coursesRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const course = await coursesService.getCourseById(req.params.id);

    res.json({
      success: true,
      data: { course },
    });
  }),
);

coursesRouter.patch(
  '/:id/status',
  authenticate,
  asyncHandler(async (req, res) => {
    const course = await teacherPortalsService.updateTeacherCourseStatus(req.user, req.params.id, req.body.status);

    res.json({
      success: true,
      message: 'Course status updated successfully.',
      data: { course },
    });
  }),
);

coursesRouter.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    await teacherPortalsService.deleteTeacherCourse(req.user, req.params.id);

    res.json({
      success: true,
      message: 'Course deleted successfully.',
    });
  }),
);

coursesRouter.get(
  '/:id/lectures',
  asyncHandler(async (req, res) => {
    const lectures = await coursesService.getCourseLectures(req.params.id);
    res.json({
      success: true,
      data: { lectures },
    });
  }),
);

coursesRouter.get(
  '/:id/qa',
  asyncHandler(async (req, res) => {
    const qaList = await coursesService.getCourseQa(req.params.id);
    res.json({
      success: true,
      data: { qaList },
    });
  }),
);

coursesRouter.post(
  '/:id/qa',
  authenticate,
  asyncHandler(async (req, res) => {
    const qaData = req.body;
    // Inject user info if not present
    if (!qaData.author) qaData.author = req.user.name || 'Student';
    if (!qaData.avatar) qaData.avatar = req.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.user.name || 'Student')}`;
    
    const newQa = await coursesService.postCourseQa(req.params.id, qaData);
    res.status(201).json({
      success: true,
      data: { qa: newQa },
    });
  }),
);

coursesRouter.patch(
  '/:id/view',
  asyncHandler(async (req, res) => {
    const newViews = await coursesService.incrementCourseViews(req.params.id);
    res.json({
      success: true,
      data: { views: newViews },
    });
  }),
);

module.exports = { coursesRouter };
