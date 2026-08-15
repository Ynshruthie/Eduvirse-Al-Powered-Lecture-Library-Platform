const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const TOKEN_STORAGE_KEY = 'eduvirse_auth_token';
const USER_STORAGE_KEY = 'eduvirse_current_user';

function getStoredToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

export function saveAuthSession({ token, user }) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

async function request(path, options = {}) {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let payload = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      payload?.error?.message ||
      payload?.message ||
      'The request failed. Please try again.';

    if (response.status === 401) {
      clearAuthSession();
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    throw new Error(message);
  }

  return payload;
}

export const api = {
  getStoredUser,
  clearAuthSession,
  async login(email, password) {
    const payload = await request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });

    saveAuthSession(payload.data);
    return payload.data.user;
  },
  async signup(email, password, name, role) {
    const payload = await request('/auth/signup', {
      method: 'POST',
      body: { email, password, name, role },
    });

    saveAuthSession(payload.data);
    return payload.data.user;
  },
  async getCurrentUser() {
    const user = await request('/auth/user');
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    return user;
  },
  async updateProfile(updates) {
    const payload = await request('/auth/me', {
      method: 'PATCH',
      body: updates,
    });

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(payload.data.user));
    return payload.data.user;
  },
  async getCategories() {
    const payload = await request('/categories');
    return payload.data.categories;
  },
  async getCourses(params = {}) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, String(value));
      }
    });

    const payload = await request(`/courses${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
    return payload.data.courses;
  },
  async getCourseById(id) {
    const payload = await request(`/courses/${id}`);
    return payload.data.course;
  },
  async getRelatedCourses(id, limit = 3) {
    const payload = await request(`/courses/${id}/related?limit=${limit}`);
    return payload.data.courses;
  },
  async getMyEnrollments() {
    const payload = await request('/enrollments/me');
    return payload.data.enrollments;
  },
  async getCourseLectures(id) {
    const payload = await request(`/courses/${id}/lectures`);
    return payload.data.lectures;
  },
  async getCourseQa(id) {
    const payload = await request(`/courses/${id}/qa`);
    return payload.data.qaList;
  },
  async postCourseQa(id, qaData) {
    const payload = await request(`/courses/${id}/qa`, {
      method: 'POST',
      body: qaData,
    });
    return payload.data.qa;
  },
  async incrementCourseViews(id) {
    const payload = await request(`/courses/${id}/view`, {
      method: 'PATCH',
    });
    return payload.data.views;
  },
  async updateCourseProgress(courseId, completedLectures) {
    const payload = await request(`/enrollments/${courseId}/progress`, {
      method: 'PATCH',
      body: { completedLectures },
    });
    return payload.data.enrollment;
  },
  getMyStudents: () => request('/teacher-portals/students'),
  getMyComments: () => request('/teacher-portals/comments'),
  replyToComment: (commentId, text) => request(`/teacher-portals/comments/${commentId}/reply`, { method: 'POST', body: JSON.stringify({ text }) }),
  resolveComment: (commentId) => request(`/teacher-portals/comments/${commentId}/resolve`, { method: 'PATCH' }),
  deleteComment: (commentId) => request(`/teacher-portals/comments/${commentId}`, { method: 'DELETE' }),
  getMyNotifications: () => request('/auth/notifications'),
  markNotificationsRead: () => request('/auth/notifications/read-all', { method: 'PATCH' }),
  markNotificationRead: (id) => request(`/auth/notifications/${id}/read`, { method: 'PATCH' }),
  async enrollCourse(courseId) {
    const payload = await request('/enrollments', {
      method: 'POST',
      body: { courseId },
    });

    return payload.data.enrollment;
  },
  async unenrollCourse(enrollmentId) {
    await request(`/enrollments/${enrollmentId}`, {
      method: 'DELETE',
    });
  },
  async getTeacherStats() {
    const payload = await request('/enrollments/teacher-stats');
    return payload.data;
  },
  async getAnnouncements() {
    const payload = await request('/announcements');
    return payload.data.announcements;
  },
  async getAssignments() {
    const payload = await request('/assignments');
    return payload.data.assignments;
  },
  async getQuizzes() {
    const payload = await request('/quizzes');
    return payload.data.quizzes;
  },
  async getAnalytics() {
    const payload = await request('/analytics/me');
    return payload.data.analytics;
  },
  async getMyCourses() {
    const payload = await request('/courses/mine');
    return payload.data.courses;
  },
  async uploadMedia(file, kind = 'asset') {
    const token = getStoredToken();

    const response = await fetch(`${API_BASE_URL}/teacher-portals/uploads`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': file.type || 'application/octet-stream',
        'x-file-name': encodeURIComponent(file.name || 'upload.bin'),
        'x-file-type': file.type || 'application/octet-stream',
        'x-upload-kind': kind,
      },
      body: await file.arrayBuffer(),
    });

    let payload = null;

    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      throw new Error(payload?.error?.message || payload?.message || 'Upload failed. Please try again.');
    }

    const uploadedFile = payload.data.file;
    const baseUrl = API_BASE_URL.startsWith('http') ? API_BASE_URL : window.location.origin;

    return {
      ...uploadedFile,
      url: uploadedFile?.url ? new URL(uploadedFile.url, baseUrl).toString() : uploadedFile?.url,
    };
  },
  async createCourse(course) {
    const payload = await request('/courses', {
      method: 'POST',
      body: course,
    });

    return payload.data.course;
  },
  async createLiveCourse(course) {
    const payload = await request('/courses/live', {
      method: 'POST',
      body: course,
    });
    return payload.data.course;
  },
  async addCourseRecording(courseId, recordingData) {
    const payload = await request(`/teacher-portals/courses/${courseId}/recordings`, {
      method: 'POST',
      body: recordingData,
    });
    return payload.data.course;
  },
  async updateCourseStatus(courseId, status) {
    const payload = await request(`/courses/${courseId}/status`, {
      method: 'PATCH',
      body: { status },
    });

    return payload.data.course;
  },
  async deleteCourse(courseId) {
    await request(`/courses/${courseId}`, {
      method: 'DELETE',
    });
  },
  async getLectureSummary(lectureId) {
    const payload = await request(`/lectures/${lectureId}/summary`);
    return payload.data;
  },
  async generateLectureSummary(lectureId, file, videoUrl = null, title = null, description = null) {
    const token = getStoredToken();
    const formData = new FormData();
    formData.append('lectureId', lectureId);
    
    if (file) {
      formData.append('lecture', file);
    }
    if (videoUrl) {
      formData.append('videoUrl', videoUrl);
    }
    if (title) {
      formData.append('title', title);
    }
    if (description) {
      formData.append('description', description);
    }

    const response = await fetch(`${API_BASE_URL}/lectures/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      throw new Error(payload?.error?.message || payload?.message || 'Failed to generate AI summary.');
    }

    return payload.data;
  },
};
