import { auth0 } from "@/lib/auth0";
import { getAuth0ConfigStatus } from "@/lib/auth0-config";
import Link from "next/link";
import Profile from "@/components/Profile";
import LoginButton from "@/components/LoginButton";
import LogoutButton from "@/components/LogoutButton";

export default async function Home() {
  const auth0Config = getAuth0ConfigStatus();
  const session = auth0Config.isConfigured ? await auth0.getSession() : null;
  const user = session?.user;

  return (
    <main className="home-page">
      <section className="home-grid">
        <div className="hero-panel">
          <p className="hero-kicker">Vocabulary Practice</p>
          <h1 className="hero-title">Learning Uzbek</h1>
          <p className="hero-subtitle">
            Test your Uzbek vocabulary skills with a focused timed challenge.
          </p>
          <Link href="/timed-test" className="primary-link">
            Go to Timed Vocabulary Test
          </Link>
        </div>

        <div className="auth-panel">
          {!auth0Config.isConfigured ? (
            <div className="action-card home-action-card">
              <p className="action-text">
                Auth0 is not configured yet. Update your frontend .env.local
                values to enable login.
              </p>
            </div>
          ) : user ? (
            <div className="logged-in-section">
              <p className="logged-in-message">Successfully logged in!</p>
              <Profile />
              <LogoutButton />
            </div>
          ) : (
            <div className="action-card home-action-card">
              <p className="action-text">
                Log in to track your vocabulary progress and keep your learning
                streak alive.
              </p>
              <LoginButton />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
