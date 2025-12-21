import { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import AuthContext from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { MapPin, Star, Phone, Calendar, Eye } from 'lucide-react';
import { COUNTIES, SERVICES } from '../constants/data';
import { showToast, confirmAction } from '../utils/swal';

const Providers = () => {
    const { user } = useContext(AuthContext);
    const formatWhatsAppLink = (phone) => {
        if (!phone) return "";
        let cleaned = phone.replace(/\D/g, '');
        
        if (cleaned.startsWith('0')) {
            cleaned = '254' + cleaned.substring(1);
        }
        
        if (cleaned.length === 9) {
            cleaned = '254' + cleaned;
        }

        const message = encodeURIComponent("Hello, I found you on PataJob website and I would like your service assistance.");
        return `https://api.whatsapp.com/send?phone=${cleaned}&text=${message}`;
    };

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const initialService = searchParams.get('service') || '';
    
    const [providers, setProviders] = useState([]);
    const [filters, setFilters] = useState({ service: initialService, county: '', town: '' });
    const [loading, setLoading] = useState(false);

    // Reviews Modal State
    const [reviewsModal, setReviewsModal] = useState({ open: false, providerName: '', reviews: [], loading: false });

    // Booking Modal State
    const [bookingModal, setBookingModal] = useState({ open: false, providerId: null, service: '', date: '' });

    // Profile Modal State
    const [profileModal, setProfileModal] = useState({ open: false, provider: null });

    const checkAccess = async (actionLabel) => {
        if (!user) {
            const confirmed = await confirmAction(
                'Registration Required',
                `To ${actionLabel}, you need to have a client account. Would you like to register now?`,
                'Register Now'
            );
            if (confirmed) {
                navigate('/register?role=user');
            }
            return false;
        }

        if (user.role !== 'user' && user.role !== 'admin') {
            await confirmAction(
                'Hire Account Required',
                'Only clients (those hiring) can contact service providers directly. If you are a pro, please use a client account to hire others.',
                'I Understand'
            );
            return false;
        }

        return true;
    };

    const handleBookClick = async (provider) => {
        const hasAccess = await checkAccess('book a service');
        if (!hasAccess) return;

        const defaultService = provider.services && provider.services.length > 0 ? provider.services[0] : '';
        setBookingModal({ open: true, providerId: provider._id, service: defaultService, date: '' });
    };

    const handleCallClick = async (phone) => {
        const hasAccess = await checkAccess('call this pro');
        if (!hasAccess) return;
        window.location.href = `tel:${phone.replace(/\D/g, '')}`;
    };

    const handleWhatsAppClick = async (phone) => {
        const hasAccess = await checkAccess('WhatsApp this pro');
        if (!hasAccess) return;
        window.open(formatWhatsAppLink(phone), '_blank');
    };

    const submitBooking = async (e) => {
        e.preventDefault();
        try {
            await api.post('/bookings', {
                providerId: bookingModal.providerId,
                service: bookingModal.service,
                bookingDate: bookingModal.date
            });
            setBookingModal({ ...bookingModal, open: false });
            showToast('success', 'Booking request sent successfully!');
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                const confirmed = await confirmAction(
                    'Login Required',
                    'Kindly log in to book this service provider. It only takes a minute!',
                    'Go to Login'
                );
                if (confirmed) {
                    navigate('/login');
                }
            } else {
                showToast('error', error.response?.data?.message || 'Error sending booking request.');
            }
        }
    };

    const handleViewReviews = async (provider) => {
         setReviewsModal({ open: true, providerName: provider.userId?.name || 'Unknown Provider', reviews: [], loading: true });
         try {
             const res = await api.get(`/reviews/${provider._id}`);
             setReviewsModal(prev => ({ ...prev, reviews: res.data, loading: false }));
         } catch (error) {
             console.error("Error fetching reviews", error);
             setReviewsModal(prev => ({ ...prev, loading: false }));
         }
    };

    const handleViewProfile = (provider) => {
        setProfileModal({ open: true, provider });
    };
    


    const fetchProviders = async () => {
        setLoading(true);
        try {
             // Clean empty filters
            const query = {};
            if (filters.service) query.service = filters.service;
            if (filters.county) query.county = filters.county;
            if (filters.town) query.town = filters.town;

            const params = new URLSearchParams(query).toString();
            const res = await api.get(`/providers?${params}`);
            setProviders(res.data);
        } catch (error) {
            console.error("Error fetching providers", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProviders();
    }, []); // Initial load

    const handleSearch = (e) => {
        e.preventDefault();
        fetchProviders();
    };



    return (
        <div className="container mx-auto px-4 py-8 relative">
            <h1 className="text-3xl font-bold mb-8 text-primary">Available Providers</h1>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="bg-white p-6 rounded-xl shadow-md mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                    <input 
                        list="services-list"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={filters.service} 
                        onChange={(e) => setFilters({...filters, service: e.target.value})} 
                        placeholder="Search by service..."
                    />
                    <datalist id="services-list">
                        {SERVICES.map(s => <option key={s} value={s} />)}
                    </datalist>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">County</label>
                    <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                        value={filters.county} 
                        onChange={(e) => setFilters({...filters, county: e.target.value})}
                    >
                        <option value="">All Counties</option>
                        {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <Input 
                    label="Town" 
                    value={filters.town} 
                    onChange={(e) => setFilters({...filters, town: e.target.value})} 
                    placeholder="Filter by town"
                />
                <div className="mb-4">
                    <Button type="submit" variant="accent" className="w-full">Search</Button>
                </div>
            </form>

            {/* Results */}
            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {providers.length > 0 ? (
                        providers.map((provider) => (
                            <div key={provider._id} className="bg-white rounded-xl shadow border border-gray-100 p-6 hover:shadow-lg transition">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex gap-4">
                                        <div className="w-16 h-16 rounded-lg bg-primary/10 overflow-hidden flex-shrink-0 border border-primary/10">
                                            {provider.userId?.profilePicture ? (
                                                <img 
                                                    src={provider.userId.profilePicture} 
                                                    alt={provider.userId.name} 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-primary/40 text-2xl font-bold bg-primary/5">
                                                    {provider.userId?.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800">{provider.userId?.name || 'Anonymous'}</h3>
                                            <p className="text-sm text-gray-500">{provider.services?.join(', ') || 'General Services'}</p>
                                        </div>
                                    </div>
                                    <div 
                                        onClick={() => handleViewReviews(provider)}
                                        className="flex items-center text-yellow-500 bg-yellow-50 px-2 py-1 rounded cursor-pointer hover:bg-yellow-100 transition"
                                        title="View Reviews"
                                    >
                                        <Star size={16} fill="currentColor" className="mr-1" />
                                        <span className="font-bold">{(provider.averageRating || 0).toFixed(1)}</span>
                                        <span className="text-gray-400 text-xs ml-1">({provider.totalReviews || 0} reviews)</span>
                                    </div>
                                </div>
                                <p className="text-gray-600 mb-4 line-clamp-2">{provider.bio || 'No bio available.'}</p>
                                <div className="flex items-center text-gray-500 text-sm mb-6">
                                    <MapPin size={16} className="mr-1" />
                                    {provider.location?.town || 'Unknown'}, {provider.location?.county || 'Kenya'}
                                </div>
                                
                                <button 
                                    onClick={() => handleViewProfile(provider)}
                                    className="w-full mb-3 flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium text-sm gap-2"
                                >
                                    <Eye size={16} />
                                    View Full Profile
                                </button>

                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => handleWhatsAppClick(provider.whatsapp)}
                                        className="flex items-center justify-center w-full px-4 py-2 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition font-medium"
                                    >
                                        WhatsApp
                                    </button>
                                    <button 
                                        onClick={() => handleCallClick(provider.whatsapp)}
                                        className="flex items-center justify-center w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium gap-2"
                                    >
                                        <Phone size={16} />
                                        Call Now
                                    </button>
                                    <button 
                                        onClick={() => handleBookClick(provider)}
                                        className="col-span-2 flex items-center justify-center w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-medium gap-2"
                                    >
                                        <Calendar size={16} />
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-10 text-gray-500">No providers found matching your criteria.</div>
                    )}
                </div>
            )}


            {/* Reviews Modal */}
            {reviewsModal.open && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setReviewsModal({ ...reviewsModal, open: false })}>
                    <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Reviews for {reviewsModal.providerName}</h3>
                            <button onClick={() => setReviewsModal({ ...reviewsModal, open: false })} className="text-gray-400 hover:text-gray-600">
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>
                        
                        {reviewsModal.loading ? (
                             <div className="text-center py-10">Loading reviews...</div>
                        ) : reviewsModal.reviews.length > 0 ? (
                            <div className="space-y-4">
                                {reviewsModal.reviews.map((review) => (
                                    <div key={review._id} className="border-b border-gray-100 pb-4 last:border-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-semibold text-gray-800">{review.userId?.name || 'Anonymous'}</span>
                                            <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star 
                                                    key={i} 
                                                    size={14} 
                                                    className={i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"} 
                                                />
                                            ))}
                                        </div>
                                        <p className="text-gray-600 text-sm">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500">
                                <p>No reviews yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Booking Modal */}
            {bookingModal.open && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                        <h3 className="text-xl font-bold mb-4 text-gray-900">Book Service</h3>
                        <form onSubmit={submitBooking} className="space-y-4">
                            <Input 
                                label="Service Required" 
                                value={bookingModal.service} 
                                onChange={(e) => setBookingModal({...bookingModal, service: e.target.value})} 
                                required
                            />
                            <Input 
                                label="Execution Date & Time" 
                                type="datetime-local"
                                value={bookingModal.date} 
                                onChange={(e) => setBookingModal({...bookingModal, date: e.target.value})} 
                                min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                                required
                            />
                            <div className="flex justify-end gap-3 pt-2">
                                <Button type="button" variant="outline" onClick={() => setBookingModal({...bookingModal, open: false})}>Cancel</Button>
                                <Button type="submit" variant="primary">Send Request</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Provider Profile Modal */}
            {profileModal.open && profileModal.provider && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setProfileModal({ open: false, provider: null })}>
                    <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Provider Profile</h3>
                            <button onClick={() => setProfileModal({ open: false, provider: null })} className="text-gray-400 hover:text-gray-600">
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>
                        
                        {/* Profile Picture and Basic Info */}
                        <div className="flex flex-col md:flex-row gap-6 mb-6">
                            <div className="flex-shrink-0">
                                {profileModal.provider.userId?.profilePicture ? (
                                    <img 
                                        src={profileModal.provider.userId.profilePicture} 
                                        alt={profileModal.provider.userId.name} 
                                        className="w-32 h-32 rounded-xl object-cover border-2 border-primary/20"
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-5xl font-bold">
                                        {profileModal.provider.userId?.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <h4 className="text-2xl font-bold text-gray-800 mb-2">{profileModal.provider.userId?.name || 'Anonymous'}</h4>
                                <div className="flex items-center text-yellow-500 mb-3">
                                    <Star size={20} fill="currentColor" className="mr-1" />
                                    <span className="font-bold text-lg">{(profileModal.provider.averageRating || 0).toFixed(1)}</span>
                                    <span className="text-gray-400 text-sm ml-2">({profileModal.provider.totalReviews || 0} reviews)</span>
                                </div>
                                <div className="flex items-center text-gray-600 mb-2">
                                    <MapPin size={18} className="mr-2 text-primary" />
                                    {profileModal.provider.location?.town || 'Unknown'}, {profileModal.provider.location?.county || 'Kenya'}
                                </div>
                            </div>
                        </div>

                        {/* Services */}
                        <div className="mb-6">
                            <h5 className="font-bold text-gray-700 mb-2">Services Offered</h5>
                            <div className="flex flex-wrap gap-2">
                                {profileModal.provider.services?.map((service, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                                        {service}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Bio */}
                        <div className="mb-6">
                            <h5 className="font-bold text-gray-700 mb-2">About</h5>
                            <p className="text-gray-600 leading-relaxed">{profileModal.provider.bio || 'No bio available.'}</p>
                        </div>

                        {/* Contact WhatsApp */}
                        <div className="mb-6">
                            <h5 className="font-bold text-gray-700 mb-2">Contact</h5>
                            <p className="text-gray-600">WhatsApp: {profileModal.provider.whatsapp || 'Not provided'}</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-3 gap-3 pt-4 border-t">
                            <button 
                                onClick={() => { handleWhatsAppClick(profileModal.provider.whatsapp); setProfileModal({ open: false, provider: null }); }}
                                className="flex items-center justify-center px-4 py-2 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition font-medium text-sm"
                            >
                                WhatsApp
                            </button>
                            <button 
                                onClick={() => { handleCallClick(profileModal.provider.whatsapp); setProfileModal({ open: false, provider: null }); }}
                                className="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium text-sm gap-2"
                            >
                                <Phone size={16} />
                                Call
                            </button>
                            <button 
                                onClick={() => { handleBookClick(profileModal.provider); setProfileModal({ open: false, provider: null }); }}
                                className="flex items-center justify-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-medium text-sm gap-2"
                            >
                                <Calendar size={16} />
                                Book
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Providers;
