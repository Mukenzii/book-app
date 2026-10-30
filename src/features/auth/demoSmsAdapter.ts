import { createStore, useStoreSelector } from '@/state/createStore';

/**
 * DEMO SMS ADAPTER — no SMS is sent and no backend is contacted.
 *
 * It generates a six-digit code on the device and shows it on the code screen so
 * the Castle flow can be exercised end to end. Replace `requestCode`/`verifyCode`
 * with a real OTP provider before release.
 */
export const IS_DEMO_SMS = true;
export const CODE_LENGTH = 6;
export const RESEND_COOLDOWN_SECONDS = 59;

export type SmsChallenge = {
  phone: string;
  demoCode: string;
  sentAt: number;
};

const challengeStore = createStore<{ challenge: SmsChallenge | null }>({ challenge: null });

let random: () => number = Math.random;

/** Test hook for deterministic codes. */
export function __setRandomForTests(fn: () => number) {
  random = fn;
}

function generateCode(): string {
  return Array.from({ length: CODE_LENGTH }, () => Math.floor(random() * 10)).join('');
}

export function requestCode(phone: string, now = Date.now()): SmsChallenge {
  const challenge = { phone, demoCode: generateCode(), sentAt: now };
  challengeStore.setState({ challenge });
  return challenge;
}

export function verifyCode(code: string): boolean {
  const { challenge } = challengeStore.getState();
  return challenge !== null && code.length === CODE_LENGTH && code === challenge.demoCode;
}

export function clearChallenge() {
  challengeStore.setState({ challenge: null });
}

export function getChallenge() {
  return challengeStore.getState().challenge;
}

export const useChallenge = () => useStoreSelector(challengeStore, (state) => state.challenge);

/** Seconds left before «Отправить код ещё раз» becomes available. */
export function secondsUntilResend(sentAt: number, now: number): number {
  const elapsed = Math.max(0, now - sentAt);
  return Math.max(0, RESEND_COOLDOWN_SECONDS - Math.floor(elapsed / 1000));
}

export function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
