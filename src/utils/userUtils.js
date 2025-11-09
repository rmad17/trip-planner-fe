/**
 * User utility functions
 */

// Predefined colors for profile avatars
const AVATAR_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#84cc16', // lime
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#ec4899', // pink
];

/**
 * Get user initials from name
 * @param {string} name - User's full name
 * @returns {string} User initials (max 2 characters)
 */
export const getUserInitials = (name) => {
  if (!name) return '?';

  const parts = name.trim().split(' ').filter(part => part.length > 0);

  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();

  // Take first letter of first and last name
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Generate a consistent color for a user based on their name
 * @param {string} name - User's name
 * @returns {string} Hex color code
 */
export const getUserColor = (name) => {
  if (!name) return AVATAR_COLORS[0];

  // Generate a hash from the name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Use hash to select color
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

/**
 * Get user display name
 * @param {Object} user - User object
 * @returns {string} Display name
 */
export const getUserDisplayName = (user) => {
  if (!user) return 'User';
  return user.name || user.username || user.email || 'User';
};
