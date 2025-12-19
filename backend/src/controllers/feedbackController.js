const Feedback = require('../models/Feedback');

// @desc    Create new feedback
// @route   POST /api/feedback
// @access  Public
const createFeedback = async (req, res) => {
    try {
        const { name, email, type, content, userId } = req.body;

        if (!name || !email || !content) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const feedback = await Feedback.create({
            name,
            email,
            type,
            content,
            userId: userId || null
        });

        res.status(201).json({
            message: 'Feedback submitted successfully',
            data: feedback
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all feedback
// @route   GET /api/feedback
// @access  Private/Admin
const getAllFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find().sort({ createdAt: -1 });
        res.status(200).json(feedback);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createFeedback,
    getAllFeedback
};
