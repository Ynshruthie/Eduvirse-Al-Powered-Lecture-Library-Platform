const express = require('express');
const lectureController = require('../controllers/lecture.controller');

const lecturesRouter = express.Router();

// Upload a lecture file for transcription and AI processing
lecturesRouter.post(
  '/upload',
  lectureController.uploadMiddleware,
  lectureController.uploadLecture.bind(lectureController)
);

// Get the AI generated summary for a lecture
lecturesRouter.get(
  '/:lectureId/summary',
  lectureController.getSummary.bind(lectureController)
);

module.exports = { lecturesRouter };
