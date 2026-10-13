import { render, screen } from '@testing-library/react';

import { CmsBuilderElement } from '@/components/cms/builder/CmsBuilderElement';
import type { CmsBuilderNode } from '@/types/cms-builder';

jest.mock('@/hooks/useCmsAction', () => ({
  useCmsAction: () => jest.fn(),
}));

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
      data-testid="builder-video"
      data-autoplay={String(Boolean(autoPlay))}
      data-controls={String(Boolean(controls))}
      data-loop={String(Boolean(loop))}
      data-preload={preload}
      src={src}
    />
  ),
}));

function videoNode(props: CmsBuilderNode['props']): CmsBuilderNode {
  return {
    id: 'video-1',
    type: 'video',
    props,
    children: [],
  };
}

describe('CmsBuilderElement video', () => {
  it('autoplays muted builder videos by default', () => {
    render(<CmsBuilderElement node={videoNode({ src: 'https://cdn.example.com/home.mp4' })} />);
    const video = screen.getByTestId('builder-video');

    expect(video).toHaveAttribute('data-autoplay', 'true');
    expect(video).toHaveAttribute('data-loop', 'true');
    expect(video).toHaveAttribute('data-preload', 'none');
    expect(video).toHaveAttribute('data-controls', 'false');
  });

  it('keeps autoplay when CMS sets autoplay true', () => {
    render(
      <CmsBuilderElement
        node={videoNode({ src: 'https://cdn.example.com/home.mp4', autoplay: true })}
      />,
    );

    expect(screen.getByTestId('builder-video')).toHaveAttribute('data-autoplay', 'true');
  });

  it('does not autoplay when CMS sets autoplay false', () => {
    render(
      <CmsBuilderElement
        node={videoNode({ src: 'https://cdn.example.com/home.mp4', autoplay: false })}
      />,
    );
    const video = screen.getByTestId('builder-video');

    expect(video).toHaveAttribute('data-autoplay', 'false');
    expect(video).toHaveAttribute('data-loop', 'false');
    expect(video).toHaveAttribute('data-controls', 'true');
  });

  it('renders no video when src is missing', () => {
    render(<CmsBuilderElement node={videoNode({})} />);

    expect(screen.queryByTestId('builder-video')).not.toBeInTheDocument();
  });
});
