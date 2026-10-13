import type { ReactNode } from 'react';

import { BrandContentSection } from '@/components/layout/BrandContent/BrandContentSection';
import { FooterRenderer } from '@/components/layout/Footer/FooterRenderer';
import { HeaderRenderer } from '@/components/layout/Header/components/HeaderRenderer';
import {
  resolveShellFooterData,
  resolveShellHeaderData,
  transformShellAnnouncementBars,
} from '@/lib/utils/cms-page-layouts';
import { getFooterData } from '@/services/server/footer.service.server';
import { getHeaderData } from '@/services/server/header.service.server';
import { getSearchSuggestions } from '@/services/server/search-suggestions.service.server';
import type { CmsPageShellResponse } from '@/types/cms-page';

/**
 * Renders announcement bars + header from CMS shell layouts (slot API fallback).
 */
export async function CmsShellHeader({ shell }: { shell: CmsPageShellResponse }) {
  const [headerFallback, suggestions] = await Promise.all([
    getHeaderData(),
    getSearchSuggestions(),
  ]);

  const header = resolveShellHeaderData(shell, headerFallback);
  const announcementBars = transformShellAnnouncementBars(shell.layouts.announcement_bars ?? []);

  return (
    <HeaderRenderer
      config={header.config}
      items={header.items}
      rows={header.rows}
      platform="web"
      suggestions={suggestions}
      showDefaultAnnouncementBar={announcementBars.length === 0}
      cmsAnnouncementBars={announcementBars}
    />
  );
}

/**
 * Renders footer from CMS shell layouts (slot API fallback).
 */
export async function CmsShellFooter({ shell }: { shell: CmsPageShellResponse }) {
  const footerFallback = await getFooterData();
  const footer = resolveShellFooterData(shell, footerFallback);

  return (
    <>
      <BrandContentSection />
      <FooterRenderer config={footer.config} items={footer.items} platform="web" />
    </>
  );
}

interface CmsPageChromeProps {
  shell: CmsPageShellResponse;
  children: ReactNode;
}

/**
 * Renders CMS page-shell chrome (announcement bars, header, footer) around page content.
 */
export async function CmsPageChrome({ shell, children }: CmsPageChromeProps) {
  return (
    <>
      <CmsShellHeader shell={shell} />
      {children}
      <CmsShellFooter shell={shell} />
    </>
  );
}
