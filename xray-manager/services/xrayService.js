const fs = require('fs').promises;
const path = require('path');
const config = require('../config');

class XrayService {
    constructor() {
        this.configPath = config.XRAY_CONFIG_PATH;
    }

    async readConfig() {
        try {
            const configData = await fs.readFile(this.configPath, 'utf8');
            return JSON.parse(configData);
        } catch (error) {
            console.error('Error reading Xray config:', error);
            throw error;
        }
    }

    async writeConfig(configData) {
        try {
            await fs.writeFile(this.configPath, JSON.stringify(configData, null, 2));
        } catch (error) {
            console.error('Error writing Xray config:', error);
            throw error;
        }
    }

    async addUser(user) {
        const config = await this.readConfig();
        const userConfig = {
            id: user.username,
            email: user.username,
            limitIp: 1,
            up: 0,
            down: 0,
            total: user.dataLimit || 0,
            remark: user.note || '',
            enable: user.status === 'active',
            expiryTime: user.expire ? Math.floor(user.expire.getTime() / 1000) : 0
        };

        // Добавляем пользователя в конфигурацию
        config.inbounds.forEach(inbound => {
            if (inbound.settings && inbound.settings.clients) {
                inbound.settings.clients.push(userConfig);
            }
        });

        await this.writeConfig(config);
        return userConfig;
    }

    async removeUser(username) {
        const config = await this.readConfig();
        
        config.inbounds.forEach(inbound => {
            if (inbound.settings && inbound.settings.clients) {
                inbound.settings.clients = inbound.settings.clients.filter(
                    client => client.email !== username
                );
            }
        });

        await this.writeConfig(config);
    }

    async updateUser(user) {
        await this.removeUser(user.username);
        return this.addUser(user);
    }

    async getTrafficStats(username) {
        const config = await this.readConfig();
        let stats = { up: 0, down: 0 };

        config.inbounds.forEach(inbound => {
            if (inbound.settings && inbound.settings.clients) {
                const client = inbound.settings.clients.find(c => c.email === username);
                if (client) {
                    stats.up += client.up || 0;
                    stats.down += client.down || 0;
                }
            }
        });

        return stats;
    }
}

module.exports = new XrayService(); 