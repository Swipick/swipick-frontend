/**
 * Formatting utility functions
 */

/**
 * Format kickoff time to Italian format: "gio, 24/10, 20:45"
 */
export const formatKickoffTime = (isoDate: string): string => {
  try {
    const date = new Date(isoDate);

    // Get day of week (short, Italian)
    const dayOfWeek = date.toLocaleDateString('it-IT', { weekday: 'short' });

    // Get date parts
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');

    // Get time
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${dayOfWeek}, ${day}/${month}, ${hours}:${minutes}`;
  } catch (error) {
    console.error('[Formatters] Error formatting kickoff time:', error);
    return isoDate;
  }
};

/**
 * Format win rate as percentage
 */
export const formatWinRate = (winRate?: number): string => {
  if (winRate === undefined || winRate === null) return '-';
  return `${Math.round(winRate)}%`;
};

/**
 * Get team logo fallback (first letter of team name)
 */
export const getTeamLogoFallback = (teamName: string): string => {
  return teamName.charAt(0).toUpperCase();
};

/**
 * Format last 5 results for display
 * Maps result codes to display format
 */
export const formatLastResult = (result: string): { text: string; color: string } => {
  const upperResult = result.toUpperCase();

  switch (upperResult) {
    case 'W':
    case '1':
      return { text: 'W', color: '#10b981' }; // Green
    case 'D':
    case 'X':
      return { text: 'D', color: '#9ca3af' }; // Gray
    case 'L':
    case '2':
      return { text: 'L', color: '#ef4444' }; // Red
    default:
      return { text: '-', color: '#9ca3af' };
  }
};
