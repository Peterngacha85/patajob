import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';

const VerifyEmail = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const res = await api.get(`/auth/verify/${token}`);
                setStatus('success');
                setMessage(res.data.message);
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Verification failed. The link might be expired or invalid.');
            }
        };
        verifyToken();
    }, [token]);

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center animate-in zoom-in-95 duration-500">
                {status === 'loading' && (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <Loader2 size={64} className="text-primary animate-spin" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900">Verifying your email...</h2>
                        <p className="text-gray-500">Please wait while we validate your account.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                <CheckCircle size={48} />
                            </div>
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">Verified!</h2>
                        <p className="text-gray-600 leading-relaxed">{message}</p>
                        <Link 
                            to="/login" 
                            className="bg-primary hover:bg-primary/90 text-white font-bold py-4 px-8 rounded-2xl w-full flex items-center justify-center gap-2 transition transform hover:-translate-y-1 shadow-lg hover:shadow-primary/30"
                        >
                            Sign In to Your Account
                            <ArrowRight size={20} />
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                                <XCircle size={48} />
                            </div>
                        </div>
                        <h2 className="text-3xl font-black text-gray-900">Oops!</h2>
                        <p className="text-gray-600 leading-relaxed">{message}</p>
                        <div className="space-y-3">
                            <button 
                                onClick={() => window.location.reload()}
                                className="w-full bg-gray-900 text-white font-bold py-3 rounded-2xl transition hover:bg-gray-800"
                            >
                                Try Again
                            </button>
                            <Link 
                                to="/register" 
                                className="block text-primary font-bold hover:underline"
                            >
                                Back to Registration
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
