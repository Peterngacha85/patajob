const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Provider',
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
    },
}, {
    timestamps: true,
});

// Static method to calculate average rating
reviewSchema.statics.calculateAverageRating = async function(providerId) {
    const stats = await this.aggregate([
        {
            $match: { providerId }
        },
        {
            $group: {
                _id: '$providerId',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    if (stats.length > 0) {
        await mongoose.model('Provider').findByIdAndUpdate(providerId, {
            totalReviews: stats[0].nRating,
            averageRating: stats[0].avgRating
        });
    } else {
        await mongoose.model('Provider').findByIdAndUpdate(providerId, {
            totalReviews: 0,
            averageRating: 0
        });
    }
};

// Call calculateAverageRating after save
reviewSchema.post('save', function() {
    this.constructor.calculateAverageRating(this.providerId);
});

// Call calculateAverageRating before remove
reviewSchema.post('remove', function() {
    this.constructor.calculateAverageRating(this.providerId);
});

// Also handle findOneAndDelete and findOneAndRemove which are common in modern Mongoose
reviewSchema.post(/^findOneAnd/, async function(doc) {
    if (doc) {
        await doc.constructor.calculateAverageRating(doc.providerId);
    }
});

module.exports = mongoose.model('Review', reviewSchema);
