import {
  offsetItalianoMinuti,
  partiItaliane,
  giornoMeseItaliano,
  calcioDInizioItaliano,
  GIORNI_BREVI,
} from '../oraItaliana';

describe('offsetItalianoMinuti', () => {
  it('vale 60 minuti d`inverno', () => {
    expect(offsetItalianoMinuti(new Date('2026-12-06T17:30:00Z'))).toBe(60);
    expect(offsetItalianoMinuti(new Date('2027-01-17T17:30:00Z'))).toBe(60);
  });

  it('vale 120 minuti durante l`ora legale', () => {
    expect(offsetItalianoMinuti(new Date('2026-10-11T10:30:00Z'))).toBe(120);
    expect(offsetItalianoMinuti(new Date('2026-06-15T12:00:00Z'))).toBe(120);
  });

  it('cambia esattamente all`ultima domenica di marzo, alle 01:00 UTC', () => {
    // nel 2027 l'ultima domenica di marzo è il 28
    expect(offsetItalianoMinuti(new Date('2027-03-28T00:59:59Z'))).toBe(60);
    expect(offsetItalianoMinuti(new Date('2027-03-28T01:00:00Z'))).toBe(120);
  });

  it('cambia esattamente all`ultima domenica di ottobre, alle 01:00 UTC', () => {
    // nel 2026 l'ultima domenica di ottobre è il 25
    expect(offsetItalianoMinuti(new Date('2026-10-25T00:59:59Z'))).toBe(120);
    expect(offsetItalianoMinuti(new Date('2026-10-25T01:00:00Z'))).toBe(60);
  });

  it('trova l`ultima domenica anche quando il mese finisce di domenica', () => {
    // 31 marzo 2030 è una domenica: il cambio è quel giorno, non il 24
    expect(offsetItalianoMinuti(new Date('2030-03-31T00:59:59Z'))).toBe(60);
    expect(offsetItalianoMinuti(new Date('2030-03-31T01:00:00Z'))).toBe(120);
  });
});

describe('partiItaliane', () => {
  it('legge la partita della domenica a pranzo in ora italiana', () => {
    // Como - AS Roma, giornata 6: 10:30 UTC sono le 12:30 a Roma
    expect(partiItaliane(new Date('2026-10-11T10:30:00Z'))).toEqual({
      anno: 2026,
      mese: 10,
      giorno: 11,
      ore: 12,
      minuti: 30,
      giornoSettimana: 0,
    });
  });

  it('legge la partita serale d`inverno', () => {
    // 19:45 UTC sono le 20:45 a Roma, quando non c'è l'ora legale
    const p = partiItaliane(new Date('2026-12-06T19:45:00Z'));
    expect(p).toMatchObject({ giorno: 6, mese: 12, ore: 20, minuti: 45 });
  });

  it('porta al giorno dopo l`istante che a Roma e` gia` domani', () => {
    // 23:30 UTC del 10 ottobre sono l'01:30 dell'11 a Roma
    expect(partiItaliane(new Date('2026-10-10T23:30:00Z'))).toMatchObject({
      giorno: 11,
      ore: 1,
      minuti: 30,
    });
  });

  it('restituisce null su una data non valida, senza inventare un orario', () => {
    expect(partiItaliane(new Date('non-una-data'))).toBeNull();
  });
});

describe('giornoMeseItaliano', () => {
  it('mette lo zero davanti a giorno e mese', () => {
    expect(giornoMeseItaliano(new Date('2026-09-05T18:00:00Z'))).toBe('05/09');
  });

  it('usa il giorno italiano, non quello UTC', () => {
    // mezzanotte e mezza italiana dell'11 è ancora il 10 in UTC
    expect(giornoMeseItaliano(new Date('2026-10-10T23:30:00Z'))).toBe('11/10');
  });

  it('restituisce null su una data non valida', () => {
    expect(giornoMeseItaliano(new Date('nulla'))).toBeNull();
  });
});

describe('calcioDInizioItaliano', () => {
  it('scrive "gio, 24/10, 20:45"', () => {
    // giovedi 24 settembre 2026, 18:45 UTC = 20:45 a Roma
    expect(calcioDInizioItaliano(new Date('2026-09-24T18:45:00Z'))).toBe('gio, 24/09, 20:45');
  });

  it('scrive la domenica a pranzo con l`ora giusta', () => {
    expect(calcioDInizioItaliano(new Date('2026-10-11T10:30:00Z'))).toBe('dom, 11/10, 12:30');
  });

  it('scrive il lunedì sera', () => {
    expect(calcioDInizioItaliano(new Date('2026-10-12T18:45:00Z'))).toBe('lun, 12/10, 20:45');
  });

  it('restituisce null su una data non valida', () => {
    expect(calcioDInizioItaliano(new Date('nulla'))).toBeNull();
  });

  it('ha sette giorni abbreviati, domenica prima', () => {
    expect(GIORNI_BREVI).toHaveLength(7);
    expect(GIORNI_BREVI[0]).toBe('dom');
    expect(GIORNI_BREVI[6]).toBe('sab');
  });
});
