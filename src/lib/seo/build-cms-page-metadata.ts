import { buildMetadata } from '@/lib/seo/build-metadata';
import { getCmsPageShell } from '@/services/server/cms-page.service.server';

export async function buildCmsPageMetadata(slug: string, path: string) {
  try {
    const shell = await getCmsPageShell(slug);

    return buildMetadata({
      title: shell.page.meta_title?.trim() || shell.page.name,
      description:
        shell.page.meta_description?.trim() || shell.page.description?.trim() || undefined,
      path,
    });
  } catch {
    return buildMetadata({
      title: 'Page not found',
      path,
      noIndex: true,
    });
  }
}
