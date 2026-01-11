
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Message, User, Apartment } from '../types';
import { simulateAgentResponse } from '../services/geminiService';

interface Props {
  currentUser: User | null;
}

const Chat: React.FC<Props> = ({ currentUser }) => {
  const { agentId } = useParams();
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aptContext, setAptContext] = useState<Apartment | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load chat history and context
  useEffect(() => {
    // Try to find apartment context from location or localStorage
    const params = new URLSearchParams(location.search);
    const aptId = params.get('aptId');
    let context: Apartment | null = null;
    if (aptId) {
      const savedApts = localStorage.getItem('immo_apartments');
      if (savedApts) {
        context = JSON.parse(savedApts).find((a: Apartment) => a.id === aptId);
        if (context) setAptContext(context);
      }
    }

    const savedMessages = localStorage.getItem('immo_messages');
    if (savedMessages && currentUser) {
      const allMessages = JSON.parse(savedMessages) as Message[];
      // Filter messages between current user and agent
      const filtered = allMessages.filter(m => 
        (m.senderId === currentUser.id && m.receiverId === agentId) ||
        (m.senderId === agentId && m.receiverId === currentUser.id)
      );
      
      if (filtered.length > 0) {
        setMessages(filtered);
      } else {
        // Initial greeting if no history
        const welcome: Message = {
          id: 'welcome',
          senderId: agentId!,
          senderName: context?.agentName || 'Agent YOURROOM',
          receiverId: currentUser.id,
          content: "Bonjour ! Bienvenue sur YOURROOM. Je suis ravi de vous aider. Avez-vous des questions sur mes annonces ou souhaitez-vous visiter un bien aujourd'hui ?",
          timestamp: new Date().toISOString()
        };
        setMessages([welcome]);
      }
    }
  }, [agentId, currentUser, location.search]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const saveMessage = (msg: Message) => {
    const saved = localStorage.getItem('immo_messages');
    const all = saved ? JSON.parse(saved) : [];
    localStorage.setItem('immo_messages', JSON.stringify([...all, msg]));
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentUser) return;

    const userMsg: Message = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: currentUser.id,
      senderName: currentUser.name,
      receiverId: agentId!,
      content: input,
      timestamp: new Date().toISOString()
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    saveMessage(userMsg);
    setInput('');
    setIsTyping(true);

    // AI Simulation of Agent Response
    const contextStr = aptContext ? `${aptContext.title} à ${aptContext.quartier}, ${aptContext.price} FCFA` : "un de mes biens immobiliers";
    const responseText = await simulateAgentResponse(input, contextStr);
    
    setTimeout(() => {
      const agentMsg: Message = {
        id: Math.random().toString(36).substr(2, 9),
        senderId: agentId!,
        senderName: aptContext?.agentName || 'Agent YOURROOM',
        receiverId: currentUser.id,
        content: responseText,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, agentMsg]);
      saveMessage(agentMsg);
      setIsTyping(false);
    }, 2000);
  };

  if (!currentUser) return (
    <div className="flex flex-col items-center justify-center p-20 text-center space-y-6">
      <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
      </div>
      <p className="text-xl font-bold text-gray-900">Connexion requise</p>
      <p className="text-gray-500 max-w-xs mx-auto">Veuillez vous connecter à votre compte YOURROOM pour discuter avec ce démarcheur.</p>
      <button onClick={() => window.location.hash = '#/login'} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold">Se connecter</button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="bg-white rounded-t-3xl p-6 border-b border-gray-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">
            {agentId?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-black text-gray-900 text-lg">Démarcheur YOURROOM</p>
            <p className="text-[10px] text-green-500 font-black uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Disponible pour visite
            </p>
          </div>
        </div>
        {aptContext && (
          <div className="hidden md:flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-2xl">
             <img src={aptContext.images[0]} className="w-10 h-10 rounded-xl object-cover" />
             <div className="text-[10px] font-bold text-blue-800">
               <p className="line-clamp-1">{aptContext.title}</p>
               <p>{aptContext.price.toLocaleString()} FCFA</p>
             </div>
          </div>
        )}
      </div>

      {/* Message Area */}
      <div ref={scrollRef} className="flex-grow bg-white border-x border-gray-100 overflow-y-auto p-8 space-y-6">
        {messages.map((m) => {
          const isMe = m.senderId === currentUser.id;
          return (
            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[80%] p-5 rounded-[1.5rem] shadow-sm ${
                isMe 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-gray-50 text-gray-800 rounded-tl-none border border-gray-100'
              }`}>
                <p className="text-sm font-medium leading-relaxed">{m.content}</p>
                <p className={`text-[9px] mt-2 font-bold uppercase tracking-widest ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-gray-50 p-4 rounded-2xl rounded-tl-none border border-gray-100 flex gap-1.5">
              <div className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-white p-6 rounded-b-3xl border-t border-gray-100 shadow-xl">
        <form onSubmit={handleSend} className="flex gap-4">
          <input 
            type="text" 
            placeholder="Posez vos questions sur le prix, la caution, l'eau..."
            className="flex-grow bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="bg-blue-600 text-white px-6 py-4 rounded-2xl hover:bg-blue-700 transition shadow-lg shadow-blue-100">
            <svg className="w-6 h-6 rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;