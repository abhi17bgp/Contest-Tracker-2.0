const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
    contestId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    platform: { type: String, required: true },
    startTime: { type: Date, required: true },
    duration: { type: Number, required: true },
    url: { type: String, required: true },
    notified: { type: Boolean, default: false },
    pushNotified: { type: Boolean, default: false },
    finalPushNotified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Contest', contestSchema);
