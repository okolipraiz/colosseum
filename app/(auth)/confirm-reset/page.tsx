import { ConfirmResetForm } from "@/components/auth/ConfirmResetForm";
import Loading from "@/components/Loading";
import { Suspense } from "react";

export default function ConfirmPasswordChangePage() {
  return (
    <Suspense fallback={<Loading />}>
      <ConfirmResetForm />
    </Suspense>
  );
}
