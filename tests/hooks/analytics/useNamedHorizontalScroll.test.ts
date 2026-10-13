/** @jest-environment jsdom */

import { renderHook } from '@testing-library/react';
import { createRef } from 'react';

const mockAttach = jest.fn(() => jest.fn());

jest.mock('@/lib/analytics/named-horizontal-scroll', () => ({
  attachNamedHorizontalScrollTracking: mockAttach,
}));

describe('useNamedHorizontalScroll', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('attaches tracking when the ref is mounted', async () => {
    const { useNamedHorizontalScroll } = await import(
      '@/hooks/analytics/useNamedHorizontalScroll'
    );
    const el = document.createElement('div');
    const ref = createRef<HTMLDivElement>();
    Object.defineProperty(ref, 'current', { value: el, writable: true });

    renderHook(() =>
      useNamedHorizontalScroll(ref, {
        eventName: 'carousel_scrolled',
        sectionName: 'banner_carousel',
      }),
    );

    expect(mockAttach).toHaveBeenCalledWith(el, {
      eventName: 'carousel_scrolled',
      sectionName: 'banner_carousel',
      pageName: undefined,
    });
  });

  it('skips attach when disabled', async () => {
    const { useNamedHorizontalScroll } = await import(
      '@/hooks/analytics/useNamedHorizontalScroll'
    );
    const el = document.createElement('div');
    const ref = createRef<HTMLDivElement>();
    Object.defineProperty(ref, 'current', { value: el, writable: true });

    renderHook(() =>
      useNamedHorizontalScroll(
        ref,
        { eventName: 'carousel_scrolled', sectionName: 'banner_carousel' },
        false,
      ),
    );

    expect(mockAttach).not.toHaveBeenCalled();
  });

  it('skips attach when the ref is empty', async () => {
    const { useNamedHorizontalScroll } = await import(
      '@/hooks/analytics/useNamedHorizontalScroll'
    );
    const ref = createRef<HTMLDivElement>();

    renderHook(() =>
      useNamedHorizontalScroll(ref, {
        eventName: 'carousel_scrolled',
        sectionName: 'banner_carousel',
      }),
    );

    expect(mockAttach).not.toHaveBeenCalled();
  });
});
