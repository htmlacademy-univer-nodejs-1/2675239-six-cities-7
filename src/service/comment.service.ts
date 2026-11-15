import { injectable } from 'inversify';
import mongoose from 'mongoose';
import { CommentModel, type CommentDocument } from '../models/comment.model.js';
import { OfferModel } from '../models/offer.model.js';
import type { CreateCommentDto } from '../types/offer.js';

@injectable()
export class CommentService {
  public async findByOfferId(offerId: string, limit = 50): Promise<CommentDocument[]> {
    if (!mongoose.Types.ObjectId.isValid(offerId)) {
      return [];
    }
    return CommentModel.find({ offer: offerId })
      .sort({ publicationDate: -1 })
      .limit(limit)
      .populate('author')
      .exec();
  }

  public async create(dto: CreateCommentDto): Promise<CommentDocument> {
    const comment = await new CommentModel({
      comment: dto.comment,
      rating: dto.rating,
      author: new mongoose.Types.ObjectId(dto.author),
      offer: new mongoose.Types.ObjectId(dto.offer),
      publicationDate: new Date(),
    }).save();

    const [commentsCount, average] = await Promise.all([
      CommentModel.countDocuments({ offer: comment.offer }).exec(),
      CommentModel.aggregate<{ averageRating: number }>([
        { $match: { offer: comment.offer } },
        { $group: { _id: null, averageRating: { $avg: '$rating' } } },
      ]).exec(),
    ]);
    await OfferModel.updateOne(
      { _id: comment.offer },
      {
        $set: {
          commentsCount,
          rating: Math.round((average[0]?.averageRating ?? 0) * 10) / 10,
        },
      },
    ).exec();

    return comment.populate('author');
  }
}
