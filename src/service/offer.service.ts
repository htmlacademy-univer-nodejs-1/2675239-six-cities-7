import { injectable } from 'inversify';
import mongoose from 'mongoose';
import { CommentModel } from '../models/comment.model.js';
import { OfferModel, type OfferDocument } from '../models/offer.model.js';
import { UserModel } from '../models/user.model.js';
import type { City, CreateOfferDto, Location, UpdateOfferDto } from '../types/offer.js';

const CITY_LOCATIONS: Record<City, Location> = {
  Paris: { latitude: 48.85661, longitude: 2.351499 },
  Cologne: { latitude: 50.938361, longitude: 6.959974 },
  Brussels: { latitude: 50.846557, longitude: 4.351697 },
  Amsterdam: { latitude: 52.370216, longitude: 4.895168 },
  Hamburg: { latitude: 53.550341, longitude: 10.000654 },
  Dusseldorf: { latitude: 51.225402, longitude: 6.776314 },
};

export interface OfferServiceInterface {
  findById(id: string): Promise<OfferDocument | null>;
  find(limit?: number): Promise<OfferDocument[]>;
  findPremiumByCity(city: City): Promise<OfferDocument[]>;
  findFavorites(userId: string): Promise<OfferDocument[]>;
  create(offer: CreateOfferDto): Promise<OfferDocument>;
  update(id: string, authorId: string, dto: UpdateOfferDto): Promise<OfferDocument | null>;
  delete(id: string, authorId: string): Promise<boolean>;
}

@injectable()
export class OfferService implements OfferServiceInterface {
  public async findById(id: string): Promise<OfferDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return OfferModel.findById(id).populate('author').exec();
  }

  public async find(limit = 60): Promise<OfferDocument[]> {
    return OfferModel.find().sort({ publicationDate: -1 }).limit(limit).populate('author').exec();
  }

  public async findPremiumByCity(city: City): Promise<OfferDocument[]> {
    return OfferModel.find({ city, isPremium: true })
      .sort({ publicationDate: -1 })
      .limit(3)
      .populate('author')
      .exec();
  }

  public async findFavorites(userId: string): Promise<OfferDocument[]> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return [];
    }
    const user = await UserModel.findById(userId).select('favoriteOffers').exec();
    if (!user) {
      return [];
    }
    return OfferModel.find({ _id: { $in: user.favoriteOffers } })
      .sort({ publicationDate: -1 })
      .populate('author')
      .exec();
  }

  public async create(dto: CreateOfferDto): Promise<OfferDocument> {
    const offer = {
      ...dto,
      location: CITY_LOCATIONS[dto.city],
      author: new mongoose.Types.ObjectId(dto.author),
      commentsCount: 0,
      rating: 0,
    };
    return new OfferModel(offer).save();
  }

  public async update(id: string, authorId: string, dto: UpdateOfferDto): Promise<OfferDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(authorId)) {
      return null;
    }
    const update = { ...dto };
    if (dto.city) {
      Object.assign(update, { location: CITY_LOCATIONS[dto.city] });
    }
    return OfferModel.findOneAndUpdate(
      { _id: id, author: authorId },
      { $set: update },
      { new: true },
    ).exec();
  }

  public async delete(id: string, authorId: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(authorId)) {
      return false;
    }
    const offer = await OfferModel.findOne({ _id: id, author: authorId }).exec();
    if (!offer) {
      return false;
    }
    await CommentModel.deleteMany({ offer: offer._id }).exec();
    await offer.deleteOne();
    return true;
  }
}
