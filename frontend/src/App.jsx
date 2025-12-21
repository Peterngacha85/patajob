import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

import Providers from './pages/Providers';
import ProviderDashboard from './pages/ProviderDashboard';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Feedback from './pages/Feedback';
import Community from './pages/Community';
import VerifyEmail from './pages/VerifyEmail';
import WelcomeModal from './components/modals/WelcomeModal';
import SessionManager from './components/common/SessionManager';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SessionManager />
        <div className="min-h-screen flex flex-col bg-gray-50">
          <WelcomeModal />
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify/:token" element={<VerifyEmail />} />
              <Route path="/providers" element={<Providers />} />
              <Route path="/user/dashboard" element={<UserDashboard />} />
              <Route path="/provider/dashboard" element={<ProviderDashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/community" element={<Community />} />
            </Routes>
          </main>
          <footer className="bg-white border-t border-gray-100 py-8">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                    <div className="text-center md:text-left mb-4 md:mb-0">
                        <h3 className="font-bold text-lg text-primary mb-2">Contact Support</h3>
                        <p className="text-gray-600 text-sm">Need help? Verification taking too long?</p>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 text-sm text-gray-600">
                        <a href="tel:0739090811" className="hover:text-primary flex items-center gap-2">
                            <span className="font-bold">Phone:</span> 0739090811
                        </a>
                        <a href="mailto:Info@patajob.co.ke" className="hover:text-primary flex items-center gap-2">
                            <span className="font-bold">Email:</span> Info@patajob.co.ke
                        </a>
                        <a href="https://wa.me/254794108498" target="_blank" rel="noopener noreferrer" className="hover:text-green-600 flex items-center gap-2">
                            <span className="font-bold">WhatsApp:</span> 0794108498
                        </a>
                    </div>
                </div>
                <hr className="border-gray-100 mb-6" />
                <div className="text-center">
                    <p className="text-gray-600 mb-2">&copy; 2025 <span className="font-bold text-primary">PataJob</span>. All rights reserved.</p>
                    <p className="text-sm text-gray-500">
                        Designed and developed by <a href="https://fastweb.co.ke" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Fastweb Technologies</a>
                    </p>
                </div>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
