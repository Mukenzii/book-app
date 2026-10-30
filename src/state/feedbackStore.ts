import { AccessibilityInfo } from 'react-native';

import { createStore, useStoreSelector } from './createStore';

export type FeedbackTone = 'info' | 'success' | 'integration';

export type FeedbackMessage = {
  id: number;
  tone: FeedbackTone;
  title: string;
  description?: string;
};

const feedbackStore = createStore<{ current: FeedbackMessage | null }>({ current: null });
let nextId = 1;
let hideTimer: ReturnType<typeof setTimeout> | undefined;

export function showFeedback(message: Omit<FeedbackMessage, 'id'>, durationMs = 3600) {
  const id = nextId++;
  feedbackStore.setState({ current: { ...message, id } });
  AccessibilityInfo.announceForAccessibility(
    message.description ? `${message.title}. ${message.description}` : message.title,
  );
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => dismissFeedback(id), durationMs);
}

export function dismissFeedback(id?: number) {
  const { current } = feedbackStore.getState();
  if (!current || (id !== undefined && current.id !== id)) return;
  feedbackStore.setState({ current: null });
}

/**
 * Honest feedback for destinations that the Castle designs do not define or that
 * need a real backend (catalog API, payments, reader, audio streaming…).
 */
export function showIntegrationNeeded(feature: string, detail?: string) {
  showFeedback({
    tone: 'integration',
    title: `${feature}: нужна интеграция`,
    description: detail ?? 'Экран не входит в текущие макеты Castle и появится после подключения сервиса.',
  });
}

export const useFeedback = () => useStoreSelector(feedbackStore, (state) => state.current);

export const getFeedback = () => feedbackStore.getState().current;
