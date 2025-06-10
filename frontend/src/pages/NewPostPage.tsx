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
import { SelectChangeEvent } from '@mui/material/Select';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import api from '@/services/api';
import postService from '@/services/postService';

// TipTap imports
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';

interface RawCategoryFromApi {
  _id: string;
  name: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

// Our typed Category (must have `id`—not `_id`)
export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

interface IApiCategoryList {
  data: RawCategoryFromApi[];
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
  const auth = useContext(AuthContext)!; // AuthContext provides { user }
  const navigate = useNavigate();

  // ── Form state ─────────────────────────────────────────────────────────────
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [categoryError, setCategoryError] = useState<string>('');

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

    setSlug(slugify(title));
  }, [title]);

  // ── TipTap editor setup ───────────────────────────────────────────────────
  const editor = useEditor({
    extensions: [
      StarterKit,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'tiptap-link' },
      }),
      ImageExtension.configure({ inline: true, allowBase64: true }),
    ],
    content: '<p></p>',
  });

  // ── Fetch categories on mount ─────────────────────────────────────────────
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get<IApiCategoryList>('/categories');
        const mapped: Category[] = res.data.data.map((rawCat) => ({
          id: rawCat._id,
          name: rawCat.name,
          slug: rawCat.slug,
          createdAt: rawCat.createdAt,
          updatedAt: rawCat.updatedAt,
        }));
        setCategories(mapped);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // ── Handle category selection change ───────────────────────────────────────
  const handleCategorySelect = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    let asArray: string[];
    if (typeof value === 'string') {
      asArray = value.split(',').map((v) => v.trim()).filter((v) => v);
    } else if (Array.isArray(value)) {
      asArray = value;
    } else {
      asArray = [];
    }
    setSelectedCategories(asArray);
    setCategoryError(asArray.length === 0 ? 'At least one category must be selected' : '');
  };

  // ── Handle image file selection ───────────────────────────────────────────
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    } else {
      setImageFile(null);
    }
  };

  // ── TipTap: toggle bold/italic ────────────────────────────────────────────
  const toggleBold = () => editor?.chain().focus().toggleBold().run();
  const toggleItalic = () => editor?.chain().focus().toggleItalic().run();

  // ── Form submission ───────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCategoryError('');

    if (!editor) {
      setError('Editor is not ready.');
      return;
    }

    const htmlContent = editor.getHTML().trim();

    // Basic validation:
    if (!title.trim() || !slug.trim() || htmlContent === '<p></p>') {
      setError('Title, Slug, and Content are required.');
      return;
    }
    if (selectedCategories.length === 0) {
      setCategoryError('At least one category must be selected');
      return;
    }

    // Build FormData
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('slug', slug.trim());
    formData.append('content', htmlContent);
    formData.append('authorId', auth.user!.id);

    selectedCategories.forEach((catId) => {
      formData.append('categories', catId);
    });

    if (imageFile) {
      formData.append('image', imageFile);
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
        {/* Title */}
        <TextField
          label="Title"
          fullWidth
          required
          margin="normal"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Slug (auto-generated) */}
        <TextField
          label="Slug"
          fullWidth
          margin="normal"
          helperText="Automatically generated from title"
          value={slug}
          disabled
        />

        {/* Content editor */}
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

        {/* Categories */}
        <Box sx={{ mt: 2, mb: 2 }}>
          <FormControl fullWidth error={Boolean(categoryError)}>
            <InputLabel id="categories-label">Categories *</InputLabel>
            <Select
              labelId="categories-label"
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

        {/* Image Upload */}
        <Box sx={{ mt: 4, mb: 4 }}>
          <FormControl fullWidth>
            <FormLabel>Cover Image (optional)</FormLabel>
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

        {/* Submit */}
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }}>
          Create Post
        </Button>
      </Box>
    </Container>
  );
};

export default NewPostPage;
