const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: function () { return !this.googleId && !this.facebookId; },
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },
    facebookId: {
        type: String,
        unique: true,
        sparse: true,
    },
    role: {
        type: String,
        enum: ['user', 'provider', 'admin'],
        default: 'user',
    },
    whatsapp: {
        type: String,
        default: '',
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    emailVerificationToken: {
        type: String,
    },
    profilePicture: {
        type: String,
        default: '',
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
}, {
    timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
