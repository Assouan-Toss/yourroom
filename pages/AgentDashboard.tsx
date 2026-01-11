
import React, { useState, useEffect, useRef } from 'react';
import { User, Apartment, Message } from '../types';
import { generateEnticingDescription } from '../services/geminiService';

interface AgentDashboardProps {
  user: User;
}

const AgentDashboard: React.FC<AgentDashboardProps> = ({ user: initialUser }) => {
  const [currentUser, setCurrentUser] = useState<User>(initialUser);
  const [myApartments, setMyApartments] = useState<Apartment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'annonces' | 'profil' | 'messages'>('dashboard');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    region: 'TOGO',
    commune: '',
    quartier: '',
    rue: '',
    agentPhone: currentUser.phoneNumber || '',
  });
  
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [profileData, setProfileData] = useState({
    name: currentUser.name,
    phoneNumber: currentUser.phoneNumber || '',
    avatar: currentUser.avatar || ''
  });

  useEffect(() => {
    // Load apartments
    const savedApts = localStorage.getItem('immo_apartments');
    if (savedApts) {
      const all = JSON.parse(savedApts) as Apartment[];
      setMyApartments(all.filter(a => a.agentId === currentUser.id));
    }

    // Load messages where this agent is receiver
    const savedMsgs = localStorage.getItem('immo_messages');
    if (savedMsgs) {
      const all = JSON.parse(savedMsgs) as Message[];
      setMessages(all.filter(m => m.receiverId === currentUser.id));
    }
  }, [currentUser.id]);

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser = { ...currentUser, ...profileData };
    setCurrentUser(updatedUser);
    localStorage.setItem('immo_user', JSON.stringify(updatedUser));
    alert("Profil YOURROOM mis à jour !");
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setProfileData({ ...profileData, avatar: ev.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAISuggest = async () => {
    if (!formData.title || !formData.commune) {
      alert("Veuillez remplir le titre et la commune pour l'aide IA.");
      return;
    }
    setLoadingAI(true);
    const desc = await generateEnticingDescription(formData);
    setFormData({ ...formData, description: desc });
    setLoadingAI(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setIsUploading(true);
    const readers = (Array.from(files) as File[]).map((file: File) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(base64Images => {
      setSelectedImages(prev => [...prev, ...base64Images]);
      setIsUploading(false);
    });
  };

  const handleEdit = (apt: Apartment) => {
    setFormData({ ...apt });
    setSelectedImages(apt.images);
    setIsEditing(apt.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Supprimer définitivement cette annonce ?")) {
      const saved = localStorage.getItem('immo_apartments');
      if (saved) {
        const all = JSON.parse(saved) as Apartment[];
        const updated = all.filter(a => a.id !== id);
        localStorage.setItem('immo_apartments', JSON.stringify(updated));
        setMyApartments(updated.filter(a => a.agentId === currentUser.id));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedImages.length === 0) {
      alert("Ajoutez au moins une photo.");
      return;
    }

    const saved = localStorage.getItem('immo_apartments');
    const all = saved ? JSON.parse(saved) : [];

    if (isEditing) {
      const updatedAll = all.map((a: Apartment) => 
        a.id === isEditing ? { ...a, ...formData, images: selectedImages } : a
      );
      localStorage.setItem('immo_apartments', JSON.stringify(updatedAll));
      setMyApartments(updatedAll.filter((a: Apartment) => a.agentId === currentUser.id));
      setIsEditing(null);
    } else {
      const newApt: Apartment = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        agentId: currentUser.id,
        agentName: currentUser.name,
        agentPhone: formData.agentPhone || currentUser.phoneNumber || '',
        images: selectedImages,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('immo_apartments', JSON.stringify([newApt, ...all]));
      setMyApartments([newApt, ...myApartments]);
    }

    setShowForm(false);
    setSelectedImages([]);
    setFormData({ title: '', description: '', price: 0, region: 'TOGO', commune: '', quartier: '', rue: '', agentPhone: currentUser.phoneNumber || '' });
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-gray-50">
      <aside className="w-72 bg-white border-r border-gray-100 hidden lg:flex flex-col sticky top-16 h-[calc(100vh-64px)]">
        <div className="p-8">
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-2xl mb-4 shadow-xl overflow-hidden group relative">
              {currentUser.avatar ? <img src={currentUser.avatar} className="w-full h-full object-cover" /> : currentUser.name.charAt(0)}
              <button onClick={() => setActiveTab('profil')} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-[8px] font-black uppercase">Edit</button>
            </div>
            <p className="font-black text-gray-900 line-clamp-1">{currentUser.name}</p>
            <p className="text-[10px] text-blue-600 font-black uppercase mt-1 tracking-widest">Agent Certifié</p>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: 'Vue d\'ensemble', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
              { id: 'annonces', label: 'Mes Biens', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
              { id: 'messages', label: 'Messages', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
              { id: 'profil', label: 'Compte', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); setShowForm(false); }}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'text-gray-400 hover:bg-gray-50'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} /></svg>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      <main className="flex-grow p-10 overflow-y-auto h-[calc(100vh-64px)]">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'dashboard' && !showForm && (
            <div className="space-y-10 animate-in fade-in duration-500">
               <div className="flex justify-between items-end">
                 <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Espace Démarcheur</h1>
                    <p className="text-gray-400 font-medium">Gérez vos activités YOURROOM Togo.</p>
                 </div>
                 <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-50">Nouvelle Annonce</button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-5xl font-black text-blue-600 mb-2">{myApartments.length}</p>
                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Biens Actifs</p>
                  </div>
                  <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-5xl font-black text-green-500 mb-2">{messages.length}</p>
                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Nouveaux Messages</p>
                  </div>
                  <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-3xl font-black text-purple-600 mb-2">{myApartments.reduce((a,b)=>a+b.price, 0).toLocaleString()} <span className="text-xs">FCFA</span></p>
                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Portefeuille total</p>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="animate-in fade-in duration-500">
              <h2 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">Boîte de réception</h2>
              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                {messages.length > 0 ? (
                  <div className="divide-y divide-gray-50">
                    {messages.map(m => (
                      <div key={m.id} className="p-6 hover:bg-gray-50 transition cursor-pointer flex items-center justify-between" onClick={() => window.location.hash = `#/chat/${m.senderId}`}>
                        <div className="flex items-center gap-4">
                          {/* // Fix: Property 'clientName' replaced with 'senderName' */}
                          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black">{m.senderName?.charAt(0) || 'C'}</div>
                          <div>
                            {/* // Fix: Property 'clientName' replaced with 'senderName' */}
                            <p className="font-bold text-gray-900">{m.senderName || 'Un client'}</p>
                            <p className="text-sm text-gray-500 line-clamp-1">{m.content}</p>
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-400 font-bold">{new Date(m.timestamp).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-20 text-center text-gray-400 font-bold italic">Aucun message pour le moment.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'annonces' && !showForm && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
              {myApartments.map(apt => (
                <div key={apt.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm group">
                  <div className="relative h-48">
                    <img src={apt.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-xl text-[10px] font-black text-blue-600">{apt.price.toLocaleString()} FCFA</div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-black text-gray-900 mb-6 line-clamp-1">{apt.title}</h3>
                    <div className="flex gap-3">
                      <button onClick={() => handleEdit(apt)} className="flex-grow bg-blue-50 text-blue-600 py-3 rounded-xl font-black text-xs hover:bg-blue-600 hover:text-white transition">Modifier</button>
                      <button onClick={() => handleDelete(apt.id)} className="bg-red-50 text-red-600 p-3 rounded-xl hover:bg-red-500 hover:text-white transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'profil' && (
             <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl max-w-2xl">
               <form onSubmit={handleProfileUpdate} className="space-y-8">
                  <div className="flex flex-col items-center mb-8">
                     <div className="relative w-32 h-32 mb-4">
                        <img src={profileData.avatar || 'https://via.placeholder.com/128'} className="w-full h-full rounded-3xl object-cover shadow-inner" />
                        <button type="button" onClick={() => avatarInputRef.current?.click()} className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-xl shadow-lg hover:bg-blue-700 transition">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </button>
                        <input type="file" ref={avatarInputRef} hidden accept="image/*" onChange={handleAvatarChange} />
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nom Complet</label>
                      <input type="text" className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 font-bold" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">WhatsApp</label>
                      <input type="tel" className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 font-bold" value={profileData.phoneNumber} onChange={e => setProfileData({...profileData, phoneNumber: e.target.value})} />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black shadow-2xl hover:bg-black transition-all">Enregistrer mon profil</button>
               </form>
             </div>
          )}

          {showForm && (
            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-2xl animate-in slide-in-from-bottom-8 duration-500">
               <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <div className="space-y-6">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Titre</label>
                          <input type="text" required className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 font-bold" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <input type="text" placeholder="Commune" required className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 font-medium" value={formData.commune} onChange={e => setFormData({...formData, commune: e.target.value})} />
                           <input type="text" placeholder="Quartier" required className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 font-medium" value={formData.quartier} onChange={e => setFormData({...formData, quartier: e.target.value})} />
                        </div>
                        <input type="number" placeholder="Prix (FCFA)" required className="w-full bg-blue-50 border-none rounded-2xl px-5 py-4 font-black text-blue-600 text-xl" value={formData.price} onChange={e => setFormData({...formData, price: parseInt(e.target.value)})} />
                     </div>
                     <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</label>
                          <button type="button" onClick={handleAISuggest} disabled={loadingAI} className="text-[9px] bg-purple-600 text-white px-3 py-1.5 rounded-full font-black">✨ AIDE IA</button>
                        </div>
                        <textarea required rows={6} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 font-medium" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                     </div>
                  </div>
                  <div className="border-t pt-8">
                     <div onClick={() => fileInputRef.current?.click()} className="border-3 border-dashed border-gray-100 rounded-3xl p-10 text-center cursor-pointer hover:bg-blue-50 transition">
                        <input type="file" ref={fileInputRef} multiple accept="image/*" hidden onChange={handleFileChange} />
                        <p className="font-black text-gray-800">Cliquez pour ajouter des photos</p>
                        {isUploading && <p className="text-blue-600 font-black animate-pulse text-[10px] mt-2">CHARGEMENT...</p>}
                     </div>
                     <div className="grid grid-cols-4 gap-4 mt-6">
                        {selectedImages.map((img, idx) => (
                           <img key={idx} src={img} className="w-full h-24 object-cover rounded-xl border border-gray-100" />
                        ))}
                     </div>
                  </div>
                  <div className="flex gap-4">
                    <button type="submit" className="flex-grow bg-blue-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-50">Publier au Togo</button>
                    <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-400 px-8 py-5 rounded-2xl font-black">Annuler</button>
                  </div>
               </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AgentDashboard;