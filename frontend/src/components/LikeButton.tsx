import React, { useState, useEffect, useContext } from 'react';
import { IconButton, Typography, Box } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import {AuthContext} from '@/contexts/AuthContext';
import likeService from '@/services/likeService';

interface LikeButtonProps {
  postId: string;
}

const LikeButton: React.FC<LikeButtonProps> = ({ postId }) => {
  const auth = useContext(AuthContext)!;
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);

  // On mount, fetch like count
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const total = await likeService.getLikeCount(postId);
        setCount(total);
        // Ideally you’d also check if current user has liked. Backend endpoint not provided; skip for now
      } catch { /* handle errors if needed */ }
    };
    fetchCount();
  }, [postId]);

  const handleLike = async () => {
    if (!auth.user) return;
    try {
      if (liked) {
        await likeService.unlikePost(postId);
        setCount((c) => c - 1);
        setLiked(false);
      } else {
        await likeService.likePost(postId);
        setCount((c) => c + 1);
        setLiked(true);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', marginY: 1 }}>
      <IconButton onClick={handleLike} disabled={!auth.user}>
        {liked ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
      </IconButton>
      <Typography>{count}</Typography>
    </Box>
  );
};

export default LikeButton;
