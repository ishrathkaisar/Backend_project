import redis from "../config/redis.js";

export async function getCached(key) {
    const raw = await redis.get(key);
    return raw ? JSON.parse(raw) : null;
}
export async function setCache(key, value, ttl = 60) {
    await redis.set(key, JSON.stringify(value), "EX", ttl);
}