'use client';

import { WebHaptics } from 'web-haptics';

import { hapticButtonClickPreset, hapticFallbackVibrateMs } from '@/config/haptics/haptics.config';
import { env } from '@/lib/env';

let client: WebHaptics | null = null;
let clickAudioContext: AudioContext | null = null;

/**
 * Returns true when we should play a click instead of relying on vibrate.
 *
 * iOS Safari has no `navigator.vibrate`; desktop Chrome blocks vibrate until
 * the frame has a prior user activation.
 */
export function shouldUseHapticsDebugAudio(): boolean {
  if (env.NEXT_PUBLIC_APP_ENV === 'development') {
    return true;
  }

  return typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function';
}

/**
 * Returns whether Chrome currently treats this call as a user gesture.
 */
function hasTransientUserActivation(): boolean {
  const activation = navigator.userActivation;

  if (!activation) {
    return true;
  }

  return activation.isActive;
}

/**
 * Resolves the browser AudioContext constructor.
 */
function getAudioContextCtor(): typeof AudioContext | undefined {
  return (
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  );
}

/**
 * Creates / resumes the click AudioContext inside the current gesture.
 */
export function unlockHapticsAudio(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const AudioContextCtor = getAudioContextCtor();

  if (!AudioContextCtor) {
    return;
  }

  try {
    clickAudioContext ??= new AudioContextCtor();
    void clickAudioContext.resume();
  } catch {
    // Autoplay policy — wait for a later trusted tap.
  }
}

/**
 * Plays a short click so iOS / desktop can hear that a commerce tap fired.
 */
function playHapticClickSound(): void {
  unlockHapticsAudio();

  if (!clickAudioContext || clickAudioContext.state !== 'running') {
    return;
  }

  const oscillator = clickAudioContext.createOscillator();
  const gain = clickAudioContext.createGain();
  oscillator.type = 'square';
  oscillator.frequency.value = 180;
  gain.gain.value = 0.05;
  gain.gain.exponentialRampToValueAtTime(0.001, clickAudioContext.currentTime + 0.04);
  oscillator.connect(gain);
  gain.connect(clickAudioContext.destination);
  oscillator.start();
  oscillator.stop(clickAudioContext.currentTime + 0.04);
}

/**
 * Returns a shared WebHaptics instance for Android (sync vibrate only).
 *
 * @returns Client, or null during SSR.
 */
function getWebHapticsClient(): WebHaptics | null {
  if (typeof window === 'undefined') {
    return null;
  }

  client ??= new WebHaptics({ debug: false });
  return client;
}

/**
 * Fires a tap pulse only while the browser still has a transient user gesture.
 *
 * The web-haptics `trigger()` path is skipped when we need audio — it `await`s
 * and Chrome then blocks both vibrate and AudioContext.
 */
export function triggerButtonHaptic(): void {
  if (typeof window === 'undefined' || !hasTransientUserActivation()) {
    return;
  }

  try {
    if (typeof navigator.vibrate === 'function') {
      navigator.vibrate(hapticFallbackVibrateMs);
    }
  } catch {
    // Chrome intervention before the frame has a prior tap.
  }

  if (shouldUseHapticsDebugAudio()) {
    try {
      playHapticClickSound();
    } catch {
      // Audio still locked.
    }

    return;
  }

  try {
    const haptics = getWebHapticsClient();

    if (!haptics) {
      return;
    }

    void haptics.trigger(hapticButtonClickPreset).catch(() => {
      // ponytail: haptic failures must not affect clicks.
    });
  } catch {
    // SDK construct/trigger failed.
  }
}
