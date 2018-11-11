
interface IBucket {
  tokens: number;
  lastHydrateTimeMs: number;
}
interface ITokenBucketContainer {
  [key: string]: IBucket;
}

export class TokenBucket {
  private bucketContainer: ITokenBucketContainer;

  constructor(
    private bucketCapacity: number,
  ) {
    this.bucketContainer = {};
  }

  public getTokens(key: string) {
    return this.bucketContainer[key].tokens;
  }

  public getLastHydrateTimeMs(key: string) {
    return this.bucketContainer[key].lastHydrateTimeMs;
  }

  public keyExists(key: string) {
    return this.bucketContainer[key] != null;
  }

  public createBucket(key: string, bucket: IBucket) {
    this.bucketContainer[key] = bucket;
  }

  public drip(key: string, additionalTokens: number, hydrateTimeMs: number) {
    this.bucketContainer[key] = {
      lastHydrateTimeMs: hydrateTimeMs,
      tokens: Math.min(
        this.getTokens(key) + additionalTokens,
        this.bucketCapacity),
    };
  }

  public take(key: string, tokens: number) {
    if (tokens < 0) {
      throw new TypeError('tokens to take must be a positive number');
    }

    if (this.getTokens(key) >= tokens) {
      this.bucketContainer[key] = {
        ...this.bucketContainer[key],
        tokens: this.getTokens(key) - tokens,
      };
      return true;
    }

    return false;
  }
}
