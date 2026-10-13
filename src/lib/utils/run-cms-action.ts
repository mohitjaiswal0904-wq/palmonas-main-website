import { resolveCollectionPagePath } from '@/lib/utils/collection-page-path';
import type { CmsAction } from '@/types/cms-section';

export interface CmsActionRouter {
  push: (href: string) => void;
}

export function runCmsAction(action: CmsAction, router: CmsActionRouter): void {
  const actionType = action.action_type;
  const actionValue = action.action_value;

  if (!actionType || actionValue == null || actionValue === '') {
    return;
  }

  switch (actionType) {
    case 'collection':
      router.push(resolveCollectionPagePath(actionValue));
      break;
    case 'product':
      router.push(`/products/${actionValue}`);
      break;
    case 'external':
      window.open(actionValue, '_blank', 'noopener,noreferrer');
      break;
    case 'navigate':
    case 'redirect':
    case 'open':
      if (actionValue.startsWith('http')) {
        window.open(actionValue, '_blank', 'noopener,noreferrer');
      } else {
        router.push(actionValue);
      }
      break;
    default:
      break;
  }
}
