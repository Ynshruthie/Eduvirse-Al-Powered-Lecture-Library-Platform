const fs = require('fs/promises');
const path = require('path');

const storagePath = path.resolve(__dirname, '../storage/enrollments.json');

async function bootstrapEnrollmentStorage() {
  await fs.mkdir(path.dirname(storagePath), { recursive: true });

  try {
    await fs.access(storagePath);
  } catch (_error) {
    await fs.writeFile(storagePath, '[]\n', 'utf8');
  }
}

async function readEnrollments() {
  await bootstrapEnrollmentStorage();
  const content = await fs.readFile(storagePath, 'utf8');
  return JSON.parse(content);
}

async function writeEnrollments(enrollments) {
  await fs.writeFile(storagePath, `${JSON.stringify(enrollments, null, 2)}\n`, 'utf8');
}

async function findEnrollmentsByUserId(userId) {
  const enrollments = await readEnrollments();
  return enrollments.filter((enrollment) => enrollment.userId === userId);
}

async function findEnrollmentById(id) {
  const enrollments = await readEnrollments();
  return enrollments.find((enrollment) => enrollment.id === id) || null;
}

async function findEnrollmentByUserAndCourse(userId, courseId) {
  const enrollments = await readEnrollments();
  return enrollments.find((enrollment) => enrollment.userId === userId && enrollment.courseId === courseId) || null;
}

async function createEnrollment(enrollment) {
  const enrollments = await readEnrollments();
  enrollments.push(enrollment);
  await writeEnrollments(enrollments);
  return enrollment;
}

async function deleteEnrollment(id) {
  const enrollments = await readEnrollments();
  const next = enrollments.filter((enrollment) => enrollment.id !== id);
  await writeEnrollments(next);
}

async function findAllEnrollments() {
  const enrollments = await readEnrollments();
  return enrollments;
}

async function countStudentsForCourses(courseIds) {
  const enrollments = await readEnrollments();
  const userIds = new Set(
    enrollments
      .filter((e) => courseIds.includes(e.courseId))
      .map((e) => e.userId)
  );
  return userIds.size;
}

async function updateEnrollment(id, updates) {
  const enrollments = await readEnrollments();
  const index = enrollments.findIndex((enrollment) => enrollment.id === id);
  if (index === -1) return null;
  enrollments[index] = { ...enrollments[index], ...updates };
  await writeEnrollments(enrollments);
  return enrollments[index];
}

module.exports = {
  bootstrapEnrollmentStorage,
  createEnrollment,
  deleteEnrollment,
  findAllEnrollments,
  findEnrollmentById,
  findEnrollmentByUserAndCourse,
  findEnrollmentsByUserId,
  countStudentsForCourses,
  updateEnrollment,
};
