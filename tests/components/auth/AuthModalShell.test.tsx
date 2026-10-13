import { fireEvent, render, screen } from '@testing-library/react';

import { AuthModalShell } from '@/components/auth/AuthModalShell';

describe('AuthModalShell', () => {
  it('renders children when open', () => {
    render(
      <AuthModalShell open aria-label="Test modal">
        <p>Modal body</p>
      </AuthModalShell>,
    );

    expect(screen.getByText('Modal body')).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Test modal' })).toBeInTheDocument();
  });

  it('returns null when closed', () => {
    const { container } = render(
      <AuthModalShell open={false} aria-label="Test modal">
        <p>Modal body</p>
      </AuthModalShell>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('calls onClose when overlay is clicked', () => {
    const onClose = jest.fn();
    render(
      <AuthModalShell open onClose={onClose} aria-label="Test modal">
        <p>Modal body</p>
      </AuthModalShell>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when Escape is pressed', () => {
    const onClose = jest.fn();
    render(
      <AuthModalShell open onClose={onClose} aria-label="Test modal">
        <p>Modal body</p>
      </AuthModalShell>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('renders non-interactive overlay when onClose is omitted', () => {
    render(
      <AuthModalShell open aria-label="Status">
        <p>Status body</p>
      </AuthModalShell>,
    );

    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Status' })).toBeInTheDocument();
  });

  it('renders status role without dialog modal semantics', () => {
    render(
      <AuthModalShell open role="status" aria-label="Login status">
        <p>Signing you in…</p>
      </AuthModalShell>,
    );

    expect(screen.getByRole('status', { name: 'Login status' })).toBeInTheDocument();
  });

  it('restores body overflow when modal closes', () => {
    const previousOverflow = document.body.style.overflow;
    const { rerender } = render(
      <AuthModalShell open onClose={jest.fn()} aria-label="Test modal">
        <p>Modal body</p>
      </AuthModalShell>,
    );

    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <AuthModalShell open={false} onClose={jest.fn()} aria-label="Test modal">
        <p>Modal body</p>
      </AuthModalShell>,
    );

    expect(document.body.style.overflow).toBe(previousOverflow);
  });
});
