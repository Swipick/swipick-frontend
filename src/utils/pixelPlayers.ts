/**
 * Pixel Players
 * -------------
 * Porting per React Native del generatore parametrico "omini pixel"
 * (Desktop/pixel-players.js). Sostituisce gli stemmi delle squadre con
 * uno sprite pixel-art generato dai colori/pattern della maglia.
 *
 * A differenza dell'originale per browser, qui NON si usa il DOM:
 * `pixelPlayerSvg()` restituisce una stringa SVG pura, pronta per essere
 * renderizzata con <SvgXml> di react-native-svg. Il wrapper `pitchScene`
 * (basato su <div>/innerHTML) è stato omesso: nella card di Gioca serve un
 * singolo sprite per squadra, non l'intera scena a due giocatori.
 *
 * NON contiene stemmi, marchi o loghi: solo colore e geometria del kit.
 * Dati maglie: stagione 2026/27 (dall'artifact "Maglie Serie A 2026/27").
 */

export type Pattern = 'solid' | 'stripes' | 'halves' | 'hoops' | 'cross';
export type Pose = 'idle' | 'kick';

export interface TeamKit {
  /** nome leggibile */
  n: string;
  /** sigla 3 lettere */
  s: string;
  /** pattern maglia */
  p: Pattern;
  /** colori: [primario, secondario?] */
  c: [string] | [string, string];
  /** colore accento (calzettoni / trim) */
  t: string;
}

// ---- Palette neutra fissa (uguale per tutte le squadre) ----
const NEUTRAL: Record<string, string> = {
  hair: '#241d18',
  skin: '#e3b78a',
  shorts: '#f2f2f4',
  boot: '#141414',
};

// ---- Dati squadra: stagione 2026/27 (20 squadre) ----
export const TEAMS: Record<string, TeamKit> = {
  atalanta: { n: 'Atalanta', s: 'ATA', p: 'stripes', c: ['#0A0A0A', '#0057A8'], t: '#5C6B7A' },
  bologna: { n: 'Bologna', s: 'BOL', p: 'stripes', c: ['#A6192E', '#16305C'], t: '#16305C' },
  cagliari: { n: 'Cagliari', s: 'CAG', p: 'hoops', c: ['#A6192E', '#003DA5'], t: '#003DA5' },
  como: { n: 'Como', s: 'COM', p: 'solid', c: ['#1B3F91'], t: '#FFFFFF' },
  fiorentina: { n: 'Fiorentina', s: 'FIO', p: 'solid', c: ['#5B2A86'], t: '#C9A227' },
  frosinone: { n: 'Frosinone', s: 'FRO', p: 'solid', c: ['#FFD100'], t: '#1B3B6F' },
  genoa: { n: 'Genoa', s: 'GEN', p: 'halves', c: ['#B5121B', '#0F2C59'], t: '#0F2C59' },
  inter: { n: 'Inter', s: 'INT', p: 'stripes', c: ['#000000', '#0C1E4E'], t: '#C7A252' },
  juventus: { n: 'Juventus', s: 'JUV', p: 'stripes', c: ['#FFFFFF', '#000000'], t: '#B08D57' },
  lazio: { n: 'Lazio', s: 'LAZ', p: 'solid', c: ['#6CB7E4'], t: '#FFFFFF' },
  lecce: { n: 'Lecce', s: 'LEC', p: 'stripes', c: ['#FFCC00', '#D31145'], t: '#1B3B6F' },
  milan: { n: 'Milan', s: 'MIL', p: 'stripes', c: ['#E2231A', '#000000'], t: '#000000' },
  monza: { n: 'Monza', s: 'MON', p: 'solid', c: ['#E2231A'], t: '#FFFFFF' },
  napoli: { n: 'Napoli', s: 'NAP', p: 'solid', c: ['#0A4C8A'], t: '#C9A227' },
  parma: { n: 'Parma', s: 'PAR', p: 'cross', c: ['#FFFFFF', '#000000'], t: '#FFD100' },
  roma: { n: 'AS Roma', s: 'ROM', p: 'solid', c: ['#A2001D'], t: '#F0B323' },
  sassuolo: { n: 'Sassuolo', s: 'SAS', p: 'stripes', c: ['#0A0A0A', '#2E7D32'], t: '#2E7D32' },
  torino: { n: 'Torino', s: 'TOR', p: 'solid', c: ['#78002E'], t: '#FFFFFF' },
  udinese: { n: 'Udinese', s: 'UDI', p: 'stripes', c: ['#FFFFFF', '#000000'], t: '#C9A227' },
  venezia: { n: 'Venezia', s: 'VEN', p: 'stripes', c: ['#000000', '#F26522'], t: '#1E7145' },
};

// ---- Griglia sprite: 10 colonne × 16 righe ----
// ogni riga: [numeroRiga, [ [colInizio, colFine, materiale], ... ] ]
type Segment = [number, number, string];
type Row = [number, Segment[]];

const IDLE: Row[] = [
  [0, [[3, 6, 'hair']]],
  [1, [[3, 6, 'hair']]],
  [2, [[3, 6, 'skin']]],
  [3, [[3, 6, 'skin']]],
  [4, [[4, 5, 'skin']]],
  [5, [[2, 7, 'torso']]],
  [6, [[1, 8, 'torso']]],
  [7, [[1, 1, 'skin'], [2, 7, 'torso'], [8, 8, 'skin']]],
  [8, [[2, 7, 'torso']]],
  [9, [[2, 7, 'torso']]],
  [10, [[2, 7, 'shorts']]],
  [11, [[2, 7, 'shorts']]],
  [12, [[2, 3, 'skin'], [6, 7, 'skin']]],
  [13, [[2, 3, 'skin'], [6, 7, 'skin']]],
  [14, [[2, 3, 'trim'], [6, 7, 'trim']]],
  [15, [[2, 3, 'boot'], [6, 7, 'boot']]],
];

const KICK: Row[] = [
  [0, [[3, 6, 'hair']]],
  [1, [[3, 6, 'hair']]],
  [2, [[3, 6, 'skin']]],
  [3, [[3, 6, 'skin']]],
  [4, [[4, 5, 'skin']]],
  [5, [[2, 7, 'torso']]],
  [6, [[1, 8, 'torso']]],
  [7, [[1, 1, 'skin'], [2, 7, 'torso'], [8, 8, 'skin']]],
  [8, [[2, 7, 'torso']]],
  [9, [[2, 7, 'torso']]],
  [10, [[2, 7, 'shorts']]],
  [11, [[2, 7, 'shorts']]],
  [12, [[2, 3, 'skin'], [6, 7, 'skin']]],
  [13, [[2, 3, 'skin'], [7, 8, 'skin']]],
  [14, [[2, 3, 'trim'], [8, 9, 'trim']]],
  [15, [[2, 3, 'boot'], [8, 9, 'boot']]],
];

const POSES: Record<Pose, Row[]> = { idle: IDLE, kick: KICK };

function patCell(
  t: TeamKit,
  row: number,
  col: number,
  segStart: number,
  segEnd: number,
  torsoTop: number
): string {
  const a = t.c[0];
  const b = t.c[1] ?? t.c[0];
  if (t.p === 'stripes') return (col - segStart) % 2 === 0 ? a : b;
  if (t.p === 'halves') return col - segStart < (segEnd - segStart + 1) / 2 ? a : b;
  if (t.p === 'hoops') return (row - torsoTop) % 2 === 0 ? a : b;
  if (t.p === 'cross') {
    const w = segEnd - segStart + 1;
    const relC = col - segStart;
    const relR = row - torsoTop;
    const vc = Math.floor(w / 2);
    return relC === vc || relC === vc - 1 || relR === 2 ? b : a;
  }
  return a;
}

interface PixelPlayerOptions {
  pose?: Pose;
  mirror?: boolean;
  width?: number;
  height?: number;
}

/**
 * Genera la stringa SVG di un giocatore per la squadra indicata.
 * @param teamKey chiave in TEAMS (es. "roma"); usa resolveTeamKey() per
 *                ricavarla dal nome che arriva dal backend.
 * @returns stringa SVG pronta per <SvgXml>, oppure "" se la chiave è ignota.
 */
export function pixelPlayerSvg(teamKey: string, opts: PixelPlayerOptions = {}): string {
  const team = TEAMS[teamKey];
  if (!team) return '';

  const { pose = 'idle', mirror = false, width = 60, height = 96 } = opts;
  const template = POSES[pose] ?? IDLE;

  let rects = '';
  template.forEach(([r, segs]) =>
    segs.forEach(([s, e, mat]) => {
      for (let c = s; c <= e; c++) {
        const color =
          mat === 'torso'
            ? patCell(team, r, c, s, e, 5)
            : mat === 'trim'
              ? team.t
              : NEUTRAL[mat];
        rects += `<rect x="${c}" y="${r}" width="1.02" height="1.02" fill="${color}"/>`;
      }
    })
  );

  const body = mirror ? `<g transform="translate(10,0) scale(-1,1)">${rects}</g>` : rects;
  return `<svg viewBox="0 0 10 16" width="${width}" height="${height}" shape-rendering="crispEdges">${body}</svg>`;
}

/** Icona pallone SVG, riusabile a qualsiasi dimensione. */
export function ballSvg(size = 30): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4.6" fill="#f4f2ef"/><polygon points="5,2.2 6.7,3.6 6.1,5.6 3.9,5.6 3.3,3.6" fill="#1a1a1a"/></svg>`;
}

// ---- Risoluzione nome squadra (backend) -> chiave TEAMS ----
// I nomi possono arrivare in varie forme ("AC Milan", "Inter", "SSC Napoli").
// Normalizziamo e mappiamo sulle 20 chiavi disponibili. Le squadre non
// presenti in TEAMS restituiscono null: il chiamante mostra il fallback.
const NAME_TO_KEY: Record<string, string> = {
  atalanta: 'atalanta',
  'atalanta bc': 'atalanta',
  bologna: 'bologna',
  'bologna fc': 'bologna',
  cagliari: 'cagliari',
  'cagliari calcio': 'cagliari',
  como: 'como',
  'como 1907': 'como',
  fiorentina: 'fiorentina',
  'acf fiorentina': 'fiorentina',
  frosinone: 'frosinone',
  'frosinone calcio': 'frosinone',
  genoa: 'genoa',
  'genoa cfc': 'genoa',
  inter: 'inter',
  internazionale: 'inter',
  'fc internazionale': 'inter',
  'fc internazionale milano': 'inter',
  'inter milan': 'inter',
  juventus: 'juventus',
  juve: 'juventus',
  'juventus fc': 'juventus',
  lazio: 'lazio',
  'ss lazio': 'lazio',
  lecce: 'lecce',
  'us lecce': 'lecce',
  milan: 'milan',
  'ac milan': 'milan',
  monza: 'monza',
  'ac monza': 'monza',
  napoli: 'napoli',
  'ssc napoli': 'napoli',
  parma: 'parma',
  'parma calcio': 'parma',
  'parma calcio 1913': 'parma',
  roma: 'roma',
  'as roma': 'roma',
  sassuolo: 'sassuolo',
  'us sassuolo': 'sassuolo',
  'sassuolo calcio': 'sassuolo',
  torino: 'torino',
  'torino fc': 'torino',
  udinese: 'udinese',
  'udinese calcio': 'udinese',
  venezia: 'venezia',
  'venezia fc': 'venezia',
};

// token generici da rimuovere quando il nome esatto non è mappato
const STRIP_TOKENS = new Set([
  'fc',
  'cf',
  'cfc',
  'ac',
  'as',
  'us',
  'ss',
  'ssc',
  'bc',
  'calcio',
  'milano',
]);

function normalize(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // rimuove accenti
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Ricava la chiave TEAMS da un nome squadra del backend.
 * @returns chiave (es. "milan") o null se la squadra non è tra le 20 gestite.
 */
export function resolveTeamKey(name?: string | null): string | null {
  if (!name) return null;
  const norm = normalize(name);
  if (NAME_TO_KEY[norm]) return NAME_TO_KEY[norm];

  // fallback: togli i token generici e riprova con il "core" del nome
  const core = norm
    .split(' ')
    .filter((tok) => !STRIP_TOKENS.has(tok))
    .join(' ')
    .trim();
  if (NAME_TO_KEY[core]) return NAME_TO_KEY[core];
  if (TEAMS[core]) return core;

  return null;
}

/** true se la squadra ha uno sprite pixel disponibile. */
export function hasPixelPlayer(name?: string | null): boolean {
  return resolveTeamKey(name) !== null;
}
