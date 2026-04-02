import { useState, useEffect } from 'react';
import { AlertTriangle, X, ArrowRight, MessageCircle } from 'lucide-react';

const EmergencyAlertModal = () => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const hasSeen = localStorage.getItem('emergency_alert_seen_apr_2026');
        if (!hasSeen) {
            // Delay for better UX
            const timer = setTimeout(() => setShow(true), 800);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        localStorage.setItem('emergency_alert_seen_apr_2026', 'true');
        setShow(false);
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/70 backdrop-blur-md animate-in fade-in duration-300" 
                onClick={handleClose}
            ></div>
            
            {/* Modal Content */}
            <div className="relative bg-white rounded-[2rem] shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header Decoration */}
                <div className="h-32 bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center relative">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md border border-white/30 animate-pulse">
                        <AlertTriangle size={40} />
                    </div>
                    <button 
                        onClick={handleClose}
                        className="absolute top-4 right-4 text-white/70 hover:text-white transition bg-black/10 p-2 rounded-full"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Important System Update</h2>
                        <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full uppercase tracking-wider mb-4">
                            Cloud Infrastructure Alert
                        </div>
                    </div>

                    <div className="space-y-4 text-gray-600 leading-relaxed text-sm md:text-base">
                        <p>
                            Due to ongoing regional cloud infrastructure instability (AWS Middle East), some recent account registrations and profile updates may have been affected.
                        </p>
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl">
                            <p className="text-blue-900 font-bold mb-1">Notice for new users:</p>
                            <p className="text-blue-800 text-sm">
                                If your account is missing or you are unable to log in, <strong>please re-register your account.</strong>
                            </p>
                        </div>
                        <p>
                            Recently uploaded data may not have reached our servers during this period. We sincerely apologize for this inconvenience as we work to migrate to more stable regions.
                        </p>
                    </div>

                    <div className="mt-8 space-y-3">
                        <button 
                            onClick={handleClose}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition transform hover:-translate-y-1 shadow-lg hover:shadow-orange-200"
                        >
                            I Understand
                            <ArrowRight size={20} />
                        </button>
                        
                        <a 
                            href="https://wa.me/254794108498?text=Hello%20PataJob%20Support%2C%20I%20need%20assistance%20regarding%20the%20recent%20system%20update." 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full bg-green-50 hover:bg-green-100 text-green-700 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition"
                        >
                            <MessageCircle size={20} />
                            Contact WhatsApp Support
                        </a>
                    </div>
                </div>
                
                {/* Footer status indicator */}
                <div className="bg-gray-50 py-3 px-8 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Network Status</span>
                    <div className="flex items-center gap-2">
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Degraded Performance</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmergencyAlertModal;
