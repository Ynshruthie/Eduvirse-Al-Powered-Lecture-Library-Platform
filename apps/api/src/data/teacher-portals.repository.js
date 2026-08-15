const fs = require('fs/promises');
const path = require('path');

const storagePath = path.resolve(__dirname, '../storage/teacher-portals.json');
const uploadsRootPath = path.resolve(__dirname, '../storage/uploads');

async function ensureTeacherPortalStorage() {
  await fs.mkdir(path.dirname(storagePath), { recursive: true });
  await fs.mkdir(uploadsRootPath, { recursive: true });

  try {
    await fs.access(storagePath);
  } catch (_error) {
    await fs.writeFile(storagePath, '[]\n', 'utf8');
  }
}

async function readTeacherPortalItems() {
  await ensureTeacherPortalStorage();
  const content = await fs.readFile(storagePath, 'utf8');
  return JSON.parse(content);
}

async function writeTeacherPortalItems(items) {
  await fs.writeFile(storagePath, `${JSON.stringify(items, null, 2)}\n`, 'utf8');
}

function sanitizeSegment(value, fallback = 'file') {
  const sanitized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return sanitized || fallback;
}

function getExtension(originalName, mimeType) {
  const extFromName = path.extname(String(originalName || '')).trim();
  if (extFromName) {
    return extFromName.toLowerCase();
  }

  const mimeToExtension = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'video/ogg': '.ogg',
    'application/pdf': '.pdf',
  };

  return mimeToExtension[String(mimeType || '').toLowerCase()] || '';
}

async function saveUploadedFile({ teacherId, originalName, mimeType, buffer, kind = 'asset' }) {
  await ensureTeacherPortalStorage();

  const safeTeacherId = sanitizeSegment(teacherId, 'teacher');
  const safeKind = sanitizeSegment(kind, 'asset');
  const timestamp = Date.now();
  const extension = getExtension(originalName, mimeType);
  const baseName = sanitizeSegment(path.basename(originalName || 'upload', extension), 'upload');
  const relativePath = path.join(safeTeacherId, `${safeKind}-${timestamp}-${baseName}${extension}`);
  const absolutePath = path.join(uploadsRootPath, relativePath);

  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, buffer);

  return {
    path: relativePath.split(path.sep).join('/'),
    url: `/media/${relativePath.split(path.sep).join('/')}`,
    name: originalName || `${baseName}${extension}`,
    mimeType: mimeType || 'application/octet-stream',
    size: buffer.length,
  };
}

async function listTeacherPortalItems() {
  return readTeacherPortalItems();
}

async function listTeacherPortalItemsByTeacher(teacherId) {
  const items = await readTeacherPortalItems();
  return items.filter((item) => item.teacherId === teacherId);
}

async function findTeacherPortalItemById(id) {
  const items = await readTeacherPortalItems();
  return items.find((item) => item._id === id || item.id === id) || null;
}

async function createTeacherPortalItem(item) {
  const items = await readTeacherPortalItems();
  items.push(item);
  await writeTeacherPortalItems(items);
  return item;
}

async function updateTeacherPortalItem(id, updates) {
  const items = await readTeacherPortalItems();
  const index = items.findIndex((item) => item._id === id || item.id === id);

  if (index === -1) {
    return null;
  }

  items[index] = { ...items[index], ...updates };
  await writeTeacherPortalItems(items);
  return items[index];
}

async function deleteTeacherPortalItem(id) {
  const items = await readTeacherPortalItems();
  const nextItems = items.filter((item) => item._id !== id && item.id !== id);
  await writeTeacherPortalItems(nextItems);
}

module.exports = {
  createTeacherPortalItem,
  deleteTeacherPortalItem,
  findTeacherPortalItemById,
  listTeacherPortalItems,
  listTeacherPortalItemsByTeacher,
  saveUploadedFile,
  updateTeacherPortalItem,
  uploadsRootPath,
};
