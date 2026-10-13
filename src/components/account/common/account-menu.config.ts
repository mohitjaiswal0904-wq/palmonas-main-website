import type { ComponentType } from 'react';

import { ACCOUNT_ROUTES } from '@/components/account/common/account-routes';
import { AccountWishlistIcon } from '@/components/account/common/icons/AccountWishlistIcon';
import { DeliveryAddressIcon } from '@/components/account/common/icons/DeliveryAddressIcon';
import { OrderHistoryIcon } from '@/components/account/common/icons/OrderHistoryIcon';
import { PlanOfPurchaseIcon } from '@/components/account/common/icons/PlanOfPurchaseIcon';
import { WalletIcon } from '@/components/account/common/icons/WalletIcon';
import { isAccountPanelFeatureEnabled } from '@/config/account/account.config';

export interface AccountPrimaryMenuItem {
  id: string;
  title: string;
  description: string;
  href: string;
  Icon: ComponentType<{ className?: string }>;
}

export interface AccountOthersMenuItem {
  id: string;
  title: string;
  href: string;
  action?: 'navigate' | 'logout';
}

export const ACCOUNT_PRIMARY_MENU_ITEMS: AccountPrimaryMenuItem[] = [
  {
    id: 'order-history',
    title: 'Order History',
    description: 'View order details',
    href: ACCOUNT_ROUTES.orderHistory,
    Icon: OrderHistoryIcon,
  },
  {
    id: 'plan-of-purchase',
    title: 'Plan of Purchase',
    description: 'A flexible monthly saving plan for your dream jewellery',
    href: ACCOUNT_ROUTES.planOfPurchase,
    Icon: PlanOfPurchaseIcon,
  },
  {
    id: 'wishlist',
    title: 'Wishlist',
    description: 'All your favourites',
    href: ACCOUNT_ROUTES.wishlist,
    Icon: AccountWishlistIcon,
  },
  {
    id: 'wallet',
    title: 'Wallet',
    description: 'Recharge your wallet, use cash back received from rewards and orders',
    href: ACCOUNT_ROUTES.wallet,
    Icon: WalletIcon,
  },
  {
    id: 'delivery-address',
    title: 'Delivery Addresses',
    description: 'Edit, add, delete your addresses',
    href: ACCOUNT_ROUTES.deliveryAddress,
    Icon: DeliveryAddressIcon,
  },
];

const ACCOUNT_OTHERS_MENU_ITEMS_ALL: AccountOthersMenuItem[] = [
  { id: 'refer-and-earn', title: 'Refer & Earn', href: ACCOUNT_ROUTES.referAndEarn },
  { id: 'support', title: 'Palmonas Support Center', href: ACCOUNT_ROUTES.support },
  { id: 'how-to-earn', title: 'How To Earn', href: ACCOUNT_ROUTES.howToEarn },
  { id: 'how-to-redeem', title: 'How To Redeem', href: ACCOUNT_ROUTES.howToRedeem },
  { id: 'faqs', title: 'FAQs', href: ACCOUNT_ROUTES.faqs },
  { id: 'privacy-policy', title: 'Privacy Policy', href: ACCOUNT_ROUTES.privacyPolicy },
  { id: 'logout', title: 'Logout', href: '/', action: 'logout' },
];

/**
 * Others menu filtered by `account.config.json` feature flags (logout always kept).
 */
export const ACCOUNT_OTHERS_MENU_ITEMS: AccountOthersMenuItem[] =
  ACCOUNT_OTHERS_MENU_ITEMS_ALL.filter((item) => {
    if (item.action === 'logout') {
      return true;
    }
    return isAccountPanelFeatureEnabled(item.id);
  });
