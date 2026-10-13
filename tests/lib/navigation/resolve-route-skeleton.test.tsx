import { render } from '@testing-library/react';

import { resolveRouteSkeleton } from '@/lib/navigation/resolve-route-skeleton';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element -- test stub for next/image
    <img alt={alt} src={src} />
  ),
}));

describe('resolveRouteSkeleton', () => {
  it('returns home skeleton for the marketing home path', () => {
    const { getByTestId } = render(resolveRouteSkeleton('/'));
    expect(getByTestId('home-page-skeleton')).toBeInTheDocument();
  });

  it('returns home skeleton for gold category query path', () => {
    const { getByTestId } = render(resolveRouteSkeleton('/?category=gold'));
    expect(getByTestId('home-page-skeleton')).toBeInTheDocument();
  });

  it('returns home skeleton for silver category query path', () => {
    const { getByTestId } = render(resolveRouteSkeleton('/?category=silver'));
    expect(getByTestId('home-page-skeleton')).toBeInTheDocument();
  });

  it('returns product skeleton for product paths', () => {
    const { getByTestId } = render(resolveRouteSkeleton('/products/demo-ring'));
    expect(getByTestId('product-page-skeleton')).toBeInTheDocument();
  });

  it('returns offers skeleton for cart offers paths', () => {
    const { getByTestId } = render(resolveRouteSkeleton('/cart/offers'));
    expect(getByTestId('cart-offers-page-skeleton')).toBeInTheDocument();
  });

  it('returns cart skeleton for cart paths', () => {
    const { getByTestId } = render(resolveRouteSkeleton('/cart'));
    expect(getByTestId('cart-page-skeleton')).toBeInTheDocument();
  });

  it('returns collection busy label for collections', () => {
    const { getByLabelText } = render(resolveRouteSkeleton('/collections/bestsellers'));
    expect(getByLabelText('Loading collection')).toBeInTheDocument();
  });

  it('returns about skeleton for the about page', () => {
    const { getByLabelText } = render(resolveRouteSkeleton('/about'));
    expect(getByLabelText('Loading about page')).toBeInTheDocument();
  });

  it('returns Emily in Paris skeleton for the canonical path', () => {
    const { getByLabelText } = render(resolveRouteSkeleton('/emily-in-paris'));
    expect(getByLabelText('Loading Emily in Paris')).toBeInTheDocument();
  });

  it('returns Emily in Paris skeleton for the /pages alias', () => {
    const { getByLabelText } = render(resolveRouteSkeleton('/pages/emily-in-paris'));
    expect(getByLabelText('Loading Emily in Paris')).toBeInTheDocument();
  });

  it('returns the Diwali skeleton for the canonical path', () => {
    const { getByLabelText } = render(resolveRouteSkeleton('/diwali'));
    expect(getByLabelText('Loading Diwali')).toBeInTheDocument();
  });

  it('returns the Diwali skeleton for the /pages alias', () => {
    const { getByLabelText } = render(resolveRouteSkeleton('/pages/diwali'));
    expect(getByLabelText('Loading Diwali')).toBeInTheDocument();
  });

  it('returns Shraddha favourite skeleton for the canonical path', () => {
    const { getByLabelText } = render(resolveRouteSkeleton('/shraddhas-favourite'));
    expect(getByLabelText("Loading Shraddha's Favourite")).toBeInTheDocument();
  });

  it('returns Shraddha favourite skeleton for the /pages alias', () => {
    const { getByLabelText } = render(resolveRouteSkeleton('/pages/shraddhas-favourite'));
    expect(getByLabelText("Loading Shraddha's Favourite")).toBeInTheDocument();
  });

  it('falls back to page chrome skeleton for unknown routes', () => {
    const { getByLabelText } = render(resolveRouteSkeleton('/careers'));
    expect(getByLabelText('Loading page content')).toBeInTheDocument();
  });
});
