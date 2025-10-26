import CompassGrid from '@/components/CompassGrid';
import NavBar from '@/components/NavBar';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[url('/backgrounds/ClashBackground.png')]  text-clash-white p-8 font-text">
      <NavBar />
      <div className="max-w-6xl mx-auto mt-12">
        <h1 className="text-4xl font-headline mb-6 text-center text-clash-gold-border">
          Performance Evaluation Engine
        </h1>
        <CompassGrid />
      </div>
    </main>
  );
}
