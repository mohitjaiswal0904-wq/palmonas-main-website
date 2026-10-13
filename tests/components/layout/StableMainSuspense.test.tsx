import { act, render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';

import {
  resetStableMainCache,
  StableMainSuspense,
} from '@/components/layout/StableMainSuspense';

const mockUsePathname = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

function createSuspender(label: string): {
  Suspender: () => ReactElement;
  resolve: () => void;
} {
  let resolved = false;
  let settle: (() => void) | undefined;
  const promise = new Promise<void>((resolvePromise) => {
    settle = () => {
      resolved = true;
      resolvePromise();
    };
  });

  function Suspender() {
    if (!resolved) {
      throw promise;
    }

    return <div>{label}</div>;
  }

  return {
    Suspender,
    resolve: () => {
      settle?.();
    },
  };
}

describe('StableMainSuspense', () => {
  beforeEach(() => {
    resetStableMainCache();
    mockUsePathname.mockReturnValue('/collections/best-sellers');
  });

  it('renders resolved children', () => {
    render(
      <StableMainSuspense fallback={<div>Listing skeleton</div>}>
        <div>Rings grid</div>
      </StableMainSuspense>,
    );

    expect(screen.getByText('Rings grid')).toBeInTheDocument();
    expect(screen.queryByText('Listing skeleton')).not.toBeInTheDocument();
  });

  it('reuses the last body as fallback when the same path remounts', async () => {
    const { unmount } = render(
      <StableMainSuspense fallback={<div>Listing skeleton</div>}>
        <div>Rings grid</div>
      </StableMainSuspense>,
    );

    unmount();

    const { Suspender, resolve } = createSuspender('Rings grid refreshed');

    render(
      <StableMainSuspense fallback={<div>Listing skeleton</div>}>
        <Suspender />
      </StableMainSuspense>,
    );

    expect(screen.getByText('Rings grid')).toBeInTheDocument();
    expect(screen.queryByText('Listing skeleton')).not.toBeInTheDocument();

    await act(async () => {
      resolve();
    });

    expect(screen.getByText('Rings grid refreshed')).toBeInTheDocument();
  });

  it('shows the generic fallback when a new path has no cached body', () => {
    render(
      <StableMainSuspense fallback={<div>Listing skeleton</div>}>
        <div>Rings grid</div>
      </StableMainSuspense>,
    );

    mockUsePathname.mockReturnValue('/products/demo-ring');
    const { Suspender } = createSuspender('PDP body');

    render(
      <StableMainSuspense fallback={<div>Product skeleton</div>}>
        <Suspender />
      </StableMainSuspense>,
    );

    expect(screen.getByText('Product skeleton')).toBeInTheDocument();
    expect(screen.queryByText('PDP body')).not.toBeInTheDocument();
  });

  it('shows the generic fallback after the cache is cleared', () => {
    const { unmount } = render(
      <StableMainSuspense fallback={<div>Listing skeleton</div>}>
        <div>Rings grid</div>
      </StableMainSuspense>,
    );

    unmount();
    resetStableMainCache();

    const { Suspender } = createSuspender('Rings grid refreshed');

    render(
      <StableMainSuspense fallback={<div>Listing skeleton</div>}>
        <Suspender />
      </StableMainSuspense>,
    );

    expect(screen.getByText('Listing skeleton')).toBeInTheDocument();
    expect(screen.queryByText('Rings grid')).not.toBeInTheDocument();
  });
});
