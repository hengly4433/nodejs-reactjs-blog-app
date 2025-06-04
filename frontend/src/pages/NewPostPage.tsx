// src/pages/NewPostPage.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  FormHelperText,
  FormLabel,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import api from '@/services/api';
import postService from '@/services/postService';
import { Category } from '@/types';

// TipTap imports
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';

interface IApiCategoryList {
  data: Category[];
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const NewPostPage: React.FC = () => {
  const auth = useContext(AuthContext)!; // must provide { user: { id: string } }
  const navigate = useNavigate();

  // ── Form state ───────────────────────────────────────────────────────────────
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [categoryError, setCategoryError] = useState<string>('');

  // ── TipTap editor setup ──────────────────────────────────────────────────────
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'tiptap-link' } }),
      Image.configure({ inline: true, allowBase64: true }),
    ],
    content: '<p></p>',
  });

  // ── Fetch categories on mount ─────────────────────────────────────────────────
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get<IApiCategoryList>('/categories');
        setCategories(res.data.data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // ── Handle category selection change ───────────────────────────────────────────
  // We coerce a single string into a string[] if necessary
  const handleCategorySelect = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value;
    let asArray: string[];

    if (typeof value === 'string') {
      // If MUI delivered a single string (it shouldn't in `multiple` mode, but just in case),
      // split on commas or wrap it in an array
      asArray = value.split(',').map((v) => v.trim()).filter((v) => v.length > 0);
    } else if (Array.isArray(value)) {
      // Normal path: value is already string[]
      asArray = value as string[];
    } else {
      asArray = [];
    }

    console.log('handleCategorySelect →', asArray);
    setSelectedCategories(asArray);

    if (asArray.length === 0) {
      setCategoryError('At least one category must be selected');
    } else {
      setCategoryError('');
    }
  };

  // ── Handle image file selection ───────────────────────────────────────────────
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    } else {
      setImageFile(null);
    }
  };

  // ── TipTap: toggle bold/ italic ──────────────────────────────────────────────
  const toggleBold = () => {
    if (editor) editor.chain().focus().toggleBold().run();
  };
  const toggleItalic = () => {
    if (editor) editor.chain().focus().toggleItalic().run();
  };

  // ── Form submission ──────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCategoryError('');

    if (!editor) {
      setError('Editor is not ready.');
      return;
    }

    const htmlContent = editor.getHTML().trim();

    // Basic validation
    if (!title.trim() || !slug.trim() || htmlContent === '<p></p>') {
      setError('Title, Slug, and Content are required.');
      return;
    }
    if (selectedCategories.length === 0) {
      setCategoryError('At least one category must be selected');
      return;
    }

    // ── Build FormData ─────────────────────────────────────────────────────────
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('slug', slug.trim());
    formData.append('content', htmlContent);
    formData.append('authorId', auth.user!.id);

    // Append each category separately
    selectedCategories.forEach((catId) => {
      console.log('Appending category →', catId);
      formData.append('categories', catId);
    });

    if (imageFile) {
      formData.append('image', imageFile);
    }

    // OPTIONAL: inspect entries to verify nothing is missing.
    for (const [key, value] of formData.entries()) {
      console.log('FormData entry:', key, value);
    }

    try {
      await postService.createPost(formData);
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
        Create New Post
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        {/* ── Title ─────────────────────────────────────────────────────────────── */}
        <TextField
          label="Title"
          fullWidth
          required
          margin="normal"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* ── Slug ───────────────────────────────────────────────────────────────── */}
        <TextField
          label="Slug"
          fullWidth
          required
          margin="normal"
          helperText="e.g. my-first-blog-post (lowercase, no spaces)"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />

        {/* ── TipTap Content Editor ─────────────────────────────────────────────── */}
        <Box sx={{ mt: 2, mb: 1 }}>
          <FormControl fullWidth>
            <FormLabel>Content (bold/italic supported)</FormLabel>
            <Box sx={{ mb: 1 }}>
              <Tooltip title="Bold">
                <IconButton
                  size="small"
                  onClick={toggleBold}
                  color={editor?.isActive('bold') ? 'primary' : 'default'}
                >
                  <FormatBoldIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Italic">
                <IconButton
                  size="small"
                  onClick={toggleItalic}
                  color={editor?.isActive('italic') ? 'primary' : 'default'}
                  sx={{ ml: 1 }}
                >
                  <FormatItalicIcon />
                </IconButton>
              </Tooltip>
            </Box>

            <EditorContent
              editor={editor}
              style={{
                border: '1px solid rgba(0,0,0,0.23)',
                borderRadius: 4,
                minHeight: '200px',
                padding: '8px',
                marginBottom: '24px',
              }}
            />
          </FormControl>
        </Box>

        {/* ── Categories as a multi‐select dropdown ─────────────────────────────── */}
        <Box sx={{ mt: 2, mb: 2 }}>
          <FormControl fullWidth error={Boolean(categoryError)}>
            <InputLabel id="categories-label">Categories *</InputLabel>
            <Select
              labelId="categories-label"
              id="categories-select"
              multiple
              value={selectedCategories}
              onChange={handleCategorySelect}
              input={<OutlinedInput label="Categories *" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((catId) => {
                    const cat = categories.find((c) => c.id === catId);
                    return <Chip key={catId} label={cat?.name || catId} />;
                  })}
                </Box>
              )}
              MenuProps={MenuProps}
            >
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
            {categoryError && <FormHelperText>{categoryError}</FormHelperText>}
          </FormControl>
        </Box>

        {/* ── Image Upload ──────────────────────────────────────────────────────── */}
        <Box sx={{ mt: 4, mb: 4 }}>
          <FormControl fullWidth>
            <FormLabel>Cover Image (JPEG/PNG, optional)</FormLabel>
            <label htmlFor="image-upload">
              <input
                style={{ display: 'none' }}
                id="image-upload"
                name="image"
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleImageChange}
              />
              <Button variant="outlined" component="span">
                {imageFile ? 'Change Image' : 'Choose Image'}
              </Button>
              {imageFile && (
                <Typography variant="body2" sx={{ display: 'inline', ml: 2 }}>
                  {imageFile.name}
                </Typography>
              )}
            </label>
          </FormControl>
        </Box>

        {/* ── Submit Button ─────────────────────────────────────────────────────── */}
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }}>
          Create Post
        </Button>
      </Box>
    </Container>
  );
};

export default NewPostPage;
