const fs = require('fs/promises');
const path = require('path');
const { randomUUID } = require('crypto');
const { getIO } = require('../socket');

const storagePath = path.resolve(__dirname, '../storage/quizzes.json');

async function bootstrapQuizzesStorage() {
  await fs.mkdir(path.dirname(storagePath), { recursive: true });

  try {
    await fs.access(storagePath);
  } catch (_error) {
    await fs.writeFile(storagePath, '[]\n', 'utf8');
  }
}

async function readQuizzes() {
  await bootstrapQuizzesStorage();
  const content = await fs.readFile(storagePath, 'utf8');
  return JSON.parse(content);
}

async function writeQuizzes(quizzes) {
  await fs.writeFile(storagePath, `${JSON.stringify(quizzes, null, 2)}\n`, 'utf8');
}

async function getQuizzesByCourseIds(courseIds) {
  const quizzes = await readQuizzes();
  return quizzes.filter(q => courseIds.includes(q.courseId)).sort((a, b) => new Date(a.date) - new Date(b.date));
}

async function createQuiz(quizData) {
  const quizzes = await readQuizzes();
  
  const newQuiz = {
    id: `quiz-${randomUUID()}`,
    ...quizData,
    createdAt: new Date().toISOString()
  };
  
  quizzes.push(newQuiz);
  await writeQuizzes(quizzes);

  try {
    const io = getIO();
    io.to('dashboard_global').emit('new_quiz', {
      title: newQuiz.title,
      date: new Date(newQuiz.date).toLocaleDateString()
    });
  } catch (err) {
    console.warn('Socket.IO not initialized, skipping event emission');
  }

  return newQuiz;
}

module.exports = {
  bootstrapQuizzesStorage,
  getQuizzesByCourseIds,
  createQuiz
};
