import mongoose, { type HydratedDocument, type Model } from 'mongoose';

const { model, models, Schema } = mongoose;

export interface CommentEntity {
  comment: string;
  publicationDate: Date;
  rating: number;
  author: mongoose.Types.ObjectId;
  offer: mongoose.Types.ObjectId;
}

export type CommentDocument = HydratedDocument<CommentEntity>;

const commentSchema = new Schema<CommentEntity>({
  comment: { type: String },
  publicationDate: { type: Date },
  rating: { type: Number },
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  offer: { type: Schema.Types.ObjectId, ref: 'Offer' },
}, { timestamps: true, collection: 'comments' });

export const CommentModel = models.Comment as Model<CommentEntity> | undefined
  ?? model<CommentEntity>('Comment', commentSchema);
