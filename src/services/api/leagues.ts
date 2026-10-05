import { apiClient } from './client';
import { ENDPOINTS } from '../../config/api';
import {
  AcceptedInvite,
  InvitePreview,
  LeagueDetail,
  LeagueMemberRow,
  LeagueSummary,
  StandingRow,
} from '../../types/league.types';

/**
 * Leghe private.
 *
 * I messaggi di errore arrivano già scritti dal BFF — "Questo codice è
 * scaduto", "Sei già in questa lega" — e sono quelli che l'utente deve
 * leggere. Qui si rigirano invece di sostituirli con un generico: un errore
 * tradotto due volte perde l'unica informazione che conteneva.
 */
function erroreLeggibile(error: any, fallback: string): Error {
  const detail = error?.response?.data?.message;
  const message = Array.isArray(detail) ? detail[0] : detail;
  const err = new Error(message || fallback);
  (err as any).status = error?.response?.status;
  return err;
}

export const leaguesApi = {
  /** Le leghe a cui partecipo, la migliore per prima. */
  list: async (): Promise<LeagueSummary[]> => {
    try {
      return await apiClient.get<LeagueSummary[]>(ENDPOINTS.LEAGUES.LIST);
    } catch (error: any) {
      throw erroreLeggibile(error, 'Non riesco a caricare le tue leghe');
    }
  },

  create: async (name: string): Promise<LeagueSummary> => {
    try {
      return await apiClient.post<LeagueSummary>(ENDPOINTS.LEAGUES.CREATE, {
        name,
      });
    } catch (error: any) {
      throw erroreLeggibile(error, 'Non riesco a creare la lega');
    }
  },

  detail: async (leagueId: string): Promise<LeagueDetail> => {
    try {
      return await apiClient.get<LeagueDetail>(ENDPOINTS.LEAGUES.BY_ID(leagueId));
    } catch (error: any) {
      throw erroreLeggibile(error, 'Non riesco a caricare la lega');
    }
  },

  standings: async (
    leagueId: string,
    scope: 'season' | 'week' = 'season',
    week?: number,
  ): Promise<StandingRow[]> => {
    try {
      return await apiClient.get<StandingRow[]>(ENDPOINTS.LEAGUES.STANDINGS(leagueId, scope, week));
    } catch (error: any) {
      throw erroreLeggibile(error, 'Non riesco a caricare la classifica');
    }
  },

  /** Tutti i membri, rimossi compresi: solo per chi gestisce la lega. */
  members: async (leagueId: string): Promise<LeagueMemberRow[]> => {
    try {
      return await apiClient.get<LeagueMemberRow[]>(ENDPOINTS.LEAGUES.MEMBERS(leagueId));
    } catch (error: any) {
      throw erroreLeggibile(error, 'Non riesco a caricare i membri');
    }
  },

  rename: async (leagueId: string, name: string): Promise<LeagueSummary> => {
    try {
      return await apiClient.patch<LeagueSummary>(ENDPOINTS.LEAGUES.RENAME(leagueId), { name });
    } catch (error: any) {
      throw erroreLeggibile(error, 'Non riesco a cambiare il nome');
    }
  },

  rotateCode: async (leagueId: string): Promise<LeagueSummary> => {
    try {
      return await apiClient.post<LeagueSummary>(ENDPOINTS.LEAGUES.ROTATE_CODE(leagueId));
    } catch (error: any) {
      throw erroreLeggibile(error, 'Non riesco a generare un codice nuovo');
    }
  },

  closeInvites: async (leagueId: string): Promise<LeagueSummary> => {
    try {
      return await apiClient.delete<LeagueSummary>(ENDPOINTS.LEAGUES.CLOSE_INVITES(leagueId));
    } catch (error: any) {
      throw erroreLeggibile(error, 'Non riesco a chiudere gli inviti');
    }
  },

  leave: async (leagueId: string): Promise<void> => {
    try {
      await apiClient.delete(ENDPOINTS.LEAGUES.LEAVE(leagueId));
    } catch (error: any) {
      throw erroreLeggibile(error, 'Non riesco a farti uscire dalla lega');
    }
  },

  removeMember: async (leagueId: string, userId: string): Promise<void> => {
    try {
      await apiClient.delete(ENDPOINTS.LEAGUES.REMOVE_MEMBER(leagueId, userId));
    } catch (error: any) {
      throw erroreLeggibile(error, 'Non riesco a rimuovere il membro');
    }
  },

  reinstateMember: async (leagueId: string, userId: string): Promise<void> => {
    try {
      await apiClient.post(ENDPOINTS.LEAGUES.REINSTATE_MEMBER(leagueId, userId));
    } catch (error: any) {
      throw erroreLeggibile(error, 'Non riesco a riammettere il membro');
    }
  },

  transferOwner: async (leagueId: string, userId: string): Promise<void> => {
    try {
      await apiClient.post(ENDPOINTS.LEAGUES.TRANSFER_OWNER(leagueId), {
        userId,
      });
    } catch (error: any) {
      throw erroreLeggibile(error, 'Non riesco a passare la gestione');
    }
  },

  remove: async (leagueId: string): Promise<void> => {
    try {
      await apiClient.delete(ENDPOINTS.LEAGUES.DELETE(leagueId));
    } catch (error: any) {
      throw erroreLeggibile(error, 'Non riesco a eliminare la lega');
    }
  },

  /** Che lega c'è dietro un codice, senza entrarci. */
  previewInvite: async (code: string): Promise<InvitePreview> => {
    try {
      return await apiClient.get<InvitePreview>(ENDPOINTS.INVITES.PREVIEW(code));
    } catch (error: any) {
      throw erroreLeggibile(error, 'Codice non valido');
    }
  },

  acceptInvite: async (code: string): Promise<AcceptedInvite> => {
    try {
      return await apiClient.post<AcceptedInvite>(ENDPOINTS.INVITES.ACCEPT(code));
    } catch (error: any) {
      throw erroreLeggibile(error, 'Non riesco a farti entrare nella lega');
    }
  },
};

export default leaguesApi;
