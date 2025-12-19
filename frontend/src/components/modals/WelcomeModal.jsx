import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { CheckCircle, X, ArrowRight } from 'lucide-react';

const WelcomeModal = () => {
    const { user } = useContext(AuthContext);
    const [show, setShow] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (user && user.role === 'provider') {
            const hasSeen = localStorage.getItem(`welcome_modal_seen_${user._id}`);
            if (!hasSeen) {
                // Delay a bit for smoother UX
                const timer = setTimeout(() => setShow(true), 1500);
                return () => clearTimeout(timer);
            }
        }
    }, [user]);

    const handleClose = () => {
        if (user) {
            localStorage.setItem(`welcome_modal_seen_${user._id}`, 'true');
        }
        setShow(false);
    };

    const handleGoToDashboard = () => {
        handleClose();
        navigate('/provider/dashboard');
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
                onClick={handleClose}
            ></div>
            
            {/* Modal Content */}
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header Decoration */}
                <div className="h-32 bg-gradient-to-br from-primary to-purple-700 flex items-center justify-center relative">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md">
                        <CheckCircle size={40} />
                    </div>
                    <button 
                        onClick={handleClose}
                        className="absolute top-4 right-4 text-white/70 hover:text-white transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 text-center">
                    <h2 className="text-2xl font-black text-gray-900 mb-3">Welcome to PataJob!</h2>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        We're excited to have you! To start receiving bookings and appearing in search results, please update your <strong>services</strong> and <strong>location</strong> in your dashboard.
                    </p>

                    <div className="space-y-3">
                        <button 
                            onClick={handleGoToDashboard}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition transform hover:-translate-y-1 shadow-lg hover:shadow-primary/30"
                        >
                            Complete My Profile
                            <ArrowRight size={20} />
                        </button>
                        <button 
                            onClick={handleClose}
                            className="w-full bg-gray-50 hover:bg-gray-100 text-gray-500 font-semibold py-3 rounded-2xl transition"
                        >
                            Maybe Later
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeModal;
