const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Telegraf } = require('telegraf');
const { google } = require('googleapis');
const crypto = require('crypto');

admin.initializeApp();
const db = admin.database();
const bot = new Telegraf(functions.config().telegram.token);

exports.validateTelegramAuth = functions.https.onCall(async (data, context) => {
  const { initData } = data;
  const dataCheckString = Object.keys(initData).sort()
    .filter(k => k !== 'hash')
    .map(k => `${k}=${initData[k]}`)
    .join('\n');
  const secret = crypto.createHash('sha256').update(functions.config().telegram.token).digest();
  const hash = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');
  if (hash !== initData.hash) throw new functions.https.HttpsError('unauthenticated', 'Invalid hash');

  const user = await admin.auth().createCustomToken(initData.user.id);
  const userRef = db.ref(`users/${initData.user.id}`);
  await userRef.set({
    telegramId: initData.user.id,
    username: initData.user.username,
    coins: 0,
    maxTile: 0,
    referralCode: crypto.randomUUID(),
  }, { merge: true });
  return { token: user };
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
    completed = member.status === 'member' || member.status === 'administrator';
  } else if (task.type === 'subscription_youtube') {
    // Requires OAuth token stored for user
    const youtube = google.youtube({ version: 'v3', auth: context.auth.token.youtube });
    const res = await youtube.subscriptions.list({ part: 'snippet', mine: true });
    completed = res.data.items.some(sub => sub.snippet.resourceId.channelId === task.targetId);
  }

  if (completed) {
    await db.ref(`users/${context.auth.uid}/tasks/${taskId}`).set({ completedAt: new Date().toISOString() });
    await db.ref(`users/${context.auth.uid}`).update({ coins: admin.database.ServerValue.increment(task.coinReward) });
  }
  return { completed };
});

// Admin task CRUD (restricted to @H08_09)
exports.manageTasks = functions.https.onCall(async (data, context) => {
  if (!context.auth || (await db.ref(`users/${context.auth.uid}`).get()).val().username !== 'H08_09') {
    throw new functions.https.HttpsError('permission-denied', 'Admin only');
  }
  // Implement CRUD logic
});

// Webhook for Telegram bot
exports.botWebhook = functions.https.onRequest((req, res) => {
  bot.handleUpdate(req.body);
  res.sendStatus(200);
});

// Bot commands
bot.command('start', async (ctx) => {
  const referralCode = ctx.message.text.split(' ')[1]?.replace('ref_', '');
  if (referralCode) {
    const inviter = await db.ref('users').orderByChild('referralCode').equalTo(referralCode).get();
    if (inviter.exists()) {
      const inviterId = Object.keys(inviter.val())[0];
      await db.ref(`users/${inviterId}`).update({ coins: admin.database.ServerValue.increment(50) });
      await db.ref(`users/${ctx.from.id}`).update({ coins: admin.database.ServerValue.increment(50), referredBy: inviterId });
    }
  }
  ctx.reply('Welcome to 2048! Open the WebApp: https://yourdomain.web.app');
});
bot.launch();