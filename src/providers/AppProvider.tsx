'use client';

import type { ReactNode } from 'react';
import { Suspense } from 'react';

import { AddToCartFlyLayer } from '@/components/cart/AddToCartFlyLayer';
import { LandingUtmCapture } from '@/components/cart/LandingUtmCapture';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { PincodeModal } from '@/components/layout/PincodeModal';
import { RouteScrollReset } from '@/components/layout/RouteScrollReset';
import { ChooseOptionsSheetHost } from '@/components/product/ChooseOptionsSheetHost';
import { SizeGuideSheetHost } from '@/components/product/SizeGuideSheetHost';
import { AnalyticsIdentityTracker } from '@/infrastructure/analytics/AnalyticsIdentityTracker';
import { AnalyticsProvider } from '@/infrastructure/analytics/AnalyticsProvider';
import { PalmonasConsoleArtLogger } from '@/infrastructure/console/PalmonasConsoleArtLogger';
import { HapticClickTracker } from '@/infrastructure/haptics';
import { CartProvider } from '@/providers/CartProvider';
import { PincodeProvider } from '@/providers/PincodeProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import { AuthProvider } from '@/providers/auth/AuthProvider';
import { HomePageCategoryNavigationProvider } from '@/providers/home/HomePageCategoryNavigationProvider';
import { NavigationPendingProvider } from '@/providers/navigation/NavigationPendingProvider';
import { ChooseOptionsProvider } from '@/providers/product/ChooseOptionsProvider';
import { SizeGuideProvider } from '@/providers/product/SizeGuideProvider';

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <ToastProvider>
          <AnalyticsProvider>
            <AuthProvider>
              <HapticClickTracker />
              <AnalyticsIdentityTracker />
              <PalmonasConsoleArtLogger />
              <Suspense fallback={null}>
                <LandingUtmCapture />
              </Suspense>
              <CartProvider>
                <PincodeProvider>
                  <ChooseOptionsProvider>
                    <SizeGuideProvider>
                      <Suspense fallback={null}>
                        <NavigationPendingProvider>
                          <HomePageCategoryNavigationProvider>
                            <RouteScrollReset />
                            <Suspense fallback={null}>{children}</Suspense>
                            <Suspense fallback={null}>
                              <MobileBottomNav />
                            </Suspense>
                            <PincodeModal />
                            <AddToCartFlyLayer />
                            <ChooseOptionsSheetHost />
                            <SizeGuideSheetHost />
                          </HomePageCategoryNavigationProvider>
                        </NavigationPendingProvider>
                      </Suspense>
                    </SizeGuideProvider>
                  </ChooseOptionsProvider>
                </PincodeProvider>
              </CartProvider>
            </AuthProvider>
          </AnalyticsProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
