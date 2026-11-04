import { SignInForm } from "@/components/auth/sign-in-form";
export const metadata = {
  title: "Staff sign in",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return <SignInForm />;
}
