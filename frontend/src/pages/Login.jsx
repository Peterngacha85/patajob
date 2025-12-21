import { useState, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Loader2 } from 'lucide-react';

const Login = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Check for inactivity reason
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('reason') === 'inactivity') {
            setError('You have been logged out due to 30 minutes of inactivity.');
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(formData.email, formData.password);
            navigate('/'); 
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
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
                                <p className="font-semibold mb-1">Contact Admin for fast approval:</p>
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
                <div className="mt-6 text-center text-gray-600">
                    Don't have an account? <Link to="/register" className="text-accent font-medium hover:underline">Register</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
