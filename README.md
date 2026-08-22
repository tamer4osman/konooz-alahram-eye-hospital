# مستشفى كنوز الأهرام لطب وجراحة العيون

موقع إلكتروني لمستشفى كنوز الأهرام لطب وجراحة العيون - بنغازي، ليبيا.

Konooz Al-Ahram Eye Hospital website — Benghazi, Libya.

## Tech Stack

- Next.js 15 (App Router)
- React 19
- Tailwind CSS 4
- TypeScript

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the development server:

   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Script | Description |
| ------ | ----------- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Project Structure

```
app/           # App Router pages, layout, metadata, sitemap, robots
components/    # UI components (public site + dashboard)
context/       # React contexts (language/i18n, patient auth)
data/          # Static hospital data
hooks/         # Shared hooks
lib/           # Utilities
public/        # Images, avatars, icons
```
