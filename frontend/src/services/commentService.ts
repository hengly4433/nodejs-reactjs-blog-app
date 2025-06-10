// src/services/commentService.ts
import api from './api';
import { Comment } from '@/types';

const commentService = {
  getCommentsByPost: async (postId: string): Promise<Comment[]> => {
    const res = await api.get<{ success: boolean; data: Comment[] }>(
      `/posts/${postId}/comments`
    );
    return res.data.data;
  },

  createComment: async (postId: string, content: string): Promise<Comment> => {
    const res = await api.post<{ success: boolean; data: Comment }>(
      `/posts/${postId}/comments`,
      { content }
    );
    return res.data.data;
  },

  updateComment: async (
    commentId: string,
    content: string
  ): Promise<Comment> => {
    const res = await api.put<{ success: boolean; data: Comment }>(
      `/comments/${commentId}`,
      { content }
    );
    return res.data.data;
  },

  deleteComment: async (commentId: string): Promise<void> => {
    await api.delete(`/comments/${commentId}`);
  },
};

export default commentService;
