import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Avatar,
  Box,
  Button,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { Post } from '@/types';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const fullImageUrl = post.imageUrl ? `${API_BASE_URL}${post.imageUrl}` : undefined;
  const htmlSnippet =
    post.content.length > 100 ? post.content.slice(0, 100) + '…' : post.content;

  // First character of username for Avatar
  const authorInitial = post.author.username ? post.author.username[0] : '';

  // Use only the first category for chip (as in your image)
  const mainCategory = post.categories[0];

  // Optional: set a color per category
  const categoryColorMap: Record<string, 'primary' | 'warning' | 'error' | 'default'> = {
    Technology: 'primary',
    Food: 'warning',
    Automobile: 'error',
    // Extend as needed
  };
  const chipColor = mainCategory
    ? categoryColorMap[mainCategory.name] || 'default'
    : 'default';

  // Format date for "2h ago", "Yesterday", etc. (simple example)
  function formatRelativeDate(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  return (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: 3,
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: 6,
        },
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: 'background.paper'
      }}
    >
      {fullImageUrl && (
        <CardMedia
          component="img"
          height="180"
          image={fullImageUrl}
          alt={post.title}
          sx={{
            objectFit: 'cover',
          }}
        />
      )}

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
        {/* Category chip at top */}
        {mainCategory && (
          <Chip
            label={mainCategory.name}
            color={chipColor}
            size="small"
            sx={{ fontWeight: 600, mb: 2 }}
          />
        )}
        {/* Title */}
        <Typography
          variant="h6"
          component={Link}
          to={`/posts/${post.id}`}
          sx={{
            textDecoration: 'none',
            color: 'text.primary',
            fontWeight: 700,
            mb: 1,
            fontSize: '1.25rem',
            lineHeight: 1.2,
            display: 'block'
          }}
        >
          {post.title}
        </Typography>
        {/* Excerpt */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            minHeight: 60,
          }}
        >
          <span
            dangerouslySetInnerHTML={{
              __html: htmlSnippet,
            }}
          />
        </Typography>

        {/* Read More Button */}
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to={`/posts/${post.id}`}
            size="small"
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Read More
          </Button>
        </Box>

        {/* Spacer to push footer down */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Footer: Author and date */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mt: 2,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
              {authorInitial}
            </Avatar>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {post.author.username}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {formatRelativeDate(post.createdAt)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PostCard;
