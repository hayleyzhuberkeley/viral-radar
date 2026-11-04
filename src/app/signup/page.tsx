import { AuthForm } from "../auth/auth-form";
import { signUp } from "../auth/actions";

export const metadata = { title: "Sign up" };

export default function SignupPage() {
  return <AuthForm mode="signup" action={signUp} />;
}
