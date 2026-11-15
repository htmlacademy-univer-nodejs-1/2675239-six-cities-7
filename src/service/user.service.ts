import { injectable } from 'inversify';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import mongoose from 'mongoose';
import { UserModel, type UserDocument, type UserEntity } from '../models/user.model.js';
import { OfferModel } from '../models/offer.model.js';
import type { CreateUserDto } from '../types/offer.js';

const scrypt = promisify(scryptCallback);
const DEFAULT_AVATAR = '/img/avatar.svg';

const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = await scrypt(password, salt, 64) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
};

export interface UserServiceInterface {
  findById(id: string): Promise<UserDocument | null>;
  findByEmail(email: string): Promise<UserDocument | null>;
  create(dto: CreateUserDto): Promise<UserDocument>;
}

@injectable()
export class UserService implements UserServiceInterface {
  public async findById(id: string): Promise<UserDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return UserModel.findById(id).exec();
  }

  public async findByEmail(email: string): Promise<UserDocument | null> {
    return UserModel.findOne({ email }).exec();
  }

  public async create(dto: CreateUserDto): Promise<UserDocument> {
    const user: Partial<UserEntity> = {
      name: dto.name,
      email: dto.email,
      avatarUrl: dto.avatarUrl ?? DEFAULT_AVATAR,
      passwordHash: await hashPassword(dto.password),
      type: dto.type,
      favoriteOffers: [],
    };
    return new UserModel(user).save();
  }

  public async verifyPassword(email: string, password: string): Promise<UserDocument | null> {
    const user = await this.findByEmail(email);
    if (!user) {
      return null;
    }
    const [salt, storedHash] = user.passwordHash.split(':');
    if (!salt || !storedHash) {
      return null;
    }
    const candidate = await scrypt(password, salt, 64) as Buffer;
    const stored = Buffer.from(storedHash, 'hex');
    if (candidate.length !== stored.length || !timingSafeEqual(candidate, stored)) {
      return null;
    }
    return user;
  }

  public async addFavorite(userId: string, offerId: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(offerId)) {
      return false;
    }
    const [user, offer] = await Promise.all([
      UserModel.findById(userId).exec(),
      OfferModel.exists({ _id: offerId }).exec(),
    ]);
    if (!user || !offer) {
      return false;
    }
    await UserModel.updateOne({ _id: userId }, { $addToSet: { favoriteOffers: offerId } }).exec();
    return true;
  }

  public async removeFavorite(userId: string, offerId: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(offerId)) {
      return false;
    }
    const [user, offer] = await Promise.all([
      UserModel.exists({ _id: userId }).exec(),
      OfferModel.exists({ _id: offerId }).exec(),
    ]);
    if (!user || !offer) {
      return false;
    }
    await UserModel.updateOne({ _id: userId }, { $pull: { favoriteOffers: offerId } }).exec();
    return true;
  }
}
