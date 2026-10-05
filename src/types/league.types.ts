/**
 * Leghe private: i tipi che arrivano dal BFF.
 *
 * Le forme rispecchiano `modules/leagues` del backend. Due cose che non si
 * capiscono dai nomi:
 * - `inviteCode` arriva valorizzato solo a chi gestisce la lega, e solo
 *   finché non è scaduto: per tutti gli altri è null;
 * - `position` è null per chi deve ancora cominciare (`pending`), e quelle
 *   righe stanno in fondo: non sono ultime, sono fuori.
 */

export type LeagueRole = 'owner' | 'member';

export interface League {
  id: string;
  name: string;
  competitionId: number;
  season: number;
  isOwner: boolean;
  maxMembers: number;
  inviteCode: string | null;
  inviteCodeExpiresAt: string | null;
  invitesOpen: boolean;
}

export interface LeagueSummary extends League {
  memberCount: number;
  /** Nickname dei primi in classifica: servono agli avatar dell'elenco. */
  memberPreview: (string | null)[];
  myPosition: number | null;
  myPoints: number;
  myPending: boolean;
}

export interface StandingRow {
  userId: string;
  nickname: string | null;
  role: LeagueRole;
  position: number | null;
  points: number;
  revealed: number;
  percent: number;
  joinedFromWeek: number;
  pending: boolean;
}

export interface LeagueDetail extends League {
  memberCount: number;
  standings: StandingRow[];
}

export type LeagueMemberStatus = 'active' | 'left' | 'removed';

/** La riga della schermata di gestione: include chi è uscito o è stato rimosso. */
export interface LeagueMemberRow {
  userId: string;
  nickname: string | null;
  role: LeagueRole;
  status: LeagueMemberStatus;
  joinedFromWeek: number;
  joinedAt: string;
  isMe: boolean;
}

export interface InvitePreview {
  leagueId: string;
  name: string;
  competitionId: number;
  memberCount: number;
  ownerNickname: string | null;
  /** Da quale giornata conterebbe entrare adesso. */
  joinFromWeek: number;
  full: boolean;
  alreadyMember: boolean;
}

export interface AcceptedInvite {
  leagueId: string;
  joinedFromWeek: number;
}
