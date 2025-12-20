const Provider = require('../models/Provider');
const User = require('../models/User');

// @desc    Create or update provider profile
// @route   POST /api/providers
// @access  Private
const createProviderProfile = async (req, res) => {
    const { services, bio, county, town, whatsapp } = req.body;

    const providerFields = {
        userId: req.user.id,
        services: Array.isArray(services) ? services : services.split(',').map(s => s.trim()),
        bio,
        location: { county, town },
        whatsapp,
    };

    // Check if user is approved (isEmailVerified is now used as Manual Admin Approval)
    if (!req.user.isEmailVerified) {
        return res.status(403).json({ message: 'Account not approved. Contact admin to list services.' });
    }

    try {
        let provider = await Provider.findOne({ userId: req.user.id });

        if (provider) {
            // Update
            provider = await Provider.findOneAndUpdate(
                { userId: req.user.id },
                { $set: providerFields },
                { new: true }
            );
            return res.json(provider);
        }

        // Create
        provider = new Provider(providerFields);
        await provider.save();

        // Update user role to provider if not already, and if NOT admin
        const currentUser = await User.findById(req.user.id);
        if (currentUser.role !== 'admin') {
            await User.findByIdAndUpdate(req.user.id, { role: 'provider' });
        }

        res.status(201).json(provider);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

// @desc    Get all providers
// @route   GET /api/providers
// @access  Public
const getProviders = async (req, res) => {
    try {
        const { service, county, town } = req.query;
        
        // Temporarily showing all providers while the user verifies admin dashboard functionality
        let query = {}; // { isVerified: true };

        if (service) {
            query.services = { $regex: service, $options: 'i' };
        }
        if (county) {
            query['location.county'] = { $regex: county, $options: 'i' };
        }
        if (town) {
            query['location.town'] = { $regex: town, $options: 'i' };
        }

        const providers = await Provider.find(query)
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        res.json(providers);
    } catch (error) {
        console.error("error fetching providers:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get provider by ID
// @route   GET /api/providers/:id
// @access  Public
const getProviderById = async (req, res) => {
    try {
        const provider = await Provider.findById(req.params.id).populate('userId', ['name', 'email', 'whatsapp']);

        if (!provider) {
            return res.status(404).json({ message: 'Provider not found' });
        }

        res.json(provider);
    } catch (error) {
        console.error(error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Provider not found' });
        }
        res.status(500).send('Server Error');
    }
};

// @desc    Get current provider profile
// @route   GET /api/providers/me
// @access  Private
const getCurrentProvider = async (req, res) => {
    try {
        const provider = await Provider.findOne({ userId: req.user.id }).populate('userId', ['name', 'email', 'whatsapp']);
        if (!provider) {
            return res.status(404).json({ message: 'Provider profile not found' });
        }
        res.json(provider);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    createProviderProfile,
    getProviders,
    getProviderById,
    getCurrentProvider,
};
