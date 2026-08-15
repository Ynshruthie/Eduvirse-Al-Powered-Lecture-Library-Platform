const express = require('express');

const { authenticate } = require('../middleware/authenticate');
const { teacherPortalsService } = require('../services/teacher-portals.service');
const { asyncHandler } = require('../utils/async-handler');

const teacherPortalsRouter = express.Router();

teacherPortalsRouter.post(
  '/uploads',
  authenticate,
  express.raw({ type: '*/*', limit: '100mb' }),
  asyncHandler(async (req, res) => {
    const file = await teacherPortalsService.uploadMedia(req.user, {
      buffer: req.body,
      originalName: decodeURIComponent(req.headers['x-file-name'] || 'upload.bin'),
      mimeType: req.headers['x-file-type'] || req.headers['content-type'],
      kind: req.headers['x-upload-kind'],
    });

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully.',
      data: { file },
    });
  }),
);

teacherPortalsRouter.get(
  '/mine',
  authenticate,
  asyncHandler(async (req, res) => {
    const courses = await teacherPortalsService.listTeacherCourses(req.user.id);

    res.json({
      success: true,
      data: { courses },
    });
  }),
);

teacherPortalsRouter.get(
  '/students',
  authenticate,
  asyncHandler(async (req, res) => {
    const students = await teacherPortalsService.getTeacherStudents(req.user.id);

    res.json({
      success: true,
      data: { students },
    });
  }),
);

teacherPortalsRouter.get(
  '/comments',
  authenticate,
  asyncHandler(async (req, res) => {
    const comments = await teacherPortalsService.getTeacherComments(req.user.id);
    res.json({ success: true, data: { comments } });
  }),
);

teacherPortalsRouter.post(
  '/comments/:id/reply',
  authenticate,
  asyncHandler(async (req, res) => {
    const comment = await teacherPortalsService.replyToComment(req.user.id, req.params.id, req.body.text);
    res.json({ success: true, data: { comment } });
  }),
);

teacherPortalsRouter.patch(
  '/comments/:id/resolve',
  authenticate,
  asyncHandler(async (req, res) => {
    const comment = await teacherPortalsService.resolveComment(req.user.id, req.params.id);
    res.json({ success: true, data: { comment } });
  }),
);

teacherPortalsRouter.delete(
  '/comments/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    await teacherPortalsService.deleteTeacherComment(req.user.id, req.params.id);
    res.json({ success: true });
  }),
);

teacherPortalsRouter.post(
  '/courses/:id/recordings',
  authenticate,
  asyncHandler(async (req, res) => {
    const course = await teacherPortalsService.addCourseRecording(req.user.id, req.params.id, req.body);
    res.json({ success: true, data: { course } });
  }),
);

module.exports = { teacherPortalsRouter };
