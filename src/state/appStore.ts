import AsyncStorage from '@react-native-async-storage/async-storage';

import { createStore, useStoreSelector } from './createStore';

export type ThemePreference = 'system' | 'light' | 'dark';

export type DemoSession = {
  /** Nine national digits after +998. */
  phone: string;
  signedInAt: number;
};

export type PersistedState = {
  themePreference: ThemePreference;
  session: DemoSession | null;
  /** Books saved with the bookmark action; shown in «Мои книги». */
  savedBookIds: string[];
  favoriteGenreIds: string[];
  /** Local-only star ratings (no review backend). */
  ratings: Record<string, number>;
};

export type AppState = PersistedState & {
  hydrated: boolean;
  /** Shows the one-time «Вы вошли в аккаунт» banner after sign-in. */
  showSignedInBanner: boolean;
};

export const STORAGE_KEY = 'castle-mobile/state/v1';

export const initialPersistedState: PersistedState = {
  themePreference: 'system',
  session: null,
  savedBookIds: [],
  favoriteGenreIds: [],
  ratings: {},
};

export const appStore = createStore<AppState>({
  ...initialPersistedState,
  hydrated: false,
  showSignedInBanner: false,
});

export const useAppStore = <S,>(selector: (state: AppState) => S) =>
  useStoreSelector(appStore, selector);

function pickPersisted(state: AppState): PersistedState {
  return {
    themePreference: state.themePreference,
    session: state.session,
    savedBookIds: state.savedBookIds,
    favoriteGenreIds: state.favoriteGenreIds,
    ratings: state.ratings,
  };
}

function sanitize(raw: unknown): Partial<PersistedState> {
  if (!raw || typeof raw !== 'object') return {};
  const value = raw as Record<string, unknown>;
  const result: Partial<PersistedState> = {};
  if (value.themePreference === 'light' || value.themePreference === 'dark' || value.themePreference === 'system') {
    result.themePreference = value.themePreference;
  }
  const session = value.session as DemoSession | null | undefined;
  if (session === null || (session && typeof session.phone === 'string' && /^\d{9}$/.test(session.phone))) {
    result.session = session ?? null;
  }
  const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === 'string');
  if (isStringArray(value.savedBookIds)) result.savedBookIds = value.savedBookIds;
  if (isStringArray(value.favoriteGenreIds)) result.favoriteGenreIds = value.favoriteGenreIds;
  if (value.ratings && typeof value.ratings === 'object') {
    result.ratings = Object.fromEntries(
      Object.entries(value.ratings as Record<string, unknown>).filter(
        (entry): entry is [string, number] => typeof entry[1] === 'number' && entry[1] >= 1 && entry[1] <= 5,
      ),
    );
  }
  return result;
}

let persistTimer: ReturnType<typeof setTimeout> | undefined;
let lastSaved = '';

/** Loads persisted state once at startup and starts write-through persistence. */
export async function hydrateAppStore(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) appStore.setState(sanitize(JSON.parse(raw)));
  } catch {
    // Corrupt or unavailable storage: start with defaults.
  }
  lastSaved = JSON.stringify(pickPersisted(appStore.getState()));
  appStore.setState({ hydrated: true });
}

appStore.subscribe(() => {
  const state = appStore.getState();
  if (!state.hydrated) return;
  const serialized = JSON.stringify(pickPersisted(state));
  if (serialized === lastSaved) return;
  lastSaved = serialized;
  clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    AsyncStorage.setItem(STORAGE_KEY, serialized).catch(() => undefined);
  }, 150);
});

export const appActions = {
  setThemePreference(themePreference: ThemePreference) {
    appStore.setState({ themePreference });
  },
  signIn(phone: string) {
    appStore.setState({ session: { phone, signedInAt: Date.now() }, showSignedInBanner: true });
  },
  signOut() {
    appStore.setState({ session: null, showSignedInBanner: false });
  },
  dismissSignedInBanner() {
    appStore.setState({ showSignedInBanner: false });
  },
  toggleSaved(bookId: string): boolean {
    const { savedBookIds } = appStore.getState();
    const saved = savedBookIds.includes(bookId);
    appStore.setState({
      savedBookIds: saved ? savedBookIds.filter((id) => id !== bookId) : [bookId, ...savedBookIds],
    });
    return !saved;
  },
  toggleGenre(genreId: string) {
    const { favoriteGenreIds } = appStore.getState();
    appStore.setState({
      favoriteGenreIds: favoriteGenreIds.includes(genreId)
        ? favoriteGenreIds.filter((id) => id !== genreId)
        : [...favoriteGenreIds, genreId],
    });
  },
  rate(bookId: string, stars: number) {
    appStore.setState((state) => ({ ratings: { ...state.ratings, [bookId]: stars } }));
  },
};
