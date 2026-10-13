'use client';

import { AccountMenuCard } from '@/components/account/common/AccountMenuCard';
import { AccountOthersSection } from '@/components/account/common/AccountOthersSection';
import { AccountPanelSkeleton } from '@/components/account/common/AccountPanelSkeleton';
import { AccountProfileHeader } from '@/components/account/common/AccountProfileHeader';
import type {
  AccountPanelId,
  AccountSelectPanelHandler,
} from '@/components/account/common/account-panels';
import { useAuth } from '@/hooks/auth/useAuth';
import { useUserProfile } from '@/hooks/user';

interface AccountHubProps {
  activePanelId?: AccountPanelId | null;
  onSelectPanel: AccountSelectPanelHandler;
  onSelectProfile: () => void;
}

export function AccountHub({
  activePanelId = null,
  onSelectPanel,
  onSelectProfile,
}: AccountHubProps) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { profile } = useUserProfile();

  if (isAuthLoading) {
    return <AccountPanelSkeleton />;
  }

  const profileName = profile
    ? [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim()
    : '';
  const authName = user ? [user.firstName, user.lastName].filter(Boolean).join(' ').trim() : '';
  const displayName = profileName || authName || 'Guest User';

  return (
    <div className="w-full">
      <AccountProfileHeader
        name={displayName}
        isActive={activePanelId === 'profile'}
        onSelectProfile={onSelectProfile}
      />
      <AccountMenuCard
        className="mt-5"
        activePanelId={activePanelId}
        onSelectPanel={onSelectPanel}
      />
      <AccountOthersSection activePanelId={activePanelId} onSelectPanel={onSelectPanel} />
    </div>
  );
}
