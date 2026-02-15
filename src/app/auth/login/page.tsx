import { Suspense } from "react";
import { PageLoading } from "@/components/ui/Loading";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <LoginForm />
    </Suspense>
  );
}
