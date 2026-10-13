import { AccountPageShell, RegisterForm } from '@/components/account';
import { buildMetadata } from '@/lib/seo/build-metadata';

export const metadata = buildMetadata({
  title: 'Register',
  path: '/account/register',
  noIndex: true,
});

export default function RegisterPage() {
  return (
    <AccountPageShell centered>
      <RegisterForm />
    </AccountPageShell>
  );
}
