import { AuthForm } from "@/components/shared/AuthForm";

export const metadata = {
  title: "Sign In",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-calm-50 to-lavender-50 px-4 dark:from-surface-950 dark:to-calm-900">
      <AuthForm mode="login" />
    </div>
  );
}
