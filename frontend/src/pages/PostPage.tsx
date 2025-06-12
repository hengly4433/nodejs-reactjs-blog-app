// src/pages/PostPage.tsx
import React, { useEffect, useState, useContext } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
} from '@mui/material';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import postService from '@/services/postService';
import commentService from '@/services/commentService';
import { Post, Comment } from '@/types';
import CommentList from '@/components/CommentList';
import CommentForm from '@/components/CommentForm';
import LikeButton from '@/components/LikeButton';
import DOMPurify from 'dompurify';

const PostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const auth = useContext(AuthContext)!;
  const navigate = useNavigate();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [editingComment, setEditingComment] = useState<
    null | { id: string; content: string }
  >(null);
  const [loading, setLoading] = useState(false);

  const fetchPost = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const fetched = await postService.getPostById(id);
      setPost(fetched);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    if (!id) return;
    try {
      const fetched = await commentService.getCommentsByPost(id);
      setComments(fetched);
    } catch (err) {
      console.error(err);
      setComments([]);
    }
  };

  useEffect(() => {
    fetchPost();
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDeletePost = async () => {
    if (!id) return;
    try {
      await postService.deletePost(id);
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  const canModifyPost = post?.author.id === auth.user?.id;

  const handleAddComment = async (content: string) => {
    if (!id) return;
    try {
      await commentService.createComment(id, content);
      await fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditComment = (commentId: string, currentContent: string) => {
    setEditingComment({ id: commentId, content: currentContent });
  };

  const handleUpdateComment = async (content: string) => {
    if (!editingComment) return;
    try {
      await commentService.updateComment(editingComment.id, content);
      setEditingComment(null);
      await fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentService.deleteComment(commentId);
      await fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  const canModifyComment = (authorId: string) => authorId === auth.user?.id;

  if (loading || !post) {
    return (
      <Container sx={{ marginTop: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

   // Sanitize once per render
  const cleanContent = DOMPurify.sanitize(post.content ?? '');

  return (
    <Container sx={{ marginTop: 4 }}>
      <Typography variant="h3" gutterBottom>
        {post.title}
      </Typography>
      <Typography
        variant="subtitle1"
        color="text.secondary"
        gutterBottom
      >
        By {post.author.username} •{' '}
        {new Date(post.createdAt).toLocaleDateString()}
      </Typography>

      <Box sx={{ marginY: 2 }}>
        {post.categories.map((cat) => (
          <Button
            key={cat.id}
            variant="outlined"
            component={Link}
            to={`/categories/${cat.slug}`}
            sx={{ mr: 1, mb: 1 }}
          >
            {cat.name}
          </Button>
        ))}
      </Box>

      <Typography
        component="div"
        variant="body1"
        sx={{ mb: 2 }}
        dangerouslySetInnerHTML={{ __html: cleanContent }}
      />

      <LikeButton postId={post.id} />

      {canModifyPost && (
        <Box sx={{ my: 2 }}>
          <Button
            variant="outlined"
            component={Link}
            to={`/posts/${post.id}/edit`}
            sx={{ mr: 1 }}
          >
            Edit Post
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeletePost}
          >
            Delete Post
          </Button>
        </Box>
      )}

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Comments
        </Typography>

        {editingComment ? (
          <CommentForm
            initialContent={editingComment.content}
            onSubmit={handleUpdateComment}
            onCancel={() => setEditingComment(null)}
          />
        ) : auth.user ? (
          <CommentForm onSubmit={handleAddComment} />
        ) : (
          <Typography variant="body2">
            <Link to="/login">Log in</Link> to post a comment.
          </Typography>
        )}

        <CommentList
          comments={comments}
          onEdit={handleEditComment}
          onDelete={handleDeleteComment}
          canModify={canModifyComment}
        />
      </Box>
    </Container>
  );
};

export default PostPage;
