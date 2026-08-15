const fs = require('fs');
const path = require('path');

const dotenv = require('dotenv');

const localEnvPath = path.resolve(process.cwd(), '.env');

if (fs.existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath });
}

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function cleanOptionalValue(value, placeholders = []) {
  const normalized = String(value || '').trim();

  if (!normalized || placeholders.includes(normalized)) {
    return '';
  }

  return normalized;
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: toNumber(process.env.PORT, 4000),
  apiPrefix: process.env.API_PREFIX || '/api',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  tokenSecret: process.env.TOKEN_SECRET || 'dev-only-token-secret-change-me',
  tokenTtlHours: toNumber(process.env.TOKEN_TTL_HOURS, 24),
  supabaseUrl: cleanOptionalValue(process.env.SUPABASE_URL, ['https://your-project-id.supabase.co']),
  supabaseServiceRoleKey: cleanOptionalValue(process.env.SUPABASE_SERVICE_ROLE_KEY, ['your-service-role-key']),
  supabaseUsersTable: process.env.SUPABASE_USERS_TABLE || 'users',
  supabaseStudentsTable: process.env.SUPABASE_STUDENTS_TABLE || 'students',
  supabaseTeachersTable: process.env.SUPABASE_TEACHERS_TABLE || 'teachers',
  supabaseLecturesTable: process.env.SUPABASE_LECTURES_TABLE || 'lectures',
  supabaseLectureSummariesTable: process.env.SUPABASE_LECTURE_SUMMARIES_TABLE || 'lecture_summaries',
  supabaseLiveCoursesTable: process.env.SUPABASE_LIVE_COURSES_TABLE || 'live_courses',
  hfToken: process.env.HF_TOKEN || '',
};

module.exports = { env };
