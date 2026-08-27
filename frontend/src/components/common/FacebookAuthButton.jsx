import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Facebook, Loader2 } from 'lucide-react';
import AuthContext from '../../context/AuthContext';

let fbSdkPromise = null;

const loadFacebookSdk = (appId) => {
    if (window.FB) return Promise.resolve(window.FB);
    if (fbSdkPromise) return fbSdkPromise;

    fbSdkPromise = new Promise((resolve, reject) => {
        window.fbAsyncInit = () => {
            window.FB.init({ appId, cookie: true, xfbml: false, version: 'v21.0' });
            resolve(window.FB);
        };

        const script = document.createElement('script');
        script.src = 'https://connect.facebook.net/en_US/sdk.js';
        script.async = true;
        script.defer = true;
        script.onerror = reject;
        document.body.appendChild(script);
    });

    return fbSdkPromise;
};

const FacebookAuthButton = ({ role, onError }) => {
    const { facebookAuth } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);
        try {
            const FB = await loadFacebookSdk(import.meta.env.VITE_FACEBOOK_APP_ID);
            FB.login((response) => {
                if (response.authResponse) {
                    facebookAuth(response.authResponse.accessToken, role)
                        .then(() => navigate('/'))
                        .catch((err) => onError?.(err.response?.data?.message || 'Facebook sign-in failed'))
                        .finally(() => setLoading(false));
                } else {
                    setLoading(false);
                    onError?.('Facebook sign-in was cancelled');
                }
            }, { scope: 'public_profile,email' });
        } catch (err) {
            setLoading(false);
            onError?.('Could not load Facebook sign-in');
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-[#1877F2] hover:bg-[#166FE5] text-white font-medium transition disabled:opacity-60"
        >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Facebook size={18} />}
            Continue with Facebook
        </button>
    );
};

export default FacebookAuthButton;
