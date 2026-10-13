import { AccountPageShell, LoginForm } from '@/components/account';
import { buildMetadata } from '@/lib/seo/build-metadata';

export const metadata = buildMetadata({ title: 'Login', path: '/account/login', noIndex: true });

export default function LoginPage() {
  return (
    <AccountPageShell centered>
      <LoginForm />
    </AccountPageShell>
  );
}
