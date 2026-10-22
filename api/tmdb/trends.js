// Vercel serverless function: keeps TMDB_API_KEY on the server, never in index.html.
const PROVIDERS = [
  { platform: "netflix", providerId: "8" },
  { platform: "prime", providerId: "119" },
  { platform: "disney", providerId: "337" },
];
const CACHE_TTL_MS = 30 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 9000;
const trendCache = new Map();

async function fetchProvider(providerId, platform, language, apiKey) {
  const url = new URL("https://api.themoviedb.org/3/discover/tv");
  url.searchParams.set("language", language);
  url.searchParams.set("sort_by", "popularity.desc");
  url.searchParams.set("watch_region", "FR");
  url.searchParams.set("with_watch_providers", providerId);
  url.searchParams.set("with_watch_monetization_types", "flatrate");
  url.searchParams.set("page", "1");

  const headers = { accept: "application/json" };
  if (apiKey.length > 60) {
    headers.Authorization = `Bearer ${apiKey}`;
  } else {
    url.searchParams.set("api_key", apiKey);
  }

  const response = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`TMDB returned ${response.status}`);

  const payload = await response.json();
  if (!payload || !Array.isArray(payload.results)) {
    throw new Error("TMDB returned an invalid response");
  }

  return payload.results
    .flatMap((show) => {
      const title =
        typeof show.name === "string" && show.name.trim()
          ? show.name
          : typeof show.original_name === "string"
            ? show.original_name
            : "";
      const poster =
        typeof show.poster_path === "string" &&
        /^\/[A-Za-z0-9._-]+$/.test(show.poster_path)
          ? show.poster_path
          : "";
      return title && poster ? [{ title, platform, poster }] : [];
    })
    .slice(0, 2);
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const language = req.query.language;
  if (language !== "fr-FR" && language !== "en-US") {
    return res.status(400).json({ error: "Unsupported TMDB language." });
  }

  const apiKey = process.env.TMDB_API_KEY?.trim();
  if (!apiKey) {
    return res.status(503).json({ error: "TMDB is not configured." });
  }

  const now = Date.now();
  const cached = trendCache.get(language);
  if (cached && cached.expiresAt > now) {
    res.setHeader("Cache-Control", "public, s-maxage=1800, stale-while-revalidate=3600");
    return res.status(200).json(cached.trends);
  }

  const results = await Promise.allSettled(
    PROVIDERS.map(({ platform, providerId }) =>
      fetchProvider(providerId, platform, language, apiKey),
    ),
  );
  const platformResults = results.map((result) =>
    result.status === "fulfilled" ? result.value : [],
  );
  const trends = [];
  for (let index = 0; index < 2; index += 1) {
    platformResults.forEach((items) => {
      if (items[index]) trends.push(items[index]);
    });
  }

  if (trends.length < 3) {
    return res.status(502).json({ error: "TMDB is temporarily unavailable." });
  }

  trendCache.set(language, {
    expiresAt: now + CACHE_TTL_MS,
    trends,
  });
  res.setHeader("Cache-Control", "public, s-maxage=1800, stale-while-revalidate=3600");
  return res.status(200).json(trends);
};
