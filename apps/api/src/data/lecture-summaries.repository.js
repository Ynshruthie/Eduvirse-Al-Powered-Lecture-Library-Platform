const fs = require('fs/promises');
const path = require('path');
const { randomUUID } = require('crypto');

const { env } = require('../config/env');
const { logger } = require('../lib/logger');
const { ApiError } = require('../utils/api-error');

const lectureSummariesStoragePath = path.resolve(__dirname, '../storage/lecture_summaries.json');
const storageProvider = env.supabaseUrl && env.supabaseServiceRoleKey ? 'supabase' : 'file';

async function bootstrapFileStorage() {
  await fs.mkdir(path.dirname(lectureSummariesStoragePath), { recursive: true });

  try {
    await fs.access(lectureSummariesStoragePath);
  } catch (_error) {
    await fs.writeFile(lectureSummariesStoragePath, '[]\n', 'utf8');
  }
}

async function readTableFromFile(filepath) {
  await bootstrapFileStorage();
  const content = await fs.readFile(filepath, 'utf8');
  return JSON.parse(content);
}

async function writeTableToFile(filepath, data) {
  await fs.writeFile(filepath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
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
    } catch (_error) {
      details = await response.text();
    }
    throw new ApiError(500, 'Supabase request failed.', {
      code: 'SUPABASE_REQUEST_FAILED',
      details: {
        status: response.status,
        response: details,
      },
    });
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function bootstrapSupabaseStorage() {
  try {
    await supabaseRequest(env.supabaseLectureSummariesTable, {
      query: { select: 'id', limit: '1' },
      headers: { Prefer: 'count=exact' },
    });
  } catch (error) {
    logger.warn('Supabase is configured, but lecture_summaries table is not ready yet.', error);
  }
}

async function bootstrapLectureSummariesStorage() {
  if (storageProvider === 'supabase') {
    await bootstrapSupabaseStorage();
    logger.info(`Lecture summaries storage provider: ${storageProvider}`);
    return;
  }

  await bootstrapFileStorage();
  logger.info(`Lecture summaries storage provider: ${storageProvider}`);
}

async function saveLectureSummary(lectureId, aiData) {
  const record = {
    id: randomUUID(),
    lecture_id: lectureId,
    summary: aiData.summary,
    key_points: aiData.key_points || [],
    definitions: aiData.definitions || [],
    revision_notes: aiData.revision_notes || '',
    quiz_questions: aiData.quiz_questions || [],
    created_at: new Date().toISOString()
  };

  if (storageProvider === 'supabase') {
    const rows = await supabaseRequest(env.supabaseLectureSummariesTable, {
      method: 'POST',
      body: record,
      headers: { Prefer: 'return=representation' }
    });
    return rows && rows.length > 0 ? rows[0] : record;
  }

  const summaries = await readTableFromFile(lectureSummariesStoragePath);
  summaries.push(record);
  await writeTableToFile(lectureSummariesStoragePath, summaries);

  return record;
}

async function getLectureSummary(lectureId) {
  if (storageProvider === 'supabase') {
    const rows = await supabaseRequest(env.supabaseLectureSummariesTable, {
      query: { select: '*', lecture_id: `eq.${lectureId}`, limit: '1' },
    });
    if (rows && rows.length > 0) return rows[0];
    return null;
  }

  const summaries = await readTableFromFile(lectureSummariesStoragePath);
  return summaries.find((s) => s.lecture_id === lectureId) || null;
}

module.exports = {
  bootstrapLectureSummariesStorage,
  saveLectureSummary,
  getLectureSummary,
};
