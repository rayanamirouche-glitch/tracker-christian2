const core = require('./core');
exports.handler = async () => { await core.snapRank(); return { statusCode: 200 }; };
