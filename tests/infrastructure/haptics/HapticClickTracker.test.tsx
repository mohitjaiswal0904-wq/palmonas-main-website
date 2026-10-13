/** @jest-environment jsdom */

import { fireEvent, render } from '@testing-library/react';

const mockTriggerButtonHaptic = jest.fn();
const mockUnlockHapticsAudio = jest.fn();

jest.mock('@/infrastructure/haptics/web-haptics/adapter', () => ({
  triggerButtonHaptic: (...args: unknown[]) => mockTriggerButtonHaptic(...args),
  unlockHapticsAudio: (...args: unknown[]) => mockUnlockHapticsAudio(...args),
}));

describe('HapticClickTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
  });

  it('unlocks audio on pointerdown and fires haptics on add-to-cart click', async () => {
    const { HapticClickTracker } = await import('@/infrastructure/haptics/HapticClickTracker');

    render(
      <>
        <HapticClickTracker />
        <button type="button" aria-label="Add to cart">
          Add
        </button>
      </>,
    );

    const button = document.querySelector('button') as HTMLButtonElement;
    fireEvent.pointerDown(button);
    fireEvent.click(button);

    expect(mockUnlockHapticsAudio).toHaveBeenCalled();
    expect(mockTriggerButtonHaptic).toHaveBeenCalledTimes(1);
  });

  it('fires haptics for cart link click', async () => {
    const { HapticClickTracker } = await import('@/infrastructure/haptics/HapticClickTracker');

    render(
      <>
        <HapticClickTracker />
        <a href="/cart">Cart</a>
      </>,
    );

    fireEvent.click(document.querySelector('a') as HTMLAnchorElement);

    expect(mockTriggerButtonHaptic).toHaveBeenCalledTimes(1);
  });

  it('does not fire for unrelated buttons', async () => {
    const { HapticClickTracker } = await import('@/infrastructure/haptics/HapticClickTracker');

    render(
      <>
        <HapticClickTracker />
        <button type="button">Change pincode</button>
      </>,
    );

    fireEvent.click(document.querySelector('button') as HTMLButtonElement);

    expect(mockTriggerButtonHaptic).not.toHaveBeenCalled();
  });

  it('does not fire when the control opts out', async () => {
    const { HapticClickTracker } = await import('@/infrastructure/haptics/HapticClickTracker');

    render(
      <>
        <HapticClickTracker />
        <button type="button" aria-label="Add to cart" data-haptics-ignore>
          Dismiss
        </button>
      </>,
    );

    fireEvent.click(document.querySelector('button') as HTMLButtonElement);

    expect(mockTriggerButtonHaptic).not.toHaveBeenCalled();
  });
});
