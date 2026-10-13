import type { ReactNode } from 'react';

import { AccountFeaturePlaceholder } from '@/components/account/common/AccountFeaturePlaceholder';
import type { AccountPanelId } from '@/components/account/common/account-panels';
import { DeliveryAddressView } from '@/components/account/delivery-address/DeliveryAddressView';
import { OrdersList } from '@/components/account/order-history/OrdersList';
import { FaqsView } from '@/components/account/others/FaqsView';
import { HowToEarnView } from '@/components/account/others/HowToEarnView';
import { HowToRedeemView } from '@/components/account/others/HowToRedeemView';
import { PrivacyPolicyView } from '@/components/account/others/PrivacyPolicyView';
import { ReferAndEarnView } from '@/components/account/others/ReferAndEarnView';
import { SupportCenterView } from '@/components/account/others/SupportCenterView';
import { ProfileForm } from '@/components/account/profile/ProfileForm';
import { WalletView } from '@/components/account/wallet/WalletView';
import { AccountWishlistView } from '@/components/account/wishlist/AccountWishlistView';
import { accountMessages, isAccountPanelFeatureEnabled } from '@/config/account/account.config';

const PANEL_VIEWS: Record<AccountPanelId, () => ReactNode> = {
  'profile': () => <ProfileForm />,
  'order-history': () => <OrdersList />,
  'orders': () => <OrdersList />,
  'wishlist': () => <AccountWishlistView />,
  'wallet': () => <WalletView />,
  'delivery-address': () => <DeliveryAddressView />,
  'refer-and-earn': () => <ReferAndEarnView />,
  'support': () => <SupportCenterView />,
  'how-to-earn': () => <HowToEarnView />,
  'how-to-redeem': () => <HowToRedeemView />,
  'faqs': () => <FaqsView />,
  'privacy-policy': () => <PrivacyPolicyView />,
};

interface AccountPanelRendererProps {
  panelId: AccountPanelId;
}

/**
 * Render the client view for an in-page account panel.
 * Flag-gated Others panels fall back to a disabled placeholder.
 */
export function AccountPanelRenderer({ panelId }: AccountPanelRendererProps) {
  if (!isAccountPanelFeatureEnabled(panelId)) {
    return (
      <AccountFeaturePlaceholder
        title={accountMessages.disabled.title}
        description={accountMessages.disabled.description}
      />
    );
  }

  return PANEL_VIEWS[panelId]();
}
