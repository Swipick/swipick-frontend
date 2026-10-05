/**
 * Stub di posthog-react-native per i test.
 *
 * Il modulo vero si appoggia a `__DEV__` e ad altre variabili che Metro
 * definisce e Jest no, quindi il solo import faceva fallire la suite. Ma la
 * ragione per sostituirlo è un'altra e vale comunque: nei test non deve
 * entrare un SDK che parla con la rete.
 */
export default class PostHog {
  constructor(
    public apiKey?: string,
    public options?: Record<string, unknown>,
  ) {}

  capture(): void {}
  identify(): void {}
  reset(): void {}
  screen(): void {}
  flush(): Promise<void> {
    return Promise.resolve();
  }
}
