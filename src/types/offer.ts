export type City = 'Paris' | 'Cologne' | 'Brussels' | 'Amsterdam' | 'Hamburg' | 'Dusseldorf';
export type OfferType = 'apartment' | 'house' | 'room' | 'hotel';
export type UserType = 'regular' | 'pro';
export type Goods = 'Breakfast' | 'Air conditioning' | 'Laptop friendly workspace' | 'Baby seat' | 'Washer' | 'Towels' | 'Fridge';

export interface User {
  name: string;
  email: string;
  avatarUrl: string;
  password: string;
  type: UserType;
}

export interface Offer {
  title: string;
  description: string;
  publicationDate: string;
  city: City;
  previewImage: string;
  images: string[];
  isPremium: boolean;
  type: OfferType;
  rooms: number;
  guests: number;
  price: number;
  goods: Goods[];
  author: User;
}

export type OfferSeed = Offer;
