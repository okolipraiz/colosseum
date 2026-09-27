import { LoginForm } from '@/components/auth/LoginForm'
import Loading from '@/components/Loading';
import { Suspense } from 'react'

export default function LoginPage() {
  return (
    <Suspense fallback={<Loading />}>
      <LoginForm />
    </Suspense>
  );
}
