// testInstagramAnalyzer.js
const path = require("path");
const fs = require("fs").promises;
const {
  handleZipFileUpload,
  extractFollowersAndFollowing,
  review,
} = require("./functions/actions/instagramAnalyzer");

// Конфигурация теста
const TEST_ZIP_PATH = path.join(__dirname, "test.zip");
const TEST_RESULTS_PATH = path.join(__dirname, "test_results.json");

// Основная функция тестирования
async function runTests() {
  console.log("========================================");
  console.log("ТЕСТИРОВАНИЕ МОДУЛЯ Instagram Analyzer");
  console.log("========================================\n");

  try {
    // Тест 1: Проверка существования тестового файла
    await testFileExists();

    // Тест 2: Извлечение данных из ZIP
    const extractedData = await testExtraction();

    // Тест 3: Анализ данных
    if (extractedData) {
      await testAnalysis(extractedData);
    }

    // Тест 4: Полный цикл обработки
    await testFullProcessing();

    // Тест 5: Обработка ошибок
    await testErrorHandling();

    console.log("\n========================================");
    console.log("ВСЕ ТЕСТЫ ЗАВЕРШЕНЫ");
    console.log("========================================");
  } catch (error) {
    console.error("\n❌ Ошибка при выполнении тестов:", error.message);
    process.exit(1);
  }
}

// Тест 1: Проверка существования файла
async function testFileExists() {
  console.log("📁 Тест 1: Проверка существования test.zip");

  try {
    await fs.access(TEST_ZIP_PATH);
    const stats = await fs.stat(TEST_ZIP_PATH);

    console.log(`✅ Файл найден: ${TEST_ZIP_PATH}`);
    console.log(`   Размер: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`   Дата изменения: ${stats.mtime.toLocaleString()}\n`);

    return true;
  } catch (error) {
    console.error(`❌ Файл test.zip не найден в папке: ${__dirname}`);
    console.error(
      '   Поместите тестовый ZIP-файл в папку с проектом и назовите его "test.zip"'
    );
    throw error;
  }
}

// Тест 2: Извлечение данных из ZIP
async function testExtraction() {
  console.log("📦 Тест 2: Извлечение данных из ZIP-архива");

  try {
    const fileBuffer = await fs.readFile(TEST_ZIP_PATH);
    console.log("✅ ZIP-файл успешно прочитан");

    const result = await extractFollowersAndFollowing(fileBuffer);

    console.log(`✅ Данные успешно извлечены:`);
    console.log(`   - Подписчики: ${result.followers?.length || 0} записей`);
    console.log(`   - Подписки: ${result.following?.length || 0} записей`);

    // Сохраняем извлеченные данные для отладки
    if (result.followers && result.following) {
      await fs.writeFile(
        TEST_RESULTS_PATH,
        JSON.stringify(
          {
            stats: result.stats,
            sample_followers: result.followers.slice(0, 5), // первые 5 записей
            sample_following: result.following.slice(0, 5), // первые 5 записей
            timestamp: new Date().toISOString(),
          },
          null,
          2
        )
      );
      console.log(`✅ Пример данных сохранен в: ${TEST_RESULTS_PATH}\n`);
    }

    return result;
  } catch (error) {
    console.error(`❌ Ошибка при извлечении данных:`, error.message);

    // Дополнительная диагностика
    if (error.message.includes("не найдены в архиве")) {
      await listZipContents();
    }

    throw error;
  }
}

// Тест 3: Анализ данных
async function testAnalysis(extractedData) {
  console.log("🔍 Тест 3: Анализ и сравнение данных");

  if (!extractedData.followers || !extractedData.following) {
    console.log("⚠️  Нет данных для анализа");
    return;
  }

  try {
    const nonMutualFollowers = review(
      extractedData.followers,
      extractedData.following
    );

    console.log(`✅ Анализ завершен:`);
    console.log(`   - Всего подписчиков: ${extractedData.followers.length}`);
    console.log(`   - Всего подписок: ${extractedData.following.length}`);
    console.log(`   - Не взаимных подписок: ${nonMutualFollowers.length}`);

    // Выводим статистику
    if (nonMutualFollowers.length > 0) {
      const percentage = (
        (nonMutualFollowers.length / extractedData.following.length) *
        100
      ).toFixed(1);
      console.log(`   - Процент не взаимных: ${percentage}%`);

      // Сохраняем полный список не взаимных подписок
      const outputPath = path.join(__dirname, "non_mutual_following.json");
      await fs.writeFile(
        outputPath,
        JSON.stringify(
          {
            count: nonMutualFollowers.length,
            percentage: percentage,
            users: nonMutualFollowers,
            timestamp: new Date().toISOString(),
          },
          null,
          2
        )
      );

      console.log(`\n📊 Первые 10 не взаимных подписок:`);
      nonMutualFollowers.slice(0, 10).forEach((user, index) => {
        console.log(`   ${index + 1}. @${user.username} - ${user.href}`);
      });

      if (nonMutualFollowers.length > 10) {
        console.log(
          `   ... и еще ${nonMutualFollowers.length - 10} пользователей`
        );
      }

      console.log(`\n✅ Полный список сохранен в: ${outputPath}`);
    } else {
      console.log("🎉 Все ваши подписки взаимны!");
    }

    console.log("");
  } catch (error) {
    console.error(`❌ Ошибка при анализе данных:`, error.message);
    throw error;
  }
}

// Тест 4: Полный цикл обработки
async function testFullProcessing() {
  console.log("🔄 Тест 4: Полный цикл обработки (handleZipFileUpload)");

  try {
    console.log(`📂 Обработка файла: ${TEST_ZIP_PATH}`);
    const result = await handleZipFileUpload(TEST_ZIP_PATH);

    if (Array.isArray(result)) {
      console.log(`✅ Полный цикл обработки завершен успешно`);
      console.log(`   Результат содержит ${result.length} записей\n`);
    } else {
      console.log(`⚠️  Результат не является массивом\n`);
    }

    return result;
  } catch (error) {
    console.error(`❌ Ошибка при полной обработке:`, error.message);
    throw error;
  }
}

// Тест 5: Обработка ошибок
async function testErrorHandling() {
  console.log("🚨 Тест 5: Проверка обработки ошибок");

  const testCases = [
    {
      name: "Несуществующий файл",
      path: path.join(__dirname, "non_existent.zip"),
      expectedError: true,
    },
    {
      name: "Файл не ZIP",
      path: __filename, // текущий JS файл
      expectedError: true,
    },
    {
      name: "Пустой путь",
      path: "",
      expectedError: true,
    },
  ];

  let passedTests = 0;

  for (const testCase of testCases) {
    try {
      await handleZipFileUpload(testCase.path);

      if (testCase.expectedError) {
        console.log(`❌ "${testCase.name}": Ожидалась ошибка, но ее не было`);
      } else {
        console.log(`✅ "${testCase.name}": Успешно`);
        passedTests++;
      }
    } catch (error) {
      if (testCase.expectedError) {
        console.log(`✅ "${testCase.name}": Корректно обработана ошибка`);
        console.log(`   Сообщение: ${error.message}`);
        passedTests++;
      } else {
        console.log(
          `❌ "${testCase.name}": Неожиданная ошибка: ${error.message}`
        );
      }
    }
  }

  console.log(
    `\n📊 Итог обработки ошибок: ${passedTests}/${testCases.length} тестов пройдено\n`
  );
}

// Вспомогательная функция: список содержимого ZIP
async function listZipContents() {
  try {
    const JSZip = require("jszip");
    const fileBuffer = await fs.readFile(TEST_ZIP_PATH);
    const zip = await JSZip.loadAsync(fileBuffer);

    console.log("\n📁 Содержимое ZIP-архива:");
    console.log("==========================");

    Object.keys(zip.files).forEach((fileName, index) => {
      const file = zip.files[fileName];
      console.log(`${index + 1}. ${fileName} ${file.dir ? "(папка)" : ""}`);
    });

    console.log("==========================\n");
  } catch (error) {
    console.error("Не удалось прочитать содержимое ZIP:", error.message);
  }
}

// Функция для быстрого теста с выводом результатов в консоль
async function quickTest() {
  console.log("🚀 Быстрый тест Instagram Analyzer\n");

  try {
    const nonMutual = await handleZipFileUpload(TEST_ZIP_PATH);

    console.log("\n📊 РЕЗУЛЬТАТЫ:");
    console.log("==============");
    console.log(`Не взаимных подписок: ${nonMutual.length}`);

    if (nonMutual.length > 0) {
      console.log("\nСписок:");
      nonMutual.forEach((user, index) => {
        console.log(`${index + 1}. @${user.username}`);
      });
    }

    return nonMutual;
  } catch (error) {
    console.error("❌ Ошибка:", error.message);
    return null;
  }
}

// Запуск тестов в зависимости от аргументов командной строки
async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--quick") || args.includes("-q")) {
    // Быстрый тест
    await quickTest();
  } else if (args.includes("--list")) {
    // Только список содержимого ZIP
    await listZipContents();
  } else {
    // Полный набор тестов
    await runTests();
  }
}

// Обработка ошибок при запуске
main().catch((error) => {
  console.error("Фатальная ошибка:", error);
  process.exit(1);
});

// Экспорт функций для использования в других тестах
module.exports = {
  runTests,
  quickTest,
  listZipContents,
  testFileExists,
  testExtraction,
  testAnalysis,
  testFullProcessing,
  testErrorHandling,
};
