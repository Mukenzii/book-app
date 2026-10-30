import AsyncStorage from '@react-native-async-storage/async-storage';

import { appActions, appStore, hydrateAppStore, initialPersistedState, STORAGE_KEY } from '@/state/appStore';

async function flushPersist() {
  jest.advanceTimersByTime(200);
  await Promise.resolve();
}

describe('persisted app store', () => {
  beforeEach(async () => {
    jest.useFakeTimers();
    await AsyncStorage.clear();
    appStore.setState({ ...initialPersistedState, hydrated: false, showSignedInBanner: false });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('hydrates valid values and drops corrupt ones', async () => {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        themePreference: 'dark',
        session: { phone: 'not-a-phone', signedInAt: 1 },
        savedBookIds: ['morfiy', 3],
        favoriteGenreIds: ['kids'],
        ratings: { morfiy: 4, bad: 9 },
      }),
    );
    await hydrateAppStore();
    const state = appStore.getState();
    expect(state.hydrated).toBe(true);
    expect(state.themePreference).toBe('dark');
    expect(state.session).toBeNull();
    expect(state.savedBookIds).toEqual([]);
    expect(state.favoriteGenreIds).toEqual(['kids']);
    expect(state.ratings).toEqual({ morfiy: 4 });
  });

  it('persists theme, library, genres and session changes', async () => {
    await hydrateAppStore();
    appActions.setThemePreference('dark');
    appActions.signIn('901234567');
    expect(appActions.toggleSaved('morfiy')).toBe(true);
    appActions.toggleGenre('romance');
    appActions.rate('morfiy', 5);
    await flushPersist();

    const saved = JSON.parse((await AsyncStorage.getItem(STORAGE_KEY)) ?? '{}');
    expect(saved).toMatchObject({
      themePreference: 'dark',
      session: { phone: '901234567' },
      savedBookIds: ['morfiy'],
      favoriteGenreIds: ['romance'],
      ratings: { morfiy: 5 },
    });
    expect(saved.showSignedInBanner).toBeUndefined();
    expect(appStore.getState().showSignedInBanner).toBe(true);
  });

  it('toggles bookmarks and genres off again and signs out', async () => {
    await hydrateAppStore();
    appActions.toggleSaved('morfiy');
    expect(appActions.toggleSaved('morfiy')).toBe(false);
    appActions.toggleGenre('kids');
    appActions.toggleGenre('kids');
    appActions.signIn('901234567');
    appActions.signOut();
    const state = appStore.getState();
    expect(state.savedBookIds).toEqual([]);
    expect(state.favoriteGenreIds).toEqual([]);
    expect(state.session).toBeNull();
  });
});
