'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';

import { PincodeDeliveryResult } from '@/components/product/PincodeDeliveryResult';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { pincodeMessages } from '@/config/pincode/pincode.config';
import {
  isProductFeatureEnabled,
  productMessages,
  productTheme,
} from '@/config/product/product.config';
import { usePincode } from '@/hooks/usePincode';
import { pincodeValidator } from '@/lib/validators';
import { useDeliveryPincode } from '@/providers/PincodeProvider';
import type { EddResult } from '@/types/edd';
import { PRODUCT_CATEGORY, type ProductCategory } from '@/types/product';

interface PincodeCheckerProps {
  productCategory: ProductCategory;
  inStock: boolean;
}

/**
 * Builds a stable key for deduping auto EDD checks from the header pincode.
 *
 * @param pincode - Delivery pincode to check.
 * @param inStock - Whether the current variant is in stock.
 * @param eddType - Utils API catalog flavor.
 * @returns Cache key for the check attempt.
 */
function buildAutoCheckKey(pincode: string, inStock: boolean, eddType: 'mto' | 'demifine'): string {
  return `${pincode}:${inStock}:${eddType}`;
}

export function PincodeChecker({ productCategory, inStock }: PincodeCheckerProps) {
  const {
    pincode: storedPincode,
    pincodeHydrated,
    setPincode: saveDeliveryPincode,
  } = useDeliveryPincode();
  const [draftPincode, setDraftPincode] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [hasChecked, setHasChecked] = useState(false);
  const [checkedResult, setCheckedResult] = useState<EddResult | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const autoCheckKeyRef = useRef<string | null>(null);
  const { checkEdd, validatePincode, error, reset, isChecking, isValidating } = usePincode();
  const isGold = productCategory === PRODUCT_CATEGORY.GOLD;
  const accent = isGold ? productTheme.gold.accent : productTheme.demifine.accent;
  const accentHover = isGold ? productTheme.gold.accentHover : productTheme.demifine.accentHover;
  const eddType = isGold ? 'mto' : 'demifine';
  const pincodeInput =
    isEditing || !pincodeHydrated || !storedPincode ? draftPincode : storedPincode;

  const completeEddCheck = useCallback(
    async (pincode: string, options?: { skipValidation?: boolean }) => {
      const parsed = pincodeValidator.safeParse(pincode.trim());

      if (!parsed.success) {
        setValidationError(pincodeMessages.invalidFormat);
        return false;
      }

      setValidationError(null);

      try {
        if (!options?.skipValidation) {
          const validation = await validatePincode(parsed.data);

          if (!validation.valid) {
            setValidationError(validation.message);
            setHasChecked(false);
            return false;
          }
        }

        const eddResult = await checkEdd({
          pincode: parsed.data,
          inStock,
          type: eddType,
        });
        saveDeliveryPincode(parsed.data);
        setDraftPincode(parsed.data);
        setCheckedResult(eddResult);
        setHasChecked(true);
        setIsEditing(false);
        return true;
      } catch {
        setHasChecked(false);
        autoCheckKeyRef.current = null;
        return false;
      }
    },
    [checkEdd, eddType, inStock, saveDeliveryPincode, validatePincode],
  );

  // Auto-check delivery when the header pincode is available and the user is not editing.
  useEffect(() => {
    if (!pincodeHydrated || !storedPincode || hasChecked || isEditing) {
      return;
    }

    const checkKey = buildAutoCheckKey(storedPincode, inStock, eddType);

    if (autoCheckKeyRef.current === checkKey) {
      return;
    }

    autoCheckKeyRef.current = checkKey;
    void completeEddCheck(storedPincode, { skipValidation: true });
  }, [completeEddCheck, eddType, hasChecked, inStock, isEditing, pincodeHydrated, storedPincode]);

  if (!isProductFeatureEnabled('pincodeChecker')) {
    return null;
  }

  const handleCheck = async () => {
    await completeEddCheck(pincodeInput);
  };

  const handleChange = () => {
    setHasChecked(false);
    setCheckedResult(null);
    setIsEditing(true);
    setValidationError(null);
    reset();
    autoCheckKeyRef.current = null;
    setDraftPincode(storedPincode ?? '');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleCheck();
  };

  if (hasChecked && checkedResult) {
    return (
      <section aria-label={productMessages.a11y.deliveryStatus}>
        <PincodeDeliveryResult
          result={checkedResult}
          onChange={handleChange}
          productCategory={productCategory}
        />
      </section>
    );
  }

  return (
    <section
      aria-label={productMessages.a11y.checkDelivery}
      aria-busy={isChecking || isValidating ? true : undefined}
    >
      <form onSubmit={handleSubmit}>
        <label
          className="text-sm font-medium"
          htmlFor="pincode"
          style={{ color: productTheme.ink }}
        >
          {productMessages.checkDelivery}
        </label>
        <div className="relative mt-2 max-w-md">
          <Input
            id="pincode"
            inputMode="numeric"
            maxLength={6}
            value={pincodeInput}
            onChange={(event) => {
              setIsEditing(true);
              setDraftPincode(event.target.value.replace(/\D/g, ''));
              setValidationError(null);
            }}
            placeholder={productMessages.enterPincode}
            aria-label={productMessages.enterPincode}
            aria-invalid={validationError ? true : undefined}
            aria-describedby={validationError ? 'pincode-error' : undefined}
            className="border-stone-300 pr-40 focus:border-[color:var(--pdp-accent)]"
            style={{ color: accent, ['--pdp-accent' as string]: accent }}
          />
          <Button
            type="submit"
            className="absolute top-1/2 right-1 h-7 shrink-0 -translate-y-1/2 px-3 whitespace-nowrap hover:opacity-90"
            style={{ backgroundColor: accent }}
            onMouseEnter={(event) => {
              event.currentTarget.style.backgroundColor = accentHover;
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.backgroundColor = accent;
            }}
            aria-label={productMessages.a11y.checkDeliverySubmit}
            disabled={isChecking || isValidating}
          >
            {isChecking || isValidating ? pincodeMessages.validating : productMessages.check}
          </Button>
        </div>
      </form>
      {validationError ? (
        <p id="pincode-error" className="mt-2 text-sm text-red-600" role="alert">
          {validationError}
        </p>
      ) : null}
      {error ? (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error.message}
        </p>
      ) : null}
    </section>
  );
}
