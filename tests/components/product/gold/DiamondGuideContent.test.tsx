import { render, screen } from '@testing-library/react';

import { DiamondGuideContent } from '@/components/product/gold/DiamondGuideContent';
import { diamondGuideContent } from '@/config/product/product.config';

describe('DiamondGuideContent', () => {
  it('renders Figma headline and save line', () => {
    render(<DiamondGuideContent />);
    expect(screen.getByText(/Luxury You Love/i)).toBeInTheDocument();
    expect(screen.getByText(/Value You Deserve/i)).toBeInTheDocument();
    expect(screen.getByText(diamondGuideContent.saveLine)).toBeInTheDocument();
  });

  it('renders Colour and Clarity section titles', () => {
    render(<DiamondGuideContent />);
    expect(screen.getByRole('heading', { name: 'Colour' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Clarity' })).toBeInTheDocument();
  });

  it('renders colour grade labels from config', () => {
    render(<DiamondGuideContent />);
    expect(screen.getByText('S-Z')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
    expect(screen.getAllByText(diamondGuideContent.colour.palmonasLabel).length).toBeGreaterThan(0);
  });

  it('renders clarity grade labels from config', () => {
    render(<DiamondGuideContent />);
    expect(screen.getByText('FL')).toBeInTheDocument();
    expect(screen.getByText('VS1/VS2')).toBeInTheDocument();
    expect(screen.getByText(diamondGuideContent.clarity.flawlessLabel)).toBeInTheDocument();
  });
});
