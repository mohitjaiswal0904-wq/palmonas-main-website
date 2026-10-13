import { render, screen } from '@testing-library/react';

import { Input } from '@/components/ui/Input';

describe('Input', () => {
  it('defaults to text-base to avoid iOS Safari focus zoom', () => {
    render(<Input aria-label="Name" />);

    expect(screen.getByLabelText('Name').className).toContain('text-base');
    expect(screen.getByLabelText('Name').className).not.toContain('text-sm');
  });

  it('forwards ref and custom className', () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<Input ref={ref} aria-label="Email" className="custom-class" />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(screen.getByLabelText('Email').className).toContain('custom-class');
  });

  it('renders disabled state when disabled prop is set', () => {
    render(<Input aria-label="Locked" disabled />);

    expect(screen.getByLabelText('Locked')).toBeDisabled();
  });

  it('keeps accessible name when placeholder alone is set', () => {
    render(<Input aria-label="Search" placeholder="Type here" />);

    expect(screen.getByPlaceholderText('Type here')).toBeInTheDocument();
    expect(screen.getByLabelText('Search')).toBeInTheDocument();
  });
});
