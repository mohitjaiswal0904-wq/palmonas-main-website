import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AuthLoginStatusOverlayView } from '@/components/auth/AuthLoginStatusOverlay';
import { authMessages, LOGIN_OVERLAY_TIMEOUT_MS } from '@/config/auth/auth.config';

describe('AuthLoginStatusOverlayView', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders nothing when status is idle', () => {
    const { container } = render(
      <AuthLoginStatusOverlayView
        status="idle"
        errorMessage={null}
        onRetry={jest.fn()}
        onDismiss={jest.fn()}
        onTimeout={jest.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders loading state while scripts preload', () => {
    render(
      <AuthLoginStatusOverlayView
        status="loading"
        errorMessage={null}
        onRetry={jest.fn()}
        onDismiss={jest.fn()}
        onTimeout={jest.fn()}
      />,
    );
    expect(screen.getByText('Loading secure login…')).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Login status' })).toBeInTheDocument();
  });

  it('renders opening state with loader message', () => {
    render(
      <AuthLoginStatusOverlayView
        status="opening"
        errorMessage={null}
        onRetry={jest.fn()}
        onDismiss={jest.fn()}
        onTimeout={jest.fn()}
      />,
    );
    expect(screen.getByText('Opening secure login…')).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Login status' })).toBeInTheDocument();
  });

  it('renders syncing state with loader message', () => {
    render(
      <AuthLoginStatusOverlayView
        status="syncing"
        errorMessage={null}
        onRetry={jest.fn()}
        onDismiss={jest.fn()}
        onTimeout={jest.fn()}
      />,
    );
    expect(screen.getByText('Signing you in…')).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Login status' })).toBeInTheDocument();
  });

  it('calls onTimeout after loading exceeds configured duration', () => {
    const onTimeout = jest.fn();

    render(
      <AuthLoginStatusOverlayView
        status="opening"
        errorMessage={null}
        onRetry={jest.fn()}
        onDismiss={jest.fn()}
        onTimeout={onTimeout}
      />,
    );

    expect(onTimeout).not.toHaveBeenCalled();
    jest.advanceTimersByTime(LOGIN_OVERLAY_TIMEOUT_MS);
    expect(onTimeout).toHaveBeenCalledTimes(1);
  });

  it('clears timeout when loading finishes before expiry', () => {
    const onTimeout = jest.fn();

    const { rerender } = render(
      <AuthLoginStatusOverlayView
        status="opening"
        errorMessage={null}
        onRetry={jest.fn()}
        onDismiss={jest.fn()}
        onTimeout={onTimeout}
      />,
    );

    jest.advanceTimersByTime(LOGIN_OVERLAY_TIMEOUT_MS / 2);

    rerender(
      <AuthLoginStatusOverlayView
        status="success"
        errorMessage={null}
        onRetry={jest.fn()}
        onDismiss={jest.fn()}
        onTimeout={onTimeout}
      />,
    );

    jest.advanceTimersByTime(LOGIN_OVERLAY_TIMEOUT_MS);
    expect(onTimeout).not.toHaveBeenCalled();
  });

  it('renders success state', () => {
    render(
      <AuthLoginStatusOverlayView
        status="success"
        errorMessage={null}
        onRetry={jest.fn()}
        onDismiss={jest.fn()}
        onTimeout={jest.fn()}
      />,
    );
    expect(screen.getByText('Welcome back!')).toBeInTheDocument();
  });

  it('renders error state with fallback message when errorMessage is null', () => {
    render(
      <AuthLoginStatusOverlayView
        status="error"
        errorMessage={null}
        onRetry={jest.fn()}
        onDismiss={jest.fn()}
        onTimeout={jest.fn()}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(authMessages.errors.login);
  });

  it('renders error state with retry and dismiss actions', async () => {
    jest.useRealTimers();
    const user = userEvent.setup();
    const onRetry = jest.fn();
    const onDismiss = jest.fn();

    render(
      <AuthLoginStatusOverlayView
        status="error"
        errorMessage="Login failed"
        onRetry={onRetry}
        onDismiss={onDismiss}
        onTimeout={jest.fn()}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Login failed');

    await user.click(screen.getByRole('button', { name: 'Try again' }));
    await user.click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
