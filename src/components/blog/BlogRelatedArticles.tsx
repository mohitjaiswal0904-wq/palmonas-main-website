import { BlogCard } from '@/components/blog/BlogCard';
import type { BlogArticle } from '@/types/blog';

interface BlogRelatedArticlesProps {
  articles: BlogArticle[];
}

export function BlogRelatedArticles({ articles }: BlogRelatedArticlesProps) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <section
      className="tab:px-6 laptop:px-10 px-3 py-10"
      aria-labelledby="related-articles-heading"
    >
      <h2
        id="related-articles-heading"
        className="font-nunito-sans text-palmonas-ink mb-10 text-center text-3xl font-normal"
      >
        Related articles
      </h2>
      <div className="laptop:grid-cols-4 tab:grid-cols-2 laptop:gap-6 grid grid-cols-1 gap-4">
        {articles.map((article) => (
          <BlogCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
