const parsePositiveInt = (name, fallback) => {
    const value = Number.parseInt(process.env[name] ?? "", 10);
    return Number.isFinite(value) && value > 0 ? value : fallback;
};

const rateLimitConfig = {
    auth: {
        windowMs: parsePositiveInt("RATE_LIMIT_AUTH_WINDOW_MS", 15 * 60 * 1000),
        maxPerIp: parsePositiveInt("RATE_LIMIT_AUTH_MAX_PER_IP", 20),
        maxPerAccount: parsePositiveInt("RATE_LIMIT_AUTH_MAX_PER_ACCOUNT", 8),
        backoffBaseMs: parsePositiveInt("RATE_LIMIT_AUTH_BACKOFF_BASE_MS", 1000),
        backoffMaxMs: parsePositiveInt("RATE_LIMIT_AUTH_BACKOFF_MAX_MS", 60 * 1000),
    },
    public: {
        windowMs: parsePositiveInt("RATE_LIMIT_PUBLIC_WINDOW_MS", 60 * 1000),
        max: parsePositiveInt("RATE_LIMIT_PUBLIC_MAX", 120),
    },
    authenticated: {
        windowMs: parsePositiveInt("RATE_LIMIT_AUTHENTICATED_WINDOW_MS", 60 * 1000),
        max: parsePositiveInt("RATE_LIMIT_AUTHENTICATED_MAX", 300),
    },
};

const buckets = new Map();

const getClientIp = (req) => req.ip || req.socket?.remoteAddress || "unknown";

const getAccountKey = (req) => {
    const account = req.user?._id || req.body?.email;
    return account ? String(account).trim().toLowerCase() : null;
};

const getBucket = (key, windowMs) => {
    const now = Date.now();
    let bucket = buckets.get(key);

    if (!bucket || bucket.expiresAt <= now) {
        bucket = { count: 0, expiresAt: now + windowMs };
        buckets.set(key, bucket);
    }

    bucket.count += 1;
    return bucket;
};

const backoffMs = (overage, config) => Math.min(
    config.backoffMaxMs,
    config.backoffBaseMs * (2 ** Math.max(0, overage - 1)),
);

const reject = (res, retryAfterMs) => {
    const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
    res.set("Retry-After", String(retryAfterSeconds));
    return res.status(429).json({
        success: false,
        message: "Too many requests. Please try again later.",
    });
};

const createLimiter = ({ config, accountAware = false, exponentialBackoff = false }) => (req, res, next) => {
    const ipBucket = getBucket(`ip:${getClientIp(req)}`, config.windowMs);
    const accountKey = accountAware ? getAccountKey(req) : null;
    const accountBucket = accountKey
        ? getBucket(`account:${accountKey}`, config.windowMs)
        : null;

    const ipOverage = Math.max(0, ipBucket.count - (config.maxPerIp ?? config.max));
    const accountOverage = accountBucket
        ? Math.max(0, accountBucket.count - config.maxPerAccount)
        : 0;
    const overage = Math.max(ipOverage, accountOverage);

    if (overage > 0) {
        const retryAfterMs = exponentialBackoff
            ? backoffMs(overage, config)
            : config.windowMs;
        return reject(res, retryAfterMs);
    }

    res.on("finish", () => {
        if (accountBucket && res.statusCode >= 200 && res.statusCode < 300) {
            buckets.delete(`account:${accountKey}`);
        }
    });

    return next();
};

export const authRateLimit = createLimiter({
    config: rateLimitConfig.auth,
    accountAware: true,
    exponentialBackoff: true,
});

export const publicRateLimit = createLimiter({ config: rateLimitConfig.public });
export const authenticatedRateLimit = createLimiter({ config: rateLimitConfig.authenticated });