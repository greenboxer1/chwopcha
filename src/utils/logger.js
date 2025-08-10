const getTimestamp = () => new Date().toISOString();

const logger = {
    info: (message) => console.log(`[${getTimestamp()}] [INFO] ${message}`),
    warn: (message) => console.warn(`[${getTimestamp()}] [WARN] ${message}`),
    error: (message, error) => console.error(`[${getTimestamp()}] [ERROR] ${message}`, error || ''),
    debug: (message) => console.debug(`[${getTimestamp()}] [DEBUG] ${message}`),
};

module.exports = logger;
