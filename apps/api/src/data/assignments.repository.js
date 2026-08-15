const fs = require('fs/promises');
const path = require('path');
const { randomUUID } = require('crypto');
const { getIO } = require('../socket');

const storagePath = path.resolve(__dirname, '../storage/assignments.json');

async function bootstrapAssignmentsStorage() {
  await fs.mkdir(path.dirname(storagePath), { recursive: true });

  try {
    await fs.access(storagePath);
  } catch (_error) {
    await fs.writeFile(storagePath, '[]\n', 'utf8');
  }
}

async function readAssignments() {
  await bootstrapAssignmentsStorage();
  const content = await fs.readFile(storagePath, 'utf8');
  return JSON.parse(content);
}

async function writeAssignments(assignments) {
  await fs.writeFile(storagePath, `${JSON.stringify(assignments, null, 2)}\n`, 'utf8');
}

async function getAssignmentsByCourseIds(courseIds) {
  const assignments = await readAssignments();
  return assignments.filter(a => courseIds.includes(a.courseId)).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
}

async function createAssignment(assignmentData) {
  const assignments = await readAssignments();
  
  const newAssignment = {
    id: `assignment-${randomUUID()}`,
    ...assignmentData,
    createdAt: new Date().toISOString()
  };
  
  assignments.push(newAssignment);
  await writeAssignments(assignments);

  try {
    const io = getIO();
    io.to('dashboard_global').emit('new_assignment', {
      title: newAssignment.title,
      date: new Date(newAssignment.dueDate).toLocaleDateString(),
      color: 'text-indigo-500 bg-indigo-500/10' // default color for UI
    });
  } catch (err) {
    console.warn('Socket.IO not initialized, skipping event emission');
  }

  return newAssignment;
}

module.exports = {
  bootstrapAssignmentsStorage,
  getAssignmentsByCourseIds,
  createAssignment
};
