const mongoose = require('mongoose');
const config = require('./config');
const botService = require('./services/botService');
const userService = require('./services/userService');

// Подключение к MongoDB
mongoose.connect(config.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Запуск бота
botService.telegram.updates.startPolling()
    .then(() => console.log('Bot started'))
    .catch(err => console.error('Bot start error:', err));

// Периодические задачи
setInterval(async () => {
    try {
        // Обновление трафика для всех пользователей
        const users = await userService.getAllUsers();
        for (const user of users) {
            await userService.updateTraffic(user.username);
        }

        // Проверка истекших пользователей
        const expiredUsers = await userService.checkExpiredUsers();
        for (const user of expiredUsers) {
            await botService.sendNotification(
                user.telegramId,
                `Ваш аккаунт истек. Пожалуйста, продлите подписку.`
            );
        }

        // Проверка пользователей, которым нужны уведомления
        const notifications = await userService.getUsersNeedingNotification();
        for (const notification of notifications) {
            const { user, type, value } = notification;
            let message = '';

            if (type === 'traffic') {
                message = `Вы использовали ${value}% вашего трафика.`;
            } else if (type === 'expire') {
                message = `До истечения вашей подписки осталось ${value} дней.`;
            }

            if (message) {
                await botService.sendNotification(user.telegramId, message);
            }
        }
    } catch (error) {
        console.error('Error in periodic tasks:', error);
    }
}, config.TRAFFIC_CHECK_INTERVAL);

// Обработка завершения работы
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
}); 