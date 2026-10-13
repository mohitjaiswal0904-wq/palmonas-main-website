import { ShraddhasFavouriteStoryConnectorLine } from '@/components/shraddhas-favourite/ShraddhasFavouriteStoryConnectorLine';
import { ShraddhasFavouriteStoryMilestoneCard } from '@/components/shraddhas-favourite/ShraddhasFavouriteStoryMilestoneCard';
import { ShraddhasFavouriteStoryScallopTop } from '@/components/shraddhas-favourite/ShraddhasFavouriteStoryScallopTop';
import { ShraddhasFavouriteStoryTitle } from '@/components/shraddhas-favourite/ShraddhasFavouriteStoryTitle';
import {
  SHRADDHAS_FAVOURITE_PAGE_PADDING_CLASS,
  SHRADDHAS_FAVOURITE_STORY_GRADIENT_CLASS,
} from '@/components/shraddhas-favourite/shraddhas-favourite-constants';
import { shraddhasFavouriteStoryItems } from '@/config/shraddhas-favourite.config';

const MILESTONE_LAYOUT = [
  {
    rotationClass: '-rotate-6',
    offsetClass: 'tab:-translate-y-6 laptop:-translate-y-10',
  },
  {
    rotationClass: 'rotate-6',
    offsetClass: 'tab:translate-y-10 laptop:translate-y-14',
  },
  {
    rotationClass: '-rotate-3',
    offsetClass: 'tab:-translate-y-4 laptop:-translate-y-8',
  },
  {
    rotationClass: 'rotate-5',
    offsetClass: 'tab:translate-y-12 laptop:translate-y-16',
  },
] as const;

export function ShraddhasFavouriteStoryTimeline() {
  return (
    <section
      aria-label="Shraddha Kapoor X Palmonas story"
      className={[
        'tab:pt-10 tab:pb-8 laptop:pt-12 laptop:pb-10 relative w-full overflow-visible pt-8 pb-6',
        SHRADDHAS_FAVOURITE_STORY_GRADIENT_CLASS,
      ].join(' ')}
    >
      <ShraddhasFavouriteStoryScallopTop />

      <div className={`relative z-10 ${SHRADDHAS_FAVOURITE_PAGE_PADDING_CLASS}`}>
        <ShraddhasFavouriteStoryTitle />

        <div className="laptop:min-h-[300px] relative">
          <ShraddhasFavouriteStoryConnectorLine />

          <div className="tab:grid-cols-2 tab:gap-8 laptop:grid-cols-4 laptop:gap-6 relative z-10 grid grid-cols-1 gap-10">
            {shraddhasFavouriteStoryItems.map((item, index) => (
              <ShraddhasFavouriteStoryMilestoneCard
                key={item.title}
                item={item}
                rotationClass={MILESTONE_LAYOUT[index]?.rotationClass ?? ''}
                offsetClass={MILESTONE_LAYOUT[index]?.offsetClass ?? ''}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
