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

/**
 * Get local team logo from backend path
 * @param logoPath - Backend logo path (e.g., "/teams/PisaLogo.png")
 * @returns Local require() result or null if not found
 */
export const getTeamLogo = (logoPath: string | null): any => {
  if (!logoPath) return null;

  // Return the local asset if we have it
  return teamLogos[logoPath] || null;
};

/**
 * Check if a logo exists in our local assets
 */
export const hasTeamLogo = (logoPath: string | null): boolean => {
  if (!logoPath) return false;
  return logoPath in teamLogos;
};

export default getTeamLogo;
