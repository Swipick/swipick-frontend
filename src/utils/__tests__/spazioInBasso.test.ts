import { Platform } from 'react-native';
import { useSpazioInBasso } from '../spazioInBasso';

jest.mock('react-native', () => ({ Platform: { OS: 'ios' } }));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 24, bottom: 48, left: 0, right: 0 }),
}));

describe('useSpazioInBasso', () => {
  const osOriginale = Platform.OS;

  afterEach(() => {
    Platform.OS = osOriginale;
  });

  it('su Android somma la barra di navigazione al margine', () => {
    Platform.OS = 'android';
    expect(useSpazioInBasso(16)).toBe(64);
  });

  it('su iOS lascia il margine com\'era', () => {
    Platform.OS = 'ios';
    expect(useSpazioInBasso(16)).toBe(16);
  });
});
