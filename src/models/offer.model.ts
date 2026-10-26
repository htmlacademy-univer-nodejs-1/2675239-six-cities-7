import mongoose, { type HydratedDocument, type Model } from 'mongoose';
import type { City, Goods, OfferType } from '../types/offer.js';

const { model, models, Schema } = mongoose;

export interface OfferEntity {
  title: string;
  description: string;
  publicationDate: Date;
  city: City;
  previewImage: string;
  images: string[];
  isPremium: boolean;
  type: OfferType;
  rooms: number;
  guests: number;
  price: number;
  goods: Goods[];
  author: mongoose.Types.ObjectId;
}

export type OfferDocument = HydratedDocument<OfferEntity>;

const offerSchema = new Schema<OfferEntity>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  publicationDate: { type: Date, required: true },
  city: { type: String, required: true },
  previewImage: { type: String, required: true },
  images: [{ type: String }],
  isPremium: { type: Boolean, required: true },
  type: { type: String, required: true },
  rooms: { type: Number, required: true },
  guests: { type: Number, required: true },
  price: { type: Number, required: true },
  goods: [{ type: String }],
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true, collection: 'offers' });

export const OfferModel = models.Offer as Model<OfferEntity> | undefined
  ?? model<OfferEntity>('Offer', offerSchema);
