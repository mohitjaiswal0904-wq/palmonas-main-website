import { render, screen } from '@testing-library/react';
import type { AnchorHTMLAttributes, ReactNode } from 'react';

import { DrawerFooter } from '@/components/layout/drawer/DrawerFooter';

jest.mock('@/components/ui/AppLink', () => ({
  AppLink: ({
    href,
    children,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('DrawerFooter', () => {
  it('renders About Us, Stores, Support, and Return links', () => {
    render(<DrawerFooter onClose={jest.fn()} />);

    expect(screen.getByRole('link', { name: 'About Us' })).toHaveAttribute('href', '/about');
    expect(screen.getByRole('link', { name: 'Stores' })).toHaveAttribute('href', '/palmonas-stores');
    expect(screen.getByRole('link', { name: 'Support' })).toHaveAttribute(
      'href',
      'https://support.palmonas.com/',
    );
    expect(screen.getByRole('link', { name: /Return/i })).toBeInTheDocument();
  });

  it('does not inject a Careers link', () => {
    render(<DrawerFooter onClose={jest.fn()} />);
    expect(screen.queryByRole('link', { name: 'Careers' })).not.toBeInTheDocument();
  });

  it('calls onClose when About Us is clicked', () => {
    const onClose = jest.fn();
    render(<DrawerFooter onClose={onClose} />);

    screen.getByRole('link', { name: 'About Us' }).click();
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when Stores is clicked', () => {
    const onClose = jest.fn();
    render(<DrawerFooter onClose={onClose} />);

    screen.getByRole('link', { name: 'Stores' }).click();
    expect(onClose).toHaveBeenCalled();
  });
});
