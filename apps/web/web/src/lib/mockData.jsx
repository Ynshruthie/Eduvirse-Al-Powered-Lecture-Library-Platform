const STORAGE_USERS = 'eduvirse_users';
const STORAGE_CURRENT_USER = 'eduvirse_current_user';
const STORAGE_ENROLLMENTS = 'eduvirse_enrollments';

const adminUser = {
  id: 'user-admin',
  name: 'Admin User',
  email: 'admin@gmail.com',
  password: 'admin1234',
  role: 'Admin',
  avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
  bio: 'Eduvirse demo administrator',
};

const studentUser = {
  id: 'user-student',
  name: 'Demo Student',
  email: 'student@gmail.com',
  password: 'student1234',
  role: 'Student',
  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
  bio: 'Eduvirse demo student account',
};

const teacherUser = {
  id: 'user-teacher',
  name: 'Demo Teacher',
  email: 'teacher@gmail.com',
  password: 'teacher1234',
  role: 'Teacher',
  avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&h=200&fit=crop',
  bio: 'Eduvirse demo teacher account',
};

const defaultUsers = [adminUser, studentUser, teacherUser];

const defaultCategories = [
  { icon: '🎨', name: 'Design', courseCount: 47 },
  { icon: '💻', name: 'Development', courseCount: 83 },
  { icon: '💼', name: 'Business', courseCount: 52 },
  { icon: '📈', name: 'Marketing', courseCount: 38 },
  { icon: '📷', name: 'Photography', courseCount: 29 },
  { icon: '❤️', name: 'Lifestyle', courseCount: 41 },
  { icon: '🤖', name: 'AI & Machine Learning', courseCount: 35 },
  { icon: '📊', name: 'Data Science', courseCount: 62 },
  { icon: '🎵', name: 'Music', courseCount: 21 },
  { icon: '🖌️', name: 'Art & Illustration', courseCount: 18 },
  { icon: '💪', name: 'Health & Fitness', courseCount: 44 },
  { icon: '💰', name: 'Finance & Accounting', courseCount: 55 },
  { icon: '🗣️', name: 'Language Learning', courseCount: 71 },
  { icon: '⚙️', name: 'Engineering', courseCount: 33 },
  { icon: '🏛️', name: 'Architecture', courseCount: 15 },
  { icon: '🎯', name: 'Others', courseCount: 67 },
];

const defaultCourses = [
  {
    _id: 'course-1',
    title: 'Complete Web Development Bootcamp',
    description: 'Build real-world applications using modern web technologies and practical workflows.',
    instructor: { name: 'Sarah Johnson' },
    category: 'Development',
    price: 79.99,
    rating: 4.9,
    reviews: [
      { id: 'review-1', rating: 5, comment: 'Amazing course!', expand: { user_id: { name: 'Ava Martin' } } },
      { id: 'review-2', rating: 4, comment: 'Very practical and easy to follow.', expand: { user_id: { name: 'Mark Lee' } } },
    ],
    enrolledStudents: Array(1240).fill(null),
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&h=600&fit=crop',
    premium: true,
    live: false,
    videos: [
      { id: 'v1', title: 'Course Introduction', duration: '5:30', url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
      { id: 'v2', title: 'Setting Up Your Environment', duration: '12:45', url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
      { id: 'v3', title: 'Core Web Concepts', duration: '18:20', url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
    ]
  },
  {
    _id: 'course-2',
    title: 'UI/UX Design Masterclass',
    description: 'Design beautiful and usable products with a focus on user experience and interface design.',
    instructor: { name: 'Alex Rivera' },
    category: 'Design',
    price: 59.99,
    rating: 4.8,
    reviews: [
      { id: 'review-3', rating: 5, comment: 'This course transformed the way I design.', expand: { user_id: { name: 'Emily Carter' } } },
    ],
    enrolledStudents: Array(892).fill(null),
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1000&h=600&fit=crop',
    premium: true,
    live: true,
    videos: [
      { id: 'v1', title: 'Design Thinking Basics', duration: '8:15', url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' },
      { id: 'v2', title: 'Understanding Typography', duration: '14:20', url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' },
      { id: 'v3', title: 'Color Theory in Practice', duration: '22:10', url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4' },
    ]
  },
  {
    _id: 'course-3',
    title: 'Digital Marketing Strategy & Analytics',
    description: 'Master marketing fundamentals, analytics, and campaign strategy for faster growth.',
    instructor: { name: 'Emma Davis' },
    category: 'Marketing',
    price: 49.99,
    rating: 4.7,
    reviews: [
      { id: 'review-4', rating: 4, comment: 'Great insights on analytics.', expand: { user_id: { name: 'Noah Smith' } } },
    ],
    enrolledStudents: Array(1567).fill(null),
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab655c4c2?w=1000&h=600&fit=crop',
    premium: false,
    live: false,
    videos: [
      { id: 'v1', title: 'Marketing 101', duration: '10:05', url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' },
      { id: 'v2', title: 'Analytics Deep Dive', duration: '25:30', url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4' },
      { id: 'v3', title: 'Campaign Strategy', duration: '19:45', url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' },
    ]
  },
  {
    _id: 'course-4',
    title: 'Professional Photography Guide',
    description: 'Learn photography techniques, composition, and editing through hands-on projects.',
    instructor: { name: 'Marcus Chen' },
    category: 'Photography',
    price: 69.99,
    rating: 4.6,
    reviews: [
      { id: 'review-5', rating: 5, comment: 'Great course for beginners and pros alike.', expand: { user_id: { name: 'Sofia Patel' } } },
    ],
    enrolledStudents: Array(645).fill(null),
    thumbnail: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1000&h=600&fit=crop',
    premium: false,
    live: true,
    videos: [
      { id: 'v1', title: 'Camera Settings', duration: '15:20', url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4' },
      { id: 'v2', title: 'Lighting Techniques', duration: '18:50', url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4' },
      { id: 'v3', title: 'Post-Processing', duration: '30:15', url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4' },
    ]
  },
  {
    _id: 'course-5',
    title: 'Business Growth Fundamentals',
    description: 'Learn business planning, leadership, and strategy to grow your company or startup.',
    instructor: { name: 'Mia Sanchez' },
    category: 'Business',
    price: 64.99,
    rating: 4.7,
    reviews: [
      { id: 'review-6', rating: 5, comment: 'Helpful and practical business guidance.', expand: { user_id: { name: 'Liam Brooks' } } },
    ],
    enrolledStudents: Array(980).fill(null),
    thumbnail: 'https://images.unsplash.com/photo-1496104679561-38e0d6838a08?w=1000&h=600&fit=crop',
    premium: true,
    live: false,
    videos: [
      { id: 'v1', title: 'Business Plan Essentials', duration: '12:00', url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
      { id: 'v2', title: 'Financial Modeling', duration: '28:10', url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
      { id: 'v3', title: 'Pitching to Investors', duration: '21:30', url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' },
    ]
  },
  {
    _id: 'course-6',
    title: 'Lifestyle Productivity Hacks',
    description: 'Improve your daily routines, time management, and work-life balance with actionable habits.',
    instructor: { name: 'Nina Torres' },
    category: 'Lifestyle',
    price: 39.99,
    rating: 4.5,
    reviews: [
      { id: 'review-7', rating: 4, comment: 'Very motivating and easy to apply.', expand: { user_id: { name: 'Oliver Reed' } } },
    ],
    enrolledStudents: Array(720).fill(null),
    thumbnail: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1000&h=600&fit=crop',
    premium: false,
    live: false,
    videos: [
      { id: 'v1', title: 'Time Management', duration: '9:45', url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
      { id: 'v2', title: 'Building Habits', duration: '14:20', url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' },
      { id: 'v3', title: 'Avoiding Burnout', duration: '17:15', url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4' },
    ]
  },
];

const loadUsers = () => {
  const raw = localStorage.getItem(STORAGE_USERS);
  if (!raw) {
    localStorage.setItem(STORAGE_USERS, JSON.stringify(defaultUsers));
    return defaultUsers;
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultUsers;
  } catch {
    localStorage.setItem(STORAGE_USERS, JSON.stringify(defaultUsers));
    return defaultUsers;
  }
};

const saveUsers = (users) => {
  localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
  return users;
};

export const findUserByEmail = (email) => {
  const users = loadUsers();
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
};

export const createUser = ({ email, password, name, role }) => {
  const existingUser = findUserByEmail(email);
  if (existingUser) {
    throw new Error('Email is already registered');
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name,
    email,
    password,
    role: role || 'Student',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop',
    bio: 'New Eduvirse learner',
  };
  saveUsers([...loadUsers(), newUser]);
  return newUser;
};

export const updateUserProfile = (email, updates) => {
  const users = loadUsers();
  const index = users.findIndex((user) => user.email.toLowerCase() === email.toLowerCase());
  if (index === -1) {
    throw new Error('User not found');
  }

  const updatedUser = { ...users[index], ...updates };
  users[index] = updatedUser;
  saveUsers(users);
  return updatedUser;
};

export const getCurrentUserFromStorage = () => {
  const raw = localStorage.getItem(STORAGE_CURRENT_USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(STORAGE_CURRENT_USER);
    return null;
  }
};

export const saveCurrentUser = (user) => {
  localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(user));
};

export const clearCurrentUser = () => {
  localStorage.removeItem(STORAGE_CURRENT_USER);
};

const getEnrollmentsStorage = () => {
  const raw = localStorage.getItem(STORAGE_ENROLLMENTS);
  if (!raw) {
    localStorage.setItem(STORAGE_ENROLLMENTS, JSON.stringify({}));
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.setItem(STORAGE_ENROLLMENTS, JSON.stringify({}));
    return {};
  }
};

const saveEnrollmentsStorage = (data) => {
  localStorage.setItem(STORAGE_ENROLLMENTS, JSON.stringify(data));
};

export const getUserEnrollments = (email) => {
  if (!email) return [];
  const data = getEnrollmentsStorage();
  return data[email.toLowerCase()] || [];
};

export const enrollCourse = (email, course) => {
  if (!email || !course) {
    throw new Error('Missing user or course information');
  }

  const data = getEnrollmentsStorage();
  const key = email.toLowerCase();
  const current = data[key] || [];
  const existing = current.find((entry) => entry.course._id === course._id || entry.course.id === course.id);
  if (existing) {
    return current;
  }

  const enrollment = {
    id: `enrollment-${Date.now()}`,
    course,
    progress: 0,
    completed: false,
    enrolledAt: new Date().toISOString(),
  };
  const updated = [enrollment, ...current];
  data[key] = updated;
  saveEnrollmentsStorage(data);
  return updated;
};

export const unenrollCourse = (email, enrollmentId) => {
  if (!email || !enrollmentId) return [];
  const data = getEnrollmentsStorage();
  const key = email.toLowerCase();
  const current = data[key] || [];
  const updated = current.filter((entry) => entry.id !== enrollmentId);
  data[key] = updated;
  saveEnrollmentsStorage(data);
  return updated;
};

export const getCategories = () => defaultCategories;

export const getCourses = ({ search, category, filter, limit } = {}) => {
  let result = [...defaultCourses];

  if (search) {
    const query = search.toLowerCase();
    result = result.filter((course) =>
      course.title.toLowerCase().includes(query) ||
      course.description.toLowerCase().includes(query) ||
      course.instructor.name.toLowerCase().includes(query) ||
      (course.category || '').toLowerCase().includes(query)
    );
  }

  if (category && category.toLowerCase() !== 'all') {
    result = result.filter((course) => (course.category || '').toLowerCase() === category.toLowerCase());
  }

  if (filter === 'premium') {
    result = result.filter((course) => course.premium);
  }

  if (filter === 'live') {
    result = result.filter((course) => course.live);
  }

  if (limit) {
    return result.slice(0, limit);
  }

  return result;
};

export const getCourseById = (id) => defaultCourses.find((course) => course._id === id || course.id === id);

export const getRelatedCourses = (category, id) => {
  return defaultCourses
    .filter((course) => (course.category || '').toLowerCase() === (category || '').toLowerCase())
    .filter((course) => course._id !== id && course.id !== id)
    .slice(0, 3);
};
