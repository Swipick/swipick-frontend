import { computeWeekMeter, hasKickedOff, WeekMeterMatch } from "../weekMeter";

const NOW = new Date("2026-09-12T18:00:00Z").getTime();
const HOUR = 3600_000;

const match = (over: Partial<WeekMeterMatch> = {}): WeekMeterMatch => ({
  status: "SCHEDULED",
  kickoff: new Date(NOW + 24 * HOUR).toISOString(),
  actualResult: null,
  isCorrect: null,
  revealed: false,
  ...over,
});

const played = (correct: boolean, revealed: boolean): WeekMeterMatch =>
  match({
    status: "FINISHED",
    kickoff: new Date(NOW - 2 * HOUR).toISOString(),
    actualResult: "1",
    isCorrect: correct,
    revealed,
  });

describe("hasKickedOff", () => {
  it("riconosce una partita in corso o conclusa dallo stato", () => {
    expect(hasKickedOff("LIVE", new Date(NOW + HOUR).toISOString(), NOW)).toBe(true);
    expect(hasKickedOff("FINISHED", new Date(NOW + HOUR).toISOString(), NOW)).toBe(true);
  });

  it("si basa sull'orologio quando lo stato non e' ancora aggiornato", () => {
    expect(hasKickedOff("SCHEDULED", new Date(NOW - 1).toISOString(), NOW)).toBe(true);
    expect(hasKickedOff("SCHEDULED", new Date(NOW + 1).toISOString(), NOW)).toBe(false);
  });

  it("non considera iniziata una partita con data illeggibile", () => {
    expect(hasKickedOff("SCHEDULED", "non-una-data", NOW)).toBe(false);
  });
});

describe("computeWeekMeter", () => {
  it("giornata vuota: tutto a zero, niente di definitivo", () => {
    expect(computeWeekMeter([], NOW)).toEqual({
      percent: 0, total: 0, correct: 0, toReveal: 0, toPlay: 0,
      isFinal: false, isLive: false,
    });
  });

  it("giornata non ancora iniziata: 0%, tutte da giocare, non e' in corso", () => {
    const m = computeWeekMeter(Array.from({ length: 10 }, () => match()), NOW);
    expect(m).toMatchObject({ percent: 0, toPlay: 10, toReveal: 0, isLive: false, isFinal: false });
  });

  it("giornata in corso: percentuale sul totale, non sulle scoperte", () => {
    // 6 concluse (4 scoperte: 3 giuste, 1 sbagliata), 4 ancora da giocare
    const matches = [
      played(true, true), played(true, true), played(true, true),
      played(false, true),
      played(true, false), played(true, false),
      match(), match(), match(), match(),
    ];
    const m = computeWeekMeter(matches, NOW);
    // La vecchia formula avrebbe dato 3/4 = 75%: qui e' 3/10.
    expect(m.percent).toBe(30);
    expect(m).toMatchObject({ total: 10, correct: 3, toReveal: 2, toPlay: 4, isLive: true, isFinal: false });
  });

  it("scoprire una sbagliata non fa scendere la percentuale", () => {
    const before = [played(true, true), played(false, false), match(), match()];
    const after = [played(true, true), played(false, true), match(), match()];
    expect(computeWeekMeter(before, NOW).percent).toBe(25);
    expect(computeWeekMeter(after, NOW).percent).toBe(25);
  });

  it("giornata conclusa ma nulla scoperto: 0% e niente di definitivo", () => {
    const matches = Array.from({ length: 10 }, (_, i) => played(i < 7, false));
    const m = computeWeekMeter(matches, NOW);
    expect(m).toMatchObject({ percent: 0, toPlay: 0, toReveal: 10, isFinal: false, isLive: false });
  });

  it("giornata conclusa e interamente scoperta: numero definitivo, non piu' in corso", () => {
    const matches = Array.from({ length: 10 }, (_, i) => played(i < 7, true));
    const m = computeWeekMeter(matches, NOW);
    expect(m).toMatchObject({ percent: 70, toPlay: 0, toReveal: 0, isFinal: true, isLive: false });
  });

  it("a giornata conclusa e scoperta coincide con la formula precedente", () => {
    // La promessa che regge la migrazione: lo storico non deve cambiare.
    const matches = Array.from({ length: 10 }, (_, i) => played(i < 7, true));
    const nuova = computeWeekMeter(matches, NOW).percent;
    const revealed = matches.filter((x) => x.revealed);
    const vecchia = Math.round(
      (revealed.filter((x) => x.isCorrect).length / revealed.length) * 100,
    );
    expect(nuova).toBe(vecchia);
  });

  it("resta in corso finche' manca anche una sola partita da giocare", () => {
    const matches = [...Array.from({ length: 9 }, () => played(true, true)), match()];
    expect(computeWeekMeter(matches, NOW).isLive).toBe(true);
  });
});
