import {
  setUnauthorizedHandler,
  reportRequestSuccess,
  reportUnauthorized,
  __resetForTests,
} from '../unauthorizedHandler';

describe('unauthorizedHandler — sessioni zombie su 401 ripetuti', () => {
  let onUnauthorized: jest.Mock;

  beforeEach(() => {
    __resetForTests();
    onUnauthorized = jest.fn();
    setUnauthorizedHandler(onUnauthorized);
  });

  it('does not sign out on a single (possibly transient) 401', () => {
    reportUnauthorized();
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it('signs out after two consecutive 401s', () => {
    reportUnauthorized();
    reportUnauthorized();
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('resets the counter when a request succeeds in between', () => {
    reportUnauthorized();
    reportRequestSuccess();
    reportUnauthorized();
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it('does not fire twice for the same streak after triggering', () => {
    reportUnauthorized();
    reportUnauthorized(); // trigger
    reportUnauthorized(); // nuovo conteggio: 1 — non deve ri-triggerare
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('is safe when no handler is registered', () => {
    __resetForTests();
    expect(() => {
      reportUnauthorized();
      reportUnauthorized();
    }).not.toThrow();
  });
});
