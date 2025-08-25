const functions = require('firebase-functions');
const admin = require('firebase-admin');
const crypto = require('crypto');
const { Telegraf } = require('telegraf');
const { google } = require('googleapis');

admin.initializeApp();
const db = admin.database();
const bot = new Telegraf(functions.config().telegram.token);

exports.validateTelegramAuth = functions.https.onCall(async (data) => {
  const { initData } = data;
  const parsed = new URLSearchParams(initData);
  const hash = parsed.get('hash');
  parsed.delete('hash');
  const dataCheckString = [...parsed.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([k, v]) => `${k}=${v}`).join('\n');
  const secret = crypto.createHash('sha256').update(functions.config().telegram.token).digest();
  const calculatedHash = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');
  if (calculatedHash !== hash) throw new functions.https.HttpsError('unauthenticated', 'Invalid hash');

  const userData = JSON.parse(parsed.get('user'));
  const customToken = await admin.auth().createCustomToken(userData.id.toString());
  const userRef = db.ref(`users/${userData.id}`);
  await userRef.update({
    telegramId: userData.id,
    username: userData.username,
    coins: 0,
    maxTile: 0,
    referralCode: crypto.randomBytes(8).toString('hex'),
  });
  return { token: customToken };
});

exports.completeTask = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Not authenticated');
  const { taskId, input } = data;
  const taskRef = db.ref(`tasks/${taskId}`);
  const task = (await taskRef.get()).val();
  if (!task) throw new functions.https.HttpsError('not-found', 'Task not found');

  let completed = false;
  if (task.type === 'code' && input === task.code) {
    completed = true;
  } else if (task.type === 'subscription_telegram') {
    const member = await bot.telegram.getChatMember(task.targetId, context.auth.uid);
    completed = ['member', 'administrator', 'creator'].includes(member.status);
  } else if (task.type === 'subscription_youtube') {
    // Placeholder: YouTube OAuth token required
    completed = false; // Implement OAuth flow separately
  } else if (task.type === 'referral') {
    completed = true;
  }

  if (completed) {
    await db.ref(`users/${context.auth.uid}/tasks/${taskId}`).set({ completedAt: admin.database.ServerValue.TIMESTAMP });
    await db.ref(`users/${context.auth.uid}/coins`).transaction(current => (current || 0) + task.coinReward);
  }
  return { completed };
});

exports.manageTasks = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Not authenticated');
  const user = (await db.ref(`users/${context.auth.uid}`).get()).val();
  if (user.username !== 'H08_09') throw new functions.https.HttpsError('permission-denied', 'Admin only');

  const { action, task } = data;
  const tasksRef = db.ref('tasks');
  if (action === 'add') {
    const newTaskRef = tasksRef.push();
    await newTaskRef.set(task);
  } else if (action === 'delete') {
    await tasksRef.child(task.id).remove();
  } else if (action === 'update') {
    await tasksRef.child(task.id).update(task);
  }
  return { success: true };
});

exports.getLeaderboards = functions.https.onCall(async (_, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Not authenticated');
  const usersRef = db.ref('users');
  const coinSnapshot = await usersRef.orderByChild('coins').limitToLast(10).get();
  const tileSnapshot = await usersRef.orderByChild('maxTile').limitToLast(10).get();
  return {
    coins: Object.entries(coinSnapshot.val() || {}).map(([id, data]) => ({ id, ...data })),
    tiles: Object.entries(tileSnapshot.val() || {}).map(([id, data]) => ({ id, ...data })),
  };
});

exports.botWebhook = functions.https.onRequest((req, res) => {
  bot.handleUpdate(req.body).then(() => res.sendStatus(200));
});

bot.command('start', async (ctx) => {
  const payload = ctx.message.text.split(' ')[1];
  if (payload && payload.startsWith('ref_')) {
    const referralCode = payload.slice(4);
    const inviterSnapshot = await db.ref('users').orderByChild('referralCode').equalTo(referralCode).get();
    if (inviterSnapshot.exists()) {
      const inviterId = Object.keys(inviterSnapshot.val())[0];
      await db.ref(`users/${inviterId}/coins`).transaction(current => (current || 0) + 50);
      await db.ref(`users/${ctx.from.id}/coins`).transaction(current => (current || 0) + 50);
      await db.ref(`users/${ctx.from.id}/referredBy`).set(inviterId);
    }
  }
  ctx.reply('Welcome! Open the WebApp to play 2048: <your-webapp-url>');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
