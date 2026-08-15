const fs = require('fs/promises');
const path = require('path');
const { randomUUID } = require('crypto');
const { getIO } = require('../socket');

const storagePath = path.resolve(__dirname, '../storage/announcements.json');

async function bootstrapAnnouncementsStorage() {
  await fs.mkdir(path.dirname(storagePath), { recursive: true });

  try {
    await fs.access(storagePath);
  } catch (_error) {
    await fs.writeFile(storagePath, '[]\n', 'utf8');
  }
}

async function readAnnouncements() {
  await bootstrapAnnouncementsStorage();
  const content = await fs.readFile(storagePath, 'utf8');
  return JSON.parse(content);
}

async function writeAnnouncements(announcements) {
  await fs.writeFile(storagePath, `${JSON.stringify(announcements, null, 2)}\n`, 'utf8');
}

async function getAnnouncements() {
  return await readAnnouncements();
}

async function getAnnouncementsByCourseIds(courseIds) {
  const announcements = await readAnnouncements();
  return announcements.filter(a => courseIds.includes(a.courseId)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function getAnnouncementsByTeacherId(teacherId) {
  const announcements = await readAnnouncements();
  return announcements.filter(a => a.teacherId === teacherId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function createAnnouncement(announcementData) {
  const announcements = await readAnnouncements();
  
  const newAnnouncement = {
    id: `announcement-${randomUUID()}`,
    ...announcementData,
    createdAt: new Date().toISOString()
  };
  
  announcements.push(newAnnouncement);
  await writeAnnouncements(announcements);

  try {
    const io = getIO();
    io.to('dashboard_global').emit('new_announcement', newAnnouncement);
  } catch (err) {
    console.warn('Socket.IO not initialized, skipping event emission');
  }

  return newAnnouncement;
}

module.exports = {
  getAnnouncements,
  getAnnouncementsByCourseIds,
  getAnnouncementsByTeacherId,
  createAnnouncement
};
