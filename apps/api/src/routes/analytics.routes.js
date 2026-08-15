const express = require('express');

const { authenticate } = require('../middleware/authenticate');
const { getUserAnalytics, logStudyTime } = require('../data/analytics.repository');
const { asyncHandler } = require('../utils/async-handler');
const { ApiError } = require('../utils/api-error');

const analyticsRouter = express.Router();

analyticsRouter.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const analytics = await getUserAnalytics(req.user.id);
    res.json({ success: true, data: { analytics } });
  }),
);

analyticsRouter.patch(
  '/study-time',
  authenticate,
  asyncHandler(async (req, res) => {
    const { minutes } = req.body;
    
    if (typeof minutes !== 'number' || minutes <= 0) {
      throw new ApiError(400, 'minutes must be a positive number');
    }

    const timeData = await logStudyTime(req.user.id, minutes);

    res.json({
      success: true,
      message: 'Study time logged.',
      data: { studyTime: timeData },
    });
  }),
);

module.exports = { analyticsRouter };
