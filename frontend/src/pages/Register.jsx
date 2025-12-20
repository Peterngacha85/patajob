import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Loader2 } from 'lucide-react';

const Register = () => {
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            const res = await register(formData.name, formData.email, formData.password, formData.role, formData.whatsapp);
            setSuccess(res.message);
            // navigate('/'); // Stop immediate redirect
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
                <h2 className="text-3xl font-bold text-center mb-6 text-primary">Create Account</h2>
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
                {success && (
                    <div className="bg-blue-50 text-blue-800 p-4 rounded-xl mb-6 text-center animate-in fade-in duration-300">
                        <div className="font-bold mb-1">Account Created</div>
                        <div className="text-sm">{success}</div>
                    </div>
                )}
                {!success && (
                    <form onSubmit={handleSubmit}>
                    <Input 
                        label="Full Name" 
                        value={formData.name} 
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                        required 
                    />
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

                    <Input 
                        label="WhatsApp Number" 
                        type="text" 
                        value={formData.whatsapp || ''} 
                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} 
                        placeholder="e.g 2547..."
                        required 
                    />
                    
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">I want to:</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'user' })}
                                className={`py-2 px-4 rounded-lg border font-medium transition ${formData.role === 'user' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-300'}`}
                            >
                                Hire a Pro
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'provider' })}
                                className={`py-2 px-4 rounded-lg border font-medium transition ${formData.role === 'provider' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-300'}`}
                            >
                                Offer Services
                            </button>
                        </div>
                    </div>

                    <Button type="submit" variant="accent" className="w-full flex items-center justify-center gap-2" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Processing...
                            </>
                        ) : 'Register'}
                    </Button>
                </form>
                )}
                <div className="mt-6 text-center text-gray-600">
                    Already have an account? <Link to="/login" className="text-accent font-medium hover:underline">Login</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
