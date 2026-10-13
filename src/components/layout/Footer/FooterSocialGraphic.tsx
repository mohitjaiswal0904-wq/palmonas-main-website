import { CmsMedia } from '@/components/cms/shared/CmsMedia';
import { SocialPlatformIcon } from '@/components/icons/SocialPlatformIcon';
import { resolveLayoutIconSources, resolveMediaUrl } from '@/lib/utils/cms-media';
import { resolveSocialPlatformKey } from '@/lib/utils/social-platform';
import type { LayoutItem } from '@/types/layout';

interface FooterSocialGraphicProps {
  item: LayoutItem;
  className?: string;
}

export function FooterSocialGraphic({ item, className = 'h-5 w-5' }: FooterSocialGraphicProps) {
  const sources = resolveLayoutIconSources(item);
  const imageUrl = item.resolved_icon_url ?? item.icon_url ?? resolveMediaUrl(sources[0] ?? {});

  if (imageUrl) {
    return (
      <CmsMedia url={imageUrl} sources={sources} alt="" className={`${className} object-contain`} />
    );
  }

  const platform = resolveSocialPlatformKey(
    item.social_platform,
    item.icon_key,
    typeof item.extra_metadata?.social_platform === 'string'
      ? item.extra_metadata.social_platform
      : undefined,
    typeof item.extra_metadata?.icon_key === 'string' ? item.extra_metadata.icon_key : undefined,
    item.label,
  );

  return <SocialPlatformIcon platform={platform} className={className} />;
}
