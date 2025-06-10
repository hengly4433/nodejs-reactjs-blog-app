// src/pages/EditPostPage.tsx

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
  CircularProgress,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import api from '@/services/api';
import postService from '@/services/postService';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import { Category, Post } from '@/types';

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

const EditPostPage: React.FC = () => {
  const auth = useContext(AuthContext)!;
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // ── Local state ────────────────────────────────────────────────────────────
  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string>();
  const [error, setError] = useState<string>('');
  const [categoryError, setCategoryError] = useState<string>('');
  const [loading, setLoading] = useState(true);

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

  // ── Auto-slugify whenever the title changes ────────────────────────────────
  useEffect(() => {
    const slugify = (text: string) =>
      text
        .toLowerCase()
        .trim()
        .replace(/[&/\\#,+()$~%.'":*?<>{}]/g, '')
        .replace(/\s+/g, '-');
    setSlug(slugify(title));
  }, [title]);

  // ── Fetch both categories and the post to edit ────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1) categories
        const catRes = await api.get<{ data: Category[] }>('/categories');
        setCategories(catRes.data.data);

        // 2) the post itself
        if (id) {
          const fetched = await postService.getPostById(id);
          setPost(fetched);
          setTitle(fetched.title);
          setSlug(fetched.slug);
          setSelectedCategories(fetched.categories.map((c) => c.id));
          setExistingImageUrl(fetched.imageUrl);

          // load HTML into TipTap
          if (editor) {
            editor.commands.setContent(fetched.content);
          }
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load post or categories.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, editor]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCategorySelect = (e: SelectChangeEvent<string[]>) => {
    const value = e.target.value;
    const arr =
      typeof value === 'string'
        ? value.split(',').map((v) => v.trim()).filter((v) => v)
        : Array.isArray(value)
        ? value
        : [];
    setSelectedCategories(arr);
    setCategoryError(arr.length === 0 ? 'At least one category must be selected' : '');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  const toggleBold = () => editor?.chain().focus().toggleBold().run();
  const toggleItalic = () => editor?.chain().focus().toggleItalic().run();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCategoryError('');

    if (!editor) {
      setError('Editor is not ready.');
      return;
    }

    const htmlContent = editor.getHTML().trim();
    if (!title.trim() || !slug.trim() || htmlContent === '<p></p>') {
      setError('Title, Slug, and Content are required.');
      return;
    }
    if (selectedCategories.length === 0) {
      setCategoryError('At least one category must be selected');
      return;
    }
    if (!id) return;

    try {
      // Build FormData (to allow image upload)
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('slug', slug.trim());
      formData.append('content', htmlContent);
      selectedCategories.forEach((c) => formData.append('categories', c));
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await postService.updatePost(id, formData);
      navigate(`/posts/${id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Error updating post.');
    }
  };

  // ── Loading / Auth guard ─────────────────────────────────────────────────
  if (loading || !editor) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  const canModify = post?.author.id === auth.user?.id;
  if (!canModify) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography>You are not authorized to edit this post.</Typography>
      </Container>
    );
  }

  // ── Render form ───────────────────────────────────────────────────────────
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Edit Post
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

        {/* Slug */}
        <TextField
          label="Slug"
          fullWidth
          margin="normal"
          helperText="Automatically generated from title"
          value={slug}
          disabled
        />

        {/* Content Editor */}
        <Box sx={{ mt: 2, mb: 1 }}>
          <FormControl fullWidth>
            <FormLabel>Content (bold/italic supported)</FormLabel>
            <Box sx={{ mb: 1 }}>
              <Tooltip title="Bold">
                <IconButton
                  size="small"
                  onClick={toggleBold}
                  color={editor.isActive('bold') ? 'primary' : 'default'}
                >
                  <FormatBoldIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Italic">
                <IconButton
                  size="small"
                  onClick={toggleItalic}
                  color={editor.isActive('italic') ? 'primary' : 'default'}
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

        {/* Categories Multi-Select */}
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

        {/* Image Preview / Upload */}
        <Box sx={{ mt: 4, mb: 4 }}>
          <FormControl fullWidth>
            <FormLabel>Cover Image (optional)</FormLabel>
            <Box>
              {existingImageUrl && !imageFile && (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2">Current Image:</Typography>
                  <img
                    src={existingImageUrl}
                    alt="Current cover"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </Box>
              )}
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
            </Box>
          </FormControl>
        </Box>

        {/* Submit */}
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }}>
          Update Post
        </Button>
      </Box>
    </Container>
  );
};

export default EditPostPage;
