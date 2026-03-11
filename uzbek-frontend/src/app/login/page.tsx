import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import LoginButton from "@/components/LoginButton";

export default async function LoginPage() {
  // If the user is already authenticated, send them home.
  const session = await auth0.getSession();
  if (session?.user) {
    redirect("/");
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/uzbekistan-flag.svg"
            alt="Uzbek Learning"
            className="login-flag"
          />
        </div>

        <h1 className="login-title">Welcome Back</h1>

        <p className="login-subtitle">
          Log in to track your Uzbek vocabulary progress.
        </p>

        <div className="login-actions">
          <LoginButton />
        </div>

        <p className="login-footer">
          Secure login powered by Auth0
        </p>
      </div>
    </div>
  );
}
