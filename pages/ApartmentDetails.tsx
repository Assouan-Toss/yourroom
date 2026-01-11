
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Apartment, User, Review } from '../types';

interface Props {
  currentUser: User | null;
}

const ApartmentDetails: React.FC<Props> = ({ currentUser }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [apt, setApt] = useState<Apartment | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [activeImage, setActiveImage] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('immo_apartments');
    if (saved) {
      const all = JSON.parse(saved) as Apartment[];
      const found = all.find(a => a.id === id);
      if (found) {
        setApt(found);
        setActiveImage(found.images[0]);
      }
    }
    
    // Load reviews
    const savedReviews = localStorage.getItem(`reviews_${id}`);
    if (savedReviews) setReviews(JSON.parse(savedReviews));
  }, [id]);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Veuillez vous connecter pour laisser un avis.');
      navigate('/login');
      return;
    }
    
    if (!newReview.comment.trim()) {
      alert('Veuillez écrire un commentaire.');
      return;
    }

    const review: Review = {
      id: Math.random().toString(36).substr(2, 9),
      apartmentId: id!,
      clientId: currentUser.id,
      clientName: currentUser.name,
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date().toLocaleDateString()
    };
    
    const updated = [review, ...reviews];
    setReviews(updated);
    localStorage.setItem(`reviews_${id}`, JSON.stringify(updated));
    setNewReview({ rating: 5, comment: '' });
    // Force immediate sync for other parts of the UI if needed
    window.dispatchEvent(new Event('storage'));
  };

  if (!apt) return (
    <div className="p-20 text-center flex flex-col items-center gap-4">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <div className="text-gray-400 font-bold uppercase tracking-widest text-xs">Chargement YOURROOM...</div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Gallery */}
        <div className="space-y-6">
          <div className="rounded-[3rem] overflow-hidden h-[550px] shadow-2xl bg-white border border-gray-50 group">
            <img src={activeImage} className="w-full h-full object-cover group-hover:scale-105 transition duration-1000" alt={apt.title} />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-6 px-2 scrollbar-hide">
            {apt.images.map((img, i) => (
              <img 
                key={i} 
                src={img} 
                onClick={() => setActiveImage(img)}
                className={`rounded-[1.5rem] h-24 w-24 object-cover cursor-pointer flex-shrink-0 transition-all border-4 ${activeImage === img ? 'border-blue-600 shadow-xl' : 'border-transparent opacity-60 hover:opacity-100'}`} 
              />
            ))}
          </div>
        </div>

        {/* Details Card */}
        <div className="flex flex-col">
          <div className="flex-grow">
            <div className="inline-block bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6">
              {apt.commune} • {apt.quartier}
            </div>
            <h1 className="text-5xl font-black text-gray-900 mb-6 tracking-tighter leading-none">{apt.title}</h1>
            <p className="text-4xl font-black text-blue-600 mb-10 flex items-baseline gap-2">
              {apt.price.toLocaleString()} <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">FCFA / Mois</span>
            </p>
            
            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm mb-10">
              <p className="text-[10px] font-black uppercase text-gray-400 mb-6 tracking-widest border-b border-gray-50 pb-4">À propos de ce bien</p>
              <p className="text-gray-700 leading-relaxed text-lg font-medium whitespace-pre-wrap">{apt.description}</p>
            </div>
          </div>

          <div className="bg-gray-900 text-white p-10 rounded-[3rem] shadow-2xl space-y-10">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl">
                {apt.agentName.charAt(0)}
              </div>
              <div>
                <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-1">Propriétaire / Démarcheur</p>
                <p className="font-black text-2xl tracking-tight">{apt.agentName}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <button 
                onClick={() => navigate(`/chat/${apt.agentId}?aptId=${apt.id}`)}
                className="bg-blue-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" /><path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" /></svg>
                Discuter
              </button>
              <a 
                href={`tel:${apt.agentPhone}`}
                className="bg-white text-gray-900 py-5 rounded-2xl font-black text-lg hover:bg-gray-100 transition-all flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                Appeler
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-32 pt-20 border-t border-gray-100 grid grid-cols-1 lg:grid-cols-3 gap-24">
        <div className="lg:col-span-2 space-y-12">
          <div className="flex items-center gap-4">
             <h2 className="text-4xl font-black text-gray-900 tracking-tight">Expériences Clients</h2>
             <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full font-black text-sm shadow-sm">{reviews.length}</span>
          </div>
          
          <div className="grid gap-8">
            {reviews.map(r => (
              <div key={r.id} className="bg-white p-10 rounded-[3rem] border border-gray-50 shadow-sm hover:shadow-2xl transition-all group">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner uppercase">{r.clientName.charAt(0)}</div>
                     <div>
                        <span className="font-black text-gray-900 block text-lg">{r.clientName}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{r.date}</span>
                     </div>
                  </div>
                  <div className="flex text-yellow-400 bg-yellow-50 px-4 py-2 rounded-2xl font-black text-sm gap-1">
                    {r.rating} <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed font-medium italic text-xl group-hover:text-gray-900 transition line-clamp-3">"{r.comment}"</p>
                <div className="mt-8 pt-6 border-t border-gray-50 flex items-center gap-2">
                   <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                   <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Avis vérifié YOURROOM</span>
                </div>
              </div>
            ))}
            {reviews.length === 0 && (
              <div className="bg-white p-24 rounded-[3.5rem] text-center border-2 border-dashed border-gray-100 flex flex-col items-center">
                <div className="text-gray-200 mb-6">
                  <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                </div>
                <p className="text-gray-300 font-black text-2xl tracking-tight">Soyez le premier à partager votre expérience !</p>
              </div>
            )}
          </div>
        </div>

        {/* Review Form */}
        <div>
          <div className="sticky top-28 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl space-y-8">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Votre avis compte</h2>
            <form onSubmit={handleReviewSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-3 tracking-widest">Note YOURROOM</label>
                <select 
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 outline-none font-black text-gray-800" 
                  value={newReview.rating} 
                  onChange={e => setNewReview({...newReview, rating: parseInt(e.target.value)})}
                >
                  <option value="5">Excellent ⭐⭐⭐⭐⭐</option>
                  <option value="4">Très Bien ⭐⭐⭐⭐</option>
                  <option value="3">Moyen ⭐⭐⭐</option>
                  <option value="2">Décevant ⭐⭐</option>
                  <option value="1">Mauvais ⭐</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-3 tracking-widest">Commentaire</label>
                <textarea 
                  required
                  placeholder="Eau disponible ? Quartier calme ? Démarcheur sérieux ?"
                  className="w-full bg-gray-50 border-none rounded-2xl p-6 h-48 focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed font-medium placeholder:text-gray-300"
                  value={newReview.comment}
                  onChange={e => setNewReview({...newReview, comment: e.target.value})}
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black text-lg hover:bg-blue-700 transition shadow-xl shadow-blue-100 hover:-translate-y-1"
              >
                Publier sur YOURROOM
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApartmentDetails;
