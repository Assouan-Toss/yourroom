
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Apartment } from '../types';

const Home: React.FC = () => {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('immo_apartments');
    if (saved) {
      setApartments(JSON.parse(saved));
    }
  }, []);

  const filtered = apartments.filter(apt => 
    apt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.quartier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.commune.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-20 text-center">
        <div className="inline-block bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6">
          Bienvenue sur YOURROOM
        </div>
        <h1 className="text-6xl font-black text-gray-900 mb-6 tracking-tighter leading-none">
          L'immobilier au <span className="text-blue-600">Togo</span><br/> n'a jamais été aussi simple.
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
          La plateforme n°1 pour trouver votre chambre, studio ou villa à Lomé et dans tout le Togo.
        </p>
        
        <div className="mt-12 flex justify-center">
          <div className="relative w-full max-w-2xl group">
            <input 
              type="text"
              placeholder="Ex: Agoè Assiyéyé, Hedzranawoé, Baguida..."
              className="w-full pl-16 pr-8 py-6 rounded-[2rem] border-none bg-white shadow-2xl shadow-blue-50 focus:ring-4 focus:ring-blue-100 transition-all duration-500 text-lg font-bold placeholder:text-gray-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-6 top-6 text-blue-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {filtered.map(apt => (
            <Link key={apt.id} to={`/apartment/${apt.id}`} className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 border border-gray-50 flex flex-col">
              <div className="relative h-72 overflow-hidden">
                <img src={apt.images[0]} alt={apt.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-1000" />
                <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-2xl font-black text-blue-600 shadow-xl text-lg">
                  {apt.price.toLocaleString()} <span className="text-[10px] font-bold">FCFA</span>
                </div>
                <div className="absolute bottom-6 left-6 flex gap-2">
                   <div className="bg-blue-600/90 backdrop-blur-sm text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                    {apt.region}
                  </div>
                </div>
              </div>
              <div className="p-8 flex-grow flex flex-col">
                <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-3">{apt.commune}</div>
                <h3 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-blue-600 transition tracking-tight line-clamp-1">{apt.title}</h3>
                
                <div className="flex items-center gap-2 text-gray-400 font-bold text-sm mb-8">
                  <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                  {apt.quartier}
                </div>

                <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-xs font-black text-blue-600 shadow-inner">
                      {apt.agentName.charAt(0)}
                    </div>
                    <div>
                       <span className="block text-[10px] text-gray-300 font-black uppercase tracking-widest">Agent</span>
                       <span className="text-xs text-gray-700 font-bold">{apt.agentName}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 group-hover:bg-blue-600 group-hover:text-white p-3 rounded-xl transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-white rounded-[3rem] border border-gray-50 shadow-inner">
          <div className="w-24 h-24 bg-blue-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-blue-200">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <h2 className="text-3xl font-black text-gray-800 mb-4 tracking-tight">Aucun bien ne correspond</h2>
          <p className="text-gray-400 font-bold max-w-sm mx-auto uppercase text-xs tracking-widest leading-relaxed">Les démarcheurs de YOURROOM mettent à jour les annonces quotidiennement. Revenez bientôt !</p>
        </div>
      )}
    </div>
  );
};

export default Home;
