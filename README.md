# Castle Книги — React Native + Expo app

A single iOS + Android (and web) app built from the **current Castle designs** in the Figma file
*WB books screens*: auth `63:789`, book details `84:431`, home and search `134:2`, and shared components `59:2`.
The excluded **Wb screens** page (`6:2`) and the obsolete `35:164` / `43:2` designs are not used.

The Light and Dark Figma duplicates are implemented as **one app** with runtime theme switching
(Светлая / Тёмная / Системная). The choice is saved on the device. All copy stays in Russian, as in the designs.

> **Demo build, with no backend.** SMS, catalog, payments, reading and audio streaming are not connected.
> The demo stand-ins are labelled in the UI («ДЕМО», «…: нужна интеграция»). See [Gaps](#gaps-and-limitations).

## Stack

The versions were checked against the npm registry and Expo's official versions API (`api.expo.dev/v2/versions`) on 2026-10-30:

| Package | Version |
| --- | --- |
| Expo SDK | `expo ~58.0.21` (latest SDK) |
| React Native / React | `0.88.1` / `19.3.0` |
| Navigation | `expo-router ~58.0.28`: native stack, plus JS tabs with a custom Castle tab bar |
| UI | `expo-image`, `react-native-svg`, `expo-linear-gradient`, `react-native-safe-area-context` |
| Animation | `react-native-reanimated 4.7.1` + `react-native-worklets 0.13.0` (promo carousel indicator on the UI thread) |
| Persistence | `@react-native-async-storage/async-storage 2.2.0` |
| Fonts | Manrope Regular/Medium/SemiBold/Bold (OFL), bundled in `assets/fonts`, embedded by the `expo-font` config plugin |
| Tests | `jest-expo ~58.0.13`, `@testing-library/react-native 14`, `expo-router/testing-library` |
| Node | Tested with Node 26.4 (`expo` supports `^22.13 \|\| ^24.3 \|\| ^26`) |

Every native dependency was added with `npx expo install`, so the versions match SDK 58.

## Run it

```bash
npm install
```

```bash
npm start
```

Then press `i` (iOS Simulator), `a` (Android emulator or device) or `w` (web) in the Expo CLI.

| Target | Command | Notes |
| --- | --- | --- |
| iOS Simulator (Expo Go) | `npm run ios` | Needs Xcode with an iOS Simulator runtime (Xcode → Settings → Components). |
| Android emulator (Expo Go) | `npm run android` | Start an AVD first, or connect a device with USB debugging. |
| Web | `npm run web` | Open at a phone width (390 × 844) to match the frames. |
| iOS development build | `npx expo run:ios` | Generates `ios/` (CNG; don't edit it by hand). Fonts are embedded natively. |
| Android development build | `npx expo run:android` | Generates `android/`. |

Every module the app uses ships in Expo Go, so no custom native code is required.
`app.json` uses a placeholder bundle ID and package (`dev.castle.books.demo`). Change it before a store build.

If hot reload misses file changes (it did in the sandbox this was built in), restart Metro with `npx expo start --clear`.

### Quality checks

```bash
npm run check
```

That script runs `tsc --noEmit`, `expo lint` and `jest --ci`. You can also run each one on its own:

```bash
npm run typecheck
```

```bash
npm run lint
```

```bash
npm test
```

```bash
npx expo-doctor
```

```bash
npx expo export --platform ios --platform android --platform web
```

## Screen and route coverage

| Figma node | Design state | Route or how to reach it |
| --- | --- | --- |
| `69:2221` | 01 · Мои книги · Гость | `/library` while signed out |
| `69:2269` | 02 · Телефон · Пустое поле | `/auth/phone` |
| `69:2340` | 03 · Телефон · Готов к отправке | `/auth/phone` with 9 digits; «Получить код» is enabled |
| `69:2619` | 07 · Телефон · Ошибка номера | Fewer than 9 digits, then blur or tap outside the field |
| `69:2411` | 04 · SMS · Ожидание кода | `/auth/code` (countdown starts at 0:59) |
| `69:2490` | 05 · SMS · Код введён | 6 digits entered; «Подтвердить» is enabled |
| `69:2690` | 08 · SMS · Неверный код | Wrong code, then «Подтвердить» |
| `69:2769` | 09 · SMS · Повторная отправка | After the countdown, «Отправить код ещё раз» |
| `69:2569` | 06 · Мои книги · Вход выполнен | `/library` after sign-in (one-time «Вы вошли в аккаунт» banner) |
| `134:4` / `134:1775` | Главная, full feed | `/`: promo, Топ-10, Подборки, Жанры, Форматы, Подписка, Прогулка, Обсудить |
| `124:376` `124:377` `124:378` | Promo slides Exclusive / Subscription / Formats | Paging carousel on `/`, with tappable pagination dots |
| `134:397` | Поиск · Ввод | `/search` (opens the native keyboard) |
| `134:580` | Поиск · Запрос | `/search` while typing: «Найти «…»» row |
| `134:732` | Поиск · Читать | `/catalog?q=айдар&format=text` |
| `134:899` | Поиск · Слушать (empty, with recommendations) | `/catalog?q=айдар&format=audio` |
| `87:1743` | Морфий · Text | `/book/morfiy` |
| `87:2108` | Морфий · Audio | `/book/morfiy-audio`, or «Слушать» in the format switch |
| `59:2` | Shared Castle components | `src/components/**` (icons, buttons, chips, format switch, cards, navigation) |
| Dark sections | The `…· Dark` duplicates of every page | The same routes, with the theme set to Тёмная (or the system set to dark) |

These screens are **not in the designs** and are assembled from Castle components:

| Route | Purpose |
| --- | --- |
| `/profile` | Theme switch (Светлая/Тёмная/Системная), demo session (masked phone, sign out), demo-mode notes |
| `/catalog` with no query | «Возможно, вам понравится» grid for the selected format |
| `/library` with saved books | Grid of bookmarked books |
| `+not-found`, missing book | Honest "not in the designs or demo catalog" states |

## Behaviour

- **Navigation**: native stack for search, book, auth and not-found, and a 4-tab bar (Главная · Каталог · Мои книги · Профиль) styled like `Castle / App / Navigation`. Android hardware back pops the stack. Tabs use `backBehavior="history"`. Deep links (`castle://book/morfiy`, `castle://auth/phone`…) are anchored on the tabs (`unstable_settings.anchor`), so back and «Закрыть» always have somewhere to go. The book card repeats the bottom navigation, as in the design, and switches to the tapped tab while keeping that tab's state, such as the Каталог query.
- **+998 phone**: digits only, formatted as `90 123 45 67`. A pasted `+998…` or `998…` is normalised. Exactly 9 digits are required, and the error copy comes from the design. Native `number-pad` keyboard, `textContentType="telephoneNumber"`.
- **SMS (demo)**: a six-digit code is generated on the device and shown in a «ДЕМО» note. Single hidden input with `autoComplete="one-time-code"` (iOS `oneTimeCode`, Android `sms-otp`). Wrong code → red cells and the error copy. Resend countdown 0:59 → «Отправить код ещё раз» issues a new code.
- **Search**: local, typo-tolerant search over title, author and genre (the Figma query «айдар» finds «Айдай Максатбекова»). Читать/Слушать switch, Russian plurals («Найдена 1 книга»), empty state with recommendations. The «По подписке» chip filters locally.
- **Library and bookmarks**: the bookmark button on the book card saves to «Мои книги» (guests are sent to sign-in). Ratings are saved locally.
- **Genres**: «Выберите любимые жанры» tiles toggle and persist. «Все жанры» opens Каталог.
- **Book format switching**: Морфий text ⇄ audio swaps the cover, facts, metadata (Чтец), recommendations and CTA. Books with one format show the other option as unavailable.
- **Theme**: Castle Light/Dark tokens from `design-context/*vars.json`. The override is applied to native chrome (`Appearance.setColorScheme`) and the root background (`expo-system-ui`), and the status bar follows it.
- **Safe areas and touch targets**: custom headers pad the top inset, the tab bar pads the bottom inset, and `KeyboardAvoidingView` keeps auth actions above the keyboard. Icon buttons are 40pt with hitSlop (≥ 44pt targets). All controls have Russian accessibility roles, labels and states, and errors are announced through live regions.
- **Promo carousel**: native paging. The pagination pill is driven by the scroll offset on the UI thread (Reanimated). It stretches 8 → 24pt and blends to the accent colour continuously as the next slide comes in, with no React re-renders during the gesture, so swipes, web trackpad scrolls and dot taps stay smooth and in sync.
- **Undefined destinations** (section chevrons, collections, subscription, filters, author/publisher rows, samples, reader/player, legal links) show a «…: нужна интеграция» snackbar instead of fake screens.

## Project structure

```
src/app/                 routes (expo-router)
  _layout.tsx            fonts, store hydration, theme, native stack, snackbar host
  (tabs)/                index (Главная), catalog, library, profile + custom tab bar
  search.tsx  book/[id].tsx  auth/phone.tsx  auth/code.tsx  +not-found.tsx
src/components/          Castle design-system pieces (icons, ui, books, navigation)
src/features/            auth (phone utils, demo SMS adapter, pin/phone fields), search, home, library
src/data/books.ts        local demo catalog built only from Figma copy and assets
src/state/               tiny external store + AsyncStorage persistence, snackbar store
src/theme/               tokens (Light/Dark), typography (Manrope), ThemeProvider
assets/covers|fonts|images
__tests__/               unit + router-level behaviour tests
design-context/          Figma exports (unchanged)
```

### Assets

- Covers, author portrait and collection artwork were downloaded with `curl -L` from the Figma MCP asset URLs in `design-context` and bundled in `assets/covers`. Icons were converted from the exported SVGs into themable two-tone paths (`src/components/icons/paths.ts`).
- In Figma, the Морфий (text and audio), «1984» and «Бойцовский клуб» covers are crops of phone screenshots. Only the cover artwork was cropped out (`morfiy*.jpg`, `1984.jpg`, `boytsovskiy-klub.jpg`). No screen screenshot is used as app UI. The mock status bars and keyboards in the frames are replaced by the native ones.

## Verification (2026-10-30)

| Check | Result |
| --- | --- |
| `tsc --noEmit` | Pass |
| `expo lint` (eslint-config-expo + `react/jsx-no-leaked-render`) | Pass, 0 problems |
| `jest` | 35 / 35 pass: phone formatting and validation, demo SMS and countdown, search, plurals, persisted store, theme resolution, and full router flows (sign-in with a wrong then correct code, resend, search read/listen, book format switch, bookmark, carousel indicator math (page from offset, continuous pill width), promo dots and CTA, theme persistence, returning from a book to results, deep-linked book and sign-in) |
| `expo-doctor` | 20 / 20 checks pass |
| `expo export` (iOS, Android, web) | Pass (Hermes bundles for iOS and Android) |
| Web preview at 390 × 844 | Home, all 3 promo slides, search input/query/read/listen, book text/audio, the 9 auth states in Dark, signed-in library, profile theme override (Light pinned over a Dark OS, kept after reload) |

| Android emulator (Pixel-class AVD, Android 17 / API 37, Expo Go 58.0.5) | Home and promo swipe paging, native keyboard search and submit, results, book card and format switch, unavailable-format feedback, bookmark and saved library, phone validation on the number pad, SMS code (wrong, then correct), signed-in library, runtime Dark theme, hardware back across the stack and tab history, cold-start deep links, persistence across app restarts |

Expo Go 58.0.5 came from the URL that Expo's versions API returns (`github.com/expo/expo-go-releases`). Install it the same way with `npm run android`.

Bugs found on Android and fixed:

- With the keyboard open, the auth action button was hidden: Android edge-to-edge doesn't resize the window, so `KeyboardAvoidingView` now uses `padding` on both platforms.
- The snackbar covered the book's primary button; it now sits below the toolbar.
- After a deep link, the book card's bottom navigation could return to the wrong screen. Tabs are now the deep-link anchor, and the tapped tab is focused explicitly.

**Not run on iOS.** This machine's Xcode 26.6 has no iOS Simulator runtime. The iOS bundle export passes.

## Gaps and limitations

- **No backend.** The catalog is local. SMS is a demo adapter (`src/features/auth/demoSmsAdapter.ts`, `IS_DEMO_SMS`). There are no payments or subscription, no reader, no audio streaming, and reviews and ratings stay on the device. Replace `requestCode`/`verifyCode` with a real OTP provider before release.
- **Not designed** (built from Castle components): Профиль, catalog browse state, populated library, not-found.
- **Token gap:** Dark `control-selected` is not exported in Figma. `#3a3a3c` is used.
- **Data gaps:** «Мышонок Тим не хочет спать» has no author in the design, so none is shown. The audio editions of «1984» and «Бойцовский клуб» reuse the text covers, as the Figma audio card does. Descriptions and facts exist only for «Морфий». Other books show an "API needed" note.
- **Cropped covers** are low-resolution (117–320 px), so replace them with the original artwork. The app icon and splash are Expo template images; the designs include none.
- **Search filters** other than «По подписке» need catalog facets from an API.
- **Android keyboard theme:** Gboard follows the system theme, so it stays light when the app is pinned to «Тёмная» (`keyboardAppearance` is iOS-only).
- **Expo Go overlay:** Expo Go draws a floating dev-tools button over the top-right of the screen. It isn't part of the app and is absent in development and release builds.
- **Fresh emulators:** a freshly booted Play-enabled emulator may auto-update Android System WebView and kill Expo Go (`killDueToPackageUpdate`). Reopen the app if that happens.
- `npm audit` reports 16 advisories (13 low, 3 high) in transitive dev/build tooling. npm 11 also skipped install scripts for `@parcel/watcher`, `fsevents` and `unrs-resolver` (`npm approve-scripts` reviews them).
