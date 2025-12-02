/**
 * Next.js Core.
 */
import { kv } from "@vercel/kv";

const RUNTIME_ENV = "RUNTIME";
/**
 * Represents a key-value store (KV) and provides methods for retrieving and manipulating data.
 */
class Kv {
  private kv: typeof kv = kv;
  private static instance: Kv;
  /**
   * Returns the singleton instance of the Kv class.
   *
   * @returns {Kv} The singleton instance of the Kv class.
   */
  public static GetInstance(): Kv {
    if (!Kv.instance) {
      Kv.instance = new Kv();
    }

    return Kv.instance;
  }
  /**
   * Retrieves the value associated with the specified key and field from the key-value store (KV).
   * If the value does not exist, it calls the fetcherMethod to fetch the data and stores it in the KV.
   *
   * @param key - The key to retrieve the value from.
   * @param field - The field to retrieve the value from.
   * @param fetcherMethod - The method that fetches the data if it does not exist in the KV.
   *
   * @returns The value associated with the specified key and field.
   *
   * @throws Error if the field is not found in the retrieved data.
   */
  async HGetOrSet(
    key: string,
    field: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fetcherMethod: () => Promise<any>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    const keyWithEnvironment = `${RUNTIME_ENV}:${key}`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: { [key: string]: any } | null = await this.kv.hget(
      keyWithEnvironment,
      field
    );

    if (data == null) {
      data = await fetcherMethod();

      await this.kv.hset(keyWithEnvironment, {
        [field]: data,
      });
    }

    if (data == null || !data[field]) {
      throw new Error("Field not found.");
    }

    return data[field];
  }
  /**
   * Deletes a field from a hash stored at the specified key.
   *
   * @param key - The key of the hash.
   * @param field - The field to be deleted.
   *
   * @returns A promise that resolves when the field is successfully deleted.
   */
  async HDel(key: string, field: string) {
    await this.kv.hdel(`${RUNTIME_ENV}:${key}`, field);
  }

  /**
   * Retrieves all hash data where keys begin with the specified prefix.
   *
   * @param prefix - The prefix to search for (e.g., "push_")
   * @returns A promise that resolves to an object with key-hash pairs
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async GetRecordsByPrefix(prefix: string): Promise<{ [key: string]: any }> {
    const keys = await this.GetKeysByPrefix(prefix);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const records: { [key: string]: any } = {};

    // Use pipeline for better performance when getting multiple keys
    if (keys.length > 0) {
      const pipeline = this.kv.pipeline();
      keys.forEach((key) => {
        pipeline.hgetall(key);
      });

      const values = await pipeline.exec();

      keys.forEach((key, index) => {
        // Remove the environment prefix for cleaner key names
        const cleanKey = key.replace(`${RUNTIME_ENV}:`, "");
        records[cleanKey] = values[index];
      });
    }

    return records;
  }

  /**
   * Retrieves all keys that begin with the specified prefix.
   *
   * @param prefix - The prefix to search for (e.g., "push_")
   * @returns A promise that resolves to an array of matching keys
   */
  async GetKeysByPrefix(prefix: string): Promise<string[]> {
    const keyPattern = `${RUNTIME_ENV}:${prefix}*`;
    return await this.kv.keys(keyPattern);
  }
}

export default Kv;
