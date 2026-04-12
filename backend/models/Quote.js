const mongoose = require('mongoose');

const QuoteSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        trim: true,
        maxlength: 300
    },
    author: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true // Keeping track of who submitted to prevent spam
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    featuredDate: {
        type: String, // format: "YYYY-MM-DD"
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('Quote', QuoteSchema);
