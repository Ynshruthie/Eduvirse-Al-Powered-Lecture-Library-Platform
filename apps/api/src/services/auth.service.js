const crypto = require('crypto');

const { USER_ROLES } = require('../constants/roles');
const { createUser, findUserByEmail, findUserById, updateUser } = require('../data/users.repository');
const { env } = require('../config/env');
const { ApiError } = require('../utils/api-error');

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function createPasswordHash(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

function verifyPassword(password, salt, expectedHash) {
  const { hash } = createPasswordHash(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(expectedHash, 'hex'));
}

function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar || null,
    headline: user.headline || '',
    bio: user.bio || '',
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function encodeBase64Url(value) {
  return Buffer.from(value).toString('base64url');
}

function decodeBase64Url(value) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function signToken(payload) {
  const body = encodeBase64Url(JSON.stringify(payload));
  const signature = crypto
    .createHmac('sha256', env.tokenSecret)
    .update(body)
    .digest('base64url');

  return `${body}.${signature}`;
}

function verifyToken(token) {
  const [body, signature] = String(token || '').split('.');

  if (!body || !signature) {
    throw new ApiError(401, 'Invalid authentication token.');
  }

  const expectedSignature = crypto
    .createHmac('sha256', env.tokenSecret)
    .update(body)
    .digest('base64url');

  if (signature !== expectedSignature) {
    throw new ApiError(401, 'Invalid authentication token.');
  }

  const payload = JSON.parse(decodeBase64Url(body));

  if (!payload.exp || Date.now() > payload.exp) {
    throw new ApiError(401, 'Authentication token has expired.');
  }

  return payload;
}

function validateSignupInput(payload) {
  const name = String(payload.name || '').trim();
  const email = normalizeEmail(payload.email);
  const password = String(payload.password || '');
  const role = String(payload.role || 'student').trim().toLowerCase();

  if (name.length < 2) {
    throw new ApiError(400, 'Name must be at least 2 characters long.');
  }

  if (!email || !email.includes('@')) {
    throw new ApiError(400, 'A valid email address is required.');
  }

  if (password.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters long.');
  }

  if (!USER_ROLES.includes(role)) {
    throw new ApiError(400, `Role must be one of: ${USER_ROLES.join(', ')}.`);
  }

  return { name, email, password, role };
}

function validateLoginInput(payload) {
  const email = normalizeEmail(payload.email);
  const password = String(payload.password || '');

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required.');
  }

  return { email, password };
}

function issueToken(user) {
  return signToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + env.tokenTtlHours * 60 * 60 * 1000,
  });
}

const authService = {
  async signup(payload) {
    const { name, email, password, role } = validateSignupInput(payload);

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      throw new ApiError(409, 'An account with this email already exists.');
    }

    const { hash, salt } = createPasswordHash(password);
    const timestamp = new Date().toISOString();

    const user = await createUser({
      id: crypto.randomUUID(),
      name,
      email,
      role,
      passwordHash: hash,
      passwordSalt: salt,
      avatar: null,
      headline: '',
      bio: '',
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return {
      token: issueToken(user),
      user: toPublicUser(user),
    };
  },

  async login(payload) {
    const { email, password } = validateLoginInput(payload);
    const user = await findUserByEmail(email);

    if (!user || !verifyPassword(password, user.passwordSalt, user.passwordHash)) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    return {
      token: issueToken(user),
      user: toPublicUser(user),
    };
  },

  async getUserFromToken(token) {
    const payload = verifyToken(token);
    const user = await findUserById(payload.sub);

    if (!user) {
      throw new ApiError(401, 'User for this token no longer exists.');
    }

    return toPublicUser(user);
  },

  async updateProfile(userId, updates) {
    const user = await findUserById(userId);

    if (!user) {
      throw new ApiError(404, 'User not found.');
    }

    const nextName = updates.name === undefined ? user.name : String(updates.name).trim();
    const nextHeadline = updates.headline === undefined ? user.headline || '' : String(updates.headline).trim();
    const nextBio = updates.bio === undefined ? user.bio || '' : String(updates.bio).trim();
    const nextAvatar = updates.avatar === undefined ? user.avatar : String(updates.avatar || '').trim() || null;

    if (nextName.length < 2) {
      throw new ApiError(400, 'Name must be at least 2 characters long.');
    }

    const updatedUser = await updateUser(userId, {
      name: nextName,
      headline: nextHeadline,
      bio: nextBio,
      avatar: nextAvatar,
      updatedAt: new Date().toISOString(),
    }, user.role);

    return toPublicUser(updatedUser);
  },
};

module.exports = { authService };
