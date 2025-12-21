import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import AuthContext from '../context/AuthContext';

const ProviderDashboard = () => {
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-primary text-center">Provider Dashboard</h1>
            
            <div className="flex justify-center border-b mb-6">
                <button 
                    className={`px-4 py-2 font-medium ${activeTab === 'profile' ? 'border-b-2 border-accent text-accent' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('profile')}
                >
                    Profile Settings
                </button>
                <button 
                    className={`px-4 py-2 font-medium ${activeTab === 'bookings' ? 'border-b-2 border-accent text-accent' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('bookings')}
                >
                    Booking Requests
                </button>
                <button 
                    className={`px-4 py-2 font-medium ${activeTab === 'reviews' ? 'border-b-2 border-accent text-accent' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('reviews')}
                >
                    My Reviews
                </button>
            </div>

            {activeTab === 'profile' && <ProfileSettings />}
            {activeTab === 'bookings' && <BookingRequests />}
            {activeTab === 'reviews' && <ProviderReviews />}
        </div>
    );
};

import { COUNTIES, SERVICES } from '../constants/data';

const ProfileSettings = () => {
    const { user, updateUser } = useContext(AuthContext);
    const [formData, setFormData] = useState({ 
        name: user?.name || '', 
        email: user?.email || '', 
        password: '', 
        services: '', 
        bio: '', 
        county: '', 
        town: '', 
        whatsapp: user?.whatsapp || '',
        profilePicture: user?.profilePicture || ''
    });
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/providers/me');
            const { services, bio, location, whatsapp, userId } = res.data;
            setFormData({
                name: userId?.name || '',
                email: userId?.email || '',
                password: '',
                services: services?.join(', ') || '',
                bio: bio || '',
                county: location?.county || '',
                town: location?.town || '',
                whatsapp: whatsapp || userId?.whatsapp || '',
                profilePicture: userId?.profilePicture || ''
            });
        } catch (error) {
            // If 404, it means no profile yet, which is fine
            if (error.response?.status !== 404) {
                console.error(error);
            }
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        setUploading(true);
        try {
            const res = await api.post('/auth/upload-avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, profilePicture: res.data.imageUrl }));
        } catch (error) {
            console.error(error);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg('');
        try {
            // 1. Update User Profile (Name, Email, Password)
            const userRes = await api.put('/auth/profile', {
                name: formData.name,
                email: formData.email, // Assuming email can optionally be updated
                password: formData.password || undefined,
                whatsapp: formData.whatsapp, // Sync whatsapp
                profilePicture: formData.profilePicture
            });
            updateUser(userRes.data);

            // 2. Update Provider Profile (Services, Bio, Location)
            await api.post('/providers', {
                services: formData.services,
                bio: formData.bio,
                county: formData.county, 
                town: formData.town, 
                whatsapp: formData.whatsapp 
            });

            setMsg({ text: 'Profile updated successfully!', type: 'success' });
            setFormData(prev => ({ ...prev, password: '' })); // Clear password
        } catch (error) {
            console.error(error);
            setMsg({ text: error.response?.data?.message || 'Error updating profile', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const addService = (service) => {
        const currentServices = formData.services ? formData.services.split(',').map(s => s.trim()) : [];
        if (!currentServices.includes(service)) {
            const newServices = [...currentServices, service].filter(Boolean).join(', ');
            setFormData({ ...formData, services: newServices });
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
            {msg.text && <div className={`p-3 rounded mb-4 ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{msg.text}</div>}
            <form onSubmit={handleSubmit}>
                {/* User Details Section */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Account Details</h3>
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
                        disabled={true}
                    />
                    <Input 
                        label="Change Password (leave blank to keep current)" 
                        type="password" 
                        value={formData.password} 
                        onChange={(e) => setFormData({...formData, password: e.target.value})} 
                    />

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 border-2 border-primary/20">
                                {formData.profilePicture ? (
                                    <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl font-bold">
                                        {formData.name?.charAt(0) || '?'}
                                    </div>
                                )}
                            </div>
                            <div className="flex-grow">
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleImageUpload}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                                    disabled={uploading}
                                />
                                {uploading && <p className="text-xs text-primary mt-1 animate-pulse">Uploading to Cloudinary...</p>}
                                <p className="text-[10px] text-gray-400 mt-1">Recommended: Square image, max 5MB</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Services (comma separated)</label>
                    <input 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 mb-2"
                        value={formData.services} 
                        onChange={(e) => setFormData({...formData, services: e.target.value})} 
                        placeholder="e.g. Plumber, Electrician"
                        required
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                        {SERVICES.slice(0, 10).map(s => (
                            <button 
                                key={s} 
                                type="button" 
                                onClick={() => addService(s)}
                                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition"
                            >
                                + {s}
                            </button>
                        ))}
                        <span className="text-xs text-gray-400 self-center">...and more</span>
                    </div>
                </div>

                <Input 
                    label="Bio" 
                    value={formData.bio} 
                    onChange={(e) => setFormData({...formData, bio: e.target.value})} 
                    placeholder="Tell us about your services..."
                />
                <div className="grid grid-cols-2 gap-4">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">County</label>
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                            value={formData.county} 
                            onChange={(e) => setFormData({...formData, county: e.target.value})}
                            required
                        >
                            <option value="">Select County</option>
                            {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <Input 
                        label="Town" 
                        value={formData.town} 
                        onChange={(e) => setFormData({...formData, town: e.target.value})} 
                        required
                    />
                </div>
                <Input 
                    label="WhatsApp Number" 
                    value={formData.whatsapp} 
                    onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} 
                    placeholder="2547..."
                    required
                />
                <Button type="submit" variant="accent" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Profile'}
                </Button>
            </form>
        </div>
    );
};

const BookingRequests = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.put(`/bookings/${id}/status`, { status });
            fetchBookings(); // Refresh
        } catch (error) {
            console.error(error);
            alert('Error updating status');
        }
    };

    if (loading) return <div>Loading requests...</div>;

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {bookings.map((booking) => (
                            <tr key={booking._id}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium">{booking.userId?.name || 'Deleted User'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{booking.service}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {new Date(booking.bookingDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                </td>
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
                                    {booking.status === 'pending' && (
                                        <>
                                            <button onClick={() => handleStatusUpdate(booking._id, 'accepted')} className="text-green-600 hover:text-green-900 mr-4">Accept</button>
                                            <button onClick={() => handleStatusUpdate(booking._id, 'cancelled')} className="text-red-600 hover:text-red-900">Reject</button>
                                        </>
                                    )}
                                    {booking.status === 'accepted' && (
                                        <button onClick={() => handleStatusUpdate(booking._id, 'completed')} className="text-blue-600 hover:text-blue-900">Mark Completed</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-100">
                {bookings.map((booking) => (
                    <div key={booking._id} className="p-4 bg-white hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="font-bold text-gray-900">{booking.userId?.name || 'Deleted User'}</p>
                                <p className="text-sm text-primary font-medium">{booking.service}</p>
                            </div>
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase
                                ${booking.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                  booking.status === 'accepted' ? 'bg-blue-100 text-blue-800' : 
                                  booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                                  'bg-yellow-100 text-yellow-800'}`}>
                                {booking.status}
                            </span>
                        </div>
                        <div className="text-xs text-gray-500 mb-4">
                            <p>{new Date(booking.bookingDate).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}</p>
                        </div>
                        <div className="flex gap-2">
                            {booking.status === 'pending' && (
                                <>
                                    <button 
                                        onClick={() => handleStatusUpdate(booking._id, 'accepted')} 
                                        className="flex-1 bg-green-500 text-white text-xs py-2 rounded-lg font-bold hover:bg-green-600 transition"
                                    >
                                        Accept
                                    </button>
                                    <button 
                                        onClick={() => handleStatusUpdate(booking._id, 'cancelled')} 
                                        className="flex-1 bg-red-100 text-red-600 text-xs py-2 rounded-lg font-bold hover:bg-red-200 transition"
                                    >
                                        Reject
                                    </button>
                                </>
                            )}
                            {booking.status === 'accepted' && (
                                <button 
                                    onClick={() => handleStatusUpdate(booking._id, 'completed')} 
                                    className="w-full bg-blue-500 text-white text-xs py-2 rounded-lg font-bold hover:bg-blue-600 transition"
                                >
                                    Mark Completed
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {bookings.length === 0 && <div className="p-6 text-center text-gray-500">No booking requests found.</div>}
        </div>
    );
};

const ProviderReviews = () => {
    const { user } = useContext(AuthContext);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                // We need the provider ID, not user ID.
                const providerRes = await api.get('/providers/me');
                const res = await api.get(`/reviews/${providerRes.data._id}`);
                setReviews(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading reviews...</div>;

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
            <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-4">Client Feedback</h2>
            
            {reviews.length > 0 ? (
                <div className="grid gap-6">
                    {reviews.map((review) => (
                        <div key={review._id} className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                                        {review.userId?.name?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800">{review.userId?.name || 'Anonymous'}</p>
                                        <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center text-yellow-500 bg-white px-3 py-1.5 rounded-xl shadow-sm border border-gray-100">
                                    <Star size={16} fill="currentColor" className="mr-1.5" />
                                    <span className="font-black text-sm">{review.rating}</span>
                                </div>
                            </div>
                            <p className="text-gray-600 italic">"{review.comment}"</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 font-medium">No reviews yet. Complete bookings to get feedback from clients!</p>
                </div>
            )}
        </div>
    );
};

export default ProviderDashboard;
