'use client';

import { useRouter } from 'next/navigation';

interface CollectionBackButtonProps {
  fallbackHref?: string;
}

export function CollectionBackButton({ fallbackHref = '/' }: CollectionBackButtonProps) {
  const router = useRouter();

  function handleBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className="flex h-10 w-8 items-center justify-center text-xl text-stone-950"
      aria-label="Go back"
    >
      <span aria-hidden="true">&lt;</span>
    </button>
  );
}
