const express = require('express');
const lectureController = require('../controllers/lecture.controller');

const chatRouter = express.Router();

chatRouter.post('/', lectureController.chat.bind(lectureController));

module.exports = { chatRouter };
