const Telegraf = require("telegraf");
const startAction = require("./actions/start");
const axios = require("axios");
const {
  handleZipFileUpload,
  downloadZipFromUrl,
  extractFollowersAndFollowing,
  review,
} = require("./actions/instagramAnalyzer");

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
    zipBuffer = await downloadZipFromUrl(fileUrl);
    //const response = await axios.get(fileUrl);
    await ctx.reply("Начинаю анализ подписчиков...");

    console.log("✅ ZIP-файл успешно прочитан");

    const result = await extractFollowersAndFollowing(response.data);

    ctx.reply(`✅ Данные успешно извлечены:`);
    ctx.reply(`   - Подписчики: ${result.followers?.length || 0} записей`);
    ctx.reply(`   - Подписки: ${result.following?.length || 0} записей`);
    fullAnalysis(result);
    // await ctx.reply(
    //   "Прочел твой файл корректно, он начинатеся с текста:\n\n" +
    //     JSON.stringify(response.data).substring(0, 100)
    // );
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

function fullAnalysis(extractedData, ctx) {
  ctx.reply("🔍 Тест 3: Анализ и сравнение данных");

  if (!extractedData.followers || !extractedData.following) {
    ctx.reply("⚠️  Нет данных для анализа");
    return;
  }

  try {
    const nonMutualFollowers = review(
      extractedData.followers,
      extractedData.following
    );

    ctx.reply(`✅ Анализ завершен:`);
    ctx.reply(`   - Всего подписчиков: ${extractedData.followers.length}`);
    ctx.reply(`   - Всего подписок: ${extractedData.following.length}`);
    ctx.reply(`   - Не взаимных подписок: ${nonMutualFollowers.length}`);

    // Выводим статистику
    if (nonMutualFollowers.length > 0) {
      const percentage = (
        (nonMutualFollowers.length / extractedData.following.length) *
        100
      ).toFixed(1);
      ctx.reply(`   - Процент не взаимных: ${percentage}%`);

      // Сохраняем полный список не взаимных подписок
      const output = JSON.stringify(
        {
          count: nonMutualFollowers.length,
          percentage: percentage,
          users: nonMutualFollowers,
          timestamp: new Date().toISOString(),
        },
        null,
        2
      );
      ctx.reply(`\n📊 Первые 10 не взаимных подписок:`);
      nonMutualFollowers.slice(0, 10).forEach((user, index) => {
        ctx.reply(`   ${index + 1}. @${user.username} - ${user.href}`);
      });

      if (nonMutualFollowers.length > 10) {
        ctx.reply(
          `   ... и еще ${nonMutualFollowers.length - 10} пользователей`
        );
      }
    } else {
      ctx.reply("🎉 Все ваши подписки взаимны!");
    }

    console.log("");
  } catch (error) {
    ctx.reply(`❌ Ошибка при анализе данных:`, error.message);
    throw error;
  }
}
