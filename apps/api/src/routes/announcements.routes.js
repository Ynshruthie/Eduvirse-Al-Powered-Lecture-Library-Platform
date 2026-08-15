const express = require('express');

const { authenticate } = require('../middleware/authenticate');
const { getAnnouncementsByCourseIds, getAnnouncementsByTeacherId, createAnnouncement } = require('../data/announcements.repository');
const { findEnrollmentsByUserId } = require('../data/enrollments.repository');
const { asyncHandler } = require('../utils/async-handler');
const { ApiError } = require('../utils/api-error');

const announcementsRouter = express.Router();

announcementsRouter.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    // If student, get their enrolled courses and fetch announcements for them
    if (req.user.role === 'student') {
      const enrollments = await findEnrollmentsByUserId(req.user.id);
      const courseIds = enrollments.map(e => e.courseId);
      
      if (courseIds.length === 0) {
        return res.json({ success: true, data: { announcements: [] } });
      }

      const announcements = await getAnnouncementsByCourseIds(courseIds);
      return res.json({ success: true, data: { announcements } });
    }
    
    // If teacher, return announcements created by this teacher
    if (req.user.role === 'teacher') {
      const announcements = await getAnnouncementsByTeacherId(req.user.id);
      return res.json({ success: true, data: { announcements } });
    }

    return res.json({ success: true, data: { announcements: [] } });
  }),
);

announcementsRouter.post(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    if (req.user.role !== 'teacher') {
      throw new ApiError(403, 'Only teachers can create announcements');
    }

    const { courseId, title, message } = req.body;
    if (!courseId || !title || !message) {
      throw new ApiError(400, 'courseId, title, and message are required');
    }

    const announcement = await createAnnouncement({
      teacherId: req.user.id,
      teacherName: req.user.name,
      courseId,
      title,
      message
    });

    try {
      const { findAllEnrollments } = require('../data/enrollments.repository');
      const { createNotification } = require('../data/notifications.repository');
      const { getIO } = require('../socket');
      const { coursesService } = require('../services/courses.service');
      
      const enrollments = await findAllEnrollments();
      let courseEnrollments = [];
      
      if (courseId.startsWith('category:')) {
        const categoryName = courseId.replace('category:', '');
        const categoryCourses = await coursesService.listCourses({ category: categoryName });
        const categoryCourseIds = categoryCourses.map(c => c._id || c.id);
        
        courseEnrollments = enrollments.filter(e => categoryCourseIds.includes(e.courseId));
      } else {
        courseEnrollments = enrollments.filter(e => e.courseId === courseId);
      }
      
      // Remove duplicate students if they are enrolled in multiple courses in the category
      const uniqueStudentIds = [...new Set(courseEnrollments.map(e => e.userId))];
      const io = getIO();
      
      uniqueStudentIds.forEach(async (userId) => {
        // Create permanent notification
        await createNotification({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          userId: userId,
          title: `New Announcement in course`,
          body: title,
          read: false,
          time: new Date().toISOString(),
          type: 'announcement'
        });

        // Emit realtime event
        io.to(`dashboard_user_${userId}`).emit('new_announcement', {
          ...announcement,
          courseTitle: title
        });
      });
    } catch (error) {
      console.error('Error broadcasting announcement:', error);
    }

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully.',
      data: { announcement },
    });
  }),
);

module.exports = { announcementsRouter };
