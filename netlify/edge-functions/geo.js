// Returns the visitor's approximate location (Netlify looks it up from the IP address) so the home page can
// point them to the closest 9 Arrow service area. Nothing is stored or logged, and no browser permission is asked.
export default (request, context) => {
  const g = context.geo || {};
  const num = (v) => (typeof v === "number" && isFinite(v) ? v : null);
  const body = {
    city: g.city || null,
    region: (g.subdivision && g.subdivision.code) || null,
    country: (g.country && g.country.code) || null,
    lat: num(g.latitude),
    lng: num(g.longitude),
  };
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "private, no-store" },
  });
};

export const config = { path: "/api/geo" };
