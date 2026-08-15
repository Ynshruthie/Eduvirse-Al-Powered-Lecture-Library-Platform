const fs = require('fs/promises');
const path = require('path');

const storagePath = path.resolve(__dirname, '../storage/comments.json');

async function bootstrapCommentsStorage() {
  await fs.mkdir(path.dirname(storagePath), { recursive: true });

  try {
    await fs.access(storagePath);
  } catch (_error) {
    await fs.writeFile(storagePath, '[]\n', 'utf8');
  }
}

async function readComments() {
  await bootstrapCommentsStorage();
  const content = await fs.readFile(storagePath, 'utf8');
  return JSON.parse(content);
}

async function writeComments(comments) {
  await fs.writeFile(storagePath, `${JSON.stringify(comments, null, 2)}\n`, 'utf8');
}

async function findAllComments() {
  return await readComments();
}

async function findCommentById(id) {
  const comments = await readComments();
  return comments.find((comment) => comment.id === id) || null;
}

async function createComment(comment) {
  const comments = await readComments();
  comments.push(comment);
  await writeComments(comments);
  return comment;
}

async function updateComment(id, updates) {
  const comments = await readComments();
  const index = comments.findIndex((comment) => comment.id === id);
  if (index === -1) return null;
  comments[index] = { ...comments[index], ...updates };
  await writeComments(comments);
  return comments[index];
}

async function deleteComment(id) {
  const comments = await readComments();
  const next = comments.filter((comment) => comment.id !== id);
  await writeComments(next);
}

module.exports = {
  bootstrapCommentsStorage,
  findAllComments,
  findCommentById,
  createComment,
  updateComment,
  deleteComment,
};
