const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc Register new user
// @route POST /api/auth/register
const registerUser = async (req, res) => {
    const { name, email, password, role, whatsapp } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const emailVerificationToken = crypto.randomBytes(20).toString('hex');

        const user = await User.create({ 
            name, 
            email, 
            password: hashedPassword, 
            role, 
            whatsapp,
            emailVerificationToken
        });
        
        if (user) {
            const verificationUrl = `${process.env.FRONTEND_URL}/verify/${emailVerificationToken}`;
            const message = `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #6d28d9; text-align: center;">Welcome to PataJob!</h2>
                    <p>Hi ${name},</p>
                    <p>Thank you for joining PataJob. To start using our services, please verify your email address by clicking the button below:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationUrl}" style="background-color: #6d28d9; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
                    </div>
                    <p>If the button doesn't work, copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #999; text-align: center;">Fastweb Technologies @ PataJob</p>
                </div>
            `;

            try {
                await sendEmail({
                    email: user.email,
                    subject: 'Verify your PataJob account',
                    message,
                });
                res.status(201).json({
                    message: 'Registration successful! Please check your email to verify your account.'
                });
            } catch (error) {
                // If email fails, we might want to delete the user or provide a way to resend
                console.error('Email Error:', error);
                res.status(201).json({
                    message: 'Registration successful, but we failed to send the verification email. Please contact support.'
                });
            }
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Authenticate user
// @route POST /api/auth/login
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            if (!user.isEmailVerified) {
                return res.status(401).json({ message: 'Please verify your email to login' });
            }
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user.id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Verify email token
// @route GET /api/auth/verify/:token
const verifyEmail = async (req, res) => {
    try {
        const user = await User.findOne({ emailVerificationToken: req.params.token });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        await user.save();

        res.json({ message: 'Email verified successfully! You can now login.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.whatsapp = req.body.whatsapp || user.whatsapp;

            if (req.body.password) {
                // Check if current password is provided if strict security is needed, 
                // but standard practice often allows direct overwrite if authenticated.
                // Adding logic to hash new password.
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password, salt);
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                whatsapp: updatedUser.whatsapp,
                token: generateToken(updatedUser.id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, updateUserProfile, verifyEmail };
