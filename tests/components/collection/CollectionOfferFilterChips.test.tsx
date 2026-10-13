import { fireEvent, render, screen } from '@testing-library/react';

import { CollectionOfferFilterChips } from '@/components/collection/CollectionOfferFilterChips';
import { productListingMessages } from '@/config/product-listing/product-listing.config';
import { productTokens } from '@/config/theme/product.tokens';

describe('CollectionOfferFilterChips', () => {
  it('renders offer chips in a labelled toolbar', () => {
    render(
      <CollectionOfferFilterChips
        offers={['Buy 1 Get 1', 'Flat ₹999']}
        selectedOffer={null}
        onSelect={jest.fn()}
      />,
    );

    expect(
      screen.getByRole('toolbar', { name: productListingMessages.a11y.offerFilters }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Buy 1 Get 1' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('fills the All chip when no offer is selected', () => {
    render(
      <CollectionOfferFilterChips
        offers={['Buy 1 Get 1']}
        selectedOffer={null}
        onSelect={jest.fn()}
      />,
    );

    const allChip = screen.getByRole('button', { name: productListingMessages.a11y.allOffers });

    expect(allChip).toHaveAttribute('aria-pressed', 'true');
    expect(allChip.className).toContain('bg-[#ECE2DF]');
    expect(allChip.className).toContain('border-[#C4B8B8]');
    expect(allChip.className).toContain('border-2');
    expect(allChip.className).toContain('px-4');
    expect(allChip.className).not.toContain('px-5');
  });

  it('marks the selected chip as pressed', () => {
    render(
      <CollectionOfferFilterChips
        offers={['Buy 1 Get 1']}
        selectedOffer="Buy 1 Get 1"
        onSelect={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Buy 1 Get 1' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Buy 1 Get 1' }).className).toContain('px-4');
    expect(screen.getByRole('button', { name: 'Buy 1 Get 1' }).className).toContain('border-2');
    expect(
      screen.getByRole('button', { name: productListingMessages.a11y.allOffers }),
    ).toHaveAttribute('aria-pressed', 'false');
  });

  it('selects a chip on click', () => {
    const onSelect = jest.fn();

    render(
      <CollectionOfferFilterChips
        offers={['Buy 1 Get 1']}
        selectedOffer={null}
        onSelect={onSelect}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Buy 1 Get 1' }));

    expect(onSelect).toHaveBeenCalledWith('Buy 1 Get 1');
  });

  it('clears the chip when the selected chip is clicked again', () => {
    const onSelect = jest.fn();

    render(
      <CollectionOfferFilterChips
        offers={['Buy 1 Get 1']}
        selectedOffer="Buy 1 Get 1"
        onSelect={onSelect}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Buy 1 Get 1' }));

    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it('clears the offer filter when All is clicked', () => {
    const onSelect = jest.fn();

    render(
      <CollectionOfferFilterChips
        offers={['Buy 1 Get 1']}
        selectedOffer="Buy 1 Get 1"
        onSelect={onSelect}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: productListingMessages.a11y.allOffers }));

    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it('renders nothing when there are no offers', () => {
    const { container } = render(
      <CollectionOfferFilterChips offers={[]} selectedOffer={null} onSelect={jest.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('merges layout class names onto the chip track', () => {
    render(
      <CollectionOfferFilterChips
        offers={['Buy 1 Get 1']}
        selectedOffer={null}
        onSelect={jest.fn()}
        className="laptop:hidden"
      />,
    );

    expect(
      screen.getByRole('toolbar', { name: productListingMessages.a11y.offerFilters }).className,
    ).toContain('laptop:hidden');
  });
});
