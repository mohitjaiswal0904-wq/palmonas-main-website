import styles from '@/components/emily-in-paris/EmilyInParisHashtagMarquee.module.css';
import { EMILY_IN_PARIS_HEADING_FONT_CLASS } from '@/components/emily-in-paris/emily-in-paris-constants';
import { emilyInParisHashtags } from '@/config/emily-in-paris.config';
import { cn } from '@/lib/utils/cn';

const MARQUEE_REPEAT_COUNT = 2;

function buildMarqueeItems(): string[] {
  const repeatedHashtags = Array.from(
    { length: MARQUEE_REPEAT_COUNT },
    () => emilyInParisHashtags,
  ).flat();

  return [...repeatedHashtags, ...repeatedHashtags];
}

export function EmilyInParisHashtagMarquee() {
  const marqueeItems = buildMarqueeItems();

  return (
    <section aria-label="Emily in Paris hashtags" className="tab:py-5 w-full overflow-hidden py-4">
      <div className={styles.viewport}>
        <div className={styles.track} aria-hidden="true">
          {marqueeItems.map((hashtag, index) => (
            <span
              key={`${hashtag}-${index}`}
              className={cn(
                'tab:px-10 tab:text-2xl laptop:text-3xl shrink-0 px-8 text-xl leading-none tracking-tight text-[#151515]',
                EMILY_IN_PARIS_HEADING_FONT_CLASS,
              )}
            >
              {hashtag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
