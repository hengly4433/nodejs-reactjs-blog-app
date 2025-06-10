// src/services/likeService.ts

import api from './api';
import { Like } from '@/types';

// Returns: { liked: boolean }
const likeService = {
  likePost: async (postId: string) => {
    const res = await api.post<{ success: boolean; like: Like }>(`/posts/${postId}/like`);
    return res.data.like;
  },

  unlikePost: async (postId: string) => {
    await api.delete(`/posts/${postId}/unlike`);
  },

  // getLikeCount: async (postId: string) => {
  //   const res = await api.get<{ success: boolean; total: number }>(`/posts/${postId}/likes`);
  //   return res.data.total;
  // },

   getLikeCount: async (postId: string) => {
    const res = await api.get<{ success: boolean; message: string; data: { total: number } }>(`/posts/${postId}/likes`);
    // console.log(postId);
    // console.log(res);
    return res.data.data && typeof res.data.data.total === "number" ? res.data.data.total : 0;
  },

  // New: check if this user has liked
  hasUserLiked: async (postId: string) => {
    const res = await api.get<{ success: boolean; data: { liked: boolean }; liked: boolean }>(`/posts/${postId}/liked`);
    // console.log(postId);
    // console.log(res);
    return res.data.data.liked && typeof res.data.data.liked === "number" ? res.data.data.liked : false;
  }
};

export default likeService;
