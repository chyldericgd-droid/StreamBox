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

## Update (Oct 2026)
- Netflix now lists the four Congo plans (Mobile, Basic, Standard, Premium) and Spotify lists Individual and Student, with prices computed from official USD prices and the `BANK` settings (exchange rate, international card fee, VAT + additional centimes, fixed margin). Check `BANK` against your UBA statement.
- Duration discounts reduced to 3 months: 3%, 6 months: 5% so margins stay positive.
- Orders processed 8h–15h. Provided logos are embedded in the file; Disney+, ChatGPT, Claude and Gemini still load from public URLs with a text fallback.

## Update (hero + tendances)
- WhatsApp: `STORE.whatsapp` = `242056067092`. Every button and link goes through `waUrl()`, so this single value drives all of them.
- Hero on 2 columns (desktop): title, text and the 3 steps on the left; "Now showing" poster carousel on the right. On mobile the carousel sits under the text and swipes horizontally.
- Trends come from TMDB (`TMDB` constants near the end of the script). The 4 fallback posters render instantly; TMDB replaces them only if it answers within 4.5 s. The result is cached for 30 min in `sessionStorage`.
- The platform of each title is read from TMDB watch-providers (Congo first, then FR/US/GB). It is a probable platform, not a guarantee of availability in Congo. Apple TV titles open the external-purchase quote.
- Clicking a poster opens the order dialog on the matching offer (Netflix opens on Standard) and adds a `Selection : <title>` line to the WhatsApp message.
- TMDB attribution is displayed in the footer, as TMDB requires. The v3 API key is visible in the page source; regenerate it on themoviedb.org if it is abused.
- Service worker cache renamed to `streambox-congo-v4` so returning visitors get the new page.

## Update (trends refresh, new offers, pay-anything note)
- Trends now use one TMDB `discover/tv` request per platform (Netflix 8, Prime Video 119, Disney+ 337), sorted by popularity, so every poster is already on its platform. Region used for the catalogue: `TMDB.region` ("FR").
- Auto-refresh: cached for 1 hour in `localStorage` (per language), refreshed when the tab becomes visible again and every hour while open. Language switch reloads titles in the new language.
- A small label under the carousel title shows the state: "Actualisé automatiquement" (live data) or "Sélection par défaut" (fallback posters). If you always see the second one, open the browser console: the reason is logged ("TMDB 401/403", blocked, timeout).
- New quote-only offers (no invented prices): Recharge jeux mobiles (by player ID), Cartes cadeaux, Crunchyroll. Edit them in the block just before `WORKING_LOGOS`.
- New one-line note under the steps: "for you or for someone close, ask a quote for anything else". It opens the external-purchase quote.
- Service worker cache: `streambox-congo-v5`.
