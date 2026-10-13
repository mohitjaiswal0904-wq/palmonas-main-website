import { render, screen } from '@testing-library/react';

import { CareersAboutSection } from '@/components/careers/CareersAboutSection';
import { CareersHeroBanner } from '@/components/careers/CareersHeroBanner';
import { CareersWhyJoinSection } from '@/components/careers/CareersWhyJoinSection';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={props.alt} src={props.src} />
  ),
}));

describe('Careers static sections', () => {
  it('renders the hero banner with accessible label', () => {
    render(<CareersHeroBanner />);
    expect(screen.getByLabelText('Careers hero')).toBeInTheDocument();
    expect(screen.getAllByAltText(/Craft your career with Palmonas/i).length).toBeGreaterThan(0);
  });

  it('renders about heading and stats', () => {
    render(<CareersAboutSection />);
    expect(screen.getByRole('heading', { name: /Creating Timeless Beauty/i })).toBeInTheDocument();
    expect(screen.getByText('250+')).toBeInTheDocument();
    expect(screen.getByText('60+')).toBeInTheDocument();
    expect(screen.getByText('10lakh+')).toBeInTheDocument();
  });

  it('renders why-join benefit cards', () => {
    render(<CareersWhyJoinSection />);
    expect(
      screen.getByRole('heading', { name: /Where Passion Meets Purpose/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Creative Freedom')).toBeInTheDocument();
    expect(screen.getByText('Career Growth')).toBeInTheDocument();
    expect(screen.getByText('Wellness & Balance')).toBeInTheDocument();
    expect(screen.getByText('Inclusive Culture')).toBeInTheDocument();
  });

  it('exposes list semantics for benefit cards', () => {
    render(<CareersWhyJoinSection />);
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
  });
});
