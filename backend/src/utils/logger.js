function log(level, message, meta = {}) {
  const line = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}`;
  if (level === 'error') console.error(line, meta);
  else console.log(line, Object.keys(meta).length ? meta : '');
}
module.exports = { log, info: (m, x) => log('info', m, x), warn: (m, x) => log('warn', m, x), error: (m, x) => log('error', m, x) };
