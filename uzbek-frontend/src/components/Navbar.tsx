import Link from "next/link";
import Image from "next/image";
import { auth0 } from "@/lib/auth0";
import { getAuth0ConfigStatus } from "@/lib/auth0-config";

export default async function Navbar() {
  const auth0Config = getAuth0ConfigStatus();
  const session = auth0Config.isConfigured ? await auth0.getSession() : null;
  const user = session?.user;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link href="/" className="navbar-logo">
          <Image
            src="/uzbekistan-flag.svg"
            alt="Uzbek Learning"
            width={28}
            height={28}
            className="navbar-flag"
          />
          <span className="navbar-title">Uzbek</span>
        </Link>
      </div>

      <div className="navbar-links">
        <Link href="/" className="navbar-link">
          Home
        </Link>
        <Link href="/timed-test" className="navbar-link">
          Timed Test
        </Link>
      </div>

      <div className="navbar-auth">
        {!auth0Config.isConfigured ? (
          <span className="navbar-warning">Auth disabled</span>
        ) : user ? (
          <div className="navbar-user">
            {user.picture && (
              <img
                src={user.picture}
                alt={user.name ?? "User"}
                className="navbar-avatar"
              />
            )}
            <span className="navbar-username">{user.name ?? user.email}</span>
            <a href="/auth/logout" className="button logout navbar-btn">
              Log Out
            </a>
          </div>
        ) : (
          <a href="/auth/login" className="button login navbar-btn">
            Log In
          </a>
        )}
      </div>
    </nav>
  );
}
