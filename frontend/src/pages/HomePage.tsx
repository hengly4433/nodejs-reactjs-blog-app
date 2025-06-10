import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Pagination,
  CircularProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid'; // <--- use this for v7
import postService from '@/services/postService';
import PostCard from '@/components/PostCard';
import { PaginatedPosts, Post } from '@/types';

const HomePage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(9);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const fetchPosts = async (p: number) => {
    setLoading(true);
    setError('');
    try {
      const data: PaginatedPosts = await postService.getPosts(p, limit);
      setPosts(data.data);
      setTotal(data.total);
      setPage(data.page);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1);
  }, []);

  const handlePageChange = (_e: React.ChangeEvent<unknown>, value: number) => {
    fetchPosts(value);
  };

  return (
    <Container sx={{ marginTop: 4, marginBottom: 4 }}>
      <Typography variant="h4" gutterBottom>
        Latest Posts
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ mt: 4, textAlign: 'center' }}>
          {error}
        </Typography>
      ) : posts.length === 0 ? (
        <Typography sx={{ mt: 4, textAlign: 'center' }}>
          No posts to display.
        </Typography>
      ) : (
        <>
          <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
            {posts.map((post) => (
              <Grid key={post.id} size={{ xs: 2, sm: 4, md: 4 }}>
                <PostCard post={post} />
              </Grid>
            ))}
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={Math.ceil(total / limit)}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}
    </Container>
  );
};

export default HomePage;
