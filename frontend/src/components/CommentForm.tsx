import React, { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';

interface CommentFormProps {
  initialContent?: string;
  onSubmit: (content: string) => void;
  onCancel?: () => void;
}

const CommentForm: React.FC<CommentFormProps> = ({
  initialContent = '',
  onSubmit,
  onCancel,
}) => {
  const [content, setContent] = useState(initialContent);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content.trim());
      setContent('');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ marginY: 2 }}>
      <TextField
        label="Comment"
        fullWidth
        multiline
        minRows={2}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <Box sx={{ marginTop: 1, textAlign: 'right' }}>
        {onCancel && (
          <Button onClick={onCancel} sx={{ marginRight: 1 }}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="contained">
          {initialContent ? 'Update' : 'Post'}
        </Button>
      </Box>
    </Box>
  );
};

export default CommentForm;
