
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, UserRole } from '../types';

interface RegisterProps {
  onLogin: (user: User) => void;
}

const Register: React.FC<RegisterProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CLIENT);
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      role,
      phoneNumber: phone,
      avatar: ''
    };

    localStorage.setItem('immo_user', JSON.stringify(user));
    onLogin(user);
    if (role === UserRole.AGENT) {
      navigate('/agent');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-10 bg-white p-12 rounded-[2.5rem] shadow-2xl border border-gray-50">
        <div className="text-center">
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">Rejoignez-nous</h2>
          <p className="mt-3 text-gray-400 font-medium">La révolution de l'immobilier au Togo commence ici.</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Nom Complet</label>
              <input
                type="text" required placeholder="Ex: Koffi Mensah"
                className="w-full px-5 py-4 border-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500 font-medium text-gray-800 transition-all"
                value={name} onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Adresse Email</label>
              <input
                type="email" required placeholder="koffi@email.tg"
                className="w-full px-5 py-4 border-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500 font-medium text-gray-800 transition-all"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Téléphone</label>
              <input
                type="tel" required placeholder="+228 XX XX XX XX"
                className="w-full px-5 py-4 border-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500 font-medium text-gray-800 transition-all"
                value={phone} onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Votre rôle</label>
              <select
                className="w-full px-5 py-4 border-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-gray-700 transition-all"
                value={role} onChange={(e) => setRole(e.target.value as UserRole)}
              >
                <option value={UserRole.CLIENT}>Client (Je cherche un logement)</option>
                <option value={UserRole.AGENT}>Démarcheur (Je poste des annonces)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-5 px-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            S'inscrire gratuitement
          </button>
          
          <div className="text-center">
            <Link to="/login" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition">Déjà inscrit ? Connectez-vous</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
