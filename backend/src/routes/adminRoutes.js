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
    deleteBooking
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin')); // Apply admin check to all routes

router.get('/stats', getDashboardStats);
router.get('/pending-providers', getPendingProviders);
router.put('/verify-provider/:id', verifyProvider);

router.put('/verify-provider/:id', verifyProvider);

router.get('/users', getAllUsers);
router.put('/users/:id/verify', require('../controllers/adminController').verifyUser);
router.delete('/users/:id', deleteUser);

router.get('/bookings', getAllBookings);
router.delete('/bookings/:id', deleteBooking);

router.get('/providers', getAllProviders);
router.delete('/providers/:id', deleteProvider);
router.delete('/providers/:id/services/:service', require('../controllers/adminController').deleteProviderService);

module.exports = router;
