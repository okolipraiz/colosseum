import { VerifyForm } from '@/components/auth/VerifyForm'
import Loading from '@/components/Loading';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <Suspense fallback={<Loading />}>
      <VerifyForm />
    </Suspense>
  );
}
