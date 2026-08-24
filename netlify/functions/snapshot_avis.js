const core = require('./core');
exports.handler = async () => { await core.snapAvis(); return { statusCode: 200 }; };
