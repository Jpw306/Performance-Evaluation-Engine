import Link from 'next/link';

export default function NavBar() {
  return (
    <nav className="flex justify-center gap-6 text-neutral-300">
      <Link href="/" className="hover:text-yellow-400">Compass</Link>
      <Link href="/leaderboard" className="hover:text-yellow-400">Leaderboard</Link>
      <Link href="/dashboard" className="hover:text-yellow-400">Dashboard</Link>
    </nav>
  );
}
