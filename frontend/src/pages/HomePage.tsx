import React, { useEffect, useState } from 'react';
import { Container, Typography, Pagination, Box } from '@mui/material';
import postService from '@/services/postService';
import PostCard from '@/components/PostCard';
import { PaginatedPosts, Post } from '@/types';

const HomePage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchPosts = async (p: number) => {
    setLoading(true);
    try {
      const data: PaginatedPosts = await postService.getPosts(p, limit);
      setPosts(data.data);
      setTotal(data.total);
      setPage(data.page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePageChange = (_e: any, value: number) => {
    fetchPosts(value);
  };

  return (
    <Container sx={{ marginTop: 4 }}>
      <Typography variant="h4" gutterBottom>
        Latest Posts
      </Typography>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', marginY: 4 }}>
        <Pagination
          count={Math.ceil(total / limit)}
          page={page}
          onChange={handlePageChange}
        />
      </Box>
    </Container>
  );
};

export default HomePage;
