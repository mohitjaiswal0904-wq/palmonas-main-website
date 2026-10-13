import { render, screen } from '@testing-library/react';

import { MediaSectionMedia } from '@/components/cms/MediaSectionMedia';

jest.mock('@/components/cms/shared/SilentVideo', () => ({
  SilentVideo: ({
    autoPlay,
    controls,
    loop,
    preload,
    src,
  }: {
    autoPlay?: boolean;
    controls?: boolean;
    loop?: boolean;
    preload?: string;
    src: string;
  }) => (
    <video
      data-testid="media-video"
      data-autoplay={String(Boolean(autoPlay))}
      data-controls={String(Boolean(controls))}
      data-loop={String(Boolean(loop))}
      data-preload={preload}
      src={src}
    />
  ),
}));

jest.mock('@/components/cms/shared/CmsResponsiveVideo', () => ({
  CmsResponsiveVideo: ({ autoPlay }: { autoPlay?: boolean }) => (
    <video data-testid="responsive-video" data-autoplay={String(Boolean(autoPlay))} />
  ),
}));

describe('MediaSectionMedia', () => {
  it('autoplays a single CMS video with lazy preload', () => {
    render(
      <MediaSectionMedia
        url="https://cdn.example.com/home.mp4"
        mediaType="video"
        poster="https://cdn.example.com/poster.jpg"
      />,
    );
    const video = screen.getByTestId('media-video');

    expect(video).toHaveAttribute('data-autoplay', 'true');
    expect(video).toHaveAttribute('data-loop', 'true');
    expect(video).toHaveAttribute('data-preload', 'none');
    expect(video).toHaveAttribute('data-controls', 'false');
  });

  it('autoplays width-bounded CMS videos', () => {
    render(
      <MediaSectionMedia
        url="https://cdn.example.com/home.mp4"
        mediaType="video"
        sources={[{ url: 'https://cdn.example.com/home-mobile.mp4', maxWidth: 767 }]}
      />,
    );

    expect(screen.getByTestId('responsive-video')).toHaveAttribute('data-autoplay', 'true');
  });

  it('does not render a video for image media', () => {
    render(
      <MediaSectionMedia url="https://cdn.example.com/hero.jpg" mediaType="image" alt="Hero" />,
    );

    expect(screen.queryByTestId('media-video')).not.toBeInTheDocument();
    expect(screen.queryByTestId('responsive-video')).not.toBeInTheDocument();
    expect(screen.getByAltText('Hero')).toBeInTheDocument();
  });

  it('does not render media when the url is not a video and type is omitted', () => {
    render(<MediaSectionMedia url="https://cdn.example.com/still.png" alt="Still" />);

    expect(screen.queryByTestId('media-video')).not.toBeInTheDocument();
    expect(screen.getByAltText('Still')).toBeInTheDocument();
  });
});
