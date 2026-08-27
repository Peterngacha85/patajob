import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, X } from 'lucide-react';
import AuthContext from '../../context/AuthContext';

const WhatsAppReminderBanner = () => {
    const { user } = useContext(AuthContext);
    const [dismissed, setDismissed] = useState(false);

    if (!user || user.whatsapp || user.role === 'admin' || dismissed) return null;
    if (localStorage.getItem(`whatsapp_reminder_dismissed_${user._id}`)) return null;

    const handleDismiss = () => {
        localStorage.setItem(`whatsapp_reminder_dismissed_${user._id}`, 'true');
        setDismissed(true);
    };

    const dashboardPath = user.role === 'provider' ? '/provider/dashboard' : '/user/dashboard';

    return (
        <div className="bg-green-50 border-b border-green-100">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-2 text-green-800">
                    <MessageCircle size={18} className="flex-shrink-0" />
                    <span>
                        Add your WhatsApp number so {user.role === 'provider' ? 'clients' : 'providers'} can reach you.{' '}
                        <Link to={dashboardPath} className="font-semibold underline hover:no-underline">
                            Add it now
                        </Link>
                    </span>
                </div>
                <button
                    onClick={handleDismiss}
                    className="text-green-600 hover:text-green-800 flex-shrink-0"
                    aria-label="Dismiss"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
};

export default WhatsAppReminderBanner;
