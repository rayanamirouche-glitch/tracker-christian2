// Classement local Google Maps via SerpApi
// Clé requise : variable d'environnement SERPAPI_KEY
// Params : ?kw=couvreur+gembloux&target=NOM_FICHE (match partiel insensible à la casse)
exports.handler = async (event) => {
  const K = process.env.SERPAPI_KEY;
  if (!K) return { statusCode: 500, body: JSON.stringify({ error: "SERPAPI_KEY manquante" }) };
  const { kw, target } = event.queryStringParameters || {};
  if (!kw || !target) return { statusCode: 400, body: JSON.stringify({ error: "params kw et target requis" }) };
  const url = `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(kw)}&hl=fr&gl=be&api_key=${K}`;
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
      body: JSON.stringify({ kw, target, position: pos, matched: found, total_results: results.length })
    };
  } catch (e) {
    return { statusCode: 502, body: JSON.stringify({ error: String(e) }) };
  }
};
