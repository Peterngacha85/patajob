import { useState, useEffect } from 'react';
import { MessageSquare, Lightbulb, Star, Quote } from 'lucide-react';
import api from '../services/api';

const Community = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const res = await api.get('/feedback/public');
                setFeedbacks(res.data);
            } catch (error) {
                console.error("Error fetching public feedback", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeedback();
    }, []);

    const filteredFeedback = filter === 'all' 
        ? feedbacks 
        : feedbacks.filter(f => f.type === filter);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <div className="bg-primary pt-20 pb-32 px-4 text-center">
                <div className="max-w-4xl mx-auto space-y-6">
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                        PataJob Community <span className="text-accent underline decoration-white/20">Wall</span>
                    </h1>
                    <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto font-medium">
                        See what Kenyans are saying about PataJob. Your reviews and ideas drive our platform forward.
                    </p>
                    
                    {/* Filters */}
                    <div className="flex flex-wrap justify-center gap-3 pt-8">
                        {['all', 'feedback', 'improvement', 'review'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-6 py-2 rounded-full font-bold transition-all duration-300 ${
                                    filter === f 
                                    ? 'bg-white text-primary shadow-lg scale-105' 
                                    : 'bg-white/10 text-white hover:bg-white/20'
                                }`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 -mt-16">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : filteredFeedback.length > 0 ? (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                        {filteredFeedback.map((item) => (
                            <div 
                                key={item._id} 
                                className="break-inside-avoid bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500 group relative overflow-hidden"
                            >
                                <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${
                                    item.type === 'improvement' ? 'text-yellow-500' : 
                                    item.type === 'review' ? 'text-green-500' : 'text-blue-500'
                                }`}>
                                    {item.type === 'improvement' ? <Lightbulb size={48} /> : 
                                     item.type === 'review' ? <Star size={48} /> : <MessageSquare size={48} />}
                                </div>
                                
                                <div className="space-y-4">
                                    <Quote className="text-primary/20" size={32} />
                                    <p className="text-gray-700 leading-relaxed text-lg italic italic-font">
                                        "{item.content}"
                                    </p>
                                    
                                    <div className="pt-6 border-t border-gray-50 flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black text-xl">
                                            {item.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-gray-900">{item.name}</h4>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{item.type}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-[2.5rem] p-20 text-center shadow-sm border border-gray-100 max-w-2xl mx-auto mb-20">
                        <div className="flex justify-center mb-6 text-gray-200">
                            <Quote size={64} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Community Highlights Yet</h3>
                        <p className="text-gray-500">
                            Be the first to share your experience on our feedback page!
                        </p>
                    </div>
                )}
            </div>
            
            <div className="py-20 text-center">
                <p className="text-gray-400 font-medium">Want to share your thoughts?</p>
                <a href="/feedback" className="text-primary font-black hover:underline text-lg">Leave your feedback here &rarr;</a>
            </div>
        </div>
    );
};

export default Community;
