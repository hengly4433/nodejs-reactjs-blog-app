// src/models/Post.ts
import mongoose, { Document, Model, Schema } from 'mongoose';
import { IUser } from './User';
import { ICategory } from './Category';

export interface IPost extends Document {
  title: string;
  slug: string;
  content: string;
  author: IUser['_id'];              // reference to User
  categories: ICategory['_id'][];     // references to Category
  imageUrl?: string;                  // URL or relative path of the uploaded image
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
      },
    ],
    imageUrl: {
      type: String,
      required: false,
      trim: true,
    },
  },
  { timestamps: true }
);

const Post: Model<IPost> = mongoose.model<IPost>('Post', postSchema);
export default Post;
