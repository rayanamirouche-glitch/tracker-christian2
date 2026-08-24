const core = require('./core');
exports.handler = async () => ({
  statusCode: 200,
  headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
  body: JSON.stringify(await core.allData())
});
