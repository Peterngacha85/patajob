import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { MapPin, Star, Search, Phone, Calendar } from 'lucide-react';
import { COUNTIES, SERVICES } from '../constants/data';

const Home = () => {
    const formatWhatsAppLink = (phone) => {
        if (!phone) return "";
        let cleaned = phone.replace(/\D/g, ''); // Remove non-digits
        
        // If it starts with 0, replace with 254
        if (cleaned.startsWith('0')) {
            cleaned = '254' + cleaned.substring(1);
        }
        
        // If it's a 9-digit number (e.g., 712345678), add 254
        if (cleaned.length === 9) {
            cleaned = '254' + cleaned;
        }

        const message = encodeURIComponent("Hello, I found you on PataJob website and I would like your service assistance.");
        return `https://api.whatsapp.com/send?phone=${cleaned}&text=${message}`;
    };

    const navigate = useNavigate();
    const providersSectionRef = useRef(null);

    // State for providers and filtering
    const [providers, setProviders] = useState([]);
    const [filters, setFilters] = useState({ service: '', county: '', town: '' });


    const [loading, setLoading] = useState(false);
    
    // Reviews Modal State
    const [reviewsModal, setReviewsModal] = useState({ open: false, providerName: '', reviews: [], loading: false });

    // Booking Modal State
    const [bookingModal, setBookingModal] = useState({ open: false, providerId: null, service: '', date: '' });

    const handleBookClick = (provider) => {
        const defaultService = provider.services && provider.services.length > 0 ? provider.services[0] : '';
        setBookingModal({ open: true, providerId: provider._id, service: defaultService, date: '' });
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
            alert('Booking request sent successfully!');
        } catch (error) {
            alert(error.response?.data?.message || 'Error sending booking request. Ensure you are logged in.');
        }
    };

    const handleViewReviews = async (provider) => {
         setReviewsModal({ open: true, providerName: provider.userId?.name, reviews: [], loading: true });
         try {
             const res = await api.get(`/reviews/${provider._id}`);
             setReviewsModal(prev => ({ ...prev, reviews: res.data, loading: false }));
         } catch (error) {
             console.error("Error fetching reviews", error);
             setReviewsModal(prev => ({ ...prev, loading: false }));
         }
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

    const handleServiceCardClick = (serviceName) => {
        setFilters({ ...filters, service: serviceName });
        // Trigger fetch immediately or depend on useEffect? 
        // Setting state is async, so better to call fetch with new value or separate useEffect.
        // Let's use a standard pattern: update filter then scroll. 
        // We'll add a dependency on filters.service to a useEffect or just call fetch manually.
        // Actually simplest is to set filter and let user search, OR set filter and auto-search.
        // User asked "fetch them first and display them".
        // functionality: set filter -> fetch -> scroll.
        
        // We will manually fetch to ensure it uses the new service value immediately
        setLoading(true);
        const query = { service: serviceName };
        if (filters.county) query.county = filters.county;
        if (filters.town) query.town = filters.town;
        
        const params = new URLSearchParams(query).toString();
        
        api.get(`/providers?${params}`)
            .then(res => {
                setProviders(res.data);
                setLoading(false);
                if (providersSectionRef.current) {
                    providersSectionRef.current.scrollIntoView({ behavior: 'smooth' });
                }
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };



    return (
        <div className="flex flex-col w-full">
            {/* Hero Section */}
            <section className="relative w-full h-[600px] flex items-center justify-center text-center px-4 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img 
                        src="/patajob.png" 
                        alt="Hero Background" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/95 to-black/70 backdrop-blur-[2px]"></div>
                </div>
                
                <div className="relative z-10 max-w-4xl mx-auto space-y-8">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight tracking-tight drop-shadow-sm">
                        Find Trusted Pros in <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">Kenya</span>
                    </h1>
                    <p className="text-lg md:text-2xl text-gray-200 max-w-2xl mx-auto font-light leading-relaxed">
                        Connect with verified local experts for any job, anywhere. Fast, secure, and reliable.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-5 justify-center pt-4">
                        <button 
                            onClick={() => providersSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
                            className="bg-accent hover:bg-rose-700 text-white px-10 py-4 rounded-full font-bold text-lg transition shadow-xl hover:shadow-2xl hover:-translate-y-1 transform border-2 border-transparent"
                        >
                            Find a Pro
                        </button>
                        <Link to="/register" className="bg-white/10 backdrop-blur-md border-2 border-white/30 hover:bg-white text-white hover:text-primary px-10 py-4 rounded-full font-bold text-lg transition shadow-lg hover:shadow-xl hover:-translate-y-1 transform">
                            Join as a Pro
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features/Categories Preview */}
            <section className="container mx-auto py-24 px-4">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Popular Services</h2>
                    <div className="w-24 h-1.5 bg-accent mx-auto rounded-full"></div>
                    <p className="text-gray-500 text-xl max-w-2xl mx-auto">Explore our most requested categories and find the right expert for your needs.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        { name: 'Home Repairs', img: 'https://images.unsplash.com/photo-1505798577917-a65157d3320a?auto=format&fit=crop&w=800&q=80' },
                        { name: 'Cleaning', img: 'https://images.pexels.com/photos/4107957/pexels-photo-4107957.jpeg?auto=compress&cs=tinysrgb&w=800' },
                        { name: 'Tutoring', img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80' },
                        { name: 'Event Planning', img: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80' },
                        { name: 'Beauty & Wellness', img: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=800&q=80' },
                        { name: 'Transport', img: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80' }
                    ].map((service, index) => (
                        <div 
                            key={index} 
                            onClick={() => handleServiceCardClick(service.name)}
                            className="group relative overflow-hidden rounded-3xl shadow-lg cursor-pointer hover:shadow-2xl transition-all duration-300 h-80"
                        >
                            <img src={service.img} alt={service.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 p-8 w-full transform transition-transform duration-300 translate-y-2 group-hover:translate-y-0">
                                <h3 className="text-2xl font-bold text-white mb-2">{service.name}</h3>
                                <p className="text-gray-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">Find trusted experts nearby</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Available Providers Section */}
            <section ref={providersSectionRef} className="bg-gray-50 py-24 px-4 w-full">
                <div className="container mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900">Available Services</h2>
                        <p className="text-gray-500 mt-2">Browse our network of professional service providers</p>
                    </div>

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
                            <Button type="submit" variant="accent" className="w-full flex items-center justify-center gap-2">
                                <Search size={18} />
                                Search
                            </Button>
                        </div>
                    </form>

                    {/* Results Grid */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {providers.length > 0 ? (
                                providers.map((provider) => (
                                    <div key={provider._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition duration-300 flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-800">{provider.userId?.name}</h3>
                                                <p className="text-sm text-primary font-medium mt-1">{provider.services.join(', ')}</p>
                                            </div>
                                            <div 
                                                onClick={() => handleViewReviews(provider)}
                                                className="flex items-center text-yellow-500 bg-yellow-50 px-2 py-1 rounded-lg cursor-pointer hover:bg-yellow-100 transition"
                                                title="View Reviews"
                                            >
                                                <Star size={16} fill="currentColor" className="mr-1" />
                                                <span className="font-bold">{provider.averageRating.toFixed(1)}</span>
                                                <span className="text-gray-400 text-xs ml-1">({provider.totalReviews} reviews)</span>
                                            </div>
                                        </div>
                                        
                                        <p className="text-gray-600 mb-6 line-clamp-2 text-sm flex-grow">{provider.bio || 'No bio available.'}</p>
                                        
                                        <div className="flex items-center text-gray-500 text-sm mb-6 bg-gray-50 p-2 rounded-lg">
                                            <MapPin size={16} className="mr-2 text-primary" />
                                            {provider.location.town}, {provider.location.county}
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-3 mt-auto">
                                            <a 
                                                href={formatWhatsAppLink(provider.whatsapp)} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center w-full px-4 py-2.5 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition font-medium text-sm"
                                            >
                                                WhatsApp
                                            </a>
                                            <a 
                                                href={`tel:${provider.whatsapp?.replace(/\D/g, '')}`}
                                                className="flex items-center justify-center w-full px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium text-sm gap-2"
                                            >
                                                <Phone size={16} />
                                                Call Now
                                            </a>
                                            <button 
                                                onClick={() => handleBookClick(provider)}
                                                className="col-span-2 flex items-center justify-center w-full px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-medium text-sm gap-2"
                                            >
                                                <Calendar size={16} />
                                                Book Now
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-20">
                                    <div className="text-gray-300 mb-4">
                                        <Search size={64} className="mx-auto" />
                                    </div>
                                    <h3 className="text-xl font-medium text-gray-900">No providers found</h3>
                                    <p className="text-gray-500 mt-2">Try adjusting your search filters to find what you're looking for.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>


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
                                label="Date" 
                                type="date"
                                value={bookingModal.date} 
                                onChange={(e) => setBookingModal({...bookingModal, date: e.target.value})} 
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
        </div>
    );
};

export default Home;
