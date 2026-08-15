const crypto = require('crypto');

const {
  createEnrollment,
  deleteEnrollment,
  findEnrollmentById,
  findEnrollmentByUserAndCourse,
  findEnrollmentsByUserId,
  countStudentsForCourses,
  updateEnrollment,
} = require('../data/enrollments.repository');
const { ApiError } = require('../utils/api-error');
const { coursesService } = require('./courses.service');

const enrollmentsService = {
  async listForUser(userId) {
    const enrollments = await findEnrollmentsByUserId(userId);

    return Promise.all(
      enrollments.map(async (enrollment) => ({
        ...enrollment,
        course: await coursesService.getCourseById(enrollment.courseId),
      })),
    );
  },

  async enrollUser(userId, courseId) {
    const course = await coursesService.getCourseById(courseId);

    const existing = await findEnrollmentByUserAndCourse(userId, courseId);
    if (existing) {
      return {
        ...existing,
        course,
      };
    }

    const enrollment = await createEnrollment({
      id: `enrollment-${crypto.randomUUID()}`,
      userId,
      courseId,
      progress: 0,
      completed: false,
      enrolledAt: new Date().toISOString(),
    });

    const { updateCourse } = require('../data/courses.repository');
    await updateCourse(courseId, { enrollmentCount: (course.enrollmentCount || 0) + 1 });

    return {
      ...enrollment,
      course: await coursesService.getCourseById(enrollment.courseId),
    };
  },

  async removeEnrollment(userId, enrollmentId) {
    const enrollment = await findEnrollmentById(enrollmentId);

    if (!enrollment || enrollment.userId !== userId) {
      throw new ApiError(404, 'Enrollment not found.');
    }

    await deleteEnrollment(enrollmentId);
  },
  async getTeacherStats(teacherId, teacherName) {
    const allCourses = await coursesService.getCoursesByTeacher(teacherId, teacherName);
    const courseIds = allCourses.map((c) => c._id || c.id);
    const studentCount = await countStudentsForCourses(courseIds);
    const courseCount = allCourses.length;
    
    // Compute total enrollments (non-unique)
    const { findAllEnrollments } = require('../data/enrollments.repository');
    const allEnrollments = await findAllEnrollments();
    const totalEnrollments = allEnrollments.filter(e => courseIds.includes(e.courseId)).length;

    return {
      studentCount,
      courseCount,
      totalEnrollments,
    };
  },
  async updateProgress(userId, courseId, completedLectures) {
    const enrollment = await findEnrollmentByUserAndCourse(userId, courseId);
    if (!enrollment) {
      throw new ApiError(404, 'Enrollment not found.');
    }
    const updated = await updateEnrollment(enrollment.id, { completedLectures });
    return updated;
  },
};

module.exports = { enrollmentsService };
