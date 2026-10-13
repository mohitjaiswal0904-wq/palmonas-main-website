/**
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react';
import type { RefObject } from 'react';

import { useHorizontalMouseScroll } from '@/hooks/useHorizontalMouseScroll';
import { attachHorizontalMouseScroll } from '@/lib/layout/horizontal-mouse-scroll';

jest.mock('@/lib/layout/horizontal-mouse-scroll', () => ({
  attachHorizontalMouseScroll: jest.fn(() => jest.fn()),
}));

const attachMock = attachHorizontalMouseScroll as jest.MockedFunction<
  typeof attachHorizontalMouseScroll
>;

function refWith(node: HTMLDivElement | null): RefObject<HTMLDivElement | null> {
  return { current: node };
}

describe('useHorizontalMouseScroll', () => {
  beforeEach(() => {
    attachMock.mockClear();
    attachMock.mockReturnValue(jest.fn());
  });

  it('attaches mouse scroll when enabled and a node is present', () => {
    const node = document.createElement('div');
    renderHook(() => useHorizontalMouseScroll(refWith(node), true));

    expect(attachMock).toHaveBeenCalledWith(node);
  });

  it('does not attach when disabled', () => {
    const node = document.createElement('div');
    renderHook(() => useHorizontalMouseScroll(refWith(node), false));

    expect(attachMock).not.toHaveBeenCalled();
  });

  it('does not attach when the ref is empty', () => {
    renderHook(() => useHorizontalMouseScroll(refWith(null), true));

    expect(attachMock).not.toHaveBeenCalled();
  });

  it('cleans up the listener on unmount', () => {
    const node = document.createElement('div');
    const cleanup = jest.fn();
    attachMock.mockReturnValue(cleanup);

    const { unmount } = renderHook(() => useHorizontalMouseScroll(refWith(node), true));
    unmount();

    expect(cleanup).toHaveBeenCalledTimes(1);
  });
});
