import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';

import { __setRandomForTests, clearChallenge, requestCode } from '@/features/auth/demoSmsAdapter';
import { appStore, initialPersistedState } from '@/state/appStore';
import { dismissFeedback } from '@/state/feedbackStore';

const APP_DIR = './src/app';

async function renderApp(initialUrl: string) {
  await renderRouter(APP_DIR, { initialUrl });
}

beforeEach(async () => {
  await AsyncStorage.clear();
  appStore.setState({ ...initialPersistedState, hydrated: false, showSignedInBanner: false });
  clearChallenge();
  dismissFeedback();
  __setRandomForTests(() => 0.42); // demo code → 444444
});

afterAll(() => __setRandomForTests(Math.random));

describe('auth flow (69:2221 → 69:2569)', () => {
  it('validates +998 numbers, rejects a wrong SMS code and signs in', async () => {
    await renderApp('/library');
    await fireEvent.press(await screen.findByTestId('library-guest-action'));
    const phone = await screen.findByTestId('phone-input');
    expect(screen).toHavePathname('/auth/phone');
    await fireEvent.changeText(phone, '90123');
    expect(phone.props.value).toBe('90 123');
    expect(screen.getByTestId('request-code')).toBeDisabled();
    await fireEvent(phone, 'blur');
    expect(screen.getByText('Введите все 9 цифр после +998')).toBeOnTheScreen();

    await fireEvent.changeText(phone, '+998 90 123 45 67');
    expect(phone.props.value).toBe('90 123 45 67');
    expect(screen.queryByText('Введите все 9 цифр после +998')).toBeNull();
    await fireEvent.press(screen.getByTestId('request-code'));

    expect(await screen.findByText('Введите код')).toBeOnTheScreen();
    expect(screen).toHavePathname('/auth/code');
    expect(screen.getByText(/\+998 90 ••• •• 67/)).toBeOnTheScreen();
    expect(screen.getByTestId('resend-countdown')).toHaveTextContent('Новый код можно получить через 0:59');
    expect(screen.getByTestId('demo-code-note')).toHaveTextContent(/444444/);

    const pin = screen.getByTestId('pin-input');
    await fireEvent.changeText(pin, '000000');
    await fireEvent.press(screen.getByTestId('confirm-code'));
    expect(screen.getByText('Неверный код. Попробуйте ещё раз.')).toBeOnTheScreen();
    expect(screen.getByTestId('confirm-code')).toBeDisabled();

    await fireEvent.changeText(pin, '444444');
    await fireEvent.press(screen.getByTestId('confirm-code'));

    expect(await screen.findByTestId('signed-in-banner')).toBeOnTheScreen();
    expect(screen).toHavePathname('/library');
    expect(screen.getByText(/Здесь начинается/)).toBeOnTheScreen();
    expect(appStore.getState().session?.phone).toBe('901234567');
  });

  it('offers resend after the countdown and restarts it', async () => {
    requestCode('901234567', Date.now() - 60_000);
    await renderApp('/auth/code');
    await fireEvent.press(await screen.findByTestId('resend-code'));
    expect(await screen.findByTestId('resend-countdown')).toHaveTextContent(/0:59/);
  });

  it('redirects to the phone step when there is no pending code', async () => {
    await renderApp('/auth/code');
    expect(await screen.findByText('Ваш номер телефона')).toBeOnTheScreen();
  });
});

describe('search (134:397 → 134:732 / 134:899)', () => {
  it('submits a query and switches between Читать and Слушать', async () => {
    await renderApp('/search');
    await fireEvent.changeText(await screen.findByTestId('search-input'), 'айдар');
    expect(screen.getByText('Найти «айдар»')).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId('search-submit-row'));

    expect(await screen.findByTestId('results-count')).toHaveTextContent('Найдена 1 книга');
    expect(screen).toHavePathname('/catalog');
    expect(screen.getByTestId('book-card-gramotnym')).toBeOnTheScreen();

    await fireEvent.press(screen.getByTestId('catalog-format-audio'));
    expect(await screen.findByText('Аудиокниги не найдены')).toBeOnTheScreen();
    expect(screen.getByText('Возможно, вам понравится')).toBeOnTheScreen();
    expect(screen.getByTestId('book-card-restoran-audio')).toBeOnTheScreen();
  });

  it('returns from a book card to the same results via the bottom navigation', async () => {
    await renderApp('/search');
    await fireEvent.changeText(await screen.findByTestId('search-input'), 'айдар');
    await fireEvent.press(screen.getByTestId('search-submit-row'));
    await fireEvent.press(await screen.findByTestId('book-card-gramotnym'));
    expect(await screen.findByTestId('book-title')).toHaveTextContent('Грамотным быть модно @ru_grammar');
    expect(screen.getByText(/Аннотация, характеристики/)).toBeOnTheScreen();

    await fireEvent.press(screen.getByTestId('tab-catalog'));
    expect(await screen.findByTestId('results-count')).toHaveTextContent('Найдена 1 книга');
    expect(screen).toHavePathname('/catalog');
  });
});

describe('book details (87:1743 / 87:2108)', () => {
  it('switches format, shows facts and routes guests to sign-in', async () => {
    await renderApp('/book/morfiy');
    expect(await screen.findByText('~2 ч 8 мин')).toBeOnTheScreen();
    expect(screen.getByText('Войти, чтобы читать')).toBeOnTheScreen();

    await fireEvent.press(screen.getByTestId('book-format-audio'));
    expect(await screen.findByText('12 ч 13 мин')).toBeOnTheScreen();
    expect(screen.getByText('Кирилл Радциг')).toBeOnTheScreen();
    expect(screen.getByText('Войти, чтобы слушать')).toBeOnTheScreen();

    await fireEvent.press(screen.getByTestId('book-bookmark'));
    expect(await screen.findByText('Ваш номер телефона')).toBeOnTheScreen();
  });

  it('keeps the tabs under a deep-linked book so the bottom navigation works', async () => {
    await renderApp('/book/morfiy?from=library');
    await fireEvent.press(await screen.findByTestId('tab-library'));
    expect(await screen.findByTestId('library-guest')).toBeOnTheScreen();
    expect(screen).toHavePathname('/library');
  });

  it('returns to the library after a deep-linked sign-in', async () => {
    await renderApp('/auth/phone');
    await fireEvent.changeText(await screen.findByTestId('phone-input'), '901234567');
    await fireEvent.press(screen.getByTestId('request-code'));
    await fireEvent.changeText(await screen.findByTestId('pin-input'), '444444');
    await fireEvent.press(screen.getByTestId('confirm-code'));
    expect(await screen.findByTestId('signed-in-banner')).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId('tab-index'));
    expect(await screen.findByTestId('promo-carousel')).toBeOnTheScreen();
  });

  it('saves to the local library when signed in', async () => {
    appStore.setState({ session: { phone: '901234567', signedInAt: 1 } });
    await renderApp('/book/morfiy');
    await fireEvent.press(await screen.findByTestId('book-bookmark'));
    expect(appStore.getState().savedBookIds).toEqual(['morfiy']);
    expect(screen.getByText('Добавлено в «Мои книги»')).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId('book-primary'));
    expect(screen.getByText('Ридер: нужна интеграция')).toBeOnTheScreen();
  });
});

describe('home feed and profile', () => {
  it('renders all promo slides, toggles genres and gives honest feedback', async () => {
    await renderApp('/');
    for (const id of ['exclusive', 'subscription', 'formats']) {
      expect(await screen.findByTestId(`promo-slide-${id}`, { includeHiddenElements: true })).toBeTruthy();
    }
    await fireEvent.press(screen.getByTestId('genre-romance'));
    expect(appStore.getState().favoriteGenreIds).toEqual(['romance']);
    expect(screen.queryByTestId('promo-cta-subscription')).toBeNull();
    await fireEvent.press(screen.getByTestId('promo-dot-1'));
    expect(screen.getByTestId('promo-dot-1')).toBeSelected();
    await fireEvent.press(screen.getByTestId('promo-cta-subscription'));
    expect(screen.getByText('Подписка: нужна интеграция')).toBeOnTheScreen();
  });

  it('switches and persists the theme preference', async () => {
    await renderApp('/profile');
    await fireEvent.press(await screen.findByTestId('theme-dark'));
    expect(appStore.getState().themePreference).toBe('dark');
    expect(screen.getByTestId('theme-dark')).toBeSelected();
    await waitFor(async () => {
      expect(JSON.parse((await AsyncStorage.getItem('castle-mobile/state/v1')) ?? '{}').themePreference).toBe('dark');
    });
  });
});
