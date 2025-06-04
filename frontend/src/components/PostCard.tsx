import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Stack,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { Post } from '@/types';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    <Card sx={{ marginBottom: 2 }}>
      <CardContent>
        <Typography variant="h5" component={Link} to={`/posts/${post.id}`} sx={{ textDecoration: 'none' }}>
          {post.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          By {post.author.username} • {new Date(post.createdAt).toLocaleDateString()}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ marginTop: 1 }}>
          {post.categories.map((cat) => (
            <Chip
              key={cat.id}
              label={cat.name}
              component={Link}
              to={`/categories/${cat.slug}`}
              clickable
              size="small"
            />
          ))}
        </Stack>
        <Typography variant="body1" sx={{ marginTop: 1 }}>
          {post.content.length > 100 ? post.content.slice(0, 100) + '…' : post.content}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" component={Link} to={`/posts/${post.id}`}>
          Read More
        </Button>
      </CardActions>
    </Card>
  );
};

export default PostCard;
