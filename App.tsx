
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { User, UserRole } from './types';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AgentDashboard from './pages/AgentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ApartmentDetails from './pages/ApartmentDetails';
import Chat from './pages/Chat';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('immo_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('immo_user');
    setCurrentUser(null);
    window.location.hash = '#/';
  };

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <nav className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center">
                <Link to="/" className="text-2xl font-black text-blue-600 flex items-center gap-2 tracking-tighter">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  <span>YOURROOM</span>
                </Link>
              </div>

              <div className="hidden md:flex items-center space-x-8">
                <Link to="/" className="text-gray-600 hover:text-blue-600 font-bold text-sm uppercase tracking-widest">Annonces</Link>
                {currentUser?.role === UserRole.AGENT && (
                  <Link to="/agent" className="text-gray-600 hover:text-blue-600 font-bold text-sm uppercase tracking-widest">Mon Espace</Link>
                )}
                {currentUser?.role === UserRole.ADMIN && (
                  <Link to="/admin" className="text-gray-600 hover:text-blue-600 font-bold text-sm uppercase tracking-widest">Administration</Link>
                )}
                {currentUser ? (
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                         {currentUser.avatar ? <img src={currentUser.avatar} className="w-full h-full rounded-full object-cover" /> : currentUser.name.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-gray-700">{currentUser.name}</span>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="text-red-500 text-xs font-bold uppercase hover:underline"
                    >
                      Déconnexion
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link to="/login" className="text-gray-600 hover:text-blue-600 font-bold text-sm">Connexion</Link>
                    <Link to="/register" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-100">
                      S'inscrire
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login onLogin={(u) => setCurrentUser(u)} />} />
            <Route path="/register" element={<Register onLogin={(u) => setCurrentUser(u)} />} />
            <Route path="/agent" element={currentUser?.role === UserRole.AGENT ? <AgentDashboard user={currentUser} /> : <Login onLogin={(u) => setCurrentUser(u)} />} />
            <Route path="/admin" element={currentUser?.role === UserRole.ADMIN ? <AdminDashboard user={currentUser} /> : <Login onLogin={(u) => setCurrentUser(u)} />} />
            <Route path="/apartment/:id" element={<ApartmentDetails currentUser={currentUser} />} />
            <Route path="/chat/:agentId" element={<Chat currentUser={currentUser} />} />
          </Routes>
        </main>

        <footer className="bg-white border-t border-gray-100 py-12 mt-auto">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-gray-900 font-black text-xl mb-4 tracking-tighter">YOURROOM</p>
            <p className="text-gray-400 text-sm mb-6">&copy; 2024 YOURROOM Togo. La référence de l'immobilier local.</p>
            <div className="flex justify-center space-x-8 text-xs font-bold uppercase tracking-widest text-gray-400">
              <a href="#" className="hover:text-blue-600 transition">À propos</a>
              <a href="#" className="hover:text-blue-600 transition">Contact</a>
              <a href="#" className="hover:text-blue-600 transition">Mentions Légales</a>
            </div>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
