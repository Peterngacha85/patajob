import { useState, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import GoogleAuthButton from '../components/common/GoogleAuthButton';
import { Loader2 } from 'lucide-react';

const Login = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isPending, setIsPending] = useState(false);

    // Check for inactivity reason
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('reason') === 'inactivity') {
            setError('You have been logged out due to 30 minutes of inactivity.');
        }
    }, [location]);

    // Internal Polling for Pending Approval
    useEffect(() => {
        let interval;
        if (isPending) {
            interval = setInterval(async () => {
                try {
                    // Try to login again automatically
                    await login(formData.email, formData.password);
                    navigate('/'); 
                } catch (err) {
                    // Still pending or other error, just wait for next cycle
                    console.log("Auto-retry pending...");
                }
            }, 10000); // Check every 10 seconds for faster feedback
        }
        return () => clearInterval(interval);
    }, [isPending, formData, login, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(formData.email, formData.password);
            navigate('/'); 
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed';
            setError(msg);
            if (msg.toLowerCase().includes('pending') || msg.toLowerCase().includes('approval')) {
                setIsPending(true);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
                <h2 className="text-3xl font-bold text-center mb-6 text-primary">Welcome Back</h2>
                {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4 text-sm">
                        <p className="font-bold mb-1">Login Failed</p>
                        <p className="mb-3">{error}</p>
                        
                        {(error.toLowerCase().includes('pending') || error.toLowerCase().includes('approval')) && (
                            <div className="bg-white/50 p-3 rounded border border-red-100 mt-2 text-xs">
                                <p className="font-semibold mb-2 flex items-center gap-2">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                    </span>
                                    Monitoring your approval status...
                                </p>
                                <p className="text-gray-500 mb-2 italic">You will be logged in automatically once approved.</p>
                                <hr className="my-2 border-red-100" />
                                <p className="font-semibold mb-1">Contact Admin for faster approval:</p>
                                <div className="grid grid-cols-1 gap-1">
                                    <span>📞 0739090811</span>
                                    <span>💬 0794108498 (WhatsApp)</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <Input 
                        label="Email Address" 
                        type="email" 
                        value={formData.email} 
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                        required 
                    />
                    <Input 
                        label="Password" 
                        type="password" 
                        value={formData.password} 
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                        required 
                    />
                    <Button type="submit" variant="accent" className="w-full mt-2 flex items-center justify-center gap-2" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Signing in...
                            </>
                        ) : 'Login'}
                    </Button>
                </form>

                <div className="flex items-center gap-3 my-6">
                    <div className="flex-grow h-px bg-gray-200"></div>
                    <span className="text-xs text-gray-400 uppercase tracking-wider">Or</span>
                    <div className="flex-grow h-px bg-gray-200"></div>
                </div>

                <GoogleAuthButton role="user" onError={setError} />

                <div className="mt-6 text-center text-gray-600">
                    Don't have an account? <Link to="/register" className="text-accent font-medium hover:underline">Register</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
