const fs = require('fs/promises');
const path = require('path');

const storagePath = path.resolve(__dirname, '../storage/notifications.json');

async function bootstrapNotificationsStorage() {
  await fs.mkdir(path.dirname(storagePath), { recursive: true });

  try {
    await fs.access(storagePath);
  } catch (_error) {
    await fs.writeFile(storagePath, '[]\n', 'utf8');
  }
}

async function readNotifications() {
  await bootstrapNotificationsStorage();
  const content = await fs.readFile(storagePath, 'utf8');
  return JSON.parse(content);
}

async function writeNotifications(notifications) {
  await fs.writeFile(storagePath, `${JSON.stringify(notifications, null, 2)}\n`, 'utf8');
}

async function findNotificationsByUserId(userId) {
  const notifications = await readNotifications();
  return notifications.filter((notification) => notification.userId === userId);
}

async function createNotification(notification) {
  const notifications = await readNotifications();
  notifications.push(notification);
  await writeNotifications(notifications);
  return notification;
}

async function markAllAsRead(userId) {
  const notifications = await readNotifications();
  let updatedCount = 0;
  
  const next = notifications.map((n) => {
    if (n.userId === userId && !n.read) {
      updatedCount++;
      return { ...n, read: true };
    }
    return n;
  });

  if (updatedCount > 0) {
    await writeNotifications(next);
  }
}

async function markAsRead(id, userId) {
  const notifications = await readNotifications();
  let updatedCount = 0;
  
  const next = notifications.map((n) => {
    if (n.id === id && n.userId === userId && !n.read) {
      updatedCount++;
      return { ...n, read: true };
    }
    return n;
  });

  if (updatedCount > 0) {
    await writeNotifications(next);
  }
}

module.exports = {
  bootstrapNotificationsStorage,
  findNotificationsByUserId,
  createNotification,
  markAllAsRead,
  markAsRead,
};
