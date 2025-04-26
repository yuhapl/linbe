const User = require('../models/User');
const xrayService = require('./xrayService');
const config = require('../config');

class UserService {
    async createUser(userData) {
        try {
            const user = new User({
                username: userData.username,
                telegramId: userData.telegramId,
                dataLimit: userData.dataLimit || config.DEFAULT_DATA_LIMIT,
                expire: userData.expire || this.calculateExpireDate(config.DEFAULT_EXPIRE_DAYS),
                note: userData.note
            });

            await user.save();
            await xrayService.addUser(user);
            return user;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    async deleteUser(username) {
        try {
            const user = await User.findOneAndDelete({ username });
            if (user) {
                await xrayService.removeUser(username);
            }
            return user;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }

    async updateUser(username, updateData) {
        try {
            const user = await User.findOne({ username });
            if (!user) throw new Error('User not found');

            Object.assign(user, updateData);
            await user.save();
            await xrayService.updateUser(user);
            return user;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    async getUser(username) {
        try {
            const user = await User.findOne({ username });
            if (!user) throw new Error('User not found');
            return user;
        } catch (error) {
            console.error('Error getting user:', error);
            throw error;
        }
    }

    async getAllUsers() {
        try {
            return await User.find();
        } catch (error) {
            console.error('Error getting all users:', error);
            throw error;
        }
    }

    async updateTraffic(username) {
        try {
            const user = await User.findOne({ username });
            if (!user) throw new Error('User not found');

            const stats = await xrayService.getTrafficStats(username);
            user.usedTraffic = stats.up + stats.down;
            await user.save();

            // Проверяем лимиты и обновляем статус
            if (user.dataLimit && user.usedTraffic >= user.dataLimit) {
                await user.updateStatus('limited');
            }

            return user;
        } catch (error) {
            console.error('Error updating traffic:', error);
            throw error;
        }
    }

    async checkExpiredUsers() {
        try {
            const now = new Date();
            const expiredUsers = await User.find({
                expire: { $lt: now },
                status: 'active'
            });

            for (const user of expiredUsers) {
                await user.updateStatus('expired');
                await xrayService.updateUser(user);
            }

            return expiredUsers;
        } catch (error) {
            console.error('Error checking expired users:', error);
            throw error;
        }
    }

    async resetUserTraffic(username) {
        try {
            const user = await User.findOne({ username });
            if (!user) throw new Error('User not found');

            await user.resetTraffic();
            await xrayService.updateUser(user);
            return user;
        } catch (error) {
            console.error('Error resetting user traffic:', error);
            throw error;
        }
    }

    calculateExpireDate(days) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date;
    }

    async getUsersNeedingNotification() {
        try {
            const users = await User.find({ status: 'active' });
            const notifications = [];

            for (const user of users) {
                // Проверяем использование трафика
                if (user.dataLimit) {
                    const usagePercent = user.calculateUsagePercent();
                    for (const percent of config.NOTIFY_USAGE_PERCENT) {
                        if (usagePercent >= percent) {
                            notifications.push({
                                user,
                                type: 'traffic',
                                value: percent
                            });
                            break;
                        }
                    }
                }

                // Проверяем срок действия
                if (user.expire) {
                    const daysLeft = user.calculateDaysLeft();
                    for (const days of config.NOTIFY_DAYS_LEFT) {
                        if (daysLeft <= days) {
                            notifications.push({
                                user,
                                type: 'expire',
                                value: days
                            });
                            break;
                        }
                    }
                }
            }

            return notifications;
        } catch (error) {
            console.error('Error getting users needing notification:', error);
            throw error;
        }
    }
}

module.exports = new UserService(); 