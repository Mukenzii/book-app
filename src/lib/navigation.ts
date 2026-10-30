import { router } from 'expo-router';

import type { TabKey } from '@/components/navigation/BottomNavigation';
import type { BookFormat } from '@/data/books';

export function openBook(id: string, from: TabKey = 'catalog') {
  router.push({ pathname: '/book/[id]', params: { id, from } });
}

export function openSearch(query = '', format: BookFormat = 'text') {
  router.push({ pathname: '/search', params: { q: query, format } });
}

/** Shows submitted results in the Каталог tab (134:732 / 134:899). */
export function showCatalogResults(query: string, format: BookFormat = 'text') {
  router.navigate({ pathname: '/catalog', params: { q: query, format } });
}

export function openTab(tab: TabKey) {
  router.navigate(tab === 'index' ? '/' : `/${tab}`);
}

/** `returnTo=book` brings the user back to the book card after sign-in. */
export function openAuth(returnTo: 'library' | 'book' = 'library') {
  router.push({ pathname: '/auth/phone', params: { returnTo } });
}

export type NavState = { index?: number; routes: { name: string; state?: NavState }[] };

/** Name of the focused route inside the `(tabs)` navigator, wherever it is nested. */
export function focusedTabName(state: NavState | undefined): string | undefined {
  for (const route of state?.routes ?? []) {
    if (route.name === '(tabs)') {
      const tabs = route.state;
      return tabs && typeof tabs.index === 'number' ? tabs.routes[tabs.index]?.name : undefined;
    }
    const nested = focusedTabName(route.state);
    if (nested) return nested;
  }
  return undefined;
}
