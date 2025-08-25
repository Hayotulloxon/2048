# 2048 Telegram WebApp

A Telegram WebApp implementing the 2048 game with gamification and monetization.

## Setup
1. Clone: `git clone https://github.com/username/my-2048-game.git`
2. Install: `npm install`
3. Create `.env` from `.env.example` and add Firebase keys.
4. Run locally: `npm start`
5. Deploy: `firebase deploy`

## Features
- Classic 2048 game with coin rewards.
- Tasks (code entry, Telegram/YouTube subscriptions, referrals).
- Leaderboards for coins and max tiles.
- Admin panel for @H08_09.

## Deployment
- Use Firebase CLI: `firebase init` (select Hosting, Functions, Database).
- Set Telegram bot token: `firebase functions:config:set telegram.token="your_bot_token"`
- Deploy: `firebase deploy`
- Set Telegram webhook: `curl -F "url=https://<region>-<project>.cloudfunctions.net/botWebhook" https://api.telegram.org/bot<YourBotToken>/setWebhook`

## Notes
- YouTube subscription task requires OAuth setup (not fully implemented).
- Complete `gameLogic.js` for up/down movements.
- Run tests: `npm test`
