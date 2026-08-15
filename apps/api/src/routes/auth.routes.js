const express = require('express');

const { authenticate } = require('../middleware/authenticate');
const { authService } = require('../services/auth.service');
const { asyncHandler } = require('../utils/async-handler');
const { findNotificationsByUserId, markAllAsRead } = require('../data/notifications.repository');

const authRouter = express.Router();

authRouter.post(
  '/signup',
  asyncHandler(async (req, res) => {
    const result = await authService.signup(req.body);

    res.status(201).json({
      success: true,
      message: 'User account created successfully.',
      data: result,
    });
  }),
);

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);

    res.json({
      success: true,
      message: 'Login successful.',
      data: result,
    });
  }),
);

authRouter.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({
      success: true,
      data: { user: req.user },
    });
  }),
);

authRouter.get(
  '/user',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json(req.user);
  }),
);

authRouter.patch(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await authService.updateProfile(req.user.id, req.body);

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: { user },
    });
  }),
);

authRouter.get(
  '/notifications',
  authenticate,
  asyncHandler(async (req, res) => {
    const notifications = await findNotificationsByUserId(req.user.id);
    // Sort descending by timestamp
    notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json({
      success: true,
      data: { notifications },
    });
  }),
);

authRouter.patch(
  '/notifications/read-all',
  authenticate,
  asyncHandler(async (req, res) => {
    const { markAllAsRead } = require('../data/notifications.repository');
    await markAllAsRead(req.user.id);
    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  }),
);

authRouter.patch(
  '/notifications/:id/read',
  authenticate,
  asyncHandler(async (req, res) => {
    const { markAsRead } = require('../data/notifications.repository');
    await markAsRead(req.params.id, req.user.id);
    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  }),
);

module.exports = { authRouter };
