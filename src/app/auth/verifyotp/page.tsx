// app/auth/verifyotp/page.tsx or wherever you're rendering the component
import React, { Suspense } from "react";
import VerifyOtp from "~/app/_components/verifyotp";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOtp />
    </Suspense>
  );
}
