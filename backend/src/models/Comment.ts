import mongoose, { Document, Model, Schema, Types } from 'mongoose';

// 1) Extend Document to include comment fields
export interface IComment extends Document {
  content: string;
  author: Types.ObjectId;    // reference to User
  post: Types.ObjectId;      // reference to Post
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    content: { type: String, required: true, trim: true },
    author:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
    post:    { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

const Comment: Model<IComment> = mongoose.model<IComment>('Comment', commentSchema);
export default Comment;
