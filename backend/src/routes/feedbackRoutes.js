const express = require('express');
const router = express.Router();
const { createFeedback, getAllFeedback } = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', createFeedback);
router.get('/', protect, authorize('admin'), getAllFeedback);

module.exports = router;
