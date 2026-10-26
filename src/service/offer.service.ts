import { injectable } from 'inversify';
import mongoose from 'mongoose';
import { OfferModel, type OfferDocument, type OfferEntity } from '../models/offer.model.js';

export interface OfferServiceInterface {
  findById(id: string): Promise<OfferDocument | null>;
  create(offer: OfferEntity): Promise<OfferDocument>;
}

@injectable()
export class OfferService implements OfferServiceInterface {
  public async findById(id: string): Promise<OfferDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return OfferModel.findById(id).exec();
  }

  public async create(offer: OfferEntity): Promise<OfferDocument> {
    return new OfferModel(offer).save();
  }
}
