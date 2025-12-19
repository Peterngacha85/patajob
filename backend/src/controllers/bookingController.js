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
        let bookings;
        if (req.user.role === 'provider') {
            // Find provider profile first
            const provider = await Provider.findOne({ userId: req.user.id });
            if (!provider) return res.status(404).json({ message: 'Provider profile not found' });
            bookings = await Booking.find({ providerId: provider._id })
                .populate('userId', 'name email')
                .populate({
                    path: 'providerId',
                    populate: { path: 'userId', select: 'name email' }
                });
        } else {
             bookings = await Booking.find({ userId: req.user.id })
                .populate('userId', 'name email')
                .populate({
                    path: 'providerId',
                    populate: { path: 'userId', select: 'name email' }
                });
        }
        res.json(bookings);
    } catch (error) {
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
