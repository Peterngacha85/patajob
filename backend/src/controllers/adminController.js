const User = require('../models/User');
const Provider = require('../models/Provider');

// @desc Get all pending providers
// @route GET /api/admin/pending-providers
// @access Private/Admin
const getPendingProviders = async (req, res) => {
    try {
        const providers = await Provider.find({ isVerified: false }).populate('userId', 'name email');
        res.json(providers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Verify a provider
// @route PUT /api/admin/verify-provider/:id
// @access Private/Admin
const verifyProvider = async (req, res) => {
    try {
        const provider = await Provider.findById(req.params.id);
        if (!provider) return res.status(404).json({ message: 'Provider not found' });

        provider.isVerified = true;
        await provider.save();

        res.json({ message: 'Provider verified', provider });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get all users
// @route GET /api/admin/users
// @access Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const Booking = require('../models/Booking');

// @desc Get admin dashboard stats
// @route GET /api/admin/stats
// @access Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({});
        const totalProviders = await Provider.countDocuments({});
        const totalBookings = await Booking.countDocuments({});
        const pendingProviders = await Provider.countDocuments({ isVerified: false });

        res.json({
            totalUsers,
            totalProviders,
            totalBookings,
            pendingProviders
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get all bookings
// @route GET /api/admin/bookings
// @access Private/Admin
const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({})
            .populate('userId', 'name email')
            .populate('providerId', 'location services') // Simplify populate
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get all providers
// @route GET /api/admin/providers
// @access Private/Admin
const getAllProviders = async (req, res) => {
    try {
        const providers = await Provider.find({}).populate('userId', 'name email');
        res.json(providers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Delete user
// @route DELETE /api/admin/users/:id
// @access Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Cascade delete provider profile
        if (user.role === 'provider') {
            await Provider.findOneAndDelete({ userId: user._id });
        }
        
        // Cascade delete bookings (optional, but good for cleanup)
        await Booking.deleteMany({ userId: user._id });

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Delete provider
// @route DELETE /api/admin/providers/:id
// @access Private/Admin
const deleteProvider = async (req, res) => {
    try {
        const provider = await Provider.findById(req.params.id);
        if (!provider) return res.status(404).json({ message: 'Provider not found' });

        // Downgrade user role
        await User.findByIdAndUpdate(provider.userId, { role: 'user' });

        // Cascade delete bookings associated with this provider
        await Booking.deleteMany({ providerId: provider._id });

        await Provider.findByIdAndDelete(req.params.id);
        res.json({ message: 'Provider and associated bookings removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Delete booking
// @route DELETE /api/admin/bookings/:id
// @access Private/Admin
const deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        await Booking.findByIdAndDelete(req.params.id);
        res.json({ message: 'Booking deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Delete specific service from provider
// @route DELETE /api/admin/providers/:id/services/:service
// @access Private/Admin
const deleteProviderService = async (req, res) => {
    try {
        const { id, service } = req.params;
        const provider = await Provider.findById(id);
        
        if (!provider) {
            return res.status(404).json({ message: 'Provider not found' });
        }

        // Case insensitive removal
        const serviceToRemove = decodeURIComponent(service);
        provider.services = provider.services.filter(s => s.toLowerCase() !== serviceToRemove.toLowerCase());
        
        await provider.save();
        res.json({ message: `Service '${serviceToRemove}' removed`, provider });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    getPendingProviders, 
    verifyProvider, 
    getAllUsers, 
    getDashboardStats, 
    getAllBookings, 
    getAllProviders,
    deleteUser,
    deleteProvider,
    deleteBooking,
    deleteProviderService
};
