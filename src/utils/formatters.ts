/**
 * Formatting utility functions
 */
import { calcioDInizioItaliano } from './oraItaliana';

/**
 * Format kickoff time to Italian format: "gio, 24/10, 20:45".
 *
 * Sempre in ora italiana: l'orario di una partita di Serie A non dipende da
 * dove si trova il telefono. Il calcolo sta in `oraItaliana.ts`, dove è
 * coperto da test — prima qui si usava `getHours()`, cioè il fuso del
 * dispositivo, e `dateRange` usava invece l'UTC: due schermate della stessa
 * app potevano mostrare giorni diversi per la stessa partita.
 */
export const formatKickoffTime = (isoDate: string): string =>
  calcioDInizioItaliano(new Date(isoDate)) ?? isoDate;

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
