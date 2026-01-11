
export enum UserRole {
  ADMIN = 'ADMIN',
  AGENT = 'AGENT', // Démarcheur
  CLIENT = 'CLIENT'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string; // Photo de profil en Base64
  phoneNumber?: string;
}

export interface Apartment {
  id: string;
  title: string;
  description: string;
  price: number; // in FCFA
  region: string;
  commune: string;
  quartier: string;
  rue: string;
  agentId: string;
  agentName: string;
  agentPhone: string;
  images: string[];
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName?: string;
  receiverId: string;
  content: string;
  timestamp: string;
}

export interface Review {
  id: string;
  apartmentId: string;
  clientId: string;
  clientName: string;
  rating: number;
  comment: string;
  date: string;
}