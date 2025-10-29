const { getUser } = require("../components/helper");

module.exports = async (ctx) => {
  const { id, isBot, name } = getUser(ctx.from);

  if (isBot) {
    return ctx.reply(`Sorry I only interact with humans!`);
  }

  try {
    return ctx.reply(`Привет! Пришли мне файлы`);
  } catch (e) {
    return ctx.reply(`Error occured`);
  }
};
