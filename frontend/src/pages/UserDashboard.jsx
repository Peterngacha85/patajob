import { useState, useEffect } from 'react';
import api from '../services/api';
import Button from '../components/common/Button';

const UserDashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    // State for review modal
    const [reviewModal, setReviewModal] = useState({ open: false, bookingId: null, rating: 5, comment: '' });

    const fetchBookings = async () => {
        try {
            const res = await api.get('/bookings');
            setBookings(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/reviews', {
                bookingId: reviewModal.bookingId,
                rating: reviewModal.rating,
                comment: reviewModal.comment
            });
            setReviewModal({ open: false, bookingId: null, rating: 5, comment: '' });
            alert('Review submitted!');
        } catch (error) {
            alert(error.response?.data?.message || 'Error submitting review');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-primary">My Bookings</h1>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {bookings.map((booking) => (
                            <tr key={booking._id}>
                                <td className="px-6 py-4 whitespace-nowrap">{booking.providerId?.userId?.name || 'Unknown'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{booking.service}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(booking.bookingDate).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-bold rounded-full 
                                        ${booking.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                          booking.status === 'accepted' ? 'bg-blue-100 text-blue-800' : 
                                          booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                                          'bg-yellow-100 text-yellow-800'}`}>
                                        {booking.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {booking.status === 'completed' && (
                                        <button 
                                            onClick={() => setReviewModal({ ...reviewModal, open: true, bookingId: booking._id })}
                                            className="text-indigo-600 hover:text-indigo-900"
                                        >
                                            Leave Review
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {bookings.length === 0 && <div className="p-6 text-center text-gray-500">No bookings found.</div>}
            </div>

            {/* Review Modal - Simplified inline */}
            {reviewModal.open && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                        <h3 className="text-lg font-bold mb-4">Leave a Review</h3>
                        <form onSubmit={handleReviewSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Rating (1-5)</label>
                                <select 
                                    value={reviewModal.rating} 
                                    onChange={(e) => setReviewModal({...reviewModal, rating: Number(e.target.value)})}
                                    className="w-full border rounded p-2"
                                >
                                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Comment</label>
                                <textarea 
                                    value={reviewModal.comment} 
                                    onChange={(e) => setReviewModal({...reviewModal, comment: e.target.value})}
                                    className="w-full border rounded p-2"
                                    rows="3"
                                    required
                                ></textarea>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setReviewModal({...reviewModal, open: false})}>Cancel</Button>
                                <Button type="submit" variant="primary">Submit</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
