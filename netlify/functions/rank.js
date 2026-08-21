// Classement local Google Maps via SerpApi — v2 avec géolocalisation
// Clé requise : variable d'environnement SERPAPI_KEY
// Params : ?kw=couvreur+gembloux&target=NOM&ll=50.5610,4.6980
exports.handler = async (event) => {
  const K = process.env.SERPAPI_KEY;
  if (!K) return { statusCode: 500, body: JSON.stringify({ error: "SERPAPI_KEY manquante" }) };
  const { kw, target, ll } = event.queryStringParameters || {};
  if (!kw || !target) return { statusCode: 400, body: JSON.stringify({ error: "params kw et target requis" }) };
  let url = `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(kw)}&hl=fr&api_key=${K}`;
  if (ll) url += `&ll=${encodeURIComponent('@' + ll + ',14z')}`;
  try {
    const r = await fetch(url);
    const j = await r.json();
    const results = j.local_results || [];
    const t = target.toLowerCase();
    let pos = null, found = null;
    results.forEach((res, i) => {
      if (pos === null && res.title && res.title.toLowerCase().includes(t)) {
        pos = i + 1; found = res.title;
      }
    });
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ kw, target, ll: ll || null, position: pos, matched: found, total_results: results.length })
    };
  } catch (e) {
    return { statusCode: 502, body: JSON.stringify({ error: String(e) }) };
  }
};
