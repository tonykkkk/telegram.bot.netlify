const JSZip = require("jszip");
async function handleZipFileUpload(file) {
  if (!file) {
    console.log("Пожалуйста, выберите файл");
    return;
  }

  if (!file.name.endsWith(".zip")) {
    console.log("Пожалуйста, выберите ZIP файл");
    return;
  }

  try {
    // Показываем индикатор загрузки
    console.log("Обработка файла...");

    // Преобразуем файл в ArrayBuffer для JSZip
    const arrayBuffer = await readFileAsArrayBuffer(file);

    // Извлекаем данные
    const result = await extractFollowersAndFollowing(arrayBuffer);

    console.log("Успешно обработано!");
    console.log("Подписчики:", result.followers);
    console.log("Подписки:", result.following);

    let diff = rewiew(result.followers, result.following);
    return diff;
    //console.log("Статистика:", result.stats);

    // Выводим результат на страницу
    //displayResults(result);
  } catch (error) {
    console.error("Ошибка обработки файла:", error);
    alert("Ошибка при обработке файла: " + error.message);
  }
}

async function extractFollowersAndFollowing(zipFile) {
  try {
    //var zipData = new JSZip();
    // Загружаем ZIP архив
    console.log("Старт загрузки ZIP:", zipFile);
    const zipData = await JSZip.loadAsync(zipFile);

    // Проверяем существование файлов
    const followersPath =
      "connections/followers_and_following/followers_1.json";
    const followingPath = "connections/followers_and_following/following.json";

    if (!zipData.file(followersPath) || !zipData.file(followingPath)) {
      throw new Error("Один или оба файла не найдены в архиве");
    }
    console.log("Успешно загружен ZIP:", zipData);
    // Извлекаем и парсим файлы
    const followersContent = await zipData.file(followersPath).async("text");
    console.log("Успешно загружен followersContent:", followersContent);
    const followingContent = await zipData.file(followingPath).async("text");
    console.log("Успешно загружен followingContent:", followingContent);
    // Парсим JSON
    let followersData = JSON.parse(followersContent);
    let followingData = JSON.parse(followingContent);

    return {
      followers: followersData,
      following: followingData,
    };
  } catch (error) {
    console.error("Ошибка при обработке архива:", error);
    throw error;
  }
}

// Вспомогательная функция для чтения файла как ArrayBuffer
function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      resolve(e.target.result);
    };
    reader.onerror = function (e) {
      reject(new Error("Ошибка чтения файла"));
    };
    reader.readAsArrayBuffer(file);
  });
}

function rewiew(followersData, followingData) {
  try {
    console.log("ПОпытка сравнения файлов");

    if (followingData != null && followersData != null) {
      let following = followingData.relationships_following;

      const hrefFolowers = followersData.map(
        (item) => item.string_list_data[0].value
      );
      const flwrs = new Set(hrefFolowers);
      const diff = following.filter((item) => !flwrs.has(item.title));
      const result = diff.map((item) => item);
      console.log("Данные обработаны успешно:");
      console.log(result);
      return result;
    } else {
      console.log("Один из файлов не указан либо ошибка при чтении");
      return null;
    }
  } catch (error) {
    console.log(new Error(`Ошибка сравнения JSON: ${error.message}`));
  }
}
