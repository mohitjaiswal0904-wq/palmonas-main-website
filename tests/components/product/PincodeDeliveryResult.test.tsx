import { fireEvent, render, screen } from '@testing-library/react';

import { PincodeDeliveryResult } from '@/components/product/PincodeDeliveryResult';
import { productMessages, productTheme } from '@/config/product/product.config';
import type { EddResult } from '@/types/edd';

const baseResult: EddResult = {
  pincode: '221002',
  edd: '2026-09-19',
  shipsIn: '',
  orderWithin: '',
  status: 'success',
  store: {
    address: 'Koregaon Park',
    found: true,
    mapLink: 'https://maps.example.com',
    matchType: 'exact',
    phone: '9876543210',
    pincode: '221002',
    storeName: 'Koregaon Park',
  },
};

describe('PincodeDeliveryResult', () => {
  it('renders deliver-to pincode and change action', () => {
    const onChange = jest.fn();
    render(<PincodeDeliveryResult result={baseResult} onChange={onChange} />);

    expect(screen.getByText('221002')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(productMessages.a11y.changePincode));
    expect(onChange).toHaveBeenCalled();
  });

  it('shows store call and visit actions when store exists', () => {
    render(<PincodeDeliveryResult result={baseResult} onChange={jest.fn()} />);

    expect(screen.getByLabelText('Call Koregaon Park store')).toHaveAttribute(
      'href',
      'tel:9876543210',
    );
    expect(screen.getByLabelText('Call Koregaon Park store')).toHaveAttribute(
      'data-analytics-event',
      'call_store_clicked',
    );
    expect(screen.getByLabelText('Visit Koregaon Park store on map')).toHaveAttribute(
      'href',
      'https://maps.example.com',
    );
    expect(screen.getByLabelText('Visit Koregaon Park store on map')).toHaveAttribute(
      'data-analytics-event',
      'visit_store_clicked',
    );
  });

  it('sticks the gold EDD tooltip open until the shopper clicks outside', () => {
    render(
      <PincodeDeliveryResult
        result={baseResult}
        onChange={jest.fn()}
        productCategory="gold"
      />,
    );

    fireEvent.click(screen.getByLabelText(productMessages.eddInfoTooltip));
    expect(screen.getByRole('status')).toHaveTextContent(productMessages.eddInfoTooltip);

    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('uses the made-to-order EDD tooltip on gold', () => {
    render(
      <PincodeDeliveryResult
        result={baseResult}
        onChange={jest.fn()}
        productCategory="gold"
      />,
    );

    fireEvent.click(screen.getByLabelText(productMessages.eddInfoTooltip));
    expect(screen.getByRole('status')).toHaveTextContent(productMessages.eddInfoTooltip);
  });

  it('does not surface order_within in the gold delivery row', () => {
    render(
      <PincodeDeliveryResult
        result={{ ...baseResult, orderWithin: '0 hours 59 minutes', store: null }}
        onChange={jest.fn()}
        productCategory="gold"
      />,
    );

    expect(screen.queryByText(/0 hours 59 minutes/)).toBeNull();
    expect(screen.queryByText(productMessages.nowLabel)).toBeNull();
  });

  it('does not show the EDD info icon on demifine', () => {
    render(<PincodeDeliveryResult result={baseResult} onChange={jest.fn()} />);

    expect(screen.queryByLabelText(productMessages.eddInfoTooltip)).toBeNull();
  });

  it('keeps gold tooltip outside overflow-hidden so panel is not clipped', () => {
    const { container } = render(
      <PincodeDeliveryResult
        result={{ ...baseResult, store: null }}
        onChange={jest.fn()}
        productCategory="gold"
      />,
    );

    fireEvent.click(screen.getByLabelText(productMessages.eddInfoTooltip));
    const tooltip = screen.getByRole('status');
    const clipped = container.querySelector('.overflow-hidden');

    expect(clipped).toBeNull();
    expect(tooltip).toBeInTheDocument();
  });

  it('uses a cream wash and ink copy for the nearest-store strip on demifine', () => {
    render(<PincodeDeliveryResult result={baseResult} onChange={jest.fn()} />);

    const heading = screen.getByText(/Visit your nearest store/).closest('div');
    expect(heading).toHaveStyle({ backgroundColor: productTheme.nowSurface });
    expect(heading).not.toHaveStyle({ backgroundImage: productTheme.nowBannerGradient });
    expect(screen.getByText(/Visit your nearest store/)).toHaveStyle({
      color: productTheme.ink,
    });
    expect(screen.getByLabelText('Call Koregaon Park store')).toHaveStyle({
      color: productTheme.ink,
    });
  });

  it('uses maroon store strip chrome on gold PDP', () => {
    render(
      <PincodeDeliveryResult
        result={baseResult}
        onChange={jest.fn()}
        productCategory="gold"
      />,
    );

    const heading = screen.getByText(/Visit your nearest store/).closest('div');
    expect(heading).toHaveStyle({ backgroundColor: productTheme.gold.accent });
    expect(screen.getByLabelText('Call Koregaon Park store')).toHaveStyle({
      color: productTheme.gold.accent,
    });
  });

  it('hides store row when store payload is missing', () => {
    render(
      <PincodeDeliveryResult result={{ ...baseResult, store: null }} onChange={jest.fn()} />,
    );

    expect(screen.queryByText(productMessages.callStore)).toBeNull();
    expect(screen.getByText('221002')).toHaveStyle({ color: productTheme.ink });
  });

  it('renders NOW strip and order-within copy on demifine when order_within is present', () => {
    render(
      <PincodeDeliveryResult
        result={{ ...baseResult, orderWithin: '0 hours 59 minutes', store: null }}
        onChange={jest.fn()}
      />,
    );

    expect(screen.getByText(productMessages.nowLabel)).toHaveClass('text-xs');
    expect(screen.getByText(/0 hours 59 minutes/).parentElement).toHaveClass('text-sm');
  });

  it('hides order-within and ships_in copy when API returns ships_in only on demifine', () => {
    render(
      <PincodeDeliveryResult
        result={{ ...baseResult, shipsIn: 'Ships in 1 days.', store: null }}
        onChange={jest.fn()}
      />,
    );

    expect(screen.queryByText(/Ships in 1 days\./)).toBeNull();
    expect(screen.queryByText(productMessages.orderWithin.trim())).toBeNull();
  });
});
