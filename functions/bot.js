const Telegraf = require("telegraf");
const startAction = require("./actions/start");
const axios = require("axios");

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.start((ctx) => {
  return startAction(ctx);
});

bot.on("document", async (ctx) => {
  try {
    // return ctx.reply(`Tnx for file`);
    const { file_id: fileId } = ctx.update.message.document;
    console.log("File ID:", fileId);

    const fileUrl = await ctx.telegram.getFileLink(fileId);
    console.log(fileUrl);

    const response = await axios.get(fileUrl);
    await ctx.reply(
      "Прочел твой файл корректно, он начинатеся с текста:\n\n" +
        JSON.stringify(response.data).substring(0, 100)
    );
  } catch (error) {
    console.error("Error processing file:", error);
    await ctx.reply("Простите, обработать файл не удалось.");
  }
});

bot.on("text", (ctx) => {
  return ctx.reply(`Отправь мне файлы`);
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
