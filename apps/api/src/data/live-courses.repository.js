const { env } = require('../config/env');
const { logger } = require('../lib/logger');
const { ApiError } = require('../utils/api-error');

const storageProvider = env.supabaseUrl && env.supabaseServiceRoleKey ? 'supabase' : 'file';

function mapRowToLiveCourse(row) {
  if (!row) return null;

  return {
    id: row.id,
    courseId: row.course_id,
    teacherId: row.teacher_id,
    title: row.title,
    description: row.description,
    thumbnail: row.thumbnail,
    price: row.price,
    discountPrice: row.discount_price,
    premium: row.premium,
    status: row.status,
    visibility: row.visibility,
    classLevel: row.class_level,
    subject: row.subject,
    exam: row.exam,
    startDate: row.start_date,
    endDate: row.end_date,
    classTime: row.class_time,
    activeDays: row.active_days,
    roadmapClasses: row.roadmap_classes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapLiveCourseToRow(course) {
  return {
    id: course.id,
    course_id: course.courseId,
    teacher_id: course.teacherId,
    title: course.title,
    description: course.description,
    thumbnail: course.thumbnail,
    price: course.price,
    discount_price: course.discountPrice,
    premium: course.premium,
    status: course.status,
    visibility: course.visibility,
    class_level: course.classLevel,
    subject: course.subject,
    exam: course.exam,
    start_date: course.startDate,
    end_date: course.endDate,
    class_time: course.classTime,
    active_days: course.activeDays,
    roadmap_classes: course.roadmapClasses,
    created_at: course.createdAt,
    updated_at: course.updatedAt,
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
    await supabaseRequest(env.supabaseLiveCoursesTable, {
      query: { select: 'id', limit: '1' },
      headers: { Prefer: 'count=exact' },
    });
  } catch (error) {
    throw new ApiError(500, 'Supabase is configured, but the live courses table is not ready yet.', {
      code: 'SUPABASE_NOT_READY',
      details: error.details || error.message,
    });
  }
}

async function bootstrapStorage() {
  if (storageProvider === 'supabase') {
    await bootstrapSupabaseStorage();
    logger.info(`Live courses storage provider: ${storageProvider}`);
    return;
  }

  logger.info(`Live courses storage provider: ${storageProvider}`);
}

async function createLiveCourse(course) {
  if (storageProvider !== 'supabase') {
    throw new ApiError(500, 'Supabase storage provider is required for live courses.');
  }

  const rows = await supabaseRequest(env.supabaseLiveCoursesTable, {
    method: 'POST',
    body: mapLiveCourseToRow(course),
  });

  if (!rows || rows.length === 0) {
    throw new ApiError(500, 'Failed to create live course.');
  }

  try {
    logger.info('Created live course row in Supabase', { id: rows[0].id });
  } catch (_err) {}

  const newCourse = mapRowToLiveCourse(rows[0]);

  try {
    const { getIO } = require('../socket');
    const io = getIO();
    io.to('dashboard_global').emit('live_class_status_change', newCourse);
  } catch (err) {
    console.warn('Socket.IO not initialized, skipping event emission');
  }

  return newCourse;
}

module.exports = {
  bootstrapStorage,
  createLiveCourse,
};
