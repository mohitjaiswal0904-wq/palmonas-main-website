import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { BrandContentSection } from '@/components/layout/BrandContent/BrandContentSection';

describe('BrandContentSection', () => {
  it('renders gifting copy without a highlighted background', () => {
    const { container } = render(<BrandContentSection />);

    expect(screen.getByText('Gifting, Sorted — Jewellery Worth Sharing (or Keeping)')).toBeVisible();
    expect(container.querySelector('mark')).not.toBeInTheDocument();
  });

  it('keeps nested FAQ chevrons scoped to their own accordion', async () => {
    const user = userEvent.setup();
    render(<BrandContentSection />);

    const faqSectionSummary = screen.getByText('Frequently asked questions').closest('summary');
    expect(faqSectionSummary).not.toBeNull();
    await user.click(faqSectionSummary!);

    const questionSummary = screen
      .getByText('What is Demifine® jewellery, exactly?')
      .closest('summary');
    const questionDetails = questionSummary?.closest('details');
    const questionChevron = questionSummary?.lastElementChild;

    expect(questionDetails).not.toHaveAttribute('open');
    expect(questionChevron).toHaveClass('group-open/faq:rotate-180');

    await user.click(questionSummary!);

    expect(questionDetails).toHaveAttribute('open');
  });
});
