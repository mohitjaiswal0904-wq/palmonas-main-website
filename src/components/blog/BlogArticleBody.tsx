import { sanitizeCmsHtml } from '@/lib/utils/sanitize-cms-html';

interface BlogArticleBodyProps {
  html: string;
}

export function BlogArticleBody({ html }: BlogArticleBodyProps) {
  if (!html) {
    return null;
  }

  return (
    <div
      className="blog-article-body font-nunito-sans text-palmonas-ink [&_a]:text-palmonas-ink [&_a]:underline [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-xl [&_h3]:font-semibold [&_img]:mx-auto [&_img]:mb-4 [&_img]:h-auto [&_img]:max-w-full [&_p]:mb-4 [&_p]:text-base [&_p]:leading-7 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6"
      dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(html) }}
    />
  );
}
