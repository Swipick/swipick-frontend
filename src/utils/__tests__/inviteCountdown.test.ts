import { oreRimanenti, testoScadenza } from '../inviteCountdown';

const adesso = new Date('2026-10-03T12:00:00Z');

describe('oreRimanenti', () => {
  it('conta le ore intere che mancano', () => {
    expect(oreRimanenti('2026-10-05T12:00:00Z', adesso)).toBe(48);
    expect(oreRimanenti('2026-10-04T11:30:00Z', adesso)).toBe(23);
  });

  it('arrotonda per difetto: 59 minuti sono zero ore, non una', () => {
    expect(oreRimanenti('2026-10-03T12:59:00Z', adesso)).toBe(0);
  });

  it('non va mai sotto zero', () => {
    expect(oreRimanenti('2026-10-01T12:00:00Z', adesso)).toBe(0);
  });

  it('tratta assente e illeggibile come scaduto', () => {
    expect(oreRimanenti(null, adesso)).toBe(0);
    expect(oreRimanenti(undefined, adesso)).toBe(0);
    expect(oreRimanenti('non-una-data', adesso)).toBe(0);
  });

  it('accetta anche un Date', () => {
    expect(oreRimanenti(new Date('2026-10-04T12:00:00Z'), adesso)).toBe(24);
  });
});

describe('testoScadenza', () => {
  it('sotto l ora non dice "0 ore", che suonerebbe come scaduto', () => {
    expect(testoScadenza(0)).toBe('meno di un’ora');
  });

  it('usa il singolare per una sola ora', () => {
    expect(testoScadenza(1)).toBe('un’ora');
  });

  it('negli altri casi conta le ore', () => {
    expect(testoScadenza(47)).toBe('47 ore');
  });
});
