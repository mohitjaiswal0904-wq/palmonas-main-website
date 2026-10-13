import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PopSavingsCalculator } from '@/components/pop/PopSavingsCalculator';

describe('PopSavingsCalculator', () => {
  it('keeps raw digits while typing and snaps on blur', async () => {
    const user = userEvent.setup();
    render(
      <PopSavingsCalculator primaryLabel="Start Plan" onPrimaryAction={jest.fn()} initialAmount={3000} />,
    );

    const input = screen.getByLabelText('Monthly instalment amount');

    expect(input).toHaveValue('₹3,000');

    await user.click(input);
    expect(input).toHaveValue('3000');

    await user.clear(input);
    await user.type(input, '4000');
    expect(input).toHaveValue('4000');

    await user.tab();
    expect(input).toHaveValue('₹4,000');
  });

  it('does not append digits from formatted currency while editing', async () => {
    const user = userEvent.setup();
    render(
      <PopSavingsCalculator primaryLabel="Start Plan" onPrimaryAction={jest.fn()} initialAmount={3000} />,
    );

    const input = screen.getByLabelText('Monthly instalment amount');

    await user.click(input);
    await user.clear(input);
    await user.type(input, '5');

    expect(input).toHaveValue('5');
    expect(input).not.toHaveValue('30005');
  });

  it('shows a usable amount field and keeps the CTA on the primary button', () => {
    render(
      <PopSavingsCalculator primaryLabel="Calculate" onPrimaryAction={jest.fn()} initialAmount={3000} />,
    );

    const input = screen.getByLabelText('Monthly instalment amount');
    expect(input).toBeVisible();
    expect(input).toHaveValue('₹3,000');

    expect(screen.getByRole('button', { name: 'Calculate' })).toBeVisible();

    // Mobile-first: adornment uses `hidden lg:inline` so it does not crush the amount field.
    const adornment = screen.getByText('Start Investing');
    expect(adornment).toHaveAttribute('aria-hidden', 'true');
    expect(adornment).toHaveClass('hidden', 'lg:inline');
  });

  it('snaps empty or invalid blur input back to the minimum instalment', async () => {
    const user = userEvent.setup();
    render(
      <PopSavingsCalculator primaryLabel="Calculate" onPrimaryAction={jest.fn()} initialAmount={3000} />,
    );

    const input = screen.getByLabelText('Monthly instalment amount');

    await user.click(input);
    await user.clear(input);
    await user.tab();

    expect(input).toHaveValue('₹1,000');
  });
});
