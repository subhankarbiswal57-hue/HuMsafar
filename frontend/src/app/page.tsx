import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-br from-primary-dark to-primary px-4 text-center text-white">
      <h1 className="text-4xl font-bold">AI-Powered Road & Transit Infrastructure Resilience Platform</h1>
      <p className="max-w-2xl text-white/80">
        Predictive resilience metrics, social sustainability indicators, GIS and machine learning for smarter
        infrastructure planning and disaster resilience.
      </p>
      <div className="flex gap-4">
        <Link href="/login" className="rounded-lg bg-white px-6 py-3 font-medium text-primary hover:bg-gray-100">
          Sign In
        </Link>
        <Link href="/register" className="rounded-lg border border-white px-6 py-3 font-medium hover:bg-white/10">
          Create Account
        </Link>
      </div>
    </div>
  );
}
