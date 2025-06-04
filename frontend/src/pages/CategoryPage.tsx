/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Pagination,
  Box,
  CircularProgress,
} from '@mui/material';
import postService from '@/services/postService';
import PostCard from '@/components/PostCard';
import { PaginatedPosts, Post } from '@/types';

const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchPostsByCategory = async (p: number) => {
    if (!slug) return;
    setLoading(true);
    try {
      const data: PaginatedPosts = await postService.getPostsByCategory(slug, p, limit);
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
    fetchPostsByCategory(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const handlePageChange = (_e: any, value: number) => {
    fetchPostsByCategory(value);
  };

  return (
    <Container sx={{ marginTop: 4 }}>
      <Typography variant="h4" gutterBottom>
        Category: {slug}
      </Typography>

      {loading ? (
        <Box sx={{ textAlign: 'center', marginY: 4 }}>
          <CircularProgress />
        </Box>
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

export default CategoryPage;
