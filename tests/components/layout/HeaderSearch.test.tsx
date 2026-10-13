import { fireEvent, render, screen } from '@testing-library/react';

import { HeaderSearch } from '@/components/layout/HeaderSearch';
import { DEFAULT_SEARCH_SUGGESTIONS } from '@/components/search/search-suggestions.defaults';

const mockPush = jest.fn();
let mockPathname = '/';
let mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}));

jest.mock('@/hooks/useSearchAutocomplete', () => ({
  useSearchAutocomplete: () => ({ products: [], isLoading: false, error: null }),
}));

jest.mock('@/hooks/auth/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    isGuest: true,
    isLoading: false,
  }),
}));

jest.mock('@/hooks/useSearchHistory', () => ({
  useSearchHistory: () => ({ terms: [], isLoading: false }),
}));

jest.mock('@/components/icons', () => ({
  SearchIcon: () => null,
}));

jest.mock('@/components/layout/HeaderSearchDropdown', () => ({
  HeaderSearchDropdown: () => <div data-testid="search-dropdown" />,
}));

function renderHeaderSearch() {
  render(<HeaderSearch suggestions={DEFAULT_SEARCH_SUGGESTIONS} />);

  return screen.getByLabelText('Search products and collections');
}

describe('HeaderSearch', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockPathname = '/';
    mockSearchParams = new URLSearchParams();
  });

  it('renders the search input with 16px text classes to avoid mobile focus zoom', () => {
    render(<HeaderSearch suggestions={DEFAULT_SEARCH_SUGGESTIONS} />);

    const input = screen.getByRole('searchbox', { name: /search products and collections/i });
    expect(input.className).toContain('text-base');
    expect(input.className).toContain('placeholder:text-base');
    expect(input.className).not.toContain('text-xs');
    expect(input.className).not.toContain('tab:text-sm');
  });

  it('keeps placeholder copy and accessible label intact', () => {
    render(<HeaderSearch suggestions={DEFAULT_SEARCH_SUGGESTIONS} />);

    expect(screen.getByPlaceholderText('Search products...')).toBeInTheDocument();
    expect(
      screen.getByRole('searchbox', { name: /search products and collections/i }),
    ).toBeInTheDocument();
  });

  it('submits a query and navigates to the search page', () => {
    render(<HeaderSearch suggestions={DEFAULT_SEARCH_SUGGESTIONS} />);

    const input = screen.getByRole('searchbox', { name: /search products and collections/i });
    fireEvent.change(input, { target: { value: 'gold ring' } });
    fireEvent.submit(input.closest('form')!);

    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/search?q=gold'));
  });

  it('does not navigate when the query is empty or whitespace', () => {
    render(<HeaderSearch suggestions={DEFAULT_SEARCH_SUGGESTIONS} />);

    const input = screen.getByRole('searchbox', { name: /search products and collections/i });
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.submit(input.closest('form')!);

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('keeps suggestions closed until the field is clicked', () => {
    const input = renderHeaderSearch();

    expect(screen.queryByTestId('search-dropdown')).not.toBeInTheDocument();

    fireEvent.focus(input);

    expect(screen.getByTestId('search-dropdown')).toBeInTheDocument();
  });

  it('does not open suggestions on hover alone', () => {
    const input = renderHeaderSearch();

    fireEvent.mouseEnter(input.parentElement?.parentElement as HTMLElement);
    fireEvent.mouseOver(input);

    expect(screen.queryByTestId('search-dropdown')).not.toBeInTheDocument();
  });

  it('closes suggestions when pointer presses outside the field', () => {
    const input = renderHeaderSearch();

    fireEvent.focus(input);
    expect(screen.getByTestId('search-dropdown')).toBeInTheDocument();

    fireEvent.pointerDown(document.body);

    expect(screen.queryByTestId('search-dropdown')).not.toBeInTheDocument();
  });

  it('keeps suggestions open while the pointer presses inside the field', () => {
    const input = renderHeaderSearch();

    fireEvent.focus(input);
    fireEvent.pointerDown(input);

    expect(screen.getByTestId('search-dropdown')).toBeInTheDocument();
  });

  it('clears typed query when navigating away from the current non-search route', () => {
    const { rerender } = render(<HeaderSearch suggestions={DEFAULT_SEARCH_SUGGESTIONS} />);

    const input = screen.getByRole('searchbox', { name: /search products and collections/i });
    fireEvent.change(input, { target: { value: 'Rings' } });
    expect(input).toHaveValue('Rings');

    mockPathname = '/products/test-ring';
    rerender(<HeaderSearch suggestions={DEFAULT_SEARCH_SUGGESTIONS} />);

    expect(
      screen.getByRole('searchbox', { name: /search products and collections/i }),
    ).toHaveValue('');
  });

  it('seeds from URL q on /search and clears when leaving search', () => {
    mockPathname = '/search';
    mockSearchParams = new URLSearchParams('q=Rings');
    const { rerender } = render(<HeaderSearch suggestions={DEFAULT_SEARCH_SUGGESTIONS} />);

    expect(screen.getByRole('searchbox', { name: /search products and collections/i })).toHaveValue(
      'Rings',
    );

    mockPathname = '/products/test-ring';
    mockSearchParams = new URLSearchParams();
    rerender(<HeaderSearch suggestions={DEFAULT_SEARCH_SUGGESTIONS} />);

    expect(
      screen.getByRole('searchbox', { name: /search products and collections/i }),
    ).toHaveValue('');
  });
});
