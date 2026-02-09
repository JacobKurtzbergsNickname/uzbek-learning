
import Vocabulary from "@/components/Vocabulary/Vocabulary";
import Link from "next/link";

export default function Home() {
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
    </>
  );
}
