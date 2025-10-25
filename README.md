This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Tailwind CSS

This project has Tailwind CSS installed and configured for the Next.js `app/` directory.

- `tailwind.config.cjs` contains the `content` paths for `app`, `components`, and `lib`.
- `postcss.config.mjs` uses the `@tailwindcss/postcss` plugin.
- Global styles import Tailwind via `@tailwind base;`, `@tailwind components;`, and `@tailwind utilities;` in `app/globals.css`.

Packages installed/verified:

- `tailwindcss` (v4.x)
- `postcss` and `@tailwindcss/postcss`
- `autoprefixer`
- `framer-motion` (added because `components/CompassGrid.tsx` imports it)

To run locally:

```bash
npm install
npm run dev
```

If you plan to add Tailwind plugins (typography, forms, etc.) you can add them to `tailwind.config.cjs` under `plugins`.

## Clash / Supercell Fonts

If you'd like to use the Clash (Supercell) fonts used in the game branding:

1. Obtain the font files (WOFF2 recommended) for the headline and text faces. Name them (for example):
	- `SupercellHeadline.woff2`
	- `SupercellText.woff2`

2. Place them in the project's `public/fonts/` directory.

3. Restart the dev server. The project includes `@font-face` placeholders in `app/globals.css` that point to `/fonts/SupercellHeadline.woff2` and `/fonts/SupercellText.woff2`.

If you don't have the official font files, the CSS will fall back to sensible system fonts.

## CompassGrid and mock GitHub avatar

- `components/CompassGrid.tsx` now uses a mock user avatar located at `public/avatars/mock-avatar.png` and animates it on the grid. You can replace that file with a real avatar (or update `lib/mockData.ts` to point to a remote image) when you integrate with the backend.

