import api from './api';
import { Comment } from '@/types';

const commentService = {
  getCommentsByPost: async (postId: string) => {
    const res = await api.get<Comment[]>(`/posts/${postId}/comments`);
    return res.data;
  },

  createComment: async (postId: string, content: string) => {
    const res = await api.post<Comment>(`/posts/${postId}/comments`, { content });
    return res.data;
  },

  updateComment: async (commentId: string, content: string) => {
    const res = await api.put<Comment>(`/comments/${commentId}`, { content });
    return res.data;
  },

  deleteComment: async (commentId: string) => {
    await api.delete(`/comments/${commentId}`);
  },
};

export default commentService;
