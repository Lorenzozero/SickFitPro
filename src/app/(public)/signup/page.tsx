import { Metadata } from 'next';
import { SignUpForm } from '@/components/forms/sign-up-form';

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Sign up for a new account',
};

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="w-full max-w-md">
        <SignUpForm />
      </div>
    </div>
  );
}
