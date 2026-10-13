'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { CartAddressBar } from '@/components/cart/CartAddressBar';
import {
  CartCheckoutSidebar,
  CartMobileCheckoutSections,
} from '@/components/cart/CartCheckoutSidebar';
// import { CartDispatchInfoBanner } from '@/components/cart/CartDispatchInfoBanner';
import { CartEmptyState } from '@/components/cart/CartEmptyState';
import { CartFetchingSkeleton } from '@/components/cart/CartFetchingSkeleton';
import { CartGiftWrapOption } from '@/components/cart/CartGiftWrapOption';
import { CartHeader } from '@/components/cart/CartHeader';
import { CartItemCard } from '@/components/cart/CartItemCard';
import { CartMobileStickyFooter } from '@/components/cart/CartMobileStickyFooter';
import type { AddressFormValues } from '@/components/cart/sheets/AddressForm';
import type { CartAddress } from '@/components/cart/sheets/AddressList';
import { AddressSelectSheet } from '@/components/cart/sheets/AddressSelectSheet';
import {
  cartConfig,
  cartMessages,
  cartTheme,
  isCartFeatureEnabled,
} from '@/config/cart/cart.config';
import { themeFonts } from '@/config/theme/fonts';
import { useRequireAuth } from '@/hooks/auth/useAuth';
import { useCartWalletPayable } from '@/hooks/cart/useCartWalletPayable';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/useToast';
import { useAddWishlistItemMutation } from '@/hooks/wishlist/useWishlistMutations';
import { checkoutProvider } from '@/infrastructure/checkout';
import { isLoginCancelledError } from '@/lib/auth/login-cancelled';
import {
  clubCartItemsByVariant,
  planClubbedQuantityChange,
  planClubbedRemove,
  type ClubbedCartItem,
} from '@/lib/cart/club-cart-items';
import {
  findGiftWrapLineId,
  findGiftWrapQuantity,
  isGiftWrapLine,
  sumCartQuantityExcludingGiftWrap,
} from '@/lib/cart/gift-wrap';
import { revealAboveStickyDelta } from '@/lib/cart/reveal-above-sticky';
import { cn } from '@/lib/utils/cn';
/** Main cart page — Figma desktop/mobile layout. */
export function CartPageContent() {
  const {
    cart,
    loading,
    isFetching,
    isEmpty,
    showEmpty,
    isMutating,
    cartMergeInProgress,
    summary,
    actions,
    updatingLineId,
    removingLineId,
    discounts,
  } = useCart();
  const { guardApi } = useRequireAuth();
  const { showSuccess, showError, showWarning } = useToast();
  const addWishlistMutation = useAddWishlistItemMutation();
  const [walletToggled, setWalletToggled] = useState(false);
  const giftWrapVariantId = cartConfig.mock.giftWrap?.variantId ?? '';
  const {
    walletApplied,
    payableTotal,
    loading: walletLoading,
    balance: walletBalance,
  } = useCartWalletPayable(summary.payableTotal ?? summary.total, walletToggled);
  const [addressOpen, setAddressOpen] = useState(false);
  const [addresses, setAddresses] = useState<CartAddress[]>(
    () => cartConfig.mock.addresses as CartAddress[],
  );
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>(undefined);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [mobileFooterHeight, setMobileFooterHeight] = useState<number>(
    cartTheme.mobileStickyFooterFallbackPx,
  );
  const checkoutInFlightRef = useRef(false);

  const lastMobileFooterHeightRef = useRef(0);
  const handleMobileFooterHeight = useCallback((height: number) => {
    if (height < 48) {
      return;
    }

    const grew = height > lastMobileFooterHeightRef.current + 2;
    lastMobileFooterHeightRef.current = height;
    setMobileFooterHeight(height);

    if (!grew) {
      return;
    }

    // Footer grew over Order Summary — scroll so the card sits fully above it.
    requestAnimationFrame(() => {
      const delta = revealAboveStickyDelta(
        document.querySelector('[data-testid="cart-price-breakdown"]'),
        document.querySelector('[data-testid="cart-mobile-sticky-footer"]'),
        cartTheme.mobileStickyFooterGapPx,
      );
      if (delta > 0) {
        window.scrollBy({ top: delta, left: 0, behavior: 'smooth' });
      }
    });
  }, []);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  const giftWrapLineId = useMemo(
    () => findGiftWrapLineId(cart?.items ?? [], giftWrapVariantId),
    [cart?.items, giftWrapVariantId],
  );
  const giftWrapEnabled = giftWrapLineId !== null;
  const targetWrapQty = useMemo(
    () => sumCartQuantityExcludingGiftWrap(cart?.items ?? [], giftWrapVariantId),
    [cart?.items, giftWrapVariantId],
  );

  const clubbedItems = useMemo(() => {
    const items = (cart?.items ?? []).filter((item) => !isGiftWrapLine(item, giftWrapVariantId));
    return clubCartItemsByVariant(items);
  }, [cart?.items, giftWrapVariantId]);

  const availableDiscountOffers = discounts?.availableDiscounts ?? [];
  const isClubbedItemUpdating = useCallback(
    (item: ClubbedCartItem) =>
      item.lines.some((line) => updatingLineId === line.id || removingLineId === line.id),
    [removingLineId, updatingLineId],
  );

  const handleGiftWrapChange = useCallback(
    async (checked: boolean) => {
      if (!giftWrapVariantId || isMutating) return;
      try {
        if (checked) {
          const qty = sumCartQuantityExcludingGiftWrap(cart?.items ?? [], giftWrapVariantId);
          if (qty <= 0) return;
          const existingId = findGiftWrapLineId(cart?.items ?? [], giftWrapVariantId);
          if (existingId) {
            await actions.updateQuantity(existingId, qty);
          } else {
            await actions.addItem(giftWrapVariantId, qty);
          }
        } else {
          const lineId = findGiftWrapLineId(cart?.items ?? [], giftWrapVariantId);
          if (lineId) await actions.removeItem(lineId);
        }
      } catch {
        // Toast handled in useCart
      }
    },
    [actions, cart, giftWrapVariantId, isMutating],
  );

  // Keep gift-wrap qty aligned with sum of non-wrap line quantities while enabled.
  useEffect(() => {
    if (!giftWrapLineId || !giftWrapVariantId || isMutating) return;
    const currentQty = findGiftWrapQuantity(cart?.items ?? [], giftWrapVariantId);
    if (targetWrapQty <= 0) {
      void actions.removeItem(giftWrapLineId);
      return;
    }
    if (currentQty !== targetWrapQty) {
      void actions.updateQuantity(giftWrapLineId, targetWrapQty);
    }
  }, [actions, cart, giftWrapLineId, giftWrapVariantId, isMutating, targetWrapQty]);

  const handleAddAddress = (values: AddressFormValues) => {
    const id = `addr-${Date.now()}`;
    setAddresses((prev) => [...prev, { id, ...values }]);
    setSelectedAddressId(id);
  };

  const handleMoveToWishlist = useCallback(
    async (item: ClubbedCartItem) => {
      try {
        await guardApi(() => addWishlistMutation.mutateAsync(item.product.id), {
          apiId: 'wishlist.add',
        });
        await actions.applyClubbedCartMutations(planClubbedRemove(item));
        showSuccess(cartMessages.toasts.moveToWishlist);
      } catch (err) {
        if (isLoginCancelledError(err)) {
          // Re-throw so CartItemCard clears the CTA spinner and keeps the confirm modal open.
          throw err;
        }
        const message = err instanceof Error ? err.message : String(err);
        if (!message.toLowerCase().includes('already in wishlist')) {
          showError(message);
        }
      }
    },
    [actions, addWishlistMutation, guardApi, showError, showSuccess],
  );

  /** Opens GoKwik checkout for guests and logged-in users — no KwikPass login prompt. */
  const handleCheckout = () => {
    if (checkoutInFlightRef.current || checkoutLoading) {
      return;
    }

    checkoutInFlightRef.current = true;
    void (async () => {
      try {
        setCheckoutLoading(true);
        const checkout = await actions.prepareCheckout();
        if (!checkout.isValid) {
          showWarning(cartMessages.validation.outOfStock);
          return;
        }
        await checkoutProvider.openCheckout({
          cartId: checkout.cartId,
          source: 'cart',
          checkoutUrl: checkout.cart.checkoutUrl,
        });
      } catch (err) {
        showError(err instanceof Error ? err.message : cartMessages.errors.checkout);
      } finally {
        checkoutInFlightRef.current = false;
        setCheckoutLoading(false);
      }
    })();
  };

  if (cartMergeInProgress || (loading && !cart)) {
    return <CartFetchingSkeleton />;
  }

  // Don't wait on auth bootstrap — a stuck `isBootstrapping` left the skeleton up forever.
  // First fetch still uses `loading && !cart` / `isFetching && !cart` above and below.
  if (isEmpty && !cart && (isFetching || cartMergeInProgress)) {
    return <CartFetchingSkeleton />;
  }

  if (showEmpty) {
    return (
      <div className="flex flex-1 flex-col">
        <CartHeader variant="empty" itemCount={cart?.totalItems ?? summary.totalItems} />
        <div className="flex flex-1 flex-col justify-center">
          <CartEmptyState />
        </div>
      </div>
    );
  }

  const checkoutBase = payableTotal ?? summary.payableTotal ?? summary.total;

  return (
    <>
      <div
        className="laptop:pb-10"
        style={{
          ['--cart-sticky-clearance' as string]: `${mobileFooterHeight + cartTheme.mobileStickyFooterGapPx}px`,
        }}
      >
        <CartHeader itemCount={cart?.totalItems ?? summary.totalItems} />
        <div className="laptop:grid laptop:grid-cols-[minmax(0,1fr)_360px] laptop:items-start laptop:gap-x-5">
          <div className="laptop:hidden mb-4">
            {isCartFeatureEnabled('address') ? (
              <CartAddressBar
                variant="mobile"
                name={selectedAddress?.fullName}
                addressLine={
                  selectedAddress
                    ? `${selectedAddress.line1}, ${selectedAddress.city} ${selectedAddress.zip}`
                    : undefined
                }
                onChange={() => setAddressOpen(true)}
              />
            ) : null}
          </div>
          <div className="laptop:col-start-1 laptop:row-start-1 laptop:mb-6 mb-4 space-y-4">
            {/* <CartDispatchInfoBanner /> */}
            <h2
              className={cn(themeFonts.sans.className, cartTheme.orderSummaryTitleClass)}
              style={{ color: cartTheme.orderSummaryValue }}
              data-testid="cart-order-summary-heading"
            >
              {cartMessages.orderSummary}
            </h2>
          </div>
          <div
            className="laptop:col-start-1 laptop:row-start-2 min-w-0 space-y-3"
            data-testid="cart-line-items-column"
          >
            <div className="relative space-y-3">
              {isMutating ? (
                <div
                  className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/70"
                  aria-busy="true"
                  data-testid="cart-items-mutation-overlay"
                >
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e2e8f0] border-t-[#151515]" />
                </div>
              ) : null}
              {clubbedItems.map((item) => (
                <CartItemCard
                  key={item.key}
                  name={item.product.name}
                  handle={item.product.handle}
                  image={item.product.primaryImage}
                  variantTitle={item.product.variantTitle}
                  price={
                    !item?.lineLevelTotalDiscount
                      ? item.price
                      : item.price - item.lineLevelTotalDiscount / (100 * item.quantity)
                  }
                  originalPrice={item.price}
                  quantity={item.quantity}
                  currency={cart?.currency}
                  isFree={item.isFree}
                  isAvailable={item.isAvailable}
                  freeQuantity={item.freeQuantity}
                  applicableDiscounts={item.applicableDiscounts}
                  lineDiscountAllocations={item.lineDiscountAllocations}
                  availableOffers={availableDiscountOffers}
                  isUpdating={isMutating || isClubbedItemUpdating(item)}
                  onRemove={() => void actions.applyClubbedCartMutations(planClubbedRemove(item))}
                  onMoveToWishlist={() => handleMoveToWishlist(item)}
                  onDecrease={() =>
                    void actions.applyClubbedCartMutations(
                      planClubbedQuantityChange(item, item.quantity - 1),
                    )
                  }
                  onIncrease={() =>
                    void actions.applyClubbedCartMutations(
                      planClubbedQuantityChange(item, item.quantity + 1),
                    )
                  }
                />
              ))}
            </div>
            <CartGiftWrapOption
              checked={giftWrapEnabled}
              onChange={(checked) => void handleGiftWrapChange(checked)}
            />
            <CartMobileCheckoutSections
              summary={summary}
              currency={cart?.currency}
              walletApplied={walletApplied}
              payableTotal={payableTotal}
              walletLoading={walletLoading}
              walletBalance={walletBalance}
              walletToggled={walletToggled}
              onWalletToggle={setWalletToggled}
              giftWrapTotal={0}
            />
          </div>
          <CartCheckoutSidebar
            summary={summary}
            currency={cart?.currency}
            selectedAddress={
              selectedAddress
                ? {
                    name: selectedAddress.fullName,
                    line: [selectedAddress.line1, selectedAddress.city, selectedAddress.zip].join(
                      ', ',
                    ),
                  }
                : undefined
            }
            onAddressChange={() => setAddressOpen(true)}
            onCheckout={handleCheckout}
            checkoutLoading={checkoutLoading}
            walletApplied={walletApplied}
            payableTotal={payableTotal}
            walletLoading={walletLoading}
            walletBalance={walletBalance}
            walletToggled={walletToggled}
            onWalletToggle={setWalletToggled}
            giftWrapTotal={0}
            checkoutTotal={checkoutBase}
          />
        </div>
        <div
          className="laptop:hidden"
          style={{ height: mobileFooterHeight + cartTheme.mobileStickyFooterGapPx }}
          data-testid="cart-mobile-footer-clearance"
          aria-hidden
        />
      </div>
      <CartMobileStickyFooter
        total={checkoutBase}
        cartTotal={checkoutBase}
        currency={cart?.currency}
        loading={checkoutLoading}
        onCheckout={handleCheckout}
        onHeightChange={handleMobileFooterHeight}
      />
      <AddressSelectSheet
        open={addressOpen}
        onClose={() => setAddressOpen(false)}
        addresses={addresses}
        selectedId={selectedAddressId}
        onSelect={setSelectedAddressId}
        onAddAddress={handleAddAddress}
      />
    </>
  );
}
