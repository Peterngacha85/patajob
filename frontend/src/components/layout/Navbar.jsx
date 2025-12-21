import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { Menu, X, User as UserIcon } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <Link to="/" onClick={() => setIsOpen(false)} className="text-2xl font-black tracking-tighter text-primary flex items-center gap-2">
                    <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white text-lg">P</div>
                    PataJob
                </Link>
                
                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-8 font-medium text-gray-600">
                    <Link to="/" className="hover:text-primary transition">Home</Link>
                    <Link to="/providers" className="hover:text-primary transition">Available Providers</Link>
                    <Link to="/feedback" className="hover:text-primary transition">Feedback</Link>
                    <Link to="/community" className="hover:text-primary transition">Community</Link>
                    
                    {user ? (
                        <>
                            {user.role === 'provider' && <Link to="/provider/dashboard" className="text-primary font-bold hover:opacity-80 transition">Dashboard</Link>}
                            {user.role === 'user' && <Link to="/user/dashboard" className="text-primary font-bold hover:opacity-80 transition">My Bookings</Link>}
                            {user.role === 'admin' && <Link to="/admin/dashboard" className="text-primary font-bold hover:opacity-80 transition">Admin Dashboard</Link>}
                            
                            <Link 
                                to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'provider' ? '/provider/dashboard' : '/user/dashboard'} 
                                className="text-gray-600 hover:text-primary transition flex items-center gap-1.5"
                                title="My Profile Settings"
                            >
                                <UserIcon size={16} />
                                Profile
                            </Link>

                            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                    <UserIcon size={18} />
                                </div>
                                <span className="font-semibold text-gray-800">{user.name}</span>
                            </div>
                            <button onClick={handleLogout} className="text-red-500 hover:text-red-600 font-medium transition text-sm">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="hover:text-primary transition">Login</Link>
                            <Link to="/register?role=user" className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-full font-bold transition shadow-md hover:shadow-lg">
                                Get Started
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button className="md:hidden text-gray-700" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-4 shadow-xl absolute w-full left-0">
                    <div className="flex justify-start mb-6 border-b pb-4">
                        <Link to="/" onClick={() => setIsOpen(false)} className="text-xl font-black tracking-tighter text-primary flex items-center gap-2">
                            <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center text-white text-sm">P</div>
                            PataJob
                        </Link>
                    </div>
                    <Link to="/" className="block py-2 text-gray-600 font-medium hover:text-primary" onClick={() => setIsOpen(false)}>Home</Link>
                    <Link to="/providers" className="block py-2 text-gray-600 font-medium hover:text-primary" onClick={() => setIsOpen(false)}>Available Providers</Link>
                    <Link to="/feedback" className="block py-2 text-gray-600 font-medium hover:text-primary" onClick={() => setIsOpen(false)}>Feedback</Link>
                    <Link to="/community" className="block py-2 text-gray-600 font-medium hover:text-primary" onClick={() => setIsOpen(false)}>Community</Link>
                    {user ? (
                        <>
                            <Link to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'provider' ? '/provider/dashboard' : '/user/dashboard'} className="block py-2 text-primary font-bold" onClick={() => setIsOpen(false)}>Dashboard</Link>
                            <Link to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'provider' ? '/provider/dashboard' : '/user/dashboard'} className="block py-2 text-gray-600 font-medium hover:text-primary" onClick={() => setIsOpen(false)}>My Profile Setting</Link>
                            <button onClick={() => { handleLogout(); setIsOpen(false); }} className="block w-full text-left py-2 text-red-500 font-medium">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="block py-2 text-gray-600 font-medium hover:text-primary" onClick={() => setIsOpen(false)}>Login</Link>
                            <Link to="/register?role=user" className="block py-2 text-primary font-bold" onClick={() => setIsOpen(false)}>Register</Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
