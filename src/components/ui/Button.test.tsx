import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders children and handles click', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(<Button onClick={onClick}>Shop now</Button>);

    await user.click(screen.getByRole('button', { name: 'Shop now' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disables the button while loading', () => {
    render(
      <Button isLoading aria-label="Submit order">
        Submit
      </Button>,
    );

    expect(screen.getByRole('button', { name: 'Submit order' })).toBeDisabled();
    expect(screen.queryByText('Submit')).not.toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
  });
});
