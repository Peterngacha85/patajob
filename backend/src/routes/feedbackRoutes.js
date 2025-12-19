const express = require('express');
const router = express.Router();
const { 
    createFeedback, 
    getAllFeedback, 
    updateFeedbackStatus, 
    deleteFeedback, 
    getPublicFeedback 
} = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', createFeedback);
router.get('/public', getPublicFeedback);
router.get('/', protect, authorize('admin'), getAllFeedback);
router.put('/:id/status', protect, authorize('admin'), updateFeedbackStatus);
router.delete('/:id', protect, authorize('admin'), deleteFeedback);

module.exports = router;
