require('dotenv').config();

module.exports = {
    // Telegram Bot settings
    TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN,
    ADMIN_IDS: process.env.ADMIN_IDS ? process.env.ADMIN_IDS.split(',') : [],
    
    // MongoDB settings
    MONGO_URI: process.env.MONGO_URI,
    
    // Xray settings
    XRAY_CONFIG_PATH: process.env.XRAY_CONFIG_PATH || '/etc/xray/config.json',
    XRAY_API_PORT: process.env.XRAY_API_PORT || 10085,
    
    // User management settings
    DEFAULT_DATA_LIMIT: process.env.DEFAULT_DATA_LIMIT || 10 * 1024 * 1024 * 1024, // 10GB
    DEFAULT_EXPIRE_DAYS: process.env.DEFAULT_EXPIRE_DAYS || 30,
    
    // Traffic tracking settings
    TRAFFIC_CHECK_INTERVAL: process.env.TRAFFIC_CHECK_INTERVAL || 5 * 60 * 1000, // 5 minutes
    
    // Notification settings
    NOTIFY_USAGE_PERCENT: [80, 90, 95], // Notify when usage reaches these percentages
    NOTIFY_DAYS_LEFT: [7, 3, 1] // Notify when these many days are left
}; 