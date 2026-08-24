const { connectLambda } = require('@netlify/blobs');
const core = require('./core');
exports.handler = async (event) => {
  connectLambda(event);
  const type = (event.queryStringParameters || {}).type;
  try {
    if (type === 'avis') await core.snapAvis();
    else if (type === 'rank') await core.snapRank();
    else return { statusCode: 400, body: JSON.stringify({ error: 'type avis|rank requis' }) };
    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: String(e) }) };
  }
};
