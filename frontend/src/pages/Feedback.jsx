import { useState, useContext, useEffect } from 'react';
import { MessageSquare, Lightbulb, Star, Send, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import AuthContext from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const Feedback = () => {
    const { user } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        type: 'feedback',
        content: ''
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || ''
            }));
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/feedback', {
                ...formData,
                userId: user?._id
            });
            setSubmitted(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Error submitting feedback. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center space-y-6 p-8 bg-white rounded-3xl shadow-2xl border border-gray-50 transform animate-in fade-in zoom-in duration-500">
                    <div className="flex justify-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 animate-bounce">
                            <CheckCircle2 size={40} />
                        </div>
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Asante Sana!</h2>
                    <p className="text-gray-500 leading-relaxed text-lg">
                        Your feedback has been received. We are constantly working to make PataJob better for all Kenyans.
                    </p>
                    <Button 
                        variant="primary" 
                        onClick={() => window.location.href = '/'} 
                        className="w-full py-4 rounded-2xl font-bold shadow-lg mt-4"
                    >
                        Back to Home
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-16 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12 space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                        Help Us <span className="text-primary">Improve</span>
                    </h1>
                    <p className="text-gray-500 text-lg max-w-xl mx-auto">
                        Your suggestions, reviews, and comments help us build a better platform for everyone in Kenya.
                    </p>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">
                    {/* Sidebar Info */}
                    <div className="md:w-1/3 bg-primary p-10 text-white flex flex-col justify-between">
                        <div className="space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="bg-white/20 p-3 rounded-2xl">
                                    <MessageSquare size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">General Feedback</h3>
                                    <p className="text-white/70 text-sm">Tell us about your experience</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="bg-white/20 p-3 rounded-2xl">
                                    <Lightbulb size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">System Improvement</h3>
                                    <p className="text-white/70 text-sm">Suggest new features or ideas</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="bg-white/20 p-3 rounded-2xl">
                                    <Star size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Review</h3>
                                    <p className="text-white/70 text-sm">Rate our overall service</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-12 pt-12 border-t border-white/10 hidden md:block">
                            <p className="text-white/60 text-xs italic">
                                "Together, we build a platform that serves every corner of Kenya."
                            </p>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="md:w-2/3 p-10 lg:p-14 bg-white">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-8 flex items-center gap-3 text-sm border border-red-100">
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input 
                                    label="Full Name" 
                                    value={formData.name} 
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                                    placeholder="Your Name"
                                    required 
                                />
                                <Input 
                                    label="Email Address" 
                                    type="email"
                                    value={formData.email} 
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                                    placeholder="your@email.com"
                                    required 
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-gray-700 ml-1">What would you like to share?</label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {[
                                        { value: 'feedback', label: 'Feedback', icon: <MessageSquare size={16} /> },
                                        { value: 'improvement', label: 'Idea', icon: <Lightbulb size={16} /> },
                                        { value: 'review', label: 'Review', icon: <Star size={16} /> }
                                    ].map((type) => (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: type.value })}
                                            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border-2 font-bold transition-all duration-300 ${
                                                formData.type === type.value 
                                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105' 
                                                : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'
                                            }`}
                                        >
                                            {type.icon}
                                            {type.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-gray-700 ml-1">Your Message</label>
                                <textarea
                                    className="w-full px-6 py-4 border-2 border-gray-100 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition duration-300 min-h-[150px] resize-none"
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    placeholder="Tell us how we can make PataJob better for you..."
                                    required
                                ></textarea>
                            </div>

                            <Button 
                                type="submit" 
                                variant="accent" 
                                className="w-full py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                disabled={loading}
                            >
                                {loading ? 'Submitting...' : (
                                    <>
                                        Submit Feedback
                                        <Send size={20} />
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Feedback;
