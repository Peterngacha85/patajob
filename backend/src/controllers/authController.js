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
    console.log('Register request for:', email);
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            console.log('User already exists:', email);
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);



        console.log('Creating user in DB...');
        const user = await User.create({ 
            name, 
            email, 
            password: hashedPassword, 
            role, 
            whatsapp
        });
        
        if (user) {
            console.log('User created successfully. Waiting for Admin approval.');
            
            // Return success immediately without sending email
            return res.status(201).json({
                message: 'Registration successful! Your account is pending Admin approval. You will not be able to login or list services until approved.'
            });
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
                return res.status(401).json({ message: 'Account pending Admin approval. Please contact support.' });
            }
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                whatsapp: user.whatsapp,
                profilePicture: user.profilePicture,
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
            user.profilePicture = req.body.profilePicture || user.profilePicture;

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
                profilePicture: updatedUser.profilePicture,
                token: generateToken(updatedUser.id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload profile picture
// @route   POST /api/auth/upload-avatar
// @access  Private
const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        
        // req.file.path contains the Cloudinary URL
        res.json({ imageUrl: req.file.path });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, updateUserProfile, verifyEmail, uploadAvatar };
