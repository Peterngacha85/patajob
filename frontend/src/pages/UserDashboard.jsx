import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import AuthContext from '../context/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const UserDashboard = () => {
    const { user, updateUser } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('bookings');
    
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
            <h1 className="text-3xl font-bold mb-6 text-primary text-center">User Dashboard</h1>

            {/* Tabs */}
            <div className="flex justify-center border-b mb-8">
                <button 
                    className={`px-6 py-3 font-bold transition ${activeTab === 'bookings' ? 'border-b-4 border-primary text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                    onClick={() => setActiveTab('bookings')}
                >
                    My Bookings
                </button>
                <button 
                    className={`px-6 py-3 font-bold transition ${activeTab === 'profile' ? 'border-b-4 border-primary text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                    onClick={() => setActiveTab('profile')}
                >
                    Profile Settings
                </button>
            </div>

            {activeTab === 'bookings' ? (
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Provider</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Service</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {bookings.map((booking) => (
                                    <tr key={booking._id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-800">
                                            {booking.providerId?.userId?.name || 'Unknown Provider'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{booking.service}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{new Date(booking.bookingDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-black rounded-full shadow-sm
                                                ${booking.status === 'completed' ? 'bg-green-100 text-green-700' : 
                                                booking.status === 'accepted' ? 'bg-blue-100 text-blue-700' : 
                                                booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : 
                                                'bg-yellow-100 text-yellow-700'}`}>
                                                {booking.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {booking.status === 'completed' && (
                                                <button 
                                                    onClick={() => setReviewModal({ ...reviewModal, open: true, bookingId: booking._id })}
                                                    className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-lg transition font-bold"
                                                >
                                                    Leave Review
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {bookings.length === 0 && (
                        <div className="p-12 text-center text-gray-500">
                            <p className="text-xl font-medium mb-2">No bookings found</p>
                            <p className="text-sm">Start by exploring our available service providers!</p>
                        </div>
                    )}
                </div>
            ) : (
                <ClientProfileSettings user={user} updateUser={updateUser} />
            )}

            {/* Review Modal */}
            {reviewModal.open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setReviewModal({...reviewModal, open: false})}></div>
                    <div className="relative bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-2xl font-black mb-6 text-gray-900">Leave a Review</h3>
                        <form onSubmit={handleReviewSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Rating (1-5 Stars)</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(n => (
                                        <button 
                                            key={n}
                                            type="button"
                                            onClick={() => setReviewModal({...reviewModal, rating: n})}
                                            className={`w-10 h-10 rounded-xl font-bold transition ${reviewModal.rating === n ? 'bg-primary text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                        >
                                            {n}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Detailed Comment</label>
                                <textarea 
                                    value={reviewModal.comment} 
                                    onChange={(e) => setReviewModal({...reviewModal, comment: e.target.value})}
                                    className="w-full border-2 border-gray-100 rounded-2xl p-4 focus:border-primary outline-none transition"
                                    rows="4"
                                    placeholder="Share your experience..."
                                    required
                                ></textarea>
                            </div>
                            <div className="flex gap-3">
                                <Button type="button" variant="outline" className="flex-1 rounded-2xl" onClick={() => setReviewModal({...reviewModal, open: false})}>Cancel</Button>
                                <Button type="submit" variant="primary" className="flex-1 rounded-2xl shadow-lg shadow-primary/30">Submit Review</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const ClientProfileSettings = ({ user, updateUser }) => {
    const [formData, setFormData] = useState({ 
        name: user?.name || '', 
        email: user?.email || '', 
        whatsapp: user?.whatsapp || '',
        password: '' 
    });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ text: '', type: '' });
        try {
            const res = await api.put('/auth/profile', formData);
            updateUser(res.data);
            setMsg({ text: 'Profile updated successfully!', type: 'success' });
        } catch (error) {
            setMsg({ text: error.response?.data?.message || 'Error updating profile', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100">
            <h2 className="text-2xl font-black mb-8 text-gray-900 border-b pb-4">Account Settings</h2>
            
            {msg.text && (
                <div className={`p-4 rounded-2xl mb-8 flex items-center gap-2 font-bold animate-in fade-in slide-in-from-top-2 ${msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {msg.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <Input 
                        label="Full Name" 
                        value={formData.name} 
                        onChange={(e) => setFormData({...formData, name: e.target.value})} 
                        required
                    />
                    <Input 
                        label="Email Address" 
                        type="email"
                        value={formData.email} 
                        onChange={(e) => setFormData({...formData, email: e.target.value})} 
                        required
                    />
                </div>
                
                <Input 
                    label="WhatsApp Number (e.g. 2547...)" 
                    value={formData.whatsapp} 
                    onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} 
                    required
                />

                <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200">
                    <Input 
                        label="Change Password (leave blank to keep current)" 
                        type="password"
                        value={formData.password} 
                        onChange={(e) => setFormData({...formData, password: e.target.value})} 
                        placeholder="••••••••"
                    />
                </div>

                <div className="pt-4">
                    <Button type="submit" variant="primary" className="w-full md:w-auto px-12 py-4 rounded-2xl shadow-xl shadow-primary/20" disabled={loading}>
                        {loading ? 'Saving Changes...' : 'Save Profile Changes'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default UserDashboard;
