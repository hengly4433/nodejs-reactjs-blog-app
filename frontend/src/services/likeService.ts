import api from './api';
import { Like } from '@/types';

const likeService = {
  likePost: async (postId: string) => {
    const res = await api.post<{ success: boolean; like: Like }>(`/posts/${postId}/like`);
    return res.data.like;
  },

  unlikePost: async (postId: string) => {
    await api.delete(`/posts/${postId}/unlike`);
  },

  getLikeCount: async (postId: string) => {
    const res = await api.get<{ success: boolean; total: number }>(`/posts/${postId}/likes`);
    return res.data.total;
  },
};

export default likeService;
