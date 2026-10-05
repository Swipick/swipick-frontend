import { create } from 'zustand';
import { leaguesApi } from '../../services/api/leagues';
import { LeagueDetail, LeagueSummary } from '../../types/league.types';

/**
 * Lo stato delle leghe.
 *
 * Tiene due cose: l'elenco (serve alla tab) e la lega aperta (serve al
 * dettaglio, alla gestione e all'invito, che sono tre schermate diverse sullo
 * stesso oggetto). Il navigatore smonta le schermate a ogni passaggio, quindi
 * se il dettaglio tenesse i propri dati si ricaricherebbe tutto a ogni
 * "indietro".
 */

interface LeaguesState {
  leagues: LeagueSummary[];
  loading: boolean;
  error: string | null;

  /** La lega aperta: null quando si è nell'elenco. */
  detail: LeagueDetail | null;
  detailLoading: boolean;
  detailError: string | null;
}

interface LeaguesActions {
  loadLeagues: () => Promise<void>;
  createLeague: (name: string) => Promise<LeagueSummary>;

  openLeague: (leagueId: string) => Promise<void>;
  reloadDetail: () => Promise<void>;
  closeLeague: () => void;

  rotateCode: () => Promise<void>;
  closeInvites: () => Promise<void>;
  rename: (name: string) => Promise<void>;
  removeMember: (userId: string) => Promise<void>;
  reinstateMember: (userId: string) => Promise<void>;
  transferOwner: (userId: string) => Promise<void>;
  leave: () => Promise<void>;
  remove: () => Promise<void>;

  /** Al logout: niente leghe di un altro account in memoria. */
  clearSession: () => void;
}

const initialState: LeaguesState = {
  leagues: [],
  loading: false,
  error: null,
  detail: null,
  detailLoading: false,
  detailError: null,
};

export const useLeaguesStore = create<LeaguesState & LeaguesActions>((set, get) => ({
  ...initialState,

  loadLeagues: async () => {
    set({ loading: true, error: null });
    try {
      const leagues = await leaguesApi.list();
      set({ leagues, loading: false });
    } catch (err: any) {
      set({ loading: false, error: err?.message ?? 'Errore di caricamento' });
    }
  },

  createLeague: async (name: string) => {
    const created = await leaguesApi.create(name);
    await get().loadLeagues();
    await get().openLeague(created.id);
    return created;
  },

  openLeague: async (leagueId: string) => {
    set({ detailLoading: true, detailError: null });
    try {
      const detail = await leaguesApi.detail(leagueId);
      set({ detail, detailLoading: false });
    } catch (err: any) {
      set({
        detailLoading: false,
        detailError: err?.message ?? 'Errore di caricamento',
      });
    }
  },

  reloadDetail: async () => {
    const current = get().detail;
    if (!current) return;
    await get().openLeague(current.id);
  },

  closeLeague: () => set({ detail: null, detailError: null }),

  rotateCode: async () => {
    const current = get().detail;
    if (!current) return;
    await leaguesApi.rotateCode(current.id);
    await get().reloadDetail();
  },

  closeInvites: async () => {
    const current = get().detail;
    if (!current) return;
    await leaguesApi.closeInvites(current.id);
    await get().reloadDetail();
  },

  rename: async (name: string) => {
    const current = get().detail;
    if (!current) return;
    await leaguesApi.rename(current.id, name);
    await get().reloadDetail();
    await get().loadLeagues();
  },

  removeMember: async (userId: string) => {
    const current = get().detail;
    if (!current) return;
    await leaguesApi.removeMember(current.id, userId);
    await get().reloadDetail();
    // Anche l'elenco: il numero di membri e la posizione lì sono cambiati.
    // Senza, resta giusto solo perché il navigatore rimonta la schermata.
    await get().loadLeagues();
  },

  reinstateMember: async (userId: string) => {
    const current = get().detail;
    if (!current) return;
    await leaguesApi.reinstateMember(current.id, userId);
    await get().reloadDetail();
    // Anche l'elenco: il numero di membri e la posizione lì sono cambiati.
    // Senza, resta giusto solo perché il navigatore rimonta la schermata.
    await get().loadLeagues();
  },

  transferOwner: async (userId: string) => {
    const current = get().detail;
    if (!current) return;
    await leaguesApi.transferOwner(current.id, userId);
    await get().reloadDetail();
    // Anche l'elenco: il numero di membri e la posizione lì sono cambiati.
    // Senza, resta giusto solo perché il navigatore rimonta la schermata.
    await get().loadLeagues();
  },

  leave: async () => {
    const current = get().detail;
    if (!current) return;
    await leaguesApi.leave(current.id);
    set({ detail: null });
    await get().loadLeagues();
  },

  remove: async () => {
    const current = get().detail;
    if (!current) return;
    await leaguesApi.remove(current.id);
    set({ detail: null });
    await get().loadLeagues();
  },

  clearSession: () => set({ ...initialState }),
}));

export default useLeaguesStore;
