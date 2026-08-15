const fs = require('fs/promises');
const path = require('path');
const { getIO } = require('../socket');

const storagePath = path.resolve(__dirname, '../storage/analytics.json');

async function bootstrapAnalyticsStorage() {
  await fs.mkdir(path.dirname(storagePath), { recursive: true });

  try {
    await fs.access(storagePath);
  } catch (_error) {
    await fs.writeFile(storagePath, '{}', 'utf8');
  }
}

async function readAnalytics() {
  await bootstrapAnalyticsStorage();
  const content = await fs.readFile(storagePath, 'utf8');
  return JSON.parse(content);
}

async function writeAnalytics(analytics) {
  await fs.writeFile(storagePath, JSON.stringify(analytics, null, 2), 'utf8');
}

async function getUserAnalytics(userId) {
  const analytics = await readAnalytics();
  
  if (!analytics[userId]) {
    analytics[userId] = {
      streak: 0,
      studyTime: {
        totalMinutes: 0,
        weeklyData: [0, 0, 0, 0, 0, 0, 0] // M, T, W, T, F, S, S
      },
      courseProgress: []
    };
    await writeAnalytics(analytics);
  }
  
  return analytics[userId];
}

async function logStudyTime(userId, minutesStudied) {
  const analytics = await readAnalytics();
  
  if (!analytics[userId]) {
    analytics[userId] = {
      streak: 0,
      studyTime: { totalMinutes: 0, weeklyData: [0,0,0,0,0,0,0] },
      courseProgress: []
    };
  }

  // Update study time
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1; // 0 = Mon, 6 = Sun
  analytics[userId].studyTime.totalMinutes += minutesStudied;
  analytics[userId].studyTime.weeklyData[todayIndex] += minutesStudied;
  
  // Format study time for UI
  const totalMins = analytics[userId].studyTime.totalMinutes;
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  const timeData = {
    total: `${hours}h ${mins}m`,
    data: analytics[userId].studyTime.weeklyData
  };

  await writeAnalytics(analytics);

  try {
    const io = getIO();
    io.to(`dashboard_user_${userId}`).emit('update_study_time', timeData);
  } catch (err) {
    console.warn('Socket.IO not initialized, skipping event emission');
  }

  return timeData;
}

module.exports = {
  bootstrapAnalyticsStorage,
  getUserAnalytics,
  logStudyTime
};
