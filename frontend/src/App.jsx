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

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/providers" element={<Providers />} />
              <Route path="/user/dashboard" element={<UserDashboard />} />
              <Route path="/provider/dashboard" element={<ProviderDashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/feedback" element={<Feedback />} />
            </Routes>
          </main>
          <footer className="bg-white border-t border-gray-100 py-8">
            <div className="container mx-auto px-4 text-center">
                <p className="text-gray-600 mb-2">&copy; 2025 <span className="font-bold text-primary">PataJob</span>. All rights reserved.</p>
                <p className="text-sm text-gray-500">
                    Designed and developed by <a href="https://fastweb.co.ke" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Fastweb Technologies</a>
                </p>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
