const Booking = require('../models/Booking');
const Provider = require('../models/Provider');

// @desc Create new booking
// @route POST /api/bookings
// @access Private
const createBooking = async (req, res) => {
    const { providerId, service, bookingDate } = req.body;

    try {
        const booking = new Booking({
            userId: req.user.id,
            providerId,
            service,
            bookingDate,
            status: 'pending',
        });

        await booking.save();
        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get bookings for user or provider
// @route GET /api/bookings
// @access Private
const getBookings = async (req, res) => {
    try {
        let matchQuery = {};
        if (req.user.role === 'provider') {
            const provider = await Provider.findOne({ userId: req.user.id });
            if (!provider) return res.status(404).json({ message: 'Provider profile not found' });
            matchQuery = { providerId: provider._id };
        } else {
            matchQuery = { userId: new require('mongoose').Types.ObjectId(req.user.id) };
        }

        const bookings = await Booking.aggregate([
            { $match: matchQuery },
            {
                $lookup: {
                    from: 'reviews',
                    localField: '_id',
                    foreignField: 'bookingId',
                    as: 'reviews'
                }
            },
            {
                $addFields: {
                    isReviewed: { $gt: [{ $size: '$reviews' }, 0] }
                }
            },
            { $unset: 'reviews' },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userId'
                }
            },
            { $unwind: '$userId' },
            {
                $lookup: {
                    from: 'providers',
                    localField: 'providerId',
                    foreignField: '_id',
                    as: 'providerId'
                }
            },
            { $unwind: '$providerId' },
            {
                $lookup: {
                    from: 'users',
                    localField: 'providerId.userId',
                    foreignField: '_id',
                    as: 'providerUserId'
                }
            },
            { $unwind: '$providerUserId' },
            {
                $project: {
                    'userId.password': 0,
                    'providerUserId.password': 0,
                }
            }
        ]);

        // Re-format the population to match the expected frontend structure
        const formattedBookings = bookings.map(b => ({
            ...b,
            providerId: {
                ...b.providerId,
                userId: b.providerUserId
            }
        }));

        res.json(formattedBookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// @desc Update booking status
// @route PUT /api/bookings/:id/status
// @access Private (Provider only)
const updateBookingStatus = async (req, res) => {
    const { status } = req.body;
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        // Check ownership (Provider)
        const provider = await Provider.findOne({ userId: req.user.id });
        if (!provider || booking.providerId.toString() !== provider._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        booking.status = status;
        await booking.save();
        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createBooking, getBookings, updateBookingStatus };
