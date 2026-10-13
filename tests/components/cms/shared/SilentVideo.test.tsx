import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { SilentVideo } from '@/components/cms/shared/SilentVideo';
import { mediaMessages } from '@/config/media/media.config';

const CLIP_SRC = 'https://cdn.example.com/clip.mp4';

class IntersectionObserverMock {
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();

  constructor(private readonly callback: IntersectionObserverCallback) {
    observers.push(this);
  }

  trigger(isIntersecting: boolean): void {
    this.callback(
      [{ isIntersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

const observers: IntersectionObserverMock[] = [];

describe('SilentVideo', () => {
  const playMock = jest.fn<Promise<void>, []>();

  beforeEach(() => {
    observers.length = 0;
    playMock.mockReset();
    playMock.mockResolvedValue(undefined);
    Object.defineProperty(HTMLMediaElement.prototype, 'play', {
      configurable: true,
      value: playMock,
    });
    global.IntersectionObserver = jest.fn(function IntersectionObserver(
      this: IntersectionObserverMock,
      callback: IntersectionObserverCallback,
    ) {
      return new IntersectionObserverMock(callback) as unknown as IntersectionObserver;
    }) as unknown as typeof IntersectionObserver;
  });

  it('renders a muted video without native controls when controls are off', () => {
    const { container } = render(
      <SilentVideo src={CLIP_SRC} aria-label="Campaign clip" />,
    );
    const video = container.querySelector('video');

    expect(video).toBeTruthy();
    expect(video).toHaveAttribute('muted');
    expect(video).not.toHaveAttribute('controls');
    expect(screen.queryByRole('button', { name: mediaMessages.a11y.play })).not.toBeInTheDocument();
  });

  it('renders custom play and seek controls without a mute control', () => {
    render(<SilentVideo src={CLIP_SRC} controls />);

    expect(screen.getByRole('button', { name: mediaMessages.a11y.play })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: mediaMessages.a11y.seek })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: mediaMessages.a11y.fullscreen })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /mute|volume|speaker/i })).not.toBeInTheDocument();
  });

  it('toggles the play label after a play event on the video element', () => {
    const { container } = render(<SilentVideo src={CLIP_SRC} controls />);
    const video = container.querySelector('video');

    expect(video).toBeTruthy();
    fireEvent.play(video!);

    expect(screen.getByRole('button', { name: mediaMessages.a11y.pause })).toBeInTheDocument();
  });

  it('shows play again after pause', () => {
    const { container } = render(<SilentVideo src={CLIP_SRC} controls />);
    const video = container.querySelector('video');

    fireEvent.play(video!);
    fireEvent.pause(video!);

    expect(screen.getByRole('button', { name: mediaMessages.a11y.play })).toBeInTheDocument();
  });

  it('does not attach src until the video is near the viewport', () => {
    const { container } = render(<SilentVideo src={CLIP_SRC} poster="https://cdn.example.com/poster.jpg" />);
    const video = container.querySelector('video');

    expect(video).not.toHaveAttribute('src');
    expect(video).toHaveAttribute('poster', 'https://cdn.example.com/poster.jpg');
    expect(video).toHaveAttribute('preload', 'none');
  });

  it('attaches src and autoplays after the video intersects', async () => {
    const { container } = render(<SilentVideo src={CLIP_SRC} autoPlay />);
    const video = container.querySelector('video');

    expect(video).not.toHaveAttribute('src');
    expect(observers).toHaveLength(1);

    act(() => {
      observers[0]?.trigger(true);
    });

    await waitFor(() => {
      expect(video).toHaveAttribute('src', CLIP_SRC);
    });

    fireEvent.canPlay(video!);

    await waitFor(() => {
      expect(playMock).toHaveBeenCalled();
    });
  });

  it('does not autoplay after intersecting when autoPlay is off', async () => {
    const { container } = render(<SilentVideo src={CLIP_SRC} />);
    const video = container.querySelector('video');

    act(() => {
      observers[0]?.trigger(true);
    });

    await waitFor(() => {
      expect(video).toHaveAttribute('src', CLIP_SRC);
    });

    fireEvent.canPlay(video!);

    expect(playMock).not.toHaveBeenCalled();
  });

  it('shows the play control when autoplay is rejected', async () => {
    playMock.mockRejectedValue(new Error('autoplay blocked'));

    const { container } = render(<SilentVideo src={CLIP_SRC} autoPlay controls />);
    const video = container.querySelector('video');

    act(() => {
      observers[0]?.trigger(true);
    });

    await waitFor(() => {
      expect(video).toHaveAttribute('src', CLIP_SRC);
    });

    fireEvent.canPlay(video!);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: mediaMessages.a11y.play })).toBeInTheDocument();
    });
  });
});
