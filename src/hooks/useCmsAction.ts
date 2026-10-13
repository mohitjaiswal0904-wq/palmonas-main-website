'use client';

import { useCallback } from 'react';

import { useAppNavigate } from '@/hooks/navigation/useAppNavigate';
import { runCmsAction } from '@/lib/utils/run-cms-action';
import type { CmsAction } from '@/types/cms-section';

export function useCmsAction() {
  const { navigate } = useAppNavigate();

  return useCallback(
    (action: CmsAction) => {
      runCmsAction(action, { push: navigate });
    },
    [navigate],
  );
}
