import { createClient } from "redis";
import env from "../configs/env.js";
import Time from "../utils/time.js";

const client = createClient({
  url: `redis://default:${env.redis.password}@${env.redis.host}:${env.redis.port}`,
});

const setCacheExpire = async (
  key: string,
  value: any,
  ttl = Time.ONE_DAY * 3
) => {
  try {
    await client.set(key, JSON.stringify(value), {
      EX: ttl,
    });
    return {
      message: "Cache successfully",
      success: true,
    };
  } catch (err) {
    return {
      message: "Cache failed",
      success: false,
    };
  }
};

const getCacheExpire = async (key: string) => {
  return await client.get(key);
};

const deleteCacheExpire = async (key: string) => {
  return await client.del(key);
};

client.on("connect", () => {
  console.log(
    `REDIS IS CONNECTING ON ${env.redis.host} AT PORT ${env.redis.port}!`
  );
});

client.on("error", (err) => {
  console.log(`Error: ${err?.message}`);
});

export { getCacheExpire, setCacheExpire, deleteCacheExpire, client };
