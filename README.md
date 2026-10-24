# GD Esports

Official website for GD Esports — React + Vite, deployed on Netlify.

## Scripts

```bash
npm run dev       # local dev server (maintenance mode is ignored in dev)
npm run build     # production build
npm run lint      # ESLint
ANALYZE=1 npm run build  # build and open the bundle visualizer
```

### Local data

`npm run dev` forwards `/.netlify/functions/*` to the live site (`https://gdesports.netlify.app`), so localhost shows the real dashboard content (creators, staff, partners, matches), Twitch live status, clips and Discord stats.

- Only read requests are forwarded. Saving in the admin panel, checkout and form posts are blocked locally with a 403.
- `FUNCTIONS_PROXY=off npm run dev` uses the built-in defaults from `src/content/` instead.
- `FUNCTIONS_PROXY_WRITE=1 npm run dev` allows writes. They go to **production**.

## Project structure

```
src/
  app/           App shell, route table, auth/admin route guards
  config/        Site identity, socials, nav, feature flags, admin emails
  content/       Default roster/creators/staff/partners/matches/products + CMS loader
  lib/           Firebase, analytics tracking, formatting, uploads
  hooks/         Shared hooks (Twitch live, Discord stats, countdown, overlays)
  components/
    layout/      Header, footer, mobile menu, splash, backdrop
    ui/          Reusable building blocks (Page, PageHeader, Modal, Field, Alert, cards…)
  features/      One folder per area: home, roster, creators, clips, partners, shop,
                 about, news, recruit, giveaway, legal, auth, dashboard, admin, maintenance
  styles/        Design tokens, base, shared UI and layout CSS
netlify/functions/  Stripe checkout, Twitch, Discord, site-content CMS, form-to-discord
```

## Configuration

- `src/config/site.js`
  - `MAINTENANCE_MODE`: when `true`, production builds show only the maintenance page.
  - `FEATURE_FLAGS.giveaway`: enables the `/giveaway` route.
- `src/content/products.js`: shop product ids and prices must match `netlify/functions/create-checkout.js`.
