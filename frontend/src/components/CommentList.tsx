import React from 'react';
import { Box, Typography, IconButton, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Comment } from '@/types';

interface CommentListProps {
  comments: Comment[];
  onEdit?: (id: string, content: string) => void;
  onDelete?: (id: string) => void;
  canModify?: (commentAuthorId: string) => boolean;
}

const CommentList: React.FC<CommentListProps> = ({
  comments,
  onEdit,
  onDelete,
  canModify,
}) => {
  return (
    <Box>
      {comments.map((comment) => (
        <Box key={comment.id} sx={{ marginBottom: 2 }}>
          <Typography variant="subtitle2">
            {comment.author.username} • {new Date(comment.createdAt).toLocaleString()}
          </Typography>
          <Typography variant="body1">{comment.content}</Typography>
          {canModify && canModify(comment.author.id) && (
            <Box sx={{ textAlign: 'right' }}>
              <IconButton size="small" onClick={() => onEdit && onEdit(comment.id, comment.content)}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => onDelete && onDelete(comment.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
          <Divider sx={{ marginY: 1 }} />
        </Box>
      ))}
    </Box>
  );
};

export default CommentList;
