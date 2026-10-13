import { render, screen, waitFor } from '@testing-library/react';

import { KwikPass } from '@/infrastructure/gokwik/KwikPass';
import { waitForKwikpassSdk } from '@/infrastructure/gokwik/identity';

jest.mock('@/infrastructure/gokwik/identity', () => ({
  getKwikpassCoreScriptUrl: () => 'https://example.com/kwikpass-core.js',
  getKwikpassMerchantScriptUrl: () => 'https://example.com/kp-merchant.js',
  KWIKPASS_INIT_SCRIPT_ID: 'kwikpass-init',
  KWIKPASS_CORE_SCRIPT_ID: 'kwikpass-core',
  KWIKPASS_MERCHANT_SCRIPT_ID: 'kwikpass-merchant',
  waitForKwikpassSdk: jest.fn().mockResolvedValue(true),
}));

jest.mock('@/infrastructure/gokwik/merchant-info', () => ({
  getKwikpassMerchantInfoInlineScript: () =>
    'window.merchantInfo = { ...(window.merchantInfo || {}), ...{"mid":"test-mid"} };',
}));

const mockWaitForKwikpassSdk = waitForKwikpassSdk as jest.MockedFunction<typeof waitForKwikpassSdk>;

jest.mock('next/script', () => ({
  __esModule: true,
  default: ({
    id,
    children,
    strategy,
    onReady,
  }: {
    id?: string;
    children?: string;
    strategy?: string;
    onReady?: () => void;
  }) => {
    if (id === 'kwikpass-merchant' && onReady) {
      queueMicrotask(() => onReady());
    }
    return children ? (
      <script data-testid={id} data-strategy={strategy}>
        {children}
      </script>
    ) : (
      <script data-testid={id} data-strategy={strategy} />
    );
  },
}));

describe('KwikPass', () => {
  beforeEach(() => {
    mockWaitForKwikpassSdk.mockResolvedValue(true);
  });

  it('renders all three scripts flat per integration doc', () => {
    render(<KwikPass />);

    expect(screen.getByTestId('kwikpass-init')).toBeInTheDocument();
    expect(screen.getByTestId('kwikpass-core')).toBeInTheDocument();
    expect(screen.getByTestId('kwikpass-merchant')).toBeInTheDocument();
  });

  it('uses lazyOnload strategy for init script', () => {
    render(<KwikPass />);

    expect(screen.getByTestId('kwikpass-init')).toHaveAttribute('data-strategy', 'lazyOnload');
  });

  it('fires onSdkReady after plugin SDK poll succeeds', async () => {
    const onSdkReady = jest.fn();

    render(<KwikPass onSdkReady={onSdkReady} />);

    await waitFor(() => {
      expect(mockWaitForKwikpassSdk).toHaveBeenCalled();
      expect(onSdkReady).toHaveBeenCalled();
    });
  });
});
