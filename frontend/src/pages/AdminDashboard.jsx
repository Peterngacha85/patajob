import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import AuthContext from '../context/AuthContext';
import { Users, Briefcase, Calendar, AlertCircle, CheckCircle, XCircle, User, MessageSquare } from 'lucide-react';

const AdminDashboard = () => {
    const { user, updateUser } = useContext(AuthContext); 
    const [stats, setStats] = useState({ totalUsers: 0, totalProviders: 0, totalBookings: 0, pendingProviders: 0 });
    const [pendingProviders, setPendingProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('users');

    const fetchData = async () => {
        try {
            const [statsRes, pendingRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/pending-providers')
            ]);
            setStats(statsRes.data);
            setPendingProviders(pendingRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleVerify = async (id) => {
        if (!window.confirm('Are you sure you want to verify this provider?')) return;
        try {
            await api.put(`/admin/verify-provider/${id}`);
            fetchData(); // Refresh all data
        } catch (error) {
            alert('Error verifying provider');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard 
                    title="Total Users" 
                    value={stats.totalUsers} 
                    icon={<Users size={24} className="text-blue-600" />} 
                    color="bg-blue-50"
                    onClick={() => setActiveTab('users')}
                />
                <StatCard 
                    title="Total Providers" 
                    value={stats.totalProviders} 
                    icon={<Briefcase size={24} className="text-purple-600" />} 
                    color="bg-purple-50"
                    onClick={() => setActiveTab('providers')}
                />
                <StatCard 
                    title="Total Bookings" 
                    value={stats.totalBookings} 
                    icon={<Calendar size={24} className="text-green-600" />} 
                    color="bg-green-50"
                    onClick={() => setActiveTab('bookings')}
                />
                <StatCard 
                    title="Pending Verifications" 
                    value={stats.pendingProviders} 
                    icon={<AlertCircle size={24} className="text-orange-600" />} 
                    color="bg-orange-50"
                    onClick={() => setActiveTab('providers')} 
                />
            </div>

            {/* Pending Verifications Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <AlertCircle size={20} className="text-orange-500" />
                        Pending Approvals
                    </h2>
                    <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">
                        {pendingProviders.length} Pending
                    </span>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Provider Details</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Services</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {pendingProviders.length > 0 ? (
                                pendingProviders.map((p) => (
                                    <tr key={p._id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full overflow-hidden flex items-center justify-center text-primary font-bold border border-primary/10">
                                                    {p.userId?.profilePicture ? (
                                                        <img src={p.userId.profilePicture} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        p.userId?.name.charAt(0)
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{p.userId?.name}</div>
                                                    <div className="text-sm text-gray-500">{p.userId?.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {p.location.town}, {p.location.county}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <div className="flex flex-wrap gap-1">
                                                {p.services.map((s, i) => (
                                                    <span key={i} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{s}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                Pending Verification
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => handleVerify(p._id)} 
                                                    className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-lg transition"
                                                >
                                                    Approve
                                                </button>
                                                <button 
                                                    onClick={async () => {
                                                        if (!window.confirm('Are you sure you want to reject and delete this provider application?')) return;
                                                        try {
                                                            await api.delete(`/admin/providers/${p._id}`);
                                                            fetchData(); // Refresh list
                                                        } catch (error) {
                                                            alert('Error deleting provider');
                                                        }
                                                    }} 
                                                    className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg transition"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <CheckCircle size={48} className="text-green-400 mb-2" />
                                            <p className="text-lg font-medium">All caught up!</p>
                                            <p className="text-sm">No pending provider verifications.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex border-b border-gray-200">
                    <button 
                        onClick={() => setActiveTab('users')}
                        className={`px-6 py-3 font-medium text-sm transition ${activeTab === 'users' ? 'border-b-2 border-primary text-primary bg-primary/5' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        All Users
                    </button>
                    <button 
                        onClick={() => setActiveTab('providers')}
                        className={`px-6 py-3 font-medium text-sm transition ${activeTab === 'providers' ? 'border-b-2 border-primary text-primary bg-primary/5' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        All Providers
                    </button>
                    <button 
                        onClick={() => setActiveTab('bookings')}
                        className={`px-6 py-3 font-medium text-sm transition ${activeTab === 'bookings' ? 'border-b-2 border-primary text-primary bg-primary/5' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        All Bookings
                    </button>
                    <button 
                        onClick={() => setActiveTab('profile')}
                        className={`px-6 py-3 font-medium text-sm transition ${activeTab === 'profile' ? 'border-b-2 border-primary text-primary bg-primary/5' : 'text-gray-500 hover:text-gray-700'} flex items-center gap-2`}
                    >
                        <User size={16} />
                        Profile
                    </button>
                    <button 
                        onClick={() => setActiveTab('feedback')}
                        className={`px-6 py-3 font-medium text-sm transition ${activeTab === 'feedback' ? 'border-b-2 border-primary text-primary bg-primary/5' : 'text-gray-500 hover:text-gray-700'} flex items-center gap-2`}
                    >
                        <MessageSquare size={16} />
                        Feedback
                    </button>
                </div>

                {activeTab === 'profile' ? (
                    <ProfileSection user={user} updateUser={updateUser} />
                ) : (
                    <DataSection 
                        activeTab={activeTab} 
                        setActiveTab={setActiveTab} 
                        onAction={fetchData} 
                        handleVerify={handleVerify} 
                    />
                )}
            </div>
        </div>
    );
};

const ProfileSection = ({ user, updateUser }) => {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        whatsapp: user?.whatsapp || '',
        password: '',
        confirmPassword: '',
        // Provider specific fields
        services: '',
        bio: '',
        town: '',
        profilePicture: user?.profilePicture || ''
    });
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

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

    useEffect(() => {
        const fetchProviderDetails = async () => {
            try {
                const res = await api.get('/providers/me');
                const { services, bio, location } = res.data;
                setFormData(prev => ({
                    ...prev,
                    services: services ? services.join(', ') : '',
                    bio: bio || '',
                    county: location?.county || '',
                    town: location?.town || ''
                }));
            } catch (error) {
                // Ignore 404 if not a provider yet
                if (error.response?.status !== 404) console.error(error);
            }
        };
        fetchProviderDetails();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password && formData.password !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        setLoading(true);
        setMessage(null);
        try {
            const res = await api.put('/auth/profile', {
                name: formData.name,
                email: formData.email,
                whatsapp: formData.whatsapp,
                profilePicture: formData.profilePicture,
                password: formData.password || undefined // Only send if set
            });

            // Also update provider profile if services are provided
            if (formData.services || formData.bio || formData.county || formData.town) {
                try {
                    await api.post('/providers', {
                        services: formData.services,
                        bio: formData.bio,
                        county: formData.county, 
                        town: formData.town,
                        whatsapp: formData.whatsapp // Sync whatsapp
                    });
                } catch (provError) {
                    console.error('Error updating provider details', provError);
                    // Continue to show primary success or partial warning
                }
            }
            
            // Allow context to update
            // However, typical auth providers might require manual update if not re-fetching
            // In a real app we might call a function passed from context to update 'user' state locally.
            // Let's assume updateUser() stores user in localStorage and context.
            updateUser(res.data); // Update local context with new user data
            
            setMessage({ type: 'success', text: 'Profile updated successfully' });
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Error updating profile' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Edit Admin Profile</h2>
            
            {message && (
                <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
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
                <Input 
                    label="WhatsApp Number" 
                    value={formData.whatsapp} 
                    onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                    placeholder="e.g 2547..."
                />

                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 border-2 border-primary/20">
                            {formData.profilePicture ? (
                                <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl font-bold">
                                    {formData.name.charAt(0)}
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
                            {uploading && <p className="text-xs text-primary mt-1 animate-pulse">Uploading...</p>}
                        </div>
                    </div>
                </div>

                <hr className="border-gray-200 my-6" />
                <h3 className="text-lg font-bold text-gray-800 mb-4">Service Provider Details</h3>
                <p className="text-sm text-gray-500 mb-4">Fill this out if you want to offer services as an Admin.</p>
                
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Services (comma separated)</label>
                    <input 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={formData.services} 
                        onChange={(e) => setFormData({...formData, services: e.target.value})} 
                        placeholder="e.g. Plumber, Electrician"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                        label="County" 
                        value={formData.county} 
                        onChange={(e) => setFormData({...formData, county: e.target.value})} 
                        placeholder="e.g Nairobi"
                    />
                    <Input 
                        label="Town" 
                        value={formData.town} 
                        onChange={(e) => setFormData({...formData, town: e.target.value})} 
                        placeholder="e.g Westlands"
                    />
                </div>

                <div className="mt-4">
                     <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                     <textarea
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                        rows="3"
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        placeholder="Tell clients about your services..."
                     ></textarea>
                </div>
                
                <hr className="border-gray-200 my-6" />
                <h3 className="text-lg font-medium text-gray-700 mb-4">Change Password</h3>
                <p className="text-sm text-gray-500 mb-4">Leave blank if you don't want to change the password.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                        label="New Password" 
                        type="password"
                        value={formData.password} 
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                    <Input 
                        label="Confirm New Password" 
                        type="password"
                        value={formData.confirmPassword} 
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit" variant="primary" className="px-8" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

const DataSection = ({ activeTab, setActiveTab, onAction, handleVerify }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setData([]); // Clear data to prevent type mismatch during transition
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            let res;
            if (activeTab === 'users') res = await api.get('/admin/users');
            else if (activeTab === 'providers') res = await api.get('/admin/providers');
            else if (activeTab === 'bookings') res = await api.get('/bookings');
            else if (activeTab === 'reviews') res = await api.get('/admin/reviews');
            else if (activeTab === 'feedback') res = await api.get('/feedback');
            setData(res.data);
            setSelectedIds([]);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(`Are you sure you want to delete this ${activeTab.slice(0, -1)}?`)) return;
        try {
            if (activeTab === 'users') await api.delete(`/admin/users/${id}`);
            else if (activeTab === 'providers') await api.delete(`/admin/providers/${id}`);
            else if (activeTab === 'bookings') await api.delete(`/admin/bookings/${id}`);
            else if (activeTab === 'reviews') await api.delete(`/admin/reviews/${id}`);
            else if (activeTab === 'feedback') await api.delete(`/feedback/${id}`);
            fetchData();
        } catch (error) {
            alert('Error deleting item');
            console.error(error);
        }
    };

    const handleVerifyAction = async (id) => {
        await handleVerify(id);
        fetchData(); // Refresh current list
    };

    const handleUserVerify = async (id) => {
        if (!window.confirm('Are you sure you want to approve this user?')) return;
        try {
             await api.put(`/admin/users/${id}/verify`);
             // Optimistic update
             setData(data.map(user => user._id === id ? { ...user, isEmailVerified: true } : user));
        } catch (error) {
            alert('Error verifying user');
        }
    };

    // Bulk Actions Logic
    const [selectedIds, setSelectedIds] = useState(new Set());

    useEffect(() => {
        setSelectedIds(new Set()); // Reset selection when tab changes
    }, [activeTab]);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(new Set(data.map(item => item._id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleSelectOne = (id) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleBulkVerify = async () => {
        if (!selectedIds.size) return;
        if (!window.confirm(`Approve ${selectedIds.size} selected users?`)) return;
        try {
            await api.put('/admin/users/bulk-verify', { userIds: Array.from(selectedIds) });
            fetchData();
            setSelectedIds(new Set());
        } catch (error) {
            alert('Error verifying users');
        }
    };

    const handleBulkDelete = async () => {
        if (!selectedIds.size) return;
        if (!window.confirm(`Permanently delete ${selectedIds.size} selected users?`)) return;
        try {
            await api.post('/admin/users/bulk-delete', { userIds: Array.from(selectedIds) });
            fetchData();
            setSelectedIds(new Set());
        } catch (error) {
            alert('Error deleting users');
        }
    };

    return (
        <div className="p-0 overflow-x-auto">
            {loading ? (
                <div className="p-8 text-center text-gray-500">Loading data...</div>
            ) : (
                <>
                {activeTab === 'users' && selectedIds.size > 0 && (
                    <div className="bg-blue-50 p-3 mx-4 mb-2 rounded flex justify-between items-center animate-in fade-in">
                        <span className="text-sm font-semibold text-blue-800">{selectedIds.size} selected</span>
                        <div className="flex gap-2">
                            <button 
                                onClick={handleBulkVerify}
                                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition"
                            >
                                Approve Selected
                            </button>
                            <button 
                                onClick={handleBulkDelete}
                                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition"
                            >
                                Delete Selected
                            </button>
                        </div>
                    </div>
                )}
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        {activeTab === 'users' && (
                            <tr>
                                <th className="px-6 py-3 text-left">
                                    <input 
                                        type="checkbox" 
                                        onChange={handleSelectAll} 
                                        checked={data.length > 0 && selectedIds.size === data.length}
                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">WhatsApp</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                        )}
                        {activeTab === 'providers' && (
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Provider</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Location</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Services</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                        )}
                        {activeTab === 'bookings' && (
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Client</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Service</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                        )}
                        {activeTab === 'reviews' && (
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Provider</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Client</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Rating</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Comment</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                        )}
                        {activeTab === 'feedback' && (
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Message</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                        )}
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((item) => (
                            <tr key={item._id} className="hover:bg-gray-50">
                                {activeTab === 'users' && (
                                    <>
                                        <td className="px-6 py-4">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedIds.has(item._id)}
                                                onChange={() => handleSelectOne(item._id)}
                                                className="rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{item.email}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 capitalize">{item.role}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{item.whatsapp || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.isEmailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {item.isEmailVerified ? 'Active' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 text-sm font-medium">
                                                {!item.isEmailVerified && (
                                                    <button 
                                                        onClick={() => handleUserVerify(item._id)} 
                                                        className="text-green-600 hover:text-green-900 px-2 py-1 bg-green-50 rounded"
                                                    >
                                                        Approve
                                                    </button>
                                                )}
                                                <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:text-red-700">Delete</button>
                                            </div>
                                        </td>
                                    </>
                                )}
                                {activeTab === 'providers' && (
                                    <>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.userId?.name || 'Deleted User'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{item.location?.town || 'Unknown'}, {item.location?.county || 'Kenya'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <div className="flex flex-wrap gap-1">
                                                {item.services?.map((s, i) => (
                                                    <span key={i} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs box-border">
                                                        {s}
                                                        <button 
                                                            onClick={async (e) => {
                                                                 e.stopPropagation();
                                                                 if (!window.confirm(`Are you sure you want to remove the service "${s}" from this provider?`)) return;
                                                                 try {
                                                                     await api.delete(`/admin/providers/${item._id}/services/${encodeURIComponent(s)}`);
                                                                     // Optimistic update or refresh
                                                                     setData(data.map(d => {
                                                                         if (d._id === item._id) {
                                                                             return { ...d, services: d.services.filter(srv => srv !== s) };
                                                                         }
                                                                         return d;
                                                                     }));
                                                                 } catch (error) {
                                                                     console.error(error);
                                                                     alert('Error removing service');
                                                                 }
                                                             }}
                                                             className="hover:text-red-600 focus:outline-none flex items-center justify-center w-4 h-4 rounded-full hover:bg-gray-200 transition"
                                                             title="Remove service"
                                                         >
                                                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                                                 <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                                             </svg>
                                                         </button>
                                                     </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {item.isVerified ? 'Verified' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 text-sm font-medium">
                                                {!item.isVerified && (
                                                    <button 
                                                        onClick={() => handleVerifyAction(item._id)} 
                                                        className="text-green-600 hover:text-green-900 px-2 py-1 bg-green-50 rounded"
                                                    >
                                                        Approve
                                                    </button>
                                                )}
                                                <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:text-red-700">Remove</button>
                                            </div>
                                        </td>
                                    </>
                                )}
                                {activeTab === 'bookings' && (
                                    <>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.userId?.name || 'Deleted User'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{item.service || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{item.bookingDate ? new Date(item.bookingDate).toLocaleDateString() : 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 capitalize">{item.status || 'pending'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                                        </td>
                                    </>
                                )}
                                {activeTab === 'reviews' && (
                                    <>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.providerId?.userId?.name || 'Unknown'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{item.userId?.name || 'Anonymous'}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-yellow-500">{item.rating} ★</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{item.comment}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                                        </td>
                                    </>
                                )}
                                {activeTab === 'feedback' && (
                                    <>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{item.name || 'Anonymous'}</div>
                                            <div className="text-sm text-gray-500">{item.email || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 capitalize">{item.type}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={item.content}>{item.content}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                item.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                item.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {item.status !== 'approved' && (
                                                    <button 
                                                        onClick={async () => {
                                                            try {
                                                                await api.put(`/feedback/${item._id}/status`, { status: 'approved' });
                                                                setData(data.map(d => d._id === item._id ? { ...d, status: 'approved' } : d));
                                                            } catch (err) {
                                                                alert('Error approving feedback');
                                                            }
                                                        }}
                                                        className="text-green-600 hover:text-green-900 text-sm font-medium"
                                                    >
                                                        Approve
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => handleDelete(item._id)} 
                                                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-10 text-center text-gray-500">No records found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                </>
            )}
        </div>
    );
};

const StatCard = ({ title, value, icon, color, onClick }) => (
    <div 
        onClick={onClick}
        className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center transition hover:shadow-md cursor-pointer hover:scale-105 transform duration-200`}
    >
        <div className={`p-4 rounded-full ${color} mr-4`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        </div>
    </div>
);
export default AdminDashboard;
