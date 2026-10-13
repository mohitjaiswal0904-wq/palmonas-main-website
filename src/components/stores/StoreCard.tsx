import Image from 'next/image';
import Link from 'next/link';

import {
  ClockIcon,
  DirectionIcon,
  LocationIcon,
  PhoneIcon,
  PalmonasLogo,
} from '@/components/icons';
import { analyticsCanonicalEvents } from '@/config/analytics/analytics.config';
import type { Store } from '@/types/store';

interface StoreCardProps {
  store: Store;
}

/**
 * Build a `tel:` href from a display phone number.
 *
 * @param phone - Store phone as shown in the UI.
 * @returns Dialable href with non-digits stripped.
 */
function formatPhoneHref(phone: string): string {
  return `tel:${phone.replace(/\D/g, '')}`;
}

/**
 * Resolve Google Maps / directions URL for a store.
 *
 * @param store - Store with optional map link and address fields.
 * @returns Absolute directions URL.
 */
function getDirectionsHref(store: Store): string {
  if (store.mapLink) {
    return store.mapLink;
  }

  const query = [store.name, store.address, store.city, store.state, store.pincode, store.country]
    .filter(Boolean)
    .join(', ');

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function StoreCard({ store }: StoreCardProps) {
  const primaryImage = store.images[0];
  const directionsHref = getDirectionsHref(store);

  return (
    <article className="shadow-palmonas-soft hover:shadow-palmonas-medium rounded-palmonas-xl border-palmonas-border bg-palmonas-surface flex h-full flex-col overflow-hidden border transition-shadow">
      <div className="bg-palmonas-surface relative aspect-video">
        {primaryImage ? (
          <Image
            src={primaryImage.image_url}
            alt={`${store.name} Palmonas store`}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="bg-palmonas-surface flex h-full items-center justify-center px-6">
            <PalmonasLogo className="h-10 max-w-[75%]" />
          </div>
        )}
      </div>
      <div className="tab:p-5 laptop:p-3 flex flex-1 flex-col p-4">
        <h2 className="text-palmonas-ink laptop:text-sm tab:text-lg line-clamp-2 text-lg leading-snug font-semibold">
          {store.name}
        </h2>

        <div className="text-palmonas-muted mt-1 flex flex-col gap-1">
          <div className="laptop:gap-2 flex gap-2">
            <LocationIcon className="text-palmonas-muted laptop:h-3.5 laptop:w-3.5 mt-0.5 h-4 w-4 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-palmonas-muted laptop:text-xs tab:text-base text-base leading-tight font-medium">
                {store.city}
              </p>
              <p className="text-palmonas-muted laptop:text-[11px] laptop:leading-4 tab:text-sm line-clamp-3 text-sm leading-5">
                {store.address}
              </p>
            </div>
          </div>

          {store.phone ? (
            <div className="laptop:gap-2 flex items-center gap-2">
              <PhoneIcon className="text-palmonas-muted laptop:h-3.5 laptop:w-3.5 h-4 w-4 shrink-0" />
              <Link
                href={formatPhoneHref(store.phone)}
                className="text-palmonas-ink laptop:text-[11px] tab:text-sm min-w-0 truncate text-sm leading-5 font-medium"
                aria-label={`Call ${store.name} at ${store.phone}`}
                data-analytics-event={analyticsCanonicalEvents.callStoreClicked}
                data-analytics-props={JSON.stringify({ store_name: store.name })}
              >
                {store.phone}
              </Link>
            </div>
          ) : null}

          {store.timing ? (
            <div className="laptop:gap-2 flex items-start gap-2">
              <ClockIcon className="text-palmonas-muted laptop:h-3.5 laptop:w-3.5 mt-0.5 h-4 w-4 shrink-0" />
              <p className="text-palmonas-ink laptop:text-[11px] laptop:leading-4 tab:text-sm line-clamp-2 text-sm leading-5">
                {store.timing}
              </p>
            </div>
          ) : null}
        </div>

        <div className="laptop:gap-1.5 laptop:pt-3 mt-auto grid grid-cols-2 gap-2 pt-4">
          {store.phone ? (
            <Link
              href={formatPhoneHref(store.phone)}
              className="rounded-palmonas-md border-palmonas-ink bg-palmonas-surface text-palmonas-ink hover:bg-palmonas-soft laptop:h-9 laptop:gap-1.5 laptop:px-2 laptop:text-xs tab:text-sm inline-flex h-11 shrink-0 items-center justify-center gap-2 border px-3 text-sm font-medium whitespace-nowrap transition-colors"
              aria-label={`Call ${store.name}`}
              data-analytics-event={analyticsCanonicalEvents.callStoreClicked}
              data-analytics-props={JSON.stringify({ store_name: store.name })}
            >
              <PhoneIcon className="laptop:h-3.5 laptop:w-3.5 h-4 w-4 shrink-0" />
              <span>Call</span>
            </Link>
          ) : (
            <div aria-hidden="true" />
          )}
          <Link
            href={directionsHref}
            target="_blank"
            rel="noreferrer"
            className="rounded-palmonas-md bg-palmonas-ink text-palmonas-surface hover:bg-palmonas-muted laptop:h-9 laptop:gap-1.5 laptop:px-2 laptop:text-xs tab:text-sm inline-flex h-11 shrink-0 items-center justify-center gap-2 px-3 text-sm font-medium whitespace-nowrap transition-colors"
            aria-label={`Get directions to ${store.name}`}
            data-analytics-event={analyticsCanonicalEvents.visitStoreClicked}
            data-analytics-props={JSON.stringify({ store_name: store.name })}
          >
            <DirectionIcon className="laptop:h-3.5 laptop:w-3.5 h-4 w-4 shrink-0" />
            <span>Directions</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
