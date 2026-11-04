import { AuthForm } from "../auth/auth-form";
import { logIn } from "../auth/actions";

export const metadata = { title: "Log in" };

export default function LoginPage() {
  return <AuthForm mode="login" action={logIn} />;
}
