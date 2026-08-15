const { env } = require('../config/env');
const { logger } = require('../lib/logger');
const { ApiError } = require('../utils/api-error');

const storageProvider = env.supabaseUrl && env.supabaseServiceRoleKey ? 'supabase' : 'file';

function mapRowToLecture(row) {
  if (!row) return null;

  return {
    id: row.id,
    courseId: row.course_id,
    teacherId: row.teacher_id,
    title: row.title,
    description: row.description,
    videoUrl: row.video_url,
    duration: row.duration,
    order: row.order,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapLectureToRow(lecture) {
  return {
    id: lecture.id,
    course_id: lecture.courseId,
    teacher_id: lecture.teacherId,
    title: lecture.title,
    description: lecture.description,
    video_url: lecture.videoUrl,
    duration: lecture.duration,
    order: lecture.order,
    status: lecture.status,
    created_at: lecture.createdAt,
    updated_at: lecture.updatedAt,
  };
}

async function supabaseRequest(pathname, options = {}) {
  const url = new URL(`/rest/v1/${pathname}`, env.supabaseUrl);

  if (options.query) {
    Object.entries(options.query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value);
      }
    });
  }

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      apikey: env.supabaseServiceRoleKey,
      Authorization: `Bearer ${env.supabaseServiceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: options.prefer || 'return=representation',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    let details = null;
    try {
      details = await response.json();
    } catch (_err) {
      details = await response.text();
    }

    throw new ApiError(500, 'Supabase request failed.', {
      code: 'SUPABASE_REQUEST_FAILED',
      details: { status: response.status, response: details },
    });
  }

  if (response.status === 204) return null;
  return response.json();
}

async function bootstrapSupabaseStorage() {
  try {
    await supabaseRequest(env.supabaseLecturesTable, {
      query: { select: 'id', limit: '1' },
      headers: { Prefer: 'count=exact' },
    });
  } catch (error) {
    throw new ApiError(500, 'Supabase is configured, but the lectures table is not ready yet.', {
      code: 'SUPABASE_NOT_READY',
      details: error.details || error.message,
    });
  }
}

async function bootstrapStorage() {
  if (storageProvider === 'supabase') {
    await bootstrapSupabaseStorage();
    logger.info(`Lectures storage provider: ${storageProvider}`);
    return;
  }

  logger.info(`Lectures storage provider: ${storageProvider}`);
}

async function createLecture(lecture) {
  if (storageProvider !== 'supabase') {
    throw new ApiError(500, 'Supabase storage provider is required for lectures.');
  }

  const rows = await supabaseRequest(env.supabaseLecturesTable, {
    method: 'POST',
    body: mapLectureToRow(lecture),
  });

  if (!rows || rows.length === 0) {
    throw new ApiError(500, 'Failed to create lecture.');
  }

  try {
    logger.info('Created lecture in Supabase', { id: rows[0].id });
  } catch (_e) {}

  return mapRowToLecture(rows[0]);
}

async function findLectureById(id) {
  if (storageProvider !== 'supabase') {
    throw new ApiError(500, 'Supabase storage provider is required for lectures.');
  }

  const rows = await supabaseRequest(env.supabaseLecturesTable, {
    query: { select: '*', id: `eq.${id}`, limit: '1' },
  });

  if (rows && rows.length > 0) return mapRowToLecture(rows[0]);
  return null;
}

async function listLecturesByCourse(courseId) {
  if (storageProvider !== 'supabase') {
    throw new ApiError(500, 'Supabase storage provider is required for lectures.');
  }

  const rows = await supabaseRequest(env.supabaseLecturesTable, {
    query: { select: '*', course_id: `eq.${courseId}`, order: 'order.asc' },
  });

  if (!rows) return [];
  return rows.map(mapRowToLecture);
}

async function listLecturesByTeacher(teacherId) {
  if (storageProvider !== 'supabase') {
    throw new ApiError(500, 'Supabase storage provider is required for lectures.');
  }

  const rows = await supabaseRequest(env.supabaseLecturesTable, {
    query: { select: '*', teacher_id: `eq.${teacherId}`, order: 'created_at.desc' },
  });

  if (!rows) return [];
  return rows.map(mapRowToLecture);
}

async function updateLecture(id, updates) {
  if (storageProvider !== 'supabase') {
    throw new ApiError(500, 'Supabase storage provider is required for lectures.');
  }

  const rowUpdates = {};
  if (updates.title !== undefined) rowUpdates.title = updates.title;
  if (updates.description !== undefined) rowUpdates.description = updates.description;
  if (updates.videoUrl !== undefined) rowUpdates.video_url = updates.videoUrl;
  if (updates.duration !== undefined) rowUpdates.duration = updates.duration;
  if (updates.order !== undefined) rowUpdates.order = updates.order;
  if (updates.status !== undefined) rowUpdates.status = updates.status;
  if (updates.updatedAt !== undefined) rowUpdates.updated_at = updates.updatedAt;

  const rows = await supabaseRequest(env.supabaseLecturesTable, {
    method: 'PATCH',
    query: { id: `eq.${id}`, select: '*' },
    body: rowUpdates,
  });

  if (!rows || rows.length === 0) return null;
  return mapRowToLecture(rows[0]);
}

async function deleteLecture(id) {
  if (storageProvider !== 'supabase') {
    throw new ApiError(500, 'Supabase storage provider is required for lectures.');
  }

  await supabaseRequest(env.supabaseLecturesTable, {
    method: 'DELETE',
    query: { id: `eq.${id}` },
  });
}

module.exports = {
  bootstrapStorage,
  createLecture,
  deleteLecture,
  findLectureById,
  getStorageProvider: () => storageProvider,
  listLecturesByCourse,
  listLecturesByTeacher,
  updateLecture,
};
