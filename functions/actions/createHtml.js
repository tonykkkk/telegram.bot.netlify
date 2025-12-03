// createHtmlReport.js
const fs = require("fs").promises;
const path = require("path");

/**
 * Создает HTML страницу с карточками пользователей
 */
async function createHtmlReport(
  nonMutualFollowers,
  outputPath = "./non_mutual_report.html"
) {
  try {
    if (
      !nonMutualFollowers ||
      !Array.isArray(nonMutualFollowers) ||
      nonMutualFollowers.length === 0
    ) {
      throw new Error("Нет данных о пользователях для отчета");
    }

    const htmlContent = generateHtml(nonMutualFollowers);

    await fs.writeFile(outputPath, htmlContent, "utf-8");

    console.log(`✅ HTML отчет создан: ${outputPath}`);
    console.log(`   Открыть: file://${path.resolve(outputPath)}`);

    return outputPath;
  } catch (error) {
    console.error("❌ Ошибка создания HTML отчета:", error.message);
    throw error;
  }
}

/**
 * Генерация HTML контента
 */
function generateHtml(users) {
  const totalCount = users.length;
  const timestamp = new Date().toLocaleString();

  return `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Instagram: Не взаимные подписки (${totalCount})</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .header {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
        }
        
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 2.5rem;
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        h1 .count-badge {
            background: linear-gradient(135deg, #ff416c, #ff4b2b);
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 1.5rem;
        }
        
        .stats {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
            margin-top: 20px;
        }
        
        .stat-card {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            min-width: 200px;
        }
        
        .stat-card h3 {
            font-size: 0.9rem;
            opacity: 0.9;
            margin-bottom: 5px;
        }
        
        .stat-card p {
            font-size: 1.8rem;
            font-weight: bold;
        }
        
        .users-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .user-card {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
        }
        
        .user-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
        }
        
        .avatar {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea, #764ba2);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 15px;
            font-size: 2rem;
            color: white;
            font-weight: bold;
        }
            .username {
            font-size: 1.3rem;
            color: #333;
            margin-bottom: 10px;
            font-weight: 600;
        }
        
        .profile-btn {
            display: inline-block;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            text-decoration: none;
            padding: 12px 25px;
            border-radius: 25px;
            font-weight: 600;
            margin-top: 15px;
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
            width: 100%;
            max-width: 200px;
        }
        
        .profile-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        
        .timestamp {
            font-size: 0.9rem;
            color: #666;
            margin-top: 10px;
        }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            color: rgba(255, 255, 255, 0.8);
            padding: 20px;
        }
        
        .no-users {
            background: white;
            padding: 50px;
            text-align: center;
            border-radius: 15px;
            font-size: 1.2rem;
            color: #333;
        }
        
        .search-bar {
            margin: 20px 0;
            display: flex;
            gap: 10px;
        }
        
        .search-input {
            flex: 1;
            padding: 12px 20px;
            border: 2px solid #e0e0e0;
            border-radius: 25px;
            font-size: 1rem;
            outline: none;
            transition: border-color 0.3s;
        }
        
        .search-input:focus {
            border-color: #667eea;
        }
        
        .search-btn {
            padding: 12px 25px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-weight: 600;
        }
        
        .controls {
            display: flex;
            gap: 10px;
            justify-content: space-between;
            margin-top: 20px;
            flex-wrap: wrap;
        }
        
        .control-btn {
            padding: 10px 20px;
            background: white;
            border: 2px solid #667eea;
            color: #667eea;
            border-radius: 25px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s;
        }
        
        .control-btn:hover {
            background: #667eea;
            color: white;
        }
        
        @media (max-width: 768px) {
            .users-grid {
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            }
            
            .header {
                padding: 20px;
            }
            
            h1 {
                font-size: 2rem;
                flex-direction: column;
                align-items: flex-start;
                gap: 10px;
            }
            
            .stats {
                flex-direction: column;
            }
            
            .stat-card {
                min-width: 100%;
            }
        }
        
        @media (max-width: 480px) {
            .users-grid {
                grid-template-columns: 1fr;
            }
            
            body {
                padding: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>
                <span>Instagram: Не взаимные подписки</span>
                <span class="count-badge">${totalCount}</span>
            </h1>
            <p style="color: #666; margin-top: 10px;">
                Эти пользователи не подписаны на вас в ответ
            </p>
            
            <div class="search-bar">
                <input type="text" 
                       class="search-input" 
                       placeholder="Поиск по имени пользователя..." 
                       id="searchInput" onkeyup="searchUsers()">
                <button class="search-btn" onclick="searchUsers()">Поиск</button>
            </div>
            
            <div class="controls">
                <button class="control-btn" onclick="sortByUsername()">Сортировать по имени</button>
                <button class="control-btn" onclick="sortByDate()">Сортировать по дате</button>
                <button class="control-btn" onclick="showAll()">Показать всех</button>
                <button class="control-btn" onclick="copyAllLinks()">Копировать все ссылки</button>
            </div>
            
            <div class="stats">
                <div class="stat-card">
                    <h3>Всего пользователей</h3>
                    <p>${totalCount}</p>
                </div>
                <div class="stat-card">
                    <h3>Дата анализа</h3>
                    <p>${timestamp}</p>
                </div>
            </div>
        </div>
        
        ${
          users.length > 0
            ? generateUsersGrid(users)
            : `
        <div class="no-users">
            <h2>🎉 Отличные новости!</h2>
            <p>Все ваши подписки взаимны!</p>
        </div>
        `
        }
    </div>
    
    <div class="footer">
        <p>Сгенерировано ${timestamp} • Instagram Analyzer</p>
    </div>
    
    <script>
        // JavaScript функции для интерактивности
        function searchUsers() {
            const input = document.getElementById('searchInput');
            const filter = input.value.toLowerCase();
            const cards = document.querySelectorAll('.user-card');
            
            cards.forEach(card => {
                const username = card.querySelector('.username').textContent.toLowerCase();
                if (username.includes(filter)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        }
        
        function sortByUsername() {
            const container = document.querySelector('.users-grid');
            const cards = Array.from(container.querySelectorAll('.user-card'));
            
            cards.sort((a, b) => {
                const nameA = a.querySelector('.username').textContent.toLowerCase();
                const nameB = b.querySelector('.username').textContent.toLowerCase();
                return nameA.localeCompare(nameB);
            });
            
            cards.forEach(card => container.appendChild(card));
        }
        
        function sortByDate() {
            const container = document.querySelector('.users-grid');
            const cards = Array.from(container.querySelectorAll('.user-card'));
            
            cards.sort((a, b) => {
                const dateA = a.dataset.timestamp || '0';
                const dateB = b.dataset.timestamp || '0';
                return parseInt(dateB) - parseInt(dateA);
            });
            
            cards.forEach(card => container.appendChild(card));
        }
        
        function showAll() {
            const cards = document.querySelectorAll('.user-card');
            cards.forEach(card => {
                card.style.display = 'flex';
            });
            document.getElementById('searchInput').value = '';
        }
        
        function copyAllLinks() {
            const links = Array.from(document.querySelectorAll('.profile-btn'))
                .map(btn => btn.href)
                .join('\\n');
            
            navigator.clipboard.writeText(links)
                .then(() => alert('Все ссылки скопированы в буфер обмена!'))
                .catch(err => alert('Ошибка копирования: ' + err));
        }
        
        // Автоматическое открытие профиля в новой вкладке
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('profile-btn')) {
                e.preventDefault();
                const url = e.target.href;
                window.open(url, '_blank');
            }
        });
        // Инициализация поиска при загрузке
        document.getElementById('searchInput').focus();
    </script>
</body>
</html>`;
}

/**
 * Генерация сетки с карточками пользователей
 */
function generateUsersGrid(users) {
  return `
    <div class="users-grid" id="usersGrid">
        ${users.map((user, index) => generateUserCard(user, index)).join("")}
    </div>
  `;
}

/**
 * Генерация карточки пользователя
 */
function generateUserCard(user, index) {
  const avatarText = user.username.charAt(0).toUpperCase();
  const timestamp = user.timestamp
    ? new Date(user.timestamp * 1000).toLocaleDateString("ru-RU")
    : "Дата неизвестна";

  const href = user.href || `https://instagram.com/${user.username}`;

  return `
    <div class="user-card" data-timestamp="${user.timestamp || 0}">
        <div class="avatar">${avatarText}</div>
        <div class="username">@${user.username}</div>
        ${
          user.timestamp
            ? `<div class="timestamp">Подписка: ${timestamp}</div>`
            : ""
        }
        <a href="${href}" 
           target="_blank" 
           class="profile-btn" 
           title="Открыть профиль в Instagram">
            Перейти в профиль
        </a>
    </div>
  `;
}
/**
 * Альтернативная функция с компактным видом (списком)
 */
async function createCompactHtmlReportForSend(nonMutualFollowers) {
  try {
    const htmlContent = `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Список не взаимных подписок (${nonMutualFollowers.length})</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
        }
        h1 {
            color: #333;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
        }
        .user-item {
            padding: 15px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .user-item:hover {
            background: #f5f5f5;
        }
        .profile-link {
            background: #667eea;
            color: white;
            padding: 8px 15px;
            text-decoration: none;
            border-radius: 4px;
            font-size: 0.9rem;
        }
        .profile-link:hover {
            background: #764ba2;
        }
        .counter {
            background: #667eea;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.9rem;
            margin-left: 10px;
        }
    </style>
</head>
<body>
    <h1>Не взаимные подписки <span class="counter">${
      nonMutualFollowers.length
    }</span></h1>
    <p>Дата: ${new Date().toLocaleString()}</p>
    <div style="margin: 20px 0;">
        <button onclick="copyAllLinks()" style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Копировать все ссылки
        </button>
    </div>
    ${nonMutualFollowers
      .map(
        (user, index) => `
        <div class="user-item">
            <span><strong>${index + 1}.</strong> @${user.username}</span>
            <a href="${user.href || `https://instagram.com/${user.username}`}" 
               target="_blank" 
               class="profile-link">
                Открыть профиль
            </a>
        </div>
    `
      )
      .join("")}
    
    <script>
        function copyAllLinks() {
            const links = [
                ${nonMutualFollowers
                  .map(
                    (user) =>
                      `"${
                        user.href || `https://instagram.com/${user.username}`
                      }"`
                  )
                  .join(",\\n                ")}
            ].join('\\n');
            
            navigator.clipboard.writeText(links)
                .then(() => alert('Все ссылки скопированы!'))
                .catch(err => console.error('Ошибка копирования:', err));
        }
    </script>
</body>
</html>`;

    //await fs.writeFile(outputPath, htmlContent, "utf-8");
    console.log(`✅ Компактный HTML отчет создан: ${outputPath}`);
    return htmlContent;
  } catch (error) {
    console.error("❌ Ошибка создания компактного отчета:", error.message);
    throw error;
  }
}

/**
 * Альтернативная функция с компактным видом (списком)
 */
async function createCompactHtmlReport(
  nonMutualFollowers,
  outputPath = "./non_mutual_compact.html"
) {
  try {
    const htmlContent = `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Список не взаимных подписок (${nonMutualFollowers.length})</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
        }
        h1 {
            color: #333;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
        }
        .user-item {
            padding: 15px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .user-item:hover {
            background: #f5f5f5;
        }
        .profile-link {
            background: #667eea;
            color: white;
            padding: 8px 15px;
            text-decoration: none;
            border-radius: 4px;
            font-size: 0.9rem;
        }
        .profile-link:hover {
            background: #764ba2;
        }
        .counter {
            background: #667eea;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.9rem;
            margin-left: 10px;
        }
    </style>
</head>
<body>
    <h1>Не взаимные подписки <span class="counter">${
      nonMutualFollowers.length
    }</span></h1>
    <p>Дата: ${new Date().toLocaleString()}</p>
    <div style="margin: 20px 0;">
        <button onclick="copyAllLinks()" style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Копировать все ссылки
        </button>
    </div>
    ${nonMutualFollowers
      .map(
        (user, index) => `
        <div class="user-item">
            <span><strong>${index + 1}.</strong> @${user.username}</span>
            <a href="${user.href || `https://instagram.com/${user.username}`}" 
               target="_blank" 
               class="profile-link">
                Открыть профиль
            </a>
        </div>
    `
      )
      .join("")}
    
    <script>
        function copyAllLinks() {
            const links = [
                ${nonMutualFollowers
                  .map(
                    (user) =>
                      `"${
                        user.href || `https://instagram.com/${user.username}`
                      }"`
                  )
                  .join(",\\n                ")}
            ].join('\\n');
            
            navigator.clipboard.writeText(links)
                .then(() => alert('Все ссылки скопированы!'))
                .catch(err => console.error('Ошибка копирования:', err));
        }
    </script>
</body>
</html>`;

    await fs.writeFile(outputPath, htmlContent, "utf-8");
    console.log(`✅ Компактный HTML отчет создан: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error("❌ Ошибка создания компактного отчета:", error.message);
    throw error;
  }
}

/**
 * Главная функция для использования в основном модуле
 */
async function generateReports(nonMutualFollowers) {
  try {
    console.log("\n📄 Генерация HTML отчетов...");

    // Основной отчет
    const mainReport = await createHtmlReport(nonMutualFollowers);

    // Компактный отчет
    const compactReport = await createCompactHtmlReport(
      nonMutualFollowers,
      "./non_mutual_compact.html"
    );

    // JSON отчет (для машинной обработки)
    const jsonReport = {
      generatedAt: new Date().toISOString(),
      count: nonMutualFollowers.length,
      users: nonMutualFollowers,
    };

    await fs.writeFile(
      "./non_mutual_detailed.json",
      JSON.stringify(jsonReport, null, 2),
      "utf-8"
    );

    console.log("✅ Все отчеты сгенерированы:");
    console.log(`   1. Основной: ${mainReport}`);
    console.log(`   2. Компактный: ${compactReport}`);
    console.log(`   3. JSON: ./non_mutual_detailed.json`);

    return {
      mainReport,
      compactReport,
      jsonReport: "./non_mutual_detailed.json",
    };
  } catch (error) {
    console.error("❌ Ошибка генерации отчетов:", error.message);
    throw error;
  }
}

module.exports = {
  createHtmlReport,
  createCompactHtmlReport,
  generateReports,
  createCompactHtmlReportForSend,
};
