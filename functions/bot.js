const Telegraf = require("telegraf");
const startAction = require("./actions/start");

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.start((ctx) => {
  return startAction(ctx);
});

bot.on(message("document"), (ctx) => {
  return ctx.reply(`Tnx for file`);
});

bot.on(message("text"), (ctx) => {
  return ctx.reply(`send me file`);
});

exports.handler = async (event) => {
  try {
    await bot.handleUpdate(JSON.parse(event.body));
    return { statusCode: 200, body: "" };
  } catch (e) {
    console.log(e);
    return {
      statusCode: 400,
      body: "This endpoint is meant for bot and telegram communication",
    };
  }
};
