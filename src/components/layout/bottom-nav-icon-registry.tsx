import {
  BottomNavBestsellersIcon,
  BottomNavCartIcon,
  BottomNavDemifineIcon,
  BottomNavGoldIcon,
  BottomNavHomeIcon,
  BottomNavOffersIcon,
  BottomNavGiftsIcon,
  BackIcon,
  BottomNavProposalRingIcon,
  BottomNavNineKTIcon,
  BottomNavRakhiIcon,
} from '@/components/icons/BottomNavIcons';

interface BottomNavIconProps {
  iconKey: string;
  active?: boolean;
  className?: string;
}

/** Renders a bottom-nav icon by config key using static component references. */
export function BottomNavIcon({ iconKey, active, className }: BottomNavIconProps) {
  switch (iconKey) {
    case 'home':
      return <BottomNavHomeIcon active={active} className={className} />;
    case 'demifine':
      return <BottomNavDemifineIcon active={active} className={className} />;
    case 'gold':
      return <BottomNavGoldIcon active={active} className={className} />;
    case 'bestsellers':
      return <BottomNavBestsellersIcon active={active} className={className} />;
    case 'offers':
      return <BottomNavOffersIcon active={active} className={className} />;
    case 'cart':
      return <BottomNavCartIcon active={active} className={className} />;
    case 'gifts':
      return <BottomNavGiftsIcon active={active} className={className} />;
    case 'back':
      return <BackIcon active={active} className={className} />;
    case 'proposal-ring':
      return <BottomNavProposalRingIcon active={active} className={className} />;
    case 'nine-kt':
      return <BottomNavNineKTIcon active={active} className={className} />;
    case 'rakhi':
      return <BottomNavRakhiIcon active={active} className={className} />;
    default:
      return null;
  }
}
