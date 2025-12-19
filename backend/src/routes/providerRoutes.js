const express = require('express');
const router = express.Router();
const {
    createProviderProfile,
    getProviders,
    getProviderById,
    getCurrentProvider,
} = require('../controllers/providerController');
const { protect } = require('../middleware/authMiddleware');

router.route('/me').get(protect, getCurrentProvider);

router.route('/')
    .post(protect, createProviderProfile)
    .get(getProviders);

router.route('/:id')
    .get(getProviderById);

module.exports = router;
