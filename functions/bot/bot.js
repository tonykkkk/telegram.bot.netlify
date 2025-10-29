// const Telegraf = require('telegraf');
// const startAction = require('./actions/start')

// const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// bot.start(ctx => {
//   return startAction(ctx)
// })

// exports.handler = async event => {
//   try {
//     await bot.handleUpdate(JSON.parse(event.body));
//     return { statusCode: 200, body: '' };
//   } catch (e) {
//     console.log(e)
//     return { statusCode: 400, body: 'This endpoint is meant for bot and telegram communication' };
//   }

// }

const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')

const keyboard = Markup.inlineKeyboard([
  Markup.urlButton('❤️', 'http://telegraf.js.org'),
  Markup.callbackButton('Delete', 'delete')
])

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)
bot.start((ctx) => ctx.reply('Hello'))
bot.help((ctx) => ctx.reply('Help message'))
bot.on('message', (ctx) => ctx.telegram.sendCopy(ctx.chat.id, ctx.message, Extra.markup(keyboard)))
bot.action('delete', ({ deleteMessage }) => deleteMessage())
bot.launch()
