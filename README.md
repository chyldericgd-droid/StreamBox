# StreamBox Congo

A presentation-first, bilingual subscription storefront for Brazzaville, Pointe-Noire and the CEMAC region. The interface and ordering flow are contained in `index.html` (inline CSS and JavaScript); no backend, authentication, database, or payment integration is needed.

## Local preview

Open `index.html` directly in a browser for the catalogue and request flow. For PWA installation and offline caching, serve the directory over HTTPS or localhost; browsers do not run service workers from `file://`.

## Seller settings and prices

Edit the clearly marked **MERCHANT SETTINGS** block near the beginning of the inline script in `index.html`:

- `whatsapp`: WhatsApp number in international digits only, without a leading `+`.
- `FCFA_PRICES`: the displayed Congo-Brazzaville prices, in FCFA. Listed values are rounded to 500 FCFA.
- `STORE.durationDiscount`: optional discounts for 1, 3, and 6 months.

The initial catalogue uses the FCFA amounts supplied with the project: Netflix 3,500 / 9,500; Spotify 2,500; YouTube Premium 3,000; Prime Video 3,000; Disney+ 3,500; ChatGPT Plus 12,000; Canva Pro 3,500 / 10,000 per year; PlayStation Plus 6,500 / 10,000; Xbox Game Pass 8,500; Pack Duo 5,500; Pack Master 8,000. These are displayed prices, not payment guarantees: confirm service availability, the selected account option, and the exact amount with the seller on WhatsApp before any transfer. Apple Music, IPTV, VPN, and external purchases use a quote request.

Brand logos load from their existing public image URLs. If a logo URL is unavailable, its card displays a readable brand-name fallback instead of a blank icon. The page remains usable if the external fonts or logos do not load.

## Customer flow

Customers choose an offer, an account option, duration where available, and preferred MTN/Airtel Mobile Money method. The optional note accepts an account email or product link only; it must not be used for passwords, PINs, or one-time security codes. The page generates a unique request reference and opens WhatsApp with a prefilled message. The seller must confirm the offer, availability, exact amount, and transfer number directly with the customer. The website does not accept or verify payments, and the customer should not transfer funds before that confirmation.

## Static deployment

Upload all four files in this directory to the same static-hosting directory:

1. `index.html`
2. `manifest.webmanifest`
3. `sw.js`
4. `README.md`

Deploy to any static host such as GitHub Pages, Netlify, or a static web server. All manifest and service-worker paths are relative, so the site can be hosted at a project subpath (for example, `https://username.github.io/project/`). Use HTTPS for the service worker and PWA install/offline support. The worker caches the core page and manifest on install, serves the cached page when offline, and caches same-origin assets as they are requested. Fonts and brand logo images use external URLs when online; the page remains readable and usable if they are unavailable.

## Notes

Service names and logos are owned by their respective companies. StreamBox Congo is an independent service and does not claim affiliation with them. Product details and availability are intentionally qualified and should be confirmed with the seller.
