import Link from 'next/link';

export function CartDrawer() {
  return (
    <aside
      className="rounded-palmonas-lg border border-stone-200 bg-white p-6"
      aria-label="Cart drawer"
    >
      <h2 className="font-display text-2xl">Your Cart</h2>
      <p className="mt-3 text-sm text-stone-600">Your selected pieces will appear here.</p>
      <Link
        href="/cart"
        className="rounded-palmonas-md mt-6 inline-flex bg-stone-900 px-4 py-2 text-sm font-medium text-white"
      >
        View cart
      </Link>
    </aside>
  );
}
