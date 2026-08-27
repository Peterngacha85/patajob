const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const buildUserResponse = (user) => ({
    _id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    whatsapp: user.whatsapp,
    facebook: user.facebook,
    tiktok: user.tiktok,
    linkedin: user.linkedin,
    youtube: user.youtube,
    profilePicture: user.profilePicture,
    isEmailVerified: user.isEmailVerified,
    token: generateToken(user.id),
});

// @desc Register new user
// @route POST /api/auth/register
const registerUser = async (req, res) => {
    const { name, email, password, role, whatsapp } = req.body;
    console.log('Register request for:', email);
    try {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address' });
        }

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
                message: 'Registration successful! Your account is pending admin approval. You will be notified once approved.'
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
                facebook: user.facebook,
                tiktok: user.tiktok,
                linkedin: user.linkedin,
                youtube: user.youtube,
                profilePicture: user.profilePicture,
                isEmailVerified: user.isEmailVerified,
                token: generateToken(user.id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Authenticate or register a user via Google Sign-In
// @route POST /api/auth/google
const googleAuth = async (req, res) => {
    const { credential, role, whatsapp } = req.body;
    if (!credential) {
        return res.status(400).json({ message: 'Missing Google credential' });
    }
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, picture, sub: googleId, email_verified } = payload;

        if (!email_verified) {
            return res.status(401).json({ message: 'Google account email is not verified' });
        }

        let user = await User.findOne({ email });

        if (user) {
            let changed = false;
            if (!user.googleId) {
                user.googleId = googleId;
                changed = true;
            }
            if (!user.isEmailVerified) {
                user.isEmailVerified = true;
                changed = true;
            }
            if (!user.profilePicture && picture) {
                user.profilePicture = picture;
                changed = true;
            }
            if (changed) await user.save();
        } else {
            user = await User.create({
                name,
                email,
                googleId,
                role: role === 'provider' ? 'provider' : 'user',
                whatsapp: whatsapp || '',
                profilePicture: picture || '',
                isEmailVerified: true,
            });
        }

        res.json(buildUserResponse(user));
    } catch (error) {
        res.status(401).json({ message: 'Google authentication failed: ' + error.message });
    }
};

// @desc Authenticate or register a user via Facebook Login
// @route POST /api/auth/facebook
const facebookAuth = async (req, res) => {
    const { accessToken, role, whatsapp } = req.body;
    if (!accessToken) {
        return res.status(400).json({ message: 'Missing Facebook access token' });
    }
    try {
        const appToken = `${process.env.FACEBOOK_APP_ID}|${process.env.FACEBOOK_APP_SECRET}`;
        const debugRes = await fetch(`https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${appToken}`);
        const debugData = await debugRes.json();

        if (!debugData.data?.is_valid || debugData.data.app_id !== process.env.FACEBOOK_APP_ID) {
            return res.status(401).json({ message: 'Invalid Facebook token' });
        }

        const profileRes = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`);
        const profile = await profileRes.json();

        if (!profile.email) {
            return res.status(400).json({ message: 'Your Facebook account has no email on file. Please use email/password or Google sign-in instead.' });
        }

        const { email, name, id: facebookId, picture } = profile;
        const pictureUrl = picture?.data?.url;

        let user = await User.findOne({ email });

        if (user) {
            let changed = false;
            if (!user.facebookId) {
                user.facebookId = facebookId;
                changed = true;
            }
            if (!user.isEmailVerified) {
                user.isEmailVerified = true;
                changed = true;
            }
            if (!user.profilePicture && pictureUrl) {
                user.profilePicture = pictureUrl;
                changed = true;
            }
            if (changed) await user.save();
        } else {
            user = await User.create({
                name,
                email,
                facebookId,
                role: role === 'provider' ? 'provider' : 'user',
                whatsapp: whatsapp || '',
                profilePicture: pictureUrl || '',
                isEmailVerified: true,
            });
        }

        res.json(buildUserResponse(user));
    } catch (error) {
        res.status(401).json({ message: 'Facebook authentication failed: ' + error.message });
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
            user.whatsapp = req.body.whatsapp !== undefined ? req.body.whatsapp : user.whatsapp;
            user.facebook = req.body.facebook !== undefined ? req.body.facebook : user.facebook;
            user.tiktok = req.body.tiktok !== undefined ? req.body.tiktok : user.tiktok;
            user.linkedin = req.body.linkedin !== undefined ? req.body.linkedin : user.linkedin;
            user.youtube = req.body.youtube !== undefined ? req.body.youtube : user.youtube;
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
                facebook: updatedUser.facebook,
                tiktok: updatedUser.tiktok,
                linkedin: updatedUser.linkedin,
                youtube: updatedUser.youtube,
                profilePicture: updatedUser.profilePicture,
                isEmailVerified: updatedUser.isEmailVerified,
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

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                whatsapp: user.whatsapp,
                facebook: user.facebook,
                tiktok: user.tiktok,
                linkedin: user.linkedin,
                youtube: user.youtube,
                profilePicture: user.profilePicture,
                isEmailVerified: user.isEmailVerified
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, googleAuth, facebookAuth, updateUserProfile, getUserProfile, verifyEmail, uploadAvatar };
