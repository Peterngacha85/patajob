const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    services: [{
        type: String,
        required: true,
    }],
    bio: {
        type: String,
    },
    location: {
        county: { type: String, required: true },
        town: { type: String, required: true },
    },
    whatsapp: {
        type: String,
        required: true,
    },
    facebook: {
        type: String,
        default: '',
    },
    tiktok: {
        type: String,
        default: '',
    },
    linkedin: {
        type: String,
        default: '',
    },
    youtube: {
        type: String,
        default: '',
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    averageRating: {
        type: Number,
        default: 0,
    },
    totalReviews: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Provider', providerSchema);
