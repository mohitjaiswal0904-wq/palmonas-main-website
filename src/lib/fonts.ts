import { Nunito_Sans as NunitoSans } from 'next/font/google';

export const nunitoSans = NunitoSans({
  subsets: ['latin'],
  variable: '--font-nunito-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});
