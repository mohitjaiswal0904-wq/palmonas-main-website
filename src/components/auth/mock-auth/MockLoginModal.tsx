'use client';

import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  AuthModalShell,
  authModalInputClassName,
  authModalPrimaryButtonClassName,
  authModalSecondaryButtonClassName,
} from '@/components/auth/AuthModalShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loader } from '@/components/ui/Loader';
import { authMessages } from '@/config/auth/auth.config';
import {
  getMockAuthCredentials,
  getMockAuthOtp,
  getMockAuthUiDelayMs,
} from '@/config/auth/mock-auth.config';
import {
  buildCartLoginItemsFromCart,
  resolveCartLoginCouponCodes,
} from '@/lib/cart/cart-login-items';
import { readGuestCartSnapshot } from '@/lib/cart/guest-cart.local-data-source';
import { isAppError } from '@/lib/errors';
import { cn } from '@/lib/utils/cn';
import { completeMockLogin } from '@/repositories/auth/auth.repository';
import { resolveCartIdForLoginFlow } from '@/repositories/cart/cart.repository';
import { useCartStore } from '@/store/cart/cart.store';
import type { AuthSession, LoginType } from '@/types/auth/auth.types';
import { isCartLoginType } from '@/types/auth/auth.types';

type MockLoginStep = 'phone' | 'sending-otp' | 'otp' | 'verifying' | 'success' | 'error';

const SUCCESS_DISMISS_MS = 2000;
const INDIA_DIAL_PREFIX = '+91';

interface MockLoginModalProps {
  open: boolean;
  loginType: LoginType;
  onClose: () => void;
  onComplete: (session: AuthSession) => void;
}

/**
 * Temporary mock login modal mimicking phone/OTP flow until KwikPass is available.
 */
export function MockLoginModal({ open, loginType, onClose, onComplete }: MockLoginModalProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<MockLoginStep>('phone');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mockPhone = getMockAuthCredentials().phone;
  const mockOtp = getMockAuthOtp();
  const uiDelayMs = getMockAuthUiDelayMs();
  const [phoneValue, setPhoneValue] = useState(mockPhone);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [otpValue, setOtpValue] = useState(mockOtp);
  const [otpTouched, setOtpTouched] = useState(false);

  const clearTimers = useCallback(() => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
      delayTimerRef.current = null;
    }
  }, []);

  const resetModal = useCallback(() => {
    clearTimers();
    setStep('phone');
    setErrorMessage(null);
    setPhoneValue(mockPhone);
    setPhoneTouched(false);
    setOtpValue(mockOtp);
    setOtpTouched(false);
  }, [clearTimers, mockPhone, mockOtp]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const handleContinue = () => {
    setErrorMessage(null);
    setStep('sending-otp');
    delayTimerRef.current = setTimeout(() => {
      setStep('otp');
    }, uiDelayMs);
  };

  const handleVerifyOtp = () => {
    setErrorMessage(null);
    setStep('verifying');
    delayTimerRef.current = setTimeout(() => {
      void (async () => {
        try {
          const cartLogin = isCartLoginType(loginType);
          const storeCart = useCartStore.getState().cart ?? readGuestCartSnapshot();
          const cartItems = cartLogin ? buildCartLoginItemsFromCart(storeCart) : undefined;
          const couponCodes = cartLogin
            ? resolveCartLoginCouponCodes(queryClient, storeCart?.id)
            : undefined;
          const cartId = cartLogin ? undefined : await resolveCartIdForLoginFlow(loginType);
          const session = await completeMockLogin(loginType, { cartId, cartItems, couponCodes });
          setStep('success');
          onComplete(session);
          dismissTimerRef.current = setTimeout(() => {
            onClose();
          }, SUCCESS_DISMISS_MS);
        } catch (err) {
          setErrorMessage(isAppError(err) ? err.message : authMessages.errors.login);
          setStep('error');
        }
      })();
    }, uiDelayMs);
  };

  const handleRetry = () => {
    resetModal();
  };

  return (
    <AuthModalShell open={open} onClose={onClose} aria-label="Login">
      {step === 'phone' ? (
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-palmonas-ink text-lg font-semibold">Login with phone</h2>
          <div className="text-left">
            <label htmlFor="mock-auth-phone" className="text-palmonas-ink mb-1 block text-sm">
              Phone number
            </label>
            <Input
              id="mock-auth-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phoneValue}
              className={cn(authModalInputClassName, !phoneTouched && 'text-palmonas-ink/50')}
              onFocus={() => {
                if (!phoneTouched) {
                  setPhoneValue(INDIA_DIAL_PREFIX);
                  setPhoneTouched(true);
                }
              }}
              onChange={(event) => {
                const next = event.target.value;
                setPhoneTouched(true);
                if (next.startsWith(INDIA_DIAL_PREFIX)) {
                  setPhoneValue(next);
                  return;
                }
                const digits = next.replace(/\D/g, '');
                const local = digits.startsWith('91') ? digits.slice(2) : digits;
                setPhoneValue(`${INDIA_DIAL_PREFIX}${local}`);
              }}
            />
          </div>
          <Button className={authModalPrimaryButtonClassName} onClick={handleContinue}>
            Continue
          </Button>
        </div>
      ) : null}

      {step === 'sending-otp' ? (
        <div className="flex flex-col items-center gap-4">
          <Loader className="border-palmonas-border border-t-palmonas-ink h-10 w-10" />
          <p className="text-palmonas-ink text-sm font-medium">Sending OTP…</p>
        </div>
      ) : null}

      {step === 'otp' ? (
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-palmonas-ink text-lg font-semibold">Enter OTP</h2>
          <p className="text-palmonas-muted text-sm">We sent a code to {phoneValue || mockPhone}</p>
          <div className="text-left">
            <label htmlFor="mock-auth-otp" className="text-palmonas-ink mb-1 block text-sm">
              OTP
            </label>
            <Input
              id="mock-auth-otp"
              inputMode="numeric"
              maxLength={4}
              autoComplete="one-time-code"
              value={otpValue}
              className={cn(
                authModalInputClassName,
                'tracking-widest',
                !otpTouched && 'text-palmonas-ink/50',
              )}
              onFocus={() => {
                if (!otpTouched) {
                  setOtpValue('');
                  setOtpTouched(true);
                }
              }}
              onChange={(event) => {
                setOtpValue(event.target.value.replace(/\D/g, '').slice(0, 4));
                setOtpTouched(true);
              }}
            />
          </div>
          <Button className={authModalPrimaryButtonClassName} onClick={handleVerifyOtp}>
            Verify OTP
          </Button>
        </div>
      ) : null}

      {step === 'verifying' ? (
        <div className="flex flex-col items-center gap-4">
          <Loader className="border-palmonas-border border-t-palmonas-ink h-10 w-10" />
          <p className="text-palmonas-ink text-sm font-medium">{authMessages.signingIn}</p>
        </div>
      ) : null}

      {step === 'success' ? (
        <div className="flex flex-col items-center gap-3">
          <CheckCircle2 className="h-12 w-12 text-green-600" aria-hidden="true" />
          <p className="text-palmonas-ink text-lg font-semibold">{authMessages.success.login}</p>
        </div>
      ) : null}

      {step === 'error' ? (
        <div className="flex flex-col items-center gap-4">
          <XCircle className="h-12 w-12 text-red-600" aria-hidden="true" />
          <p className="text-palmonas-ink text-sm" role="alert">
            {errorMessage ?? authMessages.errors.login}
          </p>
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button className={cn(authModalPrimaryButtonClassName, 'flex-1')} onClick={handleRetry}>
              {authMessages.retryLogin}
            </Button>
            <Button
              variant="secondary"
              className={cn(authModalSecondaryButtonClassName, 'flex-1')}
              onClick={onClose}
            >
              {authMessages.dismiss}
            </Button>
          </div>
        </div>
      ) : null}
    </AuthModalShell>
  );
}
