// src/components/LikeButton.tsx

import React, { useState, useEffect, useContext } from 'react';
import { IconButton, Typography, Box, Snackbar, Alert } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { AuthContext } from '@/contexts/AuthContext';
import likeService from '@/services/likeService';

interface LikeButtonProps {
  postId: string;
}

const LikeButton: React.FC<LikeButtonProps> = ({ postId }) => {
  const auth = useContext(AuthContext)!;
  console.log(auth);
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);

  // Snackbar state for alerts
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  // Fetch count and like status on mount or postId/user change
  useEffect(() => {
  const fetchLikeData = async () => {
    if (!auth.user) {
      setLiked(false);
      setCount(0);
      return;
    }
    const [countResult, likedResult] = await Promise.all([
      likeService.getLikeCount(postId),
      auth.user ? likeService.hasUserLiked(postId) : Promise.resolve(false)
    ]);

    setCount(typeof countResult === 'number' ? countResult : 0);
    setLiked(likedResult === true);
  };
  fetchLikeData();
}, [postId, auth.user]);


  // Handle like/unlike logic
  const handleLike = async () => {
    if (!auth.user) {
      setSnackbarMsg('You need to log in to like posts.');
      setOpenSnackbar(true);
      return;
    }

    try {
      if (liked) {
        await likeService.unlikePost(postId);
        setCount((c) => Math.max(0, c - 1));
        setLiked(false);
      } else {
        await likeService.likePost(postId);
        setCount((c) => c + 1);
        setLiked(true);
      }
    } catch (err: any) {
      // Backend returns {success: false, message: "Already liked"}
      if (err?.response?.data?.message === 'Already liked') {
        setSnackbarMsg('You have already liked this post.');
        setLiked(true);
      } else if (err?.response?.data?.message) {
        setSnackbarMsg(err.response.data.message);
      } else {
        setSnackbarMsg('An error occurred. Please try again.');
      }
      setOpenSnackbar(true);
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', marginY: 1 }}>
        <IconButton
          onClick={handleLike}
          disabled={!auth.user}
          aria-label={liked ? "Unlike" : "Like"}
        >
          {liked ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
        </IconButton>
        <Typography>{count}</Typography>
      </Box>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="warning" onClose={() => setOpenSnackbar(false)} sx={{ width: '100%' }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </>
  );
};

export default LikeButton;
