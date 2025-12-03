// instagramAnalyzer.js
const JSZip = require("jszip");
const fs = require("fs").promises;

async function handleZipFileUpload(filePath) {
  if (!filePath) {
    console.log("Пожалуйста, укажите путь к файлу");
    return;
  }

  if (!filePath.endsWith(".zip")) {
    console.log("Пожалуйста, выберите ZIP файл");
    return;
  }

  try {
    console.log("Обработка файла...");

    // Читаем файл как Buffer в Node.js
    const fileBuffer = await fs.readFile(filePath);

    // Извлекаем данные
    const result = await extractFollowersAndFollowing(fileBuffer);

    console.log("Успешно обработано!");
    console.log("Количество подписчиков:", result.followers?.length || 0);
    console.log("Количество подписок:", result.following?.length || 0);

    const diff = review(result.followers, result.following);

    console.log("Не взаимные подписки:", diff?.length || 0);
    return diff;
  } catch (error) {
    console.error("Ошибка обработки файла:", error);
    throw new Error("Ошибка при обработке файла: " + error.message);
  }
}

async function extractFollowersAndFollowing(zipBuffer) {
  try {
    console.log("Старт загрузки ZIP...");
    const zipData = await JSZip.loadAsync(zipBuffer);

    // Проверяем разные возможные пути к файлам
    const possiblePaths = {
      followers: [
        "connections/followers_and_following/followers_1.json",
        "followers_1.json",
        "followers.json",
        "connections/followers.json",
      ],
      following: [
        "connections/followers_and_following/following.json",
        "following.json",
        "connections/following.json",
      ],
    };

    // Находим существующие файлы
    let followersFile, followingFile;

    for (const path of possiblePaths.followers) {
      if (zipData.file(path)) {
        followersFile = zipData.file(path);
        break;
      }
    }

    for (const path of possiblePaths.following) {
      if (zipData.file(path)) {
        followingFile = zipData.file(path);
        break;
      }
    }

    if (!followersFile || !followingFile) {
      console.log("Доступные файлы в архиве:");
      Object.keys(zipData.files).forEach((fileName) => {
        console.log("- " + fileName);
      });
      throw new Error("Файлы followers/following не найдены в архиве");
    }

    console.log("Успешно загружен ZIP");

    // Извлекаем и парсим файлы
    const followersContent = await followersFile.async("text");
    const followingContent = await followingFile.async("text");

    // Парсим JSON
    const followersData = JSON.parse(followersContent);
    const followingData = JSON.parse(followingContent);

    // Нормализуем данные в единый формат
    const normalizedFollowers = normalizeFollowersData(followersData);
    const normalizedFollowing = normalizeFollowingData(followingData);

    return {
      followers: normalizedFollowers,
      following: normalizedFollowing,
      stats: {
        followersCount: normalizedFollowers.length,
        followingCount: normalizedFollowing.length,
      },
    };
  } catch (error) {
    console.error("Ошибка при обработке архива:", error);
    throw error;
  }
}

// Нормализация данных подписчиков
function normalizeFollowersData(data) {
  // Разные форматы Instagram экспорта
  if (Array.isArray(data)) {
    // Формат: массив объектов
    return data.map((item) => {
      if (item.string_list_data && Array.isArray(item.string_list_data)) {
        return {
          username: item.string_list_data[0]?.value || "",
          href: item.string_list_data[0]?.href || "",
        };
      }
      return { username: "", href: "" };
    });
  } else if (data.relationships_followers) {
    // Другой возможный формат
    return data.relationships_followers.map((item) => ({
      username: item.title || "",
      href: item.string_list_data?.[0]?.value || "",
    }));
  }

  return [];
}

// Нормализация данных подписок
function normalizeFollowingData(data) {
  if (
    data.relationships_following &&
    Array.isArray(data.relationships_following)
  ) {
    return data.relationships_following.map((item) => ({
      username: item.title || "",
      href: item.string_list_data?.[0]?.value || "",
    }));
  }

  return [];
}

function review(followersData, followingData) {
  try {
    console.log("Попытка сравнения файлов");

    if (
      !followingData ||
      !followersData ||
      !Array.isArray(followingData) ||
      !Array.isArray(followersData)
    ) {
      console.log("Один из файлов пуст или имеет неверный формат");
      return [];
    }

    // Создаем Set имен пользователей подписчиков для быстрого поиска
    const followerUsernames = new Set(
      followersData
        .map((item) => item.username?.toLowerCase().trim())
        .filter((username) => username) // Убираем пустые значения
    );

    // Находим тех, на кого подписан пользователь, но кто не подписан на него
    const nonMutualFollowing = followingData.filter((item) => {
      const username = item.username?.toLowerCase().trim();
      return username && !followerUsernames.has(username);
    });

    console.log("Данные обработаны успешно:");
    console.log(
      `Не взаимные подписки: ${nonMutualFollowing.length} пользователей`
    );

    return nonMutualFollowing;
  } catch (error) {
    console.error("Ошибка сравнения JSON:", error);
    return [];
  }
}

module.exports = {
  handleZipFileUpload,
  extractFollowersAndFollowing,
  review,
  normalizeFollowersData,
  normalizeFollowingData,
};
