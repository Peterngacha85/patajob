const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Provider = require('../models/Provider');

// @desc Create review
// @route POST /api/reviews
// @access Private
const createReview = async (req, res) => {
    const { bookingId, rating, comment } = req.body;

    try {
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (booking.status !== 'completed') {
            return res.status(400).json({ message: 'Can only review completed bookings' });
        }

        // Check if already reviewed
        const reviewExists = await Review.findOne({ bookingId });
        if (reviewExists) {
            return res.status(400).json({ message: 'Booking already reviewed' });
        }

        const review = new Review({
            bookingId,
            userId: req.user.id,
            providerId: booking.providerId,
            rating,
            comment,
        });

        await review.save();

        // Update provider rating
        const provider = await Provider.findById(booking.providerId);
        const reviews = await Review.find({ providerId: booking.providerId });
        provider.totalReviews = reviews.length;
        provider.averageRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
        await provider.save();

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get reviews for a provider
// @route GET /api/reviews/:providerId
// @access Public
const getReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ providerId: req.params.providerId }).populate('userId', 'name');
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createReview, getReviews };
