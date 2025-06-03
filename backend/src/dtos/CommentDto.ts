
/**
 * Data required to create a Comment
 */
export interface CreateCommentDto {
  content: string;
}

/**
 * Data permitted in updating a Comment (only content)
 */
export interface UpdateCommentDto {
  content: string;
}
