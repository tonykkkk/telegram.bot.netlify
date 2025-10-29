const Telegraf = require("telegraf");
const startAction = require("./actions/start");
const axios = require("axios");

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.start((ctx) => {
  return startAction(ctx);
});

bot.on("document", (ctx) => {
  // return ctx.reply(`Tnx for file`);
  const { file_id: fileId } = ctx.update.message.document;
  console.log(fileId);
  ctx.telegram.getFileLink(fileId).then((fileUrl) => {
    console.log(fileUrl);
    const response = axios.get(fileUrl);
    ctx.reply(
      "I read the file for you! The contents were:\n\n" + response.data
    );
  });
});

bot.on("text", (ctx) => {
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
