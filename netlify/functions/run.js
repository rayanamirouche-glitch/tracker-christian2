const { connectLambda } = require('@netlify/blobs');
const { getStore } = require('@netlify/blobs');
const core = require('./core');
const FICHES = require('./fiches.json');

exports.handler = async (event) => {
  connectLambda(event);
  const q = event.queryStringParameters || {};
  const baseUrl = process.env.URL || ('https://' + ((event.headers && event.headers.host) || ''));
  try {
    if (q.type === 'diag') {
      const store = getStore('tracker');
      const ids = (await store.get('ids', { type: 'json' })) || {};
      const avis = (await store.get('avis', { type: 'json' })) || {};
      const today = new Date().toISOString().slice(0, 10);
      const snapToday = avis[today] || {};
      const linked = Object.keys(ids).length;
      const firstLinked = FICHES.find(f => ids[f.name]);
      let google = null;
      if (firstLinked) {
        const K = process.env.PLACES_API_KEY;
        const u = 'https://maps.googleapis.com/maps/api/place/details/json?place_id=' + ids[firstLinked.name] + '&fields=user_ratings_total,rating&key=' + K;
        const j = await fetch(u).then(r => r.json()).catch(e => ({ fetch_error: String(e) }));
        google = {
          fiche: firstLinked.name,
          status: j.status || null,
          error_message: j.error_message || null,
          fetch_error: j.fetch_error || null,
          n: j.result ? j.result.user_ratings_total : null
        };
      }
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          code_version: 'v2-vagues',
          fiches: FICHES.length,
          ids_lies: linked,
          snapshot_du_jour: Object.keys(snapToday).length + ' fiches relevées',
          cle_places_presente: !!process.env.PLACES_API_KEY,
          test_google: google
        }, null, 1)
      };
    }
    if (q.type === 'avis') {
      const start = (q.start !== undefined) ? parseInt(q.start, 10) : null;
      await core.snapAvis(start);
    } else if (q.type === 'relink') {
      await core.relink();
      await core.snapAvis(null);
    } else if (q.type === 'rank') {
      if (q.force !== '1') {
        const left = await core.rankCooldown();
        if (left > 0) {
          const h = Math.ceil(left / 3600000);
          return { statusCode: 429, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ cooldown: h }) };
        }
      }
      await core.snapRank(parseInt(q.start || '0', 10), baseUrl);
    } else {
      return { statusCode: 400, body: JSON.stringify({ error: 'type avis|rank|relink|diag requis' }) };
    }
    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: String(e) }) };
  }
};
