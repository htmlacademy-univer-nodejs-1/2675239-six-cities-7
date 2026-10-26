import mongoose, { type HydratedDocument, type Model } from 'mongoose';
import type { UserType } from '../types/offer.js';

const { model, models, Schema } = mongoose;

export interface UserEntity {
  name: string;
  email: string;
  avatarUrl: string;
  password: string;
  type: UserType;
}

export type UserDocument = HydratedDocument<UserEntity>;

const userSchema = new Schema<UserEntity>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  avatarUrl: { type: String, required: true },
  password: { type: String, required: true },
  type: { type: String, enum: ['regular', 'pro'], required: true },
}, { timestamps: true, collection: 'users' });

export const UserModel = models.User as Model<UserEntity> | undefined
  ?? model<UserEntity>('User', userSchema);
