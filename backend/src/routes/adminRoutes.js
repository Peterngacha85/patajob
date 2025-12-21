const express = require('express');
const router = express.Router();
const { 
    getPendingProviders, 
    verifyProvider, 
    getAllUsers, 
    getDashboardStats, 
    getAllBookings, 
    getAllProviders,
    deleteUser,
    deleteProvider,
    deleteBooking,
    verifyUser // Import verifyUser
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin')); // Apply admin check to all routes

router.get('/stats', getDashboardStats);
router.get('/pending-providers', getPendingProviders);
router.put('/verify-provider/:id', verifyProvider);

// User routes
router.get('/users', getAllUsers);
// Place bulk routes BEFORE dynamic :id routes to prevent collision
router.put('/users/bulk-verify', require('../controllers/adminController').bulkVerifyUsers);
router.post('/users/bulk-delete', require('../controllers/adminController').bulkDeleteUsers);
router.put('/users/:id/verify', verifyUser);
router.delete('/users/:id', deleteUser);

router.get('/bookings', getAllBookings);
router.delete('/bookings/:id', deleteBooking);

router.get('/providers', getAllProviders);
router.delete('/providers/:id', deleteProvider);
router.delete('/providers/:id/services/:service', require('../controllers/adminController').deleteProviderService);

router.get('/reviews', require('../controllers/adminController').getAllReviews);
router.delete('/reviews/:id', require('../controllers/adminController').deleteReview);

module.exports = router;
