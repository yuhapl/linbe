const { Telegram } = require('puregram');
const config = require('../config');
const userService = require('./userService');
const xrayService = require('./xrayService');

class BotService {
    constructor() {
        this.telegram = Telegram.fromToken(config.TELEGRAM_TOKEN);
        this.setupHandlers();
    }

    setupHandlers() {
        // Обработчик команды /start
        this.telegram.updates.on('message', async (context) => {
            if (context.text === '/start') {
                await this.handleStart(context);
            }
        });

        // Обработчик инлайн-кнопок
        this.telegram.updates.on('callback_query', async (context) => {
            const action = context.data;
            switch (action) {
                case 'manage':
                    if (this.isAdmin(context.senderId)) {
                        await this.showManagementMenu(context);
                    }
                    break;
                case 'create_user':
                    if (this.isAdmin(context.senderId)) {
                        await this.showCreateUserForm(context);
                    }
                    break;
                case 'list_users':
                    if (this.isAdmin(context.senderId)) {
                        await this.showUsersList(context);
                    }
                    break;
                case 'traffic_stats':
                    if (this.isAdmin(context.senderId)) {
                        await this.showTrafficStats(context);
                    }
                    break;
            }
        });
    }

    isAdmin(userId) {
        return config.ADMIN_IDS.includes(userId.toString());
    }

    async handleStart(context) {
        const message = `Добро пожаловать в Xray Manager!\n\n` +
            `Ваш ID: ${context.senderId}\n` +
            `Статус: ${this.isAdmin(context.senderId) ? 'Администратор' : 'Пользователь'}`;

        const keyboard = {
            inline_keyboard: [
                [{ text: 'Управление', callback_data: 'manage' }]
            ]
        };

        await context.sendMessage(message, { reply_markup: keyboard });
    }

    async showManagementMenu(context) {
        const keyboard = {
            inline_keyboard: [
                [{ text: 'Создать пользователя', callback_data: 'create_user' }],
                [{ text: 'Список пользователей', callback_data: 'list_users' }],
                [{ text: 'Статистика трафика', callback_data: 'traffic_stats' }]
            ]
        };

        await context.editMessageText('Выберите действие:', { reply_markup: keyboard });
    }

    async showCreateUserForm(context) {
        // Здесь будет форма создания пользователя
        await context.editMessageText('Форма создания пользователя будет реализована позже');
    }

    async showUsersList(context) {
        try {
            const users = await userService.getAllUsers();
            let message = 'Список пользователей:\n\n';
            
            for (const user of users) {
                message += `Username: ${user.username}\n` +
                    `Статус: ${user.status}\n` +
                    `Использовано трафика: ${this.formatTraffic(user.usedTraffic)}\n` +
                    `Лимит: ${user.dataLimit ? this.formatTraffic(user.dataLimit) : 'Безлимит'}\n` +
                    `Срок действия: ${user.expire ? new Date(user.expire).toLocaleDateString() : 'Бессрочно'}\n\n`;
            }

            await context.editMessageText(message);
        } catch (error) {
            console.error('Error showing users list:', error);
            await context.editMessageText('Ошибка при получении списка пользователей');
        }
    }

    async showTrafficStats(context) {
        try {
            const users = await userService.getAllUsers();
            let message = 'Статистика трафика:\n\n';
            
            for (const user of users) {
                const stats = await xrayService.getTrafficStats(user.username);
                message += `Username: ${user.username}\n` +
                    `Входящий: ${this.formatTraffic(stats.down)}\n` +
                    `Исходящий: ${this.formatTraffic(stats.up)}\n` +
                    `Всего: ${this.formatTraffic(stats.up + stats.down)}\n\n`;
            }

            await context.editMessageText(message);
        } catch (error) {
            console.error('Error showing traffic stats:', error);
            await context.editMessageText('Ошибка при получении статистики трафика');
        }
    }

    formatTraffic(bytes) {
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let size = bytes;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${size.toFixed(2)} ${units[unitIndex]}`;
    }

    async sendNotification(userId, message) {
        try {
            await this.telegram.api.sendMessage({
                chat_id: userId,
                text: message
            });
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    }
}

module.exports = new BotService(); 