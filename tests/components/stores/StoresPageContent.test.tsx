import { render, screen } from '@testing-library/react';

import { StoresPageContent } from '@/components/stores/StoresPageContent';
import { useStores } from '@/hooks/useStores';

jest.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: string) => value,
}));

jest.mock('@/hooks/useStores', () => ({
  useStores: jest.fn(),
}));

const mockUseStores = useStores as jest.MockedFunction<typeof useStores>;

describe('StoresPageContent', () => {
  beforeEach(() => {
    mockUseStores.mockReturnValue({
      stores: [],
      hasMoreStores: false,
      isLoading: false,
      isLoadingMoreStores: false,
      loadMoreStores: jest.fn(),
      error: null,
    });
  });

  it('uses India-appropriate store search terminology', () => {
    render(<StoresPageContent />);

    expect(
      screen.getByPlaceholderText('Search by city, state, address or pincode'),
    ).toBeInTheDocument();
  });

  it('keeps the expanded search description available as its label', () => {
    render(<StoresPageContent />);

    expect(
      screen.getByRole('searchbox', {
        name: 'Search stores by city, state, address, or pincode',
      }),
    ).toBeInTheDocument();
  });
});
