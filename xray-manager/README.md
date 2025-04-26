# Xray Manager

Система управления пользователями Xray-core через Telegram бота.

## Возможности

- Управление пользователями (создание, удаление, модификация)
- Отслеживание трафика
- Установка лимитов
- Активация/деактивация пользователей
- Уведомления о приближении лимитов и истечении срока действия
- Интеграция с Xray-core

## Требования

- Node.js 14+
- MongoDB
- Xray-core
- Telegram Bot Token

## Установка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/your-username/xray-manager.git
cd xray-manager
```

2. Установите зависимости:
```bash
npm install
```

3. Создайте файл `.env` на основе `.env.example`:
```bash
cp .env.example .env
```

4. Отредактируйте `.env` файл, указав необходимые параметры:
```
# Telegram Bot settings
TELEGRAM_TOKEN=your_telegram_bot_token
ADMIN_IDS=123456789,987654321

# MongoDB settings
MONGO_URI=mongodb://localhost:27017/xray-manager

# Xray settings
XRAY_CONFIG_PATH=/etc/xray/config.json
XRAY_API_PORT=10085

# User management settings
DEFAULT_DATA_LIMIT=10737418240  # 10GB in bytes
DEFAULT_EXPIRE_DAYS=30

# Traffic tracking settings
TRAFFIC_CHECK_INTERVAL=300000  # 5 minutes in milliseconds
```

## Запуск

```bash
npm start
```

## Использование

1. Запустите бота в Telegram
2. Отправьте команду `/start`
3. Для администраторов будет доступно меню управления
4. Используйте кнопки для управления пользователями и просмотра статистики

## Структура проекта

```
xray-manager/
├── config.js           # Конфигурация приложения
├── index.js           # Основной файл приложения
├── models/
│   └── User.js        # Модель пользователя
├── services/
│   ├── botService.js  # Сервис для работы с Telegram ботом
│   ├── userService.js # Сервис для управления пользователями
│   └── xrayService.js # Сервис для работы с Xray-core
└── .env               # Переменные окружения
```

## Безопасность

- Все чувствительные данные хранятся в переменных окружения
- Доступ к управлению только у администраторов
- Безопасное хранение паролей и токенов

## Лицензия

MIT 