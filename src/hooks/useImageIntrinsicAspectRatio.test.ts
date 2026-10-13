import { renderHook, act } from '@testing-library/react';
import type { SyntheticEvent } from 'react';

import { useImageIntrinsicAspectRatio } from '@/hooks/useImageIntrinsicAspectRatio';

function createImageLoadEvent(width: number, height: number): SyntheticEvent<HTMLImageElement> {
  return {
    currentTarget: {
      naturalWidth: width,
      naturalHeight: height,
    },
  } as SyntheticEvent<HTMLImageElement>;
}

describe('useImageIntrinsicAspectRatio', () => {
  it('uses initial dimensions when provided', () => {
    const { result } = renderHook(() =>
      useImageIntrinsicAspectRatio('https://cdn.example.com/card.webp', {
        width: 900,
        height: 1200,
      }),
    );

    expect(result.current.aspectRatio).toBe('900 / 1200');
  });

  it('updates aspect ratio after the image loads', () => {
    const { result } = renderHook(() =>
      useImageIntrinsicAspectRatio('https://cdn.example.com/card.webp'),
    );

    expect(result.current.aspectRatio).toBeUndefined();

    act(() => {
      result.current.onImageLoad(createImageLoadEvent(640, 400));
    });

    expect(result.current.aspectRatio).toBe('640 / 400');
  });
});
