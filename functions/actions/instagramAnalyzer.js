// instagramAnalyzer.js
const JSZip = require("jszip");
const fs = require("fs").promises;
const axios = require("axios"); // Добавляем axios
const path = require("path");

/**
 * Основная функция обработки - поддерживает и локальные файлы и URL
 */
async function analyzeInstagramData(input) {
  try {
    console.log("Начинаю обработку...");

    let zipBuffer;

    // Определяем тип входа: URL или локальный путь
    if (isValidUrl(input)) {
      console.log(`Загружаю файл по URL: ${input}`);
      zipBuffer = await downloadZipFromUrl(input);
    } else if (typeof input === "string" && input.endsWith(".zip")) {
      // Локальный файл
      console.log(`Читаю локальный файл: ${input}`);
      zipBuffer = await fs.readFile(input);
    } else if (Buffer.isBuffer(input)) {
      // Уже буфер
      console.log("Использую предоставленный буфер");
      zipBuffer = input;
    } else {
      throw new Error(
        "Некорректный входной параметр. Должен быть: URL, путь к файлу или Buffer"
      );
    }

    // Извлекаем данные
    const result = await extractFollowersAndFollowing(zipBuffer);

    console.log("Данные успешно извлечены!");
    console.log("Статистика:", result.stats);

    // Анализируем
    const nonMutual = review(result.followers, result.following);

    return {
      nonMutualFollowers: nonMutual,
      stats: {
        ...result.stats,
        nonMutualCount: nonMutual.length,
        mutualPercentage:
          result.following.length > 0
            ? (
                ((result.following.length - nonMutual.length) /
                  result.following.length) *
                100
              ).toFixed(1)
            : 0,
      },
      followers: result.followers,
      following: result.following,
    };
  } catch (error) {
    console.error("Ошибка при анализе:", error.message);
    throw error;
  }
}

/**
 * Загрузка ZIP файла по URL
 */
async function downloadZipFromUrl(url) {
  try {
    const response = await axios({
      method: "GET",
      url: url,
      responseType: "arraybuffer", // Важно: получаем бинарные данные
      timeout: 30000, // 30 секунд таймаут
      maxContentLength: 50 * 1024 * 1024, // 50MB максимум
      headers: {
        "User-Agent": "Instagram-Analyzer/1.0",
      },
    });

    console.log(
      `Файл загружен. Размер: ${(response.data.length / 1024 / 1024).toFixed(
        2
      )} MB`
    );

    return response.data;
  } catch (error) {
    console.error("Ошибка загрузки файла:", error.message);

    if (error.response) {
      console.error(`HTTP статус: ${error.response.status}`);
      throw new Error(
        `Не удалось загрузить файл. HTTP статус: ${error.response.status}`
      );
    } else if (error.request) {
      throw new Error("Не удалось получить ответ от сервера");
    } else {
      throw new Error(`Ошибка при запросе: ${error.message}`);
    }
  }
}

/**
 * Проверка валидности URL
 */
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}

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
          href: item.string_list_data[0]?.href || "123",
        };
      }
      return { username: "", href: "" };
    });
  } else if (data.relationships_followers) {
    // Другой возможный формат
    return data.relationships_followers.map((item) => ({
      username: item.title || "",
      href: item.string_list_data?.[0]?.value || "123",
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
      href: item.string_list_data?.[0]?.href || "",
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
  downloadZipFromUrl,
};
