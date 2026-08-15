const { courseCatalog } = require('../data/course-catalog');
const { findEnrollmentsByUserId } = require('../data/enrollments.repository');
const { teacherPortalsService } = require('./teacher-portals.service');
const lecturesRepository = require('../data/lectures.repository');
const commentsRepository = require('../data/comments.repository');
const teacherPortalsRepository = require('../data/teacher-portals.repository');
const { ApiError } = require('../utils/api-error');

function normalizeCourse(course) {
  return {
    ...course,
    id: course._id,
    enrollmentCount: course.enrollmentCount || 0,
  };
}

function matchesSearch(course, query) {
  const normalized = query.toLowerCase();
  return (
    course.title.toLowerCase().includes(normalized) ||
    course.description.toLowerCase().includes(normalized) ||
    (course.instructor?.name || '').toLowerCase().includes(normalized) ||
    (course.category || '').toLowerCase().includes(normalized)
  );
}

const coursesService = {
  async listCourses({ search, category, filter, limit }) {
    const teacherCourses = await teacherPortalsService.listPublishedTeacherCourses();
    let courses = [...teacherCourses];

    if (search) {
      courses = courses.filter((course) => matchesSearch(course, search));
    }

    if (category && category.toLowerCase() !== 'all') {
      courses = courses.filter((course) => (course.category || '').toLowerCase() === category.toLowerCase());
    }

    if (filter === 'premium') {
      courses = courses.filter((course) => course.premium);
    }

    if (filter === 'live') {
      courses = courses.filter((course) => course.live);
    }

    if (limit) {
      return courses.slice(0, Number(limit));
    }

    return courses;
  },

  async getCourseById(id) {
    const teacherCourses = await teacherPortalsService.listPublishedTeacherCourses();
    const course = [...teacherCourses].find((entry) => entry._id === id || entry.id === id);

    if (!course) {
      throw new ApiError(404, 'Course not found.');
    }

    return normalizeCourse(course);
  },

  async incrementCourseViews(id) {
    const course = await this.getCourseById(id);
    const newViews = (course.views || 0) + 1;
    await teacherPortalsRepository.updateTeacherPortalItem(id, { views: newViews });
    return newViews;
  },

  async getCourseLectures(id) {
    try {
      const lectures = await lecturesRepository.listLecturesByCourse(id);
      return lectures || [];
    } catch (e) {
      // Fallback if supabase not configured or table missing
      return [];
    }
  },

  async getCourseQa(id) {
    const allComments = await commentsRepository.findAllComments();
    return allComments.filter(comment => comment.courseId === id);
  },

  async postCourseQa(id, qaData) {
    const newComment = {
      id: Date.now().toString(),
      courseId: id,
      ...qaData,
      replies: qaData.replies || [],
      date: new Date().toISOString()
    };
    return await commentsRepository.createComment(newComment);
  },

  async getRelatedCourses(category, id, limit = 3) {
    const teacherCourses = await teacherPortalsService.listPublishedTeacherCourses();
    return [...teacherCourses]
      .filter((course) => (course.category || '').toLowerCase() === (category || '').toLowerCase())
      .filter((course) => course._id !== id && course.id !== id)
      .slice(0, Number(limit));
  },

  async getCategories() {
    const counts = new Map();
    const teacherCourses = await teacherPortalsService.listPublishedTeacherCourses();

    [...teacherCourses].forEach((course) => {
      const current = counts.get(course.category) || 0;
      counts.set(course.category, current + 1);
    });

    return Array.from(counts.entries()).map(([name, courseCount]) => ({ name, courseCount }));
  },

  async getDashboardForUser(user) {
    const enrollments = await findEnrollmentsByUserId(user.id);

    return {
      enrollments: await Promise.all(
        enrollments.map(async (enrollment) => ({
          ...enrollment,
          course: await this.getCourseById(enrollment.courseId),
        })),
      ),
    };
  },

  async getCoursesByTeacher(teacherId, teacherName) {
    const createdCourses = await teacherPortalsService.listTeacherCourses(teacherId);

    return [...createdCourses];
  },
};

module.exports = { coursesService };
