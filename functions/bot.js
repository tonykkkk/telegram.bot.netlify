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
      "I read the file for you! The contents were:\n\n" +
        JSON.stringify(response.data).substring(0, 100)
    );
  } catch (error) {
    console.error("Error processing file:", error);
    await ctx.reply("Sorry, there was an error processing your file.");
  }
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
