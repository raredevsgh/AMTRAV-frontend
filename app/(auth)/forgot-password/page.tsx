import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
export const metadata = {
  title: "Reset your password",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
