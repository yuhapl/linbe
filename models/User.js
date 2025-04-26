const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    telegramId: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['active', 'disabled', 'expired', 'limited'],
        default: 'active'
    },
    usedTraffic: {
        type: Number,
        default: 0
    },
    dataLimit: {
        type: Number,
        default: null
    },
    expire: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastStatusChange: {
        type: Date,
        default: Date.now
    },
    note: {
        type: String,
        default: null
    },
    onlineAt: {
        type: Date,
        default: null
    },
    usageLogs: [{
        usedTrafficAtReset: Number,
        resetAt: {
            type: Date,
            default: Date.now
        }
    }]
});

// Методы для работы с пользователем
userSchema.methods.resetTraffic = function() {
    this.usageLogs.push({
        usedTrafficAtReset: this.usedTraffic,
        resetAt: new Date()
    });
    this.usedTraffic = 0;
    return this.save();
};

userSchema.methods.updateStatus = function(newStatus) {
    this.status = newStatus;
    this.lastStatusChange = new Date();
    return this.save();
};

userSchema.methods.calculateUsagePercent = function() {
    if (!this.dataLimit) return 0;
    return (this.usedTraffic / this.dataLimit) * 100;
};

userSchema.methods.calculateDaysLeft = function() {
    if (!this.expire) return null;
    const now = new Date();
    const diffTime = this.expire - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const User = mongoose.model('User', userSchema);

module.exports = User; 