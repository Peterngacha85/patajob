import { useContext, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { Menu, X, User as UserIcon } from 'lucide-react';

const navLinkClass = ({ isActive }) =>
    `transition ${isActive ? 'text-primary font-bold' : 'text-gray-600 hover:text-accent'}`;

const mobileNavLinkClass = ({ isActive }) =>
    `block py-2 font-medium transition ${isActive ? 'text-primary font-bold' : 'text-gray-600 hover:text-accent'}`;

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const dashboardPath = user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'provider' ? '/provider/dashboard' : '/user/dashboard';
    const dashboardLabel = user?.role === 'admin' ? 'Admin Dashboard' : user?.role === 'provider' ? 'Dashboard' : 'My Bookings';

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <Link to="/" onClick={() => setIsOpen(false)} className="text-2xl font-black tracking-tighter text-primary flex items-center gap-2">
                    <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white text-lg">P</div>
                    PataJob
                </Link>
                
                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-8 font-medium">
                    <NavLink to="/" end className={navLinkClass}>Home</NavLink>
                    <NavLink to="/providers" className={navLinkClass}>Available Providers</NavLink>
                    <NavLink to="/feedback" className={navLinkClass}>Feedback</NavLink>
                    <NavLink to="/community" className={navLinkClass}>Community</NavLink>

                    {user ? (
                        <>
                            <NavLink to={dashboardPath} end className={navLinkClass}>{dashboardLabel}</NavLink>

                            <NavLink
                                to={dashboardPath}
                                className={({ isActive }) => `flex items-center gap-1.5 transition ${isActive ? 'text-primary font-bold' : 'text-gray-600 hover:text-accent'}`}
                                title="My Profile Settings"
                            >
                                <UserIcon size={16} />
                                Profile
                            </NavLink>

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
                            <NavLink to="/login" className={navLinkClass}>Login</NavLink>
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
                    <NavLink to="/" end className={mobileNavLinkClass} onClick={() => setIsOpen(false)}>Home</NavLink>
                    <NavLink to="/providers" className={mobileNavLinkClass} onClick={() => setIsOpen(false)}>Available Providers</NavLink>
                    <NavLink to="/feedback" className={mobileNavLinkClass} onClick={() => setIsOpen(false)}>Feedback</NavLink>
                    <NavLink to="/community" className={mobileNavLinkClass} onClick={() => setIsOpen(false)}>Community</NavLink>
                    {user ? (
                        <>
                            <NavLink to={dashboardPath} end className={mobileNavLinkClass} onClick={() => setIsOpen(false)}>{dashboardLabel}</NavLink>
                            <NavLink to={dashboardPath} className={mobileNavLinkClass} onClick={() => setIsOpen(false)}>My Profile Setting</NavLink>
                            <button onClick={() => { handleLogout(); setIsOpen(false); }} className="block w-full text-left py-2 text-red-500 font-medium">Logout</button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login" className={mobileNavLinkClass} onClick={() => setIsOpen(false)}>Login</NavLink>
                            <NavLink to="/register?role=user" className={mobileNavLinkClass} onClick={() => setIsOpen(false)}>Register</NavLink>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
