export default function ColorsFontsTest() {
  return (
    <main className="min-h-screen bg-clash-dark text-clash-white font-text p-8">
      <h1 className="text-4xl font-headline text-clash-gold mb-8 drop-shadow">Clash Royale Branding Test</h1>
      <section className="mb-10">
        <h2 className="text-2xl font-headline text-clash-blue mb-4">Font Samples</h2>
        <div className="space-y-4">
          <div className="font-headline text-3xl text-clash-gold">This is Headline Font (Bold)</div>
          <div className="font-text text-xl text-clash-white">This is Text Font (Regular)</div>
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-headline text-clash-blue mb-4">Color Palette</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: 'Blue', class: 'bg-clash-blue', text: 'text-clash-white' },
            { name: 'Gold', class: 'bg-clash-gold', text: 'text-clash-black' },
            { name: 'Dark', class: 'bg-clash-dark', text: 'text-clash-gold' },
            { name: 'White', class: 'bg-clash-white', text: 'text-clash-black' },
            { name: 'Gray', class: 'bg-clash-gray', text: 'text-clash-black' },
            { name: 'Light', class: 'bg-clash-light', text: 'text-clash-black' },
            { name: 'Black', class: 'bg-clash-black', text: 'text-clash-gold' },
          ].map(({ name, class: bg, text }, i) => (
            <div key={i} className={`rounded-xl h-24 flex items-center justify-center ${bg} ${text} font-headline text-xl border-2 border-clash-dark`}>
              {name}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
