import { auth0 } from "@/lib/auth0";
import LoginButton from "@/components/LoginButton";
import LogoutButton from "@/components/LogoutButton";
import Profile from "@/components/Profile";
import Link from "next/link";

export default async function Home() {
  const session = await auth0.getSession();
  const user = session?.user;

  return (
    <>
      <h1 className="mb-10">Learning Uzbek</h1>
      <p className="text-2xl mb-5">Test your Uzbek vocabulary skills!</p>
      <div className="mt-8">
        <Link href="/timed-test">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
            Go to Timed Vocabulary Test
          </button>
        </Link>
      </div>
      <div className="mt-8">
        {user ? (
          <>
            <p className="logged-in-message">✅ Successfully logged in!</p>
            <Profile />
            <LogoutButton />
          </>
        ) : (
          <>
            <p className="action-text">
              Welcome! Please log in to access your protected content.
            </p>
            <LoginButton />
          </>
        )}
      </div>
    </>
  );
}
