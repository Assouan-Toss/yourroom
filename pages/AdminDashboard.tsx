
import React, { useState, useEffect } from 'react';
import { User, Apartment, UserRole } from '../types';

interface Props {
  user: User;
}

const AdminDashboard: React.FC<Props> = () => {
  const [stats, setStats] = useState({ agents: 0, apartments: 0, revenue: '25,400,000' });
  const [apartments, setApartments] = useState<Apartment[]>([]);

  useEffect(() => {
    const apts = JSON.parse(localStorage.getItem('immo_apartments') || '[]');
    setApartments(apts);
    setStats({
      agents: 12, // mock
      apartments: apts.length,
      revenue: (apts.length * 2500000).toLocaleString()
    });
  }, []);

  const deleteApartment = (id: string) => {
    const updated = apartments.filter(a => a.id !== id);
    setApartments(updated);
    localStorage.setItem('immo_apartments', JSON.stringify(updated));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Tableau de Bord Administrateur</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-400 text-sm font-bold uppercase mb-2">Démarcheurs Actifs</p>
          <p className="text-4xl font-extrabold text-blue-600">{stats.agents}</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-400 text-sm font-bold uppercase mb-2">Total Annonces</p>
          <p className="text-4xl font-extrabold text-green-600">{stats.apartments}</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-400 text-sm font-bold uppercase mb-2">Valeur Parc (FCFA)</p>
          <p className="text-4xl font-extrabold text-purple-600">{stats.revenue}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold">Modération des Annonces</h2>
          <button className="text-blue-600 font-bold text-sm">Voir tout</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-400 uppercase text-[10px] font-bold tracking-widest">
                <th className="px-6 py-4">Appartement</th>
                <th className="px-6 py-4">Agent</th>
                <th className="px-6 py-4">Localisation</th>
                <th className="px-6 py-4">Prix</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {apartments.map(apt => (
                <tr key={apt.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={apt.images[0]} className="w-10 h-10 rounded-lg object-cover" />
                      <span className="font-bold text-sm">{apt.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{apt.agentName}</td>
                  <td className="px-6 py-4 text-sm">{apt.commune}, {apt.region}</td>
                  <td className="px-6 py-4 text-sm font-bold">{apt.price.toLocaleString()} FCFA</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => deleteApartment(apt.id)}
                      className="text-red-500 hover:text-red-700 font-bold text-xs underline"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
