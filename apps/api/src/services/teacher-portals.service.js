const crypto = require('crypto');

const {
  createTeacherPortalItem,
  deleteTeacherPortalItem,
  findTeacherPortalItemById,
  listTeacherPortalItems,
  listTeacherPortalItemsByTeacher,
  saveUploadedFile,
  updateTeacherPortalItem,
} = require('../data/teacher-portals.repository');
const { findAllEnrollments } = require('../data/enrollments.repository');
const { findUsersByIds } = require('../data/users.repository');
const { findAllComments, updateComment, deleteComment: repoDeleteComment, createComment } = require('../data/comments.repository');
const { ApiError } = require('../utils/api-error');

function ensureNonEmpty(value, message) {
  const normalized = String(value || '').trim();

  if (!normalized) {
    throw new ApiError(400, message);
  }

  return normalized;
}

function normalizePrice(value, fallback = 0) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new ApiError(400, 'Price values must be valid positive numbers.');
  }

  return parsed;
}

function toNormalizedTags(tags) {
  if (!Array.isArray(tags)) {
    return [];
  }

  return tags
    .map((tag) => String(tag || '').trim())
    .filter(Boolean)
    .slice(0, 20);
}

function normalizeCourseRecord(item) {
  return {
    ...item,
    id: item._id,
    enrollmentCount: item.enrollmentCount || 0,
  };
}

const teacherPortalsService = {
  async uploadMedia(user, file) {
    if (!file || !file.buffer || !file.buffer.length) {
      throw new ApiError(400, 'A file is required.');
    }

    const upload = await saveUploadedFile({
      teacherId: user.id,
      originalName: file.originalName,
      mimeType: file.mimeType,
      buffer: file.buffer,
      kind: file.kind,
    });

    return upload;
  },

  async listTeacherCourses(teacherId) {
    const items = await listTeacherPortalItemsByTeacher(teacherId);
    
    // Dynamically calculate enrollments for accuracy
    const { findAllEnrollments } = require('../data/enrollments.repository');
    const allEnrollments = await findAllEnrollments();
    
    return items.map(item => {
      const courseId = item._id || item.id;
      const count = allEnrollments.filter(e => e.courseId === courseId).length;
      return {
        ...normalizeCourseRecord(item),
        enrollmentCount: Math.max(item.enrollmentCount || 0, count)
      };
    });
  },

  async listPublishedTeacherCourses() {
    const items = await listTeacherPortalItems();
    
    // Dynamically calculate enrollments for accuracy
    const { findAllEnrollments } = require('../data/enrollments.repository');
    const allEnrollments = await findAllEnrollments();
    
    return items
      .filter((item) => item.status === 'published')
      .map(item => {
        const courseId = item._id || item.id;
        const count = allEnrollments.filter(e => e.courseId === courseId).length;
        return {
          ...normalizeCourseRecord(item),
          enrollmentCount: Math.max(item.enrollmentCount || 0, count)
        };
      });
  },

  async getTeacherStudents(teacherId) {
    const courses = await this.listTeacherCourses(teacherId);
    const courseIds = courses.map(c => c.id);

    if (!courseIds.length) {
      return [];
    }

    const enrollments = await findAllEnrollments();
    const relevantEnrollments = enrollments.filter(e => courseIds.includes(e.courseId));
    
    // Get unique user IDs
    const userIds = [...new Set(relevantEnrollments.map(e => e.userId))];

    if (!userIds.length) {
      return [];
    }

    const users = await findUsersByIds(userIds);
    
    return users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`,
      videosWatched: Math.floor(Math.random() * 50), // Mock data since we don't track video watching yet
      premiumStatus: 'Active',
      subEndDate: new Date(Date.now() + 31536000000).toISOString().split('T')[0], // 1 year from now
      progress: Math.floor(Math.random() * 100)
    }));
  },

  async getTeacherComments(teacherId) {
    const comments = await findAllComments();
    return comments.filter(c => c.teacherId === teacherId);
  },

  async replyToComment(teacherId, commentId, replyText) {
    const comments = await findAllComments();
    const comment = comments.find(c => c.id === commentId);

    if (!comment) throw new ApiError(404, 'Comment not found');
    if (comment.teacherId !== teacherId) throw new ApiError(403, 'Unauthorized');

    const newReply = {
      id: crypto.randomUUID(),
      text: replyText,
      timestamp: new Date().toISOString()
    };

    const updatedReplies = [...(comment.replies || []), newReply];
    
    return await updateComment(commentId, {
      replies: updatedReplies,
      status: 'Resolved'
    });
  },

  async resolveComment(teacherId, commentId) {
    const comments = await findAllComments();
    const comment = comments.find(c => c.id === commentId);

    if (!comment) throw new ApiError(404, 'Comment not found');
    if (comment.teacherId !== teacherId) throw new ApiError(403, 'Unauthorized');

    return await updateComment(commentId, { status: 'Resolved' });
  },

  async deleteTeacherComment(teacherId, commentId) {
    const comments = await findAllComments();
    const comment = comments.find(c => c.id === commentId);

    if (!comment) throw new ApiError(404, 'Comment not found');
    if (comment.teacherId !== teacherId) throw new ApiError(403, 'Unauthorized');

    await repoDeleteComment(commentId);
  },

  async createRecordedCourse(user, payload) {
    const now = new Date().toISOString();
    const status = payload.status === 'draft' ? 'draft' : 'published';
    const title = ensureNonEmpty(payload.title, 'Course title is required.');
    const description = ensureNonEmpty(payload.description, 'Course description is required.');
    const subject = ensureNonEmpty(payload.subject, 'Subject is required.');
    const videoUrl = ensureNonEmpty(payload.videoUrl, 'A video upload or import URL is required.');

    const course = {
      _id: `teacher-course-${crypto.randomUUID()}`,
      teacherId: user.id,
      title,
      description,
      instructor: { name: user.name, userId: user.id },
      category: `${String(payload.classLevel || '').trim() || 'General'} - ${subject}`.replace(/^ - /, ''),
      price: payload.priceType === 'paid' ? normalizePrice(payload.price, 0) : 0,
      discountPrice:
        payload.priceType === 'paid' && payload.discountPrice !== undefined && payload.discountPrice !== null && payload.discountPrice !== ''
          ? normalizePrice(payload.discountPrice, 0)
          : null,
      rating: 0,
      reviews: [],
      thumbnail: payload.thumbnailUrl || null,
      premium: payload.priceType === 'paid',
      live: false,
      status,
      visibility: String(payload.visibility || 'public'),
      tags: toNormalizedTags(payload.tags),
      classLevel: String(payload.classLevel || '').trim(),
      subject,
      exam: String(payload.exam || '').trim(),
      learnings: Array.isArray(payload.learnings)
        ? payload.learnings.map((item) => String(item || '').trim()).filter(Boolean)
        : [],
      videos: [
        {
          id: `video-${crypto.randomUUID()}`,
          title,
          duration: String(payload.videoDuration || '').trim() || '00:00',
          url: videoUrl,
          sourceType: payload.videoSourceType === 'url' ? 'url' : 'upload',
        },
      ],
      chapters: Array.isArray(payload.chapters)
        ? payload.chapters
            .map((chapter, index) => ({
              id: `chapter-${index + 1}`,
              title: String(chapter?.title || '').trim(),
              time: String(chapter?.time || '').trim(),
            }))
            .filter((chapter) => chapter.title || chapter.time)
        : [],
      enrollmentCount: 0,
      views: 0,
      scheduleTime: payload.scheduleTime || null,
      isPremiere: !!payload.isPremiere,
      createdAt: now,
      updatedAt: now,
      contentType: 'video',
    };

    return normalizeCourseRecord(await createTeacherPortalItem(course));
  },

  async createLiveCourse(user, payload) {
    const now = new Date().toISOString();
    const status = payload.status === 'draft' ? 'draft' : 'published';
    const title = ensureNonEmpty(payload.title, 'Course title is required.');
    const description = ensureNonEmpty(payload.description, 'Course description is required.');
    const subject = ensureNonEmpty(payload.subject, 'Subject is required.');
    const startDate = ensureNonEmpty(payload.startDate, 'Start date is required.');
    const endDate = ensureNonEmpty(payload.endDate, 'End date is required.');
    const classTime = ensureNonEmpty(payload.classTime, 'Class time is required.');

    const course = {
      _id: `teacher-live-course-${crypto.randomUUID()}`,
      teacherId: user.id,
      title,
      description,
      instructor: { name: user.name, userId: user.id },
      category: `${String(payload.classLevel || '').trim() || 'General'} - ${subject}`.replace(/^ - /, ''),
      price: payload.priceType === 'paid' ? normalizePrice(payload.price, 0) : 0,
      discountPrice:
        payload.priceType === 'paid' && payload.discountPrice !== undefined && payload.discountPrice !== null && payload.discountPrice !== ''
          ? normalizePrice(payload.discountPrice, 0)
          : null,
      rating: 0,
      reviews: [],
      thumbnail: payload.thumbnailUrl || null,
      premium: payload.priceType === 'paid',
      live: true,
      status,
      tags: toNormalizedTags(payload.tags),
      classLevel: String(payload.classLevel || '').trim(),
      subject,
      schedule: {
        startDate,
        endDate,
        classTime,
        activeDays: Array.isArray(payload.activeDays)
          ? payload.activeDays.map((day) => String(day || '').trim()).filter(Boolean)
          : [],
      },
      roadmapClasses: Array.isArray(payload.roadmapClasses)
        ? payload.roadmapClasses.map((roadmapClass, index) => ({
            id: roadmapClass?.id || `roadmap-${index + 1}`,
            date: String(roadmapClass?.date || '').trim(),
            time: String(roadmapClass?.time || '').trim(),
            topic: String(roadmapClass?.topic || '').trim(),
            objective: String(roadmapClass?.objective || '').trim(),
          }))
        : [],
      enrollmentCount: 0,
      createdAt: now,
      updatedAt: now,
      contentType: 'live',
    };

    return normalizeCourseRecord(await createTeacherPortalItem(course));
  },

  async deleteTeacherCourse(user, courseId) {
    const course = await findTeacherPortalItemById(courseId);

    if (!course) {
      throw new ApiError(404, 'Course not found.');
    }

    if (course.teacherId !== user.id) {
      throw new ApiError(403, 'You can only delete your own courses.');
    }

    await deleteTeacherPortalItem(courseId);
  },

  async updateTeacherCourseStatus(user, courseId, status) {
    const course = await findTeacherPortalItemById(courseId);

    if (!course) {
      throw new ApiError(404, 'Course not found.');
    }

    if (course.teacherId !== user.id) {
      throw new ApiError(403, 'You can only update your own courses.');
    }

    const updatedCourse = await updateTeacherPortalItem(courseId, {
      status: status === 'draft' ? 'draft' : 'published',
      updatedAt: new Date().toISOString(),
    });

    return normalizeCourseRecord(updatedCourse);
  },

  async addCourseRecording(teacherId, courseId, recordingData) {
    const course = await findTeacherPortalItemById(courseId);
    if (!course) throw new ApiError(404, 'Course not found.');
    if (course.teacherId !== teacherId) throw new ApiError(403, 'Unauthorized.');

    const pastRecordings = course.pastRecordings || [];
    pastRecordings.push({
      id: crypto.randomUUID(),
      title: recordingData.title || `Recording - ${new Date().toLocaleDateString()}`,
      videoUrl: recordingData.videoUrl,
      createdAt: new Date().toISOString()
    });

    const updatedCourse = await updateTeacherPortalItem(courseId, {
      pastRecordings,
      updatedAt: new Date().toISOString(),
    });

    return normalizeCourseRecord(updatedCourse);
  },
};

module.exports = { teacherPortalsService };
