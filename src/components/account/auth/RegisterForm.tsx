import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function RegisterForm() {
  return (
    <div className="rounded-palmonas-lg shadow-palmonas-soft w-full max-w-md space-y-8 border border-stone-200 bg-white p-8">
      <h1 className="font-display text-center text-3xl">Create account</h1>
      <form className="space-y-4" aria-label="Register form">
        <Input type="text" placeholder="Name" aria-label="Full name" />
        <Input type="email" placeholder="Email" aria-label="Email address" />
        <Input type="password" placeholder="Password" aria-label="Password" />
        <Button className="w-full" aria-label="Create your account">
          Register
        </Button>
      </form>
    </div>
  );
}
