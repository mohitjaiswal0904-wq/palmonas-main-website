import '@testing-library/jest-dom';

process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
process.env.NEXT_PUBLIC_APP_ENV = 'development';
process.env.NEXT_PUBLIC_API_DEV = 'https://app-backend.palmonas.tech';
process.env.NEXT_PUBLIC_API_PROD = 'https://app-backend.palmonas.tech';
process.env.NEXT_PUBLIC_MTO_API_BASE = 'https://utils.palmonas.com';
process.env.NEXT_PUBLIC_KWIKPASS_MERCHANT_ID = 'test-mid';
process.env.NEXT_PUBLIC_KWIKPASS_ENVIRONMENT = 'production';
process.env.NEXT_PUBLIC_KP_BASE = 'https://pdp.gokwik.co';
process.env.NEXT_PUBLIC_KWIKPASS_SHOP_DOMAIN = 'palmonas.myshopify.com';
process.env.NEXT_PUBLIC_OMS_API_URL = 'https://omsapi.palmonas.tech';
process.env.NEXT_PUBLIC_GOKWIK_STORE_ID = '123456';
process.env.NEXT_PUBLIC_GOKWIK_FB_PIXEL = 'pixel-1,pixel-2';
process.env.NEXT_PUBLIC_CAREERS_GENERAL_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbw3IIdgklSPyQC4GhJgpZE4tbk740XfomGNREWCr-fH-2CYMGxJ8lHCnAsRigSfhBIP/exec';
process.env.NEXT_PUBLIC_CAREERS_JOB_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbyrnLxbijXIgW5P9gwB_hX-1bsHhV5wbTpqrsRgzjQmV02Jn9khDZuQESC6oeVpGhwF/exec';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('next/headers', () => ({
  cookies: () => ({ get: jest.fn(), set: jest.fn(), delete: jest.fn() }),
  headers: () => new Headers(),
}));
