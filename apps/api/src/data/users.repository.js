const fs = require('fs/promises');
const path = require('path');

const { env } = require('../config/env');
const { logger } = require('../lib/logger');
const { ApiError } = require('../utils/api-error');

const usersStoragePath = path.resolve(__dirname, '../storage/users.json');
const studentsStoragePath = path.resolve(__dirname, '../storage/students.json');
const teachersStoragePath = path.resolve(__dirname, '../storage/teachers.json');
const storageProvider = env.supabaseUrl && env.supabaseServiceRoleKey ? 'supabase' : 'file';

function mapRowToUser(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role, // role is present in users table
    passwordHash: row.password_hash,
    passwordSalt: row.password_salt,
    avatar: row.avatar,
    headline: row.headline || '',
    bio: row.bio || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapUserToRow(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    password_hash: user.passwordHash,
    password_salt: user.passwordSalt,
    avatar: user.avatar,
    headline: user.headline || '',
    bio: user.bio || '',
    created_at: user.createdAt,
    updated_at: user.updatedAt,
  };
}

function mapUserToRoleRow(user) {
  // Same as mapUserToRow but without the role column since students/teachers tables don't need it
  const row = mapUserToRow(user);
  delete row.role;
  return row;
}

async function bootstrapFileStorage() {
  await fs.mkdir(path.dirname(usersStoragePath), { recursive: true });

  for (const p of [usersStoragePath, studentsStoragePath, teachersStoragePath]) {
    try {
      await fs.access(p);
    } catch (_error) {
      await fs.writeFile(p, '[]\n', 'utf8');
    }
  }
}

async function readTableFromFile(filepath) {
  await bootstrapFileStorage();
  const content = await fs.readFile(filepath, 'utf8');
  return JSON.parse(content);
}

async function writeTableToFile(filepath, users) {
  await fs.writeFile(filepath, `${JSON.stringify(users, null, 2)}\n`, 'utf8');
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
    await supabaseRequest(env.supabaseUsersTable, {
      query: { select: 'id', limit: '1' },
      headers: { Prefer: 'count=exact' },
    });
  } catch (error) {
    throw new ApiError(500, 'Supabase is configured, but the users table is not ready yet.', {
      code: 'SUPABASE_NOT_READY',
      details: error.details || error.message,
    });
  }
}

async function bootstrapStorage() {
  if (storageProvider === 'supabase') {
    await bootstrapSupabaseStorage();
    logger.info(`User storage provider: ${storageProvider}`);
    return;
  }

  await bootstrapFileStorage();
  logger.info(`User storage provider: ${storageProvider}`);
}

async function findUserByEmail(email) {
  const normalizedEmail = email.toLowerCase();

  if (storageProvider === 'supabase') {
    const rows = await supabaseRequest(env.supabaseUsersTable, {
      query: { select: '*', email: `eq.${normalizedEmail}`, limit: '1' },
    });
    if (rows && rows.length > 0) return mapRowToUser(rows[0]);
    return null;
  }

  const users = await readTableFromFile(usersStoragePath);
  return users.find((u) => u.email === normalizedEmail) || null;
}

async function findUserById(id) {
  if (storageProvider === 'supabase') {
    const rows = await supabaseRequest(env.supabaseUsersTable, {
      query: { select: '*', id: `eq.${id}`, limit: '1' },
    });
    if (rows && rows.length > 0) return mapRowToUser(rows[0]);
    return null;
  }

  const users = await readTableFromFile(usersStoragePath);
  return users.find((u) => u.id === id) || null;
}

async function findUsersByIds(ids) {
  if (!ids || !ids.length) return [];
  if (storageProvider === 'supabase') {
    const rows = await supabaseRequest(env.supabaseUsersTable, {
      query: { select: '*', id: `in.(${ids.join(',')})` },
    });
    return (rows || []).map(mapRowToUser);
  }

  const users = await readTableFromFile(usersStoragePath);
  return users.filter((u) => ids.includes(u.id));
}

async function createUser(user) {
  const roleTable = user.role === 'teacher' ? env.supabaseTeachersTable : env.supabaseStudentsTable;
  const rolePath = user.role === 'teacher' ? teachersStoragePath : studentsStoragePath;

  if (storageProvider === 'supabase') {
    // 1. Write to main users table
    const rows = await supabaseRequest(env.supabaseUsersTable, {
      method: 'POST',
      body: mapUserToRow(user),
    });

    // 2. Write to specific role table (ignoring any errors if it fails so signup still succeeds)
    try {
      await supabaseRequest(roleTable, {
        method: 'POST',
        body: mapUserToRoleRow(user),
      });
    } catch (e) {
      logger.error('Failed to dual-write user to role table', e);
    }

    return mapRowToUser(rows[0]);
  }

  // File fallback dual write
  const users = await readTableFromFile(usersStoragePath);
  users.push(user);
  await writeTableToFile(usersStoragePath, users);

  const roleUsers = await readTableFromFile(rolePath);
  const { role: _r, ...roleUser } = user;
  roleUsers.push(roleUser);
  await writeTableToFile(rolePath, roleUsers);

  return user;
}

async function updateUser(id, updates, role) {
  if (!role) {
    const existing = await findUserById(id);
    if (!existing) return null;
    role = existing.role;
  }

  const roleTable = role === 'teacher' ? env.supabaseTeachersTable : env.supabaseStudentsTable;
  const rolePath = role === 'teacher' ? teachersStoragePath : studentsStoragePath;

  if (storageProvider === 'supabase') {
    const rowUpdates = {};

    if (updates.name !== undefined) rowUpdates.name = updates.name;
    if (updates.avatar !== undefined) rowUpdates.avatar = updates.avatar;
    if (updates.headline !== undefined) rowUpdates.headline = updates.headline;
    if (updates.bio !== undefined) rowUpdates.bio = updates.bio;
    if (updates.updatedAt !== undefined) rowUpdates.updated_at = updates.updatedAt;

    // Update main users table
    const rows = await supabaseRequest(env.supabaseUsersTable, {
      method: 'PATCH',
      query: { id: `eq.${id}`, select: '*' },
      body: rowUpdates,
    });

    // Update role specific table
    try {
      await supabaseRequest(roleTable, {
        method: 'PATCH',
        query: { id: `eq.${id}`, select: '*' },
        body: rowUpdates,
      });
    } catch (e) {
      logger.error('Failed to dual-update user in role table', e);
    }

    if (!rows || rows.length === 0) return null;
    return mapRowToUser(rows[0]);
  }

  // File fallback update
  const users = await readTableFromFile(usersStoragePath);
  const index = users.findIndex((user) => user.id === id);
  if (index === -1) return null;
  users[index] = { ...users[index], ...updates };
  await writeTableToFile(usersStoragePath, users);

  const roleUsers = await readTableFromFile(rolePath);
  const rIndex = roleUsers.findIndex((user) => user.id === id);
  if (rIndex !== -1) {
    roleUsers[rIndex] = { ...roleUsers[rIndex], ...updates };
    await writeTableToFile(rolePath, roleUsers);
  }

  return users[index];
}

module.exports = {
  bootstrapStorage,
  createUser,
  findUserByEmail,
  findUserById,
  findUsersByIds,
  getStorageProvider: () => storageProvider,
  updateUser,
};
