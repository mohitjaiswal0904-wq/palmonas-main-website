import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SizeGuideContent } from '@/components/product/SizeGuideContent';
import { sizeGuideContent } from '@/config/product/product.config';

describe('SizeGuideContent', () => {
  const ringStep = sizeGuideContent.instructionsRing[0] ?? '';
  const fingerStep = sizeGuideContent.instructionsFinger[0] ?? '';

  it('renders measure-ring mode instructions by default', () => {
    render(<SizeGuideContent />);
    expect(ringStep.length).toBeGreaterThan(0);
    expect(screen.getByText(ringStep)).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'US Size' })).toBeInTheDocument();
  });

  it('renders size chart rows from config', () => {
    render(<SizeGuideContent />);
    expect(screen.getByText('15.1')).toBeInTheDocument();
    expect(screen.getByText('4.25')).toBeInTheDocument();
  });

  it('switches to finger instructions when finger tab pressed', async () => {
    const user = userEvent.setup();
    render(<SizeGuideContent />);
    await user.click(screen.getByRole('button', { name: sizeGuideContent.measureFinger }));
    expect(fingerStep.length).toBeGreaterThan(0);
    expect(screen.getByText(fingerStep)).toBeInTheDocument();
  });

  it('keeps ring tab selected styling accessible via aria-pressed', () => {
    render(<SizeGuideContent />);
    expect(screen.getByRole('button', { name: sizeGuideContent.measureRing })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
