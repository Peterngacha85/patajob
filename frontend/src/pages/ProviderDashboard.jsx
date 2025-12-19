import { useState, useEffect } from 'react';
import api from '../services/api';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

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
            </div>

            {activeTab === 'profile' && <ProfileSettings />}
            {activeTab === 'bookings' && <BookingRequests />}
        </div>
    );
};

import { COUNTIES, SERVICES } from '../constants/data';

const ProfileSettings = () => {
    const [formData, setFormData] = useState({ services: '', bio: '', county: '', town: '', whatsapp: '' });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/providers/me');
            const { services, bio, location, whatsapp } = res.data;
            setFormData({
                services: services.join(', '),
                bio,
                county: location.county,
                town: location.town,
                whatsapp
            });
        } catch (error) {
            // If 404, it means no profile yet, which is fine
            if (error.response?.status !== 404) {
                console.error(error);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg('');
        try {
            await api.post('/providers', formData);
            setMsg({ text: 'Profile updated successfully!', type: 'success' });
        } catch (error) {
            setMsg({ text: 'Error updating profile', type: 'error' });
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
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.map((booking) => (
                        <tr key={booking._id}>
                            <td className="px-6 py-4 whitespace-nowrap">{booking.userId?.name}</td>
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
            {bookings.length === 0 && <div className="p-6 text-center text-gray-500">No booking requests found.</div>}
        </div>
    );
};

export default ProviderDashboard;
