import React from 'react';
import { SvgXml } from 'react-native-svg';
import { pixelPlayerSvg, resolveTeamKey, Pose } from '../../utils/pixelPlayers';

interface PixelPlayerLogoProps {
  /** nome squadra come arriva dal backend (es. "AC Milan") */
  teamName: string;
  /** true = giocatore rivolto a sinistra (squadra ospite) */
  mirror?: boolean;
  /** altezza dello sprite in px; la larghezza è derivata (rapporto 10:16) */
  size?: number;
  pose?: Pose;
}

/**
 * Rende lo sprite pixel-art della squadra come SVG.
 * Se la squadra non è tra quelle gestite (resolveTeamKey === null) restituisce
 * null, così il chiamante può mostrare il proprio fallback (iniziali).
 */
export function PixelPlayerLogo({
  teamName,
  mirror = false,
  size = 96,
  pose = 'idle',
}: PixelPlayerLogoProps) {
  const teamKey = resolveTeamKey(teamName);
  if (!teamKey) return null;

  const height = size;
  const width = Math.round(size / 1.6);
  const xml = pixelPlayerSvg(teamKey, { pose, mirror, width, height });
  if (!xml) return null;

  return <SvgXml xml={xml} width={width} height={height} />;
}

export default PixelPlayerLogo;
