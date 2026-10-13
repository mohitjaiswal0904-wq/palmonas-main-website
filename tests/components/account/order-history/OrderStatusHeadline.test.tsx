import { render, screen } from '@testing-library/react';

import { OrderStatusHeadline } from '@/components/account/order-history/OrderStatusHeadline';
import {
  getOrderStatusRecipientTextClass,
  getOrderStatusTextClass,
} from '@/lib/order/order-format';

describe('OrderStatusHeadline', () => {
  it('renders delivered prefix in green and recipient name in black', () => {
    render(<OrderStatusHeadline status="delivered" deliveredTo="Priya Kumari" />);

    const prefix = screen.getByText('Delivered to');
    const recipient = screen.getByText('Priya');

    expect(prefix).toHaveClass(getOrderStatusTextClass('delivered'));
    expect(recipient).toHaveClass(getOrderStatusRecipientTextClass());
  });

  it('renders cancelled status in a single tone', () => {
    render(<OrderStatusHeadline status="cancelled" />);

    expect(screen.getByText('Cancelled')).toHaveClass(getOrderStatusTextClass('cancelled'));
    expect(screen.queryByText('Delivered to')).not.toBeInTheDocument();
  });
});
