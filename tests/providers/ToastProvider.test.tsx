import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ToastProvider, useToastContext } from '@/providers/ToastProvider';

function ToastProbe() {
  const { show, hide, hideAll, showToast, dismissToast, toasts } = useToastContext();
  return (
    <div>
      <button type="button" onClick={() => showToast('Hello toast')}>
        Show toast
      </button>
      <button type="button" onClick={() => show('Success toast', { type: 'success' })}>
        Show success
      </button>
      <button type="button" onClick={() => dismissToast(toasts[0]?.id ?? '')}>
        Dismiss toast
      </button>
      <button type="button" onClick={() => hide(toasts[0]?.id ?? '')}>
        Hide toast
      </button>
      <button type="button" onClick={() => hideAll()}>
        Hide all
      </button>
      <span data-testid="count">{toasts.length}</span>
    </div>
  );
}

describe('ToastProvider', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders toast message when showToast is called', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(
      <ToastProvider>
        <ToastProbe />
      </ToastProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Show toast' }));
    expect(screen.getByText('Hello toast')).toBeInTheDocument();
    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });

  it('supports typed success toasts via show()', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(
      <ToastProvider>
        <ToastProbe />
      </ToastProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Show success' }));

    expect(screen.getByText('Success toast')).toBeInTheDocument();
    expect(screen.getByText('Success toast').closest('[role="status"]')).toHaveClass('bg-[#e6f6ea]');
  });

  it('supports showSuccess helper', async () => {
    function SuccessProbe() {
      const { showSuccess } = useToastContext();
      return (
        <button type="button" onClick={() => showSuccess('Saved')}>
          Show saved
        </button>
      );
    }

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(
      <ToastProvider>
        <SuccessProbe />
      </ToastProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Show saved' }));

    expect(screen.getByText('Saved')).toBeInTheDocument();
    expect(screen.getByText('Saved').closest('[role="status"]')).toHaveClass('bg-[#e6f6ea]');
  });

  it('auto-dismisses toast after timeout', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(
      <ToastProvider>
        <ToastProbe />
      </ToastProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Show toast' }));
    expect(screen.getByText('Hello toast')).toBeInTheDocument();

    await act(async () => {
      jest.advanceTimersByTime(4000);
    });

    expect(screen.queryByText('Hello toast')).not.toBeInTheDocument();
  });

  it('dismisses toast when dismissToast is called', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(
      <ToastProvider>
        <ToastProbe />
      </ToastProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Show toast' }));
    await user.click(screen.getByRole('button', { name: 'Dismiss toast' }));

    expect(screen.queryByText('Hello toast')).not.toBeInTheDocument();
  });

  it('clears all toasts with hideAll()', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(
      <ToastProvider>
        <ToastProbe />
      </ToastProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Show toast' }));
    await user.click(screen.getByRole('button', { name: 'Show success' }));
    expect(screen.getByTestId('count')).toHaveTextContent('2');

    await user.click(screen.getByRole('button', { name: 'Hide all' }));

    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('positions bottom toast container above sticky bars with z-toast', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(
      <ToastProvider>
        <ToastProbe />
      </ToastProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Show toast' }));

    const container = screen.getByTestId('toast-container-bottom');
    expect(container).toHaveClass('z-toast');
    expect(container.className).toMatch(/pb-\[calc\(env\(safe-area-inset-bottom\)\+var\(--toast-offset-bottom\)\)\]/);
    expect(container.className).toMatch(/laptop:pb-\[calc\(env\(safe-area-inset-bottom\)\+var\(--toast-offset-bottom-desktop\)\)\]/);
  });
});
