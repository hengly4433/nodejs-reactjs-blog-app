/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import postService from '@/services/postService';
import api from '@/services/api';
import { Category, Post } from '@/types';
import {AuthContext} from '@/contexts/AuthContext';

const EditPostPage: React.FC = () => {
  const auth = useContext(AuthContext)!;
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const res = await api.get<{ data: Category[] }>('/categories');
        setCategories(res.data.data as Category[]);
      } catch (err) {
        console.error(err);
      }
    };

    // Fetch post data
    const fetchPost = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const fetched: Post = await postService.getPostById(id);
        setPost(fetched);
        setTitle(fetched.title);
        setSlug(fetched.slug);
        setContent(fetched.content);
        setSelectedCategories(fetched.categories.map((c) => c.id));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
    fetchPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCategoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    setSelectedCategories((prev) =>
      checked ? [...prev, value] : prev.filter((c) => c !== value)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await postService.updatePost(id, {
        title,
        slug,
        content,
        categories: selectedCategories,
      });
      navigate(`/posts/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error updating post');
    }
  };

  if (loading || !post) {
    return (
      <Container sx={{ marginTop: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  const canModify = post.author.id === auth.user?.id;
  if (!canModify) {
    return (
      <Container sx={{ marginTop: 4 }}>
        <Typography>You are not authorized to edit this post.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ marginTop: 4 }}>
      <Typography variant="h4" gutterBottom>
        Edit Post
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit} sx={{ marginTop: 2 }}>
        <TextField
          label="Title"
          fullWidth
          required
          margin="normal"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          label="Slug"
          fullWidth
          required
          margin="normal"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
        <TextField
          label="Content"
          fullWidth
          required
          multiline
          minRows={6}
          margin="normal"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <Box sx={{ marginTop: 2 }}>
          <FormLabel component="legend">Categories</FormLabel>
          <FormGroup row>
            {categories.map((cat) => (
              <FormControlLabel
                key={cat.id}
                control={
                  <Checkbox
                    value={cat.id}
                    onChange={handleCategoryChange}
                    checked={selectedCategories.includes(cat.id)}
                  />
                }
                label={cat.name}
              />
            ))}
          </FormGroup>
        </Box>

        <Button type="submit" variant="contained" sx={{ marginTop: 2 }}>
          Update Post
        </Button>
      </Box>
    </Container>
  );
};

export default EditPostPage;
