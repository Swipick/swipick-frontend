/**
 * Logo Mapper
 * Maps backend logo paths to local asset requires
 */

// Import all team logos
const teamLogos: Record<string, any> = {
  '/teams/AcfFiorentinaLogo.png': require('../assets/teams/AcfFiorentinaLogo.png'),
  '/teams/AcMilanLogo.png': require('../assets/teams/AcMilanLogo.png'),
  '/teams/AcMonzaLogo.png': require('../assets/teams/AcMonzaLogo.png'),
  '/teams/AsRomaLogo.png': require('../assets/teams/AsRomaLogo.png'),
  '/teams/AtalantaBcLogo.png': require('../assets/teams/AtalantaBcLogo.png'),
  '/teams/CagliariCalcioLogo.png': require('../assets/teams/CagliariCalcioLogo.png'),
  '/teams/ComoLogo.png': require('../assets/teams/ComoCalcioLogo.png'),
  '/teams/ComoCalcioLogo.png': require('../assets/teams/ComoCalcioLogo.png'),
  '/teams/EmpolFcLogo.png': require('../assets/teams/EmpolFcLogo.png'),
  '/teams/FcInternazionaleMilano.png': require('../assets/teams/FcInternazionaleMilano.png'),
  '/teams/GenoaCfcLogo.png': require('../assets/teams/GenoaCfcLogo.png'),
  '/teams/HellasVeronaFcLogo.png': require('../assets/teams/HellasVeronaFcLogo.png'),
  '/teams/JuventusFcLogo.png': require('../assets/teams/JuventusFcLogo.png'),
  '/teams/LecceLogo.png': require('../assets/teams/LecceLogo.png'),
  '/teams/LogobolognaLogo.png': require('../assets/teams/LogobolognaLogo.png'),
  '/teams/NapolLogo.png': require('../assets/teams/NapolLogo.png'),
  '/teams/ParmaLogo.png': require('../assets/teams/ParmaLogo.png'),
  '/teams/PisaLogo.png': require('../assets/teams/PisaCalcioLogo.png'),
  '/teams/PisaCalcioLogo.png': require('../assets/teams/PisaCalcioLogo.png'),
  '/teams/SalernitanaCentenarioLogo.png': require('../assets/teams/SalernitanaCentenarioLogo.png'),
  '/teams/SassuoloLogo.png': require('../assets/teams/SassuoloLogo.png'),
  '/teams/ScFrosinoneLogo.png': require('../assets/teams/ScFrosinoneLogo.png'),
  '/teams/SpalstemmaLogo.png': require('../assets/teams/SpalstemmaLogo.png'),
  '/teams/StemmaLazioCentenarioLogo.png': require('../assets/teams/StemmaLazioCentenarioLogo.png'),
  '/teams/TorinoFcLogo.png': require('../assets/teams/TorinoFcLogo.png'),
  '/teams/UdineseLogo.png': require('../assets/teams/UdineseLogo.png'),
  '/teams/CremoneseLogo.png': require('../assets/teams/UsCremoneselogo.png'),
  '/teams/UsCremoneselogo.png': require('../assets/teams/UsCremoneselogo.png'),
};

// Team name to logo path mapping (fallback for when API returns null)
const teamNameToLogo: Record<string, string> = {
  'AC Milan': '/teams/AcMilanLogo.png',
  'Milan': '/teams/AcMilanLogo.png',
  'AS Roma': '/teams/AsRomaLogo.png',
  'Roma': '/teams/AsRomaLogo.png',
  'Inter': '/teams/FcInternazionaleMilano.png',
  'Juventus': '/teams/JuventusFcLogo.png',
  'Napoli': '/teams/NapolLogo.png',
  'Lazio': '/teams/StemmaLazioCentenarioLogo.png',
  'Atalanta': '/teams/AtalantaBcLogo.png',
  'Fiorentina': '/teams/AcfFiorentinaLogo.png',
  'Bologna': '/teams/LogobolognaLogo.png',
  'Torino': '/teams/TorinoFcLogo.png',
  'Udinese': '/teams/UdineseLogo.png',
  'Sassuolo': '/teams/SassuoloLogo.png',
  'Verona': '/teams/HellasVeronaFcLogo.png',
  'Genoa': '/teams/GenoaCfcLogo.png',
  'Cagliari': '/teams/CagliariCalcioLogo.png',
  'Lecce': '/teams/LecceLogo.png',
  'Monza': '/teams/AcMonzaLogo.png',
  'Empoli': '/teams/EmpolFcLogo.png',
  'Como': '/teams/ComoCalcioLogo.png',
  'Parma': '/teams/ParmaLogo.png',
  'Pisa': '/teams/PisaCalcioLogo.png',
  'Cremonese': '/teams/CremoneseLogo.png',
  'US Cremonese': '/teams/CremoneseLogo.png',
};

/**
 * Get local team logo from backend path or team name
 * @param logoPath - Backend logo path (e.g., "/teams/PisaLogo.png")
 * @param teamName - Team name as fallback (e.g., "AC Milan")
 * @returns Local require() result or null if not found
 */
export const getTeamLogo = (logoPath: string | null, teamName?: string): any => {
  // If we have a logo path, try to use it
  if (logoPath && teamLogos[logoPath]) {
    return teamLogos[logoPath];
  }

  // Fallback: try to find logo by team name
  if (teamName && teamNameToLogo[teamName]) {
    const fallbackPath = teamNameToLogo[teamName];
    return teamLogos[fallbackPath] || null;
  }

  return null;
};

/**
 * Check if a logo exists in our local assets
 */
export const hasTeamLogo = (logoPath: string | null): boolean => {
  if (!logoPath) return false;
  return logoPath in teamLogos;
};

export default getTeamLogo;
