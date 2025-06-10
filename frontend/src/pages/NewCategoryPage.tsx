// src/pages/NewPostPage.tsx

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import categoryService from '@/services/categoryService';


// Our typed Category (must have `id`—not `_id`)
export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

const NewCategoryPage: React.FC = () => {
  const navigate = useNavigate();

  // ── Form state ─────────────────────────────────────────────────────────────
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState<string>('');

  // ── Auto-slugify on title change ────────────────────────────────────────────
  useEffect(() => {
    const slugify = (text: string) =>
      text
        .toLowerCase()
        .trim()
        // remove special chars
        .replace(/[&/\\#,+()$~%.'":*?<>{}]/g, '')
        // collapse spaces and replace with hyphens
        .replace(/\s+/g, '-');

    setSlug(slugify(name));
  }, [name]);



  // ── Form submission ───────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation:
    if (!name.trim() || !slug.trim()) {
      setError('Name, Slug are required.');
      return;
    }

    // Build FormData
    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('slug', slug.trim());

    try {
      await categoryService.createCategory(formData);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Error creating post.';
      setError(msg);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Create New Category
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        {/* Name */}
        <TextField
          label="Name"
          fullWidth
          required
          margin="normal"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* Slug (auto-generated) */}
        <TextField
          label="Slug"
          fullWidth
          margin="normal"
          helperText="Automatically generated from name"
          value={slug}
          disabled
        />

        {/* Submit */}
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }}>
          Create Category
        </Button>
      </Box>
    </Container>
  );
};

export default NewCategoryPage;
