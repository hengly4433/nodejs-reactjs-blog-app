import mongoose, { Document, Model, Schema, Types } from 'mongoose';

// 1) A “Like” document: ties a user to a post, with a timestamp.
export interface ILike extends Document {
  user: Types.ObjectId;     // who liked
  post: Types.ObjectId;     // which post they liked
  createdAt: Date;
}

const likeSchema = new Schema<ILike>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Prevent the same user from liking the same post twice:
likeSchema.index({ user: 1, post: 1 }, { unique: true });

const Like: Model<ILike> = mongoose.model<ILike>('Like', likeSchema);
export default Like;
